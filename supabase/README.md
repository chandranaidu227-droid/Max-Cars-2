# Connect MAX CARS to Supabase

Project: `yzvrerlsafvlbbkqgvjt`.
The URL and supplied publishable key were verified with read-only requests.
The project requires email confirmation. The `vehicles` table was missing when
checked; GitHub connection alone has not installed this application's schema.

## 1. Create the database tables

Open https://supabase.com/dashboard/project/yzvrerlsafvlbbkqgvjt/sql/new.
Copy the entire contents of **setup.sql** from this directory into the SQL
Editor and click **Run**, once. It creates seven application tables, automatic
user profiles, ownership policies, and 32 catalogue vehicles.

`setup.sql` combines `migrations/202609150001_max_cars.sql` and `seed.sql` for
manual setup. Use either this combined file or the migration plus seed, not both.
If you use the Supabase migration CLI later, reconcile its history with this
manually applied migration first. Existing MongoDB users/data are not imported.

The publishable key cannot execute schema migrations. No private database
password or Supabase management access is available in this workspace.

## 2. Configure email redirects

Open Authentication → URL Configuration:

- Site URL: `https://maxcarx.netlify.app`
- Allowed redirect URL: `https://maxcarx.netlify.app/auth/callback`
- Allowed redirect URL: `https://maxcarx.netlify.app/reset-password`

For local development, also allow the same two paths on your frontend origin
(for example `http://localhost:5173`). Set `PUBLIC_BASE_URL` on the local API
to that frontend origin when testing locally.

Keep email confirmation enabled. Configure custom SMTP in Supabase's Auth email
settings for customer delivery. Supabase's default sender restricts recipients
and rates; a successful API call alone does not prove inbox delivery.

To send a 6-digit password reset code, open **Authentication → Emails → Templates →
Reset password** in the Supabase dashboard. Keep the reset link and add the
following line to that template, then save it:

```html
<p>Your MAX CARS password reset code is: <strong>{{ .Token }}</strong></p>
<p>Or use this link: <a href="{{ .ConfirmationURL }}">Reset password</a></p>
```

The website's **Forgot password** form sends this email. The user can enter
their email, the 6-digit code, and a new password on `/reset-password`, or use
the link. Supabase verifies the recovery code before the password changes.
The email template cannot be changed with the public publishable key; it must
be saved in the project dashboard. If Gmail SMTP is used, configure port 465
or 587 and a current Google app password, then verify delivery to an inbox.

Signup shows a confirmation message instead of creating a fake logged-in state.
Confirmation and recovery links establish a Supabase session in the browser.
The password form calls Supabase's authenticated password update API.

## 3. Configure Netlify and rebuild

Set these environment variables for builds and functions:

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | `https://yzvrerlsafvlbbkqgvjt.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | The publishable key you supplied |
| `NEXT_PUBLIC_SUPABASE_URL` | Same Supabase URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same publishable key |
| `PUBLIC_BASE_URL` | `https://maxcarx.netlify.app` |

Netlify uses `npm run build:netlify`, publishes `.next`, and routes `/api/*`
to the bundled Express function. Rebuild after changing `NEXT_PUBLIC_*` values.
The local ignored environment files are configured, but they are not uploaded
to Netlify or GitHub. No service-role key is needed for the website.

MongoDB and the old Express SMTP credentials are no longer used.

## 4. Verify after deployment

1. Run `npm run test:live` in `backend/`: expect public vehicles and denied
   anonymous order access.
2. Sign up using an inbox you control, open the confirmation email, and log in.
3. Request recovery, open its email, set a new password, and verify login.
4. Save a favourite and submit a reservation; confirm rows in Table Editor.
5. Log in using a second account and verify the first account's records are hidden.

Automated local checks: `npm run test:supabase`, `npm --prefix backend test`,
`npm run lint`, and `npm run build:netlify`.

Customers cannot edit their role, record ownership, payment status, or generated
order references. Set an admin role only through a trusted database operation.
Checkout remains a reservation request with no money collected. Live payments
need a provider, merchant credentials, and an agreed server-controlled amount.

Official references:
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/redirect-urls
