'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import Modal from '@/components/ui/Modal'

const CARD_TYPES = [
  { value: 'medical', label: 'Medical' },
  { value: 'dental', label: 'Dental' },
  { value: 'vision', label: 'Vision' },
  { value: 'other', label: 'Other' },
]

export default function InsuranceModal({ open, data, userId, onClose, onSave }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    if (open) {
      reset(data ? {
        provider_name: data.provider_name,
        policy_number: data.policy_number,
        group_number: data.group_number || '',
        card_type: data.card_type || 'medical',
        primary_member_name: data.primary_member_name || '',
        valid_from: data.valid_from || '',
        valid_until: data.valid_until || '',
        contact_phone: data.contact_phone || ''
      } : {
        card_type: 'medical'
      })
    }
  }, [open, data, reset])

  const onSubmit = async (formData) => {
    const supabase = createClient()
    const payload = {
      user_id: userId,
      provider_name: formData.provider_name,
      policy_number: formData.policy_number,
      group_number: formData.group_number || null,
      card_type: formData.card_type,
      primary_member_name: formData.primary_member_name || null,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
      contact_phone: formData.contact_phone || null
    }

    let result
    if (data) {
      result = await supabase.from('insurance_cards').update(payload).eq('id', data.id).select().single()
    } else {
      result = await supabase.from('insurance_cards').insert(payload).select().single()
    }

    if (result.error) {
      toast.error(result.error.message)
      return
    }

    toast.success(data ? 'Insurance card updated' : 'Insurance card added')
    onSave(result.data)
  }

  return (
    <Modal open={open} onClose={onClose} title={data ? 'Edit Insurance Card' : 'Add Insurance Card'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Provider Name *</label>
            <input {...register('provider_name', { required: true })} className="input" placeholder="e.g. Blue Cross, Aetna" />
          </div>
          
          <div>
            <label className="label">Card Type</label>
            <select {...register('card_type')} className="input">
              {CARD_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">Policy / Member Number *</label>
            <input {...register('policy_number', { required: true })} className="input" placeholder="e.g. ABC12345678" />
          </div>
          
          <div>
            <label className="label">Group Number</label>
            <input {...register('group_number')} className="input" placeholder="e.g. 98765" />
          </div>
          
          <div>
            <label className="label">Primary Member Name</label>
            <input {...register('primary_member_name')} className="input" placeholder="Name on card" />
          </div>

          <div>
            <label className="label">Valid From</label>
            <input {...register('valid_from')} type="date" className="input" />
          </div>
          
          <div>
            <label className="label">Valid Until</label>
            <input {...register('valid_until')} type="date" className="input" />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Provider Contact Phone</label>
            <input {...register('contact_phone')} type="tel" className="input" placeholder="e.g. 1-800-555-0199" />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {data ? 'Update Card' : 'Add Card'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
