import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ForkKnife, SignOut, SlidersHorizontal, User } from "@phosphor-icons/react";
import { supabase } from "../services/supabaseClient";
import { logout } from "../features/auth/authSlice";

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.profile);
  const user = useSelector((state) => state.auth.user);

  const username =
    profile?.username || user?.email?.split("@")[0] || "User";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(logout());
      navigate("/auth");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleEditGoals = () => {
    navigate("/userdetails");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="bg-emerald-600 group-hover:bg-emerald-700 text-white p-2 rounded-xl transition shadow-xs">
            <ForkKnife size={22} weight="bold" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            Caloryx
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Badge / Goal Settings */}
          <button
            onClick={handleEditGoals}
            title="Adjust Goals & Stats"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50 transition text-slate-700 text-xs font-semibold cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline">{username}</span>
            <SlidersHorizontal size={14} className="text-slate-400" />
          </button>

          {/* Log Out */}
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
          >
            <SignOut size={18} weight="bold" />
          </button>
        </div>
      </div>
    </header>
  );
}
