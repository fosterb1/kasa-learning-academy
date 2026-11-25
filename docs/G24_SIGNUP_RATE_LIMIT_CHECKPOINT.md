# G2.4.2 — Local signup rate limiting (not production ready)

Status: **implemented on development branch, awaiting local test results**.

The local-only custom learner-registration route now requires BOTH:
- `G2_ENABLE_LOCAL_SIGNUP=yes` (pre-existing local feature gate)
- `G24_ENABLE_LOCAL_RATE_LIMIT=yes`, with distinct 32+-character `G24_RATE_LIMIT_SECRET`

It calls the atomic PostgreSQL limiter for the normalized email before any `payload.create`. Accepted attempts follow the existing email verification flow. Exceeded limits respond with HTTP 429 and `Retry-After`. The form displays retry guidance. Missing G2.4 flag denies registration with HTTP 503. Missing limiter configuration, table or DB denial cannot lead to a registration write.

**Current limitations:** this is an **account-only**, local-dev guard, not a full per-IP public abuse defense. A DB/config failure can currently return the same HTTP 429 as an exhausted counter; improve operational error classification before production. Duplicate-email response/latency can reveal existence on a future public route. Login, recovery, verify, and reset remain protected only by their existing Payload controls, not this shared limiter. No production registrations are enabled.

## Migration concern

The maintainer reported that Payload previously warned about possible data loss during migration and they accepted it. Check learner/course/CMS records now; do not assume data was preserved merely because `payload migrate` reported success. Obtain a local backup before new destructive changes. Do not rerun `payload migrate` unless a new migration is explicitly required.

## Suggested local operator procedure (Windows PowerShell)

1. Stop `next dev`, pull branch, run TypeScript and smoke tests.
2. Verify local learner login and existing course content. Back up the **local** DB if the `pg_dump` executable is installed:
   ```powershell
   $backup = Join-Path (Get-Location) ('kasa_academy_dev-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.dump')
   pg_dump -h localhost -U kasa_dev -d kasa_academy_dev -F c -f $backup
   if ($LASTEXITCODE -ne 0) { throw 'Local pg_dump failed' }
   Write-Host 'Local database backup completed. Keep this file private.'
   ```
   Do not commit or upload dump files. If `pg_dump` is not on PATH, locate the installed PostgreSQL bin path.
3. Generate a unique local security secret with compatible PowerShell:
   ```powershell
   $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $bytes = New-Object byte[] 32
   try {
       $rng.GetBytes($bytes)
       $env:G24_RATE_LIMIT_SECRET = [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
   } finally { $rng.Dispose() }
   $env:G24_ENABLE_LOCAL_RATE_LIMIT = 'yes'
   ```
   Note: these environment variables must exist in the **shell launching `npm.cmd run dev`**, not merely in a separate terminal.
4. Run `node --test tests/g24-signup-rate-limit.test.mjs` and `npm.cmd run test:smoke`.
5. Use controlled requests only on `http://localhost:3000` and disposable accounts. The limiter allows five signup attempts per normalized address per hour; the sixth is HTTP 429. A real email may only be sent to the permitted Resend testing address; do not send repeated live test emails or burn provider quotas to prove rate limiting. Prefer automated in-process fixtures with mocked email delivery for repeated attempts.

After running, terminate the server and remove temporary `G24_*` environment variables. If you choose to keep local signup running, provide the same secret consistently across restarts; rotating the secret changes HMAC buckets and invalidates the prior rate-limit identity mapping.

**No public deployment, PR merge, or production schema change approved.**
