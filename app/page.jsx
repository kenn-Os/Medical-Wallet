'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  QrCode,
  Globe,
  Lock,
  FileText,
  UserCheck,
  ChevronRight,
  Heart,
  Activity,
  Stethoscope,
  ArrowRight,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const features = [
  {
    icon: Shield,
    title: 'Patient-Controlled',
    description:
      'Your health data belongs to you. Grant, revoke, and manage access to your records at any time.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: QrCode,
    title: 'Emergency QR Code',
    description:
      'Instant access to critical health info for first responders — even without internet connection.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Globe,
    title: 'Global Interoperability',
    description:
      'Built on FHIR standards so your records can integrate with hospital systems worldwide.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Lock,
    title: 'Bank-Grade Security',
    description:
      'End-to-end encryption, row-level security, audit logging and secure access tokens.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: UserCheck,
    title: 'Doctor Verification',
    description: 'Licensed physicians can verify and digitally sign your medical entries.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: FileText,
    title: 'Document Vault',
    description:
      'Securely store lab results, prescriptions, and discharge notes in your personal vault.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
]

const stats = [
  { value: 'FHIR R4', label: 'Standard compliant' },
  { value: 'AES-256', label: 'Encryption standard' },
  { value: '7 days', label: 'Max temp access' },
  { value: '100%', label: 'Patient controlled' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-border dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-semibold text-gray-900 dark:text-zinc-100 text-lg">MedWallet</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/login" className="btn-ghost text-sm">
                Sign in
              </Link>
              <Link href="/clinical" className="hidden lg:flex btn-ghost text-sm items-center gap-1.5 text-teal-600 dark:text-teal-400">
                <Stethoscope className="w-3.5 h-3.5" />
                Clinical Portal
              </Link>
              <Link href="/signup" className="btn-primary text-sm">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-20 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                FHIR R4 Compatible · Global Healthcare Standard
              </span>

              <h1 className="font-display font-semibold text-5xl sm:text-6xl lg:text-7xl text-gray-900 dark:text-zinc-100 leading-tight mb-6">
                Your health records,{' '}
                <span className="text-primary-500 relative">
                  always with you
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 8.5C60 3 120 1 180 3.5C220 5 260 7 298 6"
                      stroke="#24a86b"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-500 dark:text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto">
                A secure digital health wallet that puts you in complete control of your medical
                data. Share with doctors, generate emergency QR codes, and access your records
                anywhere in the world.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="btn-primary text-base px-8 py-3 shadow-glow">
                  Create your wallet
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary text-base px-8 py-3 flex items-center gap-2"
                >
                  Sign in to dashboard
                </Link>
                <Link
                  href="/clinical"
                  className="text-sm font-medium text-slate-500 dark:text-zinc-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-2 mt-4 sm:mt-0"
                >
                  Are you a healthcare provider? <span className="underline">Access Clinical Portal</span>
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display font-semibold text-2xl text-gray-900 dark:text-zinc-100">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-900">
              {/* Mock Dashboard Header */}
              <div className="bg-gray-50 dark:bg-zinc-800/50 border-b border-border dark:border-zinc-800 px-6 py-4 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white dark:bg-zinc-900 rounded-md px-4 py-1.5 text-xs text-gray-400 dark:text-zinc-500 border border-border dark:border-zinc-700 w-64 text-center">
                    medwallet.app/dashboard
                  </div>
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950 min-h-[300px] flex gap-6">
                {/* Sidebar */}
                <div className="w-44 shrink-0 space-y-1">
                  {['Dashboard', 'Records', 'Documents', 'Emergency QR', 'Doctor Access'].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                          i === 0
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                            : 'text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded ${i === 0 ? 'bg-primary-200 dark:bg-primary-800' : 'bg-gray-200 dark:bg-zinc-700'}`}
                        />
                        {item}
                      </div>
                    )
                  )}
                </div>

                {/* Main content */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Blood Type', value: 'O+', color: 'text-red-600 bg-red-50' },
                      { label: 'Allergies', value: '3', color: 'text-orange-600 bg-orange-50' },
                      { label: 'Medications', value: '2', color: 'text-blue-600 bg-blue-50' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-border dark:border-zinc-800 shadow-sm">
                        <div className={`text-lg font-semibold ${item.color} rounded-lg px-2 py-0.5 inline-block mb-1`}>
                          {item.value}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border dark:border-zinc-800 p-4 shadow-sm">
                    <div className="text-xs font-medium text-gray-700 dark:text-zinc-300 mb-3">Recent Records</div>
                    <div className="space-y-2">
                      {['Penicillin Allergy', 'Metformin 500mg', 'Type 2 Diabetes'].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
                        >
                          <div className="text-xs text-gray-600 dark:text-zinc-400">{item}</div>
                          <div className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
                            Verified
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-semibold text-4xl text-gray-900 dark:text-zinc-100 mb-4">
              Everything you need in one wallet
            </h2>
            <p className="text-lg text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Built for patients first, with the security and standards healthcare professionals
              trust.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="card card-hover p-6"
                >
                  <div className={`w-10 h-10 rounded-xl ${feature.bg} dark:bg-zinc-800/50 flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-display font-semibold text-gray-900 dark:text-zinc-100 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Emergency QR Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-400 text-sm font-medium uppercase tracking-wider">
                Emergency Ready
              </span>
              <h2 className="font-display font-semibold text-4xl text-white mt-3 mb-6 leading-tight">
                Critical info available even without internet
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Your emergency QR code contains encrypted data that first responders can read
                offline. Blood type, allergies, conditions, and emergency contacts — available in
                seconds when it matters most.
              </p>
              <ul className="space-y-3">
                {[
                  'Automatically generated for every user',
                  'Contains encrypted offline-readable data',
                  'Downloadable for ID cards and bracelets',
                  'Links to full emergency profile when online',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-56 h-56 bg-white rounded-2xl shadow-2xl flex items-center justify-center p-6">
                  <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-primary-500 text-white rounded-xl px-4 py-2 text-sm font-medium shadow-lg">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Emergency Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="font-display font-semibold text-4xl text-gray-900 dark:text-zinc-100 mb-4">
            Take control of your health data
          </h2>
          <p className="text-lg text-gray-500 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
            Create your free medical wallet today. No credit card required. Your data, your rules.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-base px-10 py-3.5">
              Create free wallet
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-10 py-3.5">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-semibold text-gray-900 dark:text-zinc-100">MedWallet</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/clinical" className="text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Healthcare Providers</Link>
              <p className="text-sm text-gray-400 dark:text-zinc-500">
                © {new Date().getFullYear()} MedWallet. Built for patient empowerment.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
