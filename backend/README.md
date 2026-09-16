# MAX CARS Supabase API

Express API backed by Supabase Auth and PostgreSQL. MongoDB is no longer used.

See [Supabase setup](../supabase/README.md) for the SQL and deployment steps.

## Local development

1. Configure `backend/.env` using `.env.example`.
2. Run `npm install` in this directory, then `npm run dev`.
3. Set the frontend public Supabase variables in the root `.env.local`.
4. Run `npm run dev` from the repository root.

Requests use each customer's Supabase access token. The API validates identity
with `auth.getUser()`, and PostgreSQL row policies enforce ownership. No
service-role key is required by the application.

`GET /api/health` checks the real vehicles table and returns 503 until setup is complete.
Auth endpoints remain under `/api/auth`. Data routes remain under `/api/vehicles`,
`/api/favourites`, `/api/bookings`, `/api/orders`, `/api/listings`, `/api/support`
and `/api/admin`. Orders and support tickets support create/read only.

## Checks

- `npm test`: mocked HTTP route and authentication checks.
- `npm run test:live`: read-only Supabase connection and anonymous access check.
- `npm run seed:vehicles`: regenerate the local SQL setup and catalogue files;
  this does not write to a database.
- From the repository root: `npm run test:supabase` tests the migration and
  ownership policies in a disposable embedded PostgreSQL database.

Supabase manages confirmation and recovery emails. Configure sender credentials
in Supabase, not in the Express server. Real payments are still not enabled.
Archived MongoDB files under `legacy-mongodb/` are not runnable or used by the app.
