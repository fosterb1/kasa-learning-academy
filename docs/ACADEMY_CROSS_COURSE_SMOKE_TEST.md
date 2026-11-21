# Cross-course lesson smoke test — November 2026

## Purpose

Sample three lessons from each of six Academy courses (first, middle and last), execute the exact stored Kasa examples through the first-party `public/kasa-runtime.js`, and assert exact output, no interpreter errors, dynamic page wiring and editor presence.

## Runtime checks completed

Executed all 18 selected programs directly against the current `main` Kasa JavaScript runtime, **18 passed / 0 failed**.

| Course | Examples tested |
| --- | --- |
| Foundations | meet-the-computer, decisions-with-rules, safe-shared-computing |
| Syntax | source, repeat, debug |
| Algorithms | trace-steps, maximum-value, count-operations |
| Data | nested-lists, validate-values, filtered-summary |
| Applied | shop-receipt, inventory-decision, records-validation |
| Software Practices | debug-trace, refactor-function, document-project |

Test file: `tests/academy-cross-course-sample.test.mjs`. It is automatically included by `npm run test:smoke`.

## Boundaries and independent acceptance

A JS runtime test is **not** an end-to-end browser test, an accessibility audit or an external production deployment check. The source-level route assertions check lesson page wiring and CMS protection fields, but not clicks, hydration, external video playback or CMS database content.

Run from the feature branch in Cloud Shell:

```bash
git fetch origin
git switch --track origin/test/academy-cross-course-lesson-smoke-2026
node --test tests/academy-cross-course-sample.test.mjs
npm run test:smoke
npm run build
git rev-parse --short HEAD
git status --short
```

Then in a deployment preview, **manually** open samples under `/start`, `/learn/syntax`, `/learn/algorithms`, `/learn/data`, `/learn/applied` and `/learn/development`; run the examples, confirm navigation and keyboard interaction, and check an existing CMS video/transcript lesson. Do not merge until this and the Vercel check are successful.

No course content, CMS data, Studio binaries, interpreter or production configuration is changed by this test-only PR.
