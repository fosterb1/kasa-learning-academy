# G2.2 Learner Authentication — Functional Test Checkpoint

Status: **NOT RELEASE APPROVED**. This document distinguishes verified checks from pending checks.

## Scope and environment

- Feature branch: `g2-2-learner-recovery-foundation` (draft PR #25, stacked on G2.1 PR #24).
- Vercel Preview uses Neon `academy-staging`; Production uses Neon `main`.
- Public learner registration is intentionally **disabled**.
- The test scripts are explicitly barred from Neon and Production.
- Never paste Neon credentials, reset tokens, or passwords into GitHub issues, terminal command lines, or chat messages.

## Verified remotely (2026-11-23)

- G2.2 Preview route availability: `/login`, `/profile`, `/verify-email`, `/forgot-password`, `/reset-password` all returned HTTP 200.
- Anonymous `GET /api/learners`, `GET /api/learners/999999`, and `GET /api/users` returned HTTP 403.
- Anonymous `GET /api/learners/me` returned no current user.
- Public `GET /api/modules` returned HTTP 200 (intentional).
- Staging has one CMS administrator and learner schema installed. This is **not** evidence of authenticated learner functionality.

## Local disposable-database tests

Run from the Academy repository only after configuring the existing, isolated local PostgreSQL test database `kasa_academy_dev` with user `kasa_dev`. Make sure `.env.local` contains a local `DATABASE_URL` and a locally generated `PAYLOAD_SECRET` of 32+ characters.

```bash
git switch g2-2-learner-recovery-foundation
git pull --ff-only origin g2-2-learner-recovery-foundation
npm install
npx tsc --noEmit
npm run test:smoke
G2_ALLOW_DEV_AUTH_TEST=yes npm run test:g2-auth
G2_ALLOW_DEV_AUTH_TEST=yes npm run test:g2-recovery
```

**Both integration scripts deliberately refuse any URL other than localhost/127.0.0.1/::1, user `kasa_dev`, database `kasa_academy_dev`, or without the explicit permission variable.** Do not weaken the guards to test Preview.

### G2.2 recovery script covers

- An unverified learner cannot sign in.
- A verified learner can sign in.
- A reset token can be issued by the trusted local Payload API.
- An invalid reset token is rejected.
- The valid token changes the password.
- A consumed token cannot be reused.
- The previous password no longer works and the new one works.
- The temporary learner is removed, even on failure.

Never report these as *passed* unless the command completes successfully and its exit status is zero.

## Still required for release

- Authenticated **browser** test using two disposable learner accounts, confirming cookies, logout, session invalidation and cross-account isolation.
- Reset token expiry after 30 minutes and login lockout after repeated failures, including recovery after lock expiry.
- Real transactional email adapter, delivery and verification/reset links using the correct environment host. In Preview, the shared `NEXT_PUBLIC_SITE_URL` may currently point to Production; fix before email testing.
- Distributed throttling for signup/login/recovery, CSRF/cookie security review, and abuse handling.
- Confirm no production admin/login paths are exposed on an uninitialized database.
- Review Vercel Postgres driver SSL warnings and ensure intended certificate validation semantics.
- Final independent checks of both stacked PRs, then an explicit separate release decision.

## Change control

No auto-merge of PR #24 or #25. No Production database migration or public registration enablement during this test phase.
