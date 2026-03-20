'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import Modal from '@/components/ui/Modal'

export default function ConditionModal({ open, data, userId, onClose, onSave }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  useEffect(() => { if (open) reset(data ? { name: data.name, diagnosed_date: data.diagnosed_date ?? '', status: data.status, icd_code: data.icd_code ?? '', notes: data.notes ?? '' } : { status: 'active' }) }, [open, data, reset])
  const onSubmit = async (formData) => {
    const supabase = createClient()
    const payload = { user_id: userId, name: formData.name, diagnosed_date: formData.diagnosed_date || null, status: formData.status, icd_code: formData.icd_code || null, notes: formData.notes || null, verified_status: 'user_added' }
    let result
    if (data) { result = await supabase.from('conditions').update(payload).eq('id', data.id).select().single() }
    else { result = await supabase.from('conditions').insert(payload).select().single() }
    if (result.error) { toast.error(result.error.message); return }
    toast.success(data ? 'Condition updated' : 'Condition added'); onSave(result.data)
  }
  return (
    <Modal open={open} onClose={onClose} title={data ? 'Edit Condition' : 'Add Condition'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><label className="label">Condition Name *</label><input {...register('name', { required: true })} className="input" placeholder="e.g. Type 2 Diabetes" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Diagnosed Date</label><input {...register('diagnosed_date')} type="date" className="input" /></div>
          <div><label className="label">Status</label><select {...register('status')} className="input"><option value="active">Active</option><option value="managed">Managed</option><option value="resolved">Resolved</option></select></div>
        </div>
        <div><label className="label">ICD-10 Code</label><input {...register('icd_code')} className="input" placeholder="e.g. E11.9" /></div>
        <div><label className="label">Notes</label><textarea {...register('notes')} className="input" rows={2} /></div>
        <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}{data ? 'Update' : 'Add Condition'}</button></div>
      </form>
    </Modal>
  )
}
