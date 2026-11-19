# Phase 4C.1 — Ghana-first developer diagnostics (19 Nov 2026)

Status: **Implemented in GitHub, independently tested; production deployment pending Vercel free-plan limit**.

## Research before implementation
We reviewed:
- Rust Compiler Development Guide: https://rustc-dev-guide.rust-lang.org/diagnostics.html
- Language Server Protocol specification: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/
- Elm language guide: https://guide.elm-lang.org/types/
- CodeMirror: https://codemirror.net/
- Monaco accessibility guidance: https://github.com/microsoft/monaco-editor/wiki/Monaco-Editor-Accessibility-Guide
- Ghana school ICT infrastructure: https://www.wathi.org/wathinotes-systemes-educatifs/ghanas-basic-education-infrastructure-progress-gaps-and-strategies-towards-2030-africa-education-watch-april-2025/
- Ghana access/competence gap: https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1815060/full
- Research ICT Africa Ghana digital access: https://researchictafrica.net/wp-content/uploads/2025/10/AfterAccess_Ghana-Household-Report_2022_RIA_2025.pdf

Full technical reasoning: `fosterb1/kasa_programming_language/docs/PHASE_4C_DIAGNOSTICS_RESEARCH.md`.

## Delivered code
- `public/kasa-studio/diagnostics.js` analyzes existing engine errors only. It exposes location (line and column), category, stable KASA diagnostic code, explanation and a cautious suggestion.
- `public/kasa-studio/index.html` adds a diagnostic region to the first-party Studio and loads the small offline-capable script.
- `public/kasa-studio/app.js` renders this data with `textContent` to prevent untrusted source/message HTML injection, while preserving raw engine errors.
- `public/kasa-studio/style.css` adds responsive accessible styling.
- `public/kasa-studio/sw.js` includes diagnostics in the offline cache. `release-manifest.json` pins byte lengths and SHA-256 digests for **12 assets**, including the new script and actual WASM runtime.
- `tests/diagnostics.test.mjs` tests seven real runtime diagnostic scenarios, unknown errors and accessibility integration.
- Both the Kasa language repository's playground and its release-to-Academy tool were synchronized with the new script, making future approved 4A releases less likely to undo 4C.

## Independent checks
- Academy source pinned to commit `e9a9eeb5d643b19a1d12318428eb9302dfcc1521`: **151/151 Node tests passed**.
- Language source pinned to `72952e461f3f2541fd8d0bddea08644edd6828fc`: **5/5 release safety Python unit tests**, **234/234 browser/worker Node tests passed**.
- Actual interpreter errors used to test suggestions: `se` vs `sɛ`, `sikaa` vs `sika`, missing conditional `a`, unclosed text quote, division by zero, out-of-range list position and non-Boolean conditions.
- Did not alter the core language grammar, interpreter output, or CMS content.

## Deployment blocker and exact current state
A production deployment attempt for the newest 4C source received **HTTP 402 payment_required** from Vercel with `api-deployments-free-per-day` and `retryAfter=86400`. It reported the free quota exceeded. This is a **deployment limit**, not evidence that the application build failed or that diagnostics work live. The first-party Studio remains available at `/playground` on the last READY deployment, but the new 4C diagnostic panel **must not be called production-verified** until a subsequent production build completes and browser checks pass.

Do not change billing settings automatically. Avoid deploying on every incremental commit; batch feature work and deploy once after verification.

## Known limitations and next stages
- String-based diagnostic parsing is a bridge, not a stable compiler API or complete LSP.
- No automatic code edits; suggested translations are cautious and may be ambiguous.
- Native and JS error wording and source positions need a formal category/range parity audit.
- The on-screen tips are in plain English with Kasa syntax; idiomatic Akan/Twi explanatory text requires educator review.
- Keep the Kasa Studio low-bandwidth, offline-capable and keyboard/screen-reader friendly. Explore CodeMirror only after practical low-end device testing.
- Phase 4C.2: shared JS/Python/C++/WebAssembly/KBC1 diagnostic fixture corpus and parity gate; Phase 4C.3: editor experience and accessibility.
