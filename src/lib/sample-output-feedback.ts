/**
 * Beginner-friendly comparison for a single sample output.
 * We never change the pass rule: only matching expected output passes.
 * The explanatory heuristics below are intentionally narrow and must not
 * pretend that a calculation is correct on other inputs.
 */
export type SampleFeedback = {
  kind: 'pass' | 'missing-label' | 'number-mismatch' | 'whitespace' | 'case' | 'missing-lines' | 'extra-lines' | 'general'
  title: string
  explanation: string
  suggestion: string
}

export function normalizeSampleOutput(value: string) {
  return value.replace(/\r\n?/g, '\n').trimEnd()
}

function rows(value: string) {
  const text = normalizeSampleOutput(value)
  return text ? text.split('\n') : []
}

const numberPattern = '[+-]?(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)'
const numberOnly = new RegExp('^' + numberPattern + '$')
const labeledNumber = new RegExp('^(.+?\\s*:?\\s+)(' + numberPattern + ')$')

function toFiniteNumber(text: string): number | null {
  if (!numberOnly.test(text.trim())) return null
  const number = Number(text.trim())
  return Number.isFinite(number) ? number : null
}

export function explainSampleOutput(actual: string, expected: string): SampleFeedback {
  const got = normalizeSampleOutput(actual)
  const target = normalizeSampleOutput(expected)
  if (got === target) return {
    kind: 'pass', title: 'Output check passed!',
    explanation: 'Your program produced the expected output for this sample.',
    suggestion: 'Try changing a value and checking another case.'
  }

  const actualRows = rows(actual)
  const expectedRows = rows(expected)

  if (actualRows.length === expectedRows.length) {
    const mismatches = actualRows.map((line, index) => ({line: line.trim(), target: expectedRows[index].trim()}))
      .filter(pair => pair.line !== pair.target)
    if (mismatches.length === 1) {
      const {line, target: expectedLine} = mismatches[0]
      const expectedLabel = labeledNumber.exec(expectedLine)
      const actualNumber = toFiniteNumber(line)
      if (expectedLabel && actualNumber !== null) {
        const expectedNumber = toFiniteNumber(expectedLabel[2])
        if (expectedNumber !== null && actualNumber === expectedNumber) {
          return {
            kind: 'missing-label',
            title: 'Your number is correct — the output label is missing.',
            explanation: 'You printed ' + line + ', but this example expects ' + expectedLine + '. The calculation matches this sample; the printed format is different.',
            suggestion: 'Use ka " ' + expectedLabel[1].trimEnd().replace(/"/g, '') + ' " + nsɛm(your_total) (without the extra spaces around the label). For example: ka "' + expectedLabel[1].replace(/"/g, '') + '" + nsɛm(your_total). Replace your_total with your own variable name.'
          }
        }
        if (expectedNumber !== null) return {
          kind: 'number-mismatch',
          title: 'Your calculated number is different.',
          explanation: 'Your output is ' + line + ', while the example expects ' + expectedNumber + '.',
          suggestion: 'Check the values, arithmetic operators and intermediate totals before adding the printed label.'
        }
      }
      if (line.toLowerCase() === expectedLine.toLowerCase() && line !== expectedLine) return {
        kind: 'case', title: 'Check uppercase and lowercase letters.',
        explanation: 'The wording matches, but the letter capitalization is different.',
        suggestion: 'Compare the expected line character by character. The sample output check is case-sensitive.'
      }
      if (line.replace(/\s+/g, ' ') === expectedLine.replace(/\s+/g, ' ')) return {
        kind: 'whitespace', title: 'Your spacing is different.',
        explanation: 'The text appears to match, but spaces or tab characters differ.',
        suggestion: 'Compare spaces between words and around punctuation in the expected output.'
      }
    }
  }
  if (actualRows.length < expectedRows.length) return {
    kind: 'missing-lines', title: 'Your program printed fewer lines than expected.',
    explanation: 'The exercise expects ' + expectedRows.length + ' line(s), but your program printed ' + actualRows.length + '.',
    suggestion: 'Review which ka statements should run and whether a conditional branch or loop was skipped.'
  }
  if (actualRows.length > expectedRows.length) return {
    kind: 'extra-lines', title: 'Your program printed extra lines.',
    explanation: 'The exercise expects ' + expectedRows.length + ' line(s), but your program printed ' + actualRows.length + '.',
    suggestion: 'Check for extra ka statements and repeated printing inside a loop.'
  }
  return {
    kind: 'general', title: 'Your output is different from this example.',
    explanation: 'The program ran, but the displayed result is not an exact match for the sample output.',
    suggestion: 'Compare each line with the expected output. Check values, spelling, punctuation and whitespace.'
  }
}
