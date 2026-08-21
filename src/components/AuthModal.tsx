import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Shield,
  Bot,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import type { ViewType } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    authReturnView,
    signIn,
    signUp,
    sendPasswordResetOtp,
    verifyOtpAndResetPassword
  } = useAuth();

  const { addToast, setView } = useApp();

  // Sign In / Sign Up form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isCreator, setIsCreator] = useState(false);

  // Forgot Password / OTP states
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<'request_otp' | 'verify_otp'>('request_otp');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  // Common UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!showAuthModal) return null;

  const handleModeSwitch = (newMode: 'login' | 'register' | 'forgot-password') => {
    setErrorMessage(null);
    setSuccessNotice(null);
    setAuthModalMode(newMode);
    if (newMode === 'forgot-password') {
      if (email.trim() && !resetEmail) {
        setResetEmail(email.trim());
      }
      setResetStep('request_otp');
    }
  };

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessNotice(null);
    setDemoOtpHint(null);
    closeAuthModal();
  };

  // 1. Sign In submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (!result.success && result.error) {
      setErrorMessage(result.error.message);
    } else {
      addToast('Signed in successfully! Welcome to Agora.', 'success');
      handleClose();
      if (authReturnView) {
        setView(authReturnView as ViewType);
      }
    }
  };

  // 2. Sign Up submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!email.trim()) {
      setErrorMessage('Please provide an email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    const result = await signUp({
      email,
      password,
      username: username.trim() || email.split('@')[0],
      displayName: displayName.trim() || username.trim() || email.split('@')[0],
      isCreator
    });
    setIsSubmitting(false);

    if (!result.success && result.error) {
      setErrorMessage(result.error.message);
    } else if (result.needsEmailConfirmation) {
      setSuccessNotice(
        'Account created! We have sent a confirmation link to your email. Please verify your address to sign in.'
      );
      addToast('Verification email sent.', 'info');
    } else {
      addToast('Account created and signed in! Welcome to Agora.', 'success');
      handleClose();
      if (authReturnView) {
        setView(authReturnView as ViewType);
      }
    }
  };

  // 3. Request OTP for Password Reset
  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);
    setDemoOtpHint(null);

    const targetEmail = resetEmail.trim();
    if (!targetEmail) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setIsSubmitting(true);
    const result = await sendPasswordResetOtp(targetEmail);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to send OTP. Please check if the email exists.');
    } else {
      setResetStep('verify_otp');
      setResendCooldown(60);
      setSuccessNotice(
        `We have verified your account and sent a 6-digit OTP code to ${targetEmail}. Please check your inbox and enter it below.`
      );
      if (result.isDemo && result.demoOtp) {
        setDemoOtpHint(result.demoOtp);
      }
      addToast(`OTP sent to ${targetEmail}`, 'info');
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setErrorMessage(null);
    setSuccessNotice(null);

    setIsSubmitting(true);
    const result = await sendPasswordResetOtp(resetEmail.trim());
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to resend OTP.');
    } else {
      setResendCooldown(60);
      setSuccessNotice(`New OTP code sent to ${resetEmail.trim()}.`);
      if (result.isDemo && result.demoOtp) {
        setDemoOtpHint(result.demoOtp);
      }
      addToast('New OTP sent to email.', 'info');
    }
  };

  // 4. Verify OTP and Set New Password
  const handleVerifyOtpAndResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const targetOtp = otpCode.trim();
    if (!targetOtp) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyOtpAndResetPassword(resetEmail.trim(), targetOtp, newPassword);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid or expired OTP code.');
    } else {
      addToast('Password successfully reset! You are now authenticated.', 'success');
      handleClose();
      if (authReturnView) {
        setView(authReturnView as ViewType);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080b]/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl glass-panel-heavy p-6 md:p-8 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 font-display text-lg font-black text-white shadow-lg shadow-cyan-500/20">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-black tracking-wider text-white">AGORA</span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-display text-[9px] font-bold text-cyan-400 border border-cyan-500/20">
                SUPABASE AUTH
              </span>
            </div>
            <span className="font-sans text-[11px] text-slate-400">Gathering Place for Ai Geeks</span>
          </div>
        </div>

        {/* Tab Switcher (Show on Login & Register modes) */}
        {authModalMode !== 'forgot-password' ? (
          <div className="flex rounded-xl bg-black/40 p-1 border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`flex-1 py-2 rounded-lg font-display text-xs font-bold transition-all ${
                authModalMode === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('register')}
              className={`flex-1 py-2 rounded-lg font-display text-xs font-bold transition-all ${
                authModalMode === 'register'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          /* Forgot Password Header */
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-cyan-400" />
              <span className="font-display text-sm font-bold text-white">Reset Password with OTP</span>
            </div>
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className="font-sans text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={13} />
              Back to Sign In
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 flex items-start gap-2.5 text-left text-rose-300 text-xs animate-slide-up">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-relaxed font-sans">{errorMessage}</span>
          </div>
        )}

        {/* Success / Notice Alert Box */}
        {successNotice && (
          <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-start gap-2.5 text-left text-emerald-300 text-xs animate-slide-up">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
            <span className="leading-relaxed font-sans">{successNotice}</span>
          </div>
        )}

        {/* Demo OTP Hint Alert (if in local demo testing) */}
        {demoOtpHint && (
          <div className="mb-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 p-3 flex items-center justify-between text-xs text-cyan-300">
            <span className="font-sans">Demo OTP Code:</span>
            <span className="font-mono font-bold tracking-widest text-white bg-black/40 px-2.5 py-1 rounded-lg border border-cyan-500/40">
              {demoOtpHint}
            </span>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {authModalMode === 'login' && (
          <form onSubmit={handleSignInSubmit} className="flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-500" size={15} />
                <input
                  type="email"
                  required
                  placeholder="geek@modalhub.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl glass-input pl-9 pr-3 py-2.5 font-sans text-xs text-white placeholder-slate-500 focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-sans text-[11px] font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('forgot-password')}
                  className="font-sans text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-slate-500" size={15} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl glass-input pl-9 pr-3 py-2.5 font-sans text-xs text-white placeholder-slate-500 focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 py-3 font-display text-xs font-black uppercase text-white tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Agora
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            <div className="mt-2 text-center">
              <span className="font-sans text-[11px] text-slate-400">
                New to ModalHub / Agora?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className="text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Create an account
                </button>
              </span>
            </div>
          </form>
        )}

        {/* ================= SIGN UP / REGISTER FORM ================= */}
        {authModalMode === 'register' && (
          <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-3.5 text-left">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] font-semibold text-slate-300">Display Name</label>
                <input
                  type="text"
                  placeholder="Alex Rivers"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="rounded-xl glass-input px-3 py-2 font-sans text-xs text-white placeholder-slate-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] font-semibold text-slate-300">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-2.5 top-2.5 text-slate-500" size={13} />
                  <input
                    type="text"
                    placeholder="alex_ai"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl glass-input pl-8 pr-3 py-2 font-sans text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-sans text-[10px] font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-500" size={14} />
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl glass-input pl-9 pr-3 py-2 font-sans text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 text-slate-500" size={13} />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl glass-input pl-8 pr-3 py-2 font-sans text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-sans text-[10px] font-semibold text-slate-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 text-slate-500" size={13} />
                  <input
                    type="password"
                    required
                    placeholder="Repeat"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl glass-input pl-8 pr-3 py-2 font-sans text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Creator / Developer Toggle */}
            <label className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors mt-1">
              <input
                type="checkbox"
                checked={isCreator}
                onChange={(e) => setIsCreator(e.target.checked)}
                className="rounded accent-cyan-400 h-4 w-4"
              />
              <div className="flex flex-col">
                <span className="font-display text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-cyan-400" />
                  Join as Model Creator / Publisher
                </span>
                <span className="font-sans text-[10px] text-slate-400">
                  Publish fine-tunes, host serverless models, and receive marketplace royalties.
                </span>
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 py-3 font-display text-xs font-black uppercase text-white tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Supabase Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            <div className="mt-1 text-center">
              <span className="font-sans text-[11px] text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            </div>
          </form>
        )}

        {/* ================= FORGOT PASSWORD / OTP FLOW ================= */}
        {authModalMode === 'forgot-password' && (
          <div className="flex flex-col gap-4 text-left">
            {resetStep === 'request_otp' ? (
              /* Step 1: Enter email to check if user exists and send OTP */
              <form onSubmit={handleRequestOtpSubmit} className="flex flex-col gap-4">
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  Enter your registered account email. If the account exists in our database, we will immediately send a 6-digit one-time password (OTP) to your inbox.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] font-semibold text-slate-300">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-slate-500" size={15} />
                    <input
                      type="email"
                      required
                      placeholder="geek@modalhub.ai"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full rounded-xl glass-input pl-9 pr-3 py-2.5 font-sans text-xs text-white placeholder-slate-500 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 py-3 font-display text-xs font-black uppercase text-white tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Checking Database & Sending OTP...
                    </>
                  ) : (
                    <>
                      Send 6-Digit OTP Code
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Enter OTP + New Password */
              <form onSubmit={handleVerifyOtpAndResetSubmit} className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-sans text-[10px] text-slate-400">Verifying Email</span>
                    <span className="font-sans text-xs font-bold text-cyan-300">{resetEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('request_otp');
                      setErrorMessage(null);
                      setSuccessNotice(null);
                      setDemoOtpHint(null);
                    }}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-sans text-[11px] font-semibold text-slate-300">
                      Enter 6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isSubmitting}
                      className="font-sans text-[10px] text-cyan-400 hover:underline flex items-center gap-1 disabled:opacity-50 disabled:no-underline cursor-pointer"
                    >
                      <RefreshCw size={11} className={isSubmitting ? 'animate-spin' : ''} />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 text-slate-500" size={15} />
                    <input
                      type="text"
                      maxLength={8}
                      required
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ''))}
                      className="w-full rounded-xl glass-input pl-9 pr-3 py-2.5 font-mono text-center tracking-widest text-base font-bold text-cyan-400 placeholder-slate-600 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-[10px] font-semibold text-slate-300">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 text-slate-500" size={13} />
                      <input
                        type="password"
                        required
                        placeholder="Min 6 chars"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl glass-input pl-8 pr-3 py-2 font-sans text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-sans text-[10px] font-semibold text-slate-300">Confirm New</label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 text-slate-500" size={13} />
                      <input
                        type="password"
                        required
                        placeholder="Repeat"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full rounded-xl glass-input pl-8 pr-3 py-2 font-sans text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 py-3 font-display text-xs font-black uppercase text-white tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying OTP & Updating Password...
                    </>
                  ) : (
                    <>
                      Verify OTP & Update Password
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="font-sans text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                Return to Sign In
              </button>
            </div>
          </div>
        )}

        {/* Supabase Security Badge Footer */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-slate-500 text-[10px]">
          <div className="flex items-center gap-1.5">
            <Shield size={12} className="text-cyan-400" />
            <span>Supabase Auth & RLS Protected</span>
          </div>
          <div className="flex items-center gap-1">
            <Bot size={12} className="text-indigo-400" />
            <span>PostgreSQL profiles</span>
          </div>
        </div>
      </div>
    </div>
  );
};
