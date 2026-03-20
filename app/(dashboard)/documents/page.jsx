import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DocumentsClient from '@/components/documents/DocumentsClient'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: documents } = await supabase.from('documents').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false })
  return <DocumentsClient userId={user.id} documents={documents || []} />
}
