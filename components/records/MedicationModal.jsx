'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import Modal from '@/components/ui/Modal'

export default function MedicationModal({ open, data, userId, onClose, onSave }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    if (open) reset(data ? { name: data.name, dosage: data.dosage ?? '', frequency: data.frequency ?? '', start_date: data.start_date ?? '', end_date: data.end_date ?? '', prescribing_doctor: data.prescribing_doctor ?? '', is_current: data.is_current, notes: data.notes ?? '' } : { is_current: true })
  }, [open, data, reset])

  const onSubmit = async (formData) => {
    const supabase = createClient()
    const payload = { user_id: userId, name: formData.name, dosage: formData.dosage || null, frequency: formData.frequency || null, start_date: formData.start_date || null, end_date: formData.end_date || null, prescribing_doctor: formData.prescribing_doctor || null, is_current: Boolean(formData.is_current), notes: formData.notes || null, verified_status: 'user_added' }
    let result
    if (data) { result = await supabase.from('medications').update(payload).eq('id', data.id).select().single() }
    else { result = await supabase.from('medications').insert(payload).select().single() }
    if (result.error) { toast.error(result.error.message); return }
    toast.success(data ? 'Medication updated' : 'Medication added')
    onSave(result.data)
  }

  return (
    <Modal open={open} onClose={onClose} title={data ? 'Edit Medication' : 'Add Medication'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="label">Medication Name *</label><input {...register('name', { required: true })} className="input" placeholder="e.g. Metformin" /></div>
          <div><label className="label">Dosage</label><input {...register('dosage')} className="input" placeholder="e.g. 500mg" /></div>
          <div><label className="label">Frequency</label><input {...register('frequency')} className="input" placeholder="e.g. Twice daily" /></div>
          <div><label className="label">Start Date</label><input {...register('start_date')} type="date" className="input" /></div>
          <div><label className="label">End Date</label><input {...register('end_date')} type="date" className="input" /></div>
          <div className="col-span-2"><label className="label">Prescribing Doctor</label><input {...register('prescribing_doctor')} className="input" placeholder="Dr. Name" /></div>
          <div className="col-span-2"><label className="flex items-center gap-2 cursor-pointer"><input {...register('is_current')} type="checkbox" className="w-4 h-4 rounded accent-primary-500" /><span className="text-sm font-medium text-gray-700">Currently taking this medication</span></label></div>
          <div className="col-span-2"><label className="label">Notes</label><textarea {...register('notes')} className="input" rows={2} /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}{data ? 'Update' : 'Add Medication'}</button>
        </div>
      </form>
    </Modal>
  )
}
