'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, ShieldAlert, Smartphone, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export default function TwoFactorCard({ user }) {
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  
  // Enrollment state
  const [enrolling, setEnrolling] = useState(false)
  const [factorId, setFactorId] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [secret, setSecret] = useState(null)
  
  // Verification state
  const [verifyCode, setVerifyCode] = useState('')
  const [verifying, setVerifying] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkMfaStatus()
  }, [])

  const checkMfaStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (error) throw error
      // If nextLevel is aal2, it means the user has enrolled at least one factor
      setIsEnrolled(data.nextLevel === 'aal2')
    } catch (err) {
      console.error('Error checking MFA status:', err)
    } finally {
      setLoading(false)
    }
  }

  const startEnrollment = async () => {
    setEnrolling(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) throw error
      
      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
    } catch (err) {
      toast.error(err.message || 'Failed to start MFA enrollment')
      setEnrolling(false)
    }
  }

  const verifyEnrollment = async () => {
    if (verifyCode.length < 6) return toast.error('Please enter a 6-digit code')
    
    setVerifying(true)
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
      if (challengeError) throw challengeError

      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode
      })

      if (verifyError) throw verifyError

      toast.success('Two-factor authentication enabled successfully!')
      setIsEnrolled(true)
      setEnrolling(false)
      setQrCode(null)
      setVerifyCode('')
    } catch (err) {
      toast.error(err.message || 'Failed to verify code. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const disableMfa = async () => {
    try {
      // Get all factors
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
      if (factorsError) throw factorsError

      // Unenroll all TOTP factors
      for (const factor of factors.totp) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
        if (error) throw error
      }
      
      toast.success('Two-factor authentication disabled')
      setIsEnrolled(false)
    } catch (err) {
      toast.error('Failed to disable MFA: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="card p-6 mb-5 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 mb-5">
      <h3 className="font-display font-semibold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
        <Smartphone className="w-4 h-4 text-primary-600 dark:text-primary-500" />
        Two-Factor Authentication (2FA)
      </h3>

      {isEnrolled ? (
        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-800 dark:text-green-300">2FA is Enabled</p>
            <p className="text-sm text-green-700 dark:text-green-400/80 mt-1">Your account is secured with a TOTP authenticator app. You will be required to enter a code whenever you sign in.</p>
            <div className="mt-4">
              <button onClick={disableMfa} className="btn-danger py-1.5 px-3 text-xs">Disable 2FA</button>
            </div>
          </div>
        </div>
      ) : enrolling && qrCode ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-sm text-gray-900 dark:text-zinc-100 font-medium mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary-600 dark:text-primary-500" /> Scan QR Code
          </p>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">Use an authenticator app like Google Authenticator, Authy, or 1Password to scan this QR code.</p>
          
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm" dangerouslySetInnerHTML={{ __html: qrCode }} />
          </div>

          <div className="max-w-xs mx-auto">
            <label className="label">Verification Code</label>
            <input 
              type="text" 
              maxLength={6} 
              value={verifyCode} 
              onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))} 
              className="input text-center font-mono text-lg tracking-[0.5em]" 
              placeholder="000000" 
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setEnrolling(false); setQrCode(null) }} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={verifyEnrollment} disabled={verifying || verifyCode.length !== 6} className="btn-primary flex-1 justify-center">
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Enable'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-orange-800 dark:text-orange-300">2FA is Not Enabled</p>
            <p className="text-sm text-orange-700 dark:text-orange-400 mt-1 mb-4">Protect your medical records from unauthorized access. We highly recommend enabling two-factor authentication.</p>
            <button onClick={startEnrollment} disabled={enrolling} className="btn-primary py-2 text-sm justify-center">
              {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /> Setup 2FA</>}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
