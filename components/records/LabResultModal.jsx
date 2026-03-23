'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import Modal from '@/components/ui/Modal'

const STATUS_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'low', label: 'Low' },
  { value: 'critical', label: 'Critical' },
]

export default function LabResultModal({ open, data, userId, onClose, onSave }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    if (open) {
      reset(data || { status: 'normal', test_date: new Date().toISOString().split('T')[0] })
    }
  }, [open, data, reset])

  const onSubmit = async (formData) => {
    const supabase = createClient()
    const payload = {
      user_id: userId,
      test_name: formData.test_name,
      category: formData.category || null,
      value: formData.value,
      unit: formData.unit,
      reference_range: formData.reference_range || null,
      status: formData.status,
      test_date: formData.test_date || null,
      lab_name: formData.lab_name || null,
      verified_status: data?.verified_status || 'user_added',
    }

    let result
    if (data) {
      result = await supabase.from('lab_results').update(payload).eq('id', data.id).select().single()
    } else {
      result = await supabase.from('lab_results').insert(payload).select().single()
    }

    if (result.error) {
      toast.error(result.error.message)
      return
    }

    toast.success(data ? 'Lab result updated' : 'Lab result added')
    onSave(result.data)
  }

  return (
    <Modal open={open} onClose={onClose} title={data ? 'Edit Lab Result' : 'Add Lab Result'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Test Name *</label>
            <input {...register('test_name', { required: true })} className="input" placeholder="e.g. Total Cholesterol" />
          </div>
          
          <div>
            <label className="label">Category</label>
            <input {...register('category')} className="input" placeholder="e.g. Lipid Panel" />
          </div>

          <div>
            <label className="label">Lab / Clinic Name</label>
            <input {...register('lab_name')} className="input" placeholder="e.g. Quest Diagnostics" />
          </div>
          
          <div>
            <label className="label">Value *</label>
            <input {...register('value', { required: true, valueAsNumber: true })} type="number" step="any" className="input" placeholder="e.g. 150" />
          </div>
          
          <div>
            <label className="label">Unit *</label>
            <input {...register('unit', { required: true })} className="input" placeholder="e.g. mg/dL" />
          </div>
          
          <div>
            <label className="label">Reference Range</label>
            <input {...register('reference_range')} className="input" placeholder="e.g. < 200" />
          </div>

          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label">Test Date</label>
            <input {...register('test_date')} type="date" className="input" />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {data ? 'Update Result' : 'Add Result'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
