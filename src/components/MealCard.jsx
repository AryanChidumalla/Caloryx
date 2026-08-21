import React from "react";
import { Plus, Trash, PencilSimple, Sun, CloudSun, Moon, Cookie } from "@phosphor-icons/react";

const MEAL_CONFIGS = {
  breakfast: {
    title: "Breakfast",
    icon: Sun,
    accent: "text-amber-600 bg-amber-50 border-amber-200",
  },
  lunch: {
    title: "Lunch",
    icon: CloudSun,
    accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  dinner: {
    title: "Dinner",
    icon: Moon,
    accent: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  snacks: {
    title: "Snacks",
    icon: Cookie,
    accent: "text-purple-600 bg-purple-50 border-purple-200",
  },
};

export default function MealCard({
  mealType = "breakfast",
  items = [],
  onAddFood,
  onEditFood,
  onDeleteFood,
}) {
  const config = MEAL_CONFIGS[mealType] || MEAL_CONFIGS.breakfast;
  const Icon = config.icon;

  const totalCalories = Math.round(
    items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Meal Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${config.accent}`}>
            <Icon size={22} weight="bold" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {config.title}
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {totalCalories} kcal
            </span>
          </div>
        </div>

        <button
          onClick={() => onAddFood(mealType)}
          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer active:scale-95"
        >
          <Plus size={14} weight="bold" />
          <span>Add Food</span>
        </button>
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {items.map((item) => {
            const cal = Math.round(item.calories || 0);
            const p = Math.round(item.protein || 0);
            const c = Math.round(item.carbs || 0);
            const f = Math.round(item.fats || 0);
            const qty = item.quantity ? `${item.quantity}x ` : "";

            return (
              <div
                key={item.id}
                className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-slate-50/70 transition group"
              >
                {/* Left: Food name & macros */}
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {item.dish_name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-xs text-slate-400 font-medium shrink-0">
                        ({item.quantity} servings)
                      </span>
                    )}
                  </div>

                  {/* Compact Macro Tags */}
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                    <span className="font-bold text-slate-700">{cal} kcal</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-blue-600 font-medium">P: {p}g</span>
                    <span className="text-amber-600 font-medium">C: {c}g</span>
                    <span className="text-rose-600 font-medium">F: {f}g</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditFood(item)}
                    title="Edit quantity"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <PencilSimple size={15} />
                  </button>
                  <button
                    onClick={() => onDeleteFood(item.id, mealType)}
                    title="Delete item"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          onClick={() => onAddFood(mealType)}
          className="m-3 p-4 border border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:bg-slate-50/70 hover:border-emerald-300 transition group"
        >
          <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-700 transition">
            + No {config.title.toLowerCase()} logged yet. Tap to add food.
          </span>
        </div>
      )}
    </div>
  );
}
