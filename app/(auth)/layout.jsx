import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex flex-col">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-semibold text-gray-900 text-lg">MedWallet</span>
        </Link>
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
