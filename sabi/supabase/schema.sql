-- Sabi database schema for Supabase (Postgres).
-- Run this whole file once in the Supabase SQL Editor, then run seed_services.sql.
--
-- What it sets up:
--   accounts (profiles), the service catalogue, provider listings with prices and photos,
--   bookings, reviews and saved providers, plus a "nearby providers" search by real distance.
-- Row Level Security is switched on for every table. The rules below decide who can read
-- and change each row, so the public key in the app cannot be used to read or edit anyone's data.

-- ---------------------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------------------
create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------------------
-- Service catalogue (the same data as js/data.js, loaded by seed_services.sql)
-- ---------------------------------------------------------------------------------------
create table public.service_groups (
  id    text primary key,
  name  text not null,
  sort  int  not null
);

create table public.services (
  id            text primary key,
  group_id      text not null references public.service_groups (id),
  other_groups  text[] not null default '{}',
  name          text not null,
  speed_kind    text not null,
  speed_label   text not null,
  is_24h        boolean not null default false,
  items         jsonb not null,          -- [{"name": "Haircut", "price": 2000}, ...] suggested prices
  score_labels  text[] not null,         -- what customers score, such as "Cut quality"
  note          text not null default ''
);

-- ---------------------------------------------------------------------------------------
-- Accounts. Sign-in itself is handled by Supabase Auth (auth.users). A profile row is
-- created automatically for every new user, using the role and name sent at sign-up.
-- ---------------------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null check (role in ('customer', 'provider')),
  full_name   text not null check (char_length(full_name) between 2 and 80),
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  wanted_role text := new.raw_user_meta_data ->> 'role';
  wanted_name text := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    case when wanted_role = 'provider' then 'provider' else 'customer' end,
    left(coalesce(wanted_name, 'New user'), 80)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------------------
-- Provider listings. One listing per provider account.
-- ---------------------------------------------------------------------------------------
create table public.providers (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null unique references public.profiles (id) on delete cascade,
  service_id        text not null references public.services (id),
  business_name     text not null check (char_length(business_name) between 2 and 40),
  area              text not null check (char_length(area) between 2 and 80),
  location          extensions.geography(Point, 4326) not null,   -- longitude, latitude
  years_experience  int  not null check (years_experience between 0 and 60),
  is_24h            boolean not null default false,
  opens_at          time not null default '08:00',
  closes_at         time not null default '18:00',
  phone             text not null check (phone ~ '^234[789][01][0-9]{8}$'),   -- 2348031234567
  speed_minutes     int  not null check (speed_minutes > 0),                  -- used for "Fastest" sorting
  speed_text        text not null,                                            -- shown, such as "2 days"
  answers           jsonb not null default '{}',     -- answers to the questions for this service, by question id
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index providers_location_idx on public.providers using gist (location);
create index providers_service_idx  on public.providers (service_id) where is_published;

create trigger providers_updated_at
  before update on public.providers
  for each row execute function public.set_updated_at();

create table public.provider_prices (
  id           bigint generated always as identity primary key,
  provider_id  uuid not null references public.providers (id) on delete cascade,
  item_name    text not null check (char_length(item_name) between 1 and 80),
  price_ngn    int  not null check (price_ngn between 50 and 10000000),
  sort         int  not null default 0,
  unique (provider_id, item_name)
);

create table public.provider_photos (
  id            bigint generated always as identity primary key,
  provider_id   uuid not null references public.providers (id) on delete cascade,
  storage_path  text not null,                                   -- "<user id>/<file name>" in the provider-photos bucket
  sort          smallint not null check (sort between 0 and 3),  -- at most 4 photos
  unique (provider_id, sort)
);

-- ---------------------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------------------
create table public.bookings (
  id             uuid primary key default gen_random_uuid(),
  ref            text not null unique default ('SB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
  customer_id    uuid not null references public.profiles (id) on delete cascade,
  provider_id    uuid not null references public.providers (id) on delete cascade,
  item_name      text not null,
  price_ngn      int  not null,
  scheduled_for  timestamptz not null,
  note           text check (char_length(note) <= 120),
  status         text not null default 'requested'
                 check (status in ('requested', 'accepted', 'declined', 'cancelled', 'completed')),
  created_at     timestamptz not null default now()
);

create index bookings_customer_idx on public.bookings (customer_id, created_at desc);
create index bookings_provider_idx on public.bookings (provider_id, created_at desc);

-- The price always comes from the provider's own price list, never from the customer's request.
create or replace function public.bookings_set_price()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  listed int;
begin
  select pp.price_ngn into listed
  from public.provider_prices pp
  where pp.provider_id = new.provider_id and pp.item_name = new.item_name;

  if listed is null then
    raise exception 'That item is not on this provider''s price list';
  end if;
  new.price_ngn := listed;
  new.status := 'requested';
  return new;
end;
$$;

create trigger bookings_before_insert
  before insert on public.bookings
  for each row execute function public.bookings_set_price();

-- After a booking exists, only its status can change, and only in these ways:
--   customer: requested or accepted -> cancelled
--   provider: requested -> accepted or declined, accepted -> completed
-- Changes made with no signed-in user (the SQL Editor or a server key) are not restricted.
create or replace function public.bookings_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  is_customer boolean;
  is_owner boolean;
begin
  if me is null then
    return new;
  end if;

  if new.ref <> old.ref
     or new.customer_id <> old.customer_id
     or new.provider_id <> old.provider_id
     or new.item_name <> old.item_name
     or new.price_ngn <> old.price_ngn
     or new.scheduled_for <> old.scheduled_for
     or new.note is distinct from old.note
     or new.created_at <> old.created_at then
    raise exception 'Only the status of a booking can be changed';
  end if;

  if new.status = old.status then
    return new;
  end if;

  is_customer := old.customer_id = me;
  is_owner := exists (select 1 from public.providers p where p.id = old.provider_id and p.owner_id = me);

  if is_customer and new.status = 'cancelled' and old.status in ('requested', 'accepted') then
    return new;
  end if;
  if is_owner and ((old.status = 'requested' and new.status in ('accepted', 'declined'))
                or (old.status = 'accepted' and new.status = 'completed')) then
    return new;
  end if;

  raise exception 'That status change is not allowed';
end;
$$;

create trigger bookings_before_update
  before update on public.bookings
  for each row execute function public.bookings_guard();

-- ---------------------------------------------------------------------------------------
-- Reviews. A customer can review a provider once, after the provider marks the booking completed.
-- ---------------------------------------------------------------------------------------
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid not null unique references public.bookings (id) on delete cascade,
  provider_id    uuid not null references public.providers (id) on delete cascade,
  customer_id    uuid not null references public.profiles (id) on delete cascade,
  reviewer_name  text not null,
  rating         smallint not null check (rating between 1 and 5),
  body           text not null default '' check (char_length(body) <= 200),
  created_at     timestamptz not null default now()
);

create index reviews_provider_idx on public.reviews (provider_id, created_at desc);

-- Shows "Chidi O." instead of the full name, so profiles never have to be public.
create or replace function public.reviews_set_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parts text[];
begin
  select regexp_split_to_array(btrim(p.full_name), '\s+') into parts
  from public.profiles p where p.id = new.customer_id;

  new.reviewer_name :=
    parts[1] || case when array_length(parts, 1) > 1
                     then ' ' || upper(left(parts[array_length(parts, 1)], 1)) || '.'
                     else '' end;
  return new;
end;
$$;

create trigger reviews_before_insert
  before insert on public.reviews
  for each row execute function public.reviews_set_name();

create view public.provider_stats
with (security_invoker = true) as
select provider_id,
       count(*)::int                  as review_count,
       round(avg(rating)::numeric, 1) as avg_rating
from public.reviews
group by provider_id;

-- ---------------------------------------------------------------------------------------
-- Saved providers
-- ---------------------------------------------------------------------------------------
create table public.saved_providers (
  customer_id  uuid not null references public.profiles (id) on delete cascade,
  provider_id  uuid not null references public.providers (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (customer_id, provider_id)
);

-- ---------------------------------------------------------------------------------------
-- Search by real distance. Call it from the app with the customer's latitude and longitude.
--   select * from nearby_providers(6.6018, 3.3515, 'barber', 5);
-- Only published listings are returned, nearest first.
-- ---------------------------------------------------------------------------------------
create or replace function public.nearby_providers(
  user_lat        double precision,
  user_lng        double precision,
  wanted_service  text,
  radius_km       double precision default 5
)
returns table (
  id               uuid,
  business_name    text,
  area             text,
  distance_km      numeric,
  is_open          boolean,
  min_price_ngn    int,
  avg_rating       numeric,
  review_count     int,
  speed_minutes    int,
  speed_text       text,
  years_experience int,
  phone            text
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select p.id,
         p.business_name,
         p.area,
         round((st_distance(p.location, st_point(user_lng, user_lat)::geography) / 1000)::numeric, 1),
         (p.is_24h or (now() at time zone 'Africa/Lagos')::time between p.opens_at and p.closes_at),
         (select min(pp.price_ngn) from public.provider_prices pp where pp.provider_id = p.id),
         coalesce(s.avg_rating, 0),
         coalesce(s.review_count, 0),
         p.speed_minutes,
         p.speed_text,
         p.years_experience,
         p.phone
  from public.providers p
  left join public.provider_stats s on s.provider_id = p.id
  where p.is_published
    and p.service_id = wanted_service
    and st_dwithin(p.location, st_point(user_lng, user_lat)::geography, radius_km * 1000)
  order by st_distance(p.location, st_point(user_lng, user_lat)::geography);
$$;

-- ---------------------------------------------------------------------------------------
-- Photo storage. Photos go in the provider-photos bucket, in a folder named after the user's id.
-- ---------------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('provider-photos', 'provider-photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Anyone can view provider photos"
  on storage.objects for select
  using (bucket_id = 'provider-photos');

create policy "Providers can upload to their own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'provider-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Providers can replace files in their own folder"
  on storage.objects for update to authenticated
  using (bucket_id = 'provider-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Providers can delete files in their own folder"
  on storage.objects for delete to authenticated
  using (bucket_id = 'provider-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------------------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------------------
alter table public.service_groups   enable row level security;
alter table public.services         enable row level security;
alter table public.profiles         enable row level security;
alter table public.providers        enable row level security;
alter table public.provider_prices  enable row level security;
alter table public.provider_photos  enable row level security;
alter table public.bookings         enable row level security;
alter table public.reviews          enable row level security;
alter table public.saved_providers  enable row level security;

-- Catalogue: everyone can read, nobody can change it from the app.
create policy "Anyone can read groups"   on public.service_groups for select using (true);
create policy "Anyone can read services" on public.services       for select using (true);

-- Profiles: you can read your own. You can change your name but not your role.
create policy "Read own profile"   on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "Update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Listings: published ones are public. Providers manage their own.
create policy "Read published or own listing" on public.providers for select
  using (is_published or owner_id = (select auth.uid()));
create policy "Providers create their listing" on public.providers for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.profiles pr where pr.id = (select auth.uid()) and pr.role = 'provider')
  );
create policy "Providers edit their listing" on public.providers for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Providers delete their listing" on public.providers for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Prices and photos follow the listing they belong to.
create policy "Read prices of visible listings" on public.provider_prices for select
  using (exists (select 1 from public.providers p
                 where p.id = provider_id and (p.is_published or p.owner_id = (select auth.uid()))));
create policy "Providers manage their prices" on public.provider_prices for all to authenticated
  using (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = (select auth.uid())));

create policy "Read photos of visible listings" on public.provider_photos for select
  using (exists (select 1 from public.providers p
                 where p.id = provider_id and (p.is_published or p.owner_id = (select auth.uid()))));
create policy "Providers manage their photos" on public.provider_photos for all to authenticated
  using (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = (select auth.uid())));

-- Bookings: the customer and the provider can see them. Customers create them for published
-- listings. Changes are limited by the bookings_guard trigger above.
create policy "Customer or provider reads booking" on public.bookings for select to authenticated
  using (customer_id = (select auth.uid())
         or exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = (select auth.uid())));
create policy "Customers create bookings" on public.bookings for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and scheduled_for > now()
    and exists (select 1 from public.providers p
                where p.id = provider_id and p.is_published and p.owner_id <> (select auth.uid()))
  );
create policy "Customer updates own booking" on public.bookings for update to authenticated
  using (customer_id = (select auth.uid()));
create policy "Provider updates booking on their listing" on public.bookings for update to authenticated
  using (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = (select auth.uid())));

-- Reviews: public to read. A customer can add one for their own completed booking.
create policy "Anyone can read reviews" on public.reviews for select using (true);
create policy "Customers review completed bookings" on public.reviews for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and exists (select 1 from public.bookings b
                where b.id = booking_id
                  and b.customer_id = (select auth.uid())
                  and b.provider_id = reviews.provider_id
                  and b.status = 'completed')
  );

-- Saved providers: private to the customer.
create policy "Customers manage saved providers" on public.saved_providers for all to authenticated
  using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------
-- Permissions. RLS above decides which rows; these grants decide which tables and columns
-- the app's keys can touch at all.
-- ---------------------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.service_groups, public.services, public.providers,
                public.provider_prices, public.provider_photos, public.reviews,
                public.provider_stats to anon, authenticated;

grant select on public.profiles, public.bookings, public.saved_providers to authenticated;
grant update (full_name) on public.profiles to authenticated;

grant insert, update, delete on public.providers, public.provider_prices, public.provider_photos to authenticated;
grant insert, update on public.bookings to authenticated;
grant insert on public.reviews to authenticated;
grant insert, delete on public.saved_providers to authenticated;

grant usage on sequence public.provider_prices_id_seq, public.provider_photos_id_seq to authenticated;
grant execute on function public.nearby_providers(double precision, double precision, text, double precision)
  to anon, authenticated;
