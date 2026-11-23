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

## G2.3 Email transport — Resend (local development only until approved)

The official `@payloadcms/email-resend@3.93.0` adapter is included as an exact-match dependency alongside Payload `3.93.0`. It is activated only when **both** `RESEND_API_KEY` and `RESEND_FROM_ADDRESS` are present. The local registration endpoint now returns 503 *before creating a learner* if either is absent. A configured adapter does not prove the sender domain or API key works; test delivery.

1. Create a Resend account at https://resend.com and obtain a server-side API key. For a development smoke test, Resend's `onboarding@resend.dev` test sender can typically send only to the email associated with your Resend account; for real learner addresses, verify a sending domain in Resend first.
2. Open the local `.env.local` (never commit or paste secrets). Preserve `DATABASE_URL` pointing to `127.0.0.1:5432/kasa_academy_dev`, username `kasa_dev`. Set:
   ```ini
   RESEND_API_KEY=<your-private-resend-key>
   RESEND_FROM_ADDRESS=onboarding@resend.dev
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   Replace `RESEND_FROM_ADDRESS` with an address on your verified domain when ready.
3. Install the pinned adapter and synchronize your **local** lockfile: `npm.cmd install --save-exact @payloadcms/email-resend@3.93.0`. Do not commit or deploy an unreviewed lockfile.
4. Restart the local development server after saving environment variables. In the **same** PowerShell session:
   ```powershell
   $env:G2_ENABLE_LOCAL_SIGNUP = "yes"
   npm.cmd run dev
   ```
5. Navigate to `http://localhost:3000/signup` and use a **new disposable test email address** eligible under your Resend sender configuration. Previously created unverified accounts will not automatically receive a new verification email from installing the adapter.
6. Follow the verification link in the received email, then sign in at `/login`. Inspect Resend's dashboard if no email arrives. Never share the API key or verification/reset URL.
7. Run `node --test tests/g23-email-adapter.test.mjs`, `node --test tests/g23-signup-closed.test.mjs`, and `npm.cmd run test:smoke`. Also run `npx.cmd tsc --noEmit` with compatible Node 24 and installed packages. Passing these static tests **does not** prove end-to-end delivery.

### Remaining release blockers

Keep `G2_ENABLE_LOCAL_SIGNUP` **unset outside disposable local development**. Do not enable public registration: shared rate limits, enumeration behavior, retry/resend-verification, duplicate-record behavior, verification expiry, concurrent signup, HTTP/browser tests, and credential configuration in an authorized deployment still need reviews. Do not log email tokens or passwords. Do not bypass email verification to make login succeed.
