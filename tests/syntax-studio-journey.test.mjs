import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'

const read = async (p) => readFile(new URL(p, import.meta.url), 'utf8')

test('syntax course links learners to first-party full Kasa Studio', async () => {
 const index = await read('../src/app/(site)/learn/syntax/page.tsx')
 const chapter = await read('../src/app/(site)/learn/syntax/[slug]/page.tsx')
 assert.match(index, /<Link href="\/playground">Kasa Studio<\/Link>/)
 assert.match(chapter, /<Link href="\/playground">Open full Kasa Studio<\/Link>/)
 assert.match(chapter, /<Playground sourceCode={unit\.example} expectedOutput={unit\.output}/)
})
test('full Academy Studio remains own-origin with tracked native release assets', async () => {
 const page = await read('../src/app/(site)/playground/page.tsx')
 const manifest = JSON.parse(await read('../public/kasa-studio/release-manifest.json'))
 assert.match(page,/src="\/kasa-studio\/index\.html"/)
 assert.equal(manifest.format,'kasa-studio-release-v1')
 assert.ok(manifest.files['native/kasa-native.wasm'].bytes > 400000)
 assert.ok(manifest.files['diagnostics.js'].sha256)
})

test('discontinued separately hosted playground banner is absent from Academy Studio', async () => {
 const page = await read('../src/app/(site)/playground/page.tsx')
 assert.match(page, /src="\/kasa-studio\/index\.html"/)
 assert.doesNotMatch(page, /ExternalPlaygroundLink/)
 assert.doesNotMatch(page, /separately hosted|Netlify/)
})
