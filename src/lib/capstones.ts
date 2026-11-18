import curriculum from '../../scripts/content/curriculum.json'

/** Published as free, read-only practice alongside CMS challenges.
 * Existing CMS challenges are never overwritten.
 */
export const capstones = curriculum.practices
  .filter(item => ['p9','p10','p11','p12','p13'].includes(item.id))
  .map(item => ({
    id: item.id,
    slug: item.id,
    title: item.title,
    difficulty: item.level,
    task: item.task,
    starterCode: item.start,
    expectedOutput: item.expected,
    hint: item.hint,
    starterInput: item.input,
  }))
