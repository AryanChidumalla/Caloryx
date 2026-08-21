import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  ChartLineUp,
  Clock,
  ForkKnife,
  User,
  EnvelopeSimple,
  LockKey,
  IdentificationCard,
  CircleNotch,
} from "@phosphor-icons/react";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isSignUp) {
      if (!username.trim()) {
        setError("Please choose a username.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setSubmitting(true);
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        const user = data?.user;
        if (user) {
          const { error: profileError } = await supabase.from("profiles").upsert([
            {
              id: user.id,
              username: username.trim(),
            },
          ]);

          if (profileError) {
            console.error("Profile creation notice:", profileError.message);
          }

          if (data.session) {
            setMessage("Account created! Redirecting to setup...");
          } else {
            setMessage("Account created! Please check your email to confirm your account.");
          }
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setSubmitting(false);
      }
    } else {
      setSubmitting(true);
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800">
      {/* Brand Hero Panel */}
      <div className="w-full md:w-5/12 bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-xl border border-white/20 shadow-xs">
              <ForkKnife size={28} weight="bold" className="text-emerald-200" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Caloryx
            </span>
          </div>

          {/* Hero Statement */}
          <div className="mt-12 md:mt-16">
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white">
              Effortless nutrition tracking.
            </h1>
            <p className="mt-4 text-emerald-100 text-base sm:text-lg leading-relaxed font-normal">
              Reach your health goals with fast, distraction-free calorie and
              macronutrient logging built for real everyday life.
            </p>
          </div>

          {/* Value Props */}
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <div className="bg-emerald-500/30 p-2 rounded-lg text-emerald-200">
                <User size={20} weight="bold" />
              </div>
              <div className="text-sm font-medium text-emerald-50">
                Personalized calorie & macro targets
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <div className="bg-emerald-500/30 p-2 rounded-lg text-emerald-200">
                <Clock size={20} weight="bold" />
              </div>
              <div className="text-sm font-medium text-emerald-50">
                Log meals in seconds with serving units
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <div className="bg-emerald-500/30 p-2 rounded-lg text-emerald-200">
                <ChartLineUp size={20} weight="bold" />
              </div>
              <div className="text-sm font-medium text-emerald-50">
                Clear visual progress without clutter
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/15 text-xs text-emerald-200/80">
          Caloryx &copy; {new Date().getFullYear()} · Simple, fast calorie logging.
        </div>
      </div>

      {/* Auth Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              {isSignUp
                ? "Start your health journey in less than a minute"
                : "Sign in to access your daily nutrition log"}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl mb-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError("");
                setMessage("");
              }}
              className={`py-2 rounded-lg transition-all text-center ${
                !isSignUp
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError("");
                setMessage("");
              }}
              className={`py-2 rounded-lg transition-all text-center ${
                isSignUp
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <IdentificationCard
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="e.g. Alex"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeSimple
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <LockKey
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockKey
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <span>✓</span>
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white py-3 rounded-xl font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <CircleNotch size={18} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isSignUp ? "Create Account" : "Sign In"}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
