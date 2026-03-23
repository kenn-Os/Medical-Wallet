'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, AlertCircle, Heart, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

export default function AIHealthInsights({ profile, allergies, medications, conditions }) {
  const [analyzing, setAnalyzing] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [insights, setInsights] = useState([])

  useEffect(() => {
    // Simulate AI connection and analysis delay
    const timer = setTimeout(() => {
      const generatedInsights = []
      
      // 1. Core Profile Analysis
      if (!profile.blood_type || profile.blood_type === 'Unknown') {
        generatedInsights.push({ type: 'warning', icon: Heart, title: 'Missing Critical Data', desc: 'Your blood type is unknown. We highly recommend updating this for emergency responders.' })
      } else {
        generatedInsights.push({ type: 'success', icon: CheckCircle2, title: 'Profile Ready', desc: `Your core identity including blood type (${profile.blood_type}) is documented.` })
      }

      // 2. Allergy Analysis
      const severeAllergies = allergies.filter(a => a.severity === 'severe')
      if (severeAllergies.length > 0) {
        generatedInsights.push({ type: 'danger', icon: AlertCircle, title: 'Severe Allergies Detected', desc: `You have ${severeAllergies.length} severe allerg${severeAllergies.length > 1 ? 'ies' : 'y'}. Ensure your Emergency QR is always accessible.` })
      }

      // 3. Condition & Med Correlation (Mocked logic)
      const activeConditions = conditions.filter(c => c.status === 'active')
      if (activeConditions.length > 0 && medications.length === 0) {
        generatedInsights.push({ type: 'info', icon: Brain, title: 'Medication Check', desc: `You have ${activeConditions.length} active condition(s) but no current medications tracked. Consider updating your medication list if you are prescribed anything.` })
      } else if (activeConditions.length > 0) {
        generatedInsights.push({ type: 'info', icon: Brain, title: 'Condition Management', desc: `Tracking ${activeConditions.length} active condition(s) with ${medications.length} medication(s). Keep up with your scheduled doses.` })
      }

      setInsights(generatedInsights)
      setAnalyzing(false)
    }, 2500) // 2.5s simulated delay

    return () => clearTimeout(timer)
  }, [profile, allergies, medications, conditions])

  const getIconColor = (type) => {
    switch(type) {
      case 'warning': return 'text-amber-500 bg-amber-100 dark:bg-amber-500/10'
      case 'danger': return 'text-red-500 bg-red-100 dark:bg-red-500/10'
      case 'success': return 'text-green-500 bg-green-100 dark:bg-green-500/10'
      default: return 'text-blue-500 bg-blue-100 dark:bg-blue-500/10'
    }
  }

  return (
    <div className="card border-2 border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-zinc-900">
      
      {/* AI Glow Effect */}
      <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

      <div className="p-5 flex items-start justify-between relative cursor-pointer" onClick={() => !analyzing && setExpanded(!expanded)}>
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Sparkles className={`w-5 h-5 text-indigo-600 dark:text-indigo-400 ${analyzing ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div>
            <h2 className="font-display font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              AI Health Insights
              <span className="badge bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-none text-[10px]">BETA</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {analyzing ? 'Analyzing your health records...' : 'Personalized insights generated from your wallet.'}
            </p>
          </div>
        </div>
        {!analyzing && (
          <button className="p-2 -mr-2 text-gray-400 hover:text-indigo-600 transition-colors">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && !analyzing && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5">
            <div className="space-y-3 mt-2 border-t border-indigo-100 dark:border-indigo-900/30 pt-4">
              {insights.map((insight, i) => {
                const Icon = insight.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-3 bg-white/60 dark:bg-zinc-900/60 p-3 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getIconColor(insight.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-zinc-100">{insight.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{insight.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
              {insights.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">Not enough data to generate targeted insights yet.</p>
              )}
            </div>
            <div className="mt-4 text-[10px] text-gray-400 text-center uppercase tracking-wider">
              Insights are AI-generated. Consult your physician.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
