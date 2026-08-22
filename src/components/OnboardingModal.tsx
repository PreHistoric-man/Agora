import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Compass,
  Box,
  Cpu,
  Rocket,
  CheckCircle2,
  HelpCircle,
  Layers,
  Terminal,
  ShieldCheck,
  Zap,
  HardDrive
} from 'lucide-react';

interface OnboardingStep {
  id: number;
  stepNumber: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
  highlights: Array<{ text: string; icon: React.ComponentType<{ size?: number; className?: string }> }>;
  demoNote?: string;
  buttonText: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    stepNumber: '1',
    badge: 'Step 1 of 4 • Discover',
    title: '🔎 Discover AI Models',
    tagline: 'Welcome to Agora 👋 — The AI Model Marketplace',
    description:
      'Browse AI models by category, popularity, ratings, and capabilities. Compare frontier reasoning, coding, and multimodal models with transparent benchmark scores and token pricing.',
    icon: Compass,
    iconBg: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border-cyan-500/30',
    iconColor: 'text-cyan-400',
    highlights: [
      { text: 'Compare real-world benchmark metrics & token costs side-by-side', icon: Zap },
      { text: 'Filter by open-weights, commercial APIs, and specialized domains', icon: Layers },
      { text: 'Read verified developer reviews and community feedback', icon: CheckCircle2 }
    ],
    buttonText: 'Next'
  },
  {
    id: 2,
    stepNumber: '2',
    badge: 'Step 2 of 4 • Library',
    title: '📚 Build Your Library',
    tagline: 'Steam-Style Model Collection',
    description:
      'Found a model you like? Add it to your Agora Library so you can access it later from the website or Agora Launcher. Manage owned models, saved weights, and active API subscriptions in one unified dashboard.',
    icon: Box,
    iconBg: 'from-indigo-500/20 via-violet-500/20 to-purple-500/20 border-indigo-500/30',
    iconColor: 'text-indigo-400',
    highlights: [
      { text: 'Save models to your library with 1-click cloud sync', icon: Box },
      { text: 'Manage API sandbox keys and enterprise throughput quotas', icon: ShieldCheck },
      { text: 'Synchronize models seamlessly between Web and Desktop Launcher', icon: HardDrive }
    ],
    buttonText: 'Next'
  },
  {
    id: 3,
    stepNumber: '3',
    badge: 'Step 3 of 4 • Local AI & Launcher',
    title: '🖥️ Use AI Locally',
    tagline: 'Private GPU Execution & AI Playground',
    description:
      'Open the Agora Launcher to install supported models, run them locally, and interact with them through the AI Playground.',
    demoNote:
      'Supported models can be installed and run through the Agora Launcher. Some models in this demonstration use Agora\'s Demo Runtime.',
    icon: Cpu,
    iconBg: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    highlights: [
      { text: 'Install quantized GGUF weights via Ollama with 1 click', icon: HardDrive },
      { text: 'Interactive zero-latency AI Playground with parameter tuning', icon: Terminal },
      { text: 'Demo Runtime simulation for immediate offline evaluation', icon: Sparkles }
    ],
    buttonText: 'Next'
  },
  {
    id: 4,
    stepNumber: '4',
    badge: 'Step 4 of 4 • Deploy & Monetize',
    title: '🚀 Create & Deploy',
    tagline: 'Publishing & Serverless Cloud Endpoints',
    description:
      'Creators can publish AI models on Agora, while users can deploy supported models to available runtimes.',
    icon: Rocket,
    iconBg: 'from-fuchsia-500/20 via-pink-500/20 to-cyan-500/20 border-fuchsia-500/30',
    iconColor: 'text-fuchsia-400',
    highlights: [
      { text: 'Publish custom fine-tunes & earn creator royalties', icon: Sparkles },
      { text: 'Deploy to AWS, Modal, RunPod, or local infrastructure', icon: Rocket },
      { text: 'Instant OpenAI SDK compatible REST API endpoints', icon: Terminal }
    ],
    buttonText: 'Get Started'
  }
];

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, closeOnboarding } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const step = ONBOARDING_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  // Reset to step 1 whenever modal opens
  useEffect(() => {
    if (isOnboardingOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOnboardingOpen]);

  // Handle keyboard navigation (Esc to close, Arrow keys to navigate)
  useEffect(() => {
    if (!isOnboardingOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOnboarding();
      } else if (e.key === 'ArrowRight') {
        if (!isLastStep) {
          setCurrentStepIndex((prev) => Math.min(prev + 1, ONBOARDING_STEPS.length - 1));
        }
      } else if (e.key === 'ArrowLeft') {
        if (!isFirstStep) {
          setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingOpen, isFirstStep, isLastStep, closeOnboarding]);

  if (!isOnboardingOpen) return null;

  const handleNext = () => {
    if (isLastStep) {
      closeOnboarding();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    closeOnboarding();
  };

  const handleDotClick = (index: number) => {
    setCurrentStepIndex(index);
  };

  const IconComponent = step.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#07080b]/85 backdrop-blur-md animate-fade-in text-left select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeOnboarding();
        }
      }}
    >
      <div
        className="relative w-full max-w-xl md:max-w-2xl rounded-3xl bg-gradient-to-b from-slate-900/95 via-[#0b0d14]/95 to-slate-950/95 border border-white/10 p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col justify-between transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 font-display text-xs font-black text-white shadow-md">
              A
            </div>
            <div>
              <span className="font-display text-sm font-bold text-white tracking-wide">
                Welcome to Agora 👋
              </span>
              <span className="text-[11px] text-cyan-400 block -mt-0.5">
                The AI Model Marketplace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSkip}
              className="text-xs font-sans text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={closeOnboarding}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Close (Esc)"
              aria-label="Close tutorial"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Step Content Container */}
        <div className="py-6 space-y-5 relative z-10 min-h-[300px] flex flex-col justify-center animate-fade-in key={step.id}">
          {/* Step Badge & Icon Header */}
          <div className="flex items-start gap-4">
            <div
              className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr ${step.iconBg} border flex items-center justify-center shrink-0 shadow-lg`}
            >
              <IconComponent size={28} className={step.iconColor} />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-display font-bold uppercase tracking-wider text-cyan-300">
                <Sparkles size={11} className="text-cyan-400" />
                {step.badge}
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
                {step.title}
              </h2>
              <p className="font-sans text-xs text-cyan-400/90 font-medium">
                {step.tagline}
              </p>
            </div>
          </div>

          {/* Description Text */}
          <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
            {step.description}
          </p>

          {/* Feature Highlights Grid / List */}
          <div className="space-y-2 pt-1">
            {step.highlights.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-200 font-sans"
                >
                  <ItemIcon size={14} className="text-cyan-400 shrink-0" />
                  <span className="leading-snug">{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* Demo Runtime Disclaimer (Step 3) */}
          {step.demoNote && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 font-sans flex items-start gap-2">
              <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Hackathon Demo Note:</strong> {step.demoNote}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer: Progress Indicator & Navigation Buttons */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          {/* Progress Indicator (Dots) */}
          <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((s, idx) => {
              const isPassedOrActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => handleDotClick(idx)}
                  className={`transition-all rounded-full cursor-pointer ${
                    isCurrent
                      ? 'w-6 h-2 bg-gradient-to-r from-cyan-400 to-indigo-500'
                      : isPassedOrActive
                      ? 'w-2 h-2 bg-cyan-400/80 hover:bg-cyan-300'
                      : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                  title={`Go to step ${s.id}`}
                  aria-label={`Go to step ${s.id}`}
                />
              );
            })}
            <span className="font-sans text-[11px] text-slate-400 ml-1.5">
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-display text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{step.buttonText}</span>
              {isLastStep ? <Rocket size={14} /> : <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
