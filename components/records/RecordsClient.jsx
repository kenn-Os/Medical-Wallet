'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Pill, Activity, Scissors, Syringe, Plus, Edit2, Trash2, Shield, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { cn, verificationBadge, severityColor, formatDate } from '@/lib/utils'
import AllergyModal from './AllergyModal'
import MedicationModal from './MedicationModal'
import ConditionModal from './ConditionModal'
import SurgeryModal from './SurgeryModal'
import VaccinationModal from './VaccinationModal'

const tabs = [
  { id: 'allergies', label: 'Allergies', icon: AlertTriangle },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'conditions', label: 'Conditions', icon: Activity },
  { id: 'surgeries', label: 'Surgeries', icon: Scissors },
  { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
]

export default function RecordsClient({ userId, allergies: ia, medications: im, conditions: ic, surgeries: is_, vaccinations: iv }) {
  const [activeTab, setActiveTab] = useState('allergies')
  const [allergies, setAllergies] = useState(ia)
  const [medications, setMedications] = useState(im)
  const [conditions, setConditions] = useState(ic)
  const [surgeries, setSurgeries] = useState(is_)
  const [vaccinations, setVaccinations] = useState(iv)
  const [allergyModal, setAllergyModal] = useState({ open: false })
  const [medicationModal, setMedicationModal] = useState({ open: false })
  const [conditionModal, setConditionModal] = useState({ open: false })
  const [surgeryModal, setSurgeryModal] = useState({ open: false })
  const [vaccinationModal, setVaccinationModal] = useState({ open: false })
  const supabase = createClient()

  const deleteRecord = async (table, id, setter) => {
    if (!confirm('Delete this record?')) return
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) { toast.error('Failed to delete record'); return }
    setter(prev => prev.filter(r => r.id !== id))
    toast.success('Record deleted')
  }

  const renderBadge = (status) => {
    const badge = verificationBadge(status)
    return <span className={cn('badge text-[10px]', badge.color)}>{status === 'user_added' ? <Shield className="w-2.5 h-2.5" /> : <CheckCircle className="w-2.5 h-2.5" />}{badge.label}</span>
  }

  const openModal = () => {
    if (activeTab === 'allergies') setAllergyModal({ open: true })
    else if (activeTab === 'medications') setMedicationModal({ open: true })
    else if (activeTab === 'conditions') setConditionModal({ open: true })
    else if (activeTab === 'surgeries') setSurgeryModal({ open: true })
    else if (activeTab === 'vaccinations') setVaccinationModal({ open: true })
  }

  const counts = { allergies: allergies.length, medications: medications.length, conditions: conditions.length, surgeries: surgeries.length, vaccinations: vaccinations.length }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="font-display font-semibold text-xl text-gray-900">Health Records</h2><p className="text-sm text-gray-500 mt-0.5">Manage all your medical information</p></div>
        <button onClick={openModal} className="btn-primary"><Plus className="w-4 h-4" />Add Record</button>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          const count = counts[tab.id]
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap', activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <Icon className="w-3.5 h-3.5" />{tab.label}
              {count > 0 && <span className={cn('min-w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center px-1', activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600')}>{count}</span>}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {activeTab === 'allergies' && (
            <RecordList items={allergies} emptyText="No allergies recorded" onAdd={() => setAllergyModal({ open: true })} renderItem={a => (
              <div key={a.id} className="card card-hover p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mt-0.5"><AlertTriangle className="w-4 h-4 text-orange-500" /></div>
                  <div><p className="font-medium text-gray-900">{a.allergen}</p>{a.reaction && <p className="text-sm text-gray-500 mt-0.5">{a.reaction}</p>}<div className="flex items-center gap-2 mt-2 flex-wrap">{a.severity && <span className={cn('badge text-xs capitalize', severityColor(a.severity))}>{a.severity}</span>}{renderBadge(a.verified_status)}</div></div>
                </div>
                <div className="flex gap-1 shrink-0"><button onClick={() => setAllergyModal({ open: true, data: a })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteRecord('allergies', a.id, setAllergies)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            )} />
          )}
          {activeTab === 'medications' && (
            <RecordList items={medications} emptyText="No medications recorded" onAdd={() => setMedicationModal({ open: true })} renderItem={m => (
              <div key={m.id} className="card card-hover p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mt-0.5"><Pill className="w-4 h-4 text-blue-500" /></div>
                  <div><div className="flex items-center gap-2"><p className="font-medium text-gray-900">{m.name}</p>{m.is_current && <span className="badge text-[10px] text-green-700 bg-green-50 border-green-200">Current</span>}</div>{m.dosage && <p className="text-sm text-gray-500 mt-0.5">{m.dosage} · {m.frequency}</p>}{m.prescribing_doctor && <p className="text-xs text-gray-400 mt-1">Prescribed by {m.prescribing_doctor}</p>}<div className="mt-2">{renderBadge(m.verified_status)}</div></div>
                </div>
                <div className="flex gap-1 shrink-0"><button onClick={() => setMedicationModal({ open: true, data: m })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteRecord('medications', m.id, setMedications)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            )} />
          )}
          {activeTab === 'conditions' && (
            <RecordList items={conditions} emptyText="No conditions recorded" onAdd={() => setConditionModal({ open: true })} renderItem={c => (
              <div key={c.id} className="card card-hover p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center mt-0.5"><Activity className="w-4 h-4 text-purple-500" /></div>
                  <div><p className="font-medium text-gray-900">{c.name}</p><div className="flex items-center gap-2 mt-1 flex-wrap"><span className={cn('badge text-xs capitalize', c.status === 'active' ? 'text-red-600 bg-red-50 border-red-200' : c.status === 'managed' ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-green-600 bg-green-50 border-green-200')}>{c.status}</span>{c.diagnosed_date && <span className="text-xs text-gray-400">Since {formatDate(c.diagnosed_date)}</span>}</div><div className="mt-2">{renderBadge(c.verified_status)}</div></div>
                </div>
                <div className="flex gap-1 shrink-0"><button onClick={() => setConditionModal({ open: true, data: c })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteRecord('conditions', c.id, setConditions)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            )} />
          )}
          {activeTab === 'surgeries' && (
            <RecordList items={surgeries} emptyText="No surgeries recorded" onAdd={() => setSurgeryModal({ open: true })} renderItem={s => (
              <div key={s.id} className="card card-hover p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center mt-0.5"><Scissors className="w-4 h-4 text-rose-500" /></div>
                  <div><p className="font-medium text-gray-900">{s.procedure_name}</p>{s.hospital && <p className="text-sm text-gray-500 mt-0.5">{s.hospital}</p>}<div className="flex items-center gap-2 mt-1 text-xs text-gray-400">{s.date && <span>{formatDate(s.date)}</span>}{s.surgeon && <span>· Dr. {s.surgeon}</span>}</div><div className="mt-2">{renderBadge(s.verified_status)}</div></div>
                </div>
                <div className="flex gap-1 shrink-0"><button onClick={() => setSurgeryModal({ open: true, data: s })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteRecord('surgeries', s.id, setSurgeries)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            )} />
          )}
          {activeTab === 'vaccinations' && (
            <RecordList items={vaccinations} emptyText="No vaccinations recorded" onAdd={() => setVaccinationModal({ open: true })} renderItem={v => (
              <div key={v.id} className="card card-hover p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center mt-0.5"><Syringe className="w-4 h-4 text-teal-500" /></div>
                  <div><p className="font-medium text-gray-900">{v.vaccine_name}</p><div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">{v.date_administered && <span>{formatDate(v.date_administered)}</span>}{v.dose_number && <span>· Dose {v.dose_number}</span>}{v.next_due_date && <span className="text-orange-500">· Next: {formatDate(v.next_due_date)}</span>}</div><div className="mt-2">{renderBadge(v.verified_status)}</div></div>
                </div>
                <div className="flex gap-1 shrink-0"><button onClick={() => setVaccinationModal({ open: true, data: v })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteRecord('vaccinations', v.id, setVaccinations)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            )} />
          )}
        </motion.div>
      </AnimatePresence>

      <AllergyModal open={allergyModal.open} data={allergyModal.data} userId={userId} onClose={() => setAllergyModal({ open: false })} onSave={saved => { allergyModal.data ? setAllergies(p => p.map(a => a.id === saved.id ? saved : a)) : setAllergies(p => [saved, ...p]); setAllergyModal({ open: false }) }} />
      <MedicationModal open={medicationModal.open} data={medicationModal.data} userId={userId} onClose={() => setMedicationModal({ open: false })} onSave={saved => { medicationModal.data ? setMedications(p => p.map(m => m.id === saved.id ? saved : m)) : setMedications(p => [saved, ...p]); setMedicationModal({ open: false }) }} />
      <ConditionModal open={conditionModal.open} data={conditionModal.data} userId={userId} onClose={() => setConditionModal({ open: false })} onSave={saved => { conditionModal.data ? setConditions(p => p.map(c => c.id === saved.id ? saved : c)) : setConditions(p => [saved, ...p]); setConditionModal({ open: false }) }} />
      <SurgeryModal open={surgeryModal.open} data={surgeryModal.data} userId={userId} onClose={() => setSurgeryModal({ open: false })} onSave={saved => { surgeryModal.data ? setSurgeries(p => p.map(s => s.id === saved.id ? saved : s)) : setSurgeries(p => [saved, ...p]); setSurgeryModal({ open: false }) }} />
      <VaccinationModal open={vaccinationModal.open} data={vaccinationModal.data} userId={userId} onClose={() => setVaccinationModal({ open: false })} onSave={saved => { vaccinationModal.data ? setVaccinations(p => p.map(v => v.id === saved.id ? saved : v)) : setVaccinations(p => [saved, ...p]); setVaccinationModal({ open: false }) }} />
    </div>
  )
}

function RecordList({ items, emptyText, onAdd, renderItem }) {
  if (!items.length) return (
    <div className="card p-12 text-center"><p className="text-gray-400 text-sm mb-4">{emptyText}</p><button onClick={onAdd} className="btn-primary mx-auto"><Plus className="w-4 h-4" />Add first record</button></div>
  )
  return <div className="space-y-3">{items.map(item => renderItem(item))}</div>
}
