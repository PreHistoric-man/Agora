import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LAUNCHER_DOWNLOAD_URL,
  LAUNCHER_VERSION,
  LAUNCHER_FILE_SIZE,
  LAUNCHER_MIN_OS
} from '../config/launcherConfig';
import {
  Download,
  CheckCircle2,
  HardDrive,
  Cloud,
  Activity,
  Layers,
  ArrowRight,
  Monitor,
  Terminal,
  Apple,
  Sparkles,
  Zap,
  Box,
  Server,
  Play,
  Check,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Laptop
} from 'lucide-react';

export const LauncherDownloadPage: React.FC = () => {
  const { addToast, setView } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    addToast('Starting ModalHub Launcher download (Windows 64-bit installer)...', 'info');

    // Create a temporary anchor to trigger browser download of the configured installer URL
    try {
      const link = document.createElement('a');
      link.href = LAUNCHER_DOWNLOAD_URL;
      link.setAttribute('download', 'ModalHub-Launcher-Setup.exe');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('Direct download link trigger:', e);
      window.open(LAUNCHER_DOWNLOAD_URL, '_blank');
    }

    setTimeout(() => {
      setIsDownloading(false);
      addToast('Download started! Run the installer to set up ModalHub on your PC.', 'success');
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-[#0b0c10] text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambience & Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-cyan-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 right-10 w-96 h-96 bg-violet-600/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[1200px] left-10 w-96 h-96 bg-cyan-600/10 blur-[120px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Release Version Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Desktop Application • {LAUNCHER_VERSION}</span>
            <span className="text-white/20">|</span>
            <span className="text-slate-400">Windows Installer</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Your AI Library.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">
              On Your Desktop.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            The ModalHub Launcher brings your AI models directly to your desktop. Install models from your ModalHub library, manage your local installations, and deploy AI models with a simple, unified interface.
          </p>

          {/* CTA Group */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-download-btn"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 hover:from-cyan-400 hover:via-indigo-500 hover:to-cyan-400 text-white font-display text-base font-bold transition-all duration-300 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-75"
            >
              <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : 'group-hover:translate-y-0.5 transition-transform'}`} />
              <span>{isDownloading ? 'Starting Download...' : 'Download ModalHub Launcher'}</span>
            </button>
          </div>

          {/* Secondary specs */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span>Windows 10/11 • 64-bit</span>
            <span>•</span>
            <span>{LAUNCHER_FILE_SIZE}</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Installer
            </span>
          </div>
        </div>

        {/* Desktop Application Visual Mockup */}
        <div className="mt-14 md:mt-20 relative max-w-5xl mx-auto">
          {/* Ambient Window Glow */}
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />

          {/* Window Frame Container */}
          <div className="relative rounded-2xl bg-[#0e1017] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Window Title Bar */}
            <div className="px-4 py-3 bg-[#08090d] border-b border-white/10 flex items-center justify-between">
              {/* Traffic light window controls */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50" />
                <span className="ml-3 font-display text-xs font-bold text-slate-300 tracking-wide">
                  ModalHub Launcher
                </span>
              </div>

              {/* Status Indicator in Header */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ollama Daemon Ready
                </span>
                <span className="text-[11px] font-mono text-slate-500">v1.4.2</span>
              </div>
            </div>

            {/* Window Content Body */}
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gradient-to-b from-[#0e1017] to-[#090a0f]">
              {/* Left Sub-Section: Library */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                      Library
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">3 Registered Models</span>
                </div>

                {/* Model Cards in Mockup */}
                <div className="space-y-2.5">
                  {/* Qwen 3 - Installed */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-500/30 transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">
                        Q3
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">Qwen 3</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/20">
                            Reasoning
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block truncate">
                          32B Parameters • FP16 Weights
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      <span>Installed</span>
                    </div>
                  </div>

                  {/* Llama - Install */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-500/30 transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                        L3
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">Llama</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/20">
                            General
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block truncate">
                          70B Instruct • Ready for setup
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      tabIndex={-1}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold shrink-0 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Install</span>
                    </button>
                  </div>

                  {/* Whisper - Installed */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-500/30 transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 font-bold text-sm shrink-0">
                        W
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">Whisper</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/20">
                            Speech-to-Text
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block truncate">
                          Large-v3 • Local Audio Engine
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      <span>Installed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sub-Section: Deployments */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                      Deployments
                    </h3>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">1 Active Host</span>
                </div>

                {/* Deployment Card in Mockup */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 shadow-lg space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-display text-sm font-bold text-white block">Qwen 3</span>
                      <span className="text-xs text-slate-400">Modal Dedicated Container</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Running
                    </span>
                  </div>

                  {/* Infrastructure Details */}
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Environment:</span>
                      <span className="font-semibold text-slate-200">AWS • us-east-1</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Hardware:</span>
                      <span className="font-mono text-cyan-300 text-[11px]">NVIDIA A10G (24GB)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Endpoint:</span>
                      <span className="font-mono text-slate-300 text-[10px] truncate max-w-[140px]">
                        api.modalhub.ai/v1/q3
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Uptime: 99.98%</span>
                    <span className="text-cyan-400 font-medium hover:underline text-[11px] flex items-center gap-1">
                      Manage Endpoint <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 md:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Everything You Need to Manage Your AI
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            A native, high-performance desktop hub built for AI researchers, engineers, and developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Your Library */}
          <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/10 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">1. Your Library</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Access every AI model you've purchased from ModalHub in one desktop library.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 text-xs text-cyan-400 font-semibold flex items-center gap-1">
              <span>Automatic Supabase Sync</span>
            </div>
          </div>

          {/* Card 2: One-Click Installation */}
          <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/10 hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HardDrive className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">2. One-Click Installation</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Install supported AI models without manually managing model files and runtimes.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 text-xs text-indigo-400 font-semibold flex items-center gap-1">
              <span>Integrated Ollama Engine</span>
            </div>
          </div>

          {/* Card 3: Deploy Anywhere */}
          <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/10 hover:border-fuchsia-500/40 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">3. Deploy Anywhere</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Deploy your models locally or to supported cloud environments.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 text-xs text-fuchsia-400 font-semibold flex items-center gap-1">
              <span>Local GPU & Modal Cloud</span>
            </div>
          </div>

          {/* Card 4: Manage Deployments */}
          <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/10 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">4. Manage Deployments</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Start, stop, restart, and monitor your running AI deployments.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span>Live Health & Metrics</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">Simple Workflow</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Get up and running with your AI models in three straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-[#0e1017] border border-white/10 space-y-4">
            <div className="font-display text-3xl sm:text-4xl font-black text-cyan-400/80">01</div>
            <h3 className="font-display text-xl font-bold text-white">Download</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Download the ModalHub Launcher for your platform.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-[#0e1017] border border-white/10 space-y-4">
            <div className="font-display text-3xl sm:text-4xl font-black text-indigo-400/80">02</div>
            <h3 className="font-display text-xl font-bold text-white">Sign In</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sign in using your existing ModalHub account.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-[#0e1017] border border-white/10 space-y-4">
            <div className="font-display text-3xl sm:text-4xl font-black text-fuchsia-400/80">03</div>
            <h3 className="font-display text-xl font-bold text-white">Manage Your AI</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Access your purchased models and manage your deployments.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Support Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h3 className="font-display text-xl font-bold text-white">Platform Support</h3>
          <p className="text-xs text-slate-400 mt-1">
            Native desktop support across major operating systems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {/* Windows */}
          <div className="p-5 rounded-2xl bg-[#0e1017] border border-cyan-500/30 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-white block">Windows</span>
              <span className="text-xs text-slate-400">10 / 11 (64-bit)</span>
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              Available
            </span>
          </div>

          {/* Linux */}
          <div className="p-5 rounded-2xl bg-[#0e1017]/50 border border-white/5 text-center space-y-3 opacity-75">
            <div className="w-10 h-10 mx-auto rounded-xl bg-white/5 text-slate-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-slate-300 block">Linux</span>
              <span className="text-xs text-slate-500">AppImage / Deb</span>
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 text-xs font-medium">
              Coming Soon
            </span>
          </div>

          {/* macOS */}
          <div className="p-5 rounded-2xl bg-[#0e1017]/50 border border-white/5 text-center space-y-3 opacity-75">
            <div className="w-10 h-10 mx-auto rounded-xl bg-white/5 text-slate-400 flex items-center justify-center">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-slate-300 block">macOS</span>
              <span className="text-xs text-slate-500">Apple Silicon & Intel</span>
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 text-xs font-medium">
              Coming Soon
            </span>
          </div>
        </div>
      </section>

      {/* Dedicated Download Section Card */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#121520] to-[#0b0c10] border border-cyan-500/30 shadow-2xl text-center space-y-6 overflow-hidden">
          {/* Subtle Corner Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl mx-auto space-y-2 relative z-10">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
              Ready to use ModalHub?
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Download the desktop launcher and access your AI library anywhere.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display text-sm font-black transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              <Download className="w-4 h-4" />
              <span>Download for Windows</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono relative z-10">
            Windows 10/11 • 64-bit
          </div>
        </div>
      </section>

      {/* Already Installed Section */}
      <section className="py-8 px-4 sm:px-6 max-w-2xl mx-auto text-center">
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0e1017]/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-300 font-display text-sm font-bold">
            <Laptop className="w-4 h-4 text-cyan-400" />
            <span>Already have ModalHub Launcher?</span>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Open the ModalHub Launcher from your desktop to access your library.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 md:py-20 px-4 text-center border-t border-white/5 bg-[#08090d]">
        <div className="max-w-2xl mx-auto space-y-6">
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Your models. Your deployments. One place.
          </h3>

          <div className="flex items-center justify-center">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-sm font-bold transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download ModalHub Launcher</span>
            </button>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setView('store')}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
            >
              <span>Back to Marketplace Store</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
