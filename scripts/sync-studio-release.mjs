/**
 * Regenerate Studio release integrity metadata during Vercel's production build.
 * Preserve existing first-party WASM artifacts and hash the actual deployed files.
 */
import {readFile, writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
const base = new URL('../public/kasa-studio/', import.meta.url)
const manifestUrl = new URL('release-manifest.json', base)
const old = JSON.parse(await readFile(manifestUrl, 'utf8'))
if (old.format !== 'kasa-studio-release-v1') throw new Error('Unexpected Studio release manifest format')
const names = [...new Set([...Object.keys(old.files), 'kasa-pinned-modules.js'])]
const files = {}
for (const name of names.sort()) {
  if (name.startsWith('/') || name.includes('..') || name.includes('\\')) throw new Error('Unsafe Studio asset path')
  const bytes = await readFile(new URL(name, base))
  files[name] = {bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')}
}
if (files['native/kasa-native.wasm'].bytes < 400000) throw new Error('Existing native engine unexpectedly missing')
const manifest = {format:'kasa-studio-release-v1', release:'academy-4d-fa-firi-modules', source_repo:'fosterb1/kasa_programming_language', files}
await writeFile(manifestUrl, JSON.stringify(manifest, null, 2) + '\n')
console.log('Studio release asset hashes refreshed for', names.length, 'files')
