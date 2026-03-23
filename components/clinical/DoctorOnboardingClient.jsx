'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Stethoscope, Building2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const schema = z.object({
  first_name: z.string().min(2, 'Required'),
  last_name: z.string().min(2, 'Required'),
  specialty: z.string().min(2, 'Required'),
  hospital_clinic: z.string().min(2, 'Required'),
  license_number: z.string().min(5, 'Required for verification'),
  country: z.string().min(2, 'Required'),
})

export default function DoctorOnboardingClient({ user }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('doctor_profiles').insert({
        user_id: user.id,
        full_name: `${data.first_name.trim()} ${data.last_name.trim()}`,
        specialization: data.specialty,
        hospital_affiliation: data.hospital_clinic,
        license_number: data.license_number,
        country: data.country,
        verified: true // Auto-verify for testing purposes in beta
      })

      if (error) throw error
      toast.success('Provider profile created successfully!')
      router.refresh()
    } catch (err) {
      toast.error('Failed to create profile: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-zinc-100 mb-2">Register as a Healthcare Provider</h2>
        <p className="text-slate-500 dark:text-zinc-400">Join the MedWallet clinical ecosystem to securely access verified patient records during consultations.</p>
      </div>

      <div className="card p-8 border-t-4 border-t-teal-500">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">First Name</label>
              <input {...register('first_name')} className="input focus:ring-teal-500" placeholder="Jane" />
              {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="label">Last Name</label>
              <input {...register('last_name')} className="input focus:ring-teal-500" placeholder="Doe" />
              {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
            </div>
          </div>
          
          <div>
            <label className="label">Primary Specialty</label>
            <input {...register('specialty')} className="input focus:ring-teal-500" placeholder="e.g. Cardiology, General Practice" />
            {errors.specialty && <p className="text-xs text-red-500 mt-1">{errors.specialty.message}</p>}
          </div>

          <div>
            <label className="label">Hospital / Clinic Name</label>
            <div className="relative">
              <Building2 className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input {...register('hospital_clinic')} className="input pl-10 focus:ring-teal-500" placeholder="City General Hospital" />
            </div>
            {errors.hospital_clinic && <p className="text-xs text-red-500 mt-1">{errors.hospital_clinic.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Medical License Number</label>
              <input {...register('license_number')} className="input focus:ring-teal-500 font-mono" placeholder="MD-12345678" />
              {errors.license_number && <p className="text-xs text-red-500 mt-1">{errors.license_number.message}</p>}
            </div>
            <div>
              <label className="label">Country of Practice</label>
              <input {...register('country')} className="input focus:ring-teal-500" placeholder="United States" />
              {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country.message}</p>}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 flex gap-3 mt-6">
            <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
            <p className="text-sm text-slate-600 dark:text-zinc-400">By registering, you agree to access patient records solely for the purpose of medical treatment and consultation as authorized by the patient's token.</p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2 mt-4">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
