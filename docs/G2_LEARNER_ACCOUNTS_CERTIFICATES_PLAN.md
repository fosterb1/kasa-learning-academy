# G2 — Learner identity, verified progress, assessments and certificates

Status: **DESIGN ONLY — NOT IMPLEMENTED; no production migration approved**  
Date: 2026-11-22  
Scope: Kasa Learning Academy (not the native Kasa compiler)

## Baseline verified
- Payload `users` is the **administrator** auth collection, with admin-only create/read/update/delete. Never make this public.
- Course completion and the `/my-learning` dashboard currently use browser-local storage and self-reported study markers. They cannot qualify someone for a verified certificate.
- The JavaScript Kasa worker runs exercises in the learner's browser; a self-reported result or client-supplied test pass is **not trusted server evidence**.
- Existing published CMS modules, lessons, video URLs/transcripts and Studio are to be preserved.
- November 2026 Cloud Shell acceptance testing confirmed loading, worker boot, Run, Check, manual progress and dashboard updating in a browser; it did **not** establish production authentication, grading or certificate readiness.

## User-facing journeys
1. **Register** at `/signup` with display name, email and password; confirm an email ownership token before account activation. Do not expose which email addresses have accounts in password-reset responses.
2. **Login** at `/login`, **logout** from the authenticated navigation, initiate **forgot password** and reset via a one-use, expiring token. Use Payload's maintained auth/session primitives rather than home-built password hashing.
3. **Profile** at `/profile`: learner-controlled name, optional avatar, bio, locale/language preferences; email changes require fresh verification, and passwords require reauthentication or a reset flow. Keep public profile visibility opt-in.
4. **Enrollment and progress**: choose a learning path; store lesson completions, timestamps, assessment attempts and progress in PostgreSQL keyed to authenticated learner ID, never mutable by supplying another user's ID.
5. **Certificate** at `/certificates`: available only after server-side eligibility checks. Download accessible printable PDF with learner name, path/version, award date and opaque verification ID. Verify via `/verify/[id]` using a minimal public claim, not private account data. Support revocation/correction.

## Design boundaries
- Keep `users` administrator-only. Add a distinct Payload auth collection, e.g. `learners`, with no `/admin` privileges. Explicitly restrict admin UI and CMS content mutation.
- Registration: public create permitted only through a narrowly scoped and rate-limited route with explicit allowlisted fields; no client-controlled role, verified flag, certificate status or arbitrary relationships. Use server-side validation. Verify production CSRF/CORS, secure HTTP-only cookies, HTTPS and anti-automation controls.
- Learner read/update/delete: owner-only using server-derived authenticated identity; admins may have separate explicit support operations, audited. Never use `overrideAccess: true` for anonymous user operations.
- Profiles must not publicly expose email, session information, or authentication metadata.
- Progress records uniquely constrained by learner + canonical lesson ID + lesson/content version; server ownership checks on every API call. Support migration of browser-local study markers only as **unverified historical notes**, never graded progress.
- Assessment records contain canonical challenge version, server-side test results and scoring policy. Browser editor feedback is instructional, not authoritative. For arbitrary untrusted programs, use a genuinely sandboxed and resource-limited grading service before awarding graded passes; do **not** execute arbitrary code in the Next.js/Payload server.
- Certificates are issued transactionally and idempotently only for a qualifying completion state, not on a client command. Persist issuance events, path/version, policy/version, verification code, immutable issuance time and revocation status. Verification should reveal minimum necessary data, avoid guessable incremental IDs, and not claim university accreditation.
- Distinguish **Certificate of Completion** (verified course completion as defined in policy) from any future **Certificate of Assessment** (independently graded test). The former may not imply professional certification or external accreditation.

## Proposed schema (requires additive reviewed migrations)
- `learners`: email unique, displayName, auth fields managed by Payload, emailVerified, optional avatar/bio/language, privacy preferences; no admin access.
- `learning_paths`: stable slug, published status, version, ordered required lesson IDs, passing score, assessment policy.
- `enrollments`: learner relation, learningPath relation, enroll date, current state.
- `lesson_progress`: learner, canonical lesson, version, completion type (self-reported vs verified), timestamp, evidence reference; unique composite key.
- `assessment_attempts`: learner, challenge, version, result, tests/policy version, awarded score, attempt timestamp; server created.
- `certificates`: learner, learning path/version, issuedAt, opaque public verification token, achievement/policy version, status (active/revoked), revocation metadata; unique issuance eligibility key.

## Release increments and acceptance gates
### G2.1 — Learner identity (first implementation)
- Separate learner collection, safe registration and email verification, login/logout, reset password, private profile update and authenticated navigation.
- Owner-only authorization tests; CSRF/session/cookie tests; rate limit and email enumeration checks; admin role separation tested.
- Local development mailbox/log adapter acceptable for testing **only**; a production transactional email adapter is required before launching signups.
- Existing CMS admins still log in; anonymous curricula remain public.

### G2.2 — Server progress and enrollments
- Add published learning-path model and enrollment/progress records.
- Keep legacy local progress visible, clearly distinguished until user explicitly imports unverified history.
- Test second-user isolation and cross-browser persistence; no student can edit another's data.

### G2.3 — Assessment trust boundary
- Separate instructional browser output matching from authoritative grading.
- Implement test definitions, submission limits and a hardened sandbox; failure modes and passing thresholds documented per path.
- No certificates issued from client-provided booleans or scores.

### G2.4 — Certificate issuance and verification
- Define completion policy, path versioning, review and revocation.
- Generate accessible printable PDF only after eligibility; never trust learner-provided name or course metadata without validation.
- Public verification route shows only approved display name, path, issue date, active/revoked state; opaque IDs; no private learner profile.

### G2.5 — Academy UX and release
- Sign up, login, logout, settings, enrollments, certificates and share links integrated with accessible responsive UI.
- End-to-end tests in Cloud Shell plus production-like staging with migrations, mail, HTTPS and multiple accounts.
- Record in development journal and only merge after independent verification; **never** direct-run a new unreviewed migration on production.

## Constraints and explicit non-goals for this checkpoint
- This document does not implement any signup form, auth route, PDF issuance, grading engine or migrations.
- No production-security or accredited-certificate claims.
- The local Cloud Shell Next.js `allowedDevOrigins` setting must not be committed as a hard-coded deployment hostname.
- Retain Kasa Studio's experimental module opt-in; do not merge unrelated G0.5 changes.

## Next implementation preparation
1. Inspect current Payload auth API/session cookie configuration for v3.93 and deployment settings.
2. Add learner collection under strict isolation and explicit typed access functions.
3. Implement registration/email verification/session/Profile pages, tests and additive migration on the feature branch.
4. Run `npm run test:smoke`, `npm run build`, database integration and browser acceptance tests before PR review.
