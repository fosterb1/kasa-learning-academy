import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('My Learning uses published lessons from existing CMS access layer', async () => {
  const page = await read('src/app/(site)/my-learning/page.tsx')
  assert.match(page, /lessons\(\)/)
  assert.match(page, /modules\(\)/)
  assert.match(page, /LearningProgress/)
  assert.doesNotMatch(page, /overrideAccess:\s*true|fetch\(['"]\/api\/users/)
})

test('Dashboard uses existing browser storage without accounts or network', async () => {
  const dashboard = await read('src/components/LearningProgress.tsx')
  const button = await read('src/components/CompleteLesson.tsx')
  assert.match(dashboard, /kasa-academy-completed-v1/)
  assert.match(button, /kasa-academy-completed-v1/)
  assert.match(dashboard, /kasa-academy-progress-changed/)
  assert.match(button, /dispatchEvent\(new Event\('kasa-academy-progress-changed'\)\)/)
  assert.match(dashboard, /window\.addEventListener\('storage'/)
  assert.match(dashboard, /typeof slug === 'string' && known\.has\(slug\)/)
  assert.doesNotMatch(dashboard, /fetch\(|navigator\.sendBeacon|sessionStorage/)
})

test('Progress route is linked from navigation and curriculum', async () => {
  const layout = await read('src/app/(site)/layout.tsx')
  const learn = await read('src/app/(site)/learn/page.tsx')
  assert.match(layout, /href="\/my-learning"/)
  assert.match(learn, /href="\/my-learning"/)
})

test('Upgrade does not modify the CMS database schema or bootstrap', async () => {
  const pkg = JSON.parse(await read('package.json'))
  assert.match(pkg.scripts['test:smoke'], /tests\/\*\.test\.mjs/)
  const page = await read('src/app/(site)/my-learning/page.tsx')
  assert.doesNotMatch(page, /getPayload|db\.create|db\.update|migrate/)
})
