# G2.4.3 — Payload learner auth hook checkpoint

**Status:** committed for Windows local testing; unverified end-to-end. Not production-ready.

## Implemented

- Learner collection `hooks.beforeOperation` checks the same PostgreSQL HMAC counter before `login`, `forgotPassword` and `resetPassword` operations.
- This hook is opt-in via `G24_ENABLE_LOCAL_RATE_LIMIT=yes`. When unset it does nothing, so existing developer flows remain usable.
- The limiter itself denies calls not running against the dedicated local PostgreSQL `kasa_academy_dev`, or with missing/invalid secret or counter table.
- The collection is distinct from CMS admin Users; the hook does not attach to administrator login.
- Failed-limit path raises a generic HTTP 429. Do not log or share raw reset links or tokens.
- The `beforeOperation` boundary was selected because `beforeLogin` runs only after password credentials have been checked. Hook names follow Payload's documented operations.

## Critical limitations

1. This is an **account-only** limiter and can be evaded with multiple email addresses. Network-level limits need a trusted reverse-proxy policy and tests.
2. `verifyEmail` is not yet protected by this hook: its operation argument shape and route must be verified independently.
3. The limiter currently collapses unavailable DB/secret and genuine rate exhaustion to 429. Production requires a distinguishable 503 for backend failure, without account enumeration.
4. A rotating `G24_RATE_LIMIT_SECRET` changes account buckets. Use the *same* secret throughout a single local integration test and server lifetime, and never store it in source.
5. Source tests are guardrails, not proof of true HTTP 429 or account safety. Verify normal login and recovery first; then run **only local, no-email** repeated failed login tests against disposable accounts. Do not repeatedly use live Resend.
6. Verify the Payload 3.93.0 hook operation names with local runtime observations and integration tests. Do not merge based on source-only checks.
7. Public registration remains disabled. G2.3 login/account verification remains the known-good fallback with G24 gate disabled.

## Windows checkpoint

Stop `npm.cmd run dev`. Ensure your current branch is `dev/g2-4-auth-security-hardening`, then:

```powershell
git pull --ff-only origin dev/g2-4-auth-security-hardening
.\node_modules\.bin\tsc.cmd --noEmit
node --test tests/g24-learner-auth-hook.test.mjs
npm.cmd run test:smoke
```

After tests pass, keep the same local DB and generate a **new temporary session secret** before launching the dev server:

```powershell
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$b = New-Object byte[] 32
try {
  $rng.GetBytes($b)
  $env:G24_RATE_LIMIT_SECRET = [BitConverter]::ToString($b).Replace('-', '').ToLowerInvariant()
} finally { $rng.Dispose() }
$env:G24_ENABLE_LOCAL_RATE_LIMIT = 'yes'
npm.cmd run dev
```

Check an existing verified learner can log in, view profile, request **one** recovery email (observe Resend's account restrictions), and complete reset. Do not use repeated real password-reset requests to force 429.

If the app errors, stop server and unset `G24_ENABLE_LOCAL_RATE_LIMIT`; restart to restore G2.3 behavior. Never disable local DB validation or change CMS credentials to work around test failures.

## Next

- Add isolated test harness for repeated wrong-password attempts and definitive HTTP 429 proof using disposable local accounts.
- Implement recognized proxy/IP rate limits and fail-closed diagnostics.
- Validate/reset URL privacy and token lifecycle.
- Add dedicated `verifyEmail` coverage and browser regression evidence.
