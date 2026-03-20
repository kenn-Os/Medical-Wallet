import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'
import { toFHIRPatient, fhirError } from '@/lib/fhir'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get('patient')
  if (!patientId) return NextResponse.json(fhirError('Missing patient parameter', 'required'), { status: 400 })
  try {
    const supabase = await createAdminClient()
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('user_id', patientId).single()
    if (error || !profile) return NextResponse.json(fhirError('Patient not found', 'not-found'), { status: 404 })
    return NextResponse.json(toFHIRPatient(profile), { headers: { 'Content-Type': 'application/fhir+json' } })
  } catch { return NextResponse.json(fhirError('Internal error'), { status: 500 }) }
}

export async function POST(request) {
  try {
    const body = await request.json()
    if (body.resourceType !== 'Patient') return NextResponse.json(fhirError('Expected Patient resource'), { status: 400 })
    return NextResponse.json({ message: 'FHIR Patient ingestion acknowledged', id: body.id }, { status: 202 })
  } catch { return NextResponse.json(fhirError('Invalid request body'), { status: 400 }) }
}
