import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isProfileComplete: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setProfileData(state, action) {
      state.profile = action.payload;
      state.isProfileComplete = !!action.payload?.target_calorie;
    },
    logout(state) {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.isProfileComplete = false;
      state.loading = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setProfileComplete(state, action) {
      state.isProfileComplete = action.payload;
    },
  },
});

export const {
  setUser,
  setProfileData,
  logout,
  setLoading,
  setProfileComplete,
} = authSlice.actions;

export default authSlice.reducer;
