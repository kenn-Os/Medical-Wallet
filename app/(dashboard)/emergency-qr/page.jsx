import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import EmergencyQRClient from '@/components/qr/EmergencyQRClient'

export default async function EmergencyQRPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const [{ data: profile }, { data: allergies }, { data: medications }, { data: conditions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('allergies').select('allergen, severity').eq('user_id', user.id),
    supabase.from('medications').select('name, dosage').eq('user_id', user.id).eq('is_current', true),
    supabase.from('conditions').select('name, status').eq('user_id', user.id),
  ])
  const emergencyProfile = {
    universal_health_id: profile?.universal_health_id || null,
    full_name: profile?.full_name || 'Unknown', blood_type: profile?.blood_type || 'Unknown',
    allergies: allergies || [], medications: medications || [], conditions: conditions || [],
    emergency_contact_name: profile?.emergency_contact_name || null,
    emergency_contact_phone: profile?.emergency_contact_phone || null,
    emergency_contact_relationship: profile?.emergency_contact_relationship || null,
  }
  return <EmergencyQRClient userId={user.id} emergencyProfile={emergencyProfile} appUrl={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} />
}
