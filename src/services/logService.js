import { supabase } from "./supabaseClient";

export const fetchLogsByDate = async (userId, dateKey) => {
  if (!userId || !dateKey) return [];

  const { data, error } = await supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("logged_at", dateKey)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const insertFoodLogs = async (logs) => {
  if (!logs || logs.length === 0) return [];

  const { data, error } = await supabase
    .from("food_logs")
    .insert(logs)
    .select();

  if (error) throw error;
  return data || [];
};

export const updateFoodLog = async (logId, updates) => {
  if (!logId) throw new Error("Log ID required");

  const { data, error } = await supabase
    .from("food_logs")
    .update(updates)
    .eq("id", logId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteFoodLog = async (logId) => {
  if (!logId) throw new Error("Log ID required");

  const { error } = await supabase
    .from("food_logs")
    .delete()
    .eq("id", logId);

  if (error) throw error;
  return true;
};
