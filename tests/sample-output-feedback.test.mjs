import test from 'node:test'
import assert from 'node:assert/strict'
import { explainSampleOutput, normalizeSampleOutput } from '../src/lib/sample-output-feedback.ts'

test('market receipt: right total but missing the required label', () => {
  const result = explainSampleOutput('46\n', 'Total GHS: 46\n')
  assert.equal(result.kind, 'missing-label')
  assert.match(result.title, /number is correct/i)
  assert.match(result.explanation, /calculation matches this sample/)
  assert.match(result.suggestion, /ka "Total GHS: " \+ nsɛm\(your_total\)/)
})

test('same total with label passes', () => {
  const result = explainSampleOutput('Total GHS: 46\r\n', 'Total GHS: 46\n')
  assert.equal(result.kind, 'pass')
})

test('incorrect total is never called correct', () => {
  const result = explainSampleOutput('45\n', 'Total GHS: 46\n')
  assert.equal(result.kind, 'number-mismatch')
  assert.doesNotMatch(result.title, /correct/i)
})

test('different lines and text do not receive false calculation-success feedback', () => {
  const result = explainSampleOutput('46\n46\n', 'Total GHS: 46\n')
  assert.equal(result.kind, 'extra-lines')
  assert.equal(explainSampleOutput('Oops!\n', 'Total GHS: 46\n').kind, 'general')
})

test('capitalization and internal spacing are explained when relevant', () => {
  assert.equal(explainSampleOutput('pass\n', 'Pass\n').kind, 'case')
  assert.equal(explainSampleOutput('Total  GHS: 46\n', 'Total GHS: 46\n').kind, 'whitespace')
})

test('sample normalization tolerates trailing newline, not altered labels', () => {
  assert.equal(normalizeSampleOutput('hello\r\n'), 'hello')
  assert.equal(explainSampleOutput('46', 'Total GHS: 46').kind, 'missing-label')
  assert.notEqual(explainSampleOutput('Total GHS : 46', 'Total GHS: 46').kind, 'pass')
})
