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

## Cloud Shell gate finding (2026-11-21): known existing Studio manifest drift

The owner ran the Academy branch at `92653b84a6c010365587e2ddae59c636a78520d8`:

- `node --test tests/academy-learning-progress.test.mjs`: **4 pass / 0 fail**
- `npm run test:smoke`: **165 pass / 1 fail**. Existing
  `tests/academy-studio.test.mjs` identified a Studio `app.js`
  byte-size mismatch: **15,188 actual versus 13,990 in the release
  manifest**. This is not a failure in the new My Learning tests.
- `npm run build` invoked the existing
  `scripts/sync-studio-release.mjs` and successfully regenerated
  Studio asset hashes; its 11 focused pre-build tests then passed.
  The build stopped at **`payload: command not found`**, which indicates
  dependencies have not been installed in this new Cloud Shell clone.
- After that build, `git status --short` displayed only
  `M public/kasa-studio/release-manifest.json`.

**Do not blindly commit newly generated hashes:** refreshing a release
manifest verifies internal file/hash agreement but does not establish that
the deployed Studio files are the correct, approved publisher assets.
Before approving the manifest change, inspect `git diff -- public/kasa-studio/release-manifest.json`
and compare any changed Studio files and hashes to the reviewed publisher
release. The manifest currently carries the older
`academy-4c1-diagnostics` release name. A regenerated hash is not by
itself evidence of a new reviewed release.

To resume tests in this **existing** cloned Academy directory:

```bash
cd ~/kasa_programming_language/kasa-learning-academy
git status --short
git diff -- public/kasa-studio/release-manifest.json
node --version
npm install
node --test tests/academy-learning-progress.test.mjs
npm run test:smoke
npm run build
git rev-parse HEAD
git status --short
```

Review the drift before running `npm run build`, because that command
**rewrites the release manifest as part of its pre-build process**.
If the installed Payload build requires database credentials, set up
the documented development-only `.env.local` and local PostgreSQL,
without exposing production credentials or triggering migrations
against production. `npm install` does not itself approve or commit
a lockfile; review the resulting `package-lock.json` if generated.

**PR stays draft and unmerged** pending dependency setup, end-to-end
build, Studio release asset provenance review, and a manual learner UX
check. This checkpoint makes no change to published content or hosting.
