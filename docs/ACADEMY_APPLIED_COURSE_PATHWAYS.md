# Academy course expansion — Applied Programming Pathways

**Status:** Source committed, independent verification pending. No merge, no deployment.
**Repository:** `fosterb1/kasa-learning-academy` (not the compiler repo).

## Existing course audit

The Academy already has:
- 18 beginner foundations chapters.
- 16 syntax lessons and an optional experimental-imports lesson.
- 24 prepared CMS-seeded Kasa lessons with video/transcript fields, quiz and editor.
- 13 prepared challenges, a capstone/project catalog and a native-WASM Studio.
- The separate `/my-learning` progress-dashboard prototype remains in **draft PR #10** with its own outstanding Studio-manifest/dependency verification.

These are separate learning surfaces. Publishing new JSON/Next editorial pages
**does not** modify a learner's installed browser runtime, update published
Payload/Postgres lesson documents, seed new CMS content or refresh Studio assets.

## Implemented in this PR

- A four-stage learning-pathway panel on `/learn`:
  foundations → core syntax → applied labs → independent projects.
- New `/learn/applied` course overview and five individual `/learn/applied/[slug]` lab pages:
  **market receipts**, **student marks**, **inventory reorder**,
  **lists as tables**, and **positional records / validation**.
- Each lab provides a learning outcome, core-Kasa source program, expected
  output, step-by-step trace, independent assignment, acceptance checklist,
  review question and explanation, and previous/next navigation.
- Each lab page mounts only **one** embedded `Playground`, running its **core Kasa** example in the existing first-party JavaScript worker, avoiding unnecessary simultaneous workers and repeated editor IDs. This does not claim G1.4/G1.5
  source-only helper imports are available in normal lessons.
- Links from home, top navigation and `/learn` to the applied course.
- Responsive, keyboard-friendly CSS.
- `tests/academy-applied-course.test.mjs` checks data quality,
  page integration and exact outputs by executing the actual Academy
  JavaScript Kasa runtime. Included by existing `npm run test:smoke`.

## Scope and accuracy limits

- Course content is **bundled editorial JSON**, not additional CMS-seeded
  lesson rows. This avoids touching existing teachers' lesson drafts,
  videos, transcripts and learner-facing published records.
- Source-only experimental G1.4 tables, G1.5 records and host-side
  G1.6 typed validators are introduced as *ideas*. Their utility APIs
  are not available in the embedded lesson editor or pinned standard
  imports. The course examples run using core lists, arithmetic,
  indexing, loops and conditionals.
- Output comparison is teaching feedback, not a secure hidden-test grader,
  formal assessment, certificate or production accounting computation.
  Numeric money examples use integer minor currency units.
- The existing first-party Studio bundle and release manifest remain
  unchanged by this PR. The mismatch previously observed in PR #10
  (app.js size 15188 vs manifest 13990) is an independent release
  integrity issue, **not resolved by this course PR**.
- No new student accounts, CMS schema/migrations, seed writes, external
  transcription service, package dependencies or deployment.

## Google Cloud Shell test gate

From a clone of **the Academy repository**:

```bash
cd ~/kasa_programming_language/kasa-learning-academy
git fetch origin
git switch dev/academy-course-pathways-2026
node --test tests/academy-applied-course.test.mjs
npm run test:smoke
git rev-parse HEAD
git status --short
```

**Note:** A full smoke-suite failure from the existing Studio release
manifest must be recorded, not ignored. Do not solve it by blindly
regenerating metadata without reviewing the approved Studio publisher
assets and release identifier. To test a complete build on a properly
configured development environment, install the repository's Node 24
dependencies, review the generated package lockfile, set up a
development-only Payload/Postgres instance, and run `npm run build`.
The build itself invokes `scripts/sync-studio-release.mjs` and mutates
the local Studio manifest. Inspect the manifest diff before any commit.

Manual UI checks after local build:

1. Open `/learn` and follow the four learning-path stages.
2. Open `/learn/applied`, follow each of the five dedicated lab pages,
   and run the program on that page, verifying its displayed output.
   Change one value in each independent assignment.
3. Inspect mobile layout, in-page links, keyboard focus and screen reader
   section headings.
4. Verify existing published `/learn/[slug]` lessons, video/transcripts,
   `/admin`, `/playground`, and `/projects` are unchanged.

**Merge only after owner verification. No Vercel/Netlify deployment.**
