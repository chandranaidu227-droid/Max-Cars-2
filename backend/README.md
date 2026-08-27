# MAX CARS API

Express and MongoDB API for the MAX CARS frontend.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` and a private random `AUTH_SECRET` of at least 32 characters.
3. Set `CLIENT_ORIGINS` to the comma-separated frontend origins allowed to call the API.
4. Run `npm install` and `npm run dev`.

Never commit `.env`. The repository ignore rules exclude it.

## API

Public:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `GET /api/vehicles`
- `GET /api/vehicles/:slug`

Authenticated Bearer-token routes:

- `GET/PATCH /api/auth/me`
- `GET/POST/DELETE /api/favourites`
- `GET/POST/PATCH/DELETE /api/bookings`
- `GET/POST /api/orders`
- `GET/POST/PATCH/DELETE /api/listings`
- `GET/POST /api/support`

Admin-only:

- `GET /api/admin/summary`
- `POST /api/admin/vehicles`
- `PATCH /api/admin/vehicles/:id`

Run `npm test` to execute backend unit and HTTP tests.
