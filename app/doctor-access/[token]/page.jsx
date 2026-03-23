import { createAdminClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { isExpired, formatDate, formatDateTime, verificationBadge } from '@/lib/utils'
import { Heart, Shield, Droplets, AlertTriangle, Pill, Activity, Scissors, Syringe, Clock, Eye, XCircle } from 'lucide-react'

export const metadata = { title: 'Doctor View | MedWallet' }

export default async function DoctorAccessPage({ params }) {
  const { token } = await params
  const supabase = await createAdminClient()

  const { data: accessToken } = await supabase
    .from('doctor_access_tokens').select('*').eq('token', token).eq('is_active', true).single()

  if (!accessToken) return notFound()
  if (isExpired(accessToken.expires_at)) return <ExpiredPage expiresAt={accessToken.expires_at} />

  await supabase.from('doctor_access_tokens').update({ accessed_at: new Date().toISOString() }).eq('id', accessToken.id)

  const userId = accessToken.user_id
  const [
    { data: profile }, { data: allergies }, { data: medications },
    { data: conditions }, { data: surgeries }, { data: vaccinations }, { data: documents },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase.from('allergies').select('*').eq('user_id', userId),
    supabase.from('medications').select('*').eq('user_id', userId),
    supabase.from('conditions').select('*').eq('user_id', userId),
    supabase.from('surgeries').select('*').eq('user_id', userId),
    supabase.from('vaccinations').select('*').eq('user_id', userId),
    supabase.from('documents').select('id, title, document_type, file_name, uploaded_at').eq('user_id', userId),
  ])

  if (!profile) return notFound()

  const SectionHeader = ({ icon: Icon, title, color }) => (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
      <Icon className={`w-4 h-4 ${color}`} />
      <h3 className="font-display font-semibold text-gray-900">{title}</h3>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center"><Heart className="w-3.5 h-3.5 text-white" /></div>
            <span className="font-display font-semibold text-gray-900 dark:text-zinc-100">MedWallet</span>
            <span className="badge text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ml-1"><Eye className="w-3 h-3" />Doctor View</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5" />Expires {formatDateTime(accessToken.expires_at)}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 p-4 mb-6 flex items-start gap-3">
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">View-only access granted</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">You have temporary read access to {profile.full_name}&apos;s medical records. This session expires {formatDateTime(accessToken.expires_at)}.</p>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-display font-bold text-xl">
              {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-zinc-100">{profile.full_name}</h1>
              <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500 dark:text-zinc-400">
                {profile.date_of_birth && <span>DOB: {formatDate(profile.date_of_birth)}</span>}
                {profile.gender && <span>{profile.gender}</span>}
                {profile.nationality && <span>{profile.nationality}</span>}
              </div>
            </div>
            <div className="text-center bg-red-50/50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
              <div className="text-xs text-gray-500 dark:text-zinc-500 mb-1">Blood / Genotype</div>
              <div className="font-display font-bold text-2xl text-red-600 dark:text-red-400">
                {profile.blood_type} <span className="text-lg text-red-400 dark:text-red-600 opacity-80">/ {profile.genotype || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <SectionHeader icon={AlertTriangle} title={`Allergies (${allergies?.length || 0})`} color="text-orange-500" />
            {!allergies?.length ? <p className="text-sm text-gray-400">No allergies recorded</p> : (
              <div className="space-y-2">
                {allergies.map(a => {
                  const badge = verificationBadge(a.verified_status)
                  return (
                    <div key={a.id} className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 dark:border-zinc-800 last:border-0">
                      <div><p className="font-medium text-sm text-gray-900 dark:text-zinc-200">{a.allergen}</p>{a.reaction && <p className="text-xs text-gray-500 dark:text-zinc-400">{a.reaction}</p>}{a.severity && <p className="text-xs text-gray-400 dark:text-zinc-500 capitalize">Severity: {a.severity}</p>}</div>
                      <span className={`badge text-[10px] shrink-0 ${badge.color}`}>{badge.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card p-6">
            <SectionHeader icon={Pill} title={`Medications (${medications?.length || 0})`} color="text-blue-500" />
            {!medications?.length ? <p className="text-sm text-gray-400">No medications recorded</p> : (
              <div className="space-y-2">
                {medications.map(m => (
                  <div key={m.id} className="py-2 border-b border-gray-50 dark:border-zinc-800 last:border-0">
                    <div className="flex items-center gap-2"><p className="font-medium text-sm text-gray-900 dark:text-zinc-200">{m.name}</p>{m.is_current && <span className="badge text-[10px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">Current</span>}</div>
                    {m.dosage && <p className="text-xs text-gray-500 dark:text-zinc-400">{m.dosage} · {m.frequency}</p>}
                    {m.prescribing_doctor && <p className="text-xs text-gray-400 dark:text-zinc-500">Dr. {m.prescribing_doctor}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <SectionHeader icon={Activity} title={`Conditions (${conditions?.length || 0})`} color="text-purple-500" />
            {!conditions?.length ? <p className="text-sm text-gray-400">No conditions recorded</p> : (
              <div className="space-y-2">
                {conditions.map(c => (
                  <div key={c.id} className="py-2 border-b border-gray-50 dark:border-zinc-800 last:border-0">
                    <div className="flex items-center justify-between"><p className="font-medium text-sm text-gray-900 dark:text-zinc-200">{c.name}</p><span className={`badge text-[10px] ${c.status === 'active' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : c.status === 'managed' ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'}`}>{c.status}</span></div>
                    {c.icd_code && <p className="text-xs text-gray-400 dark:text-zinc-500 font-mono">ICD: {c.icd_code}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <SectionHeader icon={Scissors} title={`Surgeries (${surgeries?.length || 0})`} color="text-rose-500" />
            {!surgeries?.length ? <p className="text-sm text-gray-400">No surgeries recorded</p> : (
              <div className="space-y-2">
                {surgeries.map(s => (
                  <div key={s.id} className="py-2 border-b border-gray-50 dark:border-zinc-800 last:border-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-zinc-200">{s.procedure_name}</p>
                    {s.hospital && <p className="text-xs text-gray-500 dark:text-zinc-400">{s.hospital}</p>}
                    {s.date && <p className="text-xs text-gray-400 dark:text-zinc-500">{formatDate(s.date)}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6 lg:col-span-2">
            <SectionHeader icon={Syringe} title={`Vaccinations (${vaccinations?.length || 0})`} color="text-teal-500" />
            {!vaccinations?.length ? <p className="text-sm text-gray-400">No vaccinations recorded</p> : (
              <div className="grid sm:grid-cols-2 gap-2">
                {vaccinations.map(v => (
                  <div key={v.id} className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30">
                    <p className="font-medium text-sm text-gray-900 dark:text-zinc-200">{v.vaccine_name}</p>
                    {v.date_administered && <p className="text-xs text-gray-500 dark:text-zinc-400">{formatDate(v.date_administered)}</p>}
                    {v.dose_number && <p className="text-xs text-gray-400 dark:text-zinc-500">Dose {v.dose_number}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {documents?.length > 0 && (
          <div className="card p-6 mt-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <Shield className="w-4 h-4 text-gray-400" />
              <h3 className="font-display font-semibold text-gray-900">Documents ({documents.length})</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">Files are not shared via this link for security reasons.</p>
            <div className="space-y-2">
              {documents.map(d => (
                <div key={d.id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-zinc-800 last:border-0">
                  <Shield className="w-3.5 h-3.5 text-gray-300 dark:text-zinc-600" />
                  <span className="text-sm text-gray-700 dark:text-zinc-300">{d.title}</span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 ml-auto">{formatDate(d.uploaded_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-center text-xs text-gray-400 mt-8">Read-only view · Powered by MedWallet</p>
      </div>
    </div>
  )
}

function ExpiredPage({ expiresAt }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="card p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><XCircle className="w-8 h-8 text-red-500" /></div>
        <h1 className="font-display font-semibold text-xl text-gray-900 dark:text-zinc-100 mb-2">Access Expired</h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm">This access link expired on {formatDateTime(expiresAt)}. Please ask the patient to generate a new link.</p>
      </div>
    </div>
  )
}
