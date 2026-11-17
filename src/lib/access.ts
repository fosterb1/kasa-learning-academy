import type { Access } from 'payload'

/** No public registration or content mutation in this academy. */
export const adminsOnly: Access = ({ req }) => Boolean(req.user && req.user.collection === 'users')

/** Public reads must never expose saved drafts or unpublished content. */
export const publishedOrAdmin: Access = ({ req }) => {
  if (req.user && req.user.collection === 'users') return true
  return { _status: { equals: 'published' } }
}

export const publicRead: Access = () => true
