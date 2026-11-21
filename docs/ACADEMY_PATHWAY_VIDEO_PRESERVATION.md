# Academy learning-path architecture and video-preservation checkpoint

**Scope:** Read-only pathway/navigation + opt-in CMS audit. **No schema changes, seeding, publishing, production data edits, or Studio release modifications.**

## Why this is separate from PRs #10 and #11

- PR #10 is the browser-local student progress dashboard. It is not merged.
- PR #11 contains five independently passing applied labs; its route is not on `main` until that PR merges.
- This PR provides a stable course-navigation foundation on `main` without depending on those branches. Applied labs are labelled `review` and have no public link yet.
- The pre-existing Studio manifest `app.js` mismatch (15188 live bytes vs 13990 recorded) is **not** silently refreshed or bypassed.

## Architecture stages

1. **Now:** Eight-stage read-only editorial metadata, clear availability labels, prerequisite suggestions, one `/learning-path` page and links from the main catalog/navigation. These are *recommendations*, not credentialed progress gates.
2. **Next after reviewed migration plan:** CMS `learning-paths` and `courses` with explicit `modules` relationships and a stable identifier for existing lessons. Document migration operations, foreign-key/backfill rules, access policies and rollback before modifying live PostgreSQL.
3. **After database backups:** Non-destructive migration with a staging copy, automated checks that all existing lesson IDs, slugs, published versions, `videoUrl`, `videoTitle`, `videoLanguage`, `transcriptTwi` and `transcriptEnglish` are unchanged. Treat intentional removals as explicit editorial actions.
4. **After approval:** Course assessments, account-backed progress (optional), prerequisite recommendations, transcript/media workflows and teacher review; never claim formal grading until implemented.

## Video preview investigation

The Academy lesson page renders `LessonVideo` only when `youtubeVideoId(lesson.videoUrl)` succeeds. Published CMS data are authoritative when lessons exist; fallback content lacks videos and is only served before initial migration or seeding. A draft-only video URL does not automatically show on the public published lesson. The player deliberately displays a click-to-play control instead of loading an automatic YouTube thumbnail.

The new `scripts/audit-lesson-videos.ts` is **read-only**. It lists only lesson slugs and status classifications, **not unlisted video URLs**, and checks for missing published video URLs, invalid video IDs, draft-only lessons and draft/published discrepancies. Run only with a backed-up, authorized database connection, e.g. from staging:

```bash
VIDEO_AUDIT_READONLY=yes node --env-file=.env.local --import tsx scripts/audit-lesson-videos.ts
```

It does **not** repair URLs, publish drafts, modify transcripts, contact YouTube or confirm embedding availability. The audit requires installed dependencies and `DATABASE_URL`. Never run a seed to “restore videos” or use a destructive reset on the production database.

## Test gate — Cloud Shell

```bash
cd ~/kasa_programming_language/kasa-learning-academy
git fetch origin
git switch --track origin/dev/academy-pathways-video-safety
node --test tests/academy-learning-path-safety.test.mjs
npm run test:smoke
git status --short
```

The full smoke suite has a known, separate Studio release-integrity failure. Capture its output and don't represent the suite as green. No deployment and no merge until owner reports results and verifies UI. Test the live videos against published CMS records in staging before any future course migration.

## Cloud Shell test results — November 21, 2026

The owner supplied terminal output after checking out the pathway branch:

- `node --test tests/academy-learning-path-safety.test.mjs`: **5 passed, 0 failed**.
- `npm run test:smoke`: **167 tests; 166 passed, 1 failed**.
- Only failing check: `tests/academy-studio.test.mjs` release-manifest asset integrity. `public/kasa-studio/app.js` is **15,188 bytes**, while the committed release manifest records **13,990 bytes**.
- This Studio integrity issue predates PR #12 and is outside the roadmap/video audit changes. The full test suite is **not green**.
- The static video-preservation checks do **not** prove that video URLs remain attached in the deployed CMS; the opt-in read-only database audit has not yet been run against staging/production.

**Decision:** Leave this PR draft/unmerged; resolve the separately reviewed Studio asset provenance and verify rendered learning-path/video behavior before release. No CMS migrations, seeding, publish actions or deployment authorized by these test results.
