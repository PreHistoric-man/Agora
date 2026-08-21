import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Cloud, Copy, Cpu, KeyRound, Loader2, Lock, Server, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeOptions, deploymentRegions, type DeploymentDraft, type ScalingMode } from '../data/deploymentData';

const steps = ['Type', 'Configure', 'API', 'Review'];
const maskedKey = 'mv_test_••••••••••••••••';

export const DeploymentWizard: React.FC = () => {
  const { models, selectedModelId, setView, deployModel, updateDeployment, addToast } = useApp();
  const model = models.find((item) => item.id === selectedModelId) || models[0];
  const [step, setStep] = useState(0);
  const [deployment, setDeployment] = useState<{ id: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const completionHandled = useRef(false);
  const complete = Boolean(deployment && progress >= 100);
  const [draft, setDraft] = useState<DeploymentDraft>({
    modelId: model.id,
    name: `${model.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-production`,
    region: deploymentRegions[0],
    compute: computeOptions[1],
    scaling: 'auto',
    environment: 'production',
    apiEnabled: true
  });

  useEffect(() => {
    if (!deployment || progress >= 100) return;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        return Math.min(100, current + 8);
      });
    }, 300);
    return () => window.clearInterval(timer);
  }, [addToast, deployment, progress, updateDeployment]);

  useEffect(() => {
    if (!deployment || progress < 100 || completionHandled.current) return;
    completionHandled.current = true;
    void updateDeployment(deployment.id, {
      status: 'online',
      metrics: { requests: 0, successRate: 100, latency: 0, estimatedCost: 0, gpuUsage: 12 }
    });
    addToast('Deployment successful', 'success');
  }, [addToast, deployment, progress, updateDeployment]);

  const updateDraft = <K extends keyof DeploymentDraft>(key: K, value: DeploymentDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleDeploy = async () => {
    const created = await deployModel(draft);
    if (created) {
      completionHandled.current = false;
      setDeployment(created);
      setProgress(0);
    }
  };

  const copyKey = async () => {
    await navigator.clipboard?.writeText(maskedKey);
    addToast('Mock API key copied', 'success');
  };

  if (complete && deployment) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 animate-fade-in">
        <div className="rounded-3xl glass-panel p-8 text-center md:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 size={34} />
          </div>
          <p className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Deployment successful</p>
          <h1 className="mt-2 font-display text-3xl font-black text-white">{model.name} is online</h1>
          <p className="mx-auto mt-2 max-w-md font-sans text-sm text-slate-400">Your mock endpoint is ready for the next step in your integration.</p>
          <div className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2">
            <SummaryItem label="Deployment" value={draft.name} />
            <SummaryItem label="Region" value={draft.region} />
            <SummaryItem label="Status" value="Healthy" valueClass="text-emerald-400" />
            <SummaryItem label="Endpoint" value={`api.modelverse.dev/v1/${draft.name}`} />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => { setView('deployment-detail'); }} className="rounded-xl bg-cyan-500 px-5 py-3 font-display text-xs font-black uppercase text-slate-950 transition hover:bg-cyan-400">Manage Deployment</button>
            <button onClick={() => setView('deployments')} className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-display text-xs font-black uppercase text-slate-200 transition hover:bg-white/10">All Deployments</button>
          </div>
        </div>
      </div>
    );
  }

  if (deployment) {
    const progressSteps = ['Preparing model', 'Checking requirements', 'Allocating compute', 'Downloading model', 'Starting inference server', 'Running health check'];
    const activeStep = Math.min(progressSteps.length - 1, Math.floor(progress / 17));
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-6 animate-fade-in">
        <div className="rounded-3xl glass-panel p-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-5">
            <Loader2 className="animate-spin text-cyan-400" size={22} />
            <div><p className="font-display text-[10px] font-black uppercase tracking-wider text-cyan-400">ModelVerse Cloud</p><h1 className="font-display text-xl font-black text-white">Deploying {model.name}</h1></div>
          </div>
          <div className="mt-7 flex flex-col gap-4">
            {progressSteps.map((label, index) => (
              <div key={label} className={`flex items-center gap-3 font-sans text-sm ${index <= activeStep ? 'text-slate-200' : 'text-slate-600'}`}>
                {index < activeStep ? <Check size={16} className="text-emerald-400" /> : index === activeStep ? <Loader2 size={16} className="animate-spin text-cyan-400" /> : <span className="h-4 w-4 rounded-full border border-current" />}
                {label}
              </div>
            ))}
          </div>
          <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
          <p className="mt-2 text-right font-mono text-[10px] text-slate-500">{progress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 animate-fade-in">
      <button onClick={() => setView('model-detail')} className="mb-6 flex items-center gap-2 font-sans text-xs text-slate-500 transition hover:text-white"><ArrowLeft size={14} /> Back to model</button>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Future-ready deployment</p><h1 className="mt-2 font-display text-3xl font-black text-white">Deploy {model.name}</h1><p className="mt-1 font-sans text-sm text-slate-400">Make this model available to your applications through an API.</p></div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-left"><div className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-400" /><span className="font-display text-xs font-bold text-emerald-400">Owned</span></div><p className="mt-1 font-sans text-[10px] text-slate-500">{model.version} · {model.category}</p></div>
      </div>
      <div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-white/5 pb-4">{steps.map((label, index) => <React.Fragment key={label}><div className={`flex items-center gap-2 whitespace-nowrap font-display text-xs font-bold ${index === step ? 'text-cyan-400' : index < step ? 'text-emerald-400' : 'text-slate-600'}`}><span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-[10px]">{index < step ? <Check size={12} /> : index + 1}</span>{label}</div>{index < steps.length - 1 && <span className="h-px min-w-8 flex-1 bg-white/10" />}</React.Fragment>)}</div>
      <div className="rounded-3xl glass-panel p-6 md:p-8">
        {step === 0 && <TypeStep />}
        {step === 1 && <ConfigureStep draft={draft} updateDraft={updateDraft} />}
        {step === 2 && <ApiStep enabled={draft.apiEnabled} onToggle={() => updateDraft('apiEnabled', !draft.apiEnabled)} onCopy={copyKey} />}
        {step === 3 && <ReviewStep model={model} draft={draft} />}
        <div className="mt-8 flex justify-between border-t border-white/5 pt-6"><button disabled={step === 0} onClick={() => setStep((current) => current - 1)} className="rounded-xl border border-white/10 px-5 py-3 font-display text-xs font-bold text-slate-300 transition enabled:hover:bg-white/10 disabled:opacity-30">Back</button>{step < 3 ? <button onClick={() => setStep((current) => current + 1)} className="rounded-xl bg-cyan-500 px-6 py-3 font-display text-xs font-black uppercase text-slate-950 transition hover:bg-cyan-400">Continue</button> : <button onClick={handleDeploy} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-6 py-3 font-display text-xs font-black uppercase text-slate-950 transition hover:brightness-110"><Cloud size={15} /> Deploy Model</button>}</div>
      </div>
    </div>
  );
};

const TypeStep: React.FC = () => <div><h2 className="font-display text-xl font-black text-white">Choose deployment type</h2><p className="mt-1 font-sans text-xs text-slate-500">Start simple. You can add advanced infrastructure options later.</p><div className="mt-6 grid gap-4 md:grid-cols-3"><DeploymentType icon={Cloud} title="ModelVerse Cloud" description="We manage the infrastructure for you." recommended /><DeploymentType icon={Server} title="Self Hosted" description="Deploy to your own infrastructure." disabled /><DeploymentType icon={Cloud} title="External Cloud" description="Connect AWS, Azure or Google Cloud." disabled /></div></div>;

const DeploymentType: React.FC<{ icon: React.ElementType; title: string; description: string; recommended?: boolean; disabled?: boolean }> = ({ icon: Icon, title, description, recommended, disabled }) => <div className={`relative rounded-2xl border p-5 ${disabled ? 'border-white/5 opacity-45' : 'border-cyan-500/40 bg-cyan-500/5 shadow-lg shadow-cyan-500/5'}`}>{recommended && <span className="absolute right-3 top-3 rounded bg-cyan-500/15 px-2 py-1 font-display text-[9px] font-black uppercase text-cyan-400">Recommended</span>}<Icon className={disabled ? 'text-slate-500' : 'text-cyan-400'} size={22} /><h3 className="mt-5 font-display text-sm font-black text-white">{title}</h3><p className="mt-1 font-sans text-xs leading-relaxed text-slate-400">{description}</p>{disabled && <p className="mt-4 font-display text-[10px] font-bold uppercase tracking-wider text-amber-400">Coming soon</p>}</div>;

const ConfigureStep: React.FC<{ draft: DeploymentDraft; updateDraft: <K extends keyof DeploymentDraft>(key: K, value: DeploymentDraft[K]) => void }> = ({ draft, updateDraft }) => <div><h2 className="font-display text-xl font-black text-white">Configure deployment</h2><div className="mt-6 grid gap-6 md:grid-cols-2"><label className="flex flex-col gap-2 font-sans text-xs text-slate-400">Deployment Name<input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} className="glass-input rounded-xl px-3 py-3 text-sm text-white" /></label><label className="flex flex-col gap-2 font-sans text-xs text-slate-400">Region<select value={draft.region} onChange={(event) => updateDraft('region', event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white">{deploymentRegions.map((region) => <option key={region}>{region}</option>)}</select></label></div><div className="mt-7"><p className="font-sans text-xs font-bold text-slate-300">Compute</p><div className="mt-3 grid gap-3 md:grid-cols-3">{computeOptions.map((option) => <button key={option.type} onClick={() => updateDraft('compute', option)} className={`rounded-xl border p-4 text-left transition ${draft.compute.type === option.type ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}><Cpu size={16} className="text-cyan-400" /><span className="mt-3 block font-display text-xs font-black text-white">{option.type}</span><span className="mt-1 block font-sans text-[10px] text-slate-500">{option.vram} GB VRAM</span><span className="mt-3 block font-mono text-xs text-cyan-300">${option.hourlyRate.toFixed(2)} / hour</span></button>)}</div></div><div className="mt-7"><p className="font-sans text-xs font-bold text-slate-300">Scaling</p><div className="mt-3 grid gap-3 md:grid-cols-2">{(['fixed', 'auto'] as ScalingMode[]).map((mode) => <button key={mode} onClick={() => updateDraft('scaling', mode)} className={`rounded-xl border p-4 text-left ${draft.scaling === mode ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/[0.02]'}`}><span className="font-display text-xs font-black uppercase text-white">{mode === 'auto' ? 'Auto Scale' : 'Fixed'}</span><span className="mt-1 block font-sans text-[10px] text-slate-500">{mode === 'auto' ? 'Automatically add capacity when traffic increases.' : 'Keep one instance running.'}</span></button>)}</div></div><div className="mt-7"><p className="font-sans text-xs font-bold text-slate-300">Environment</p><div className="mt-3 flex flex-wrap gap-2">{(['development', 'staging', 'production'] as const).map((environment) => <button key={environment} onClick={() => updateDraft('environment', environment)} className={`rounded-lg px-3 py-2 font-display text-[10px] font-bold uppercase ${draft.environment === environment ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-400'}`}>{environment}</button>)}</div></div></div>;

const ApiStep: React.FC<{ enabled: boolean; onToggle: () => void; onCopy: () => void }> = ({ enabled, onToggle, onCopy }) => <div><h2 className="font-display text-xl font-black text-white">API configuration</h2><div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4"><div><p className="font-display text-sm font-bold text-white">Enable API access</p><p className="mt-1 font-sans text-xs text-slate-500">Requests must include a ModelVerse API key.</p></div><button onClick={onToggle} className={`h-7 w-12 rounded-full p-1 transition ${enabled ? 'bg-cyan-500' : 'bg-white/10'}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${enabled ? 'translate-x-5' : ''}`} /></button></div><div className="mt-4 rounded-2xl border border-white/10 p-4"><div className="flex items-center gap-2"><KeyRound size={15} className="text-cyan-400" /><span className="font-display text-xs font-bold text-white">API Key</span></div><div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-black/30 px-3 py-2"><code className="font-mono text-xs text-slate-300">{maskedKey}</code><button onClick={onCopy} title="Copy mock API key" className="text-slate-500 transition hover:text-white"><Copy size={14} /></button></div><button onClick={onCopy} className="mt-3 font-display text-[10px] font-bold uppercase text-cyan-400 hover:text-cyan-300">Generate New Key</button></div><div className="mt-5 flex items-center gap-2 font-sans text-[10px] text-slate-500"><Lock size={13} /> Prototype-only credentials. No real access is created.</div></div>;

const ReviewStep: React.FC<{ model: any; draft: DeploymentDraft }> = ({ model, draft }) => <div><h2 className="font-display text-xl font-black text-white">Review deployment</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{[['Model', `${model.name} ${model.version}`], ['Deployment', draft.name], ['Provider', 'ModelVerse Cloud'], ['Region', draft.region], ['Compute', draft.compute.type], ['Scaling', draft.scaling === 'auto' ? 'Auto Scale' : 'Fixed'], ['Environment', draft.environment], ['API', draft.apiEnabled ? 'Enabled' : 'Disabled'], ['Estimated Cost', '₹0.08 / generation']].map(([label, value]) => <SummaryItem key={label} label={label} value={value} />)}</div><p className="mt-6 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 font-sans text-[10px] leading-relaxed text-amber-200/70">These prices are estimated mock values for the prototype. No cloud resources or billing are created.</p></div>;

const SummaryItem: React.FC<{ label: string; value: string; valueClass?: string }> = ({ label, value, valueClass = 'text-slate-200' }) => <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3"><span className="block font-sans text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</span><span className={`mt-1 block truncate font-display text-xs font-bold ${valueClass}`}>{value}</span></div>;
