# Studio Release Integrity Auditor — Isolated Merge Review (2026-11-26)

**Branch:** `review/studio-integrity-auditor-20261126` (created from current `main`).

**Status:** read-only auditor and source regression checks committed. **Not yet executed** against a maintainer checkout. No merge to `main`, release manifest edit, new native assets, install, migration or deployment.

## Scope

This branch carries only the read-only `scripts/audit-studio-release.mjs` from the legacy `fix/studio-release-integrity-review` work, plus independent source regression checks. It intentionally does not cherry-pick the legacy branch history because its older manifest describes a different Studio release.

The script walks first-party `public/kasa-studio` assets, reports missing, untracked and hash-mismatched files relative to `release-manifest.json`, and exits nonzero if any discrepancies exist. It prints hashes and asset names (not environment secrets), but the report can be extensive. **It does not change the manifest or bundled files.**

## Verify locally without disturbing active G2.4 work

Use a **separate git worktree** (preferred) so your active Academy G2.4 checkout and local `.env.local` remain untouched.

```powershell
cd C:\Users\User\kasa-learning-academy
git fetch origin
git worktree add ..\kasa-academy-studio-review origin/review/studio-integrity-auditor-20261126
cd ..\kasa-academy-studio-review
node --test tests/studio-readonly-auditor.test.mjs
node scripts/audit-studio-release.mjs
git status --short
```

Expected: 3 static checks pass; audit prints `mismatched: 0`, `missing: 0`, `untracked: 0` if the manifest and tracked files agree; and `git status --short` prints nothing. If audit finds discrepancies, stop and review rather than regenerating hashes. No `npm install`, `npm run build` or deployment needed.

**Note:** Creating this worktree on a branch name directly from `origin/...` results in a detached HEAD by default; that's intentional for read-only review. If the worktree already exists, inspect rather than deleting it.

After verification, we can decide whether to submit a narrowly scoped pull request. Do not merge the old review branch, and do not interpret hash equality as independent proof of the binaries' authenticity or functional correctness.

## Windows audit finding — 2026-11-26

Maintainer's read-only audit in a clean Windows worktree reported **3 matched, 10 raw SHA-256 mismatches, 0 missing, 0 untracked**, with a clean git status. All 10 text-file byte deltas exactly matched their GitHub LF line counts, strongly indicating Git autocrlf checkout conversion. The native WASM binary and two PNG icons matched their original hashes.

The auditor now **diagnoses but does not forgive** this transformation: if converting a file's CRLF bytes to LF **in memory** matches both the recorded byte size and SHA-256, that file is reported as `line-ending-conversion` and counted in `lineEndingConverted`. The audit **still exits with code 1** whenever any raw asset differs. No manifest rewrite, file mutation, or relaxed production release acceptance occurs.

### Re-run safely in the separate review worktree

```powershell
cd C:\Users\User\kasa-academy-studio-review
git fetch origin
git switch --detach origin/review/studio-integrity-auditor-20261126
node --test tests/studio-readonly-auditor.test.mjs
node scripts/audit-studio-release.mjs
git status --short
```

Expected if the hypothesis is correct: four source checks pass; audit reports **`lineEndingConverted: 10`, `mismatched: 0`, `matched: 3`**, still exits 1; clean worktree remains unchanged. If even one mismatch remains genuinely different after LF normalization, stop and investigate content. For correct cross-platform asset bytes in a future release, review targeted `.gitattributes` rules and fresh checkouts **separately**; do not normalize by rewriting files or rehashing the Windows checkout.

## Checkout-byte preservation fix — 2026-11-26

The maintainer confirmed **4/4** auditor regression checks passed, and the updated audit reported **3 raw matches, 10 exact CRLF-only differences, 0 unexplained mismatches, 0 missing, 0 untracked**. Worktree remained clean. This identifies the issue as Windows checkout newline conversion, not manifest corruption.

Added `.gitattributes` with `public/kasa-studio/** -text`. Git must now preserve tracked Studio release bytes as stored in Git, on Windows as well as macOS/Linux. This leaves `public/kasa-studio/release-manifest.json`, native binaries, and all Studio source content unchanged on the branch.

**Existing Windows worktrees may retain previously materialized CRLF files after a git switch.** For testing, use a **fresh worktree** rather than editing files or regenerating the manifest:

```powershell
cd C:\Users\User\kasa-learning-academy
git fetch origin
git worktree add --detach ..\kasa-academy-studio-bytecheck origin/review/studio-integrity-auditor-20261126
cd ..\kasa-academy-studio-bytecheck
git check-attr text -- public/kasa-studio/app.js public/kasa-studio/native/kasa-native.wasm
node --test tests/studio-readonly-auditor.test.mjs
node scripts/audit-studio-release.mjs
git status --short
```

Expected: `git check-attr` reports `text: unset`, tests **5/5**, audit **13 matched, 0 mismatched, 0 lineEndingConverted, 0 missing, 0 untracked**, and clean status. If any value differs, **do not merge**, and share a sanitized report. Avoid `npm run build` or `scripts/sync-studio-release.mjs`; neither is needed.

This is a local verification gate, not yet a completed cross-platform release audit. The review branch remains unmerged.

## Final fresh-Windows-worktree evidence — 2026-11-26

Maintainer executed the review from a **fresh** `kasa-academy-studio-bytecheck` worktree after the targeted `.gitattributes` rule was committed:

- `git check-attr text` reported `text: unset` for both `public/kasa-studio/app.js` and `native/kasa-native.wasm`.
- `node --test tests/studio-readonly-auditor.test.mjs`: **5 passed, 0 failed**.
- `node scripts/audit-studio-release.mjs`: **13 matched, 0 mismatched, 0 lineEndingConverted, 0 missing, 0 untracked**.
- `git status --short`: empty.

This validates byte-for-byte agreement with the **existing** reviewed manifest on this Windows checkout. It does not independently establish the release provenance, binary safety, or behavior of the runtime. No release manifest, Studio asset, or production deployment was changed.
