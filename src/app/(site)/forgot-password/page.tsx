import { LearnerForgotPassword } from '@/components/LearnerRecovery'

export const metadata = { title: 'Recover learner account', robots: { index: false, follow: false } }

export default function ForgotPasswordPage() {
  return <LearnerForgotPassword />
}
