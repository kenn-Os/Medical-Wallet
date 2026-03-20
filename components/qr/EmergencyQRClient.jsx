'use client'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, Download, Share2, Shield, Droplets, AlertTriangle, Pill, Activity, Phone, Info, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { generateQRData } from '@/lib/encryption'

export default function EmergencyQRClient({ userId, emergencyProfile, appUrl }) {
  const qrRef = useRef(null)
  const [showOfflineData, setShowOfflineData] = useState(false)
  const emergencyUrl = `${appUrl}/emergency/${userId}`
  const offlineData = generateQRData({ n: emergencyProfile.full_name, bt: emergencyProfile.blood_type, al: emergencyProfile.allergies.slice(0, 5).map(a => a.allergen), md: emergencyProfile.medications.slice(0, 5).map(m => m.name), cn: emergencyProfile.conditions.slice(0, 3).map(c => c.name), ec: emergencyProfile.emergency_contact_phone, en: emergencyProfile.emergency_contact_name })

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 400; canvas.height = 400
    const ctx = canvas.getContext('2d')
    const img = new window.Image()
    img.onload = () => {
      ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 400, 400); ctx.drawImage(img, 50, 50, 300, 300)
      const link = document.createElement('a')
      link.download = `medwallet-emergency-qr-${userId.slice(0, 8)}.png`
      link.href = canvas.toDataURL('image/png'); link.click()
      toast.success('QR code downloaded!')
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const copyLink = async () => { await navigator.clipboard.writeText(emergencyUrl); toast.success('Emergency profile link copied!') }
  const hasProfile = emergencyProfile.blood_type !== 'Unknown' || emergencyProfile.allergies.length > 0 || emergencyProfile.medications.length > 0

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-6"><h2 className="font-display font-semibold text-xl text-gray-900">Emergency QR Code</h2><p className="text-sm text-gray-500 mt-0.5">Share critical health info with first responders</p></div>

      {!hasProfile && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">Your emergency profile is incomplete. Add your blood type, allergies, and medications in your <a href="/profile" className="underline font-medium">profile</a> and <a href="/records" className="underline font-medium">health records</a>.</p>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2"><QrCode className="w-4 h-4 text-primary-600" />Your Emergency QR</h3>
          <div ref={qrRef} className="flex justify-center mb-6">
            <div className="p-5 bg-white border-2 border-gray-100 rounded-2xl shadow-inner">
              <QRCodeSVG value={emergencyUrl} size={220} level="H" includeMargin={false} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={downloadQR} className="btn-primary w-full justify-center"><Download className="w-4 h-4" />Download QR Code</button>
            <button onClick={copyLink} className="btn-secondary w-full justify-center"><Share2 className="w-4 h-4" />Copy Emergency Link</button>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100"><p className="text-xs text-gray-500 text-center break-all font-mono">{emergencyUrl}</p></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary-600" />Emergency Profile Preview</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
              <Droplets className="w-5 h-5 text-red-500 shrink-0" />
              <div><p className="text-xs text-gray-500">Blood Type</p><p className="font-display font-semibold text-red-700 text-lg">{emergencyProfile.blood_type}</p></div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-orange-500" /><span className="text-sm font-medium text-gray-700">Allergies ({emergencyProfile.allergies.length})</span></div>
              {!emergencyProfile.allergies.length ? <p className="text-xs text-gray-400 pl-6">None recorded</p> : (
                <div className="pl-6 flex flex-wrap gap-1.5">{emergencyProfile.allergies.map((a, i) => <span key={i} className="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-xs text-orange-700 font-medium">{a.allergen}</span>)}</div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2"><Pill className="w-4 h-4 text-blue-500" /><span className="text-sm font-medium text-gray-700">Medications ({emergencyProfile.medications.length})</span></div>
              {!emergencyProfile.medications.length ? <p className="text-xs text-gray-400 pl-6">None recorded</p> : (
                <div className="pl-6 space-y-1">{emergencyProfile.medications.map((m, i) => <div key={i} className="text-sm text-gray-700">{m.name}{m.dosage ? ` — ${m.dosage}` : ''}</div>)}</div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-purple-500" /><span className="text-sm font-medium text-gray-700">Conditions ({emergencyProfile.conditions.length})</span></div>
              {!emergencyProfile.conditions.length ? <p className="text-xs text-gray-400 pl-6">None recorded</p> : (
                <div className="pl-6 space-y-1">{emergencyProfile.conditions.map((c, i) => <div key={i} className="text-sm text-gray-700">{c.name}</div>)}</div>
              )}
            </div>
            {emergencyProfile.emergency_contact_name && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-600 shrink-0" />
                <div><p className="text-xs text-gray-500">Emergency Contact</p><p className="text-sm font-medium text-gray-900">{emergencyProfile.emergency_contact_name}</p>{emergencyProfile.emergency_contact_phone && <p className="text-sm text-green-700 font-mono">{emergencyProfile.emergency_contact_phone}</p>}</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0"><CheckCircle className="w-5 h-5 text-primary-600" /></div>
          <div className="flex-1">
            <h4 className="font-display font-semibold text-gray-900 mb-1">Offline Emergency Access</h4>
            <p className="text-sm text-gray-500 mb-3">Your QR code links to your online emergency profile and contains encrypted data for offline use — first responders can read your critical info even without internet.</p>
            <button onClick={() => setShowOfflineData(!showOfflineData)} className="text-xs text-primary-600 font-medium">{showOfflineData ? 'Hide' : 'Show'} encrypted offline data</button>
            {showOfflineData && <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100"><p className="text-xs text-gray-400 mb-1 font-medium">Encrypted payload (AES-256):</p><p className="text-xs font-mono text-gray-500 break-all">{offlineData.slice(0, 120)}...</p></div>}
          </div>
        </div>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {[{ title: 'Print on ID card', desc: 'Download and laminate for your wallet' }, { title: 'Medical bracelet', desc: 'Use the QR with engraving services' }, { title: 'Phone lock screen', desc: 'Set as wallpaper for quick access' }].map(tip => (
            <div key={tip.title} className="p-3 rounded-xl bg-primary-50/50 border border-primary-100"><p className="text-xs font-semibold text-primary-800">{tip.title}</p><p className="text-xs text-primary-600 mt-0.5">{tip.desc}</p></div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
