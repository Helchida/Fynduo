import React, {
  createContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { View } from "react-native";
import { ToastContextProps } from "./types/ToastContext.type";
import { Toast, ToastType } from "@/types";
import { styles } from "./styles/ToastContext.style";
import { ToastItem } from "../components/ui/ToastItem/ToastItem";

export const ToastContext = createContext<ToastContextProps | undefined>(
  undefined
);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      type: ToastType,
      title: string,
      message?: string,
      duration: number = 4000
    ) => {
      const id = Date.now().toString();
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const success = useCallback(
    (title: string, message?: string) => {
      showToast("success", title, message);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      showToast("error", title, message);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      showToast("info", title, message);
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      showToast("warning", title, message);
    },
    [showToast]
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <View style={styles.toastContainer}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};
