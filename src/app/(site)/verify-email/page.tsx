import { LearnerVerify } from '@/components/LearnerAccount'
export const metadata = { title: 'Verify learner email' }
export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
 const { token } = await searchParams
 return <LearnerVerify token={typeof token === 'string' ? token : ''} />
}
