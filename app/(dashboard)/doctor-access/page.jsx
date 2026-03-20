import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DoctorAccessClient from '@/components/doctor/DoctorAccessClient'

export default async function DoctorAccessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: tokens } = await supabase.from('doctor_access_tokens').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  return <DoctorAccessClient userId={user.id} tokens={tokens || []} appUrl={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} />
}
