import { supabase } from "./supabaseClient";

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const upsertUserProfile = async (profileData) => {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profileData, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data;
};
