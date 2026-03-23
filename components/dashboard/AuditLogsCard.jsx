'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { formatDistanceToNow } from 'date-fns'

export default function AuditLogsCard() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (data) setLogs(data)
    setLoading(false)
  }

  const getActionIcon = (action) => {
    if (action.toLowerCase().includes('emergency') || action.toLowerCase().includes('view')) return <AlertTriangle className="w-4 h-4 text-orange-500" />
    if (action.toLowerCase().includes('login') || action.toLowerCase().includes('auth')) return <ShieldCheck className="w-4 h-4 text-green-500" />
    return <Activity className="w-4 h-4 text-blue-500" />
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 mb-5">
      <h3 className="font-display font-semibold text-gray-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary-600 dark:text-primary-500" />
        Security Ledger
      </h3>
      <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">A transparent record of who accessed your health data and when.</p>

      {loading ? (
        <div className="flex items-center justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-zinc-400">No security events logged yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="flex gap-4 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800/50">
              <div className="mt-0.5 shrink-0 bg-white dark:bg-zinc-900 p-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800">
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{log.action}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-zinc-400">
                  <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                  {log.ip_address && (<span>• IP: <span className="font-mono">{log.ip_address}</span></span>)}
                  {log.resource_type && (<span>• {log.resource_type}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
