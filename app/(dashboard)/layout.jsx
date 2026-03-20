import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopBar user={user} profile={profile} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
