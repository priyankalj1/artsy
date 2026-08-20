# Artist Backend

Node.js API for the Artist Booking app. Structure mirrors `server-suite`
(`apis` → `controllers` → `models`, plus middlewares, validations, uploads, logs).

## Run

```bash
cd ArtistBackend
npm install
npm run dev
```

Server: `http://localhost:5050`  
Health: `GET /health`

## Config

Copy `env.example.js` → `env.js` (already present for local DEV).

- `USE_MEMORY_STORE: true` — works without Postgres (default for local/demo)
- Set `USE_MEMORY_STORE: false` and configure DB_* (database: `serverArt`) then run `schema.sql`

## Main routes (`/api`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/otp/request` | No | Send OTP (OTP returned in DEV/UAT) |
| POST | `/auth/otp/verify` | No | Verify OTP → JWT |
| POST | `/auth/role` | Yes | Select `artist` \| `user` |
| GET | `/auth/me` | Yes | Current user + onboarding status |
| POST | `/auth/onboarding/progress` | Yes | Save onboarding drop-off step |
| POST | `/users/onboard` | Yes | Customer onboarding |
| GET | `/users/me` | Yes | Customer profile |
| GET | `/artists/categories` | No | Categories |
| GET | `/artists` | No | List artists |
| GET | `/artists/:id` | No | Artist detail |
| POST | `/artists/onboard` | Yes | Artist onboarding |
| GET | `/artists/me` | Yes | My artist profile |
| POST | `/bookings` | Yes | Create booking |
| GET | `/bookings` | Yes | My bookings |
| GET | `/bookings/:id` | Yes | Booking detail |
| PATCH | `/bookings/:id/status` | Yes | Update status |
| POST | `/uploads` | Yes | Upload file (`file` field) |

OTP is a random 4-digit code stored on `users.otp` with `users.otp_expiry`. In DEV/UAT the code is returned in the request response so it can be typed in the app.
