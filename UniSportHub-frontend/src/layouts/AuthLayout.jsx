import { Outlet } from "react-router-dom";

/**
 * AuthLayout wraps Login / Register pages.
 * Full-viewport centred layout with an atmospheric background.
 */
function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-DEFAULT relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-brand-900/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#334155 1px,transparent 1px),linear-gradient(90deg,#334155 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md px-4 animate-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4"
            style={{ boxShadow: "0 0 24px rgba(14,165,233,0.3)" }}>
            <svg className="w-7 h-7 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M8 21h8M12 17v4M5 3H3v4a4 4 0 004 4h1m6 0h1a4 4 0 004-4V3h-2M5 3h14M5 3a7 7 0 007 9 7 7 0 007-9" />
            </svg>
          </div>
          <h1 className="font-display text-4xl tracking-wider text-white">
            UNISPORT<span className="text-brand-400">HUB</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">University Sports Tournament Management</p>
        </div>

        {/* Page-specific content injected here */}
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
