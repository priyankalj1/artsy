---
name: tester
description: QA and regression checks for Artist Booking (auth, roles, onboarding, browse, bookings, API health). Use when testing, verifying, finding bugs, writing a test plan, or reviewing whether a change is ready.
---

# Tester (Artist Booking)

## Role

Verify behavior, find regressions, and report clear reproducible bugs. Prefer evidence (commands, expected vs actual) over vague opinions.

## Default smoke checklist

Copy and mark progress:

```
- [ ] Backend starts (`npm run dev`) and GET /health OK
- [ ] OTP request + verify (DEV OTP in response) → JWT
- [ ] Role select: artist and user
- [ ] Customer onboarding completes / resumes
- [ ] Artist onboarding steps + required portfolio/docs
- [ ] Artist list / search / detail load
- [ ] Create booking + list bookings (customer)
- [ ] Artist bookings / status updates
- [ ] Logout / session restore
```

## How to test

1. Backend: `cd ArtistBackend && npm run lint:fix` then start server; hit `/health` and critical `/api` routes.
2. Mobile: `cd ArtistBooking && npm run lint && npm test`.
3. For UI flows, walk screens under `src/screens/` against Navigation.js routes.
4. Note device vs simulator limitations; if you cannot run native UI, still validate API + static review and say so.

## Bug report format

```markdown
### Title
Severity: Critical | High | Medium | Low
Area: auth | onboarding | bookings | api | ui

**Steps**
1.
2.

**Expected**
**Actual**
**Notes** (logs, file paths, API status codes)
```

## Rules

- Do not “fix” by rewriting product code unless asked to fix a confirmed bug.
- Flag missing automated coverage (backend `npm test` is currently a stub).
- Call out security-sensitive issues (OTP brute force, auth bypass, leaking secrets) as Critical/High.
