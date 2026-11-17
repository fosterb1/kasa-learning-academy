# Kasa Learning Academy architecture

## Separation of concerns

`fosterb1/kasa_programming_language` is the source of truth for the **language**, reference interpreter and native compiler. This repository hosts the **learning platform**. Code examples should be kept consistent with Kasa's published syntax and tested against the browser runtime.

- Next.js serves public pages and Payload's `/admin` UI.
- PostgreSQL stores CMS content and administrators.
- Payload collections: `modules`, `lessons`, `challenges`, `guides`, `announcements`, `users`.
- Public content is explicitly filtered to `_status = published` in every public server query and through collection read-access rules. Admin account management and content mutations require authentication.
- Lesson code runs in a browser Web Worker using a vendored Kasa JS interpreter. Nothing from the editor is uploaded to the server. The Web Worker is terminated after a timeout. This does **not** make a formal security sandbox.
- Learner completion state is stored in the visitor's localStorage. No signup, analytics or learner profile exists in this MVP. Clearing localStorage erases progress.

## Administrative workflow

An authorized administrator visits `/admin`, creates a module/lesson/challenge/guide, saves a draft, previews the content within the CMS, and clicks Publish. Publication is stored in PostgreSQL; the public site reads it dynamically without needing a code deployment.

There is no public registration: `users.create` requires an authenticated administrator. The first administrator is bootstrapped through a one-time CLI script with credentials supplied via local environment variables. No bootstrap HTTP endpoint exists.

## Deployment prerequisites

Host a Node.js server running Next.js plus a managed PostgreSQL database (Railway, Render, a suitable VPS or another compatible host). **Netlify Drop static hosting cannot run the CMS backend or PostgreSQL.** The old Kasa Playground can stay on Netlify independently.

Before production: provision Postgres with backups, generate a cryptographically random `PAYLOAD_SECRET`, configure TLS, seed the administrator, run the content import, and verify admin authentication and public draft filtering.

## Language/runtime synchronization

`public/kasa-runtime.js` is a snapshot of the JavaScript interpreter from `fosterb1/kasa_programming_language`. When the language repository changes semantics, update this file and run the lesson conformance smoke test. Keep the version linked to a specific commit in release notes; do not hotlink cross-origin JavaScript in a programming editor.

## Limitations

- CMS runtime and production deployment are not verified until dependencies are installed and Postgres is available.
- No password reset email service, media upload, student accounts, server-side grading, search indexing, or localization yet.
- Draft review is available through Payload's admin/version views; the public site deliberately does not expose private preview URLs in this first version.
- Learner quiz answers are client-side feedback, not exam-grade assessment.
