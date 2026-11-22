/** Idempotent initial curriculum import. Will NEVER overwrite edited content. */
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

if (process.env.SEED_CONTENT !== 'yes') {
  console.error('To seed, explicitly set SEED_CONTENT=yes in .env.local. Existing lessons are preserved.')
  process.exit(1)
}
const payload = await getPayload({ config })
const admin = await payload.count({ collection: 'users', overrideAccess: true })
if (admin.totalDocs === 0) throw new Error('Create the first administrator before seeding lessons.')
const curriculumUrl = new URL('./content/curriculum.json', import.meta.url)
const curriculum = JSON.parse(await readFile(fileURLToPath(curriculumUrl), 'utf8')) as {
  modules: { id: string; subtitle: string; description: string }[]
  lessons: {id:string;unit:string;title:string;subtitle:string;mins:number;overview:string;points:[string,string][];code:string;expected:string;task:string;quiz:{question:string;choices:string[];answer:number;explanation:string};input:string}[]
  practices:{id:string;title:string;level:string;task:string;start:string;expected:string;hint:string;input:string}[]
}

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
async function existing(collection: 'modules'|'lessons'|'challenges'|'guides'|'announcements', slug: string) {
  const r=await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })
  return r.docs[0]
}

// The PostgreSQL-backed Payload Modules collection uses numeric IDs.
const moduleIds = new Map<string, number>()
for (const [i, m] of curriculum.modules.entries()) {
  const slug = slugify(m.id)
  let record = await existing('modules',slug)
  if (!record) record = await payload.create({collection:'modules',overrideAccess:true,data:{title:m.id,slug,subtitle:m.subtitle,description:m.description,order:i}})
  if (typeof record.id !== 'number') throw new Error('Expected numeric module ID for '+m.id)
  moduleIds.set(m.id, record.id)
}
let createdLessons=0
for (const [i,l] of curriculum.lessons.entries()) {
  if (await existing('lessons',l.id)) continue
  const moduleId=moduleIds.get(l.unit)
  if (!moduleId) throw new Error('Unknown learning module: '+l.unit)
  await payload.create({ collection:'lessons', overrideAccess:true, draft:false, data: {
    title:l.title,slug:l.id,module:moduleId,subtitle:l.subtitle,difficulty:i<8?'beginner':i<16?'intermediate':'advanced',
    durationMinutes:l.mins,order:i+1,overview:l.overview,
    learningPoints:l.points.map(([heading,detail])=>({heading,detail})),
    sourceCode:l.code,starterInput:l.input||'',expectedOutput:l.expected,challenge:l.task,
    quizQuestion:l.quiz.question,quizChoices:l.quiz.choices.map(answerText=>({answerText})),
    correctChoice:l.quiz.answer,quizExplanation:l.quiz.explanation,_status:'published',
  }})
  createdLessons++
}
let createdChallenges=0
for(const [i,c] of curriculum.practices.entries()) {
  const slug='challenge-'+c.id
  if(await existing('challenges',slug))continue
  await payload.create({collection:'challenges',overrideAccess:true,draft:false,data:{
    title:c.title,slug,order:i+1,difficulty:c.level==='Easy'?'beginner':c.level==='Medium'?'intermediate':'advanced',task:c.task,
    starterCode:c.start,expectedOutput:c.expected,hint:c.hint,starterInput:c.input||'',_status:'published',
  }})
  createdChallenges++
}
const guides=[
  {
    slug:'start-in-browser',title:'Start coding in Kasa — no installation',order:1,
    summary:'Run your first Twi program in your browser.',
    bodyMarkdown:`## Step 1: Open a free lesson\n\nChoose **Learn** and open a lesson with a code editor. The runtime runs locally in your browser—no Python download or server signup is required.\n\n## Step 2: Write your first program\n\n\`\`\`text\nka "Maakye, Ghana!"\n\`\`\`\n\nSelect **Run code** to print your greeting.\n\n## Step 3: Explore\n\nTry changing words in quotes, then use \`ma\`, \`sɛ\`, \`mpɛn\` and \`dwumadie\` in later lessons. Saving lessons as completed uses browser storage; clearing your storage clears that progress.\n\n## Limitations\n\nThe in-browser Kasa interpreter is experimental and supports a subset of ongoing language development.\n`,
  },
  {
    slug:'install-python-cli',title:'Install the Kasa CLI (Windows, macOS or Linux)',order:2,
    summary:'Install the Python-based command-line interpreter for .kasa files.',
    bodyMarkdown:`## Requirements\n\nInstall Python **3.11+** and Git. Check with \`python --version\` and \`git --version\`. On Windows you may need to use \`py\` instead of \`python\`.\n\n## Clone Kasa\n\n\`\`\`bash\ngit clone https://github.com/fosterb1/kasa_programming_language.git\ncd kasa_programming_language\n\`\`\`\n\n## Create a virtual environment\n\n\`\`\`bash\npython -m venv .venv\n\`\`\`\n\nWindows PowerShell: \`.venv\\Scripts\\Activate.ps1\`\n\nmacOS/Linux: \`source .venv/bin/activate\`\n\n## Install and run\n\n\`\`\`bash\npython -m pip install -e .\npython -m kasa --version\npython -m kasa run examples/hello.kasa\n\`\`\`\n\nYou should see \`Maakye, Ghana!\`.\n\n## Write your own file\n\nSave \`ka "Akwaaba!"\` in a UTF-8 file named \`hello.kasa\`. Execute with:\n\n\`\`\`bash\npython -m kasa run hello.kasa\n\`\`\`\n\nCheck syntax without executing: \`python -m kasa check hello.kasa\`.\n`,
  },
  {
    slug:'build-native-compiler',title:'Build Kasa Native (advanced)',order:3,
    summary:'Compile the standalone C++20 Kasa compiler and virtual machine.',
    bodyMarkdown:`## Requirements\n\nInstall CMake (3.16+) and a C++20-capable compiler, such as GCC, Clang or Visual Studio.\n\n## Build from source\n\n\`\`\`bash\ngit clone https://github.com/fosterb1/kasa_programming_language.git\ncd kasa_programming_language\ncmake -S native -B build -DCMAKE_BUILD_TYPE=Release\ncmake --build build --config Release\n\`\`\`\n\n## Run\n\nOn Linux/macOS with a single-configuration build:\n\n\`\`\`bash\n./build/kasa-native run examples/hello.kasa\n\`\`\`\n\nOn Windows, the binary may be in \`build/Release/kasa-native.exe\`.\n\nThe native compiler is experimental and may differ from the Python CLI in integer ranges, diagnostics or decimal formatting. See the [main Kasa repository](https://github.com/fosterb1/kasa_programming_language) for current status.\n`,
  },
]
let createdGuides=0
for(const g of guides) {
  if(await existing('guides',g.slug))continue
  await payload.create({collection:'guides',overrideAccess:true,draft:false,data:{...g,_status:'published'}})
  createdGuides++
}
console.log(`Seed complete: ${createdLessons} new lessons, ${createdChallenges} challenges, ${createdGuides} guides; existing records kept unchanged.`)
process.exit(0)
