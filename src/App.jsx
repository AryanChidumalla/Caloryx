import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import UserDetails from "./pages/UserDetails";
import Dashboard from "./pages/DashboardPage";
import Header from "./components/Header";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initAuthListener } from "./features/auth/initAuthListener";
import { CircleNotch } from "@phosphor-icons/react";

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isProfileComplete, loading } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    const subscription = initAuthListener(dispatch);
    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [dispatch]);

  // Loading state during auth & profile initialization
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-500">
        <CircleNotch size={32} className="animate-spin text-emerald-600" />
        <span className="text-sm font-medium">Loading Caloryx...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Page: Only for logged-out users */}
        <Route
          path="/auth"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />
          }
        />

        {/* User Details & Goal Settings: Must be logged in */}
        <Route
          path="/userdetails"
          element={
            !isAuthenticated ? (
              <Navigate to="/auth" replace />
            ) : (
              <>
                {isProfileComplete && <Header />}
                <UserDetails />
              </>
            )
          }
        />

        {/* Dashboard: Must be logged in AND profile complete */}
        <Route
          path="/dashboard"
          element={
            !isAuthenticated ? (
              <Navigate to="/auth" replace />
            ) : !isProfileComplete ? (
              <Navigate to="/userdetails" replace />
            ) : (
              <>
                <Header />
                <Dashboard />
              </>
            )
          }
        />

        {/* Catch All: Redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
