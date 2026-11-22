import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Users } from '@/collections/Users'
import { Learners } from '@/collections/Learners'
import { Modules } from '@/collections/Modules'
import { Lessons } from '@/collections/Lessons'
import { Challenges } from '@/collections/Challenges'
import { Guides } from '@/collections/Guides'
import { Announcements } from '@/collections/Announcements'
import { PlaygroundSettings } from '@/globals/PlaygroundSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  admin: { user: Users.slug, importMap: { baseDir: path.resolve(dirname) }, meta: { titleSuffix: ' | Kasa Academy CMS' } },
  editor: lexicalEditor(),
  collections: [Users, Learners, Modules, Lessons, Challenges, Guides, Announcements],
  globals: [PlaygroundSettings],
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL || '' } }),
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  cors: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],
})
