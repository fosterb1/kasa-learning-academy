# G2.4.5 — Session revocation and reset-token lifecycle (local-only)

Status: **Windows local integration PASSED (maintainer-reported, 2026-11-25).**

Validation evidence:
- `tsc --noEmit`: no errors reported.
- `tests/g24-session-reset-probe.test.mjs`: 4 passed, 0 failed.
- `scripts/test-g24-session-reset.ts`: disposable session authenticated; password reset with no email; reset token reuse denied; old password denied; pre-reset JWT revoked; new password and JWT accepted; disposable learner deleted.
- This confirms **local Payload token revocation after password reset**, not browser cookie/logout behavior or expired-reset-token enforcement.
- The test ran with G24 local rate limiter unset as intended. No public signup, production environment, or paid mail was involved.


The independent local integration probe in `scripts/test-g24-session-reset.ts` creates one disposable learner with a random `example.invalid` address. It suppresses both signup verification email and forgot-password email using Payload's `disableVerificationEmail: true` and `disableEmail: true`. No Resend request is intentionally made.

It verifies: the initial JWT authenticates, reset succeeds, used reset token cannot be reused, original password fails, original JWT no longer authenticates, and new password / new JWT work. Fixture record deletion runs in `finally`. The test does not prove HTTP cookie logout behavior or reset-token expiration; those are separate pending gates.

## Windows local-only test

First save or back up work and ensure your `.env.local` still targets dedicated `kasa_academy_dev` (localhost, user `kasa_dev`). Stop any long-running `next dev` process to eliminate conflicting database operations. Never use Neon or production.

```powershell
cd C:\Users\User\kasa-learning-academy
git pull --ff-only origin dev/g2-4-auth-security-hardening
.\node_modules\.bin\tsc.cmd --noEmit
node --test tests/g24-session-reset-probe.test.mjs
npm.cmd run test:smoke
# In this test's PowerShell process, G24 limiter must NOT be enabled:
Remove-Item Env:G24_ENABLE_LOCAL_RATE_LIMIT -ErrorAction SilentlyContinue
$env:G24_ALLOW_LOCAL_SESSION_TEST = 'yes'
node --env-file=.env.local --import tsx scripts/test-g24-session-reset.ts
Remove-Item Env:G24_ALLOW_LOCAL_SESSION_TEST -ErrorAction SilentlyContinue
```

Check `.env.local` has no `G24_ENABLE_LOCAL_RATE_LIMIT=yes` override; the guard refuses to run when enabled. No database migration is required.

If the session test fails, do not alter auth checks or reset a personal account. Share error **message only**, redact tokens, emails, password values, database credentials and reset URLs. The test will clean up the fixture if creation succeeded; if cleanup fails, report that separately.

## Outstanding gates

- Verify expired reset tokens using a controlled, disposable record and database-backed test clock, without real email.
- Verify real HTTP logout and cookie invalidation with a disposable learner.
- Review reset/verify URL access-log token leakage.
- Implement and test trusted network/IP throttling and DB outage error classification.
- Add verify-email rate-limit coverage and known-vs-unknown account enumeration checks.

Public signup remains closed. No merge, production deployment, or paid service is authorized.
