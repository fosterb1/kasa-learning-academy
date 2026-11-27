# G2.2 learner password recovery foundation

Status: **DRAFT / DEVELOPMENT ONLY**. This branch is based on the unmerged G2.1 learner-auth feature branch and must not be merged independently.

## Implemented

- Separate learner-only password recovery pages: `/forgot-password`, `/reset-password?token=...`.
- Links from the existing learner login screen.
- Payload `learners` auth configuration for reset-email subject and link template, token expiration 30 minutes, per-account email request interval 60 seconds.
- UI asks for matching passwords at least 16 characters (client-side only; **server-side minimum length remains a launch blocker**).
- Request screen uses generic messages to avoid revealing whether an account is registered; reset token errors are generic.
- Public registration remains denied through collection create access. CMS administrator identities remain separate.

## Required review and testing

```bash
git fetch origin
git switch g2-2-learner-recovery-foundation
node --version
node --test tests/g2-learner-recovery.test.mjs
npm run test:smoke
npm run build
```

In an isolated local dev database, request a reset for an existing **temporary learner** through `/forgot-password` and copy the verification/reset link from the dev server console only. With no mail adapter configured, Payload logs emails to the console; **this is not deliverable email**. Confirm bad/expired tokens do not change the password, valid reset token can change it, old password no longer works, new password works, and that a learner still cannot authenticate to the CMS. Do not paste reset tokens or passwords into a shared conversation.

## Required before any public release

- Configure and test transactional email sender and deliverability.
- Apply **distributed** route-specific throttling, total email send budgets, IP/identity safeguards, abuse detection and alerting. Payload's per-account `minRequestInterval` is not enough.
- Enforce password policy on the **server** including reset and registration (client-only minimum is not security enforcement).
- Verify authentication cookies, CSRF posture, logout, session expiration, reset token reuse prevention, email enumeration resistance (including HTTP statuses and timing), and privacy of links in browser history and referrers.
- Decide and implement secure public registration; this PR deliberately **does not** activate it.
- Run database-backed integration and browser acceptance tests before marking production-ready. Static smoke checks are not sufficient.

No schema migration is expected from this change; the existing learner auth tables already include reset token fields.
