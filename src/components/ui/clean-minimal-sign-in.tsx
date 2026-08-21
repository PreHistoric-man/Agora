"use client" 

import { useState } from "react";
import { LogIn, Lock, Mail, KeyRound, ArrowLeft, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { supabase, isSupabaseConfigured, formatAuthError } from "@/lib/supabaseClient";

const SignIn2 = () => {
  const [viewMode, setViewMode] = useState<"signin" | "forgot_email" | "forgot_otp">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSignIn = async () => {
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error: authErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (authErr) {
          setError(formatAuthError(authErr));
        } else {
          setSuccess("Signed in successfully!");
        }
      } else {
        setSuccess("Sign in successful! (Demo Mode)");
      }
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Check if email exists in database and send OTP
  const handleSendOtp = async () => {
    setError("");
    setSuccess("");
    setDemoOtp(null);

    const targetEmail = email.trim();
    if (!targetEmail) {
      setError("Please enter your registered email address.");
      return;
    }
    if (!validateEmail(targetEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        // Request password reset OTP from Supabase
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(targetEmail, {
          redirectTo: window.location.origin
        });

        if (resetErr) {
          const msg = (resetErr.message || '').toLowerCase();
          if (
            msg.includes('user not found') ||
            msg.includes('user does not exist') ||
            msg.includes('not found')
          ) {
            setError("No account found with this email in our database. Please check your spelling.");
            setIsLoading(false);
            return;
          }

          // Fallback with shouldCreateUser: false
          const { error: otpErr } = await supabase.auth.signInWithOtp({
            email: targetEmail,
            options: { shouldCreateUser: false }
          });

          if (otpErr) {
            const otpMsg = (otpErr.message || '').toLowerCase();
            if (
              otpMsg.includes('signups not allowed') ||
              otpMsg.includes('user not found') ||
              otpMsg.includes('user does not exist')
            ) {
              setError("No account found with this email in our database. Please check your spelling.");
              setIsLoading(false);
              return;
            }
            setError(formatAuthError(otpErr));
            setIsLoading(false);
            return;
          }
        }
      } else {
        // Demo mode simulated OTP
        const genOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setDemoOtp(genOtp);
      }

      setSuccess(`A 6-digit OTP has been sent to ${targetEmail} if it exists in our system.`);
      setViewMode("forgot_otp");
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and update password
  const handleVerifyOtpAndReset = async () => {
    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        let { error: verifyErr } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp.trim(),
          type: 'recovery'
        });

        if (verifyErr) {
          const fb = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: otp.trim(),
            type: 'email'
          });
          if (fb.error) {
            setError(formatAuthError(fb.error || verifyErr));
            setIsLoading(false);
            return;
          }
        }

        const { error: updateErr } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateErr) {
          setError(formatAuthError(updateErr));
          setIsLoading(false);
          return;
        }
      }

      setSuccess("Password successfully updated! You can now sign in.");
      setViewMode("signin");
      setPassword("");
      setOtp("");
      setNewPassword("");
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 rounded-xl z-1">
      <div className="w-full max-w-sm bg-gradient-to-b from-sky-50/50 to-white rounded-3xl shadow-xl shadow-opacity-10 p-8 flex flex-col items-center border border-blue-100 text-black animate-fade-in">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-6 shadow-lg shadow-opacity-5">
          {viewMode === "signin" ? (
            <LogIn className="w-7 h-7 text-black" />
          ) : (
            <KeyRound className="w-7 h-7 text-blue-600" />
          )}
        </div>

        <h2 className="text-2xl font-semibold mb-2 text-center">
          {viewMode === "signin"
            ? "Sign in with email"
            : viewMode === "forgot_email"
            ? "Reset Password"
            : "Enter OTP Code"}
        </h2>

        <p className="text-gray-500 text-sm mb-6 text-center">
          {viewMode === "signin"
            ? "Make a new doc to bring your words, data, and teams together. For free"
            : viewMode === "forgot_email"
            ? "Enter your email to receive a 6-digit password reset OTP."
            : `Enter the 6-digit OTP code sent to ${email} and your new password.`}
        </p>

        {/* Demo OTP Box */}
        {demoOtp && (
          <div className="w-full mb-3 bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-800 flex justify-between items-center">
            <span>Demo OTP Code:</span>
            <span className="font-mono font-bold tracking-widest bg-white px-2 py-0.5 rounded border border-blue-300">
              {demoOtp}
            </span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="w-full mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-2.5 rounded-xl flex items-center gap-1.5 text-left">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="w-full mb-3 text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl text-left">
            {error}
          </div>
        )}

        {/* ================= SIGN IN VIEW ================= */}
        {viewMode === "signin" && (
          <div className="w-full flex flex-col gap-3 mb-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                placeholder="Email"
                type="email"
                value={email}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                placeholder="Password"
                type="password"
                value={password}
                className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setViewMode("forgot_email");
                }}
                className="text-xs hover:underline font-medium text-blue-600 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-gradient-to-b from-gray-700 to-gray-900 text-white font-medium py-2 rounded-xl shadow hover:brightness-105 cursor-pointer transition mb-4 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Get Started
            </button>
          </div>
        )}

        {/* ================= FORGOT PASSWORD: REQUEST OTP ================= */}
        {viewMode === "forgot_email" && (
          <div className="w-full flex flex-col gap-3 mb-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                placeholder="Registered Email"
                type="email"
                value={email}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={isLoading}
              className="w-full bg-gradient-to-b from-blue-600 to-indigo-700 text-white font-medium py-2 rounded-xl shadow hover:brightness-105 cursor-pointer transition mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Send 6-Digit OTP
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setViewMode("signin");
              }}
              className="text-xs text-gray-500 hover:text-black flex items-center justify-center gap-1 mt-2 cursor-pointer"
            >
              <ArrowLeft size={13} /> Back to Sign In
            </button>
          </div>
        )}

        {/* ================= FORGOT PASSWORD: VERIFY OTP & RESET ================= */}
        {viewMode === "forgot_otp" && (
          <div className="w-full flex flex-col gap-3 mb-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                placeholder="Enter 6-digit OTP"
                type="text"
                maxLength={8}
                value={otp}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm font-mono tracking-widest text-center"
                onChange={(e) => setOtp(e.target.value.trim())}
              />
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                placeholder="New Password (min 6 chars)"
                type="password"
                value={newPassword}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500">
              <button
                type="button"
                onClick={() => setViewMode("forgot_email")}
                className="hover:underline cursor-pointer"
              >
                Change Email
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} /> Resend OTP
              </button>
            </div>

            <button
              onClick={handleVerifyOtpAndReset}
              disabled={isLoading}
              className="w-full bg-gradient-to-b from-blue-600 to-indigo-700 text-white font-medium py-2 rounded-xl shadow hover:brightness-105 cursor-pointer transition mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Verify OTP & Set Password
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setViewMode("signin");
              }}
              className="text-xs text-gray-500 hover:text-black flex items-center justify-center gap-1 mt-2 cursor-pointer"
            >
              <ArrowLeft size={13} /> Back to Sign In
            </button>
          </div>
        )}

        {/* Social Logins Divider (Only on Sign In) */}
        {viewMode === "signin" && (
          <>
            <div className="flex items-center w-full my-2">
              <div className="flex-grow border-t border-dashed border-gray-200"></div>
              <span className="mx-2 text-xs text-gray-400">Or sign in with</span>
              <div className="flex-grow border-t border-dashed border-gray-200"></div>
            </div>
            <div className="flex gap-3 w-full justify-center mt-2">
              <button className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 transition grow">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-6 h-6"
                />
              </button>
              <button className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 transition grow">
                <img
                  src="https://www.svgrepo.com/show/448224/facebook.svg"
                  alt="Facebook"
                  className="w-6 h-6"
                />
              </button>
              <button className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 transition grow">
                <img
                  src="https://www.svgrepo.com/show/511330/apple-173.svg"
                  alt="Apple"
                  className="w-6 h-6"
                />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
 
export { SignIn2 };
