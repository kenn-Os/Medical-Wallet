import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import InsuranceClient from '@/components/dashboard/InsuranceClient'

export default async function InsurancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cards } = await supabase.from('insurance_cards').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  
  return <InsuranceClient userId={user.id} initialCards={cards || []} />
}
