# G2.1 Learner Identity — first implementation checkpoint

**State:** development branch only, unmerged, integration testing pending (2026-11-22).

## What is implemented
- A separate Payload `learners` authentication collection, not the CMS `users` administrator collection. The `/admin` login continues to use `users`; students have `admin: () => false`.
- Learners must verify their email before logging in. A custom verification email points to `/verify-email?token=...`, whose browser screen uses Payload's built-in verification endpoint.
- `/login` uses Payload's built-in login operation and same-origin HttpOnly cookie handling. `/profile` reads the learner's own `/me` and allows editing only displayName, bio and preferredLanguage. Logout uses the built-in collection endpoint.
- Public registration is deliberately disabled. Neither this branch nor the current production Academy supports student signup yet. No certificates or database-backed progress are implemented here.

## Security gates to complete before public registration
1. Configure a production transactional email adapter for verification, reset and anti-enumeration flows. The default console email adapter is **not suitable** for real learners.
2. Implement a narrowly scoped registration endpoint, shared multi-instance rate limiting and anti-bot controls; allowlisted inputs only; enforce strong password validation and email normalization. Do not simply open the generated collection POST API.
3. Add complete password reset + email verification resend UX, owner-only integration tests, CSRF/cookie checks, logout/session revocation, email update verification and account recovery handling.
4. Add reviewed **additive** PostgreSQL migration for `learners` and associated auth tables only. Do not run a schema push or an unreviewed migration in production.
5. Run tests with two separate learners, one CMS admin and one anonymous client. Prove learners cannot read/edit any other account or reach `/admin`; admins retain their existing CMS rights.
6. Test authorization and session behavior behind the real HTTPS hosting and proxy environment. No production-ready authentication claim before this is verified.

## Testing
```bash
git fetch origin
git switch --track origin/g2-learner-auth-foundation
node --test tests/g2-learner-auth-foundation.test.mjs
npm run test:smoke
npm run build
```

Keep local Cloud Shell settings (e.g. `next.config.mjs` allowedDevOrigins) and `.env.local` private. The Cloud Shell disk may need `rm -rf .next` with Next.js stopped, as its home filesystem has a small quota.

## Non-goals
- Public signups, reset email sending, certificate issuance, graded course completion and cross-device progress are not yet available.
- No edits to existing CMS users, lessons, video or transcripts, seed data, Studio runtime or native Kasa language.

## Database-backed auth integration (development only)

The initial database schema and learner tables were independently applied in the Cloud Shell **development** database on 2026-11-22, with four migrations marked as ran (the previous local CMS content was not preserved when the database disappeared). The migration SQL is committed in this PR, but production has **not** been migrated.

Once the branch contains the latest auth integration script and Node 24 is selected, run:

```bash
cd ~/kasa_programming_language/kasa-learning-academy
git switch g2-learner-auth-foundation
git pull --ff-only origin g2-learner-auth-foundation
npx payload migrate:status
G2_ALLOW_DEV_AUTH_TEST=yes npm run test:g2-auth
npm run test:smoke
npm run build
```

Safety: `test:g2-auth` refuses any remote database, database other than `kasa_academy_dev`, user other than `kasa_dev`, production NODE_ENV, or missing explicit `G2_ALLOW_DEV_AUTH_TEST=yes`. It creates two ephemeral @example.invalid accounts with random passwords, verifies their email tokens through Payload locally, exercises login and owner-only restrictions, and removes its own fixtures in a `finally` block. The script must **not** be run in production or against a shared database.

The command tests Payload's **Local API** access boundary and verified-login behavior. It is not yet a browser/cookie integration test, CSRF test, production email-delivery test or proof that public registration is safe. No real learner credentials or reset tokens should be printed or pasted into chat.

Before enabling registration, add separate route-specific throttling, email delivery with a verified sender, email normalization, password reset/recovery and browser session tests.
