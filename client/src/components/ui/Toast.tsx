import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import "./Toast.css";

type ToastItem = { id: number; message: string; variant: "info" | "success" | "error" };

type ToastContextValue = {
  show: (message: string, variant?: ToastItem["variant"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, variant: ToastItem["variant"] = "info") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toastHost" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.variant}`} role="status">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("ToastProvider is missing");
  return ctx;
}
