import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setProfileComplete, setProfileData } from "../features/auth/authSlice";
import { upsertUserProfile } from "../services/profileService";
import {
  Sparkle,
  TrendDown,
  Scales,
  TrendUp,
  CircleNotch,
} from "@phosphor-icons/react";

export default function UserDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.auth.profile);

  const displayName =
    profile?.username || currentUser?.email?.split("@")[0] || "there";

  const [form, setForm] = useState({
    sex: profile?.sex || "male",
    age: profile?.age || "25",
    height: profile?.height || "175",
    weight: profile?.weight || "70",
    activityLevel: profile?.activity_level ? String(profile.activity_level) : "1.375",
    goalType: "deficit", // 'deficit' | 'maintain' | 'surplus'
    calorieAdjustment: 400, // calories to subtract or add
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activityOptions = [
    { label: "Sedentary", desc: "Little/no exercise", value: "1.2" },
    { label: "Lightly Active", desc: "1–3 workouts/wk", value: "1.375" },
    { label: "Moderate", desc: "3–5 workouts/wk", value: "1.55" },
    { label: "Very Active", desc: "6–7 workouts/wk", value: "1.725" },
  ];

  const goalOptions = [
    {
      id: "deficit",
      title: "Lose Fat",
      icon: TrendDown,
      desc: "Healthy calorie deficit",
    },
    {
      id: "maintain",
      title: "Maintain Weight",
      icon: Scales,
      desc: "Stay at current weight",
    },
    {
      id: "surplus",
      title: "Build Muscle",
      icon: TrendUp,
      desc: "Lean calorie surplus",
    },
  ];

  // Real-time calculations using Mifflin-St Jeor formula
  const calculations = useMemo(() => {
    const w = parseFloat(form.weight) || 0;
    const h = parseFloat(form.height) || 0;
    const a = parseFloat(form.age) || 0;
    const act = parseFloat(form.activityLevel) || 1.2;

    if (w <= 0 || h <= 0 || a <= 0) return null;

    // Mifflin - St Jeor:
    // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
    // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
    let bmr = 10 * w + 6.25 * h - 5 * a + (form.sex === "female" ? -161 : 5);
    const tdee = Math.round(bmr * act);

    let target = tdee;
    const adj = Number(form.calorieAdjustment) || 0;
    if (form.goalType === "deficit") {
      target = Math.max(1200, Math.round(tdee - adj));
    } else if (form.goalType === "surplus") {
      target = Math.round(tdee + adj);
    }

    // Default Macro Split: ~2g protein/kg or 30% P, 40% C, 30% F
    const proteinGrams = Math.round((target * 0.3) / 4);
    const carbsGrams = Math.round((target * 0.4) / 4);
    const fatGrams = Math.round((target * 0.3) / 9);

    return {
      bmr: Math.round(bmr),
      tdee,
      targetCalorie: target,
      proteinGrams,
      carbsGrams,
      fatGrams,
    };
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.id || !calculations) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        id: currentUser.id,
        sex: form.sex,
        age: parseInt(form.age, 10),
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
        activity_level: parseFloat(form.activityLevel),
        target_calorie: calculations.targetCalorie,
      };

      const updated = await upsertUserProfile(payload);
      dispatch(setProfileData(updated));
      dispatch(setProfileComplete(true));
      navigate("/dashboard");
    } catch (err) {
      console.error("Save profile error:", err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-200">
            <Sparkle size={14} weight="fill" />
            <span>Profile & Nutrition Goals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {displayName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Let's calculate your daily baseline and set up a personalized calorie
            target tailored to your body and goals.
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Biological Stats */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-800">
              1. Your Body Stats
            </h2>

            {/* Sex Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Biological Sex
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, sex: "male" }))}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                    form.sex === "male"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, sex: "female" }))}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                    form.sex === "female"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Measurements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={form.age}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, age: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="50"
                  max="260"
                  value={form.height}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, height: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="350"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, weight: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 2: Activity Level */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-800">
              2. Activity Level
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activityOptions.map((opt) => {
                const active = form.activityLevel === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, activityLevel: opt.value }))
                    }
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      active
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Goal Strategy */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-800">
              3. Primary Goal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {goalOptions.map((opt) => {
                const Icon = opt.icon;
                const active = form.goalType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, goalType: opt.id }))
                    }
                    className={`p-4 rounded-xl border text-center transition cursor-pointer ${
                      active
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="inline-flex p-2 rounded-lg bg-white border border-slate-200 mb-2">
                      <Icon
                        size={20}
                        weight="bold"
                        className={
                          active ? "text-emerald-600" : "text-slate-600"
                        }
                      />
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {opt.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {form.goalType !== "maintain" && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
                  <span>
                    {form.goalType === "deficit"
                      ? "Calorie Deficit"
                      : "Calorie Surplus"}
                  </span>
                  <span className="text-emerald-700 font-bold">
                    {form.calorieAdjustment} kcal/day
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="800"
                  step="50"
                  value={form.calorieAdjustment}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      calorieAdjustment: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Live Calculated Target Banner */}
          {calculations && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                    Calculated Daily Target
                  </div>
                  <div className="text-3xl font-black mt-1">
                    {calculations.targetCalorie}{" "}
                    <span className="text-base font-normal text-emerald-200">
                      kcal / day
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs text-emerald-100 space-y-0.5">
                  <div>BMR: {calculations.bmr} kcal</div>
                  <div>TDEE: {calculations.tdee} kcal</div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/20 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-emerald-200 font-semibold">Protein</div>
                  <div className="font-bold text-sm">
                    {calculations.proteinGrams}g
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-emerald-200 font-semibold">Carbs</div>
                  <div className="font-bold text-sm">
                    {calculations.carbsGrams}g
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-emerald-200 font-semibold">Fat</div>
                  <div className="font-bold text-sm">
                    {calculations.fatGrams}g
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !calculations}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white py-3.5 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <>
                <CircleNotch size={18} className="animate-spin" />
                <span>Saving Your Plan...</span>
              </>
            ) : (
              <span>Save Target & Go to Dashboard</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
