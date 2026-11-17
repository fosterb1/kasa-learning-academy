import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import '../public/kasa-runtime.js'
const base = new URL('../scripts/content/curriculum.json', import.meta.url)
const c = JSON.parse(await readFile(base, 'utf8'))

test('20 lessons, 8 practice challenges, and 5 modules exist', () => {
  assert.equal(c.lessons.length, 20)
  assert.equal(c.practices.length, 8)
  assert.equal(c.modules.length, 5)
})

test('each lesson has a unique slug, a known module and a valid quiz', () => {
  assert.equal(new Set(c.lessons.map(x=>x.id)).size,c.lessons.length)
  const modules = new Set(c.modules.map(x=>x.id))
  for (const l of c.lessons) {
    assert.ok(modules.has(l.unit),`Missing module: ${l.unit}`)
    assert.ok(l.title?.length>0 && l.overview?.length>0)
    assert.ok(Number.isInteger(l.quiz?.answer) && l.quiz.answer>=0 && l.quiz.answer<l.quiz.choices.length)
  }
})

for (const l of c.lessons) {
  test(`Kasa lesson source executes: ${l.id}`, () => {
    const r = globalThis.KasaRuntime.executeKasa(l.code, l.input||'', 'run')
    assert.equal(r.ok,true,r.error)
    assert.equal(r.output,l.expected)
  })
}

test('every practice starter parses as Kasa source', () => {
  for (const p of c.practices) {
    const r = globalThis.KasaRuntime.executeKasa(p.start,p.input||'','check')
    assert.equal(r.ok,true,`${p.id}: ${r.error}`)
  }
})

test('public API queries filter drafts and require access checks', async () => {
  const file=await readFile(new URL('../src/lib/content.ts',import.meta.url),'utf8')
  assert.match(file,/overrideAccess: false/g)
  assert.match(file,/_status:\s*\{\s*equals:\s*'published'/)
})

test('user registration is administrator-only, no bootstrap web endpoint', async () => {
  const users=await readFile(new URL('../src/collections/Users.ts',import.meta.url),'utf8')
  assert.match(users,/create:\s*adminsOnly/)
  const worker=await readFile(new URL('../public/kasa-worker.js',import.meta.url),'utf8')
  assert.doesNotMatch(worker,/https?:\/\//)
  assert.doesNotMatch(worker,/\beval\s*\(/)
})
