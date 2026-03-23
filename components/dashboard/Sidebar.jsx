'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, LayoutDashboard, FileText, FolderOpen, QrCode, UserCheck, User, Settings, LogOut, Menu, X, ChevronRight, Shield, CreditCard } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/insurance', label: 'Insurance Wallet', icon: CreditCard },
  { href: '/records', label: 'Health Records', icon: FileText },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
  { href: '/emergency-qr', label: 'Emergency QR', icon: QrCode },
  { href: '/doctor-access', label: 'Doctor Access', icon: UserCheck },
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ user, profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email || 'User'
  const initials = getInitials(displayName)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-100 dark:border-zinc-800/50">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm"><Heart className="w-4 h-4 text-white" /></div>
          <span className="font-display font-semibold text-gray-900 dark:text-zinc-100 text-lg">MedWallet</span>
        </Link>
      </div>
      <div className="px-4 py-4 border-b border-gray-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-primary-50/60 dark:bg-primary-900/10">
          <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">{initials}</div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-zinc-100 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cn('nav-item', isActive && 'nav-item-active')}>
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary-600 dark:text-primary-500" />
          <div><p className="text-xs font-medium text-gray-700 dark:text-zinc-300">AES-256 Encrypted</p><p className="text-[10px] text-gray-400 dark:text-zinc-500">Your data is protected</p></div>
        </div>
      </div>
      <div className="px-3 pb-4">
        <button onClick={handleLogout} disabled={loggingOut} className="nav-item w-full text-red-600 hover:bg-red-50 hover:text-red-700">
          <LogOut className="w-4 h-4" /><span>{loggingOut ? 'Signing out...' : 'Sign out'}</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:w-64 bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800/50 z-30 transition-colors"><SidebarContent /></aside>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm"><Menu className="w-5 h-5 text-gray-700 dark:text-zinc-300" /></button>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-black/20 dark:bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800/50 z-50 shadow-xl transition-colors">
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"><X className="w-4 h-4 text-gray-500 dark:text-zinc-400" /></button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
