import { LearnerVerify } from '@/components/LearnerAccount'
export const metadata = { title: 'Verify learner email', robots: { index: false, follow: false } }
// Tokens are browser-only URL fragments, never server query parameters.
export default function VerifyEmailPage() {
  return <LearnerVerify />
}
