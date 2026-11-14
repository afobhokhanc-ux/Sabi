# Sabi

Find trusted local help close to you. Search any service, from barbers and tailors to mechanics, lawyers and electricians, compare rating, price, distance and how soon they can help, then book.

This is a demo. The providers, prices and reviews are made up, and the location is a fixed sample (Ikeja, Lagos).

## Run it

Open `index.html` in a browser. No install or build step. On a computer it shows inside a phone frame. On a phone it fills the screen.

## How it feels like an app

- An opening animation plays at launch. Tap it to skip. It is shortened for people who turn off motion in their settings.
- After the animation you choose how to use Sabi: **I need a service** (customer) or **I offer a service** (provider), then create an account or sign in.
- Customers get Explore, Bookings, Saved and Profile tabs. Providers get Dashboard, Requests and Profile tabs.
- Screens slide in and out as you go forward and back, and the back button returns you to where you were.
- Detail pages have a fixed Book bar at the bottom, like a shopping or delivery app.
- Bookings and saved providers show up in their own tabs, with a count on the tab icon.

## More conveniences

- **Location.** Tap the location line on Home to use your device's location or pick an area. Providers are still placed around a sample point, so distances do not change yet.
- **Call and WhatsApp.** Every provider page has Call and WhatsApp buttons. For providers who sign up, they show the number they entered, with links to call, message and copy it. Sample providers have no real number.
- **Reviews.** In Bookings, mark a booking done (the real app would have the provider do this), then leave a star rating and a comment. The provider's rating updates.
- **Photos.** Providers can add up to 4 photos of their work during setup. They show on their listing page.
- **Bookings reach the provider.** Booking a provider who signed up in the same tab adds the booking to their Requests tab.

## Provider setup

A provider answers five short steps: the service they offer, their business, questions about their work, prices, then a review. The questions in step 3 depend on the service, so a barber is asked about styles and a lawyer about areas of law. When they publish, the listing shows up for customers with a New badge and the answers appear on its detail page. Providers also get a Requests tab with sample requests to accept or decline.

Accounts, listings and bookings are kept in memory only, so they are gone when the tab closes. Passwords are never checked or stored. Nothing is sent anywhere.

## Install it on a phone

Put the folder on any static host that uses HTTPS (GitHub Pages and Netlify both work). Open the address in Chrome on Android and choose Add to Home screen. It opens full screen with the Sabi icon, without the browser bar. This uses `manifest.webmanifest` and `icon.svg`. The install step does not work when you open the file straight from a folder.

## Files

- `index.html`  the app shell: screens, tab bar, booking sheet and opening animation
- `css/styles.css`  all styling. Colours, fonts and light and dark themes are tokens at the top
- `js/data.js`  the 13 service groups, the services, and the sample providers
- `supabase/`  the database plan: `SETUP.md` (step by step), `schema.sql` (tables and security rules), `seed_services.sql` (the 169 services)
- `js/questions.js`  the provider questions: a few for each service, plus a few for each group. Edit `QS` and `QG` to change them
- `js/app.js`  the app logic: sign-in, provider setup, navigation, search, sorting, filters, distance scale, booking
- `manifest.webmanifest` and `icon.svg`  the app name and icon used when installed

## Adding a service

Open `js/data.js` and add a line under the right group in `SERVICE_TEXT`:

    Name | usual first price | speed kind | items

Items are separated by `;`. Write an item as `Name:price` to give it its own price. The speed kind is one of `wait`, `arrive`, `ready`, `slot`, `reply`, `start`, `deliver` or `supply`. Add `|24` at the end for services that are open all day. Sample providers are generated for the new service automatically.

## Next steps

- Add real accounts with a backend, so sign-in is checked and listings stay saved
- Replace `PROVIDERS` in `js/data.js` with data from a backend
- Use the browser's location instead of the fixed Ikeja location, and calculate real distances
- Save bookings and saved providers to a database so they stay after closing the app

## Added in this version

- **Verified badge and trust block**: phone code check (demo code shown on screen), optional ID photo, vouches, filter chip.
- **Free now**: providers switch it on; customers see a pill and a "Need it now?" row on the home screen.
- **Share page and QR code**: from the provider dashboard (`js/qr.js` makes the code, no library needed). The link is an example address.
- **Get quotes**: describe a job, receive quotes, accept one to book. Providers who signed up in the same tab get a real request and can send a quote.
- **Order tracking** for tailors and clothing makers, with saved measurements.
- **Map** (Leaflet and OpenStreetMap, loaded from jsDelivr) next to the distance scale, plus a "Pin your shop" picker for providers. Needs internet. See `supabase/SETUP.md` section 8 for tile limits.
- WhatsApp: customers can send booking details to the provider. Automatic alerts need the WhatsApp Business setup in `supabase/SETUP.md`.

## UX pass

- Results: one compact toolbar (List, Distance, Map; Get quotes) and a single scrolling row of sort and filter chips, so providers show first. The distance scale is one tap away under "Distance".
- "Best match" marks one provider when there are three or more (rating, distance, open, verified).
- Price list rows are tappable and open the booking sheet with that item chosen. The sheet shows a live summary and the price on the confirm button.
- Order progress is a compact bar with the current step, and the full list under "See all steps".
- Short confirmations (saved, booking cancelled, review added, quote sent).

## Real accounts and hosting

Fill `js/config.js` with your Supabase project to turn on real accounts; leave it empty for the demo. `vercel.json` and `DEPLOY.md` cover hosting on Vercel. Listings and bookings are still demo-only.
