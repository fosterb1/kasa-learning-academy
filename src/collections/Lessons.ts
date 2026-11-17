import type { CollectionConfig } from 'payload'
import { adminsOnly, publishedOrAdmin } from '@/lib/access'

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
  ],
}
