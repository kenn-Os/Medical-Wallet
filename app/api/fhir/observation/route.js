import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'
import { toFHIRObservation, toFHIRBundle, fhirError } from '@/lib/fhir'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patient')
  if (!patientId) return NextResponse.json(fhirError('Missing patient parameter'), { status: 400 })
  try {
    const supabase = await createAdminClient()
    const { data, error } = await supabase.from('conditions').select('*').eq('user_id', patientId)
    if (error) throw error
    return NextResponse.json(toFHIRBundle(data.map(toFHIRObservation)), { headers: { 'Content-Type': 'application/fhir+json' } })
  } catch { return NextResponse.json(fhirError('Internal error'), { status: 500 }) }
}
