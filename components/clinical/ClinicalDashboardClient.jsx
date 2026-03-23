'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Search, Key, User, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const schema = z.object({
  health_id: z.string().min(5, 'Required. format: MW-XXXXXXX'),
  token: z.string().length(6, 'Token must be exactly 6 characters'),
})

export default function ClinicalDashboardClient({ doctorProfile }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // We pass the inputs to the RPC. It will verify the token, log the access, and return the patient's user_id.
      const { data: patientUserId, error } = await supabase.rpc('verify_doctor_access', {
        p_health_id: data.health_id,
        p_token: data.token
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!patientUserId) {
        throw new Error('Verification failed: Patient not found or token invalid')
      }

      toast.success('Access Granted')
      
      // Redirect to the protected patient view
      router.push(`/clinical/patient/${patientUserId}?health_id=${data.health_id}&token=${data.token}`)
      
    } catch (err) {
      toast.error(err.message || 'Access Denied. Check ID and Token.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto mt-10">
      
      <div className="mb-8 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 flex items-start gap-4">
        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-800 rounded-full flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-teal-700 dark:text-teal-300" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-teal-900 dark:text-teal-100">Welcome, Dr. {doctorProfile.last_name}</h2>
          <p className="text-sm text-teal-700 dark:text-teal-300 mt-0.5">{doctorProfile.hospital_clinic} • {doctorProfile.specialty}</p>
          <div className="mt-3">
            <Link href="/clinical/api-keys" className="text-xs font-medium text-teal-800 dark:text-teal-200 bg-teal-200/50 dark:bg-teal-800/50 hover:bg-teal-200 dark:hover:bg-teal-700/50 px-3 py-1.5 rounded-lg transition-colors">
              Developer & API Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="card p-8 border-t-4 border-t-slate-800 dark:border-t-zinc-200">
        <div className="text-center mb-6">
          <h3 className="font-display font-semibold text-xl text-slate-900 dark:text-zinc-100 mb-2">Access Patient Records</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Enter the patient&apos;s MedWallet ID and the 6-digit access token provided to you.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label text-slate-700 dark:text-zinc-300">MedWallet Health ID</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input 
                {...register('health_id')} 
                className="input pl-10 focus:ring-teal-500 uppercase font-mono tracking-wider" 
                placeholder="MW-ABC12345" 
              />
            </div>
            {errors.health_id && <p className="text-xs text-red-500 mt-1">{errors.health_id.message}</p>}
          </div>

          <div>
            <label className="label text-slate-700 dark:text-zinc-300">6-Digit Access Token</label>
            <div className="relative">
              <Key className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input 
                {...register('token')} 
                maxLength={6}
                className="input pl-10 focus:ring-teal-500 font-mono tracking-[0.5em] text-lg text-center" 
                placeholder="000000" 
              />
            </div>
            {errors.token && <p className="text-xs text-red-500 mt-1">{errors.token.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2 mt-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {loading ? 'Verifying Access...' : 'Authenticate & Access'}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
