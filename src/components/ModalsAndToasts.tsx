import React from 'react';
import { useApp } from '../context/AppContext';
import type { Toast } from '../context/AppContext';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert
} from 'lucide-react';

export const ToastStack: React.FC = () => {
  const { toasts, removeToast } = useApp();

  const getToastStyle = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          icon: CheckCircle2
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          icon: AlertTriangle
        };
      case 'error':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          icon: ShieldAlert
        };
      default:
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
          icon: Info
        };
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const { bg, icon: Icon } = getToastStyle(t.type);
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-up ${bg}`}
          >
            <div className="flex gap-2.5 items-start text-left">
              <Icon size={16} className="mt-0.5 shrink-0" />
              <span className="font-sans text-xs font-semibold leading-relaxed">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-current opacity-60 hover:opacity-100 p-0.5 rounded cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const ModalsManager: React.FC = () => {
  return null;
};
