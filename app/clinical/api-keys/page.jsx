import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ApiKeysClient from '@/components/clinical/ApiKeysClient'
import Link from 'next/link'
import { ChevronLeft, Stethoscope } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default async function ApiKeysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login?next=/clinical/api-keys')

  return (
    <>
      <header className="sticky top-0 z-20 bg-slate-900 text-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">MedWallet Clinical</h1>
            <p className="text-xs text-teal-200">Developer Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/clinical" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-6 md:p-8">
        <Link href="/clinical" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <ApiKeysClient user={user} />
      </main>
    </>
  )
}
