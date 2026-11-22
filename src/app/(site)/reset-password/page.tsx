import { LearnerResetPassword } from '@/components/LearnerRecovery'

export const metadata = { title: 'Reset learner password', robots: { index: false, follow: false } }

export default async function ResetPasswordPage({ searchParams }: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return <LearnerResetPassword token={typeof token === 'string' ? token : ''} />
}
