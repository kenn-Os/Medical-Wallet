import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ClinicalDashboardClient from '@/components/clinical/ClinicalDashboardClient'
import DoctorOnboardingClient from '@/components/clinical/DoctorOnboardingClient'
import Link from 'next/link'
import { Stethoscope, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default async function ClinicalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login?next=/clinical')

  const { data: docProfile } = await supabase
    .from('doctor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <>
      <header className="sticky top-0 z-20 bg-slate-900 text-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">MedWallet Clinical</h1>
            <p className="text-xs text-teal-200">Provider Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Patient Dashboard
          </Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-6 md:p-8">
        {!docProfile ? (
          <DoctorOnboardingClient user={user} />
        ) : (
          <ClinicalDashboardClient doctorProfile={docProfile} />
        )}
      </main>
    </>
  )
}
