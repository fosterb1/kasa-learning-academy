import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile,stat} from 'node:fs/promises'

const studio = new URL('../public/kasa-studio/', import.meta.url)
test('Academy owns every required Kasa Studio file, including actual native WASM', async () => {
  const names = ['index.html','app.js','style.css','worker.js','kasa-runtime.js','sw.js',
    'manifest.webmanifest','native/kasa-native.js','native/kasa-native.wasm',
    'icons/kasa-192.png','icons/kasa-512.png']
  for (const name of names) {
    const file = new URL(name,studio)
    assert.ok((await stat(file)).size>0, 'Missing local asset: '+name)
  }
  const wasm = await readFile(new URL('native/kasa-native.wasm',studio))
  assert.deepEqual([...wasm.subarray(0,8)], [0,97,115,109,1,0,0,0])
  assert.ok(wasm.length > 400000, 'Native executable appears truncated')
})
test('Studio uses first-party local paths and explicitly enables native WebAssembly',async()=>{
  const worker=await readFile(new URL('worker.js',studio),'utf8')
  const app=await readFile(new URL('app.js',studio),'utf8')
  const html=await readFile(new URL('index.html',studio),'utf8')
  const page=await readFile(new URL('../src/app/(site)/playground/page.tsx',import.meta.url),'utf8')
  assert.match(worker,/const KASA_HAS_WASM = true;/)
  assert.match(worker,/importScripts\("\.\/native\/kasa-native\.js"\)/)
  assert.match(worker,/importScripts\("\.\/kasa-runtime\.js"\)/)
  assert.match(html,/src="\.\/app\.js/)
  assert.match(page,/src="\/kasa-studio\/index\.html"/)
  assert.doesNotMatch(page,/netlify\.app|configuredPlaygroundUrl/)
  assert.ok(app.includes('source.setRangeText(token'), 'Twi keyboard helper missing')
})
