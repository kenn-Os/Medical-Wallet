'use client'
import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function DeleteAccountModal({ open, onClose, onConfirm, deleting }) {
  const [confirmText, setConfirmText] = useState('')
  const isValid = confirmText === 'DELETE'

  const handleConfirm = () => {
    if (isValid) onConfirm()
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Account" size="sm">
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h4 className="font-display font-semibold text-gray-900 text-lg">Are you absolutely sure?</h4>
          <p className="text-sm text-gray-500 mt-2">
            This action <span className="font-bold text-red-600">cannot be undone</span>. All your health records and data will be permanently deleted.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label className="label text-gray-600 mb-2">To confirm, type <span className="font-mono font-bold text-gray-900 select-none">DELETE</span> below:</label>
          <input
            type="text"
            className="input text-center font-mono uppercase tracking-widest bg-white"
            placeholder="Type DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={deleting}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid || deleting}
            className="btn-danger flex-1"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Everything'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
