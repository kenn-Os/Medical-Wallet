'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, UserPlus, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Needs uppercase').regex(/[0-9]/, 'Needs a number'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, { message: "Passwords don't match", path: ['confirm_password'] })

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: data.email, password: data.password,
        options: { data: { full_name: data.full_name }, emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email` },
      })
      if (error) throw error
      toast.success('Account created! Check your email to verify.')
      router.push('/login')
    } catch (err) { toast.error(err.message || 'Signup failed') }
    finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="card p-8">
        <div className="mb-8">
          <h1 className="font-display font-semibold text-2xl text-gray-900 mb-1">Create your wallet</h1>
          <p className="text-gray-500 text-sm">Secure, portable, patient-controlled health records</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input {...register('full_name')} className="input" placeholder="John Doe" />
            {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="label">Email address</label>
            <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPassword ? 'text' : 'password'} className="input pr-10" placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input {...register('confirm_password')} type={showPassword ? 'text' : 'password'} className="input" placeholder="Repeat your password" />
            {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password.message}</p>}
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary-50 border border-primary-100">
            <ShieldCheck className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
            <p className="text-xs text-primary-700 leading-relaxed">Your data is encrypted with AES-256. We never sell your health information.</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Creating wallet...' : 'Create wallet'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
        </p>
      </div>
    </motion.div>
  )
}
