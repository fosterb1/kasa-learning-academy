import type { CollectionConfig } from 'payload'
import { adminsOnly, publicRead } from '@/lib/access'

export const Modules: CollectionConfig = {
  slug: 'modules',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'order', 'updatedAt'], group: 'Learning Content' },
  access: { read: publicRead, create: adminsOnly, update: adminsOnly, delete: adminsOnly },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'subtitle', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'order', type: 'number', required: true, defaultValue: 0 },
  ],
}
