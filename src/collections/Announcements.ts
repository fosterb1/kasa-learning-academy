import type { CollectionConfig } from 'payload'
import { adminsOnly, publishedOrAdmin } from '@/lib/access'

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  admin: { useAsTitle: 'title', group: 'Updates' },
  versions: { drafts: true },
  access: { read: publishedOrAdmin, readVersions: adminsOnly, create: adminsOnly, update: adminsOnly, delete: adminsOnly },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'summary', type: 'textarea', required: true },
    { name: 'bodyMarkdown', type: 'textarea' },
  ],
}
