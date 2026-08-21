"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastType, { bg: string; border: string; iconColor: string; textColor: string }> = {
  success: {
    bg: "var(--success-muted)",
    border: "rgba(0, 194, 160, 0.25)",
    iconColor: "var(--success)",
    textColor: "#065f46",
  },
  error: {
    bg: "var(--danger-muted)",
    border: "rgba(229, 72, 77, 0.25)",
    iconColor: "var(--danger)",
    textColor: "#991b1b",
  },
  warning: {
    bg: "var(--warning-muted)",
    border: "rgba(245, 166, 35, 0.25)",
    iconColor: "var(--warning)",
    textColor: "#92400e",
  },
  info: {
    bg: "var(--primary-muted)",
    border: "var(--primary-border)",
    iconColor: "var(--primary)",
    textColor: "#1e40af",
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const style = STYLES[toast.type];
  const Icon = ICONS[toast.type];

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-md w-full animate-slide-in"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: style.iconColor }} />
      <p className="text-sm font-medium flex-1" style={{ color: style.textColor }}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-0.5 rounded-lg hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4" style={{ color: style.textColor, opacity: 0.5 }} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
