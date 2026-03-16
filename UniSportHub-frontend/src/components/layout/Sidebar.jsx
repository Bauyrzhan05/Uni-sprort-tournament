import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

/**
 * Sidebar navigation.
 * User info comes from decoded JWT: { id, email, username, role }
 */
const navItems = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", Icon: GridIcon }],
  },
  {
    label: "Management",
    items: [
      { to: "/tournaments", label: "Tournaments", Icon: TrophyIcon },
      { to: "/teams",       label: "Teams",       Icon: ShieldIcon },
      { to: "/players",     label: "Players",     Icon: UsersIcon  },
    ],
  },
];

function Sidebar({ collapsed, onToggle, onClose }) {
  const { user, logout } = useAuth();

  // Display: username (from register) or email prefix
  const displayName = user?.username || user?.email?.split("@")[0] || "User";
  const initials    = displayName.slice(0, 2).toUpperCase();
  const isAdmin     = user?.role === "ROLE_ADMIN";

  return (
    <aside style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "#1e293b", borderRight: "1px solid #334155",
      transition: "width 300ms", width: collapsed ? 64 : 240, flexShrink: 0,
      position: "relative",
    }}
      className="!w-60 md:!w-auto"
    >
      {/* Mobile close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="md:hidden absolute top-3 right-3 z-10 text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Close menu"
        >
          <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "20px 16px", borderBottom: "1px solid #334155",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: "0 0 16px rgba(14,165,233,0.4)",
        }}>
          <TrophyIcon small />
        </div>
        {!collapsed && (
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", letterSpacing: "0.1em", color: "white", lineHeight: 1 }}>
            UNISPORT<span style={{ color: "#38bdf8" }}>HUB</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "16px 8px" }}>
        {navItems.map((group) => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            {!collapsed && (
              <p style={{
                fontSize: "0.65rem", fontWeight: 600, color: "#475569",
                textTransform: "uppercase", letterSpacing: "0.1em",
                padding: "0 12px", marginBottom: 4,
              }}>
                {group.label}
              </p>
            )}
            <ul style={{ listStyle: "none" }}>
              {group.items.map(({ to, label, Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                    style={collapsed ? { justifyContent: "center" } : {}}
                    title={collapsed ? label : undefined}
                  >
                    <Icon />
                    {!collapsed && <span>{label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div style={{ borderTop: "1px solid #334155", padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#0369a1", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "0.75rem", fontWeight: 700,
            color: "white", flexShrink: 0,
          }}>
            {initials}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </p>
                <p style={{ fontSize: "0.7rem", color: isAdmin ? "#f97316" : "#64748b" }}>
                  {isAdmin ? "Admin" : "User"}
                </p>
              </div>
              <button onClick={logout} title="Logout"
                style={{ color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
                <LogoutIcon />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={onToggle}
        className="hidden md:flex"
        style={{
          position: "absolute", right: -12, top: 72,
          width: 24, height: 24, borderRadius: "50%",
          background: "#1e293b", border: "1px solid #334155",
          alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#64748b", zIndex: 10,
        }}
        onMouseEnter={e => e.currentTarget.style.color = "white"}
        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
      >
        <svg style={{ width: 12, height: 12, transform: collapsed ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms" }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────────────── */
function GridIcon() {
  return <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
}
function TrophyIcon({ small }) {
  return <svg style={{ width: small ? 16 : 20, height: small ? 16 : 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 21h8M12 17v4M5 3H3v4a4 4 0 004 4h1m6 0h1a4 4 0 004-4V3h-2M5 3h14M5 3a7 7 0 007 9 7 7 0 007-9" /></svg>;
}
function ShieldIcon() {
  return <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}
function UsersIcon() {
  return <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
}
function LogoutIcon() {
  return <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
}

export default Sidebar;
