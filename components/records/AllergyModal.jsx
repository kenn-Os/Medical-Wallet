'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { saveAllergy } from '@/lib/actions/records'
import Modal from '@/components/ui/Modal'

export default function AllergyModal({ open, data, userId, onClose, onSave }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    if (open) reset(data ? { allergen: data.allergen, reaction: data.reaction ?? '', severity: data.severity ?? '', notes: data.notes ?? '' } : {})
  }, [open, data, reset])

  const onSubmit = async (formData) => {
    const result = await saveAllergy(formData, data?.id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(data ? 'Allergy updated' : 'Allergy added')
    onSave(result.data)
  }

  return (
    <Modal open={open} onClose={onClose} title={data ? 'Edit Allergy' : 'Add Allergy'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div><label className="label">Allergen *</label><input {...register('allergen', { required: true })} className="input" placeholder="e.g. Penicillin, Peanuts" /></div>
        <div><label className="label">Reaction</label><input {...register('reaction')} className="input" placeholder="e.g. Hives, Anaphylaxis" /></div>
        <div><label className="label">Severity</label><select {...register('severity')} className="input"><option value="">Select severity</option><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option></select></div>
        <div><label className="label">Notes</label><textarea {...register('notes')} className="input" rows={2} /></div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}{data ? 'Update' : 'Add Allergy'}</button>
        </div>
      </form>
    </Modal>
  )
}
