import React from "react";
import { EggCrack, Carrot, Drop } from "@phosphor-icons/react";

export default function MacroBar({
  protein = 0,
  carbs = 0,
  fat = 0,
  calorieTarget = 2000,
}) {
  // Compute default targets based on 30% Protein / 40% Carbs / 30% Fat
  const target = Math.max(1200, calorieTarget || 2000);
  const targetProtein = Math.round((target * 0.3) / 4);
  const targetCarbs = Math.round((target * 0.4) / 4);
  const targetFat = Math.round((target * 0.3) / 9);

  const macros = [
    {
      id: "protein",
      name: "Protein",
      current: Math.round(protein),
      target: targetProtein,
      unit: "g",
      color: "bg-blue-500",
      trackColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
      icon: EggCrack,
    },
    {
      id: "carbs",
      name: "Carbs",
      current: Math.round(carbs),
      target: targetCarbs,
      unit: "g",
      color: "bg-amber-500",
      trackColor: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
      icon: Carrot,
    },
    {
      id: "fat",
      name: "Fat",
      current: Math.round(fat),
      target: targetFat,
      unit: "g",
      color: "bg-rose-500",
      trackColor: "bg-rose-50",
      textColor: "text-rose-600",
      borderColor: "border-rose-100",
      icon: Drop,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {macros.map((m) => {
        const Icon = m.icon;
        const pct = Math.min(100, Math.round((m.current / m.target) * 100));
        return (
          <div
            key={m.id}
            className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${m.trackColor} ${m.textColor}`}>
                  <Icon size={18} weight="bold" />
                </div>
                <span className="text-xs font-bold text-slate-700">{m.name}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {pct}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <div className="text-lg font-extrabold text-slate-900 leading-tight">
                {m.current}
                <span className="text-xs font-normal text-slate-500 ml-0.5">
                  / {m.target}{m.unit}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {Math.max(0, m.target - m.current)}{m.unit} left
              </div>
            </div>

            {/* Macro Progress Bar */}
            <div className={`w-full ${m.trackColor} h-1.5 rounded-full overflow-hidden`}>
              <div
                className={`h-full ${m.color} rounded-full transition-all duration-300`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
