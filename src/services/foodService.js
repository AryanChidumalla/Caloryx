import { supabase } from "./supabaseClient";

/**
 * Fetch all canonical foods from Supabase ordered by name
 */
export const getFoods = async () => {
  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .order("name");

  if (error) throw error;
  return data || [];
};

/**
 * Calculates nutrition for a given food, quantity, and serving selection.
 * Formula:
 *   nutrition_for_serving = (nutrition_per_100g * default_serving_weight_g / 100) * quantity
 */
export const calculateNutrition = (
  food,
  quantity = 1,
  servingOption = "default",
  customGrams = null
) => {
  if (!food) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      weightGrams: 0,
    };
  }

  const q = Math.max(0.01, parseFloat(quantity) || 1);

  // Standardized per 100g reference values
  const calPer100 = Number(food.calories_per_100g || 0);
  const pPer100 = Number(food.protein_per_100g || 0);
  const cPer100 = Number(food.carbs_per_100g || 0);
  const fPer100 = Number(food.fat_per_100g || 0);
  const fibPer100 = Number(food.fiber_per_100g || 0);

  // Default serving weight in grams (fallback to 100g if missing)
  const defaultWeight =
    Number(food.default_serving_weight_g) > 0
      ? Number(food.default_serving_weight_g)
      : 100;

  let totalWeightGrams = defaultWeight * q;

  if (servingOption === "100g") {
    totalWeightGrams = 100 * q;
  } else if (servingOption === "custom_g" && customGrams) {
    totalWeightGrams = Number(customGrams) * q;
  }

  const ratio = totalWeightGrams / 100;

  return {
    calories: Math.round(calPer100 * ratio),
    protein: Math.round(pPer100 * ratio * 10) / 10,
    carbs: Math.round(cPer100 * ratio * 10) / 10,
    fat: Math.round(fPer100 * ratio * 10) / 10,
    fiber: Math.round(fibPer100 * ratio * 10) / 10,
    weightGrams: Math.round(totalWeightGrams),
    defaultUnit: food.default_serving_unit || "serving",
    defaultWeightG: defaultWeight,
  };
};

/**
 * Unicode-safe search matching name, hindi_name, aliases, and categories.
 */
export const searchFoods = (foodsList, query) => {
  if (!query || !query.trim()) return foodsList.slice(0, 30);
  const q = query.toLowerCase().trim();

  return foodsList
    .filter((food) => {
      // 1. Primary English / Romanized name
      const name = (food.name || "").toLowerCase();
      if (name.includes(q)) return true;

      // 2. Hindi Unicode Name
      if (
        food.hindi_name &&
        String(food.hindi_name).toLowerCase().includes(q)
      ) {
        return true;
      }

      // 3. Aliases (Array or comma-separated string)
      if (food.aliases) {
        if (Array.isArray(food.aliases)) {
          if (
            food.aliases.some((alias) =>
              String(alias).toLowerCase().includes(q)
            )
          ) {
            return true;
          }
        } else if (typeof food.aliases === "string") {
          if (food.aliases.toLowerCase().includes(q)) {
            return true;
          }
        }
      }

      // 4. Category & Subcategory
      if (food.category && food.category.toLowerCase().includes(q)) return true;
      if (food.sub_category && food.sub_category.toLowerCase().includes(q)) {
        return true;
      }

      return false;
    })
    .slice(0, 50);
};

// Local storage keys
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
    const foodName = (food.name || food.dish_name || "").toLowerCase();
    const filtered = current.filter(
      (item) => (item.name || item.dish_name || "").toLowerCase() !== foodName
    );

    const updated = [
      {
        id: food.id || food.food_id || `rec_${Date.now()}`,
        name: food.name || food.dish_name,
        hindi_name: food.hindi_name || "",
        aliases: food.aliases || [],
        category: food.category || "",
        default_serving_unit:
          food.default_serving_unit || food.serving_unit || "serving",
        default_serving_weight_g:
          Number(food.default_serving_weight_g) || 100,
        calories_per_100g: Number(food.calories_per_100g) || 0,
        protein_per_100g: Number(food.protein_per_100g) || 0,
        carbs_per_100g: Number(food.carbs_per_100g) || 0,
        fat_per_100g: Number(food.fat_per_100g) || 0,
        fiber_per_100g: Number(food.fiber_per_100g) || 0,
        verification_status: food.verification_status || "",
        data_source: food.data_source || "",
      },
      ...filtered,
    ].slice(0, 15);

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
    const foodName = (food.name || food.dish_name || "").toLowerCase();
    const exists = current.some(
      (item) => (item.name || item.dish_name || "").toLowerCase() === foodName
    );

    let updated;
    if (exists) {
      updated = current.filter(
        (item) => (item.name || item.dish_name || "").toLowerCase() !== foodName
      );
    } else {
      updated = [
        ...current,
        {
          id: food.id || food.food_id || `fav_${Date.now()}`,
          name: food.name || food.dish_name,
          hindi_name: food.hindi_name || "",
          aliases: food.aliases || [],
          category: food.category || "",
          default_serving_unit:
            food.default_serving_unit || food.serving_unit || "serving",
          default_serving_weight_g:
            Number(food.default_serving_weight_g) || 100,
          calories_per_100g: Number(food.calories_per_100g) || 0,
          protein_per_100g: Number(food.protein_per_100g) || 0,
          carbs_per_100g: Number(food.carbs_per_100g) || 0,
          fat_per_100g: Number(food.fat_per_100g) || 0,
          fiber_per_100g: Number(food.fiber_per_100g) || 0,
          verification_status: food.verification_status || "",
          data_source: food.data_source || "",
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
    const servingWeight = Number(food.default_serving_weight_g) || 100;

    // If user provided values per serving, convert to per 100g
    const calPer100 =
      food.calories_per_100g !== undefined
        ? Number(food.calories_per_100g)
        : Math.round((Number(food.calories_per_serving || 0) * 100) / servingWeight);

    const pPer100 =
      food.protein_per_100g !== undefined
        ? Number(food.protein_per_100g)
        : Math.round(((Number(food.protein_per_serving || 0) * 100) / servingWeight) * 10) / 10;

    const cPer100 =
      food.carbs_per_100g !== undefined
        ? Number(food.carbs_per_100g)
        : Math.round(((Number(food.carbs_per_serving || 0) * 100) / servingWeight) * 10) / 10;

    const fPer100 =
      food.fat_per_100g !== undefined
        ? Number(food.fat_per_100g)
        : Math.round(((Number(food.fat_per_serving || 0) * 100) / servingWeight) * 10) / 10;

    const fibPer100 =
      food.fiber_per_100g !== undefined
        ? Number(food.fiber_per_100g)
        : Math.round(((Number(food.fiber_per_serving || 0) * 100) / servingWeight) * 10) / 10;

    const newFood = {
      id: `custom_${Date.now()}`,
      name: food.name,
      hindi_name: food.hindi_name || "",
      aliases: food.aliases || [],
      category: "Custom",
      sub_category: "",
      serving_basis: "per 100g",
      default_serving_unit: food.default_serving_unit || "serving",
      default_serving_weight_g: servingWeight,
      calories_per_100g: calPer100,
      protein_per_100g: pPer100,
      carbs_per_100g: cPer100,
      fat_per_100g: fPer100,
      fiber_per_100g: fibPer100,
      verification_status: "custom",
      data_source: "User Defined",
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
