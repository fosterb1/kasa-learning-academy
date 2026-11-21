# First-party Kasa Studio release integrity review

**Status: investigation only. No hash updates or Studio bundle changes in this PR.**

## Provenance confirmed from Git history

- `4d8c0ba` first integrated the Academy-hosted native WASM Studio.
- `cffa2c4` wrote `release-manifest.json` with release `academy-4c1-diagnostics`, recording `app.js` 13,990 bytes and SHA-256 `bd6bf8042b537edd73201a0627e90b3f2ec2048f5329f245a54bac86baff2560`.
- `7da861b` subsequently changed `public/kasa-studio/app.js` to display structured diagnostics.
- `808141e` subsequently changed `public/kasa-studio/app.js` for opt-in pinned math/collections imports without updating the prior manifest.
- The owner verified the Academy copy of `app.js` is **15,188 bytes** with SHA-256 `cb4067fe8561b50de6a0ef1910ca7aebc0c4bcd669fa711186e0a90bc796dc64`.
- The current Academy and compiler-repository `app.js` files differ: the Academy's opt-in module release has local Academy-specific changes. Provenance must be a **reviewed Academy bundle**, not a claim that all files exactly mirror compiler main.

## Safe next step

Run **read-only** full inventory and manifest comparison from a clean Academy checkout:

```bash
git fetch origin
git switch --track origin/fix/studio-release-integrity-review
node scripts/audit-studio-release.mjs > /tmp/kasa-studio-release-audit.json
cat /tmp/kasa-studio-release-audit.json
```

The command exits with status 1 while drift exists; that is intentional. It reports each bundled file's actual SHA-256 and bytes, including assets not present in the manifest. It **does not write** the manifest, modify Studio binaries, install dependencies, touch CMS records or start a deployment.

Review each mismatch against its introducing commit. Do not run `npm run build` to repair metadata: the build currently invokes `scripts/sync-studio-release.mjs` automatically, which recalculates hashes while preserving the old release name. Merely refreshing hashes without release provenance approval could make a stale bundle appear approved. Once reviewed, create a distinct release identifier, update the manifest in a dedicated PR and rerun the full `npm run test:smoke`.

**Never merge this diagnostic alone as proof of an approved Studio release.** PRs #10, #11 and #12 remain separate.
