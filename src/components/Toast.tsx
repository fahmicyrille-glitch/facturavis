'use client';

import { CheckCircle, X, Loader2 } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Toast({ message, type }: ToastProps) {
  return (
    <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-3 z-50 transition-all transform duration-300 ease-out ${
      type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
      type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
      'bg-blue-50 text-blue-800 border-blue-200'
    }`}>
      {type === 'success' && <CheckCircle size={18} className="text-green-500" />}
      {type === 'error' && <X size={18} className="text-red-500" />}
      {type === 'info' && <Loader2 size={18} className="text-blue-500 animate-spin" />}
      {message}
    </div>
  );
}
