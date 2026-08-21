import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Toast } from '../context/AppContext';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Loader2,
  HardDrive,
  CreditCard,
  Lock,
  Download
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
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          icon: Info
        };
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((t) => {
        const { bg, icon: Icon } = getToastStyle(t.type);
        return (
          <div
            key={t.id}
            className={`flex items-start justify-between gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-up ${bg}`}
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
  const {
    showGetModelModal,
    getModelModalId,
    closeGetModelModal,
    models,
    creators,
    startInstall,
    downloadingModelId,
    downloadProgress,
    downloadStep,
    addToast
  } = useApp();

  const [paymentStep, setPaymentStep] = useState<'checkout' | 'processing' | 'success'>('checkout');

  // Checkout inputs
  const [cardNumber, setCardNumber] = useState('4320 8890 2231 0098');
  const [expiry, setExpiry] = useState('11/29');
  const [cvv, setCvv] = useState('***');

  const model = models.find((m) => m.id === getModelModalId);
  const creator = model ? creators.find((c) => c.id === model.creatorId) : null;

  if (!showGetModelModal || !model) return null;

  const isPaid = model.price > 0;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPaid && paymentStep === 'checkout') {
      setPaymentStep('processing');
      setTimeout(() => {
        setPaymentStep('success');
        addToast('Payment authorization successful!', 'success');
      }, 2000);
    } else {
      startInstall(model.id);
    }
  };

  const handleSuccessConfirm = () => {
    setPaymentStep('checkout');
    startInstall(model.id);
  };

  // Generate progress characters for terminal look
  const getProgressString = (pct: number) => {
    const barsCount = Math.floor(pct / 5);
    const dashCount = 20 - barsCount;
    return '█'.repeat(barsCount) + '░'.repeat(dashCount) + ` ${pct}%`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080b]/75 backdrop-blur-sm p-4">
      {/* MODAL WRAPPER */}
      <div className="w-full max-w-md rounded-2xl glass-panel-heavy p-6 shadow-2xl animate-slide-up relative">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setPaymentStep('checkout');
            closeGetModelModal();
          }}
          className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Content depending on pricing and download state */}
        {downloadingModelId === model.id ? (
          /* Installing Progress */
          <div className="flex flex-col text-left py-4 gap-4">
            <h2 className="font-display text-lg font-black text-white">Installing {model.name}</h2>
            
            <pre className="rounded-lg bg-black/60 p-4 font-mono text-[11px] text-cyan-400 leading-normal border border-white/5">
              Installing {model.name}
              {'\n\n'}
              {getProgressString(downloadProgress)}
              {'\n\n'}
              {downloadStep}
            </pre>

            <button
              onClick={() => {
                closeGetModelModal();
                addToast('Installation runs in background library tab.', 'info');
              }}
              className="mt-2 w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 font-display text-xs font-black text-slate-950 uppercase cursor-pointer transition-all"
            >
              Run in Background
            </button>
          </div>
        ) : isPaid && paymentStep === 'checkout' ? (
          /* Checkout Payment Form */
          <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4 text-left">
            <div className="mb-2">
              <span className="font-display text-[9px] font-black text-cyan-400 tracking-wider uppercase">SECURE PAYMENT</span>
              <h2 className="font-display text-lg font-black text-white mt-1">Get Model - Checkout</h2>
              <p className="font-sans text-[11px] text-slate-500 mt-0.5">Licensing authorization sequence for local execution.</p>
            </div>

            {/* Model Summary card */}
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-14 rounded bg-gradient-to-br ${model.artwork}`}></div>
                <div className="flex flex-col">
                  <span className="font-display text-xs font-black text-slate-200">{model.name}</span>
                  <span className="font-sans text-[9px] text-slate-500">by {creator?.name}</span>
                </div>
              </div>
              <span className="font-display font-extrabold text-sm text-white">₹{model.price}</span>
            </div>

            {/* Card Inputs */}
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] text-slate-400 font-semibold">Cardholder Name</label>
                <input
                  type="text"
                  defaultValue="Gamer AI Explorer"
                  className="rounded-lg glass-input px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] text-slate-400 font-semibold">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 text-slate-500" size={14} />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-lg glass-input pl-9 pr-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-[10px] text-slate-400 font-semibold">Expiry Date</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="rounded-lg glass-input px-3 py-2 text-xs text-white text-center"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-[10px] text-slate-400 font-semibold">CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="rounded-lg glass-input px-3 py-2 text-xs text-white text-center"
                  />
                </div>
              </div>
            </div>

            {/* Safety badge */}
            <div className="flex items-center gap-2 text-slate-500 text-[10px] py-1">
              <Lock size={12} className="text-cyan-500" />
              <span>SSL Secure payment network. Mock checkout credentials authorized.</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 py-3 font-display text-xs font-black text-slate-950 uppercase cursor-pointer transition-all shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-1.5"
            >
              Complete Purchase (₹{model.price})
            </button>
          </form>
        ) : paymentStep === 'processing' ? (
          /* Processing payment loader */
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <div>
              <span className="font-display font-black text-white text-base">Processing Authorization...</span>
              <p className="font-sans text-xs text-slate-500 mt-1">Contacting local banking transaction ledger nodes...</p>
            </div>
          </div>
        ) : paymentStep === 'success' ? (
          /* Payment success screen */
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={24} fill="currentColor" className="text-[#07080b]" />
            </div>

            <div className="text-center">
              <h2 className="font-display text-lg font-black text-white">License Granted!</h2>
              <p className="font-sans text-xs text-slate-400 mt-1 leading-relaxed max-w-sm">
                Payment verified. The model licensing key has been written to your library cache node.
              </p>
            </div>

            <button
              onClick={handleSuccessConfirm}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 font-display text-xs font-black text-slate-950 uppercase cursor-pointer transition-all"
            >
              Start Installation
            </button>
          </div>
        ) : (
          /* FREE INSTALLATION CONFIRM */
          <div className="flex flex-col text-left py-2 gap-4">
            <div>
              <span className="font-display text-[9px] font-black text-cyan-400 tracking-wider uppercase">FREE LOCAL COMPILATION</span>
              <h2 className="font-display text-lg font-black text-white mt-1">Get {model.name}</h2>
              <p className="font-sans text-[11px] text-slate-500 mt-0.5">Select your deployment strategy below.</p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Option Local */}
              <div
                onClick={() => startInstall(model.id)}
                className="group rounded-xl border border-white/5 bg-white/[0.01] hover:border-cyan-500/20 p-4 flex items-start gap-4 cursor-pointer transition-all"
              >
                <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                  <HardDrive size={16} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-display text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    Download & Run Locally
                  </span>
                  <p className="font-sans text-[10px] text-slate-500 leading-normal mt-0.5">
                    Download weights ({model.sizeOnDisk}) and compile locally. Zero inference fee.
                  </p>
                </div>
              </div>

              {/* Option Cloud */}
              <div
                onClick={() => {
                  closeGetModelModal();
                  addToast('Managed cloud endpoints active. Keys generated.', 'success');
                }}
                className="group rounded-xl border border-white/5 bg-white/[0.01] hover:border-cyan-500/20 p-4 flex items-start gap-4 cursor-pointer transition-all"
              >
                <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform shrink-0">
                  <Download size={16} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-display text-xs font-bold text-slate-200 group-hover:text-violet-400 transition-colors">
                    Deploy to Managed Cloud API
                  </span>
                  <p className="font-sans text-[10px] text-slate-500 leading-normal mt-0.5">
                    Host model weights on ModelVerse server clusters. Pay per query: {model.pricingDetails.cloud}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
