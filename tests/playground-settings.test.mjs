import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { normalizePlaygroundUrl } from '../src/lib/playground-url.ts'

test('only secure root HTTPS origins may be embedded from the CMS', () => {
  assert.equal(normalizePlaygroundUrl(' https://kasa-sample.netlify.app/ '), 'https://kasa-sample.netlify.app/')
  assert.equal(normalizePlaygroundUrl('https://playground.example.org'), 'https://playground.example.org/')
  for (const value of [
    null, '', 'javascript:alert(1)', 'http://kasa.netlify.app/',
    'https://evil.com@trusted.netlify.app/', 'https://example.com/path',
    'https://example.com/?token=123', 'https://example.com/#fragment',
    'https://localhost:3000/', '//example.org/', 'https://',
  ]) assert.equal(normalizePlaygroundUrl(value), null, String(value))
})

test('Payload global and dynamic academy page use the shared validator', async () => {
  const config = await readFile(new URL('../src/payload.config.ts', import.meta.url), 'utf8')
  const globalFile = await readFile(new URL('../src/globals/PlaygroundSettings.ts', import.meta.url), 'utf8')
  const page = await readFile(new URL('../src/app/(site)/playground/page.tsx', import.meta.url), 'utf8')
  assert.match(config, /globals:\s*\[PlaygroundSettings\]/)
  assert.match(globalFile, /slug:\s*'playground-settings'/)
  assert.match(globalFile, /normalizePlaygroundUrl\(value\)/)
  assert.match(page, /findGlobal\(\{\s*slug:\s*'playground-settings'/)
  assert.match(page, /dynamic\s*=\s*'force-dynamic'/)
  assert.match(page, /<Playground sourceCode=/)
  assert.match(page, /sandbox="allow-scripts allow-same-origin allow-downloads"/)
})

test('migration adds only the optional playground settings table', async () => {
  const filename = new URL('../src/migrations/20261118_200729.ts', import.meta.url)
  const migration = await readFile(filename, 'utf8')
  assert.match(migration, /CREATE TABLE "playground_settings"/)
  assert.match(migration, /"playground_url" varchar/)
  assert.doesNotMatch(migration, /ALTER TABLE/)
})
