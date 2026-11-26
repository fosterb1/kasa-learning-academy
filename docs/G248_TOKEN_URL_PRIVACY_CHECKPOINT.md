# G2.4.8 — One-time token URL privacy checkpoint

**Status:** maintainer reported **PASS** for revised local automated checks (2026-11-26). Exact count and full output not supplied in this confirmation. **Live browser reset and verification flows remain unverified.**

## Changes

- Newly generated learner verification and password reset links use `/verify-email#token=...` and `/reset-password#token=...`, not `?token=...`. Fragments are not sent in normal HTTP request URLs.
- Both landing pages now render client components without server `searchParams` token values. A shared client hook reads the fragment, removes it with `history.replaceState`, holds it only in component memory, and never logs it.
- Verification now posts the token in JSON to `/api/learner-verify-token`, rather than putting it into `/api/learners/verify/:token` (which can appear in server request logs).
- The new verification POST route is **local-only** and guarded by the G2.4 PostgreSQL account token limiter; it requires same-origin JSON, caps body size, and returns generic errors.
- Reset already posts its token in JSON.
- The two landing routes return no-referrer and no-store response headers.

## Scope and caveats

- Existing emails containing `?token=` links are **not supported by these new pages**; reissue test emails rather than attempting a compatibility redirect that would preserve token-bearing request URLs.
- Browser fragments are still visible briefly to browser extensions/history and are not a replacement for HTTPS, CSP, short token lifetimes or strong referrer policies. Do not paste reset links.
- Payload's default `/api/learners/verify/:token` route may still exist. The new learner UI no longer uses it; removing or suppressing default framework routes needs separate review.
- We have not proven that all HTTP proxies, reverse proxies, email click-tracking services or third-party telemetry redact sensitive values. Do not claim production-grade token logging elimination.
- The local-only verification endpoint is unavailable in production. Public signup remains closed and verification in any future public release requires an approved implementation.
- Avoid opening the test login/recovery links with a third-party URL inspection service.

## Windows local checks

```powershell
cd C:\Users\User\kasa-learning-academy
git pull --ff-only origin dev/g2-4-auth-security-hardening
.\node_modules\.bin\tsc.cmd --noEmit
node --test tests/g248-token-url-privacy.test.mjs
npm.cmd run test:smoke
```

Then run `npm.cmd run dev` with existing **local** configuration. Use your already-approved dev email (one verification link and one password reset link only), and confirm:
1. Generated email links have `#token=` rather than `?token=`.
2. Opening the link shows no token in the address bar after the client mounts.
3. No token appears on GET request URLs in the Next.js terminal.
4. Reset password works and old session is revoked, as previously tested.
5. Verification form posts and shows success against local-only verification endpoint when G24 limiter is correctly enabled.
6. Avoid sharing raw email links, tokens, cookies, secret values, or raw request URLs.

If an old email is used, request a **fresh link**; don't change token expiry or re-enable query-string ingestion to make legacy links work.

No new migration, paid infrastructure, production deployment, public registration or main merge was performed.

## Remaining release gates

- Complete live test results for G2.4.8, confirm expected Next.js behavior.
- Review Payload's default path-based verification route.
- Proxy/IP throttling and DB outage classification.
- Verify-email brute-force limits under a distinct nonce and local loopback only.
- Account enumeration consistency and production email delivery.

## Follow-up: disposable HTTP integration gate (maintainer reports PASS, 2026-11-26)

Added `scripts/test-g248-token-flow-http.ts` and `tests/g248-token-flow-http-probe.test.mjs` to validate live localhost API behavior without sending any email. The probe creates one random `example.invalid` learner, verifies it via token-in-POST-body HTTP, resets its password via token-in-POST-body HTTP, checks the original password fails and the new one works, verifies token landing page referrer/cache headers, and deletes the fixture in `finally`. No token-bearing URLs or raw token values are printed.

**Prerequisites:** dedicated local database `kasa_academy_dev`, `kasa_dev` role, matching local secrets and G24 rate limiter enabled in **both** the test's environment and an already running local Next.js development server. No Neon, Resend, other paid services, or schema migration.

With the development server running in its own terminal:

```powershell
cd C:\Users\User\kasa-learning-academy
git pull --ff-only origin dev/g2-4-auth-security-hardening
.\node_modules\.bin\tsc.cmd --noEmit
node --test tests/g248-token-flow-http-probe.test.mjs
npm.cmd run test:smoke
$env:G24_ALLOW_LOCAL_HTTP_TEST = 'yes'
$env:G24_ENABLE_LOCAL_RATE_LIMIT = 'yes'
try {
  node --env-file=.env.local --import tsx scripts/test-g248-token-flow-http.ts
} finally {
  Remove-Item Env:G24_ALLOW_LOCAL_HTTP_TEST -ErrorAction SilentlyContinue
  Remove-Item Env:G24_ENABLE_LOCAL_RATE_LIMIT -ErrorAction SilentlyContinue
}
```

This proves **HTTP-level** token-in-body flows, not browser hydration or automatic URL-fragment removal. That browser check still needs a real local browser session. Do not print or share token values or reset URLs. For the test only, confirm `G24_RATE_LIMIT_SECRET` is configured locally and never paste it into chat. The Next.js server must be restarted if its rate limiter was previously disabled.

## Latest local verification report — 2026-11-26

The maintainer reported **ALL PASS** after correcting the missing local `G24_RATE_LIMIT_SECRET` configuration and rerunning the G2.4.8 HTTP integration. This is a reported outcome; the final post-fix terminal transcript and precise HTTP statuses were not supplied in the latest message. The immediately preceding captured run had TypeScript and all 298 smoke tests passing, but its HTTP integration was blocked before execution because the rate-limit secret was missing. The subsequent report indicates that blocker was resolved and the test succeeded.

**Still open:** Actual browser hydration/fragment removal test with a fresh link, trusted network/IP rate limits, account-enumeration review, and the production-release security gate. No production merge or deployment authorized.
