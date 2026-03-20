'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleVerification = async () => {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) { setStatus('error'); setMessage('Verification failed.'); return }
      if (session) {
        setStatus('success'); setMessage('Your email has been verified!')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else { setStatus('error'); setMessage('Invalid or expired verification link.') }
    }
    handleVerification()
  }, [router])

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="card p-8 text-center">
        {status === 'loading' && <><Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" /><h2 className="font-display font-semibold text-xl text-gray-900">Verifying...</h2></>}
        {status === 'success' && (<><div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-primary-600" /></div><h2 className="font-display font-semibold text-xl text-gray-900 mb-2">Email verified!</h2><p className="text-gray-500 text-sm mb-4">{message}</p><p className="text-xs text-gray-400">Redirecting to dashboard...</p></>)}
        {status === 'error' && (<><div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle className="w-8 h-8 text-red-500" /></div><h2 className="font-display font-semibold text-xl text-gray-900 mb-2">Verification failed</h2><p className="text-gray-500 text-sm mb-6">{message}</p><Link href="/login" className="btn-primary w-full justify-center">Back to sign in</Link></>)}
      </div>
    </motion.div>
  )
}
