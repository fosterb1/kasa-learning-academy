import type { CollectionConfig } from 'payload'
import { adminsOnly, publishedOrAdmin } from '@/lib/access'

export const Challenges: CollectionConfig = {
  slug: 'challenges',
  admin: { useAsTitle: 'title', group: 'Learning Content' },
  versions: { drafts: true },
  access: { read: publishedOrAdmin, readVersions: adminsOnly, create: adminsOnly, update: adminsOnly, delete: adminsOnly },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'difficulty', type: 'select', options: ['beginner','intermediate','advanced'], defaultValue: 'beginner', required: true },
    { name: 'order', type: 'number', required: true, defaultValue: 0 },
    { name: 'task', type: 'textarea', required: true },
    { name: 'starterCode', type: 'code', admin: { language: 'text' } },
    { name: 'expectedOutput', type: 'textarea' },
    { name: 'hint', type: 'textarea' },
    { name: 'starterInput', type: 'textarea' },
  ],
}
