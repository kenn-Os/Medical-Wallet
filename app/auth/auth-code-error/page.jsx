import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default async function AuthCodeError({ searchParams }) {
  const params = await searchParams;
  const reason = params?.reason;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
        <p className="text-gray-600 mb-4">
          The link you followed may have expired or was already used. Please try requesting a new password reset or login link.
        </p>

        {reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left">
            <p className="text-xs font-semibold text-red-700 mb-1">Error Details:</p>
            <p className="text-xs text-red-600 break-words">{decodeURIComponent(reason)}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link 
            href="/reset-password" 
            className="flex items-center justify-center gap-2 w-full bg-black border border-transparent rounded-lg py-3 px-4 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
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
