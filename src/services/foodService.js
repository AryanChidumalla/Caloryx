import { supabase } from "./supabaseClient";

export const getFoods = async () => {
  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .order("dish_name");
  if (error) throw error;
  return data || [];
};

// Local storage keys for rapid retrieval without needing backend schema changes
const RECENT_KEY = "caloryx_recent_foods";
const FAVORITES_KEY = "caloryx_favorite_foods";
const CUSTOM_KEY = "caloryx_custom_foods";

export const getRecentFoods = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveRecentFood = (food) => {
  try {
    const current = getRecentFoods();
    const filtered = current.filter(
      (item) => item.dish_name.toLowerCase() !== food.dish_name.toLowerCase()
    );
    const updated = [
      {
        id: food.id || food.food_id || `rec_${Date.now()}`,
        dish_name: food.dish_name,
        calories_kcal: food.calories || food.calories_kcal,
        protein_g: food.protein || food.protein_g || 0,
        carbs_g: food.carbs || food.carbs_g || 0,
        fats_g: food.fats || food.fats_g || 0,
        serving_unit: food.serving_unit || "serving",
      },
      ...filtered,
    ].slice(0, 15); // keep last 15
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not save recent food:", e);
  }
};

export const getFavoriteFoods = () => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleFavoriteFood = (food) => {
  try {
    const current = getFavoriteFoods();
    const exists = current.some(
      (item) => item.dish_name.toLowerCase() === food.dish_name.toLowerCase()
    );
    let updated;
    if (exists) {
      updated = current.filter(
        (item) => item.dish_name.toLowerCase() !== food.dish_name.toLowerCase()
      );
    } else {
      updated = [
        ...current,
        {
          id: food.id || food.food_id || `fav_${Date.now()}`,
          dish_name: food.dish_name,
          calories_kcal: food.calories_kcal || food.calories,
          protein_g: food.protein_g || food.protein || 0,
          carbs_g: food.carbs_g || food.carbs || 0,
          fats_g: food.fats_g || food.fats || 0,
          serving_unit: food.serving_unit || "serving",
        },
      ];
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const getCustomFoods = () => {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCustomFood = (food) => {
  try {
    const current = getCustomFoods();
    const newFood = {
      id: `custom_${Date.now()}`,
      dish_name: food.dish_name,
      calories_kcal: Number(food.calories_kcal),
      protein_g: Number(food.protein_g) || 0,
      carbs_g: Number(food.carbs_g) || 0,
      fats_g: Number(food.fats_g) || 0,
      serving_unit: food.serving_unit || "serving",
      is_custom: true,
    };
    const updated = [newFood, ...current];
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(updated));
    return newFood;
  } catch (e) {
    console.warn("Could not save custom food:", e);
    return null;
  }
};
