import type { CollectionConfig } from 'payload'
import { adminsOnly, publishedOrAdmin } from '@/lib/access'

export const Guides: CollectionConfig = {
  slug: 'guides',
  admin: { useAsTitle: 'title', group: 'Learning Content' },
  versions: { drafts: true },
  access: { read: publishedOrAdmin, readVersions: adminsOnly, create: adminsOnly, update: adminsOnly, delete: adminsOnly },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'summary', type: 'textarea' },
    { name: 'bodyMarkdown', type: 'textarea', required: true, admin: { description: 'Supports Markdown, fenced code blocks, and links.' } },
    { name: 'order', type: 'number', defaultValue: 0, required: true },
  ],
}
