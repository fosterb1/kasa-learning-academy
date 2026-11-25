# G2.4.4 checkpoint — recovery threshold passed, session lifecycle pending

On 2026-11-25 the maintainer reported:
- TypeScript `tsc --noEmit`: no errors.
- `tests/g24-recovery-http-probe.test.mjs`: 2 passed.
- `npm.cmd run test:smoke`: 282 passed, 0 failed.
- `scripts/test-g24-recovery-http.ts`: PASS, sixth request to localhost forgot-password returned HTTP 429 with a disposable nonexistent address.

These are local development outcomes, not evidence of production readiness.

## Next gate: sessions and token lifecycle

The existing `scripts/test-g2-learner-recovery.ts` exercises invalid and reused reset tokens, old/new passwords and cleanup with temporary local learners. It does **not** prove browser-session invalidation, expiry boundary, or protection of access logs. Do not run it against production or with real recipient emails.

1. Build a controlled local fixture that creates a temporary learner with `disableVerificationEmail: true`, verifies account through Payload Local API, and cleans up on failure.
2. Replace real outgoing transactional email with a deterministic test adapter for all recovery fixtures before executing repeated requests.
3. Record pre-reset browser-session identity, issue a reset using a test-only token, verify old password fails and new password succeeds. Check whether the *old session cookie/token* remains valid. If it does, explicitly design revocation rather than asserting it was revoked.
4. Verify reset token cannot be reused and expired token fails without waiting for a long clock delay (controlled DB fixture / injected clock).
5. Test logout and session invalidation via HTTP in a disposable browser context, never the maintainer account.
6. Review Next.js development/proxy logs: previous HTTP request logs contained the `?token=` query string. Never paste raw token logs, and implement/redact logging before public release.

Additional blockers: trusted proxy/IP throttling, rate backend outage returning 503 rather than 429, known-vs-unknown account privacy, verify-email throttling, and production mail domain. Public signup remains closed.

**No schema change, merge, deployment or paid service in this checkpoint.**
