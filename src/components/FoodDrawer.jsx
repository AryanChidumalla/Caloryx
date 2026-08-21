import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  MagnifyingGlass,
  Star,
  ClockCounterClockwise,
  Plus,
  Lightning,
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
  calculateNutrition,
  searchFoods,
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

  // Selected Food State
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [servingOption, setServingOption] = useState("default"); // 'default' | '100g'
  const [customGrams, setCustomGrams] = useState("");

  // Quick Add Form State
  const [quickName, setQuickName] = useState("");
  const [quickCalories, setQuickCalories] = useState("");
  const [quickProtein, setQuickProtein] = useState("");
  const [quickCarbs, setQuickCarbs] = useState("");
  const [quickFat, setQuickFat] = useState("");

  // Custom Food Form State
  const [customName, setCustomName] = useState("");
  const [customHindiName, setCustomHindiName] = useState("");
  const [customUnit, setCustomUnit] = useState("serving");
  const [customWeightG, setCustomWeightG] = useState("100");
  const [customCalories100g, setCustomCalories100g] = useState("");
  const [customProtein100g, setCustomProtein100g] = useState("");
  const [customCarbs100g, setCustomCarbs100g] = useState("");
  const [customFat100g, setCustomFat100g] = useState("");
  const [customFiber100g, setCustomFiber100g] = useState("");

  // Load initial catalog and stored lists
  useEffect(() => {
    if (!isOpen) return;

    setFavorites(getFavoriteFoods());
    setRecents(getRecentFoods());
    setCustomFoods(getCustomFoods());

    // If editing an existing log
    if (editingItem) {
      const baseCal = (editingItem.calories || 0) / (editingItem.quantity || 1);
      const baseP = (editingItem.protein || 0) / (editingItem.quantity || 1);
      const baseC = (editingItem.carbs || 0) / (editingItem.quantity || 1);
      const baseF = (editingItem.fats || 0) / (editingItem.quantity || 1);

      setSelectedFood({
        id: editingItem.food_id || editingItem.id,
        name: editingItem.dish_name || editingItem.name,
        default_serving_unit: "serving",
        default_serving_weight_g: 100,
        calories_per_100g: baseCal,
        protein_per_100g: baseP,
        carbs_per_100g: baseC,
        fat_per_100g: baseF,
        fiber_per_100g: 0,
      });
      setQuantity(editingItem.quantity || 1);
      setServingOption("default");
      return;
    }

    // Reset drawer state for new entry
    setSelectedFood(null);
    setQuantity(1);
    setServingOption("default");
    setCustomGrams("");
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

  // Combined food list (custom + database)
  const allAvailableFoods = useMemo(() => {
    return [...customFoods, ...foods];
  }, [foods, customFoods]);

  // Search filtered foods using Unicode-safe matcher
  const filteredFoods = useMemo(() => {
    return searchFoods(allAvailableFoods, searchQuery);
  }, [allAvailableFoods, searchQuery]);

  // Dynamic scaled nutrition calculation
  const currentNutrition = useMemo(() => {
    if (!selectedFood) return null;
    return calculateNutrition(
      selectedFood,
      quantity,
      servingOption,
      customGrams
    );
  }, [selectedFood, quantity, servingOption, customGrams]);

  const handleToggleFav = (food, e) => {
    if (e) e.stopPropagation();
    const updated = toggleFavoriteFood(food);
    setFavorites(updated);
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setQuantity(1);
    setServingOption("default");
    setCustomGrams("");
  };

  // Submit standard food log
  const handleConfirmLog = () => {
    if (!selectedFood || !currentNutrition) return;

    const foodDisplayName = selectedFood.name || selectedFood.dish_name;

    if (editingItem && onUpdateFood) {
      onUpdateFood(editingItem.id, {
        quantity: parseFloat(quantity) || 1,
        calories: currentNutrition.calories,
        protein: currentNutrition.protein,
        carbs: currentNutrition.carbs,
        fats: currentNutrition.fat,
      });
      onClose();
      return;
    }

    const newLog = {
      food_id: selectedFood.id || null,
      dish_name: foodDisplayName,
      quantity: parseFloat(quantity) || 1,
      calories: currentNutrition.calories,
      protein: currentNutrition.protein,
      carbs: currentNutrition.carbs,
      fats: currentNutrition.fat,
      meal_type: mealType,
    };

    // Save full food object to recents
    saveRecentFood({
      ...selectedFood,
      name: foodDisplayName,
    });

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

    saveRecentFood({
      name: newLog.dish_name,
      calories_per_100g: newLog.calories,
      protein_per_100g: newLog.protein,
      carbs_per_100g: newLog.carbs,
      fat_per_100g: newLog.fats,
      default_serving_weight_g: 100,
    });

    onAddFood(mealType, newLog);
    onClose();
  };

  // Submit Create Custom Food
  const handleCreateCustomFood = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customCalories100g) return;

    const created = saveCustomFood({
      name: customName.trim(),
      hindi_name: customHindiName.trim(),
      default_serving_unit: customUnit.trim() || "serving",
      default_serving_weight_g: Number(customWeightG) || 100,
      calories_per_100g: parseFloat(customCalories100g) || 0,
      protein_per_100g: parseFloat(customProtein100g) || 0,
      carbs_per_100g: parseFloat(customCarbs100g) || 0,
      fat_per_100g: parseFloat(customFat100g) || 0,
      fiber_per_100g: parseFloat(customFiber100g) || 0,
    });

    if (created) {
      setCustomFoods(getCustomFoods());
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

      {/* Drawer Container */}
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

        {/* View Content: Food Configuration & Amount Selection */}
        {selectedFood ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {!editingItem && (
                <button
                  onClick={() => setSelectedFood(null)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  ← Pick a different food
                </button>
              )}

              {/* Selected Food Card */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {selectedFood.name || selectedFood.dish_name}
                    </h3>
                    {selectedFood.hindi_name && (
                      <div className="text-sm font-medium text-slate-600 mt-0.5">
                        {selectedFood.hindi_name}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      Reference: {Math.round(selectedFood.calories_per_100g || 0)} kcal / 100g
                      {selectedFood.default_serving_weight_g && (
                        <span> · Default: 1 {selectedFood.default_serving_unit || "serving"} ≈ {selectedFood.default_serving_weight_g}g</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleToggleFav(selectedFood, e)}
                    className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 transition cursor-pointer"
                  >
                    <Star
                      size={20}
                      weight={
                        favorites.some(
                          (f) =>
                            (f.name || f.dish_name || "").toLowerCase() ===
                            (selectedFood.name || selectedFood.dish_name || "").toLowerCase()
                        )
                          ? "fill"
                          : "regular"
                      }
                    />
                  </button>
                </div>
              </div>

              {/* Amount & Serving Unit Selector */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Serving & Amount
                </label>

                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.max(0.25, Number((Number(q) - 0.5).toFixed(2))))
                      }
                      className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Minus size={16} weight="bold" />
                    </button>

                    <input
                      type="number"
                      step="0.25"
                      min="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-16 text-center font-bold text-base text-slate-900 bg-transparent outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Number((Number(q) + 0.5).toFixed(2)))
                      }
                      className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Plus size={16} weight="bold" />
                    </button>
                  </div>

                  {/* Serving Unit Dropdown */}
                  <div className="flex-1">
                    <select
                      value={servingOption}
                      onChange={(e) => setServingOption(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="default">
                        1 {selectedFood.default_serving_unit || "serving"} (≈ {selectedFood.default_serving_weight_g || 100}g)
                      </option>
                      <option value="100g">100 Grams (100g)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Calculated Real-Time Nutrition Preview */}
              {currentNutrition && (
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                        Total Energy & Nutrition
                      </span>
                      <span className="text-xs text-emerald-700 font-medium">
                        Weight: ~{currentNutrition.weightGrams}g
                      </span>
                    </div>
                    <span className="text-2xl font-black text-emerald-900">
                      {currentNutrition.calories} <span className="text-xs font-normal text-emerald-700">kcal</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-100">
                      <span className="text-blue-600 font-semibold block text-[11px]">Protein</span>
                      <span className="font-extrabold text-sm text-slate-900">{currentNutrition.protein}g</span>
                    </div>
                    <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-100">
                      <span className="text-amber-600 font-semibold block text-[11px]">Carbs</span>
                      <span className="font-extrabold text-sm text-slate-900">{currentNutrition.carbs}g</span>
                    </div>
                    <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-100">
                      <span className="text-rose-600 font-semibold block text-[11px]">Fats</span>
                      <span className="font-extrabold text-sm text-slate-900">{currentNutrition.fat}g</span>
                    </div>
                  </div>

                  {currentNutrition.fiber > 0 && (
                    <div className="text-right text-[11px] font-medium text-emerald-700">
                      Fiber: {currentNutrition.fiber}g
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Log CTA */}
            <button
              onClick={handleConfirmLog}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white py-3.5 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Check size={18} weight="bold" />
              <span>
                {editingItem
                  ? "Update Food Log"
                  : `Log to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} (${currentNutrition?.calories} kcal)`}
              </span>
            </button>
          </div>
        ) : (
          /* Main Drawer Tabs & Lists */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs Bar */}
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
                    placeholder="Search e.g. Dal, Roti, Rice, पनीर..."
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
                      const foodName = food.name || food.dish_name || "";
                      const isFav = favorites.some(
                        (f) =>
                          (f.name || f.dish_name || "").toLowerCase() ===
                          foodName.toLowerCase()
                      );

                      // Calculate 1 default serving nutrition
                      const servingNut = calculateNutrition(food, 1, "default");

                      return (
                        <div
                          key={food.id}
                          onClick={() => handleSelectFood(food)}
                          className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition group"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition">
                                {foodName}
                              </span>
                              {food.hindi_name && (
                                <span className="text-xs text-slate-400 font-medium">
                                  ({food.hindi_name})
                                </span>
                              )}
                              {food.is_custom && (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  Custom
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {servingNut.calories} kcal · per {food.default_serving_unit || "serving"} ({servingNut.defaultWeightG}g) · {servingNut.protein}g P · {servingNut.carbs}g C · {servingNut.fat}g F
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => handleToggleFav(food, e)}
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
                      {favorites.map((food) => {
                        const servingNut = calculateNutrition(food, 1, "default");
                        return (
                          <div
                            key={food.id}
                            onClick={() => handleSelectFood(food)}
                            className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
                          >
                            <div>
                              <span className="text-sm font-semibold text-slate-800">
                                {food.name || food.dish_name}
                              </span>
                              {food.hindi_name && (
                                <span className="text-xs text-slate-400 ml-1.5">
                                  ({food.hindi_name})
                                </span>
                              )}
                              <span className="text-xs text-slate-400 block mt-0.5">
                                {servingNut.calories} kcal · 1 {food.default_serving_unit || "serving"}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              + Log
                            </span>
                          </div>
                        );
                      })}
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
                      {recents.map((food, i) => {
                        const servingNut = calculateNutrition(food, 1, "default");
                        return (
                          <div
                            key={`${food.id}_${i}`}
                            onClick={() => handleSelectFood(food)}
                            className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
                          >
                            <div>
                              <span className="text-sm font-semibold text-slate-800">
                                {food.name || food.dish_name}
                              </span>
                              {food.hindi_name && (
                                <span className="text-xs text-slate-400 ml-1.5">
                                  ({food.hindi_name})
                                </span>
                              )}
                              <span className="text-xs text-slate-400 block mt-0.5">
                                {servingNut.calories} kcal · 1 {food.default_serving_unit || "serving"}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              + Log
                            </span>
                          </div>
                        );
                      })}
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
                  🥗 <strong>Custom Food:</strong> Save a recipe or specialty product to your library per 100g reference.
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Food Name (English / Hindi) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Homemade Poha"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Regional / Hindi Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. पोहा"
                    value={customHindiName}
                    onChange={(e) => setCustomHindiName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Default Serving Unit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. katori, cup, plate, piece"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Serving Weight (g)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 150"
                      value={customWeightG}
                      onChange={(e) => setCustomWeightG(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Calories per 100g *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 160"
                    value={customCalories100g}
                    onChange={(e) => setCustomCalories100g(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-blue-600 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={customProtein100g}
                      onChange={(e) => setCustomProtein100g(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-sm text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-600 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={customCarbs100g}
                      onChange={(e) => setCustomCarbs100g(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-sm text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-600 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={customFat100g}
                      onChange={(e) => setCustomFat100g(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-sm text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-600 mb-1">
                      Fiber (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0"
                      value={customFiber100g}
                      onChange={(e) => setCustomFiber100g(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-sm text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!customName.trim() || !customCalories100g}
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
