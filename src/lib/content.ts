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

const published = { _status: { equals: 'published' } } as const

/** Explicit published filters protect visitors even if local API defaults change. */
async function content() {
  return getPayload({ config })
}

export async function modules(): Promise<AcademyModule[]> {
  const db = await content()
  const res = await db.find({ collection: 'modules', limit: 100, sort: 'order', overrideAccess: false })
  return res.docs as unknown as AcademyModule[]
}
export async function lessons(): Promise<Lesson[]> {
  const db = await content()
  const res = await db.find({ collection: 'lessons', limit: 200, sort: 'order', where: published, depth: 1, overrideAccess: false })
  return res.docs as unknown as Lesson[]
}
export async function lessonBySlug(slug: string): Promise<Lesson | null> {
  const db = await content()
  const res = await db.find({ collection: 'lessons', limit: 1, depth: 1, overrideAccess: false, where: { and: [published, { slug: { equals: slug } }] } })
  return (res.docs[0] as unknown as Lesson | undefined) ?? null
}
export async function challenges(): Promise<Challenge[]> {
  const db = await content()
  const res = await db.find({ collection: 'challenges', limit: 150, sort: 'order', overrideAccess: false, where: published })
  return res.docs as unknown as Challenge[]
}
export async function challengeBySlug(slug: string): Promise<Challenge | null> {
  const db = await content()
  const res = await db.find({ collection: 'challenges', limit: 1, overrideAccess: false, where: { and: [published, { slug: { equals: slug } }] } })
  return (res.docs[0] as unknown as Challenge | undefined) ?? null
}
export async function guides(): Promise<Guide[]> {
  const db = await content()
  const res = await db.find({ collection: 'guides', limit: 100, sort: 'order', overrideAccess: false, where: published })
  return res.docs as unknown as Guide[]
}
export async function guideBySlug(slug: string): Promise<Guide | null> {
  const db = await content()
  const res = await db.find({ collection: 'guides', limit: 1, overrideAccess: false, where: { and: [published, { slug: { equals: slug } }] } })
  return (res.docs[0] as unknown as Guide | undefined) ?? null
}
export async function announcements(): Promise<Announcement[]> {
  const db = await content()
  const res = await db.find({ collection: 'announcements', limit: 50, sort: '-createdAt', overrideAccess: false, where: published })
  return res.docs as unknown as Announcement[]
}
