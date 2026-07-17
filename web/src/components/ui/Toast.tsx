"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastKind = "error" | "success" | "info";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  showToast: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback for when Toast provider isn't mounted yet
    return {
      showToast: (msg: string) => {
        console.warn("Toast provider not mounted, message:", msg);
      },
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() =>
            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
          } />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mount animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const styles = {
    error: "border-red-500/40 bg-red-500/10 text-red-300",
    success: "border-lime/40 bg-lime/10 text-lime",
    info: "border-border bg-surface text-text",
  };

  return (
    <div
      className={`pointer-events-auto max-w-sm border p-4 shadow-lg backdrop-blur transition-all duration-200 ${styles[toast.kind]} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 text-sm">{toast.message}</div>
        <button
          onClick={onDismiss}
          className="text-xs opacity-60 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}