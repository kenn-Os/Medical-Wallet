import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import RecordsClient from '@/components/records/RecordsClient'

export default async function RecordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const [{ data: allergies }, { data: medications }, { data: conditions }, { data: surgeries }, { data: vaccinations }, { data: labs }] = await Promise.all([
    supabase.from('allergies').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('medications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('conditions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('surgeries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('vaccinations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('lab_results').select('*').eq('user_id', user.id).order('test_date', { ascending: false }),
  ])
  return <RecordsClient userId={user.id} allergies={allergies || []} medications={medications || []} conditions={conditions || []} surgeries={surgeries || []} vaccinations={vaccinations || []} labs={labs || []} />
}
