import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('admin reads attached YouTube video field directly, no second upload required', async () => {
 const code=await readFile(new URL('../src/components/admin/TranscriptUploadField.tsx',import.meta.url),'utf8')
 assert.match(code,/useField<string>\(\{ path: 'videoUrl' \}\)/)
 assert.match(code,/Transcribe linked video/)
 assert.match(code,/JSON\.stringify\(\{ videoUrl: attachedVideoUrl, language \}\)/)
})
test('link generation and optional audio upload are separate options',async()=>{
 const code=await readFile(new URL('../src/components/admin/TranscriptUploadField.tsx',import.meta.url),'utf8')
 assert.match(code,/Option 1 — Transcribe/)
 assert.match(code,/Option 2 — Upload/)
 assert.match(code,/Option 3 — Import/)
 assert.match(code,/sessionStorage\.setItem\(key, result\.jobId\)/)
})
test('protected server endpoint guards URL, auth and provider credentials',async()=>{
 const code=await readFile(new URL('../src/app/(site)/api/academy-transcribe-url/route.ts',import.meta.url),'utf8')
 assert.match(code,/await authenticated\(request\)/)
 assert.match(code,/youtubeVideoId\(requestData\.videoUrl\)/)
 assert.match(code,/process\.env\.SUPADATA_API_KEY/)
 assert.match(code,/searchParams\.set\('mode', 'auto'\)/)
 assert.doesNotMatch(code,/NEXT_PUBLIC_SUPADATA_API_KEY/)
})
