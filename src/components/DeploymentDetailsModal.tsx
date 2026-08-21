import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Deployment, DeploymentStatus } from '../types/deployment';
import { ModelLogo } from './ModelLogo';
import {
  X,
  Server,
  Cloud,
  HardDrive,
  Cpu,
  Calendar,
  StopCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';

interface DeploymentDetailsModalProps {
  deployment: Deployment | null;
  onClose: () => void;
}

export const DeploymentDetailsModal: React.FC<DeploymentDetailsModalProps> = ({
  deployment,
  onClose
}) => {
  const {
    stopDeployment,
    terminateDeployment,
    deleteDeployment,
    setSelectedModelId,
    setView,
    addToast
  } = useApp();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!deployment) return null;

  const model = deployment.model;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleStop = async () => {
    setActionLoading('stop');
    try {
      const res = await stopDeployment(deployment.id);
      if (res.success) {
        addToast(`Deployment for ${model?.name || deployment.model_id} stopped.`, 'warning');
      } else {
        addToast(res.error || 'Failed to stop deployment.', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleTerminate = async () => {
    setActionLoading('terminate');
    try {
      const res = await terminateDeployment(deployment.id);
      if (res.success) {
        addToast(`Deployment for ${model?.name || deployment.model_id} terminated.`, 'warning');
      } else {
        addToast(res.error || 'Failed to terminate deployment.', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this deployment record?')) return;
    setActionLoading('delete');
    try {
      const res = await deleteDeployment(deployment.id);
      if (res.success) {
        addToast('Deployment record deleted.', 'success');
        onClose();
      } else {
        addToast(res.error || 'Failed to delete deployment.', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: DeploymentStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="rounded-full px-3 py-1 font-display text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Running
          </span>
        );
      case 'deploying':
        return (
          <span className="rounded-full px-3 py-1 font-display text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
            <div className="w-2.5 h-2.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            Deploying
          </span>
        );
      case 'stopped':
        return (
          <span className="rounded-full px-3 py-1 font-display text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40 flex items-center gap-1.5">
            <StopCircle size={12} className="text-slate-400" />
            Stopped
          </span>
        );
      case 'failed':
        return (
          <span className="rounded-full px-3 py-1 font-display text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-rose-400" />
            Failed
          </span>
        );
      case 'terminated':
        return (
          <span className="rounded-full px-3 py-1 font-display text-xs font-bold bg-zinc-800 text-slate-400 border border-white/10 flex items-center gap-1.5 line-through">
            <XCircle size={12} className="text-slate-500" />
            Terminated
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="rounded-full px-3 py-1 font-display text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in select-none text-left">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e1017] border border-white/10 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Server size={18} />
            </span>
            <div>
              <h2 className="font-display text-lg font-black text-white">
                Deployment Details
              </h2>
              <span className="font-mono text-[10px] text-slate-400">
                ID: {deployment.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(deployment.status)}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* Model Identification Card */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/10 shrink-0 shadow-inner">
                {model ? (
                  <ModelLogo modelId={model.id} provider={model.provider} category={model.category} size={22} />
                ) : (
                  <Server size={20} className="text-cyan-400" />
                )}
              </span>
              <div>
                <h3 className="font-display text-base font-black text-white">
                  {model?.name || deployment.model_id}
                </h3>
                <span className="font-sans text-xs text-slate-400">
                  {model?.provider || 'AI Foundation Model'} • {model?.category || 'General'} • {model?.version || 'v1.0'}
                </span>
              </div>
            </div>

            {model && (
              <button
                type="button"
                onClick={() => {
                  setSelectedModelId(model.id);
                  setView('model-detail');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/20 font-display text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                View Model
              </button>
            )}
          </div>

          {/* Infrastructure Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
              <span className="text-[10px] text-slate-500 font-sans block mb-1">Provider</span>
              <span className="font-display font-bold text-white uppercase flex items-center gap-1.5">
                {deployment.provider === 'aws' ? <Cloud size={13} className="text-indigo-400" /> : <HardDrive size={13} className="text-cyan-400" />}
                {deployment.provider}
              </span>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
              <span className="text-[10px] text-slate-500 font-sans block mb-1">Deployment Type</span>
              <span className="font-display font-bold text-white capitalize">
                {deployment.deployment_type}
              </span>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
              <span className="text-[10px] text-slate-500 font-sans block mb-1">Region</span>
              <span className="font-display font-bold text-slate-200">
                {deployment.region || (deployment.provider === 'aws' ? 'us-east-1' : 'Local')}
              </span>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
              <span className="text-[10px] text-slate-500 font-sans block mb-1">Instance Type</span>
              <span className="font-display font-bold text-slate-200">
                {deployment.instance_type || 'g4dn.xlarge'}
              </span>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
              <span className="text-[10px] text-slate-500 font-sans block mb-1">GPU Hardware</span>
              <span className="font-display font-bold text-slate-200 flex items-center gap-1">
                <Cpu size={12} className="text-cyan-400" />
                {deployment.gpu_type || 'NVIDIA T4'}
              </span>
            </div>

            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
              <span className="text-[10px] text-slate-500 font-sans block mb-1">Created At</span>
              <span className="font-sans text-[11px] text-slate-300 flex items-center gap-1">
                <Calendar size={11} className="text-slate-400" />
                {new Date(deployment.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* AWS Real Instance Details (Phase 2B) */}
            {deployment.instance_id && (
              <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/20 p-3.5 sm:col-span-2">
                <span className="text-[10px] text-indigo-400 font-sans block mb-1">AWS EC2 Instance ID</span>
                <div className="flex items-center justify-between font-mono text-xs text-indigo-200">
                  <span>{deployment.instance_id}</span>
                  <button
                    onClick={() => handleCopy(deployment.instance_id!, 'instance_id')}
                    className="text-slate-400 hover:text-white p-1"
                    title="Copy Instance ID"
                  >
                    {copiedText === 'instance_id' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            )}

            {deployment.availability_zone && (
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
                <span className="text-[10px] text-slate-500 font-sans block mb-1">Availability Zone</span>
                <span className="font-mono text-xs text-slate-200 font-bold">
                  {deployment.availability_zone}
                </span>
              </div>
            )}

            {deployment.public_ip && (
              <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/20 p-3.5">
                <span className="text-[10px] text-emerald-400 font-sans block mb-1">Public IPv4</span>
                <div className="flex items-center justify-between font-mono text-xs text-emerald-200">
                  <span>{deployment.public_ip}</span>
                  <button
                    onClick={() => handleCopy(deployment.public_ip!, 'public_ip')}
                    className="text-slate-400 hover:text-white p-1"
                    title="Copy Public IP"
                  >
                    {copiedText === 'public_ip' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            )}

            {deployment.private_ip && (
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
                <span className="text-[10px] text-slate-500 font-sans block mb-1">Private IPv4</span>
                <div className="flex items-center justify-between font-mono text-xs text-slate-300">
                  <span>{deployment.private_ip}</span>
                  <button
                    onClick={() => handleCopy(deployment.private_ip!, 'private_ip')}
                    className="text-slate-400 hover:text-white p-1"
                    title="Copy Private IP"
                  >
                    {copiedText === 'private_ip' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* API Endpoint & Credential (Section 14: Only show if it actually exists) */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4 space-y-3">
            <h4 className="font-display text-xs font-bold text-slate-300 uppercase tracking-wider">
              Network & API Access
            </h4>

            {/* Endpoint */}
            <div>
              <span className="text-[10px] text-slate-500 font-sans block mb-1">Inference Endpoint</span>
              {deployment.endpoint ? (
                <div className="flex items-center justify-between rounded-xl bg-black/60 border border-cyan-500/30 px-3 py-2 text-xs font-mono text-cyan-300">
                  <span className="truncate">{deployment.endpoint}</span>
                  <button
                    onClick={() => handleCopy(deployment.endpoint!, 'endpoint')}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    {copiedText === 'endpoint' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-black/40 border border-white/5 px-3 py-2 text-xs font-mono text-slate-500 flex items-center justify-between">
                  <span>Pending deployment</span>
                  <span className="text-[10px] text-amber-400">No active endpoint provisioned</span>
                </div>
              )}
            </div>

            {/* API Key */}
            <div>
              <span className="text-[10px] text-slate-500 font-sans block mb-1">API Key Credential</span>
              {deployment.api_key ? (
                <div className="flex items-center justify-between rounded-xl bg-black/60 border border-amber-500/30 px-3 py-2 text-xs font-mono text-amber-300">
                  <span className="truncate">{deployment.api_key}</span>
                  <button
                    onClick={() => handleCopy(deployment.api_key!, 'apikey')}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    {copiedText === 'apikey' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-black/40 border border-white/5 px-3 py-2 text-xs font-mono text-slate-500 flex items-center justify-between">
                  <span>Pending deployment</span>
                  <span className="text-[10px] text-slate-400">Generated on active run</span>
                </div>
              )}
            </div>
          </div>

          {/* Configuration JSON */}
          {deployment.configuration && Object.keys(deployment.configuration).length > 0 && (
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4 space-y-2">
              <h4 className="font-display text-xs font-bold text-slate-300 uppercase tracking-wider">
                Configuration Payload
              </h4>
              <pre className="rounded-xl bg-black/60 border border-white/5 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
                {JSON.stringify(deployment.configuration, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions: Stop, Terminate, Delete */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            type="button"
            disabled={actionLoading !== null}
            onClick={handleDelete}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-display text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 size={13} /> Delete Record
          </button>

          <div className="flex items-center gap-2">
            {deployment.status === 'running' && (
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={handleStop}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-display text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <StopCircle size={14} /> Stop
              </button>
            )}

            {deployment.status !== 'terminated' && (
              <button
                type="button"
                disabled={actionLoading !== null}
                onClick={handleTerminate}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 font-display text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle size={14} /> Terminate
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-display text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
