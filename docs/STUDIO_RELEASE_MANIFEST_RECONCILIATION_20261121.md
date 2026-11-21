# Academy Studio release-manifest reconciliation — 2026-11-21

**Status:** Candidate reviewed metadata, independent tests and deployment approval pending.
**Scope:** Only `public/kasa-studio/release-manifest.json`, build integrity gate and smoke tests. **No Studio source or native binary changes. No CMS writes or curriculum changes.**

## Evidence

Cloud Shell owner executed a read-only Studio asset audit using PR #13. Summary: **6 matched, 6 mismatched, 1 untracked, 0 missing**. Comparison of Git history after previous manifest pin (`cffa2c4`) finds exactly seven corresponding Studio changes: app.js, index.html, kasa-runtime.js, style.css, sw.js, worker.js and newly added kasa-pinned-modules.js. The changes came from approved-to-repository commits including diagnostics support (`7da861b`) and opt-in pinned G1 math/collections modules (`808141e`).

The current tracked native WASM and glue hashes **matched** the previous release. They have **not** been replaced or recompiled.

| Asset | Byte length | SHA-256 (owner's Cloud Shell audit) |
|---|---:|---|
| app.js | 15188 | cb4067fe8561b50de6a0ef1910ca7aebc0c4bcd669fa711186e0a90bc796dc64 |
| index.html | 9129 | bd9716ce82a3e081d5c0782bcdf18417307a152433044e1da8a3b467a6fcdba0 |
| kasa-pinned-modules.js | 1562 | de4a0be2be4e03b1294d3e9aaff11fb78ffac24225630ac4160631f474fa5e11 |
| kasa-runtime.js | 34059 | 061690cab1b49986264e700436313f52fd2cc0ba4de8b356c2870424ebd16e82 |
| style.css | 12150 | bcffeb8a6111310f430754a39af4018da143ef79c26100a4ff0e3089a61a9699 |
| sw.js | 1702 | 67e9043961dcaa67b9cb1a87af47f5360fc5a40fa5d5124f8962d83ada53b391 |
| worker.js | 4847 | ca23109d1cc748c5c970aea85d75b16ccef15161dd21c48eb9aed6631ace26ac |

The new release label `academy-studio-pinned-modules-20261121` describes the current **Academy-hosted bundle** and does not imply the bundle is byte-for-byte identical to the language repository's current playground. SHA-256 demonstrates integrity against recorded bytes, **not** code safety or cryptographic publisher authenticity.

## Preventing recurrence

Previously, `npm run build` automatically executed `scripts/sync-studio-release.mjs` before running smoke tests. This could silently repair mismatches merely by blessing changed bytes with the old identifier. The build now **checks but does not regenerate** metadata. Regeneration, if ever necessary, must be a separate explicitly reviewed source change. A new test requires exact coverage of all Studio shipped files by the release manifest.

## Owner test gate — Cloud Shell

From a clean Academy checkout:

```bash
cd ~/kasa_programming_language/kasa-learning-academy
git fetch origin
git switch --track origin/fix/studio-release-manifest-20261121
node --test tests/academy-studio.test.mjs tests/studio-fa-firi-release.test.mjs
npm run test:smoke
git status --short
git rev-parse --short HEAD
```

Expected: zero failures in both test commands; all 13 Studio files pinned. If other files fail, **do not** regenerate hashes automatically.

Do not run the CMS build or migrations against a production database as a test. Once verified and merged, rebase/retest Academy PR #10 (My Learning), #11 (Applied labs) and #12 (Curriculum roadmap) in order. Staging UI/video validation and explicit deployment approval remain separate release gates.
