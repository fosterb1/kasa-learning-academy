# G2.4 — Learner authentication security release gate

Status: **review in progress / public signup CLOSED**. Branch: `dev/g2-4-auth-security-hardening`.
Base: G2.3 local verification, login and recovery tested by maintainer. **Do not equate local success with production security.**

## Non-negotiable invariants

- `learners` is distinct from CMS `users`; public collection create remains denied.
- Signup route remains explicitly restricted to disposable `kasa_academy_dev` on loopback in nonproduction.
- No account enumeration via divergent responses, request timing, or delivery feedback on a future public endpoint.
- Do not log raw `token` URL query values, authentication cookies, passwords, reset tokens, API keys or full reset URLs.
- Production must have configured and tested verified-domain transactional email delivery and shared, atomic, distributed rate limits before any public activation.
- Native and browser Studio integrity manifest must be preserved byte-for-byte on Windows and other platforms; don't rewrite checksums to hide line-ending conversions.

## Phase gates and acceptance criteria

| Gate | Required proof | State |
|---|---|---|
| 1. Local flow | Sign up, receive email, verify, log in, reset, log in again | Maintainer reported passed |
| 2. Secret handling | Redacted URL/access logging, no tokens in telemetry, verified secret configuration | Open |
| 3. Enumeration | Unknown/known/repeated email same outward recovery response, rate-limited | Open |
| 4. Abuse | Distributed limits for IP + account across all signup/verify/recovery/login endpoints | Open |
| 5. Session | Logout clears cookie; password reset invalidates prior sessions; CSRF and cookie flags tested | Open |
| 6. Token lifecycle | Invalid/reused/expired verification and reset links; 30m expiry; concurrent attempts | Open |
| 7. Mail | Domain ownership and Resend delivery + failure feedback verified, no test-sender restrictions | Open |
| 8. Browser | Real browsers, accessibility, multi-account isolation, test cleanup, error paths | Open |
| 9. Release | All tests pass, owner-reviewed PR, database backups/rollback plan, configuration audit | Open |

## Design rules for next implementation batch

1. Choose a shared limiter using existing infrastructure and enforce atomic counters on the server. No process-local `Map` as production security; don't introduce a recurring paid service without explicit cost approval.
2. Use opaque server-derived keys (e.g. HMAC over normalized account identifier) instead of raw emails in limiter storage. IPv6 handling and proxy trust need a documented policy.
3. Explicitly specify fail-closed behavior if storage is unavailable; ensure resource exhaustion does not leak existence.
4. Evaluate canonical same-origin/CSRF enforcement, payload body-size limits, password-reset link redaction and cookie revocation before merging.
5. Maintain developer-only API gates; never test real abuse traffic on production.
6. Keep an evidence log for each fixture: allowed, denied, concurrent, repeated, expired, invalid, production-disabled, isolated.

## Observed caveat

The G2.3 local signup endpoint currently replies 202 when a new account is created and 400 on some errors including duplicate email. That response distinction must not be exposed as a public registration feature. The local recovery form previously reported non-429 errors as successful and was corrected on G2.3; rerun tests after merging any code.

## Next planned implementation

- Review available Neon/Postgres vs Redis rate-limit providers for no-new-billing constraint.
- Implement server-side request throttling on a *separate reviewed commit*, with negative tests.
- Add a server log redaction strategy for `/reset-password?token=...` and `/verify-email?token=...`; test the actual logger.
- Run independent Windows local integration and real-browser tests before requesting merge.

Production signup remains disabled. Neither merging this document nor passing static tests opens it.
