import { createAdminClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Droplets, AlertTriangle, Pill, Activity, Phone, Heart, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import PDFExportClient from '@/components/dashboard/PDFExportClient'

export const metadata = { title: 'Emergency Medical Profile | MedWallet' }

export default async function EmergencyProfilePage({ params }) {
  const { userId } = await params
  const supabase = await createAdminClient()

  const [{ data: profile }, { data: allergies }, { data: medications }, { data: conditions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase.from('allergies').select('allergen, reaction, severity').eq('user_id', userId),
    supabase.from('medications').select('name, dosage, frequency').eq('user_id', userId).eq('is_current', true),
    supabase.from('conditions').select('name, status').eq('user_id', userId),
  ])

  if (!profile) notFound()

  // Log the emergency access event anonymously
  supabase.rpc('log_audit_event', {
    p_user_id: userId,
    p_action: 'Emergency Profile Viewed',
    p_resource_type: 'emergency_profile'
  }).then(({error}) => { if (error) console.error('Failed to log audit event:', error) })

  const now = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="bg-red-600 dark:bg-red-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Heart className="w-4 h-4" /></div>
            <div>
              <div className="text-xs font-medium text-red-200 uppercase tracking-wider">Emergency Medical Profile</div>
              <div className="text-xs text-red-300">MedWallet · Accessed {now}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 flex justify-end">
        <PDFExportClient targetId="export-content" fileName={`MedWallet_ICE_${profile.full_name.replace(/\s+/g, '_')}.pdf`} />
      </div>

      <div id="export-content" className="bg-white dark:bg-zinc-950 pb-8">
        <div className="max-w-2xl mx-auto px-4 space-y-5">
          <div className="text-center py-4">
          <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-zinc-100">{profile.full_name}</h1>
          {profile.date_of_birth && <p className="text-gray-500 dark:text-zinc-400 mt-1">DOB: {new Date(profile.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
        </div>
        <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/20 p-6 text-center">
          <div className="card p-6 border-red-100 dark:border-red-500/10 bg-red-50/30 dark:bg-red-500/5">
          <div className="text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Blood / Genotype</div>
          <div className="font-display font-bold text-5xl text-red-700 dark:text-red-400">
            {profile.blood_type} <span className="text-2xl text-red-500 dark:text-red-400/50 opacity-75">/ {profile.genotype || 'Unknown'}</span>
          </div>
        </div>
        </div>
        <div className="rounded-2xl border-2 border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/10 p-5">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-500" /><h2 className="font-display font-bold text-orange-800 dark:text-orange-300 text-lg">ALLERGIES {allergies?.length > 0 ? `(${allergies.length})` : ''}</h2></div>
          {!allergies?.length ? <p className="text-orange-600 dark:text-orange-400 font-medium">No known allergies</p> : (
            <div className="space-y-2">
              {allergies.map((a, i) => (
                <div key={i} className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl px-4 py-2.5 border border-orange-100 dark:border-zinc-800">
                  <div><span className="font-bold text-gray-900 dark:text-zinc-100">{a.allergen}</span>{a.reaction && <span className="text-gray-500 dark:text-zinc-400 text-sm ml-2">— {a.reaction}</span>}</div>
                  {a.severity && <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${a.severity === 'severe' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' : a.severity === 'moderate' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'}`}>{a.severity}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-5">
          <div className="flex items-center gap-2 mb-3"><Pill className="w-5 h-5 text-blue-600 dark:text-blue-500" /><h2 className="font-display font-bold text-blue-800 dark:text-blue-300 text-lg">CURRENT MEDICATIONS {medications?.length > 0 ? `(${medications.length})` : ''}</h2></div>
          {!medications?.length ? <p className="text-blue-600 dark:text-blue-400 font-medium">No current medications</p> : (
            <div className="space-y-2">
              {medications.map((m, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl px-4 py-2.5 border border-blue-100 dark:border-zinc-800">
                  <span className="font-bold text-gray-900 dark:text-zinc-100">{m.name}</span>
                  {m.dosage && <span className="text-gray-500 dark:text-zinc-400 text-sm ml-2">{m.dosage}</span>}
                  {m.frequency && <span className="text-gray-400 dark:text-zinc-500 text-sm ml-2">· {m.frequency}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        {conditions?.length > 0 && (
          <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 p-5">
            <div className="flex items-center gap-2 mb-3"><Activity className="w-5 h-5 text-purple-600 dark:text-purple-500" /><h2 className="font-display font-bold text-purple-800 dark:text-purple-300 text-lg">CONDITIONS ({conditions.length})</h2></div>
            <div className="space-y-2">
              {conditions.map((c, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl px-4 py-2.5 border border-purple-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-zinc-100">{c.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' : c.status === 'managed' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400' : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {profile.emergency_contact_name && (
          <div className="rounded-2xl border-2 border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10 p-5">
            <div className="flex items-center gap-2 mb-3"><Phone className="w-5 h-5 text-green-600 dark:text-green-500" /><h2 className="font-display font-bold text-green-800 dark:text-green-300 text-lg">EMERGENCY CONTACT</h2></div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl px-4 py-3 border border-green-100 dark:border-zinc-800">
              <p className="font-bold text-gray-900 dark:text-zinc-100 text-lg">{profile.emergency_contact_name}</p>
              {profile.emergency_contact_relationship && <p className="text-gray-500 dark:text-zinc-400 text-sm">{profile.emergency_contact_relationship}</p>}
              {profile.emergency_contact_phone && <a href={`tel:${profile.emergency_contact_phone}`} className="flex items-center gap-2 mt-2 text-green-700 dark:text-green-400 font-bold text-xl"><Phone className="w-5 h-5" />{profile.emergency_contact_phone}</a>}
            </div>
          </div>
        )}
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-4 flex items-center gap-3">
          <Shield className="w-4 h-4 text-gray-400 shrink-0" />
          <p className="text-xs text-gray-500">This emergency profile is provided by MedWallet. Information is patient-provided. Always verify with the patient when possible.</p>
        </div>
        <div className="text-center pb-4"><a href="/" className="text-xs text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1.5"><Heart className="w-3 h-3" />Powered by MedWallet</a></div>
        </div>
      </div>
    </div>
  )
}
