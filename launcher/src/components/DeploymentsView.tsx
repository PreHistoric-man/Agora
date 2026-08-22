import React from 'react';
import { useLauncher } from '../context/LauncherContext';
import { useAuth } from '../context/AuthContext';
import { ModelLogo } from './ModelLogo';
import {
  Rocket,
  Server,
  Globe,
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ExternalLink,
  Copy,
} from 'lucide-react';

export const DeploymentsView: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const {
    deployments,
    deploymentsLoading,
    openModelDetail,
    showToast,
    setActiveView,
  } = useLauncher();

  const handleCopyEndpoint = (endpointUrl: string) => {
    navigator.clipboard.writeText(endpointUrl);
    showToast('Endpoint URL copied to clipboard!', 'success');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Running
          </span>
        );
      case 'deploying':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <RotateCw className="w-3 h-3 animate-spin text-amber-400" />
            Deploying
          </span>
        );
      case 'stopped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Stopped
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            Failed
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Cloud & Local Deployments
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and endpoints of your active model deployments on AWS, Modal, and dedicated servers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            {deployments.length} Total Deployment{deployments.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Guest Notice */}
      {!user && (
        <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 flex items-center justify-between gap-4">
          <div className="text-xs">
            <div className="font-bold text-violet-200">Sign in to view your Agora cloud deployments</div>
            <div className="text-slate-400 text-[11px]">
              Active endpoints and GPU instances configured on Agora are tied to your account.
            </div>
          </div>
          <button
            onClick={() => openAuthModal('signin')}
            className="px-3 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-400 text-slate-950 text-xs font-bold whitespace-nowrap transition-colors"
          >
            Sign In Now
          </button>
        </div>
      )}

      {/* Deployments List */}
      {deploymentsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900/60 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : deployments.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/30 border border-white/5 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Rocket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">No active deployments found</h3>
            <p className="text-xs text-slate-400">
              Deploy models onto dedicated GPU instances from your Agora Library or web console.
            </p>
          </div>
          <button
            onClick={() => setActiveView('library')}
            className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
          >
            <span>View Models in Library</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {deployments.map((dep) => {
            const model = dep.model;
            const modelName = model?.name || dep.model_id;
            const endpoint = dep.endpoint_url || `https://api.agora.ai/v1/models/${dep.model_id}`;

            return (
              <div
                key={dep.id}
                className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 space-y-4 hover:border-violet-500/40 transition-colors"
              >
                {/* Top Row: Identity & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ModelLogo logo={model?.providerLogo} name={modelName} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          {modelName}
                        </h3>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {dep.provider}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ID: <span className="font-mono text-slate-300">{dep.id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {getStatusBadge(dep.status)}
                    {model && (
                      <button
                        onClick={() => openModelDetail(model.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="View Model Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> Instance
                    </span>
                    <span className="font-mono text-slate-200">
                      {dep.instance_type || 'g5.xlarge (1x A10G)'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Region
                    </span>
                    <span className="font-mono text-slate-200">
                      {dep.region || 'us-east-1'}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Auth
                    </span>
                    <span className="font-mono text-emerald-400">
                      Bearer Token Protected
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Created
                    </span>
                    <span className="font-mono text-slate-200">
                      {new Date(dep.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Endpoint Bar */}
                <div className="flex items-center justify-between gap-3 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-white/5 text-xs font-mono">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-500 uppercase text-[10px] font-bold shrink-0">API URL:</span>
                    <span className="text-cyan-300 truncate">{endpoint}</span>
                  </div>

                  <button
                    onClick={() => handleCopyEndpoint(endpoint)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors shrink-0"
                    title="Copy Endpoint"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
