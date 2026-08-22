import { supabase } from "../../services/supabaseClient";
import {
  setUser,
  logout,
  setLoading,
  setProfileComplete,
  setProfileData,
} from "./authSlice";

export const initAuthListener = (dispatch) => {
  let active = true;
  let initialized = false;

  const handleAuthAction = async (session) => {
    if (!active) return;

    dispatch(setLoading(true));

    const currentUser = session?.user ?? null;

    if (!currentUser) {
      if (!active) return;

      dispatch(logout());
      return;
    }

    dispatch(setUser(currentUser));

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Profile fetch error:", error);
        dispatch(setProfileComplete(false));
        return;
      }

      console.log("PROFILE FROM SUPABASE:", data);
      console.log("TARGET CALORIE:", data?.target_calorie);
      console.log("PROFILE COMPLETE:", !!data?.target_calorie);

      if (data) {
        // setProfileData already updates isProfileComplete
        dispatch(setProfileData(data));
      } else {
        dispatch(setProfileComplete(false));
      }
    } catch (err) {
      if (!active) return;

      console.error("Profile check error:", err);
      dispatch(setProfileComplete(false));
    } finally {
      if (active) {
        dispatch(setLoading(false));
      }
    }
  };

  // Initial session check
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!active) return;

    initialized = true;
    handleAuthAction(session);
  });

  // Future login/logout changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!active) return;

    // Don't duplicate the initial getSession() check
    if (!initialized) return;

    handleAuthAction(session);
  });

  return {
    unsubscribe: () => {
      active = false;
      subscription.unsubscribe();
    },
  };
};
