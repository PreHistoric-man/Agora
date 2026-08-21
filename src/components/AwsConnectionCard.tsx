import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AWS_REGIONS } from '../types/deployment';
import {
  MODALHUB_TRUST_CONFIG,
  generateTrustPolicyJson,
  generateDeploymentPermissionsPolicyJson
} from '../types/aws';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RefreshCw,
  Unlink,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface AwsConnectionCardProps {
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
  compact?: boolean;
  onConnected?: (accountId: string) => void;
}

export const AwsConnectionCard: React.FC<AwsConnectionCardProps> = ({
  selectedRegion = 'us-east-1',
  onRegionChange,
  compact: _compact = false,
  onConnected
}) => {
  const {
    awsConnection,
    awsLoading,
    verifyAwsConnection,
    disconnectAwsConnection,
    addToast
  } = useApp();

  const { isAuthenticated, openAuthModal } = useAuth();

  // Local form state
  const [roleArn, setRoleArn] = useState<string>(
    awsConnection?.role_arn || 'arn:aws:iam::625552167334:role/ModalHubDeploymentRole'
  );
  const [accountId, setAccountId] = useState<string>(
    awsConnection?.account_id || '625552167334'
  );
  const [region, setRegion] = useState<string>(
    awsConnection?.region || selectedRegion || 'us-east-1'
  );
  const [externalId] = useState<string>(
    awsConnection?.external_id || ''
  );

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [copiedTrustPolicy, setCopiedTrustPolicy] = useState<boolean>(false);
  const [copiedPermsPolicy, setCopiedPermsPolicy] = useState<boolean>(false);
  const [copiedExtId, setCopiedExtId] = useState<boolean>(false);

  // Sync state if awsConnection in context updates
  useEffect(() => {
    if (awsConnection) {
      setRoleArn(awsConnection.role_arn || 'arn:aws:iam::625552167334:role/ModalHubDeploymentRole');
      setAccountId(awsConnection.account_id || '625552167334');
      if (awsConnection.region) {
        setRegion(awsConnection.region);
      }
    }
  }, [awsConnection]);

  // Auto-extract 12-digit account ID when user inputs or pastes Role ARN
  const handleRoleArnChange = (val: string) => {
    setRoleArn(val);
    setErrorMessage(null);
    setSuccessMessage(null);

    const match = val.trim().match(/^arn:aws:iam::([0-9]{12}):role\//);
    if (match && match[1]) {
      setAccountId(match[1]);
    }
  };

  const handleAccountIdChange = (val: string) => {
    // Only allow digits up to 12 chars
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 12);
    setAccountId(cleaned);
    setErrorMessage(null);
  };

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    if (onRegionChange) {
      onRegionChange(newRegion);
    }
  };

  const handleVerify = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    const trimmedArn = roleArn.trim();
    if (!trimmedArn) {
      setErrorMessage('Please enter your AWS IAM Role ARN.');
      return;
    }

    if (!trimmedArn.startsWith('arn:aws:iam::') || !trimmedArn.includes(':role/')) {
      setErrorMessage('✕ AWS Connection Failed: Invalid IAM Role ARN format.');
      return;
    }

    setIsVerifying(true);

    try {
      const res = await verifyAwsConnection({
        roleArn: trimmedArn,
        accountId: accountId.trim() || undefined,
        region,
        externalId
      });

      if (res.success && res.status === 'connected') {
        const verifiedAcc = res.accountId || accountId || '625552167334';
        setSuccessMessage(`✓ AWS Connected\nAccount: ${verifiedAcc}\nRole: ${res.role || 'ModalHubDeploymentRole'}\nRegion: ${res.region || region}`);
        addToast(`AWS Connected: Account ${verifiedAcc}`, 'success');
        if (onConnected && verifiedAcc) {
          onConnected(verifiedAcc);
        }
      } else {
        const err = res.error || 'Unable to assume the ModalHub deployment role.';
        setErrorMessage(err);
        addToast(err, 'error');
      }
    } catch (err: any) {
      const msg = err?.message || 'Unable to assume the ModalHub deployment role.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect this AWS account?')) {
      const res = await disconnectAwsConnection();
      if (res.success) {
        addToast('AWS Account disconnected.', 'info');
        setSuccessMessage(null);
      }
    }
  };

  const copyTrustPolicy = () => {
    navigator.clipboard.writeText(generateTrustPolicyJson(externalId));
    setCopiedTrustPolicy(true);
    setTimeout(() => setCopiedTrustPolicy(false), 2000);
    addToast('Trust relationship policy copied to clipboard', 'info');
  };

  const copyPermissionsPolicy = () => {
    navigator.clipboard.writeText(generateDeploymentPermissionsPolicyJson());
    setCopiedPermsPolicy(true);
    setTimeout(() => setCopiedPermsPolicy(false), 2000);
    addToast('IAM deployment permissions policy copied to clipboard', 'info');
  };

  const copyExternalId = () => {
    navigator.clipboard.writeText(externalId);
    setCopiedExtId(true);
    setTimeout(() => setCopiedExtId(false), 2000);
    addToast('External ID copied to clipboard', 'info');
  };

  const isConnected = awsConnection && awsConnection.status === 'connected';

  return (
    <div
      id="aws-connection-container"
      className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 space-y-4 text-left"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            }`}
          >
            <Cloud size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-sm font-bold text-white">Connect AWS</h4>
              {isConnected ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  <CheckCircle2 size={11} />
                  Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  Not Connected
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-slate-400 mt-0.5">
              Deploy AI models directly into your AWS account via cross-account IAM role assumption.
            </p>
          </div>
        </div>

        {isConnected && (
          <button
            type="button"
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-sans border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer"
            title="Disconnect AWS Account"
          >
            <Unlink size={12} />
            <span className="hidden sm:inline">Disconnect</span>
          </button>
        )}
      </div>

      {/* Connected State Banner */}
      {isConnected ? (
        <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-display text-sm font-bold">
              <ShieldCheck size={18} />
              ✓ AWS Connected
            </div>
            <span className="font-mono text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              STS Cross-Account Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
            <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-500/20">
              <span className="text-[10px] font-sans text-slate-400 block mb-0.5">Account</span>
              <span className="text-white font-bold tracking-wider">{awsConnection.account_id}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-500/20">
              <span className="text-[10px] font-sans text-slate-400 block mb-0.5">Role</span>
              <span className="text-emerald-300 font-bold truncate block">ModalHubDeploymentRole</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-500/20">
              <span className="text-[10px] font-sans text-slate-400 block mb-0.5">Region</span>
              <span className="text-white font-bold">{awsConnection.region || region}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-500/20 font-mono text-[11px] break-all text-slate-300">
            <span className="text-[10px] font-sans text-slate-400 block mb-0.5">IAM Role ARN</span>
            {awsConnection.role_arn}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Verified at: {awsConnection.verified_at ? new Date(awsConnection.verified_at).toLocaleString() : 'Active session'}</span>
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setSuccessMessage(null);
                handleVerify();
              }}
              disabled={isVerifying || awsLoading}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              <RefreshCw size={11} className={isVerifying ? 'animate-spin' : ''} />
              Re-verify connection
            </button>
          </div>
        </div>
      ) : (
        /* Unconnected / Form State */
        <div className="space-y-4 pt-1">
          {/* Quick Test Presets */}
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-2.5">
            <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Quick Test Configurations</span>
              <span className="text-[9px] font-mono text-indigo-400 lowercase">AgonaUser → ModalHubDeploymentRole</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAccountId('625552167334');
                  setRoleArn('arn:aws:iam::625552167334:role/ModalHubDeploymentRole');
                  setErrorMessage(null);
                }}
                className="px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30 cursor-pointer"
              >
                Valid: ModalHubDeploymentRole (625552167334)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountId('625552167334');
                  setRoleArn('invalid-role-arn');
                  setErrorMessage(null);
                }}
                className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-mono border border-white/10 cursor-pointer"
              >
                Invalid Format Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountId('625552167334');
                  setRoleArn('arn:aws:iam::625552167334:role/NonExistentRole');
                  setErrorMessage(null);
                }}
                className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-mono border border-white/10 cursor-pointer"
              >
                Non-Existent Role Test
              </button>
            </div>
          </div>

          {/* AWS Account ID */}
          <div>
            <label className="block font-display text-xs font-bold text-slate-300 mb-1.5">
              AWS Account ID
            </label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => handleAccountIdChange(e.target.value)}
              placeholder="e.g. 625552167334"
              maxLength={12}
              className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* IAM Role ARN */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-display text-xs font-bold text-slate-300">
                IAM Role ARN
              </label>
              <span className="font-sans text-[10px] text-indigo-400">
                Cross-Account AssumeRole
              </span>
            </div>
            <input
              type="text"
              value={roleArn}
              onChange={(e) => handleRoleArnChange(e.target.value)}
              placeholder="arn:aws:iam::625552167334:role/ModalHubDeploymentRole"
              className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Region Selection */}
          <div>
            <label className="block font-display text-xs font-bold text-slate-300 mb-1.5">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {AWS_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} — {r.name} ({r.latency})
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1 text-rose-300 text-xs animate-fade-in">
              <div className="flex items-center gap-2 font-bold font-display text-rose-400">
                <AlertTriangle size={15} className="shrink-0" />
                <span>✕ AWS Connection Failed</span>
              </div>
              <p className="font-sans pl-6 leading-relaxed text-slate-300">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-emerald-300 text-xs animate-fade-in font-mono">
              <div className="flex items-center gap-2 font-bold font-display text-emerald-400 text-sm">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>✓ AWS Connected</span>
              </div>
              <div className="pl-6 space-y-0.5 text-slate-200 text-xs font-mono">
                <div>Account: <strong className="text-white">{accountId || '625552167334'}</strong></div>
                <div>Role: <strong className="text-emerald-300">ModalHubDeploymentRole</strong></div>
                <div>Region: <strong className="text-white">{region || 'us-east-1'}</strong></div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || awsLoading}
            className={`w-full py-2.5 px-4 rounded-xl font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isVerifying || awsLoading
                ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isVerifying || awsLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Verifying AWS connection...</span>
              </>
            ) : (
              <>
                <Cloud size={14} />
                <span>Verify AWS Connection</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* IAM Setup Guide Accordion */}
      <div className="border-t border-white/5 pt-3">
        <button
          type="button"
          onClick={() => setShowInstructions((prev) => !prev)}
          className="w-full flex items-center justify-between py-1 text-xs text-slate-400 hover:text-slate-200 font-sans transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <HelpCircle size={14} className="text-indigo-400" />
            IAM Setup Instructions & Trust Policy Guide
          </span>
          {showInstructions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showInstructions && (
          <div className="mt-3 space-y-4 text-xs text-slate-300 font-sans bg-black/40 border border-white/5 rounded-xl p-4 animate-fade-in">
            <div>
              <h5 className="font-display font-bold text-white text-xs mb-1.5">
                How to set up cross-account IAM role in your AWS Account:
              </h5>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
                <li>
                  Open the <strong className="text-white">AWS IAM Console</strong> and navigate to <strong>Roles &gt; Create role</strong>.
                </li>
                <li>
                  Select <strong>Custom trust policy</strong> (or AWS account &gt; Another AWS account).
                </li>
                <li>
                  Configure the trust relationship for ModalHub using the policy below.
                </li>
                <li>
                  Attach the required deployment permissions (EC2 instances, security groups, status).
                </li>
                <li>
                  Copy the generated <strong className="text-white">Role ARN</strong>.
                </li>
                <li>
                  Enter the Role ARN above and click <strong className="text-white">Verify AWS Connection</strong>.
                </li>
              </ol>
            </div>

            {/* ModalHub Trusted Principal Info */}
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ModalHub Trusted Principal:</span>
                <code className="text-indigo-300 font-mono text-[10px] bg-black/40 px-2 py-0.5 rounded">
                  {MODALHUB_TRUST_CONFIG.trustedPrincipalArn}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">STS External ID:</span>
                <div className="flex items-center gap-1">
                  <code className="text-emerald-300 font-mono text-[10px] bg-black/40 px-2 py-0.5 rounded">
                    {externalId}
                  </code>
                  <button
                    type="button"
                    onClick={copyExternalId}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    title="Copy External ID"
                  >
                    {copiedExtId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Policy JSON */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-300 font-mono">
                  1. Trust Relationship Policy (JSON)
                </span>
                <button
                  type="button"
                  onClick={copyTrustPolicy}
                  className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {copiedTrustPolicy ? (
                    <>
                      <Check size={11} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Copy Policy JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-black/80 border border-white/10 text-[10px] text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-36">
                {generateTrustPolicyJson(externalId)}
              </pre>
            </div>

            {/* Permissions Policy JSON */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-300 font-mono">
                  2. Minimal Deployment Permissions Policy (JSON)
                </span>
                <button
                  type="button"
                  onClick={copyPermissionsPolicy}
                  className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {copiedPermsPolicy ? (
                    <>
                      <Check size={11} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Copy Policy JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-black/80 border border-white/10 text-[10px] text-slate-300 font-mono overflow-x-auto leading-relaxed max-h-36">
                {generateDeploymentPermissionsPolicyJson()}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
