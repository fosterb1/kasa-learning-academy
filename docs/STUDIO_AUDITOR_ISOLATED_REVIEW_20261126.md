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
