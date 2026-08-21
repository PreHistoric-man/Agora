import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  AWS_INSTANCE_OPTIONS,
  AWS_REGIONS,
  LOCAL_RUNTIME_CONFIGS,
  type DeploymentDraft,
  type InstanceOption
} from '../types/deployment';
import { ModelLogo } from './ModelLogo';
import { AwsConnectionCard } from './AwsConnectionCard';
import {
  X,
  Server,
  Cloud,
  HardDrive,
  Cpu,
  Check,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Key,
  Globe,
  Radio,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

export const DeploymentWizardModal: React.FC = () => {
  const {
    wizardModelId,
    closeDeploymentWizard,
    models,
    isModelInLibrary,
    createDeployment,
    awsConnection,
    addToast,
    setView
  } = useApp();

  const { isAuthenticated, openAuthModal } = useAuth();

  // Selected Model
  const model = models.find((m) => m.id === wizardModelId) || null;
  const inLibrary = model ? isModelInLibrary(model.id) : false;

  // Wizard Steps: 1: Type, 2: Configure, 3: API, 4: Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Provider / Type state
  const [provider, setProvider] = useState<'local' | 'aws'>('local');

  // Step 2: Configuration state
  const [region, setRegion] = useState<string>('us-east-1');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('g4dn.xlarge');
  const [quantization, setQuantization] = useState<string>('Q4_K_M (Recommended)');
  const [port, setPort] = useState<number>(8080);
  const [threads, setThreads] = useState<number>(8);
  const [contextLength, setContextLength] = useState<number>(8192);
  const [customArgs, setCustomArgs] = useState<string>('');
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([
    { key: 'MODEL_ID', value: model?.id || 'model-primary' },
    { key: 'INFERENCE_ENGINE', value: 'vllm' }
  ]);

  // Step 4: Submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [costConfirmed, setCostConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state when opened with a different model
  useEffect(() => {
    if (wizardModelId) {
      setCurrentStep(1);
      setErrorMessage(null);
      setCostConfirmed(false);
      if (model) {
        setEnvVars([
          { key: 'MODEL_ID', value: model.id },
          { key: 'INFERENCE_ENGINE', value: 'vllm' }
        ]);
      }
    }
  }, [wizardModelId, model]);

  if (!wizardModelId || !model) {
    return null;
  }

  const selectedInstance: InstanceOption =
    AWS_INSTANCE_OPTIONS.find((inst) => inst.id === selectedInstanceId) || AWS_INSTANCE_OPTIONS[0];

  const handleAddEnvVar = () => {
    setEnvVars((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveEnvVar = (index: number) => {
    setEnvVars((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateEnvVar = (index: number, field: 'key' | 'value', val: string) => {
    setEnvVars((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!inLibrary) {
      setErrorMessage('You must add this model to your library before deploying it.');
      addToast('You must add this model to your library before deploying it.', 'error');
      return;
    }

    // If moving from Step 2 with AWS selected, verify AWS connection exists
    if (currentStep === 2 && provider === 'aws') {
      if (!awsConnection || awsConnection.status !== 'connected') {
        const err = 'AWS account not connected. Please verify your AWS IAM Role connection before proceeding.';
        setErrorMessage(err);
        addToast('AWS account not connected. Please verify your AWS connection.', 'error');
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleDeploy = async () => {
    setErrorMessage(null);

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!inLibrary) {
      const err = 'You must add this model to your library before deploying it.';
      setErrorMessage(err);
      addToast(err, 'error');
      return;
    }

    // Check AWS connection if provider is AWS
    if (provider === 'aws' && (!awsConnection || awsConnection.status !== 'connected')) {
      const err = 'AWS account not connected. You must verify your AWS IAM Role connection before provisioning cloud deployments.';
      setErrorMessage(err);
      addToast('AWS account not connected. Please verify your AWS connection first.', 'error');
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      // Build env vars object
      const envVarsObj: Record<string, string> = {};
      envVars.forEach((ev) => {
        if (ev.key.trim()) {
          envVarsObj[ev.key.trim()] = ev.value;
        }
      });

      const draft: DeploymentDraft = {
        model_id: model.id,
        provider,
        deployment_type: provider === 'local' ? 'local' : 'cloud',
        region: provider === 'aws' ? region : 'local',
        instance_type: provider === 'aws' ? selectedInstance.id : 'local-host',
        gpu_type: provider === 'aws' ? selectedInstance.gpu : 'Local GPU/CPU',
        configuration: {
          port: provider === 'local' ? port : 8000,
          threads: provider === 'local' ? threads : undefined,
          contextLength,
          quantization: provider === 'local' ? quantization : undefined,
          vram: provider === 'aws' ? selectedInstance.vramGb : undefined,
          envVars: envVarsObj,
          customArgs: customArgs.trim() || undefined
        }
      };

      const result = await createDeployment(draft);

      if (result.success && result.deployment) {
        addToast(
          `Created deployment for ${model.name} (${provider.toUpperCase()}). Status: 🟡 Pending.`,
          'success'
        );
        closeDeploymentWizard();
        setView('library');
      } else {
        const errorMsg = result.error || 'Failed to create deployment record.';
        setErrorMessage(errorMsg);
        addToast(errorMsg, 'error');
      }
    } catch (err: any) {
      const msg = err?.message || 'An unexpected error occurred during deployment.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in select-none text-left">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0e1017] border border-white/10 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Server size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-black text-white">
                  Deploy Model
                </h2>
                <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 font-display text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                  Phase 1 System
                </span>
              </div>
              <p className="font-sans text-xs text-slate-400">
                Target Model: <span className="text-white font-semibold">{model.name}</span> ({model.provider})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDeploymentWizard}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="grid grid-cols-4 border-b border-white/10 bg-black/40 text-xs">
          {[
            { step: 1, label: '1. Type', icon: Radio },
            { step: 2, label: '2. Configure', icon: Sliders },
            { step: 3, label: '3. API', icon: Key },
            { step: 4, label: '4. Review', icon: Check }
          ].map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <div
                key={s.step}
                className={`flex items-center justify-center gap-2 py-3 px-2 border-r last:border-r-0 border-white/5 transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 font-bold border-b-2 border-b-cyan-400'
                    : isCompleted
                    ? 'text-slate-300 bg-white/[0.02]'
                    : 'text-slate-500'
                }`}
              >
                <s.icon size={13} className="hidden sm:inline" />
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-cyan-400 text-black'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check size={12} /> : s.step}
                </span>
                <span className="hidden sm:inline font-display">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Body Content by Step */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* Library ownership alert if model is not owned */}
          {!inLibrary && (
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3 text-xs text-amber-300">
              <AlertCircle size={18} className="shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-200">Library Verification Warning</strong>
                You must add this model to your library before deploying it. Return to the marketplace to acquire and add this model to your library first.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-start gap-3 text-xs text-rose-300">
              <ShieldAlert size={18} className="shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="font-semibold block text-rose-200">Deployment Notice</strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 1: TYPE */}
          {/* ==================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="font-display text-sm font-black text-white uppercase tracking-wider mb-1">
                  Step 1: Choose Deployment Provider & Type
                </h3>
                <p className="font-sans text-xs text-slate-400">
                  Select whether you want to prepare this model for local execution or provision cloud infrastructure on AWS.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Local Runtime */}
                <div
                  onClick={() => setProvider('local')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    provider === 'local'
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          provider === 'local'
                            ? 'bg-cyan-400 text-black'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        <HardDrive size={20} />
                      </span>
                      <div>
                        <h4 className="font-display text-sm font-bold text-white">Local Runtime</h4>
                        <span className="font-sans text-[10px] text-cyan-400 font-medium">
                          provider = local • type = local
                        </span>
                      </div>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                        provider === 'local'
                          ? 'border-cyan-400 bg-cyan-400 text-black'
                          : 'border-white/20'
                      }`}
                    >
                      {provider === 'local' && <Check size={12} />}
                    </div>
                  </div>

                  <p className="font-sans text-xs text-slate-400 leading-relaxed">
                    Deploy locally via ModalHub Desktop Launcher or local GGUF / Ollama backend server on your host machine.
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-2 border-t border-white/5">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">Port 8080</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">GGUF / Safetensors</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Zero Cloud Cost</span>
                  </div>
                </div>

                {/* Option 2: AWS Cloud */}
                <div
                  onClick={() => setProvider('aws')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    provider === 'aws'
                      ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          provider === 'aws'
                            ? 'bg-indigo-400 text-black'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        <Cloud size={20} />
                      </span>
                      <div>
                        <h4 className="font-display text-sm font-bold text-white">AWS Cloud Instance</h4>
                        <span className="font-sans text-[10px] text-indigo-400 font-medium">
                          provider = aws • type = cloud
                        </span>
                      </div>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                        provider === 'aws'
                          ? 'border-indigo-400 bg-indigo-400 text-black'
                          : 'border-white/20'
                      }`}
                    >
                      {provider === 'aws' && <Check size={12} />}
                    </div>
                  </div>

                  <p className="font-sans text-xs text-slate-400 leading-relaxed">
                    Prepare configuration for dedicated EC2 GPU instances (e.g. g4dn, g5) on AWS with secure networking.
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] pt-2 border-t border-white/5">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">Dedicated GPU</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">Global Regions</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Phase 2 EC2 Ready</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: CONFIGURE */}
          {/* ==================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-display text-sm font-black text-white uppercase tracking-wider mb-1">
                  Step 2: Configure Deployment Parameters
                </h3>
                <p className="font-sans text-xs text-slate-400">
                  {provider === 'local'
                    ? 'Configure port, quantization, context window, and environment settings for the local runtime.'
                    : 'Select cloud region, GPU instance type, and runtime environment settings for future AWS provisioning.'}
                </p>
              </div>

              {provider === 'aws' ? (
                /* AWS Configuration */
                <div className="space-y-5">
                  {/* Dedicated AWS Account Connection & Verification Card */}
                  <AwsConnectionCard
                    selectedRegion={region}
                    onRegionChange={setRegion}
                    onConnected={(_accId) => {
                      setErrorMessage(null);
                    }}
                  />

                  {/* Region Selection */}
                  <div>
                    <label className="block font-display text-xs font-bold text-slate-300 mb-1.5">
                      Cloud Region
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {AWS_REGIONS.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.id}) {r.id === 'us-east-1' ? '— ✓ MVP Supported' : '— (Unavailable in MVP)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Instance Type Selection */}
                  <div>
                    <label className="block font-display text-xs font-bold text-slate-300 mb-1.5">
                      Instance Type & Hardware Acceleration
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {AWS_INSTANCE_OPTIONS.map((inst) => {
                        const isMvpSupported = inst.id === 'g4dn.xlarge';
                        return (
                          <div
                            key={inst.id}
                            onClick={() => setSelectedInstanceId(inst.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                              selectedInstanceId === inst.id
                                ? 'bg-indigo-500/15 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-display text-xs font-bold text-white">{inst.name}</span>
                                {isMvpSupported ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    MVP Supported
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                                    Phase 3
                                  </span>
                                )}
                              </div>
                              <span className="font-sans text-[10px] text-indigo-300 font-semibold">{inst.hourlyCostEst}</span>
                            </div>
                            <span className="font-sans text-[11px] text-slate-300 flex items-center gap-1.5">
                              <Cpu size={12} className="text-cyan-400" /> {inst.gpu} ({inst.vramGb}GB VRAM)
                            </span>
                            <span className="font-sans text-[10px] text-slate-400">
                              {inst.vCpu} vCPU • {inst.ramGb}GB RAM
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {(region !== 'us-east-1' || selectedInstanceId !== 'g4dn.xlarge') && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0 text-amber-400" />
                        <span>This configuration is not available in the current MVP. Please select <strong>us-east-1</strong> and <strong>g4dn.xlarge (NVIDIA T4)</strong>.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Local Runtime Configuration */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-display text-xs font-bold text-slate-300 mb-1.5">
                        Local Server Port
                      </label>
                      <input
                        type="number"
                        value={port}
                        onChange={(e) => setPort(parseInt(e.target.value, 10) || 8080)}
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        placeholder="8080"
                      />
                    </div>

                    <div>
                      <label className="block font-display text-xs font-bold text-slate-300 mb-1.5">
                        Quantization Precision
                      </label>
                      <select
                        value={quantization}
                        onChange={(e) => setQuantization(e.target.value)}
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        {LOCAL_RUNTIME_CONFIGS.quantizationOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-display text-xs font-bold text-slate-300 mb-1.5">
                        Context Length (Tokens)
                      </label>
                      <input
                        type="number"
                        value={contextLength}
                        onChange={(e) => setContextLength(parseInt(e.target.value, 10) || 8192)}
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        placeholder="8192"
                      />
                    </div>

                    <div>
                      <label className="block font-display text-xs font-bold text-slate-300 mb-1.5">
                        CPU / Worker Threads
                      </label>
                      <input
                        type="number"
                        value={threads}
                        onChange={(e) => setThreads(parseInt(e.target.value, 10) || 8)}
                        className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        placeholder="8"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Environment Variables */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-display text-xs font-bold text-slate-300">
                    Environment Variables
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEnvVar}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add Variable
                  </button>
                </div>

                <div className="space-y-2">
                  {envVars.map((ev, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ev.key}
                        onChange={(e) => handleUpdateEnvVar(idx, 'key', e.target.value)}
                        placeholder="KEY"
                        className="w-1/2 rounded-lg bg-black/60 border border-white/10 px-3 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        value={ev.value}
                        onChange={(e) => handleUpdateEnvVar(idx, 'value', e.target.value)}
                        placeholder="VALUE"
                        className="w-1/2 rounded-lg bg-black/60 border border-white/10 px-3 py-1.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEnvVar(idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom CLI Arguments */}
              <div className="border-t border-white/10 pt-4">
                <label className="block font-display text-xs font-bold text-slate-300 mb-1.5">
                  Custom Runtime / Launch Arguments (Optional)
                </label>
                <input
                  type="text"
                  value={customArgs}
                  onChange={(e) => setCustomArgs(e.target.value)}
                  placeholder="--tensor-parallel-size 1 --gpu-memory-utilization 0.90"
                  className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 3: API */}
          {/* ==================================================== */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="font-display text-sm font-black text-white uppercase tracking-wider mb-1">
                  Step 3: Deployment API & Credential Configuration
                </h3>
                <p className="font-sans text-xs text-slate-400">
                  Inspect the API endpoint routing and credential lifecycle. No fake credentials or mock endpoints will be created in this phase.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-4">
                {/* Endpoint Status */}
                <div>
                  <label className="block font-display text-xs font-bold text-slate-300 mb-1">
                    API Endpoint
                  </label>
                  <div className="flex items-center justify-between rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-2">
                      <Globe size={14} className="text-cyan-400" />
                      Pending deployment
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Not Provisioned
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-slate-500 mt-1">
                    Real endpoints are assigned only after runtime boot in Phase 2.
                  </p>
                </div>

                {/* API Key Status */}
                <div>
                  <label className="block font-display text-xs font-bold text-slate-300 mb-1">
                    API Credential
                  </label>
                  <div className="flex items-center justify-between rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-2">
                      <Key size={14} className="text-amber-400" />
                      Pending deployment
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      Secured in Supabase
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-slate-500 mt-1">
                    API keys are created exclusively upon successful runtime deployment and stored securely behind RLS.
                  </p>
                </div>

                {/* Protocol Specifications */}
                <div className="border-t border-white/5 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>
                    Protocol: <strong className="text-white">OpenAI-Compatible REST + SSE Streaming</strong>
                  </span>
                  <span>
                    Auth: <strong className="text-white">Bearer Token Authorization</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 4: REVIEW */}
          {/* ==================================================== */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="font-display text-sm font-black text-white uppercase tracking-wider mb-1">
                  Step 4: Review Deployment Summary
                </h3>
                <p className="font-sans text-xs text-slate-400">
                  Confirm the deployment configuration below before saving to your Supabase account.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                    <ModelLogo modelId={model.id} provider={model.provider} category={model.category} size={20} />
                  </span>
                  <div>
                    <h4 className="font-display text-sm font-black text-white">{model.name}</h4>
                    <span className="font-sans text-[11px] text-slate-400">
                      {model.provider} • {model.category} • {model.version || 'v1.0'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Provider</span>
                    <span className="font-display font-bold text-white uppercase">{provider}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Deployment Type</span>
                    <span className="font-display font-bold text-white capitalize">
                      {provider === 'local' ? 'Local Runtime' : 'Cloud Instance'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Status</span>
                    <span className="font-display font-bold text-amber-300 flex items-center gap-1">
                      🟡 Ready to deploy
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Region</span>
                    <span className="font-display font-bold text-slate-200">
                      {provider === 'aws' ? region : 'Local Host'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Instance / Host</span>
                    <span className="font-display font-bold text-slate-200">
                      {provider === 'aws' ? selectedInstance.name : 'localhost'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">GPU / Hardware</span>
                    <span className="font-display font-bold text-slate-200">
                      {provider === 'aws' ? selectedInstance.gpu : 'Local CPU/GPU'}
                    </span>
                  </div>
                </div>

                {provider === 'local' ? (
                  <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-[11px] text-slate-300 flex flex-wrap gap-4">
                    <span>Port: <strong className="text-cyan-400">{port}</strong></span>
                    <span>Quantization: <strong className="text-cyan-400">{quantization}</strong></span>
                    <span>Threads: <strong className="text-cyan-400">{threads}</strong></span>
                    <span>Context Length: <strong className="text-cyan-400">{contextLength}</strong></span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* AWS Connection Status in Review */}
                    {awsConnection && awsConnection.status === 'connected' ? (
                      <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-3 text-xs flex items-center justify-between text-emerald-300">
                        <span className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                          <span>
                            <strong>✓ AWS Connected</strong> • Account: <code className="font-mono">{awsConnection.account_id}</code> ({awsConnection.region || region})
                          </span>
                        </span>
                        <span className="font-mono text-[10px] text-emerald-400/80 hidden sm:inline">
                          Verified STS Role
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs flex items-center justify-between text-amber-300">
                        <span className="flex items-center gap-2">
                          <AlertCircle size={16} className="text-amber-400 shrink-0" />
                          <span>AWS account not connected.</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
                        >
                          Connect AWS
                        </button>
                      </div>
                    )}

                    <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-[11px] text-slate-300 flex flex-wrap gap-4">
                      <span>Est. Cost: <strong className="text-indigo-400">{selectedInstance.hourlyCostEst}</strong></span>
                      <span>VRAM: <strong className="text-indigo-400">{selectedInstance.vramGb}GB</strong></span>
                      <span>vCPU: <strong className="text-indigo-400">{selectedInstance.vCpu} cores</strong></span>
                    </div>

                    {/* Cost Safety Confirmation (Phase 2B Mandate) */}
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-display text-xs font-bold text-amber-300 block">
                            AWS Compute & Resource Cost Acknowledgment
                          </span>
                          <p className="font-sans text-xs text-amber-200/90 leading-relaxed">
                            You are about to create an AWS GPU instance. AWS may charge your account for compute and related resources.
                          </p>
                        </div>
                      </div>
                      <label className="flex items-center gap-2.5 pt-1 text-xs text-slate-200 cursor-pointer select-none border-t border-amber-500/20">
                        <input
                          type="checkbox"
                          checked={costConfirmed}
                          onChange={(e) => setCostConfirmed(e.target.checked)}
                          className="h-4 w-4 rounded border-amber-500/40 bg-black/60 text-indigo-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-sans text-xs font-medium text-amber-100">
                          I confirm and authorize creating this AWS GPU EC2 instance.
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={currentStep === 1 ? closeDeploymentWizard : handleBack}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-display text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {currentStep > 1 && <ChevronLeft size={14} />}
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                Next Step <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || !inLibrary || (provider === 'aws' && (!costConfirmed || !awsConnection || awsConnection.status !== 'connected'))}
                onClick={handleDeploy}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Provisioning EC2 Instance...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Deploy Model
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
