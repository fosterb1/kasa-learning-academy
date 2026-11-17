import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: ['pg'],
}

export default withPayload(config)
