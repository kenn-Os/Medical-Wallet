'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCheck, Plus, Copy, Trash2, Clock, CheckCircle, XCircle, Key, Eye, Shield, Info } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { getExpiryFromDuration, isExpired, formatDateTime, timeAgo } from '@/lib/utils'

const generateAccessPin = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(6)
    crypto.getRandomValues(array)
    for (let i = 0; i < 6; i++) {
      result += chars[array[i] % chars.length]
    }
  } else {
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }
  return result
}

const DURATIONS = [
  { value: '1h', label: '1 Hour', desc: 'Short consultation' },
  { value: '24h', label: '24 Hours', desc: 'Day visit or follow-up' },
  { value: '7d', label: '7 Days', desc: 'Extended care' },
]

export default function DoctorAccessClient({ userId, tokens: initialTokens, appUrl }) {
  const [tokens, setTokens] = useState(initialTokens)
  const [creating, setCreating] = useState(false)
  const [doctorName, setDoctorName] = useState('')
  const [doctorEmail, setDoctorEmail] = useState('')
  const [duration, setDuration] = useState('24h')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCreate = async () => {
    setLoading(true)
    try {
      const token = generateAccessPin()
      const expiresAt = getExpiryFromDuration(duration)
      
      console.log("DEBUG - NEW TOKEN GENERATED:", token, "Length:", token.length)
      
      const { data, error } = await supabase.from('doctor_access_tokens').insert({ user_id: userId, token, doctor_name: doctorName.trim() || null, doctor_email: doctorEmail.trim() || null, expires_at: expiresAt.toISOString(), is_active: true }).select().single()
      if (error) throw error
      setTokens(prev => [data, ...prev])
      setCreating(false); setDoctorName(''); setDoctorEmail(''); setDuration('24h')
      toast.success('Doctor access code created!')
    } catch (err) { toast.error(err.message || 'Failed to create token') }
    finally { setLoading(false) }
  }

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this access token?')) return
    await supabase.from('doctor_access_tokens').update({ is_active: false }).eq('id', id)
    setTokens(prev => prev.map(t => t.id === id ? { ...t, is_active: false } : t))
    toast.success('Access revoked')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this token permanently?')) return
    await supabase.from('doctor_access_tokens').delete().eq('id', id)
    setTokens(prev => prev.filter(t => t.id !== id))
    toast.success('Token deleted')
  }

  const copyLink = async (token) => {
    await navigator.clipboard.writeText(token)
    toast.success('Access code copied!')
  }

  const getStatus = (token) => {
    if (!token.is_active) return { label: 'Revoked', color: 'text-gray-500 bg-gray-50 border-gray-200 dark:text-zinc-400 dark:bg-zinc-800/50 dark:border-zinc-700' }
    if (isExpired(token.expires_at)) return { label: 'Expired', color: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20' }
    return { label: 'Active', color: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20' }
  }

  const activeTokens = tokens.filter(t => t.is_active && !isExpired(t.expires_at))
  const inactiveTokens = tokens.filter(t => !t.is_active || isExpired(t.expires_at))

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="font-display font-semibold text-xl text-gray-900 dark:text-zinc-100">Doctor Access</h2><p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Grant temporary view-only access to your records</p></div>
        <button onClick={() => setCreating(true)} className="btn-primary"><Plus className="w-4 h-4" />New Access Code</button>
      </div>

      <div className="card p-4 mb-6 flex items-start gap-3 bg-blue-50/50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800 dark:text-blue-200">Access codes allow doctors to view your full medical records temporarily via the Clinical Portal. Codes expire automatically and can be revoked at any time.</p>
      </div>

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card p-6 mb-6 border-primary-200 dark:border-primary-500/20 bg-primary-50/30 dark:bg-primary-900/10">
            <h3 className="font-display font-semibold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary-600 dark:text-primary-500" />New Doctor Access Code</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div><label className="label">Doctor Name (optional)</label><input value={doctorName} onChange={e => setDoctorName(e.target.value)} className="input" placeholder="Dr. Jane Smith" /></div>
              <div><label className="label">Doctor Email (optional)</label><input value={doctorEmail} onChange={e => setDoctorEmail(e.target.value)} type="email" className="input" placeholder="doctor@hospital.com" /></div>
            </div>
            <div className="mb-5">
              <label className="label">Access Duration</label>
              <div className="grid grid-cols-3 gap-3">
                {DURATIONS.map(d => (
                  <button key={d.value} onClick={() => setDuration(d.value)} className={`p-3 rounded-xl border text-left transition-all ${duration === d.value ? 'border-primary-400 dark:border-primary-500 bg-primary-50 dark:bg-primary-500/10 shadow-sm' : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-primary-200 dark:hover:border-primary-500/50'}`}>
                    <div className="font-semibold text-sm text-gray-900 dark:text-zinc-100">{d.label}</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCreating(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Generating...' : <><Key className="w-4 h-4" />Generate Access Code</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTokens.length > 0 && (
        <div className="mb-6">
          <h3 className="font-display font-semibold text-sm text-gray-700 dark:text-zinc-300 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Active Access ({activeTokens.length})</h3>
          <div className="space-y-3">
            {activeTokens.map(token => {
              const status = getStatus(token)
              return (
                <motion.div key={token.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center shrink-0"><UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" /></div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap"><p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">{token.doctor_name || 'Anonymous Access'}</p><span className={`badge text-[10px] ${status.color}`}>{status.label}</span></div>
                        {token.doctor_email && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{token.doctor_email}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-zinc-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Expires {formatDateTime(token.expires_at)}</span>
                          {token.accessed_at && <span className="flex items-center gap-1"><Eye className="w-3 h-3" />Last accessed {timeAgo(token.accessed_at)}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => copyLink(token.token)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Copy link"><Copy className="w-4 h-4" /></button>
                      <button onClick={() => handleRevoke(token.id)} className="p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 text-gray-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors" title="Revoke"><XCircle className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(token.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800/50 flex flex-col items-center justify-center gap-2 text-center overflow-hidden">
                    <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Access Code</div>
                    {token.token.length > 10 ? (
                      <code className="text-sm font-mono text-gray-900 dark:text-zinc-100 break-all px-2 text-center w-full">{token.token}</code>
                    ) : (
                      <code className="text-3xl font-mono text-gray-900 dark:text-zinc-100 tracking-[0.5em] font-bold">{token.token}</code>
                    )}
                    <button onClick={() => copyLink(token.token)} className="text-xs text-primary-600 dark:text-primary-500 font-medium mt-1">Copy Code</button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {inactiveTokens.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm text-gray-500 dark:text-zinc-400 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />Expired / Revoked ({inactiveTokens.length})</h3>
          <div className="space-y-2">
            {inactiveTokens.map(token => {
              const status = getStatus(token)
              return (
                <div key={token.id} className="card p-4 opacity-70 flex items-center justify-between gap-4">
                  <div><p className="font-medium text-gray-700 dark:text-zinc-300 text-sm">{token.doctor_name || 'Anonymous Access'}</p><div className="flex items-center gap-2 mt-1"><span className={`badge text-[10px] ${status.color}`}>{status.label}</span><span className="text-xs text-gray-400 dark:text-zinc-500">Created {timeAgo(token.created_at)}</span></div></div>
                  <button onClick={() => handleDelete(token.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tokens.length === 0 && !creating && (
        <div className="card p-12 text-center border-dashed dark:border-zinc-800 dark:bg-zinc-900/50">
          <UserCheck className="w-10 h-10 text-gray-200 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-zinc-500 text-sm mb-4">No access codes created yet</p>
          <button onClick={() => setCreating(true)} className="btn-primary mx-auto"><Plus className="w-4 h-4" />Create your first access code</button>
        </div>
      )}
    </div>
  )
}
