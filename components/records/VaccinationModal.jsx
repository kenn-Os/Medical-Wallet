'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import Modal from '@/components/ui/Modal'

export default function VaccinationModal({ open, data, userId, onClose, onSave }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  useEffect(() => { if (open) reset(data ? { vaccine_name: data.vaccine_name, date_administered: data.date_administered ?? '', dose_number: data.dose_number ?? '', administered_by: data.administered_by ?? '', lot_number: data.lot_number ?? '', next_due_date: data.next_due_date ?? '' } : {}) }, [open, data, reset])
  const onSubmit = async (formData) => {
    const supabase = createClient()
    const payload = { user_id: userId, vaccine_name: formData.vaccine_name, date_administered: formData.date_administered || null, dose_number: formData.dose_number ? Number(formData.dose_number) : null, administered_by: formData.administered_by || null, lot_number: formData.lot_number || null, next_due_date: formData.next_due_date || null, verified_status: 'user_added' }
    let result
    if (data) { result = await supabase.from('vaccinations').update(payload).eq('id', data.id).select().single() }
    else { result = await supabase.from('vaccinations').insert(payload).select().single() }
    if (result.error) { toast.error(result.error.message); return }
    toast.success(data ? 'Vaccination updated' : 'Vaccination added'); onSave(result.data)
  }
  return (
    <Modal open={open} onClose={onClose} title={data ? 'Edit Vaccination' : 'Add Vaccination'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><label className="label">Vaccine Name *</label><input {...register('vaccine_name', { required: true })} className="input" placeholder="e.g. COVID-19, Influenza" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Date Administered</label><input {...register('date_administered')} type="date" className="input" /></div>
          <div><label className="label">Dose Number</label><input {...register('dose_number')} type="number" min="1" className="input" /></div>
          <div><label className="label">Administered By</label><input {...register('administered_by')} className="input" placeholder="Clinic / Doctor" /></div>
          <div><label className="label">Lot Number</label><input {...register('lot_number')} className="input" /></div>
          <div className="col-span-2"><label className="label">Next Due Date</label><input {...register('next_due_date')} type="date" className="input" /></div>
        </div>
        <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}{data ? 'Update' : 'Add Vaccination'}</button></div>
      </form>
    </Modal>
  )
}
