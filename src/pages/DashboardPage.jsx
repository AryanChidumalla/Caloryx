import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import DateScroller from "../components/DateScroller";
import CalorieGauge from "../components/CalorieGauge";
import MacroBar from "../components/MacroBar";
import MealCard from "../components/MealCard";
import FoodDrawer from "../components/FoodDrawer";
import {
  fetchLogsByDate,
  insertFoodLogs,
  updateFoodLog,
  deleteFoodLog,
} from "../services/logService";
import { CircleNotch } from "@phosphor-icons/react";

export default function DashboardPage() {
  const profile = useSelector((state) => state.auth.profile);
  const user = useSelector((state) => state.auth.user);
  const userId = profile?.id || user?.id;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [mealsByDate, setMealsByDate] = useState({});
  const [totalsByDate, setTotalsByDate] = useState({});

  // Drawer / Logging state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState("breakfast");
  const [editingItem, setEditingItem] = useState(null);

  // Format date key as local YYYY-MM-DD
  const dateKey = selectedDate.toLocaleDateString("en-CA");
  const calorieTarget = profile?.target_calorie || 2000;

  const meals = mealsByDate[dateKey] || {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  };

  const totals = totalsByDate[dateKey] || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  // Load meals from Supabase for active date
  const loadMeals = useCallback(async () => {
    if (!userId) return;
    setLoadingLogs(true);

    try {
      const data = await fetchLogsByDate(userId, dateKey);

      // Organize meals into categories
      const organized = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      };

      let sumCal = 0;
      let sumP = 0;
      let sumC = 0;
      let sumF = 0;

      data.forEach((item) => {
        const type = item.meal_type || "breakfast";
        if (!organized[type]) organized[type] = [];
        organized[type].push(item);

        sumCal += Number(item.calories) || 0;
        sumP += Number(item.protein) || 0;
        sumC += Number(item.carbs) || 0;
        sumF += Number(item.fats) || 0;
      });

      setMealsByDate((prev) => ({ ...prev, [dateKey]: organized }));
      setTotalsByDate((prev) => ({
        ...prev,
        [dateKey]: {
          calories: sumCal,
          protein: sumP,
          carbs: sumC,
          fat: sumF,
        },
      }));
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [userId, dateKey]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  // Open Drawer to Add Food
  const handleOpenAddFood = (mealType) => {
    setActiveMealType(mealType);
    setEditingItem(null);
    setIsDrawerOpen(true);
  };

  // Open Drawer to Edit Existing Food
  const handleOpenEditFood = (foodItem) => {
    setActiveMealType(foodItem.meal_type || "breakfast");
    setEditingItem(foodItem);
    setIsDrawerOpen(true);
  };

  // Add new food log
  const handleAddFood = async (mealType, foodEntry) => {
    if (!userId) return;

    try {
      const logPayload = {
        user_id: userId,
        food_id: foodEntry.food_id || null,
        meal_type: mealType,
        dish_name: foodEntry.dish_name,
        calories: foodEntry.calories,
        protein: foodEntry.protein,
        carbs: foodEntry.carbs,
        fats: foodEntry.fats,
        quantity: foodEntry.quantity || 1,
        logged_at: dateKey,
      };

      const inserted = await insertFoodLogs([logPayload]);
      if (inserted && inserted.length > 0) {
        // Optimistic UI update
        loadMeals();
      }
    } catch (err) {
      console.error("Could not save food:", err);
      alert("Error saving food: " + (err.message || "Unknown error"));
    }
  };

  // Update existing food log
  const handleUpdateFood = async (logId, updates) => {
    try {
      await updateFoodLog(logId, updates);
      loadMeals();
    } catch (err) {
      console.error("Could not update food:", err);
      alert("Error updating food: " + (err.message || "Unknown error"));
    }
  };

  // Delete food entry
  const handleDeleteFood = async (logId) => {
    try {
      await deleteFoodLog(logId);
      loadMeals();
    } catch (err) {
      console.error("Could not delete food:", err);
      alert("Error deleting food: " + (err.message || "Unknown error"));
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Date Selector Ribbon */}
        <DateScroller
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        {/* Primary Calorie Progress Centerpiece */}
        <CalorieGauge
          consumed={totals.calories}
          target={calorieTarget}
        />

        {/* Secondary Macro Target Breakdown */}
        <MacroBar
          protein={totals.protein}
          carbs={totals.carbs}
          fat={totals.fat}
          calorieTarget={calorieTarget}
        />

        {/* Meals Heading */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Daily Meals
          </h2>
          {loadingLogs && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CircleNotch size={14} className="animate-spin text-emerald-600" />
              <span>Updating...</span>
            </div>
          )}
        </div>

        {/* Meal Cards Section */}
        <div className="space-y-4">
          <MealCard
            mealType="breakfast"
            items={meals.breakfast}
            onAddFood={handleOpenAddFood}
            onEditFood={handleOpenEditFood}
            onDeleteFood={handleDeleteFood}
          />

          <MealCard
            mealType="lunch"
            items={meals.lunch}
            onAddFood={handleOpenAddFood}
            onEditFood={handleOpenEditFood}
            onDeleteFood={handleDeleteFood}
          />

          <MealCard
            mealType="dinner"
            items={meals.dinner}
            onAddFood={handleOpenAddFood}
            onEditFood={handleOpenEditFood}
            onDeleteFood={handleDeleteFood}
          />

          <MealCard
            mealType="snacks"
            items={meals.snacks}
            onAddFood={handleOpenAddFood}
            onEditFood={handleOpenEditFood}
            onDeleteFood={handleDeleteFood}
          />
        </div>
      </div>

      {/* Fast Food Logging Drawer */}
      <FoodDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingItem(null);
        }}
        mealType={activeMealType}
        editingItem={editingItem}
        onAddFood={handleAddFood}
        onUpdateFood={handleUpdateFood}
      />
    </main>
  );
}
