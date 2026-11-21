/**
 * Read-only diagnostics for missing lesson video previews.
 *
 * Run explicitly in a development/staging environment with an existing
 * Payload connection:
 *   VIDEO_AUDIT_READONLY=yes node --env-file=.env.local --import tsx scripts/audit-lesson-videos.ts
 *
 * Never seed, publish, edit drafts, or print unlisted YouTube URLs.
 */
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import { youtubeVideoId } from '../src/lib/video.ts'

if (process.env.VIDEO_AUDIT_READONLY !== 'yes') {
 console.error('Read-only video audit disabled. Set VIDEO_AUDIT_READONLY=yes explicitly.')
 process.exit(1)
}

const db = await getPayload({ config })
let page = 1
let total = 0
let playable = 0
let missing = 0
let invalid = 0
let draftDiffers = 0
let draftOnly = 0
const issues: { slug: string; published: string; draft: string }[] = []

while (true) {
 const response = await db.find({
  collection: 'lessons',
  overrideAccess: true,
  depth: 0,
  draft: true,
  limit: 100,
  page,
  sort: 'slug',
 })
 for (const latest of response.docs) {
  const slug = String(latest.slug || '')
  const latestUrl = typeof latest.videoUrl === 'string' ? latest.videoUrl : ''
  const draftVideo = !latestUrl ? 'missing' : youtubeVideoId(latestUrl) ? 'valid' : 'invalid'
  const pub = await db.find({
   collection: 'lessons',
   overrideAccess: true,
   depth: 0,
   limit: 1,
   where: { and: [{slug: {equals: slug}}, {_status: {equals: 'published'}}] },
  })
  const published = pub.docs[0]
  const pubUrl = typeof published?.videoUrl === 'string' ? published.videoUrl : ''
  const publishedVideo = !published ? 'not-published' : !pubUrl ? 'missing' : youtubeVideoId(pubUrl) ? 'valid' : 'invalid'
  total++
  if (publishedVideo === 'valid') playable++
  if (publishedVideo === 'missing') missing++
  if (publishedVideo === 'invalid') invalid++
  if (!published) draftOnly++
  if (published && latestUrl.trim() !== pubUrl.trim()) draftDiffers++
  if (publishedVideo !== 'valid' || (published && latestUrl.trim() !== pubUrl.trim())) {
   issues.push({slug,published:publishedVideo,draft:draftVideo})
  }
 }
 if (!response.hasNextPage) break
 page++
}
console.log(JSON.stringify({
 mode:'read-only',
 checked:total,
 publishedWithPlayableVideo:playable,
 publishedMissingVideo:missing,
 publishedInvalidVideo:invalid,
 unpublishedLessons:draftOnly,
 draftPublishedUrlDifferences:draftDiffers,
 issues,
},null,2))
process.exit(0)
