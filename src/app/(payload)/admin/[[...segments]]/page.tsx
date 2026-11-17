import type { Metadata } from 'next'
import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap.js'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

/** Only the uninitialized-database error gets a setup message. Other errors still surface. */
function isMissingSchema(error: unknown): boolean {
  let current = error
  for (let depth = 0; depth < 10; depth++) {
    if (!current || typeof current !== 'object') return false
    const e = current as { code?: unknown; cause?: unknown }
    if (e.code === '42P01') return true
    current = e.cause
  }
  return false
}

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  try {
    return await generatePageMetadata({ config, params, searchParams })
  } catch (error) {
    if (isMissingSchema(error)) return { title: 'CMS setup pending | Kasa Learning Academy' }
    throw error
  }
}

const Page = async ({ params, searchParams }: Args) => {
  try {
    return await RootPage({ config, params, searchParams, importMap })
  } catch (error) {
    if (!isMissingSchema(error)) throw error
    return (
      <main style={{ maxWidth: 680, margin: '12vh auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <h1>Kasa Academy CMS setup pending</h1>
        <p>The learning website is online, but the CMS database tables have not yet been created. The admin dashboard will be available after the first PostgreSQL migration.</p>
        <p><strong>No administrator account has been created yet.</strong> The setup must be completed by the project owner using private credentials; do not share passwords or database URLs with anyone.</p>
        <p>
          <a href="https://github.com/fosterb1/kasa-learning-academy/blob/main/docs/DATABASE_INITIALIZATION.md">
            Read the database setup instructions
          </a>
        </p>
        <p><a href="/">Return to Kasa Learning Academy</a></p>
      </main>
    )
  }
}

export default Page
