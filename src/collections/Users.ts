import type { CollectionConfig } from 'payload'
import { adminsOnly } from '@/lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email', group: 'Administration' },
  access: {
    admin: adminsOnly,
    create: adminsOnly,
    read: adminsOnly,
    update: adminsOnly,
    delete: adminsOnly,
  },
  fields: [
    { name: 'displayName', type: 'text', required: true },
  ],
}
