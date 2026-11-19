import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import '../public/kasa-runtime.js'
import '../public/kasa-studio/diagnostics.js'

const diagnose=globalThis.KasaDiagnostics.diagnose
function run(source){return globalThis.KasaRuntime.executeKasa(source,'','run')}

const cases=[
 {source:'se nokware a\n ka "ok"\nawiei',code:'KASA-KW001',suggestion:/sɛ/},
 {source:'ma sika = 5\nka sikaa',code:'KASA-NAME001',suggestion:/sika/},
 {source:'sɛ nokware\n ka "yes"\nawiei',code:'KASA-SYN002',suggestion:/CONDITION a/},
 {source:'ma a = 3\nka a / 0',code:'KASA-MATH001',suggestion:/denominator/},
 {source:'ma x = [1,2]\nka x[4]',code:'KASA-LIST001',suggestion:/tentɛn/},
 {source:'sɛ 4 a\n ka "hi"\nawiei',code:'KASA-TYPE001',suggestion:/nokware/},
 {source:'ma sika = "Hello',code:'KASA-SYN003',suggestion:/double quote/}
]
for(const {source,code,suggestion} of cases){
 test('diagnostic '+code+' identifies actual Kasa error without changing runtime',()=>{
  const result=run(source)
  assert.equal(result.ok,false)
  const d=diagnose(source,result.error)
  assert.equal(d.code,code,result.error)
  assert.ok(d.line>=1 && d.column>=1)
  assert.match(d.suggestion,suggestion)
  assert.equal(d.raw,result.error)
 })
}
test('unknown error remains visible without fabricated line numbers',()=>{
 const d=diagnose('ka 1','custom engine failure')
 assert.equal(d.code,'KASA-UNKNOWN')
 assert.equal(d.line,null)
 assert.equal(d.raw,'custom engine failure')
 assert.equal(d.suggestion,null)
})
test('lookalike name suggestion is not asserted when names are ambiguous',()=>{
 const source='ma sika = 1\nma siga = 2\nka sikaa'
 const d=diagnose(source,run(source).error)
 assert.equal(d.code,'KASA-NAME001')
 assert.ok(d.suggestion.includes('declared')||d.suggestion.includes('Did you mean'))
})
test('Studio loads its offline diagnostic script and avoids inline HTML injection',async()=>{
 const html=await readFile(new URL('../public/kasa-studio/index.html',import.meta.url),'utf8')
 const script=await readFile(new URL('../public/kasa-studio/app.js',import.meta.url),'utf8')
 const sw=await readFile(new URL('../public/kasa-studio/sw.js',import.meta.url),'utf8')
 assert.match(html,/diagnostics\.js/)
 assert.match(html,/id="kasa-diagnostic"/)
 assert.match(script,/showStructuredDiagnostic/)
 assert.match(script,/textContent\s*=\s*diagnostic\.explanation/)
 assert.match(sw,/diagnostics\.js/)
})
