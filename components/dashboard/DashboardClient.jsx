'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Droplets, AlertTriangle, Pill, Activity, FolderOpen, UserCheck, ArrowRight, Shield, Clock, QrCode } from 'lucide-react'
import { cn, verificationBadge, isExpired, formatDate } from '@/lib/utils'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export default function DashboardClient({ profile, allergies, medications, conditions, documentCount, accessTokens, userId }) {
  const activeTokens = accessTokens.filter(t => !isExpired(t.expires_at))
  const stats = [
    { label: 'Blood Type', value: profile?.blood_type || '—', icon: Droplets, color: 'text-red-600', bg: 'bg-red-50', href: '/profile' },
    { label: 'Genotype', value: profile?.genotype || '—', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50', href: '/profile' },
    { label: 'Allergies', value: allergies.length, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', href: '/records' },
    { label: 'Medications', value: medications.length, icon: Pill, color: 'text-blue-600', bg: 'bg-blue-50', href: '/records' },
    { label: 'Conditions', value: conditions.length, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50', href: '/records' },
    { label: 'Documents', value: documentCount, icon: FolderOpen, color: 'text-teal-600', bg: 'bg-teal-50', href: '/documents' },
    { label: 'Active Access', value: activeTokens.length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/doctor-access' },
  ]
  const profileComplete = profile?.full_name && profile?.blood_type && profile?.emergency_contact_phone
  const displayName = profile?.full_name || 'there'

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="font-display font-semibold text-2xl text-gray-900">Hello, {displayName.split(' ')[0]} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your health wallet overview</p>
      </motion.div>

      {!profileComplete && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><Shield className="w-4 h-4 text-amber-600" /></div>
            <div>
              <p className="font-medium text-sm text-amber-800">Complete your health profile</p>
              <p className="text-xs text-amber-600">Add your blood type and emergency contact for full protection</p>
            </div>
          </div>
          <Link href="/profile" className="btn-secondary text-xs px-3 py-1.5 shrink-0">Complete <ArrowRight className="w-3.5 h-3.5" /></Link>
        </motion.div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} variants={item}>
              <Link href={stat.href} className="card card-hover p-4 flex flex-col items-start gap-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', stat.bg)}><Icon className={cn('w-4 h-4', stat.color)} /></div>
                <div><div className="font-display font-semibold text-xl text-gray-900">{stat.value}</div><div className="text-xs text-gray-500 mt-0.5">{stat.label}</div></div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900 text-sm">Allergies</h3>
            <Link href="/records" className="text-xs text-primary-600 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {allergies.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No allergies recorded</p> : (
            <div className="space-y-2">
              {allergies.slice(0, 4).map(a => {
                const badge = verificationBadge(a.verified_status)
                return (
                  <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div><p className="text-sm font-medium text-gray-800">{a.allergen}</p>{a.severity && <p className="text-xs text-gray-400 capitalize">{a.severity}</p>}</div>
                    <span className={cn('badge text-[10px]', badge.color)}>{badge.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-900 text-sm">Current Medications</h3>
            <Link href="/records" className="text-xs text-primary-600 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {medications.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No current medications</p> : (
            <div className="space-y-2">
              {medications.slice(0, 4).map(m => (
                <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div><p className="text-sm font-medium text-gray-800">{m.name}</p>{m.dosage && <p className="text-xs text-gray-400">{m.dosage} · {m.frequency}</p>}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
          <h3 className="font-display font-semibold text-gray-900 text-sm mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: '/emergency-qr', icon: QrCode, label: 'View Emergency QR', color: 'text-blue-600 bg-blue-50' },
              { href: '/doctor-access', icon: UserCheck, label: 'Share with Doctor', color: 'text-emerald-600 bg-emerald-50' },
              { href: '/documents', icon: FolderOpen, label: 'Upload Document', color: 'text-teal-600 bg-teal-50' },
              { href: `/emergency/${userId}`, icon: Shield, label: 'Emergency Profile', color: 'text-red-600 bg-red-50' },
            ].map(action => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', action.color)}><Icon className="w-4 h-4" /></div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 ml-auto group-hover:text-gray-500" />
                </Link>
              )
            })}
          </div>
        </motion.div>
      </div>

      {activeTokens.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /><h3 className="font-display font-semibold text-gray-900 text-sm">Active Doctor Access</h3></div>
            <Link href="/doctor-access" className="text-xs text-primary-600 flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-2">
            {activeTokens.map(token => (
              <div key={token.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-100">
                <div><p className="text-sm font-medium text-gray-800">{token.doctor_name || 'Anonymous Doctor'}</p><p className="text-xs text-gray-500">Expires {formatDate(token.expires_at)}</p></div>
                <span className="badge text-[10px] text-orange-700 bg-orange-100 border-orange-200">Active</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
