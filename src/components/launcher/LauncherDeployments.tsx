import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Deployment } from '../../types/deployment';
import { ModelLogo } from '../ModelLogo';
import {
  Rocket,
  Search,
  XCircle,
  Plus,
  RefreshCw,
  Copy
} from 'lucide-react';

interface LauncherDeploymentsProps {
  onOpenDeployWizard: (modelId?: string) => void;
  onOpenDetails: (deploymentId: string) => void;
  onBrowseModels: () => void;
}

export const LauncherDeployments: React.FC<LauncherDeploymentsProps> = ({
  onOpenDeployWizard,
  onOpenDetails,
  onBrowseModels: _onBrowseModels
}) => {
  const {
    deployments,
    deploymentsLoading,
    refreshDeployments,
    stopDeployment,
    models,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [providerFilter, setProviderFilter] = useState<'all' | 'local' | 'aws'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'deploying' | 'stopped' | 'failed'>('all');
  const [copiedEndpointId, setCopiedEndpointId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filter deployments
  const filteredDeployments = useMemo(() => {
    let result = [...deployments];

    if (providerFilter !== 'all') {
      result = result.filter((d) => d.provider.toLowerCase() === providerFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status.toLowerCase() === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) => {
        const name = d.model?.name?.toLowerCase() || '';
        const modelId = d.model_id.toLowerCase();
        const instance = (d.instance_type || '').toLowerCase();
        const region = (d.region || '').toLowerCase();
        const endpoint = (d.endpoint || '').toLowerCase();
        return (
          name.includes(q) ||
          modelId.includes(q) ||
          instance.includes(q) ||
          region.includes(q) ||
          endpoint.includes(q)
        );
      });
    }

    return result;
  }, [deployments, providerFilter, statusFilter, searchQuery]);

  const handleCopyEndpoint = (e: React.MouseEvent, dep: Deployment) => {
    e.stopPropagation();
    if (!dep.endpoint) return;
    navigator.clipboard.writeText(dep.endpoint);
    setCopiedEndpointId(dep.id);
    addToast('Endpoint URL copied to clipboard.', 'info');
    setTimeout(() => setCopiedEndpointId(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDeployments();
      addToast('Deployments refreshed from cloud database.', 'info');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStop = async (e: React.MouseEvent, depId: string) => {
    e.stopPropagation();
    const res = await stopDeployment(depId);
    if (res.success) {
      addToast('Deployment instance stopped.', 'info');
    } else {
      addToast(res.error || 'Failed to stop instance.', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header & Deploy Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">Deployments Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of local runtime instances and AWS EC2 GPU deployments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/10 transition-colors"
            title="Refresh deployments"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => onOpenDeployWizard()}
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-md shadow-violet-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Deployment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deployments by model, instance, or region..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Provider Filter */}
          <div className="flex items-center rounded-lg bg-black/40 p-0.5 border border-white/10">
            <button
              onClick={() => setProviderFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                providerFilter === 'all' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Providers
            </button>
            <button
              onClick={() => setProviderFilter('local')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                providerFilter === 'local' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Local
            </button>
            <button
              onClick={() => setProviderFilter('aws')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                providerFilter === 'aws' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              AWS
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] text-slate-300 focus:outline-none focus:border-violet-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="running">🟢 Running</option>
            <option value="deploying">🟡 Deploying</option>
            <option value="stopped">⚪ Stopped</option>
            <option value="failed">🔴 Failed</option>
          </select>
        </div>
      </div>

      {/* Deployments Grid */}
      {deploymentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-900/60 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredDeployments.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-white/5 text-center space-y-4">
          <Rocket className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No deployments found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Launch models into local inference environments or deploy dedicated GPU endpoints on AWS with automated cross-account IAM role verification.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onOpenDeployWizard()}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-md shadow-violet-600/20"
            >
              Deploy Your First Model
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeployments.map((dep) => {
            const m = dep.model || models.find((mod) => mod.id === dep.model_id);
            const isRunning = dep.status === 'running';
            const isDeploying = dep.status === 'deploying';
            const isFailed = dep.status === 'failed';
            const isStopped = dep.status === 'stopped';

            return (
              <div
                key={dep.id}
                onClick={() => onOpenDetails(dep.id)}
                className="group p-5 rounded-xl bg-slate-900/70 border border-white/10 hover:border-violet-500/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5 cursor-pointer flex flex-col justify-between space-y-4"
              >
                {/* Header: Logo, Name, Status Pill */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-lg shrink-0">
                        <ModelLogo logo={m?.providerLogo} name={m?.name || dep.model_id} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-violet-300 transition-colors">
                          {m?.name || dep.model_id}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">{m?.provider || 'Custom'}</p>
                      </div>
                    </div>

                    {/* Status badge */}
                    {isRunning ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        RUNNING
                      </span>
                    ) : isDeploying ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                        DEPLOYING
                      </span>
                    ) : isFailed ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        FAILED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-white/10 text-[10px] font-medium">
                        STOPPED
                      </span>
                    )}
                  </div>

                  {/* Metadata Table */}
                  <div className="space-y-1.5 text-xs text-slate-400 font-mono bg-black/30 p-3 rounded-lg border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Provider:</span>
                      <span className="text-slate-200 font-semibold uppercase">{dep.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Instance:</span>
                      <span className="text-slate-200 truncate max-w-[140px]">{dep.instance_type || 'Localhost'}</span>
                    </div>
                    {dep.gpu_type && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">GPU:</span>
                        <span className="text-cyan-400 truncate max-w-[140px]">{dep.gpu_type}</span>
                      </div>
                    )}
                    {dep.region && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Region:</span>
                        <span className="text-slate-200">{dep.region}</span>
                      </div>
                    )}
                  </div>

                  {/* Endpoint snippet if available */}
                  {dep.endpoint && (
                    <div className="flex items-center justify-between gap-2 p-2 rounded bg-slate-900/90 border border-cyan-500/20 text-[11px]">
                      <span className="text-cyan-300 font-mono truncate max-w-[200px]">{dep.endpoint}</span>
                      <button
                        onClick={(e) => handleCopyEndpoint(e, dep)}
                        className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Copy endpoint"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {new Date(dep.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    {isRunning && (
                      <button
                        onClick={(e) => handleStop(e, dep.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 text-[11px] font-medium transition-colors"
                      >
                        Stop
                      </button>
                    )}
                    <button
                      onClick={() => onOpenDetails(dep.id)}
                      className="px-3 py-1 rounded bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-[11px] font-semibold transition-colors"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
