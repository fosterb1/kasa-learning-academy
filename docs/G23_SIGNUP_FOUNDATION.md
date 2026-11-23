# G2.3 — local-only learner signup foundation

Status: **experimental; public signup closed**. Branch: `dev/g2-3-secure-learner-signup`.

## Delivered

- Student-facing `/signup` form with name, email, password confirmation and language preference.
- A separate `/api/learner-registration` POST route with field allowlisting, same-origin check, bounded JSON input, and local-only development authorization.
- The original Payload `learners` collection still denies public creation; the dedicated route uses privileged creation **only** when all local gates match.
- The HTTP response deliberately never includes verification tokens or account details.
- Guests can still use the public learning resources.

## Testing locally

Use ONLY the disposable local PostgreSQL `kasa_academy_dev` as user `kasa_dev`. The normal `.env.local` must contain a unique Payload secret. The app's `NEXT_PUBLIC_SITE_URL` should be `http://localhost:3000` for local email links.

By default, the endpoint returns 503. For controlled local testing only, start the development server in the same PowerShell session with:

```powershell
$env:G2_ENABLE_LOCAL_SIGNUP = "yes"
npm.cmd run dev
```

Visit `http://localhost:3000/signup`. The default local console email adapter may print verification links to terminal output: **do not share these tokens**. Stop the server and unset the flag when testing finishes.

Run `node --test tests/g23-signup-closed.test.mjs` to verify structural safeguards; additionally run `npm.cmd run test:smoke` and execute real browser + local API tests before release.

## Blockers to public opening

1. Shared distributed rate limiting for signup, verification, login, and recovery.
2. Production transactional mail adapter, sender domain, observability without token leakage.
3. Abuse prevention, account enumeration analysis, CSRF/cookie/session verification, accessible browser tests.
4. Tests of duplicate emails, concurrent signup, email verification expiry, and repeated attempts.
5. Independent security review, deployment environment review, controlled merge.

**No merge, public signup activation, or security certification is implied by this foundation.**
