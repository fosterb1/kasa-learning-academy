# G2.4 RFC 001 — Shared PostgreSQL authentication throttling

**Decision status:** Proposed, not deployed. No new paid service approved or introduced.

## Background

G2.3 local user journeys passed. The registration endpoint is a custom Next.js route; login, forgot-password, reset-password and verify-email are Payload authentication endpoints. Protecting only the registration route would be insufficient. Existing Payload per-account login lockout and reset minimum interval do not replace a shared IP-and-account limiter.

## Storage contract

Prefer the Academy's existing PostgreSQL infrastructure, using a separately reviewed additive migration to create an authentication-rate-limit table. No new database credentials or externally billed service.

Proposed schema contract:
- `bucket_key`: fixed-length HMAC digest (purpose + canonical account or trusted client IP), not raw email or token
- `window_start`: timestamp with time zone, aligned to a fixed interval
- `attempts`: nonnegative integer
- `expires_at`: timestamp with time zone for bounded pruning
- Primary key (`bucket_key`, `window_start`), index on `expires_at`

A single atomic statement using `INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING attempts` must count concurrent requests correctly. Window start must use a single PostgreSQL clock source and chosen UTC interval. Rollback must be documented; periodic pruning must be bounded, not unbounded per HTTP request.

## Identity and proxy security

- Account identifiers normalized with conservative ASCII case rules; retain legitimate Unicode safely. Hash with HMAC-SHA256 and a server secret independent of other application secrets.
- Never log the HMAC key, raw account, reset token or authorization cookies.
- Client IP must come from a documented trusted proxy chain, not arbitrary caller-supplied `x-forwarded-for`. For local tests bind the loopback peer or an explicit trusted proxy simulator.
- Apply independent limits for both client network and account identifier, plus global capacity safeguards. Include missing-account requests.
- Malformed and missing identity inputs must not disable the IP-only limit.

## Coverage and enforcement

1. Signup — custom route, before database writes.
2. Forgot-password — Payload endpoint; enforce before token creation or email dispatch.
3. Login — Payload endpoint; enforce before password checking.
4. Verify-email — Payload endpoint; enforce before token lookup.
5. Reset-password — Payload endpoint; enforce before token use.

Select a supported Payload endpoint wrapper/hook or narrow, reviewed Next.js request intercept; don't patch node_modules or broadly intercept unrelated CMS administrator routes. Document all affected methods and paths.

## Failure and response semantics

- Limit violations: 429 with neutral wording and bounded `Retry-After`, without confirming account presence.
- Counter backend unavailable: deny sensitive operations with 503; never silently allow unlimited attempts.
- Known/unknown account response semantics, latency and email send failures need explicit side-channel review.
- Do not alter G2.3 local verification behavior until the limiter's negative tests pass.

## Required tests

- Allowed first request, threshold request, and rejected threshold+1.
- Concurrent increments from independent connections; exactly bounded number accepted.
- Fixed window rollover and expiry; fake-clock or test DB, no sleeps or production traffic.
- Purpose separation (signup vs login vs recovery).
- Account normalization and HMAC privacy.
- IP spoofing through forwarded headers does not bypass counters.
- Unknown/known account indistinguishability at relevant public surfaces.
- Database outage denies the sensitive action without creating an account or sending email.
- Actual Payload login/recovery/verification/reset endpoints protected, not just the signup custom route.
- Production public signup still returns 503.

## Exit conditions

A reviewable migration, server module, endpoint wiring, multi-process integration test on `kasa_academy_dev`, real-browser smoke tests, and documented no-cost infrastructure assessment. Do not claim rate limiting is implemented or merge this RFC as production security.

## Implementation checkpoint — November 25, 2026

Initial **local-only, unwired** code has been committed:
- `src/migrations/20261125_000001.ts`: additive counter table; registered in migration index.
- `src/lib/auth-rate-limit.ts`: HMAC bucket derivation + atomic SQL upsert, denies on missing configuration/DB failure.
- `tests/g24-rate-limit-source.test.mjs`: source-level security regression checks.
- `scripts/test-g24-rate-limit.ts`: real local DB concurrency probe using disposable fake account identifiers.

This is **not yet a security control for real learner endpoints**, because it has not been wired into Payload or executed against the maintainer's local DB. Known gaps: integrate all five endpoints, validate trusted-client-IP lookup behind real proxy, verify adapter query return types, ensure pruning, add end-to-end rate-limit abuse tests, review fairness/availability, and avoid leaking token URLs to access logs.

### Controlled PowerShell test sequence

Stop `next dev` to avoid local hot-reload/schema interference. Work on `dev/g2-4-auth-security-hardening`.

```powershell
git pull --ff-only origin dev/g2-4-auth-security-hardening
node --test tests/g24-rate-limit-source.test.mjs
.\node_modules\.bin\tsc.cmd --noEmit
# Run only on known dedicated local DB; this creates the new security counter table.
npm.cmd run db:migrate
$env:G24_ENABLE_LOCAL_RATE_LIMIT = "yes"
$env:G24_RATE_LIMIT_SECRET = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
node --env-file=.env.local --import tsx scripts/test-g24-rate-limit.ts
Remove-Item Env:G24_ENABLE_LOCAL_RATE_LIMIT,Env:G24_RATE_LIMIT_SECRET -ErrorAction SilentlyContinue
```

Never share the generated secret. This test makes **local DB writes**, has no outbound email traffic, and does not send load to Vercel or Resend. The terminal integration result is necessary; source-level tests alone do not establish concurrency safety. If migration or TypeScript fails, stop and report exact error rather than modifying production schemas.
