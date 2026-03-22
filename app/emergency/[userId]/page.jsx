import { createAdminClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Droplets, AlertTriangle, Pill, Activity, Phone, Heart, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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

  const now = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-red-600 text-white">
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
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div className="text-center py-4">
          <h1 className="font-display font-bold text-3xl text-gray-900">{profile.full_name}</h1>
          {profile.date_of_birth && <p className="text-gray-500 mt-1">DOB: {new Date(profile.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
        </div>
        <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-6 text-center">
          <div className="card p-6 border-red-100 bg-red-50/30">
          <div className="text-sm font-medium text-red-600 uppercase tracking-wider mb-1">Blood / Genotype</div>
          <div className="font-display font-bold text-5xl text-red-700">
            {profile.blood_type} <span className="text-2xl text-red-500 opacity-75">/ {profile.genotype || 'Unknown'}</span>
          </div>
        </div>
        </div>
        <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5 text-orange-600" /><h2 className="font-display font-bold text-orange-800 text-lg">ALLERGIES {allergies?.length > 0 ? `(${allergies.length})` : ''}</h2></div>
          {!allergies?.length ? <p className="text-orange-600 font-medium">No known allergies</p> : (
            <div className="space-y-2">
              {allergies.map((a, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-orange-100">
                  <div><span className="font-bold text-gray-900">{a.allergen}</span>{a.reaction && <span className="text-gray-500 text-sm ml-2">— {a.reaction}</span>}</div>
                  {a.severity && <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${a.severity === 'severe' ? 'bg-red-100 text-red-700' : a.severity === 'moderate' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{a.severity}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center gap-2 mb-3"><Pill className="w-5 h-5 text-blue-600" /><h2 className="font-display font-bold text-blue-800 text-lg">CURRENT MEDICATIONS {medications?.length > 0 ? `(${medications.length})` : ''}</h2></div>
          {!medications?.length ? <p className="text-blue-600 font-medium">No current medications</p> : (
            <div className="space-y-2">
              {medications.map((m, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-2.5 border border-blue-100">
                  <span className="font-bold text-gray-900">{m.name}</span>
                  {m.dosage && <span className="text-gray-500 text-sm ml-2">{m.dosage}</span>}
                  {m.frequency && <span className="text-gray-400 text-sm ml-2">· {m.frequency}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        {conditions?.length > 0 && (
          <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-5">
            <div className="flex items-center gap-2 mb-3"><Activity className="w-5 h-5 text-purple-600" /><h2 className="font-display font-bold text-purple-800 text-lg">CONDITIONS ({conditions.length})</h2></div>
            <div className="space-y-2">
              {conditions.map((c, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-2.5 border border-purple-100 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{c.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-red-100 text-red-700' : c.status === 'managed' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {profile.emergency_contact_name && (
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5">
            <div className="flex items-center gap-2 mb-3"><Phone className="w-5 h-5 text-green-600" /><h2 className="font-display font-bold text-green-800 text-lg">EMERGENCY CONTACT</h2></div>
            <div className="bg-white rounded-xl px-4 py-3 border border-green-100">
              <p className="font-bold text-gray-900 text-lg">{profile.emergency_contact_name}</p>
              {profile.emergency_contact_relationship && <p className="text-gray-500 text-sm">{profile.emergency_contact_relationship}</p>}
              {profile.emergency_contact_phone && <a href={`tel:${profile.emergency_contact_phone}`} className="flex items-center gap-2 mt-2 text-green-700 font-bold text-xl"><Phone className="w-5 h-5" />{profile.emergency_contact_phone}</a>}
            </div>
          </div>
        )}
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-center gap-3">
          <Shield className="w-4 h-4 text-gray-400 shrink-0" />
          <p className="text-xs text-gray-500">This emergency profile is provided by MedWallet. Information is patient-provided. Always verify with the patient when possible.</p>
        </div>
        <div className="text-center pb-4"><a href="/" className="text-xs text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1.5"><Heart className="w-3 h-3" />Powered by MedWallet</a></div>
      </div>
    </div>
  )
}
