'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Code2, Key, Loader2, Copy, Check, Trash2, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

export default function ApiKeysClient({ user }) {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [newKey, setNewKey] = useState(null)
  const [keyName, setKeyName] = useState('')
  const [copied, setCopied] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    const { data, error } = await supabase
      .from('institution_api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setKeys(data)
    setLoading(false)
  }

  const generateKey = async (e) => {
    e.preventDefault()
    if (!keyName.trim()) return toast.error('Please enter a name for the key')
    
    setGenerating(true)
    try {
      // Generate a securely random string for the key
      const randomValues = new Uint8Array(32)
      crypto.getRandomValues(randomValues)
      const rawKey = Array.from(randomValues).map(b => b.toString(16).padStart(2, '0')).join('')
      const fullKey = `mw_live_${rawKey}`
      const keyPrefix = fullKey.substring(0, 15)
      
      // In a real production system, you would securely hash `fullKey` and only store the hash.
      // For beta/demo purposes, we are simulating the infrastructure setup.
      const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fullKey))
        .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''))

      const { data, error } = await supabase.from('institution_api_keys').insert({
        user_id: user.id,
        name: keyName,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        scopes: ['read']
      }).select().single()

      if (error) throw error

      toast.success('API Key generated successfully')
      setNewKey(fullKey)
      setKeyName('')
      setKeys([data, ...keys])
    } catch (err) {
      toast.error('Failed to generate key: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const revokeKey = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this API key? This will immediately break any integrations using it.')) return
    
    try {
      const { error } = await supabase.from('institution_api_keys').delete().eq('id', id)
      if (error) throw error
      toast.success('API Key revoked')
      setKeys(keys.filter(k => k.id !== id))
    } catch (err) {
      toast.error('Failed to revoke key')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl text-slate-900 dark:text-zinc-100 flex items-center gap-3">
          <Code2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Institution API Keys
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-2">Generate API keys to systematically fetch patient records via your internal EHR system. Never share your API keys or commit them to version control.</p>
      </div>

      {newKey && (
        <div className="card p-6 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-2"><Check className="w-5 h-5" /> Save your new API key</h3>
          <p className="text-sm text-emerald-700 dark:text-emerald-500 mb-4">Please copy this API key now. For your security, <strong className="font-bold">you will not be able to see it again</strong>.</p>
          <div className="flex gap-2">
            <input type="text" readOnly value={newKey} className="input font-mono bg-white dark:bg-zinc-900 w-full" />
            <button onClick={() => copyToClipboard(newKey)} className="btn-primary shrink-0 bg-emerald-600 hover:bg-emerald-700">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="btn-ghost mt-4 w-full text-sm">I have saved it securely</button>
        </div>
      )}

      <div className="card p-6">
        <h3 className="font-display font-semibold text-slate-900 dark:text-zinc-100 mb-4">Generate New Key</h3>
        <form onSubmit={generateKey} className="flex gap-3">
          <input 
            type="text" 
            value={keyName} 
            onChange={e => setKeyName(e.target.value)} 
            placeholder="e.g. Production EHR Integration" 
            className="input flex-1 focus:ring-teal-500" 
          />
          <button type="submit" disabled={generating} className="btn-primary bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white shrink-0 shadow-sm px-6">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Key
          </button>
        </form>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
          <h3 className="font-display font-medium text-slate-900 dark:text-zinc-100">Active Keys</h3>
          <button onClick={fetchKeys} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-zinc-500 text-sm">No API keys generated yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/50">
            {keys.map(key => (
              <div key={key.id} className="p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{key.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wider">READ_ONLY</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
                    <Key className="w-3 h-3 text-slate-400" />
                    {key.key_prefix}...
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Created {new Date(key.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button onClick={() => revokeKey(key.id)} className="btn-ghost text-red-600 hover:bg-red-50 hover:border-red-100 dark:hover:bg-red-500/10 text-xs py-1.5 px-3">
                  <Trash2 className="w-3.5 h-3.5" /> Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  )
}
