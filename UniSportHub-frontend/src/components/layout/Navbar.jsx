import { useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

/** Maps route prefixes to human-readable titles */
const routeTitles = {
  "/dashboard":   "Dashboard",
  "/tournaments": "Tournaments",
  "/teams":       "Teams",
  "/players":     "Players",
};

function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const title = Object.entries(routeTitles).find(([key]) => pathname.startsWith(key))?.[1] || "UniSportHub";

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-surface-border bg-surface-card/60 backdrop-blur-md sticky top-0 z-30">
      {/* Left – menu toggle (mobile) + page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-display text-xl sm:text-2xl tracking-wider text-white">{title}</span>
      </div>

      {/* Right – user chip */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-DEFAULT border border-surface-border">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
          <span className="text-xs text-slate-300">{user?.name || user?.username || "Admin"}</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
