import { LearnerSignup } from '@/components/LearnerSignup'

export const metadata = {
  title: 'Create a learner account',
  robots: { index: false, follow: false },
}

export default function SignupPage() {
  return <LearnerSignup />
}
