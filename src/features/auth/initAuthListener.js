import { supabase } from "../../services/supabaseClient";
import {
  setUser,
  logout,
  setProfileComplete,
  setLoading,
  setProfileData,
} from "./authSlice";

export const initAuthListener = (dispatch) => {
  dispatch(setLoading(true));

  // Function to handle the profile check logic
  const handleAuthAction = async (session) => {
    const currentUser = session?.user ?? null;

    if (!currentUser) {
      dispatch(logout());
      dispatch(setLoading(false));
      return;
    }

    dispatch(setUser(currentUser));

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      dispatch(setProfileComplete(!!data?.target_calorie));

      if (data) {
        dispatch(setProfileData(data)); // Now the stats are in Redux!
      }
    } catch (err) {
      console.error("Profile check error:", err);
    } finally {
      // THIS MUST FIRE NO MATTER WHAT
      dispatch(setLoading(false));
    }
  };

  // 1. Check existing session immediately (for refresh)
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      handleAuthAction(session);
    } else {
      // If no session, stop loading so user can see AuthPage
      dispatch(setLoading(false));
    }
  });

  // 2. Listen for future changes (login/logout)
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    handleAuthAction(session);
  });

  return subscription;
};
