"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
interface ToastItem { id: number; message: string; kind: ToastKind }
interface ToastApi { show: (message: string, kind?: ToastKind) => void }

const ToastContext = createContext<ToastApi | null>(null);

function ToastCard({ toast, dismiss }: { toast: ToastItem; dismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), 4500);
    return () => window.clearTimeout(timer);
  }, [dismiss, toast.id]);

  const Icon = toast.kind === "success" ? CheckCircle2 : toast.kind === "error" ? CircleAlert : Info;
  const palette = toast.kind === "success"
    ? "border-emerald-200 bg-white text-forest"
    : toast.kind === "error"
      ? "border-red-200 bg-white text-red-800"
      : "border-sky-200 bg-white text-sky-900";

  return <div role={toast.kind === "error" ? "alert" : "status"} className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 shadow-[0_12px_36px_rgba(23,77,58,.16)] ${palette}`}>
    <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
    <p className="min-w-0 flex-1 text-sm font-semibold leading-5">{toast.message}</p>
    <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="shrink-0 rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100">
      <X size={17} />
    </button>
  </div>;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const dismiss = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);
  const show = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++nextId.current;
    setToasts(current => [...current.slice(-3), { id, message, kind }]);
  }, []);

  return <ToastContext.Provider value={{ show }}>
    {children}
    <div aria-label="Notifications" className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-end gap-2 px-4 sm:left-auto sm:w-full sm:max-w-sm sm:px-0 sm:pr-5">
      {toasts.map(toast => <ToastCard key={toast.id} toast={toast} dismiss={dismiss} />)}
    </div>
  </ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
