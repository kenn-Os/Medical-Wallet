import { Heart } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 flex flex-col transition-colors duration-300">
      <header className="p-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-semibold text-gray-900 dark:text-zinc-100 text-lg">MedWallet</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="p-6 text-center">
        <p className="text-xs text-gray-400">Your medical data is encrypted and only accessible by you.</p>
      </footer>
    </div>
  )
}
