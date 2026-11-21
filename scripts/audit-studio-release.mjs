/**
 * Read-only Studio manifest audit.
 * Lists every mismatch without modifying source, binaries, or release metadata.
 * node scripts/audit-studio-release.mjs
 */
import {readFile, readdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import path from 'node:path'

const base = fileURLToPath(new URL('../public/kasa-studio/', import.meta.url))
const manifestPath = path.join(base, 'release-manifest.json')
const manifest = JSON.parse(await readFile(manifestPath,'utf8'))
if (manifest.format !== 'kasa-studio-release-v1' ||
    typeof manifest.release !== 'string' || !manifest.release.trim() ||
    manifest.source_repo !== 'fosterb1/kasa_programming_language' ||
    !manifest.files || typeof manifest.files !== 'object' || Array.isArray(manifest.files)) {
  throw new Error('Unrecognized Studio manifest; audit refused.')
}

async function walk(dir, prefix='') {
 const items = []
 for(const entry of await readdir(dir, {withFileTypes:true})) {
  const name = prefix ? prefix+'/'+entry.name : entry.name
  if (name === 'release-manifest.json') continue
  if(entry.isDirectory()) items.push(...await walk(path.join(dir,entry.name),name))
  else if(entry.isFile()) items.push(name)
 }
 return items
}

const actualFiles = await walk(base)
const allNames = [...new Set([...Object.keys(manifest.files),...actualFiles])].sort()
const results = []
for (const name of allNames) {
  if (name.startsWith('/') || name.includes('..') || name.includes('\\') ||
      path.normalize(name).split(path.sep).includes('..')) {
    throw new Error('Unsafe Studio release path: ' + name)
  }
  const record = manifest.files[name]
  if (!actualFiles.includes(name)) {
    results.push({file:name,status:'manifest-entry-but-file-missing'})
    continue
  }
  const data = await readFile(path.join(base,name))
  const current = {bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')}
  if (!record) results.push({file:name,status:'untracked-file',current})
  else if (record.bytes !== current.bytes || record.sha256 !== current.sha256)
    results.push({file:name,status:'integrity-mismatch',recorded:record,current})
  else results.push({file:name,status:'verified',current})
}
const summary = {
  manifestRelease:manifest.release,
  sourceRepo:manifest.source_repo,
  matched:results.filter(x=>x.status==='verified').length,
  mismatched:results.filter(x=>x.status==='integrity-mismatch').length,
  missing:results.filter(x=>x.status==='manifest-entry-but-file-missing').length,
  untracked:results.filter(x=>x.status==='untracked-file').length,
  results,
}
console.log(JSON.stringify(summary,null,2))
if(summary.mismatched || summary.missing || summary.untracked) process.exitCode=1
