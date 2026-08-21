import React from "react";
import { Fire, Sparkle, WarningCircle } from "@phosphor-icons/react";

export default function CalorieGauge({ consumed = 0, target = 2000 }) {
  const safeTarget = Math.max(1, target || 2000);
  const roundedConsumed = Math.round(consumed);
  const remaining = safeTarget - roundedConsumed;
  const isOver = remaining < 0;
  const percentage = Math.min(100, Math.round((roundedConsumed / safeTarget) * 100));

  // Determine status color
  let progressColor = "bg-emerald-500";
  let textColor = "text-emerald-600";
  let statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (isOver) {
    progressColor = "bg-rose-500";
    textColor = "text-rose-600";
    statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (percentage >= 90) {
    progressColor = "bg-amber-500";
    textColor = "text-amber-600";
    statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
  }

  // SVG Circular Gauge calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left / Center: Circular Progress Gauge */}
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-100"
            />
            {/* Animated Progress Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`transition-all duration-500 ease-out ${
                isOver
                  ? "text-rose-500"
                  : percentage >= 90
                  ? "text-amber-500"
                  : "text-emerald-500"
              }`}
            />
          </svg>

          {/* Center Text inside Circle */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
              {Math.abs(remaining)}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
              {isOver ? "kcal over" : "kcal left"}
            </span>
          </div>
        </div>

        {/* Right Info Details */}
        <div className="flex-1 w-full flex flex-col justify-center space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Daily Calorie Goal
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {safeTarget.toLocaleString()} <span className="text-sm font-medium text-slate-500">kcal</span>
              </div>
            </div>

            <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusBadge}`}>
              {isOver ? (
                <>
                  <WarningCircle size={14} weight="bold" />
                  <span>Over Target</span>
                </>
              ) : (
                <>
                  <Fire size={14} weight="fill" />
                  <span>{percentage}% Logged</span>
                </>
              )}
            </div>
          </div>

          {/* Secondary linear breakdown bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Consumed: <strong className="text-slate-800 font-bold">{roundedConsumed.toLocaleString()} kcal</strong></span>
              <span>{isOver ? "0 kcal left" : `${remaining.toLocaleString()} kcal remaining`}</span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
