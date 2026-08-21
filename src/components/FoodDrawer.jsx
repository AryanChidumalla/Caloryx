import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  MagnifyingGlass,
  Star,
  ClockCounterClockwise,
  Plus,
  Lightning,
  Sparkle,
  Minus,
  Check,
  CircleNotch,
} from "@phosphor-icons/react";
import {
  getFoods,
  getRecentFoods,
  saveRecentFood,
  getFavoriteFoods,
  toggleFavoriteFood,
  getCustomFoods,
  saveCustomFood,
} from "../services/foodService";

export default function FoodDrawer({
  isOpen,
  onClose,
  mealType = "breakfast",
  onAddFood,
  editingItem = null,
  onUpdateFood = null,
}) {
  const [tab, setTab] = useState("search"); // 'search' | 'recents' | 'quick' | 'custom'
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);

  // Active Selected Food configuration state
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [servingUnit, setServingUnit] = useState("serving"); // 'serving' | '100g' | 'custom'

  // Quick Add State
  const [quickName, setQuickName] = useState("");
  const [quickCalories, setQuickCalories] = useState("");
  const [quickProtein, setQuickProtein] = useState("");
  const [quickCarbs, setQuickCarbs] = useState("");
  const [quickFat, setQuickFat] = useState("");

  // Custom Food Form State
  const [customName, setCustomName] = useState("");
  const [customUnit, setCustomUnit] = useState("serving");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");

  // Load initial catalog & local storage lists
  useEffect(() => {
    if (!isOpen) return;

    setFavorites(getFavoriteFoods());
    setRecents(getRecentFoods());
    setCustomFoods(getCustomFoods());

    // If in edit mode, populate selected food directly
    if (editingItem) {
      setSelectedFood({
        id: editingItem.food_id || editingItem.id,
        dish_name: editingItem.dish_name,
        calories_kcal: (editingItem.calories || 0) / (editingItem.quantity || 1),
        protein_g: (editingItem.protein || 0) / (editingItem.quantity || 1),
        carbs_g: (editingItem.carbs || 0) / (editingItem.quantity || 1),
        fats_g: (editingItem.fats || 0) / (editingItem.quantity || 1),
      });
      setQuantity(editingItem.quantity || 1);
      return;
    }

    // Reset state for new entry
    setSelectedFood(null);
    setQuantity(1);
    setSearchQuery("");
    setTab("search");

    const loadDatabase = async () => {
      setLoadingFoods(true);
      try {
        const data = await getFoods();
        setFoods(data);
      } catch (err) {
        console.error("Error loading foods:", err);
      } finally {
        setLoadingFoods(false);
      }
    };

    loadDatabase();
  }, [isOpen, editingItem]);

  // Merge database foods and user custom foods for search
  const allAvailableFoods = useMemo(() => {
    const customList = customFoods.map((cf) => ({ ...cf, is_custom: true }));
    return [...customList, ...foods];
  }, [foods, customFoods]);

  // Filtered food list
  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return allAvailableFoods.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return allAvailableFoods
      .filter((f) => f.dish_name.toLowerCase().includes(q))
      .slice(0, 50);
  }, [allAvailableFoods, searchQuery]);

  // Scaled macros computation
  const scaledMacros = useMemo(() => {
    if (!selectedFood) return null;
    const q = Math.max(0.1, parseFloat(quantity) || 1);
    const baseCal = selectedFood.calories_kcal || selectedFood.calories || 0;
    const baseP = selectedFood.protein_g || selectedFood.protein || 0;
    const baseC = selectedFood.carbs_g || selectedFood.carbs || 0;
    const baseF = selectedFood.fats_g || selectedFood.fats || 0;

    return {
      calories: Math.round(baseCal * q),
      protein: Math.round(baseP * q),
      carbs: Math.round(baseC * q),
      fats: Math.round(baseF * q),
    };
  }, [selectedFood, quantity]);

  const handleToggleFavorite = (food, e) => {
    if (e) e.stopPropagation();
    const updated = toggleFavoriteFood(food);
    setFavorites(updated);
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setQuantity(1);
  };

  // Submit standard food log
  const handleConfirmLog = () => {
    if (!selectedFood || !scaledMacros) return;

    if (editingItem && onUpdateFood) {
      onUpdateFood(editingItem.id, {
        quantity: parseFloat(quantity) || 1,
        calories: scaledMacros.calories,
        protein: scaledMacros.protein,
        carbs: scaledMacros.carbs,
        fats: scaledMacros.fats,
      });
      onClose();
      return;
    }

    const newLog = {
      food_id: selectedFood.id || null,
      dish_name: selectedFood.dish_name,
      quantity: parseFloat(quantity) || 1,
      calories: scaledMacros.calories,
      protein: scaledMacros.protein,
      carbs: scaledMacros.carbs,
      fats: scaledMacros.fats,
      meal_type: mealType,
    };

    saveRecentFood(newLog);
    onAddFood(mealType, newLog);
    onClose();
  };

  // Submit Quick Add
  const handleQuickAdd = (e) => {
    e.preventDefault();
    const cal = parseFloat(quickCalories);
    if (!cal || cal <= 0) return;

    const newLog = {
      food_id: null,
      dish_name: quickName.trim() || "Quick Calorie Entry",
      quantity: 1,
      calories: Math.round(cal),
      protein: Math.round(parseFloat(quickProtein) || 0),
      carbs: Math.round(parseFloat(quickCarbs) || 0),
      fats: Math.round(parseFloat(quickFat) || 0),
      meal_type: mealType,
    };

    saveRecentFood(newLog);
    onAddFood(mealType, newLog);
    onClose();
  };

  // Submit Create Custom Food
  const handleCreateCustomFood = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customCalories) return;

    const created = saveCustomFood({
      dish_name: customName.trim(),
      calories_kcal: parseFloat(customCalories),
      protein_g: parseFloat(customProtein) || 0,
      carbs_g: parseFloat(customCarbs) || 0,
      fats_g: parseFloat(customFat) || 0,
      serving_unit: customUnit,
    });

    if (created) {
      setCustomFoods(getCustomFoods());
      // Directly select it for logging!
      setSelectedFood(created);
      setTab("search");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Drawer Container (Bottom Sheet on Mobile, Slide-Over on Desktop) */}
      <div className="relative w-full max-w-lg bg-white h-full max-h-[92vh] sm:max-h-full rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl flex flex-col z-10 self-end sm:self-auto animate-slide-up sm:animate-none">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              {editingItem ? "Edit Entry" : `Add to ${mealType}`}
            </div>
            <h2 className="text-lg font-black text-slate-900">
              {editingItem ? "Adjust Food Quantity" : "Food Logger"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* View Content: If Food Selected -> Quantity & Confirmation View */}
        {selectedFood ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Back to search if not in edit mode */}
              {!editingItem && (
                <button
                  onClick={() => setSelectedFood(null)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  ← Pick a different food
                </button>
              )}

              {/* Selected Food Hero */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedFood.dish_name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Base: {Math.round(selectedFood.calories_kcal || selectedFood.calories || 0)} kcal per serving
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleToggleFavorite(selectedFood, e)}
                    className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 transition cursor-pointer"
                  >
                    <Star
                      size={20}
                      weight={
                        favorites.some(
                          (f) =>
                            f.dish_name.toLowerCase() ===
                            selectedFood.dish_name.toLowerCase()
                        )
                          ? "fill"
                          : "regular"
                      }
                    />
                  </button>
                </div>
              </div>

              {/* Amount & Unit Selector */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Serving & Amount
                </label>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.max(0.5, Number((q - 0.5).toFixed(1))))
                      }
                      className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Minus size={16} weight="bold" />
                    </button>

                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-16 text-center font-bold text-base text-slate-900 bg-transparent outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Number((Number(q) + 0.5).toFixed(1)))
                      }
                      className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Plus size={16} weight="bold" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <select
                      value={servingUnit}
                      onChange={(e) => setServingUnit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="serving">Serving(s)</option>
                      <option value="bowl">Bowl / Plate</option>
                      <option value="piece">Piece / Item</option>
                      <option value="cup">Cup / Glass</option>
                      <option value="100g">100 Grams</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Calculated Real-time Macros Preview */}
              {scaledMacros && (
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Total Energy & Nutrition
                    </span>
                    <span className="text-2xl font-black text-emerald-900">
                      {scaledMacros.calories} <span className="text-xs font-normal text-emerald-700">kcal</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-100">
                      <span className="text-blue-600 font-semibold block text-[11px]">Protein</span>
                      <span className="font-extrabold text-sm text-slate-900">{scaledMacros.protein}g</span>
                    </div>
                    <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-100">
                      <span className="text-amber-600 font-semibold block text-[11px]">Carbs</span>
                      <span className="font-extrabold text-sm text-slate-900">{scaledMacros.carbs}g</span>
                    </div>
                    <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-100">
                      <span className="text-rose-600 font-semibold block text-[11px]">Fats</span>
                      <span className="font-extrabold text-sm text-slate-900">{scaledMacros.fats}g</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Log Button */}
            <button
              onClick={handleConfirmLog}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white py-3.5 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Check size={18} weight="bold" />
              <span>
                {editingItem
                  ? "Update Food Log"
                  : `Log to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} (${scaledMacros?.calories} kcal)`}
              </span>
            </button>
          </div>
        ) : (
          /* Main Navigation Tabs & Lists */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-4 p-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
              <button
                onClick={() => setTab("search")}
                className={`py-2 px-1 rounded-xl transition text-center flex flex-col items-center gap-1 cursor-pointer ${
                  tab === "search"
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "hover:text-slate-800"
                }`}
              >
                <MagnifyingGlass size={16} weight="bold" />
                <span>Search</span>
              </button>

              <button
                onClick={() => setTab("recents")}
                className={`py-2 px-1 rounded-xl transition text-center flex flex-col items-center gap-1 cursor-pointer ${
                  tab === "recents"
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "hover:text-slate-800"
                }`}
              >
                <ClockCounterClockwise size={16} weight="bold" />
                <span>Recents</span>
              </button>

              <button
                onClick={() => setTab("quick")}
                className={`py-2 px-1 rounded-xl transition text-center flex flex-col items-center gap-1 cursor-pointer ${
                  tab === "quick"
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "hover:text-slate-800"
                }`}
              >
                <Lightning size={16} weight="bold" />
                <span>Quick Add</span>
              </button>

              <button
                onClick={() => setTab("custom")}
                className={`py-2 px-1 rounded-xl transition text-center flex flex-col items-center gap-1 cursor-pointer ${
                  tab === "custom"
                    ? "bg-white text-emerald-700 shadow-xs font-bold"
                    : "hover:text-slate-800"
                }`}
              >
                <Plus size={16} weight="bold" />
                <span>Custom</span>
              </button>
            </div>

            {/* Tab 1: Search Database */}
            {tab === "search" && (
              <div className="flex-1 flex flex-col overflow-hidden p-4">
                {/* Search Bar */}
                <div className="relative mb-3">
                  <MagnifyingGlass
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search e.g. Oatmeal, Chicken, Rice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Food Results List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {loadingFoods ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                      <CircleNotch size={24} className="animate-spin text-emerald-600" />
                      <span className="text-xs">Loading database...</span>
                    </div>
                  ) : filteredFoods.length > 0 ? (
                    filteredFoods.map((food) => {
                      const isFav = favorites.some(
                        (f) =>
                          f.dish_name.toLowerCase() ===
                          food.dish_name.toLowerCase()
                      );
                      const cal = Math.round(food.calories_kcal || food.calories || 0);
                      const p = Math.round(food.protein_g || food.protein || 0);

                      return (
                        <div
                          key={food.id}
                          onClick={() => handleSelectFood(food)}
                          className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition group"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition truncate">
                                {food.dish_name}
                              </span>
                              {food.is_custom && (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  Custom
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {cal} kcal · {p}g protein
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleToggleFavorite(food, e)}
                              className="p-1.5 text-slate-300 hover:text-amber-500 transition"
                            >
                              <Star
                                size={16}
                                weight={isFav ? "fill" : "regular"}
                                className={isFav ? "text-amber-500" : ""}
                              />
                            </button>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              + Add
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <p className="text-sm">No food matching "{searchQuery}"</p>
                      <button
                        onClick={() => {
                          setQuickName(searchQuery);
                          setTab("quick");
                        }}
                        className="text-xs font-bold text-emerald-600 underline cursor-pointer"
                      >
                        Quick Add "{searchQuery}" instead →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Recents & Favorites */}
            {tab === "recents" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {favorites.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Star size={14} weight="fill" className="text-amber-500" />
                      <span>Favorites ({favorites.length})</span>
                    </h3>
                    <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-100">
                      {favorites.map((food) => (
                        <div
                          key={food.id}
                          onClick={() => handleSelectFood(food)}
                          className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
                        >
                          <div>
                            <span className="text-sm font-semibold text-slate-800">
                              {food.dish_name}
                            </span>
                            <span className="text-xs text-slate-400 block">
                              {Math.round(food.calories_kcal || food.calories || 0)} kcal
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            + Log
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <ClockCounterClockwise size={14} weight="bold" />
                    <span>Recently Logged</span>
                  </h3>
                  {recents.length > 0 ? (
                    <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-100">
                      {recents.map((food, i) => (
                        <div
                          key={`${food.id}_${i}`}
                          onClick={() => handleSelectFood(food)}
                          className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
                        >
                          <div>
                            <span className="text-sm font-semibold text-slate-800">
                              {food.dish_name}
                            </span>
                            <span className="text-xs text-slate-400 block">
                              {Math.round(food.calories_kcal || food.calories || 0)} kcal
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            + Log
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No recently logged foods yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Quick Calorie Add */}
            {tab === "quick" && (
              <form onSubmit={handleQuickAdd} className="p-5 space-y-4">
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
                  ⚡ <strong>Quick Add:</strong> Fast calorie entry when you already know the numbers or ate out.
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Meal Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Protein shake, Snack, Restaurant Meal"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Calories (kcal) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    placeholder="e.g. 450"
                    value={quickCalories}
                    onChange={(e) => setQuickCalories(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-blue-600 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={quickProtein}
                      onChange={(e) => setQuickProtein(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={quickCarbs}
                      onChange={(e) => setQuickCarbs(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-600 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={quickFat}
                      onChange={(e) => setQuickFat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!quickCalories}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Log {quickCalories ? `${quickCalories} kcal` : "Quick Calories"}
                </button>
              </form>
            )}

            {/* Tab 4: Create Custom Food */}
            {tab === "custom" && (
              <form onSubmit={handleCreateCustomFood} className="p-5 space-y-4 overflow-y-auto">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-800 leading-relaxed">
                  🥗 <strong>Custom Food:</strong> Save a recipe or specialty product to your library for easy reuse.
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Food Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Homemade Granola"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Calories / Unit *
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 240"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Serving Unit
                    </label>
                    <select
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none"
                    >
                      <option value="serving">Serving</option>
                      <option value="100g">100g</option>
                      <option value="bowl">Bowl</option>
                      <option value="piece">Piece</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-blue-600 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-600 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={customFat}
                      onChange={(e) => setCustomFat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!customName.trim() || !customCalories}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Save to My Foods & Log
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
