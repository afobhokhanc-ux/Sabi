# Sabi on Supabase: setup plan

Supabase gives Sabi three things in one place: sign-in, a Postgres database, and file storage for provider photos. This plan takes the demo from "everything disappears when the tab closes" to real accounts and real listings.

`schema.sql` and `seed_services.sql` in this folder do the database part. I ran them on a local Postgres 16 with test accounts and checked the rules: who can see and change what, booking prices and status changes, and reviews. The distance search needs PostGIS, which I could not run here, so test that first. The app code in step 5 has not been run against a real project either, so test it as you go.

## 1. What the demo becomes

| In the demo | In Supabase |
|---|---|
| Create account, sign in | Supabase Auth. A row in `profiles` is created automatically, with the role (customer or provider) and name sent at sign-up |
| Services and their questions | `service_groups` and `services` (loaded from `seed_services.sql`). The tailored questions stay in `js/questions.js` for now |
| Provider setup answers | One row in `providers` (the business, phone, hours, answers as JSON) plus `provider_prices` and `provider_photos` |
| Photos | Storage bucket `provider-photos`, one folder per provider |
| Distance and "use my location" | `providers.location` with PostGIS, searched by `nearby_providers(lat, lng, service, radius)` |
| Booking, requests | `bookings`, with status requested, accepted, declined, cancelled, completed |
| Reviews | `reviews`, allowed only after the provider marks the booking completed. `provider_stats` gives the average and count |
| Saved | `saved_providers` |

## 2. Create the project

1. Sign up at supabase.com and create a new project.
2. Pick a region as close to Lagos as the list allows. Look for an Africa region first, then Europe.
3. Set a strong database password and keep it in a password manager. You will rarely need it.
4. Check the current free-plan limits on the Supabase pricing page, including what happens to projects that go unused for a while.

## 3. Create the tables

1. Open **SQL Editor** and create a new query.
2. Paste all of `schema.sql` and run it. It enables PostGIS, creates the tables, the rules and the photo bucket.
3. New query. Paste all of `seed_services.sql` and run it. Check **Table Editor** shows 13 rows in `service_groups` and 169 in `services`.

If the first run stops with an error, fix it and run again from a clean state: Supabase lets you delete the tables in Table Editor, or create a fresh project while you are still testing.

## 4. Set up sign-in

In **Authentication**:

- **Providers**: keep Email on. Phone sign-in by SMS is possible later, but it costs money for every text and needs an SMS provider. Start with email.
- **Email confirmation**: keep it on, so nobody can sign up with someone else's email.
- **URL configuration**: set the Site URL to the address where the app is hosted. Add `http://localhost:5500` (or the port you use) while testing.
- The built-in email sender is limited and meant for testing. Before launch, connect your own email sender under the SMTP settings.

## 5. Connect the app

In **Project Settings, API**, copy the **Project URL** and the **publishable (anon) key**. These two are safe to put in the app because every table is protected by the rules in `schema.sql`.

Never put the **secret or service_role key** in the app, the zip, or anything you share. It skips all the rules.

Add the client library before `js/app.js` in `index.html` (pin an exact version):

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/dist/umd/supabase.min.js"></script>
```

Then, in a new `js/api.js`:

```js
const sb = supabase.createClient('https://YOUR-PROJECT.supabase.co', 'YOUR-PUBLISHABLE-KEY');

// Create account. The role and name become the profile row automatically.
const { data, error } = await sb.auth.signUp({
  email, password,
  options: { data: { role: 'provider', full_name: name } }
});

// Sign in
await sb.auth.signInWithPassword({ email, password });

// Nearby providers, nearest first
const { data: nearby } = await sb.rpc('nearby_providers', {
  user_lat: 6.5244, user_lng: 3.3792, wanted_service: 'barber', radius_km: 5
});

// Publish a listing. The location is longitude then latitude.
await sb.from('providers').insert({
  owner_id: user.id, service_id: 'tailor', business_name: 'Tope Stitches',
  area: 'Allen Avenue, Ikeja', location: 'SRID=4326;POINT(3.3515 6.6018)',
  years_experience: 3, phone: '2348031234567', speed_minutes: 2880, speed_text: '2 days',
  answers: { 'tailor-do': ['Native and traditional wear'] }, is_published: true
}).select().single();

// Book. The price is filled in from the provider's price list, not from the app.
await sb.from('bookings').insert({
  customer_id: user.id, provider_id, item_name: 'Shirt', price_ngn: 0,
  scheduled_for: new Date(Date.now() + 864e5).toISOString(), note: 'Wedding fitting'
});

// Provider accepts, then later completes
await sb.from('bookings').update({ status: 'accepted' }).eq('id', bookingId);

// Review (only works once the booking is completed)
await sb.from('reviews').insert({ booking_id, provider_id, customer_id: user.id, rating: 4, body: 'Neat stitching.' });

// Photo: the first folder must be the user's own id
await sb.storage.from('provider-photos').upload(`${user.id}/${crypto.randomUUID()}.jpg`, file, { contentType: 'image/jpeg' });
```

The phone number is saved in the format `2348031234567`, which is what `normPhone()` in `app.js` already produces.

## 6. Build order

1. **Accounts.** Replace the demo sign-in with Supabase Auth. Keep the role choice screen. Sign out, then sign in again on another device to confirm it persists.
2. **Listings.** Save the provider setup to `providers`, `provider_prices` and `provider_photos`. Replace the generated sample providers with a query, but keep them for a "demo mode" if you want one.
3. **Search and location.** Call `nearby_providers` with the phone's location. Keep the area picker as the fallback when location is refused.
4. **Bookings and requests.** Move bookings and the provider Requests tab to the `bookings` table. Let the provider mark jobs completed.
5. **Reviews and saved.** Turn on reviews after completion. Read ratings from `provider_stats`.
6. **Hosting.** Put the folder on a static host with HTTPS and set that address as the Site URL in step 4.

## 7. Before real users

- **Listings go live without approval.** In this schema a provider can set `is_published` themselves. Add an `is_approved` column that only you can change, and require both before a listing shows. Otherwise anyone can publish anything.
- **Phone numbers are public** on published listings, by design, so customers can call. Say this clearly in the setup screen, and have a privacy policy.
- **Personal data.** You will hold names, emails, phone numbers and locations. Collect only what you need, and read up on the Nigeria Data Protection Act 2023. This is not legal advice.
- **Reviews** can only come from completed bookings, which limits fakes but does not stop a provider from booking themselves with a second account. Watch for it.
- **Backups.** Check what backups your plan includes before you hold real customer data.
- **Payments** are not in this plan. If you add them later, look at Paystack or Flutterwave. Keep them separate from bookings at first.

## 8. Features added after the first plan

**Verified badge.** The demo shows the badge when a provider has a confirmed phone and an ID or shop photo. For real: confirm phone numbers with Supabase phone sign-in or an OTP service (costs per SMS), store ID photos in a private bucket that only you can read, and add `phone_verified` and `id_checked` columns that only an admin can set. Never show the ID photo to customers. Vouches become a `vouches` table with one row per completed booking.

**Provider alerts.** Today the customer can send booking details to the provider on WhatsApp through a `https://wa.me/<number>?text=...` link, which needs no setup. Automatic alerts need the WhatsApp Business Platform (Cloud API): a Meta business account, a verified number, and message templates approved by Meta. Call it from a Supabase Edge Function that runs when a row is added to `bookings`. Keep the access token in Edge Function secrets, never in the app. Plan an SMS fallback, and check current pricing before you commit.

**Share page and QR.** `https://sabi.example/p/<slug>` is only an example. Once hosted, add a `slug` column to `providers` and a page that loads one provider by slug.

**Quotes.** Add `quote_requests` (customer, service, description, photo path, day, budget) and `quotes` (request, provider, price, message). A customer may read quotes on their own requests, and a provider may insert one quote per request. Accepting a quote creates a `bookings` row.

**Free now.** Add `free_until timestamptz` on `providers`, set when the provider switches on "I'm free now" and cleared after a few hours, so a forgotten switch does not mislead customers.

**Order tracking.** Add `stage int` and `shared_measurements jsonb` to `bookings`. Only the provider may change the stage. Measurements are personal data: store them on the customer profile and copy them to a booking only when the customer ticks the box.

**Map.** The demo uses Leaflet with OpenStreetMap tiles. OpenStreetMap's tile server is for light use only (see its tile usage policy). Before real traffic, use a paid tile provider such as MapTiler or Mapbox, or host your own tiles. The sample providers' pins are generated around the chosen area; real pins come from `providers.location`, which the setup screen already collects.

## 9. What is connected so far

`js/api.js` handles sign up, sign in, sign out and keeping people signed in, using Supabase Auth and the `profiles` table. The role (customer or provider) is saved when the account is created and cannot be changed afterwards, so one email is one role. See `DEPLOY.md` for putting it online.
