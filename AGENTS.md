# Artist Booking App — Agent Context

## What this is

Marketplace mobile app where **customers book artists** (makeup, mehendi, singers, DJs, etc.) and **artists onboard, get verified, manage bookings/earnings**.

Monorepo:

| Folder | Stack | Role |
|--------|--------|------|
| `ArtistBooking/` | React Native 0.86 | iOS/Android client |
| `ArtistBackend/` | Node/Express + Postgres (or in-memory) | REST API on port **5050** |

User flows: phone OTP login → role (`artist` \| `user`) → onboarding → browse/search artists → create bookings → payments (Razorpay on mobile).

## Architecture notes

- Backend layers: `apis` → `controllers` → `models` (+ validations, middlewares).
- Mobile API client: `ArtistBooking/src/api/` talking to `API_BASE_URL` (`ArtistBooking/src/config/api.js`).
- Auth: JWT after OTP verify; OTP returned in response in DEV/UAT.
- Local default: `USE_MEMORY_STORE: true` in `ArtistBackend/env.js` (no Postgres required).
- Real DB: set `USE_MEMORY_STORE: false`, configure `DB_*`, apply `ArtistBackend/schema.sql`.
- Never commit `ArtistBackend/env.js` — use `env.example.js`.

## How to run

### Backend

```bash
cd ArtistBackend
npm install
cp env.example.js env.js   # if missing
npm run dev                # http://localhost:5050  ·  GET /health
```

### Mobile

```bash
cd ArtistBooking
npm install
npm start                  # Metro
# other terminal:
npm run ios                # or npm run android
```

Physical device: phone and Mac on same Wi‑Fi; API host is auto-detected from Metro URL (see `src/config/api.js`). Update `MANUAL_LAN_IP` if auto-detect fails.

## How to test

| Area | Command / check |
|------|------------------|
| Backend lint | `cd ArtistBackend && npm run lint:fix` |
| Backend smoke | `curl -s http://localhost:5050/health` |
| Mobile unit | `cd ArtistBooking && npm test` |
| Mobile lint | `cd ArtistBooking && npm run lint` |
| Auth smoke | `POST /api/auth/otp/request` then `otp/verify` (OTP in DEV response) |
| Onboarding | Artist: `ArtistOnboardScreen` + `POST /artists/onboard`; Customer: `CustomerOnboardScreen` + `POST /users/onboard` |
| Bookings | `POST /bookings`, list via `GET /bookings` |

Backend has no automated test suite yet (`npm test` is a stub). Prefer lint + manual API/UI checks until tests exist.

## Key paths

- Screens: `ArtistBooking/src/screens/`
- Navigation: `ArtistBooking/Navigation.js`
- API routes table: `ArtistBackend/README.md`
- Schema: `ArtistBackend/schema.sql`
- Portfolio limits: `MIN_PORTFOLIO_*` / `MAX_PORTFOLIO_*` in env

## Agent ground rules

1. Match existing patterns (RN screens, Express layers, Joi validations).
2. Do not commit secrets, `env.js`, `node_modules`, or upload/log binaries.
3. Prefer small, reviewable PRs; one concern per change.
4. When changing API contracts, update mobile `src/api/` clients in the same change when possible.
5. Role playbooks live in `.cursor/skills/` and `.cursor/agents/`.

## Cursor Cloud specific instructions

- Install deps in both `ArtistBackend` and `ArtistBooking` if touching either.
- Backend can run with memory store for most feature work.
- Native iOS/Android builds may be unavailable in cloud VMs — prioritize JS/API changes, lint, and Jest; note when a device/simulator check is still required.
- Open a PR with a short summary and test notes.
