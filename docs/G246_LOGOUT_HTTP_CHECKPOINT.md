# G2.4.6 — HTTP logout behavior checkpoint

**Status:** Local HTTP integration **PASSED** (maintainer-reported, 2026-11-26).

Results: TypeScript `tsc --noEmit` succeeded; targeted logout-probe tests 2/2 passed; the reported latest Academy smoke suite passed 288/288. Disposable learner login authenticated, logout returned HTTP 200, matching cookie-expiration metadata was present (same cookie name and expired cookie), anonymous request after logout had no learner session, and replay of the original cookie was rejected. The test deleted its disposable learner. No token/cookie values were shared.

The earlier failure `Logout did not visibly expire a cookie` came from a too-strict fixed-date assertion. The revised probe recognizes either Max-Age or a past Expires value and independently checks old-cookie replay. This evidence covers local Payload HTTP logout, not arbitrary browsers, distributed deployments, or production. 

## What we measure

The bounded test `scripts/test-g246-logout-http.ts` creates one disposable verified learner in the dedicated localhost `kasa_academy_dev` database, without verification emails. It uses the actual learner HTTP login to get a session cookie, confirms `/api/learners/me` authenticates, posts `/api/learners/logout`, checks that an expiring cookie is set, confirms anonymous requests do not authenticate, and tries the old cookie again.

**Important:** Successful browser logout is not automatically proof of server-side revocation. The script prints a `SECURITY OBSERVATION` if the pre-logout cookie can still authenticate. That finding must be resolved before public signup, and must not be reinterpreted as PASS for server-side revocation. Existing G2.4.5 password-reset JWT revocation passed separately.

## Local Windows procedure

Have your Next.js server already running at localhost:3000 (or 3001) against the same dedicated local DB. Stop unrelated background tests; don't run this against production, Neon, Vercel, or real accounts.

In a second PowerShell window:

```powershell
cd C:\Users\User\kasa-learning-academy
git pull --ff-only origin dev/g2-4-auth-security-hardening
.\node_modules\.bin\tsc.cmd --noEmit
node --test tests/g246-logout-http-probe.test.mjs
npm.cmd run test:smoke
$env:G24_ALLOW_LOCAL_LOGOUT_TEST = 'yes'
try {
  node --env-file=.env.local --import tsx scripts/test-g246-logout-http.ts
} finally {
  Remove-Item Env:G24_ALLOW_LOCAL_LOGOUT_TEST -ErrorAction SilentlyContinue
}
```

If Next.js uses port 3001, set `$env:G24_TEST_ORIGIN='http://localhost:3001'` before running and remove afterward. Never share raw session cookie, JWT, passwords, reset links or token-bearing URLs. Report status/errors only after redacting secrets.

## Pending

- Expired password-reset token rejection (needs controlled expiration fixture and no real email).
- Access-log redaction for token URL query parameters.
- Trusted network/IP rate limiting and counter failure classification.
- Verify-email throttling and account enumeration checks.
- Production email delivery verification and reviewed release gate.

No schema migration or production deployment in this checkpoint. Public registration remains closed.
