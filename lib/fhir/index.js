export function toFHIRPatient(profile) {
  const nameParts = profile.full_name.split(' ')
  const given = nameParts.slice(0, -1)
  const family = nameParts[nameParts.length - 1]
  return {
    resourceType: 'Patient',
    id: profile.user_id,
    name: [{ family, given: given.length ? given : [profile.full_name] }],
    birthDate: profile.date_of_birth ?? undefined,
    gender: profile.gender?.toLowerCase(),
    telecom: profile.phone ? [{ system: 'phone', value: profile.phone }] : undefined,
  }
}

export function toFHIRAllergy(allergy) {
  const criticalityMap = { mild: 'low', moderate: 'high', severe: 'high' }
  return {
    resourceType: 'AllergyIntolerance',
    id: allergy.id,
    patient: { reference: `Patient/${allergy.user_id}` },
    code: { text: allergy.allergen },
    criticality: allergy.severity ? criticalityMap[allergy.severity] : 'unable-to-assess',
    reaction: allergy.reaction ? [{ description: allergy.reaction }] : undefined,
  }
}

export function toFHIRMedication(med) {
  return {
    resourceType: 'MedicationStatement',
    id: med.id,
    subject: { reference: `Patient/${med.user_id}` },
    medicationCodeableConcept: { text: med.name },
    dosage: med.dosage ? [{ text: `${med.dosage} ${med.frequency ?? ''}`.trim() }] : undefined,
    status: med.is_current ? 'active' : med.end_date ? 'completed' : 'stopped',
  }
}

export function toFHIRObservation(condition) {
  return {
    resourceType: 'Observation',
    id: condition.id,
    subject: { reference: `Patient/${condition.user_id}` },
    code: { text: condition.name },
    valueString: condition.status,
    effectiveDateTime: condition.diagnosed_date ?? undefined,
  }
}

export function toFHIRBundle(resources) {
  return { resourceType: 'Bundle', type: 'searchset', total: resources.length, entry: resources.map(r => ({ resource: r })) }
}

export function fhirError(message, code = 'processing') {
  return { resourceType: 'OperationOutcome', issue: [{ severity: 'error', code, details: { text: message } }] }
}
