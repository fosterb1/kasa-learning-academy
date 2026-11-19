# Phase 4A + 4B — Progress, discoveries, verification and limitations
Date: 2026-11-19
Status: 4A release publisher implemented and dry-run verified; 4B deeper learning workbook deployed and independently exercised.

## 4A — Language → Academy synchronization
- `fosterb1/kasa_programming_language/scripts/release_to_academy.py` builds a manifest of the complete Studio release, verifies a real WASM binary, and publishes the runtime files in one non-force Git commit when invoked after developer approval.
- No paid GitHub Actions workflows are required. Publishing is not automatic on every commit; it is triggered by an **explicit approved release** from an appropriate local Emscripten environment.
- The publisher runs local native-artifact validation, Node browser-runtime tests, WebAssembly packaging and its own Python unit tests before publishing.
- `public/kasa-studio/release-manifest.json` records byte lengths and SHA-256 hashes of all eleven original Academy-hosted browser assets.
- `tests/academy-studio.test.mjs` checks each runtime asset against the manifest, including 491166-byte native WASM.
- Local reviewer must still supply a fine-grained GitHub token; no credential is stored in either repository.

### Independent verification
- Five publisher Python unit tests: 5 passed, 0 failed.
- Publisher dry run with tested native binary: passed; identified release `e8105cc02419`, native executable 491166 bytes, twelve assets to synchronize. **No write performed** in this dry run.
- Live Studio native browser tests (3 programs): reassignment; while loop; Unicode-named list mutation. All three returned correct output and showed Native WebAssembly execution.
- Previous live browser verification also established JavaScript fallback output and active offline service worker.

## 4B — Deepen syntax teaching
- `src/lib/syntax-workbook.json` adds an independently runnable third example to every one of the 16 syntax chapters, together with coach hints, a transfer challenge, known mistakes and a four-item mastery checklist.
- `src/components/SyntaxDeepPractice.tsx` provides five ordered stages: Predict, Trace, Run, Modify, Debug and Explain.
- `src/app/(site)/learn/syntax/[slug]/page.tsx` integrates the workbook into every chapter. It does not overwrite any CMS-authored lesson, video or transcript.
- The syntax course now has 48 original/alternate/new example programs total: 32 earlier + 16 in the new workbook. All 48 passed JavaScript-runtime checks.
- The live Variables lesson was exercised: the fresh workbook example printed `10` then `15` with the exact-output check passed.
- Lesson self-check state is intentionally on-page only: no false claims about formal grades or stored certificates.

## Full regression run and discoveries
An independent source checkout was run with `node --test tests/*.test.mjs`, without paid GitHub Actions:
- First run: 141 tests, 137 passed, 4 failed.
- Two legacy curriculum outputs incorrectly expected whole numbers `30` and `70` where Kasa printed floating results `30.0` and `70.0`.
- A bilingual lesson test inherited the output mismatch.
- The old playground settings test still assumed a CMS-selected Netlify iframe was the primary `/playground` experience, not Academy-hosted Studio.
- Corrected the original curriculum expected outputs and updated the outdated route assertion. No user-edited CMS records were overwritten.
- Second full run: **141 tests passed, 0 failed**, across 14 Node test files.
- Vercel production deployment for the Phase 4B code was READY.

## Remaining gates and honest limitations
- The publishing script was verified with offline unit tests and a valid dry run, **not with an authenticated real-world release write**. A developer must provide a tightly scoped GitHub token and build a fresh C++/WASM release to exercise full publication.
- The full 48-example corpus has been exercised against the Academy **JavaScript** runtime. Native WebAssembly was browser-tested with three representative 4B-style cases, but the full cross-engine corpus parity sweep is still a stronger future gate.
- `node --test` checks are independent regression tests, not a complete commercial-grade QA signoff or educator review.
- The Academy CMS database may contain previously edited lesson output expectations; this process deliberately avoided overwriting those records. Editors should correct any inconsistent published records individually.
- Native speakers and teachers should review Akan spelling, cultural examples and lesson difficulty before a broad classroom pilot.
- The user's prior qualitative Academy evaluation of 35/100 remains their rating; added content and test counts are evidence of progress, not a calibrated replacement score.
