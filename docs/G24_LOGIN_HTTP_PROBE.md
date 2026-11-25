# G2.4.3 — Controlled HTTP 429 verification

The maintainer confirmed live login/profile and password recovery pass with the local limiter enabled. This does **not** yet verify enforcement of the threshold.

`scripts/test-g24-login-http.ts` provides a bounded localhost-only HTTP check against a unique, nonexistent learner email. No existing account is targeted, and no mail or registration requests are made. It sends 21 sequential invalid-login requests to `/api/learners/login`. All first 20 responses must be non-successful and non-429; request 21 must produce HTTP 429. A failure is evidence requiring diagnosis, not authorization to weaken security.

## Windows instructions

Ensure you are on `dev/g2-4-auth-security-hardening`. First pull and run:

```powershell
git pull --ff-only origin dev/g2-4-auth-security-hardening
.\node_modules\.bin\tsc.cmd --noEmit
node --test tests/g24-login-http-probe.test.mjs
npm.cmd run test:smoke
```

In your existing development-server PowerShell window, ensure the server is running with **both** `G24_ENABLE_LOCAL_RATE_LIMIT=yes` and a valid `G24_RATE_LIMIT_SECRET` from before the server was started. The existing verified login and recovery checks must already pass. Do not paste the secret.

In **another** PowerShell window:

```powershell
cd C:\Users\User\kasa-learning-academy
$env:G24_ALLOW_LOCAL_HTTP_TEST = 'yes'
node --env-file=.env.local --import tsx scripts/test-g24-login-http.ts
Remove-Item Env:G24_ALLOW_LOCAL_HTTP_TEST -ErrorAction SilentlyContinue
```

If the server uses port 3001, add `$env:G24_TEST_ORIGIN = 'http://localhost:3001'` before the test, and remove that variable afterward. Do not use a public hostname, Vercel, Neon, or Resend. This test writes only small security-counter records in the dedicated localhost database.

Report HTTP status history **only** if a test fails; never share passwords, cookies, real learner emails, or reset/verification tokens. The probe's password is an intentionally invalid fixed test string.

Passing source-level tests only checks test safety and structure. The real HTTP probe is required to claim the hook actually rate limits failed login operations. An exhausted counter on this disposable identity will expire according to the fixed 15-minute window. The current limiter is account-only, so production abuse protections remain incomplete.
