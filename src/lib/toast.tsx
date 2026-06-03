"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type ToastMessage = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

let toastCount = 0;
let addToastHandler: ((t: ToastMessage) => void) | null = null;

export const toast = {
  success: (message: string) => addToastHandler?.({ id: toastCount++, message, type: "success" }),
  error: (message: string) => addToastHandler?.({ id: toastCount++, message, type: "error" }),
  info: (message: string) => addToastHandler?.({ id: toastCount++, message, type: "info" }),
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastHandler = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== t.id));
      }, 4000);
    };
    return () => {
      addToastHandler = null;
    };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] font-bold text-sm text-white animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto ${t.type === 'success' ? 'bg-[#04AA6D]' : t.type === 'error' ? 'bg-red-500' : 'bg-slate-800'}`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
          {t.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}
