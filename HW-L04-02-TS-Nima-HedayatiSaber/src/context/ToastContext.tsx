import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastKind = "success" | "info" | "warning";
interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastValue {
  push: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastValue | null>(null);
let nextId = 1;

const COLORS: Record<ToastKind, string> = {
  success: "border-emerald-400/60",
  info: "border-brand",
  warning: "border-amber-400/70",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const push = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`card flex items-start gap-3 border-l-4 !p-3.5 text-sm ${COLORS[t.kind]}`}>
            <span className="flex-1">{t.message}</span>
            <button className="icon" aria-label="Dismiss" onClick={() => dismiss(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
