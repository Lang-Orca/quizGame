import React, {createContext, useContext, useState, useCallback, useRef} from 'react';
import {Snackbar} from 'react-native-paper';

interface Toast {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Toast) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({children}: {children: React.ReactNode}) {
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState<Toast>({message: ''});
  const queueRef = useRef<Toast[]>([]);

  const showToast = useCallback((t: Toast) => {
    if (visible) {
      queueRef.current.push(t);
      return;
    }
    setToast(t);
    setVisible(true);
  }, [visible]);

  const onDismiss = useCallback(() => {
    setVisible(false);
    const next = queueRef.current.shift();
    if (next) {
      setToast(next);
      setTimeout(() => setVisible(true), 100);
    }
  }, []);

  return (
      <ToastContext.Provider value={{showToast}}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={onDismiss}
        duration={toast.duration ?? 3000}
        style={{
          backgroundColor:
            toast.type === 'error' ? '#dc2626' :
            toast.type === 'success' ? '#16a34a' :
            toast.type === 'warning' ? '#d97706' :
            '#1e293b',
        }}>
        {toast.message}
      </Snackbar>
    </ToastContext.Provider>
  );
}
