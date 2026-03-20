'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import Modal from '@/components/ui/Modal'

export default function SurgeryModal({ open, data, userId, onClose, onSave }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  useEffect(() => { if (open) reset(data ? { procedure_name: data.procedure_name, date: data.date ?? '', hospital: data.hospital ?? '', surgeon: data.surgeon ?? '', outcome: data.outcome ?? '', notes: data.notes ?? '' } : {}) }, [open, data, reset])
  const onSubmit = async (formData) => {
    const supabase = createClient()
    const payload = { user_id: userId, procedure_name: formData.procedure_name, date: formData.date || null, hospital: formData.hospital || null, surgeon: formData.surgeon || null, outcome: formData.outcome || null, notes: formData.notes || null, verified_status: 'user_added' }
    let result
    if (data) { result = await supabase.from('surgeries').update(payload).eq('id', data.id).select().single() }
    else { result = await supabase.from('surgeries').insert(payload).select().single() }
    if (result.error) { toast.error(result.error.message); return }
    toast.success(data ? 'Surgery updated' : 'Surgery added'); onSave(result.data)
  }
  return (
    <Modal open={open} onClose={onClose} title={data ? 'Edit Surgery' : 'Add Surgery'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><label className="label">Procedure Name *</label><input {...register('procedure_name', { required: true })} className="input" placeholder="e.g. Appendectomy" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Date</label><input {...register('date')} type="date" className="input" /></div>
          <div><label className="label">Hospital</label><input {...register('hospital')} className="input" /></div>
          <div><label className="label">Surgeon</label><input {...register('surgeon')} className="input" /></div>
          <div><label className="label">Outcome</label><input {...register('outcome')} className="input" placeholder="e.g. Successful" /></div>
        </div>
        <div><label className="label">Notes</label><textarea {...register('notes')} className="input" rows={2} /></div>
        <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}{data ? 'Update' : 'Add Surgery'}</button></div>
      </form>
    </Modal>
  )
}
