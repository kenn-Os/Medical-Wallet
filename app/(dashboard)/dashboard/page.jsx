import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile }, { data: allergies }, { data: medications },
    { data: conditions }, { data: documents }, { data: accessTokens },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('allergies').select('*').eq('user_id', user.id),
    supabase.from('medications').select('*').eq('user_id', user.id).eq('is_current', true),
    supabase.from('conditions').select('*').eq('user_id', user.id),
    supabase.from('documents').select('id').eq('user_id', user.id),
    supabase.from('doctor_access_tokens').select('*').eq('user_id', user.id).eq('is_active', true),
  ])

  return <DashboardClient profile={profile} allergies={allergies || []} medications={medications || []} conditions={conditions || []} documentCount={documents?.length || 0} accessTokens={accessTokens || []} userId={user.id} />
}
