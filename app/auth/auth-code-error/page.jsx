import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
        <p className="text-gray-600 mb-8">
          The link you followed may have expired or was already used. Please try requesting a new password reset or login link.
        </p>

        <div className="space-y-3">
          <Link 
            href="/reset-password" 
            className="flex items-center justify-center gap-2 w-full bg-primary-600 border border-transparent rounded-lg py-3 px-4 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Request New Link
          </Link>
          
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
