import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: ['pg'],
  async headers() {
    return [
      { source: '/reset-password', headers: [
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'Cache-Control', value: 'no-store' },
      ] },
      { source: '/verify-email', headers: [
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'Cache-Control', value: 'no-store' },
      ] },
    ]
  },
}

export default withPayload(config)
