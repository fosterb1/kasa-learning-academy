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
if (!old.files || typeof old.files !== 'object' || Array.isArray(old.files)) throw new Error('Missing Studio asset manifest')
if (typeof old.release !== 'string' || !old.release.trim()) throw new Error('Missing Studio release identifier')
if (old.source_repo !== 'fosterb1/kasa_programming_language') throw new Error('Unexpected Studio source repository')
const names = [...new Set([...Object.keys(old.files), 'kasa-pinned-modules.js'])]
const files = {}
for (const name of names.sort()) {
  if (name.startsWith('/') || name.includes('..') || name.includes('\\')) throw new Error('Unsafe Studio asset path')
  const bytes = await readFile(new URL(name, base))
  files[name] = {bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')}
}
if (files['native/kasa-native.wasm'].bytes < 400000) throw new Error('Existing native engine unexpectedly missing')
// Preserve the content-derived release identifier supplied by the reviewed
// Kasa publisher. Earlier Academy versions used a fixed identifier; those
// existing identifiers remain valid until a separately approved release.
const manifest = {format:old.format, release:old.release, source_repo:old.source_repo, files}
await writeFile(manifestUrl, JSON.stringify(manifest, null, 2) + '\n')
console.log('Studio release asset hashes refreshed for', names.length, 'files')
