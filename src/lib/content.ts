import 'server-only'
import { getPayload } from 'payload'
import config from '@payload-config'

export type LearningPoint = { heading: string; detail: string }
export type QuizChoice = { answerText: string }
export type AcademyModule = { id: string | number; title: string; slug: string; subtitle: string; description: string; order: number }
export type Lesson = {
  id: string | number; title: string; slug: string; subtitle: string; difficulty: string;
  durationMinutes: number; order: number; overview: string; module: AcademyModule | string | number;
  learningPoints: LearningPoint[]; sourceCode: string; expectedOutput: string;
  starterInput: string; challenge: string; quizQuestion: string;
  quizChoices: QuizChoice[]; correctChoice: number; quizExplanation: string;
}
export type Challenge = { id: string | number; title: string; slug: string; difficulty: string; order: number; task: string; starterCode: string; starterInput: string; expectedOutput: string; hint: string }
export type Guide = { id: string | number; title: string; slug: string; summary: string; order: number; bodyMarkdown: string }
export type Announcement = { id: string | number; title: string; slug: string; summary: string; bodyMarkdown: string; createdAt: string }

import { fallbackModules, fallbackLessons, fallbackChallenges, fallbackGuides } from './fallback-content'

const published = { _status: { equals: 'published' } } as const

/**
 * PostgreSQL 42P01 means initial Payload tables have not yet been migrated.
 * Fall back only for this specific error. Never hide real database failures.
 */
function isUninitializedDatabase(error: unknown): boolean {
  let current: unknown = error
  for (let depth = 0; depth < 10; depth++) {
    if (!current || typeof current !== 'object') return false
    const value = current as { code?: unknown; cause?: unknown }
    if (value.code === '42P01') return true
    current = value.cause
  }
  return false
}

async function readOrFallback<T>(read: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await read()
  } catch (error) {
    if (!isUninitializedDatabase(error)) throw error
    return fallback()
  }
}

async function content() {
  return getPayload({ config })
}

/**
 * Keep the bundled free curriculum visible between the initial schema
 * migration and the very first seed. Never expose fallback material when
 * any record exists in the corresponding CMS collection, including drafts.
 */
async function whileUnseeded<T>(
  db: Awaited<ReturnType<typeof content>>,
  collection: 'modules' | 'lessons' | 'challenges' | 'guides',
  actual: T,
  seed: T,
): Promise<T> {
  const count = await db.count({ collection, overrideAccess: true })
  return count.totalDocs === 0 ? seed : actual
}

export async function modules(): Promise<AcademyModule[]> {
  return readOrFallback(async () => {
    const db = await content()
    const res = await db.find({ collection: 'modules', limit: 100, sort: 'order', overrideAccess: false })
    return res.docs.length ? res.docs as unknown as AcademyModule[] : whileUnseeded(db, 'modules', [] as AcademyModule[], fallbackModules)
  }, () => fallbackModules)
}
export async function lessons(): Promise<Lesson[]> {
  return readOrFallback(async () => {
    const db = await content()
    const res = await db.find({ collection: 'lessons', limit: 200, sort: 'order', where: published, depth: 1, overrideAccess: false })
    return res.docs.length ? res.docs as unknown as Lesson[] : whileUnseeded(db, 'lessons', [] as Lesson[], fallbackLessons)
  }, () => fallbackLessons)
}
export async function lessonBySlug(slug: string): Promise<Lesson | null> {
  return readOrFallback(async () => {
    const db = await content()
    const res = await db.find({ collection: 'lessons', limit: 1, depth: 1, overrideAccess: false, where: { and: [published, { slug: { equals: slug } }] } })
    return res.docs.length ? res.docs[0] as unknown as Lesson : whileUnseeded(db, 'lessons', null as Lesson | null, fallbackLessons.find(item => item.slug === slug) ?? null)
  }, () => fallbackLessons.find(item => item.slug === slug) ?? null)
}
export async function challenges(): Promise<Challenge[]> {
  return readOrFallback(async () => {
    const db = await content()
    const res = await db.find({ collection: 'challenges', limit: 150, sort: 'order', overrideAccess: false, where: published })
    return res.docs.length ? res.docs as unknown as Challenge[] : whileUnseeded(db, 'challenges', [] as Challenge[], fallbackChallenges)
  }, () => fallbackChallenges)
}
export async function challengeBySlug(slug: string): Promise<Challenge | null> {
  return readOrFallback(async () => {
    const db = await content()
    const res = await db.find({ collection: 'challenges', limit: 1, overrideAccess: false, where: { and: [published, { slug: { equals: slug } }] } })
    return res.docs.length ? res.docs[0] as unknown as Challenge : whileUnseeded(db, 'challenges', null as Challenge | null, fallbackChallenges.find(item => item.slug === slug) ?? null)
  }, () => fallbackChallenges.find(item => item.slug === slug) ?? null)
}
export async function guides(): Promise<Guide[]> {
  return readOrFallback(async () => {
    const db = await content()
    const res = await db.find({ collection: 'guides', limit: 100, sort: 'order', overrideAccess: false, where: published })
    return res.docs.length ? res.docs as unknown as Guide[] : whileUnseeded(db, 'guides', [] as Guide[], fallbackGuides)
  }, () => fallbackGuides)
}
export async function guideBySlug(slug: string): Promise<Guide | null> {
  return readOrFallback(async () => {
    const db = await content()
    const res = await db.find({ collection: 'guides', limit: 1, overrideAccess: false, where: { and: [published, { slug: { equals: slug } }] } })
    return res.docs.length ? res.docs[0] as unknown as Guide : whileUnseeded(db, 'guides', null as Guide | null, fallbackGuides.find(item => item.slug === slug) ?? null)
  }, () => fallbackGuides.find(item => item.slug === slug) ?? null)
}
export async function announcements(): Promise<Announcement[]> {
  return readOrFallback(async () => {
    const db = await content()
    const res = await db.find({ collection: 'announcements', limit: 50, sort: '-createdAt', overrideAccess: false, where: published })
    return res.docs as unknown as Announcement[]
  }, () => [])
}
