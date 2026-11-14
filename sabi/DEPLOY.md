# Going live: Supabase and Vercel

Right now Sabi has real accounts (sign up, confirm email, sign in, stay signed in). Listings, bookings and reviews are still kept in the browser tab only. They are the next stage. Until then, anything a provider publishes disappears on reload.

Menu names on the Supabase and Vercel websites change now and then, so if a name below does not match, look for the closest one.

## 1. Supabase project

Follow `supabase/SETUP.md` steps 2 to 4: create the project, run `schema.sql`, run `seed_services.sql`, and check the sign-in settings. Then copy two values from **Project Settings, API**:

- **Project URL**
- **Publishable (anon) key**

Never use the **secret / service_role** key anywhere in this folder. It skips every rule in the database.

## 2. Put the two values in `js/config.js`

```js
window.SABI_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR-PUBLISHABLE-KEY'
};
```

The anon key is meant to be public. The rules in `schema.sql` are what protect your data. If both values are empty, Sabi runs as the demo.

## 3. Try it on your computer first

Open a terminal in this folder and run `python3 -m http.server 5500`, then open `http://localhost:5500`. In Supabase, under **Authentication, URL configuration**, add `http://localhost:5500` to the redirect URLs while you test.

Create a customer account. Supabase emails you a link. Open it, come back, and sign in. Reload the page: you should stay signed in.

## 4. Deploy to Vercel

1. Put this folder in a GitHub repository (the `sabi` folder is the repository root, with `index.html` at the top).
2. On vercel.com choose **Add New, Project**, import the repository.
3. Framework preset: **Other**. Leave the build command empty. Leave the output directory empty (the root). Deploy.
4. Vercel gives you an address such as `sabi-xxxx.vercel.app`. Every push to GitHub redeploys.

You can also use the command line: `npm i -g vercel`, then run `vercel` in this folder.

`vercel.json` adds security headers. The main one is a content policy that lets the page load only its own files, the map script from jsDelivr, the map pictures from OpenStreetMap, fonts from Google, and your Supabase project. If you later add another service, such as a paid map provider or Paystack, add its address to that policy or the browser will block it.

Check the current Vercel plan terms before you rely on it: the free Hobby plan is meant for personal, non-commercial use.

## 5. Tell Supabase the live address

In **Authentication, URL configuration**:

- **Site URL**: your Vercel address (or your own domain later).
- **Redirect URLs**: add the same address, and keep `http://localhost:5500` for testing.

Without this, the confirmation email sends people to the wrong place.

## 6. Test checklist on the live site

- Create a customer account, confirm the email, sign in, reload, still signed in.
- Sign out, sign in with a wrong password: you see "That email and password do not match."
- Create a provider account with a different email: you go to setup.
- Try the provider email on the "I need a service" side: you are told to use the other option.
- Open the site on your phone. Use my location needs the https address to work.

## 7. Before real users

- **Email limits.** Supabase's built-in email sender allows only a few emails an hour. Connect your own sender under **Authentication, SMTP** before you invite people.
- **Password reset.** There is no "forgot password" screen yet. It is a small addition and should go in before launch.
- **Next stage.** Listings, photos, bookings and reviews moving into the database, so providers and customers see each other's real data.
