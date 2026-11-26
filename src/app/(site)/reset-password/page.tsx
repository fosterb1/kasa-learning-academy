import { LearnerResetPassword } from '@/components/LearnerRecovery'

export const metadata = { title: 'Reset learner password', robots: { index: false, follow: false } }

// Tokens are browser-only URL fragments. Never read them via server searchParams.
export default function ResetPasswordPage() {
  return <LearnerResetPassword />
}
