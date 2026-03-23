'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Pill, Activity, Scissors, Syringe, Plus, Edit2, Trash2, Shield, CheckCircle, FlaskConical } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { cn, verificationBadge, severityColor, formatDate } from '@/lib/utils'
import AllergyModal from './AllergyModal'
import MedicationModal from './MedicationModal'
import ConditionModal from './ConditionModal'
import SurgeryModal from './SurgeryModal'
import VaccinationModal from './VaccinationModal'
import LabResultModal from './LabResultModal'

const tabs = [
  { id: 'allergies', label: 'Allergies', icon: AlertTriangle },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'conditions', label: 'Conditions', icon: Activity },
  { id: 'surgeries', label: 'Surgeries', icon: Scissors },
  { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
  { id: 'labs', label: 'Lab Results', icon: FlaskConical },
]

export default function RecordsClient({ userId, allergies: ia, medications: im, conditions: ic, surgeries: is_, vaccinations: iv, labs: il }) {
  const [activeTab, setActiveTab] = useState('allergies')
  const [allergies, setAllergies] = useState(ia)
  const [medications, setMedications] = useState(im)
  const [conditions, setConditions] = useState(ic)
  const [surgeries, setSurgeries] = useState(is_)
  const [vaccinations, setVaccinations] = useState(iv)
  const [labs, setLabs] = useState(il)
  const [allergyModal, setAllergyModal] = useState({ open: false })
  const [medicationModal, setMedicationModal] = useState({ open: false })
  const [conditionModal, setConditionModal] = useState({ open: false })
  const [surgeryModal, setSurgeryModal] = useState({ open: false })
  const [vaccinationModal, setVaccinationModal] = useState({ open: false })
  const [labModal, setLabModal] = useState({ open: false })
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
    else if (activeTab === 'labs') setLabModal({ open: true })
  }

  const counts = { allergies: allergies.length, medications: medications.length, conditions: conditions.length, surgeries: surgeries.length, vaccinations: vaccinations.length, labs: labs.length }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="font-display font-semibold text-xl text-gray-900 dark:text-zinc-100">Health Records</h2><p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Manage all your medical information</p></div>
        <button onClick={openModal} className="btn-primary"><Plus className="w-4 h-4" />Add Record</button>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-zinc-900/50 rounded-xl mb-6 overflow-x-auto border border-transparent dark:border-zinc-800/50">
        {tabs.map(tab => {
          const Icon = tab.icon
          const count = counts[tab.id]
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap', activeTab === tab.id ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200')}>
              <Icon className="w-3.5 h-3.5" />{tab.label}
              {count > 0 && <span className={cn('min-w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center px-1', activeTab === tab.id ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400' : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300')}>{count}</span>}
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
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mt-0.5"><AlertTriangle className="w-4 h-4 text-orange-500 dark:text-orange-400" /></div>
                  <div><p className="font-medium text-gray-900 dark:text-zinc-100">{a.allergen}</p>{a.reaction && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{a.reaction}</p>}<div className="flex items-center gap-2 mt-2 flex-wrap">{a.severity && <span className={cn('badge text-xs capitalize', severityColor(a.severity))}>{a.severity}</span>}{renderBadge(a.verified_status)}</div></div>
                </div>
                <div className="flex gap-1 shrink-0"><button onClick={() => setAllergyModal({ open: true, data: a })} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 transition-colors"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteRecord('allergies', a.id, setAllergies)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            )} />
          )}
          {activeTab === 'medications' && (
            <RecordList items={medications} emptyText="No medications recorded" onAdd={() => setMedicationModal({ open: true })} renderItem={m => (
              <div key={m.id} className="card card-hover p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mt-0.5"><Pill className="w-4 h-4 text-blue-500 dark:text-blue-400" /></div>
                  <div><div className="flex items-center gap-2"><p className="font-medium text-gray-900 dark:text-zinc-100">{m.name}</p>{m.is_current && <span className="badge text-[10px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20">Current</span>}</div>{m.dosage && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{m.dosage} · {m.frequency}</p>}{m.prescribing_doctor && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Prescribed by {m.prescribing_doctor}</p>}<div className="mt-2">{renderBadge(m.verified_status)}</div></div>
                </div>
                <div className="flex gap-1 shrink-0"><button onClick={() => setMedicationModal({ open: true, data: m })} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 transition-colors"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteRecord('medications', m.id, setMedications)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            )} />
          )}
          {activeTab === 'conditions' && (
            <RecordList items={conditions} emptyText="No conditions recorded" onAdd={() => setConditionModal({ open: true })} renderItem={c => (
              <div key={c.id} className="card card-hover p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mt-0.5"><Activity className="w-4 h-4 text-purple-500 dark:text-purple-400" /></div>
                  <div><p className="font-medium text-gray-900 dark:text-zinc-100">{c.name}</p><div className="flex items-center gap-2 mt-1 flex-wrap"><span className={cn('badge text-xs capitalize', c.status === 'active' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' : c.status === 'managed' ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20')}>{c.status}</span>{c.diagnosed_date && <span className="text-xs text-gray-400 dark:text-zinc-500">Since {formatDate(c.diagnosed_date)}</span>}</div><div className="mt-2">{renderBadge(c.verified_status)}</div></div>
                </div>
                <div className="flex gap-1 shrink-0"><button onClick={() => setConditionModal({ open: true, data: c })} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 transition-colors"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteRecord('conditions', c.id, setConditions)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            )} />
          )}
          {activeTab === 'surgeries' && (
            <RecordList items={surgeries} emptyText="No surgeries recorded" onAdd={() => setSurgeryModal({ open: true })} renderItem={s => (
              <div key={s.id} className="card card-hover p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mt-0.5"><Scissors className="w-4 h-4 text-rose-500 dark:text-rose-400" /></div>
                  <div><p className="font-medium text-gray-900 dark:text-zinc-100">{s.procedure_name}</p>{s.hospital && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{s.hospital}</p>}<div className="flex items-center gap-2 mt-1 text-xs text-gray-400 dark:text-zinc-500">{s.date && <span>{formatDate(s.date)}</span>}{s.surgeon && <span>· Dr. {s.surgeon}</span>}</div><div className="mt-2">{renderBadge(s.verified_status)}</div></div>
                </div>
                <div className="flex gap-1 shrink-0"><button onClick={() => setSurgeryModal({ open: true, data: s })} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 transition-colors"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteRecord('surgeries', s.id, setSurgeries)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            )} />
          )}
          {activeTab === 'vaccinations' && (
            <RecordList items={vaccinations} emptyText="No vaccinations recorded" onAdd={() => setVaccinationModal({ open: true })} renderItem={v => (
              <div key={v.id} className="card card-hover p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center mt-0.5"><Syringe className="w-4 h-4 text-teal-500 dark:text-teal-400" /></div>
                  <div><p className="font-medium text-gray-900 dark:text-zinc-100">{v.vaccine_name}</p><div className="flex items-center gap-2 mt-1 text-xs text-gray-400 dark:text-zinc-500 flex-wrap">{v.date_administered && <span>{formatDate(v.date_administered)}</span>}{v.dose_number && <span>· Dose {v.dose_number}</span>}{v.next_due_date && <span className="text-orange-500 dark:text-orange-400">· Next: {formatDate(v.next_due_date)}</span>}</div><div className="mt-2">{renderBadge(v.verified_status)}</div></div>
                </div>
                <div className="flex gap-1 shrink-0"><button onClick={() => setVaccinationModal({ open: true, data: v })} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 transition-colors"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteRecord('vaccinations', v.id, setVaccinations)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            )} />
          )}
          {activeTab === 'labs' && (
            <RecordList items={labs} emptyText="No lab results recorded" onAdd={() => setLabModal({ open: true })} renderItem={l => (
              <div key={l.id} className="card card-hover p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 w-full">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mt-0.5"><FlaskConical className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between w-full">
                      <p className="font-medium text-gray-900 dark:text-zinc-100">{l.test_name}</p>
                      <span className={cn('badge text-xs capitalize ml-3', 
                        l.status === 'normal' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' : 
                        l.status === 'high' ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' : 
                        l.status === 'low' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' : 
                        'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                      )}>{l.status}</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-mono text-xl text-gray-900 dark:text-zinc-100 font-semibold">{l.value}</span>
                      <span className="text-sm text-gray-500 dark:text-zinc-400">{l.unit}</span>
                      {l.reference_range && <span className="text-xs text-gray-400 dark:text-zinc-500 ml-2">(Ref: {l.reference_range})</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-zinc-500 flex-wrap">
                      {l.test_date && <span>{formatDate(l.test_date)}</span>}
                      {l.lab_name && <span>· {l.lab_name}</span>}
                      {l.category && <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-gray-600 dark:text-zinc-300"> {l.category}</span>}
                    </div>
                    <div className="mt-2">{renderBadge(l.verified_status)}</div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0"><button onClick={() => setLabModal({ open: true, data: l })} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 transition-colors"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteRecord('lab_results', l.id, setLabs)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button></div>
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
      <LabResultModal open={labModal.open} data={labModal.data} userId={userId} onClose={() => setLabModal({ open: false })} onSave={saved => { labModal.data ? setLabs(p => p.map(l => l.id === saved.id ? saved : l)) : setLabs(p => [saved, ...p]); setLabModal({ open: false }) }} />
    </div>
  )
}

function RecordList({ items, emptyText, onAdd, renderItem }) {
  if (!items.length) return (
    <div className="card p-12 text-center border-dashed dark:border-zinc-800 dark:bg-zinc-900/50"><p className="text-gray-400 dark:text-zinc-500 text-sm mb-4">{emptyText}</p><button onClick={onAdd} className="btn-primary mx-auto"><Plus className="w-4 h-4" />Add first record</button></div>
  )
  return <div className="space-y-3">{items.map(item => renderItem(item))}</div>
}
