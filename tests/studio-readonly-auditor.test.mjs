import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('Studio auditor performs reads and hashes without writing release assets', async () => {
  const source = await read('scripts/audit-studio-release.mjs')
  assert.match(source, /readFile/)
  assert.match(source, /readdir/)
  assert.match(source, /createHash\('sha256'\)/)
  assert.match(source, /summary\.mismatched \|\| summary\.lineEndingConverted \|\| summary\.missing \|\| summary\.untracked/)
  assert.doesNotMatch(source, /\bwriteFile\b|\bappendFile\b|\brename\b|\bunlink\b|\bcopyFile\b|\bexec\b|\bspawn\b/)
})

test('auditor targets the current first-party manifest and rejects unsafe release paths', async () => {
  const source = await read('scripts/audit-studio-release.mjs')
  const manifest = JSON.parse(await read('public/kasa-studio/release-manifest.json'))
  assert.equal(manifest.format, 'kasa-studio-release-v1')
  assert.equal(manifest.source_repo, 'fosterb1/kasa_programming_language')
  assert.match(source, /release-manifest\.json/)
  assert.match(source, /name\.startsWith\('\/'\)/)
  assert.match(source, /name\.includes\('\.\.'\)/)
  assert.match(source, /'manifest-entry-but-file-missing'/)
  assert.match(source, /'integrity-mismatch'/)
  assert.match(source, /'untracked-file'/)
})

test('audit is not wired to a release or deployment command', async () => {
  const pkg = JSON.parse(await read('package.json'))
  assert.doesNotMatch(pkg.scripts.build, /audit-studio-release/)
  assert.doesNotMatch(pkg.scripts.dev, /audit-studio-release/)
})

test('CRLF normalization only diagnoses drift and never approves mismatched raw assets', async () => {
  const source = await read('scripts/audit-studio-release.mjs')
  assert.match(source, /line-ending-conversion/)
  assert.match(source, /normalizedSha === record\.sha256/)
  assert.match(source, /normalized\.length === record\.bytes/)
  assert.match(source, /summary\.lineEndingConverted/)
  assert.doesNotMatch(source, /\bwriteFile\b|\bappendFile\b/)
})
