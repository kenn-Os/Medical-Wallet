'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Trash2, Shield, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import DeleteAccountModal from './DeleteAccountModal'

const passwordSchema = z.object({
  new_password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Needs uppercase').regex(/[0-9]/, 'Needs a number'),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, { message: "Passwords don't match", path: ['confirm_password'] })

export default function SettingsClient({ user }) {
  const router = useRouter()
  const [showNew, setShowNew] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(passwordSchema) })

  const handlePasswordChange = async (data) => {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.new_password })
    if (error) { toast.error(error.message); return }
    toast.success('Password updated'); reset()
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error: profileError } = await supabase.from('profiles').delete().eq('user_id', user.id)
      if (profileError) throw profileError
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (err) {
      toast.error(err.message || 'Failed to delete account')
      setShowDeleteModal(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page-container max-w-2xl">
      <div className="mb-6"><h2 className="font-display font-semibold text-xl text-gray-900">Settings</h2><p className="text-sm text-gray-500 mt-0.5">Manage your account and security preferences</p></div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-5">
        <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary-600" />Account Information</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50"><span className="text-sm text-gray-500">Email</span><span className="text-sm font-medium text-gray-900">{user.email}</span></div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Email verified</span>
            <span className={`badge text-xs ${user.email_confirmed_at ? 'text-green-700 bg-green-50 border-green-200' : 'text-orange-700 bg-orange-50 border-orange-200'}`}>{user.email_confirmed_at ? 'Verified' : 'Unverified'}</span>
          </div>
          <div className="flex items-center justify-between py-2"><span className="text-sm text-gray-500">Member since</span><span className="text-sm text-gray-900">{new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6 mb-5">
        <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-primary-600" />Change Password</h3>
        <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input {...register('new_password')} type={showNew ? 'text' : 'password'} className="input pr-10" placeholder="Min 8 chars, uppercase + number" autoComplete="new-password" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            {errors.new_password && <p className="text-xs text-red-500 mt-1">{errors.new_password.message}</p>}
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input {...register('confirm_password')} type={showNew ? 'text' : 'password'} className="input" autoComplete="new-password" />
            {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 mb-5 bg-primary-50/30 border-primary-100">
        <h3 className="font-display font-semibold text-gray-900 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary-600" />Security & Privacy</h3>
        <ul className="space-y-2">
          {['All medical records are encrypted with AES-256', 'Row-level security ensures only you can access your data', 'Doctor access tokens expire automatically', 'All data access is audit logged', 'We never sell or share your health information'].map(item => (
            <li key={item} className="flex items-center gap-2 text-sm text-gray-600"><div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />{item}</li>
          ))}
        </ul>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6 border-red-200 bg-red-50/30">
        <h3 className="font-display font-semibold text-red-800 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">Deleting your account will permanently remove all your health records, documents, and data. This cannot be undone.</p>
        <button onClick={() => setShowDeleteModal(true)} disabled={deleting} className="btn-danger">
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {deleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </motion.div>

      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        deleting={deleting}
      />
    </div>
  )
}
