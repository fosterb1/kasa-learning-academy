import type { CollectionConfig } from 'payload'
import { adminsOnly, publishedOrAdmin } from '@/lib/access'
import { youtubeVideoId } from '@/lib/video'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'module', 'order', '_status'], group: 'Learning Content' },
  versions: { drafts: { autosave: true } },
  access: { read: publishedOrAdmin, readVersions: adminsOnly, create: adminsOnly, update: adminsOnly, delete: adminsOnly },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'module', type: 'relationship', relationTo: 'modules', required: true },
    { name: 'subtitle', type: 'text' },
    { name: 'difficulty', type: 'select', options: ['beginner','intermediate','advanced'], defaultValue: 'beginner', required: true },
    { name: 'durationMinutes', type: 'number', min: 1, defaultValue: 5 },
    { name: 'order', type: 'number', defaultValue: 0, required: true },
    { name: 'overview', type: 'textarea', required: true },
    { name: 'learningPoints', type: 'array', fields: [
      { name: 'heading', type: 'text', required: true },
      { name: 'detail', type: 'textarea', required: true },
    ] },
    { name: 'sourceCode', type: 'code', required: true, admin: { language: 'text' } },
    { name: 'starterInput', type: 'textarea' },
    { name: 'expectedOutput', type: 'textarea' },
    { name: 'challenge', type: 'textarea' },
    { name: 'quizQuestion', type: 'text' },
    { name: 'quizChoices', type: 'array', maxRows: 6, fields: [
      { name: 'answerText', type: 'text', required: true },
    ] },
    { name: 'correctChoice', type: 'number', min: 0 },
    { name: 'quizExplanation', type: 'textarea' },
    {
      name: 'videoUrl', type: 'text', label: 'YouTube lesson URL',
      admin: { description: 'Upload the recording to YouTube (Public or Unlisted), then paste a YouTube watch, share, Shorts, or embed URL.' },
      validate: (value: unknown) => !value || (typeof value === 'string' && youtubeVideoId(value)) ? true : 'Enter a valid HTTPS YouTube video URL or leave the field empty.',
    },
    { name: 'videoTitle', type: 'text', label: 'Video title', admin: { description: 'Optional title shown above the video player.' } },
    {
      name: 'videoLanguage', type: 'select', label: 'Language spoken in the video',
      defaultValue: 'bilingual',
      options: [
        { label: 'Twi / Akan', value: 'twi' },
        { label: 'English', value: 'english' },
        { label: 'Twi and English', value: 'bilingual' },
      ],
    },
    {
      name: 'transcriptTwi', type: 'textarea', label: 'Twi / Akan transcript', maxLength: 250000,
      admin: {
        description: 'Transcribe the YouTube video attached to this lesson, upload a .vtt/.srt file, or paste captions; review and Publish.',
        components: { Field: '/components/admin/TranscriptUploadField#TranscriptUploadField' },
      },
    },
    {
      name: 'transcriptEnglish', type: 'textarea', label: 'English transcript', maxLength: 250000,
      admin: {
        description: 'Generate English captions directly from the attached YouTube URL, upload .vtt/.srt, or paste corrected text.',
        components: { Field: '/components/admin/TranscriptUploadField#TranscriptUploadField' },
      },
    },
  ],
}
