# Academy learner experience upgrade — device-local progress

**Status:** draft development branch, independent verification pending.
**Deployment:** not performed. **Database migrations:** none.

## Existing architecture reviewed

Kasa Academy already serves published lessons and modules through
`src/lib/content.ts`, with Payload CMS and PostgreSQL. Individual
lessons use `src/components/CompleteLesson.tsx` to store completion
in the learner's browser under `kasa-academy-completed-v1`.
The learning page, syntax curriculum, first-party Studio, transcripts,
quizzes and the existing CMS are separate features. No student account
or server-side progress record exists.

## Upgrade implemented

- New public `/my-learning` page built from **published CMS lessons**
  (or the existing intentionally bounded unseeded fallback).
- Client component `LearningProgress` displays completed lesson count,
  percentage, estimated minutes based on the existing lesson duration
  estimate, a next-lesson link and a searchable lesson list.
- A completion action now dispatches an in-tab progress event, while
  the dashboard also listens for cross-tab localStorage changes.
- Completion keys are restricted to actual lesson slugs from the
  current published lesson list. Corrupt browser storage fails closed to
  an empty completion display; no private learner data leaves the browser.
- `/my-learning` is linked from global navigation and the public
  curriculum, with responsive CSS, keyboard focus, accessible
  progress semantics, and empty/search states.
- `tests/academy-learning-progress.test.mjs` verifies these boundaries
  without requesting database credentials.

## Deliberate non-goals

No CMS schema or migration, authentication, learner registration,
cloud sync, backend analytics, automatic certificates, AI grading,
content reseeding, student payments, transcript provider changes,
Playground release-manifest change or deployment. The device-only
progress is lost on browser storage clearing and does not transfer
between devices. “Minutes completed” is the **sum of nominal lesson
durations**, not recorded study-time telemetry.

## Local verification

In Google Cloud Shell or a machine with the matching Node runtime:

```bash
git clone https://github.com/fosterb1/kasa-learning-academy.git
cd kasa-learning-academy
git fetch origin
git switch dev/academy-learning-progress-upgrade
node --version
node --test tests/academy-learning-progress.test.mjs
npm run test:smoke
npm run build
git rev-parse HEAD
git status --short
```

If the checkout already exists, skip `git clone`. The existing
`npm run build` requires configured environment/dependencies and
may require the documented Payload/Postgres setup. Do not label a
missing environment or skipped test as PASS.

Manual UX validation on a suitable local dev instance:

1. Visit `/my-learning` before completing lessons. Check zero count
   and next-lesson link.
2. Open the first published lesson, mark it complete and return to
   `/my-learning`. Verify count, percentage and next lesson changed.
3. Search by a lesson title and module. Clear search; check keyboard
   navigation and mobile viewport.
4. In another tab mark a lesson incomplete and check that the dashboard
   reflects the change. Reload to confirm browser-local persistence.
5. Verify `/admin` still shows the existing CMS and that videos,
   lessons and Studio are unchanged.

Review before merging PR. **No Vercel or Netlify deployment is
authorized by these source changes.**
