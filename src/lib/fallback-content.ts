import 'server-only'
import curriculum from '../../scripts/content/curriculum.json'
import type { AcademyModule, Lesson, Challenge, Guide } from './content'

/**
 * Public, read-only curriculum available only before the first database migration.
 * After the CMS tables exist, PostgreSQL remains authoritative, including for drafts.
 * This file must never be imported by the CMS admin or used to grant permissions.
 */
const slugify = (input: string) =>
  input.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const fallbackModules: AcademyModule[] = curriculum.modules.map((item, order) => ({
  id: slugify(item.id),
  title: item.id,
  slug: slugify(item.id),
  subtitle: item.subtitle,
  description: item.description,
  order,
}))

const moduleByTitle = new Map(fallbackModules.map(item => [item.title, item]))

export const fallbackLessons: Lesson[] = curriculum.lessons.map((item, index) => {
  const module = moduleByTitle.get(item.unit)
  if (!module) throw new Error('Unknown built-in Kasa learning module: ' + item.unit)
  return {
    id: item.id,
    slug: item.id,
    title: item.title,
    subtitle: item.subtitle,
    difficulty: index < 8 ? 'beginner' : index < 16 ? 'intermediate' : 'advanced',
    durationMinutes: item.mins,
    order: index + 1,
    overview: item.overview,
    module,
    learningPoints: item.points.map(([heading, detail]) => ({ heading, detail })),
    sourceCode: item.code,
    expectedOutput: item.expected,
    starterInput: item.input || '',
    challenge: item.task,
    quizQuestion: item.quiz.question,
    quizChoices: item.quiz.choices.map(answerText => ({ answerText })),
    correctChoice: item.quiz.answer,
    quizExplanation: item.quiz.explanation,
  }
})

export const fallbackChallenges: Challenge[] = curriculum.practices.map((item, index) => ({
  id: item.id,
  slug: 'challenge-' + item.id,
  title: item.title,
  difficulty: item.level === 'Easy' ? 'beginner' : item.level === 'Medium' ? 'intermediate' : 'advanced',
  order: index + 1,
  task: item.task,
  starterCode: item.start,
  starterInput: item.input || '',
  expectedOutput: item.expected,
  hint: item.hint,
}))

/** Setup guides are public reference material while the content database is empty. */
const markdown = (...lines: string[]) => lines.join('\n')
export const fallbackGuides: Guide[] = [
  {
    id: 'start-in-browser',
    slug: 'start-in-browser',
    title: 'Start coding in Kasa — no installation',
    summary: 'Run your first Twi program directly in the browser.',
    order: 1,
    bodyMarkdown: markdown(
      '## Start with a free lesson', '',
      'Choose **Learn** and open **Welcome to Kasa**. Edit the code and press **Run code**. You do not need to install Python or create an account.', '',
      '## Try your first program', '',
      '```text', 'ka "Maakye, Ghana!"', '```', '',
      'After running the example, change the words between quotation marks and run it again.', '',
      '## Your progress', '',
      'Lesson completion is stored locally in this browser. Clearing browser storage clears that progress.', '',
      'Kasa is experimental, so some language features may change during development.'
    ),
  },
  {
    id: 'install-python-cli',
    slug: 'install-python-cli',
    title: 'Install the Kasa CLI (Windows, macOS or Linux)',
    summary: 'Install the Python-based command-line interpreter for .kasa files.',
    order: 2,
    bodyMarkdown: markdown(
      '## Requirements', '',
      'Install **Python 3.11 or newer** and Git. Check your installation with `python --version` and `git --version` (or `py --version` on Windows).', '',
      '## Clone the official source', '',
      '```bash', 'git clone https://github.com/fosterb1/kasa_programming_language.git',
      'cd kasa_programming_language', '```', '',
      '## Create and activate a virtual environment', '',
      '```bash', 'python -m venv .venv', '```', '',
      'On Windows PowerShell, activate with `.venv\\Scripts\\Activate.ps1`. On macOS/Linux, use `source .venv/bin/activate`.', '',
      '## Install and run your first program', '',
      '```bash', 'python -m pip install -e .', 'python -m kasa --version',
      'python -m kasa run examples/hello.kasa', '```', '',
      'Save your own UTF-8 program as `hello.kasa`. Run it with `python -m kasa run hello.kasa`, or check syntax using `python -m kasa check hello.kasa`.'
    ),
  },
  {
    id: 'build-native-compiler',
    slug: 'build-native-compiler',
    title: 'Build Kasa Native (advanced)',
    summary: 'Compile the standalone C++20 Kasa compiler and virtual machine.',
    order: 3,
    bodyMarkdown: markdown(
      '## Requirements', '',
      'Install **CMake 3.16+** and a compiler with C++20 support, such as GCC, Clang or Visual Studio.', '',
      '## Build from source', '',
      '```bash',
      'git clone https://github.com/fosterb1/kasa_programming_language.git',
      'cd kasa_programming_language',
      'cmake -S native -B build -DCMAKE_BUILD_TYPE=Release',
      'cmake --build build --config Release',
      '```', '',
      '## Run a program', '',
      '```bash', './build/kasa-native run examples/hello.kasa', '```', '',
      'On Windows, the executable may instead be `build/Release/kasa-native.exe`.', '',
      'Kasa Native remains experimental and may differ from the Python CLI. Follow updates in the [main Kasa repository](https://github.com/fosterb1/kasa_programming_language).'
    ),
  },
]
