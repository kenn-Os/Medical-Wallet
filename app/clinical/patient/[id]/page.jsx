import { createAdminClient, createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Droplets, AlertTriangle, Pill, Activity, Phone, FileText, ChevronLeft, Calendar } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Clinical Patient Record | MedWallet' }

export default async function ClinicalPatientPage({ params, searchParams }) {
  const { id } = await params
  const { token, health_id } = await searchParams

  if (!token || !health_id) return redirect('/clinical')

  const supabase = await createClient()

  // 1. Verify the doctor is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login?next=/clinical')

  // 2. Strong Server-Side Verification of the Token
  // We use the regular client to call the RPC because it requires an authenticated doctor session
  const { data: validUserId, error: rpcError } = await supabase.rpc('verify_doctor_access', {
    p_health_id: health_id,
    p_token: token
  })

  // Compare returned user_id against the route param id for tamper-proofing
  if (rpcError || !validUserId || validUserId !== id) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-red-50 border border-red-200 rounded-2xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
        <p className="text-red-600 text-sm mb-6">The access token provided is invalid, expired, or you do not have permission to view this record.</p>
        <Link href="/clinical" className="text-primary-600 font-medium hover:underline">Return to Clinical Dashboard</Link>
      </div>
    )
  }

  // 3. Token is Valid! We fetch the full patient data bypassing RLS using the Admin Client
  const adminSupabase = await createAdminClient()
  
  const [
    { data: profile },
    { data: allergies },
    { data: medications },
    { data: conditions },
    { data: labs }
  ] = await Promise.all([
    adminSupabase.from('profiles').select('*').eq('user_id', id).single(),
    adminSupabase.from('allergies').select('*').eq('user_id', id),
    adminSupabase.from('medications').select('*').eq('user_id', id).order('is_current', { ascending: false }),
    adminSupabase.from('conditions').select('*').eq('user_id', id).order('diagnosed_date', { ascending: false }),
    adminSupabase.from('lab_results').select('*').eq('user_id', id).order('test_date', { ascending: false })
  ])

  if (!profile) notFound()

  return (
    <div className="space-y-6">
      <Link href="/clinical" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Patient Header */}
      <div className="card p-6 border-t-4 border-t-teal-500 bg-teal-50/10">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-zinc-100">{profile.full_name}</h1>
              <span className="badge bg-teal-100 text-teal-800 border-teal-200">VERIFIED PATIENT</span>
            </div>
            <div className="text-sm text-slate-500 font-mono">{profile.universal_health_id}</div>
          </div>
          <div className="flex gap-4">
            <div className="text-center p-3 bg-red-50 border border-red-100 rounded-xl min-w-[100px]">
              <div className="text-xs text-red-600 font-medium mb-1">Blood Type</div>
              <div className="font-display font-bold text-red-700 text-xl">{profile.blood_type}</div>
            </div>
            <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-xl min-w-[100px]">
              <div className="text-xs text-slate-600 font-medium mb-1">DOB</div>
              <div className="font-display font-bold text-slate-800 text-lg">
                {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-GB') : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Allergies */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-4 text-orange-800">
            <AlertTriangle className="w-5 h-5" /> Allergies
          </h2>
          {!allergies?.length ? <p className="text-sm text-slate-500">No reported allergies</p> : (
            <ul className="space-y-3">
              {allergies.map(a => (
                <li key={a.id} className="p-3 bg-orange-50 border border-orange-100 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-orange-900">{a.allergen}</span>
                    {a.reaction && <p className="text-xs text-orange-700 mt-0.5">{a.reaction}</p>}
                  </div>
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${a.severity === 'severe' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                    {a.severity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Medications */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-4 text-blue-800">
            <Pill className="w-5 h-5" /> Medications
          </h2>
          {!medications?.length ? <p className="text-sm text-slate-500">No medications</p> : (
            <ul className="space-y-3">
              {medications.map(m => (
                <li key={m.id} className={`p-3 border rounded-lg ${m.is_current ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                  <div className="flex justify-between">
                    <span className="font-semibold text-blue-900">{m.name}</span>
                    {m.is_current ? <span className="text-[10px] font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded">CURRENT</span> : <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">PAST</span>}
                  </div>
                  <p className="text-xs text-blue-700 mt-1">{m.dosage} • {m.frequency}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Conditions */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-4 text-purple-800">
            <Activity className="w-5 h-5" /> Medical Conditions
          </h2>
          {!conditions?.length ? <p className="text-sm text-slate-500">No chronic conditions</p> : (
            <ul className="space-y-3">
              {conditions.map(c => (
                <li key={c.id} className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-purple-900">{c.name}</span>
                      {c.diagnosed_date && <p className="text-xs text-purple-700 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Diagnosed: {c.diagnosed_date}</p>}
                    </div>
                    <span className="text-xs font-medium uppercase text-purple-800">{c.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Lab Results Highlights */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2 mb-4 text-emerald-800">
            <FileText className="w-5 h-5" /> Lab Results Overview
          </h2>
          {!labs?.length ? <p className="text-sm text-slate-500">No structured lab data available</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs">
                  <tr>
                    <th className="px-3 py-2 rounded-tl-lg rounded-bl-lg">Test</th>
                    <th className="px-3 py-2">Value</th>
                    <th className="px-3 py-2 rounded-tr-lg rounded-br-lg text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {labs.slice(0, 5).map(lab => (
                    <tr key={lab.id} className="group">
                      <td className="px-3 py-2.5 font-medium text-slate-700">{lab.test_name}</td>
                      <td className="px-3 py-2.5">
                        <span className={`font-mono ${lab.status === 'high' || lab.status === 'critical' ? 'text-red-600 font-bold' : lab.status === 'low' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}>
                          {lab.value} {lab.unit}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-400 text-xs">{new Date(lab.test_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {labs.length > 5 && <p className="text-xs text-center mt-3 text-slate-400">Showing 5 most recent labs</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
