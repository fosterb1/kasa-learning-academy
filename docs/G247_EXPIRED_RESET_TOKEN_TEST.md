# G2.4.7 — Expired reset-token local verification

**Status:** implementation and static regression checks committed; live Windows integration not yet run.

The probe `scripts/test-g247-expired-reset.ts` uses one randomly named disposable learner in a dedicated local PostgreSQL database. It issues a reset token through Payload with `disableEmail: true`, checks that expiry was initially in the future, and then changes **only that disposable learner's** `reset_password_expiration` column to one minute in the past using a parameterized SQL UPDATE restricted to that learner id. It checks that Payload refuses the expired token and that the original password still works. Cleanup deletes the fixture in `finally`.

No mail is sent intentionally. No timers or 30-minute waiting; no new schema, migration or infrastructure. Real learner records, production databases and public registration remain untouched.

## Windows PowerShell

Stop any unrelated dev integration tests. The Next.js server is not needed; this probe uses the Payload Local API. Verify your existing backup is retained separately from Git. From the development branch:

```powershell
cd C:\Users\User\kasa-learning-academy
git pull --ff-only origin dev/g2-4-auth-security-hardening
.\node_modules\.bin\tsc.cmd --noEmit
node --test tests/g247-expired-reset.test.mjs
npm.cmd run test:smoke

Remove-Item Env:G24_ENABLE_LOCAL_RATE_LIMIT -ErrorAction SilentlyContinue
$env:G24_ALLOW_LOCAL_EXPIRY_TEST = 'yes'
try {
  node --env-file=.env.local --import tsx scripts/test-g247-expired-reset.ts
} finally {
  Remove-Item Env:G24_ALLOW_LOCAL_EXPIRY_TEST -ErrorAction SilentlyContinue
}
```

If `.env.local` itself sets `G24_ENABLE_LOCAL_RATE_LIMIT=yes`, the test refuses execution; do not weaken the guard. The script requires `DATABASE_URL` on localhost, database `kasa_academy_dev`, user `kasa_dev`. No secret/password/token values should appear in shared logs.

If the SQL column name differs from the local Payload migration layout, the script will fail and remove its fixture. Inspect the schema before making any changes; do not auto-run migrations or bypass the expiry assertion.

Expected verified lines: fresh future expiration; expiration moved to past; expired token rejected; original password remains valid; disposable learner deleted.

## Remaining security gates

- Verify both reset and email-verification token URLs are redacted or not logged anywhere in development and deployment logging.
- Implement trusted network/IP rate limiting in addition to account limits; protect against rotated identifiers.
- Distinguish real request throttling (429) from counter/database outages (503).
- Verify-email throttling, account-enumeration privacy, and production transactional mail.
- Final review and separate deployment authorization; do not merge G2.4 into main yet.
