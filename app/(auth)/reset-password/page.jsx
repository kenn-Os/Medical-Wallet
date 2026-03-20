'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to send reset email')
      setSent(true)
    } catch (err) { toast.error(err.message || 'Failed to send reset email') }
    finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="card p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="font-display font-semibold text-xl text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm mb-6">We&apos;ve sent a password reset link to your email.</p>
            <Link href="/login" className="btn-primary w-full justify-center">Back to sign in</Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-display font-semibold text-2xl text-gray-900 mb-1">Reset password</h1>
              <p className="text-gray-500 text-sm">Enter your email and we&apos;ll send a reset link</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <input {...register('email', { required: true })} type="email" placeholder="you@example.com" className="input pl-10" />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
