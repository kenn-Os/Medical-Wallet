'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image, X, Download, Trash2, Eye, FolderOpen, Loader2, CheckCircle, File } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { cn, formatFileSize, formatDate, verificationBadge } from '@/lib/utils'

const DOCUMENT_TYPES = [
  { value: 'lab_result', label: 'Lab Result' }, { value: 'prescription', label: 'Prescription' },
  { value: 'discharge_note', label: 'Discharge Note' }, { value: 'diagnostic_report', label: 'Diagnostic Report' },
  { value: 'other', label: 'Other' },
]

export default function DocumentsClient({ userId, documents: initialDocs }) {
  const [documents, setDocuments] = useState(initialDocs)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [docType, setDocType] = useState('lab_result')
  const [docTitle, setDocTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const supabase = createClient()

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) { setSelectedFile(accepted[0]); if (!docTitle) setDocTitle(accepted[0].name.replace(/\.[^/.]+$/, '')) }
  }, [docTitle])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }, maxFiles: 1, maxSize: 10 * 1024 * 1024 })

  const handleUpload = async () => {
    if (!selectedFile || !docTitle.trim()) { toast.error('Please provide a title and select a file'); return }
    setUploading(true); setUploadProgress(20)
    try {
      const ext = selectedFile.name.split('.').pop()
      const filePath = `${userId}/${Date.now()}.${ext}`
      setUploadProgress(40)
      const { error: uploadError } = await supabase.storage.from('medical-documents').upload(filePath, selectedFile, { upsert: false })
      if (uploadError) throw uploadError
      setUploadProgress(70)
      const { data: urlData } = supabase.storage.from('medical-documents').getPublicUrl(filePath)
      const { data, error } = await supabase.from('documents').insert({ user_id: userId, title: docTitle.trim(), document_type: docType, file_path: filePath, file_name: selectedFile.name, file_size: selectedFile.size, mime_type: selectedFile.type, storage_url: urlData.publicUrl, verified_status: 'user_added' }).select().single()
      if (error) throw error
      setUploadProgress(100)
      setDocuments(prev => [data, ...prev])
      setSelectedFile(null); setDocTitle(''); setDocType('lab_result')
      toast.success('Document uploaded successfully')
    } catch (err) { toast.error(err.message || 'Upload failed') }
    finally { setUploading(false); setUploadProgress(0) }
  }

  const handleDelete = async (doc) => {
    if (!confirm('Delete this document? This cannot be undone.')) return
    await supabase.storage.from('medical-documents').remove([doc.file_path])
    await supabase.from('documents').delete().eq('id', doc.id)
    setDocuments(prev => prev.filter(d => d.id !== doc.id))
    toast.success('Document deleted')
  }

  const handlePreview = async (doc) => {
    if (doc.storage_url) { window.open(doc.storage_url, '_blank'); return }
    const { data } = await supabase.storage.from('medical-documents').createSignedUrl(doc.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const filtered = filterType === 'all' ? documents : documents.filter(d => d.document_type === filterType)

  const getFileIcon = (mimeType) => {
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />
    if (mimeType?.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  const typeColors = { 
    lab_result: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20', 
    prescription: 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20', 
    discharge_note: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20', 
    diagnostic_report: 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-500/10 dark:border-teal-500/20', 
    other: 'text-gray-700 bg-gray-50 border-gray-200 dark:text-zinc-400 dark:bg-zinc-800/50 dark:border-zinc-700' 
  }

  return (
    <div className="page-container">
      <div className="mb-6"><h2 className="font-display font-semibold text-xl text-gray-900 dark:text-zinc-100">Medical Documents</h2><p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Securely store and access your medical files</p></div>

      <div className="card p-6 mb-6">
        <h3 className="font-display font-semibold text-gray-900 dark:text-zinc-100 text-sm mb-4 flex items-center gap-2"><Upload className="w-4 h-4 text-primary-600 dark:text-primary-500" />Upload Document</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div><label className="label">Document Title *</label><input value={docTitle} onChange={e => setDocTitle(e.target.value)} className="input" placeholder="e.g. Blood Test Results Jan 2025" /></div>
          <div><label className="label">Document Type</label><select value={docType} onChange={e => setDocType(e.target.value)} className="input">{DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
        </div>
        <div {...getRootProps()} className={cn('border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200', isDragActive ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : selectedFile ? 'border-primary-300 bg-primary-50/50 dark:bg-primary-900/10 dark:border-primary-500/30' : 'border-gray-200 dark:border-zinc-800 hover:border-primary-300 dark:hover:border-primary-500/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50')}>
          <input {...getInputProps()} />
          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary-500" />
              <div className="text-left"><p className="font-medium text-gray-900 dark:text-zinc-100 text-sm">{selectedFile.name}</p><p className="text-xs text-gray-500 dark:text-zinc-400">{formatFileSize(selectedFile.size)}</p></div>
              <button type="button" onClick={e => { e.stopPropagation(); setSelectedFile(null) }} className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-400 dark:text-zinc-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div><Upload className={cn('w-8 h-8 mx-auto mb-3', isDragActive ? 'text-primary-500' : 'text-gray-300 dark:text-zinc-600')} /><p className="text-sm font-medium text-gray-700 dark:text-zinc-300">{isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}</p><p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">PDF, JPG, PNG · Max 10MB</p></div>
          )}
        </div>
        {uploading && (
          <div className="mt-3"><div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden"><motion.div className="h-full bg-primary-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} /></div><p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 text-center">Uploading... {uploadProgress}%</p></div>
        )}
        <button onClick={handleUpload} disabled={uploading || !selectedFile} className="btn-primary mt-4 w-full sm:w-auto">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setFilterType('all')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap', filterType === 'all' ? 'bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400')}>All ({documents.length})</button>
        {DOCUMENT_TYPES.map(t => {
          const count = documents.filter(d => d.document_type === t.value).length
          if (!count) return null
          return <button key={t.value} onClick={() => setFilterType(t.value)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap', filterType === t.value ? 'bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400')}>{t.label} ({count})</button>
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center border-dashed dark:border-zinc-800 dark:bg-zinc-900/50"><FolderOpen className="w-10 h-10 text-gray-200 dark:text-zinc-700 mx-auto mb-3" /><p className="text-gray-400 dark:text-zinc-500 text-sm">No documents found</p></div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((doc, i) => {
              const badge = verificationBadge(doc.verified_status)
              const typeLabel = DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ delay: i * 0.04 }} className="card card-hover p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800/50 flex items-center justify-center shrink-0">{getFileIcon(doc.mime_type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-zinc-100 text-sm truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn('badge text-[10px]', typeColors[doc.document_type] || typeColors.other)}>{typeLabel}</span>
                      <span className={cn('badge text-[10px]', badge.color)}>{badge.label}</span>
                      <span className="text-xs text-gray-400 dark:text-zinc-500">{formatFileSize(doc.file_size)}</span>
                      <span className="text-xs text-gray-400 dark:text-zinc-500">{formatDate(doc.uploaded_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handlePreview(doc)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                    <a href={doc.storage_url || '#'} download={doc.file_name} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" title="Download"><Download className="w-4 h-4" /></a>
                    <button onClick={() => handleDelete(doc)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
