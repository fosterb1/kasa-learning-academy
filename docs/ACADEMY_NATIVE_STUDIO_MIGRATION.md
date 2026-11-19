# Kasa Studio on Kasa Academy (Vercel) — migration and rollback

## Why this was done
The full Netlify playground is now mirrored as a first-party static app under `/public/kasa-studio/`, with its compiled native WebAssembly binary, Emscripten loader, JavaScript interpreter and worker. This avoids depending on Netlify billing or its `.netlify.app` host for program execution.

The public Academy page `/playground` displays this **own-origin** studio in a full-viewport frame, hiding the Academy navigation and footer while preserving the exact standalone dark editor aesthetics. The frame isolates CSS; all runtime assets are first-party. The main site and CMS remain independent.

## Assets
- `index.html`, `style.css`, `app.js` are copies of the existing Kasa playground source, adding an Academy return link.
- `worker.js` is the actual Kasa worker with `KASA_HAS_WASM=true`.
- `kasa-runtime.js` is the standalone JavaScript fallback, served first-party.
- `native/kasa-native.js` and `native/kasa-native.wasm` are copied from the currently working Kasa Netlify native build (2026-11-19), not generated from arbitrary host source.
- Native `.wasm` size: 491166 bytes; magic header `00 61 73 6d 01 00 00 00`.
- App manifest, icons and revisioned service worker are mirrored so offline caching is scoped to `/kasa-studio/`.

## Release verification
1. Build Academy on Vercel and ensure the production deployment is READY.
2. Visit `/playground`; confirm dark interface and absence of an embedded Netlify URL.
3. Visit `/kasa-studio/worker.js` and `/kasa-studio/native/kasa-native.wasm` and confirm 200 responses.
4. Confirm Engine shows **Native WebAssembly available** in the Studio.
5. Run a Ghanaian program using Kasa keywords, check output.
6. Test both native and JavaScript engine modes and validate correct output, errors, file download and Twi character input.
7. Check standalone page on a narrow mobile viewport and verify navigation back to Academy.
8. Run `npm run test:smoke` when a Node 24 build environment is available; `tests/academy-studio.test.mjs` checks the local WASM header and bundled files.

## Maintenance
Kasa Studio here is a **snapshot**. When the Kasa compiler changes, rebuild with Emscripten locally or in an approved build environment and publish matched `.wasm`, `.js`, worker, JS fallback and app files. Do not silently update one runtime without its corresponding native build. A synchronized build artifact pipeline should replace manual mirroring before a 1.0 release.

The old Netlify project remains online as temporary rollback only. Keep its CMS-configured external URL untouched until Studio is verified on Vercel across all key flows. Once verified, it can be unlinked/paused without breaking Academy `/playground`, but the old `.netlify.app` URL will stop working when Netlify hosting stops.

**Costs:** This moves resource usage to the Academy's Vercel project. It removes Netlify runtime dependence, but Vercel still has bandwidth, build and plan limits.
