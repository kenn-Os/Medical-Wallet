'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, CreditCard, Shield, Phone, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { cn, formatDate } from '@/lib/utils'
import InsuranceModal from './InsuranceModal'

const typeColors = {
  medical: 'from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-900 shadow-blue-500/20 dark:shadow-none',
  dental: 'from-teal-500 to-teal-700 dark:from-teal-600 dark:to-teal-900 shadow-teal-500/20 dark:shadow-none',
  vision: 'from-purple-500 to-purple-700 dark:from-purple-600 dark:to-purple-900 shadow-purple-500/20 dark:shadow-none',
  other: 'from-gray-600 to-gray-800 dark:from-zinc-700 dark:to-zinc-900 shadow-gray-500/20 dark:shadow-none',
}

export default function InsuranceClient({ userId, initialCards }) {
  const [cards, setCards] = useState(initialCards)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const supabase = createClient()

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this insurance card?')) return
    
    const { error } = await supabase.from('insurance_cards').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete card')
      return
    }
    
    setCards(prev => prev.filter(c => c.id !== id))
    toast.success('Insurance card deleted')
  }

  const openEdit = (card) => {
    setSelectedCard(card)
    setModalOpen(true)
  }

  const openAdd = () => {
    setSelectedCard(null)
    setModalOpen(true)
  }

  const handleSave = (savedCard) => {
    if (selectedCard) {
      setCards(prev => prev.map(c => c.id === savedCard.id ? savedCard : c))
    } else {
      setCards(prev => [savedCard, ...prev])
    }
    setModalOpen(false)
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display font-semibold text-2xl text-gray-900 dark:text-zinc-100">Insurance Wallet</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage your medical, dental, and vision coverage</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>

      {!cards.length ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-12 text-center border-dashed dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-zinc-100 mb-1">No insurance cards yet</h3>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6 max-w-sm mx-auto">Keep all your health coverage details in one secure place for easy access during visits.</p>
          <button onClick={openAdd} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" /> Add First Card
          </button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                {/* Actions overlay */}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button onClick={() => openEdit(card)} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(card.id)} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Design */}
                <div className={cn(
                  "p-6 rounded-2xl bg-gradient-to-br text-white shadow-lg relative overflow-hidden h-[220px] flex flex-col justify-between",
                  typeColors[card.card_type] || typeColors.other
                )}>
                  {/* Decorative element */}
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none" />

                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">{card.card_type}</p>
                      <h3 className="font-display font-bold text-xl leading-tight">{card.provider_name}</h3>
                    </div>
                    <Shield className="w-6 h-6 text-white/50" />
                  </div>

                  <div className="relative z-10 space-y-3 mt-4">
                    <div>
                      <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Policy Number</p>
                      <p className="font-mono text-lg tracking-wider font-semibold">{card.policy_number}</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {card.group_number && (
                        <div>
                          <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Group</p>
                          <p className="font-mono text-sm">{card.group_number}</p>
                        </div>
                      )}
                      {card.primary_member_name && (
                        <div>
                          <p className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Member</p>
                          <p className="text-sm font-medium">{card.primary_member_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Card underneath */}
                <div className="mt-3 px-1 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-zinc-400">
                  {card.contact_phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {card.contact_phone}
                    </div>
                  )}
                  {card.valid_until && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Valid thru {formatDate(card.valid_until)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <InsuranceModal
        open={modalOpen}
        data={selectedCard}
        userId={userId}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
