import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import vm from 'node:vm'
const read = async name => readFile(new URL('../public/kasa-studio/' + name, import.meta.url), 'utf8')

test('Academy Studio offers an accessible, opt-in Twi module example', async () => {
  const html = await read('index.html')
  const app = await read('app.js')
  const css = await read('style.css')
  assert.match(html, /id="experimental-modules" type="checkbox"/)
  assert.match(html, /value="moduleMarket"/)
  assert.match(html, /community review/)
  assert.match(app, /fa math firi stdlib: m/)
  assert.match(app, /experimentalModules \? "javascript" : engineSelect.value/)
  assert.match(app, /engine, experimentalModules \}/)
  assert.match(css, /\.module-experiment-switch/)
})
test('Academy Studio executes pinned imports and retains default language behavior', async () => {
  const sandbox = {self:{}}
  vm.runInNewContext(await read('kasa-runtime.js'), sandbox, {filename:'kasa-runtime.js'})
  vm.runInNewContext(await read('kasa-pinned-modules.js'), sandbox, {filename:'kasa-pinned-modules.js'})
  const mods = sandbox.self.KasaPinnedModules
  assert.deepEqual(Object.keys(mods).sort(), ['collections', 'math'])
  const expected = {
    math:'bea853aff3a4c5ad1fa3ffa12de567b39a360d02c46d79bb6f4c3dbef7a3c3fa',
    collections:'b21c4eb7eb91547b63ca3f13e1adecc7d35ed8cce3513b3b4d90be1ef1622ced',
  }
  for (const [name, expectedHash] of Object.entries(expected)) {
    const hash = createHash('sha256').update(mods[name].source).digest('hex')
    assert.equal(hash, expectedHash, name + ' module source changed unexpectedly')
  }
  const program='fa math firi stdlib: m\nfa collections firi stdlib: c\nka m.kasa_sum([10,20,30])\nka c.kasa_contains([10,20,30],20)'
  const result=sandbox.self.KasaRuntime.executeKasa(program,'','run',{experimentalModules:mods})
  assert.equal(result.ok,true,result.error)
  assert.equal(result.output,'60\nnokware\n')
  assert.equal(sandbox.self.KasaRuntime.executeKasa(program,'','run').ok,false)
  const normal=sandbox.self.KasaRuntime.executeKasa('ka "Maakye, Ghana!"','','run')
  assert.equal(normal.ok,true,normal.error)
  assert.equal(normal.output,'Maakye, Ghana!\n')
})
test('Academy worker keeps native WebAssembly while enabling opt-in pinned modules and offline cache',async()=>{
  const worker=await read('worker.js')
  const sw=await read('sw.js')
  const packageFile=await read('kasa-pinned-modules.js')
  const build=await readFile(new URL('../scripts/sync-studio-release.mjs',import.meta.url),'utf8')
  assert.match(worker,/const KASA_HAS_WASM = true;/)
  assert.match(worker,/const KASA_HAS_PINNED_MODULES = true;/)
  assert.match(worker,/experimentalModules === true/)
  assert.match(worker,/loadPinnedModules\(\)/)
  assert.match(sw,/kasa-pinned-modules\.js/)
  assert.match(sw,/const CACHE_NAME = 'kasa-playground-[^']+';/)
  assert.doesNotMatch(sw,/__KASA_BUILD_HASH__/)
  assert.match(build,/release:old\.release/)
  assert.doesNotMatch(build,/release:'academy-4d-fa-firi-modules'/)
  assert.match(packageFile,/self\.KasaPinnedModules/)
  assert.match(build,/createHash\('sha256'\)/)
})