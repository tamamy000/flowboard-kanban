"use client";

import { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error";
type Toast = { id: number; message: string; type: ToastType };
type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3000
      );
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-[100] pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-enter px-4 py-3 rounded-[10px] text-sm font-medium leading-5 shadow-lg ${
              toast.type === "error"
                ? "bg-delete text-white"
                : "bg-[#0a0a0a] text-white"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
