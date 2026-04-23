import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getTournaments } from "../../api/tournamentService";
import { getTeams }       from "../../api/teamService";
import { getPlayers }     from "../../api/playerService";
import Loader from "../../components/common/Loader";
import { formatDate, formatPrize, getImageUrl } from "../../utils/helpers";
import useAuth from "../../hooks/useAuth";

/* ── Stat card ──────────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, accentClass, loading }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>{label}</p>
          {loading
            ? <div className="skeleton w-16 h-8 mt-2" style={{ height: 32, width: 64 }} />
            : <p className={`text-4xl mt-1 ${accentClass || "text-white"}`}
                 style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em" }}>
                {value ?? "—"}
              </p>
          }
        </div>
        <div className="p-3 rounded-xl" style={{ background: "rgba(14,165,233,0.1)" }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ── MetaItem helper ─────────────────────────────────────────────────────────── */
function MetaItem({ icon, children, accent }) {
  const paths = {
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    users:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m9.288 0a5.002 5.002 0 00-9.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
    prize:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    pin:      <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>,
  };
  return (
    <span className="flex items-center gap-1" style={{
      fontSize: 11,
      color: accent ? "#f97316" : "#64748b",
      fontWeight: accent ? 500 : 400,
    }}>
      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor"
        style={{ opacity: 0.6, flexShrink: 0 }}>
        {paths[icon]}
      </svg>
      {children}
    </span>
  );
}

/* ── Tournament card ─────────────────────────────────────────────────────────── */
function TournamentCard({ t }) {
  const imgSrc = getImageUrl(t.imageUrl);

  const sportColors = {
    Football:   { from: "#0C447C", to: "#042C53", badge: { bg: "#185FA5", text: "#B5D4F4" } },
    Basketball: { from: "#854F0B", to: "#412402", badge: { bg: "#3B6D11", text: "#C0DD97" } },
    Volleyball: { from: "#533AB7", to: "#26215C", badge: { bg: "#533AB7", text: "#CECBF6" } },
    Tennis:     { from: "#3B6D11", to: "#173404", badge: { bg: "#3B6D11", text: "#C0DD97" } },
    default:    { from: "#0f172a", to: "#1e293b",  badge: { bg: "#185FA5", text: "#B5D4F4" } },
  };
  const colors = sportColors[t.sport] || sportColors.default;

  return (
    <div
      className="flex flex-col overflow-hidden transition-all duration-200"
      style={{
        background: "#1e293b",
        border: "0.5px solid #334155",
        borderRadius: 12,
        cursor: "pointer",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#0ea5e9"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
    >
      {/* ── Image / Placeholder ── */}
      <div className="relative overflow-hidden" style={{ height: 120 }}>
        {imgSrc ? (
          <img src={imgSrc} alt={t.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` }}>
            <TrophyIcon />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 100%)"
        }} />

        {/* Sport badge */}
        {t.sport && (
          <span className="absolute text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ top: 10, left: 10, background: colors.badge.bg, color: colors.badge.text }}>
            {t.sport}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-1.5 flex-1" style={{ padding: "14px 16px" }}>
        <Link to={`/tournaments/${t.id}`}>
          <p className="font-medium text-white hover:text-brand-400 transition-colors"
            style={{ fontSize: 14, lineHeight: 1.3 }}>
            {t.name}
          </p>
        </Link>

        {t.description && (
          <p style={{
            fontSize: 12, color: "#64748b", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {t.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          <MetaItem icon="calendar">
            {formatDate(t.startDate)} – {formatDate(t.endDate)}
          </MetaItem>
          <MetaItem icon="users">Max {t.maxTeams}</MetaItem>
          {t.prize > 0 && (
            <MetaItem icon="prize" accent>{formatPrize(t.prize)}</MetaItem>
          )}
          {t.location && (
            <MetaItem icon="pin">{t.location}</MetaItem>
          )}
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex" style={{ borderTop: "0.5px solid #334155" }}>
        {[
          { label: "View", to: `/tournaments/${t.id}` },
          { label: "Edit", to: `/tournaments/${t.id}/edit` },
        ].map((btn, i) => (
          <Link
            key={btn.label}
            to={btn.to}
            className="flex-1 text-center py-2.5 text-xs font-medium transition-colors"
            style={{
              color: "#64748b",
              borderLeft: i > 0 ? "0.5px solid #334155" : "none",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#253348"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
          >
            {btn.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard page ─────────────────────────────────────────────────────────── */
function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";

  const { data: tournaments, loading: tLoading } = useFetch(getTournaments);
  const { data: teams,       loading: teLoading } = useFetch(getTeams);
  const { data: players,     loading: pLoading  } = useFetch(getPlayers);

  const tournamentList = Array.isArray(tournaments) ? tournaments : [];
  const teamList       = Array.isArray(teams)       ? teams       : [];
  const playerList     = Array.isArray(players)     ? players     : [];

  const recentTournaments = [...tournamentList].reverse().slice(0, 4);

  return (
    <div className="space-y-8 animate-in">
      {/* Welcome banner */}
      <div
        className="rounded-xl p-6 flex items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg, #0c4a6e 0%, #1e293b 100%)",
          border: "1px solid #334155",
          boxShadow: "0 0 40px rgba(14,165,233,0.1)",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", letterSpacing: "0.05em", color: "white" }}>
            Welcome back, <span style={{ color: "#38bdf8" }}>{user?.username || "Admin"}</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginTop: 4 }}>
            Manage tournaments, teams and players from one place.
          </p>
        </div>
        <Link to="/tournaments/new" className="btn-primary" style={{ flexShrink: 0 }}>
          <PlusIcon /> New Tournament
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Tournaments"  value={tournamentList.length} loading={tLoading}  icon={<TrophyIcon />} />
        <StatCard label="Teams"        value={teamList.length}       loading={teLoading} icon={<ShieldIcon />} />
        <StatCard label="Players"      value={playerList.length}     loading={pLoading}  icon={<UsersIcon />}  accentClass="text-accent" />
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/tournaments/new" className="btn-primary"><PlusIcon /> New Tournament</Link>
          <Link to="/teams"           className="btn-ghost"><ShieldIcon sm /> Manage Teams</Link>
          {isAdmin && <Link to="/players/new" className="btn-ghost"><UsersIcon sm /> Add Player</Link>}
        </div>
      </div>

      {/* Recent tournaments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Recent Tournaments</h2>
          <Link to="/tournaments" style={{ fontSize: "0.875rem", color: "#38bdf8" }} className="hover:text-brand-300 transition-colors">
            View all →
          </Link>
        </div>

        {tLoading ? (
          <Loader text="Loading tournaments…" />
        ) : recentTournaments.length === 0 ? (
          <div className="card text-center py-10">
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No tournaments yet.</p>
            <Link to="/tournaments/new" className="btn-primary mt-4 inline-flex"><PlusIcon /> Create First Tournament</Link>
          </div>
        ) : (
          // ✅ grid-та cards қолданылады
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentTournaments.map((t) => <TournamentCard key={t.id} t={t} />)}
          </div>
        )}
      </div>

      {/* Teams overview */}
      {teamList.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Teams Overview</h2>
            <Link to="/teams" style={{ fontSize: "0.875rem", color: "#38bdf8" }} className="hover:text-brand-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #334155", background: "rgba(15,23,42,0.5)" }}>
                  <th className="table-header text-left">Team</th>
                  <th className="table-header text-left hidden sm:table-cell">Tournament</th>
                  <th className="table-header text-left hidden md:table-cell">Players</th>
                </tr>
              </thead>
              <tbody>
                {teamList.slice(0, 5).map((team) => (
                  <tr key={team.id} style={{ borderBottom: "1px solid #1e293b" }}
                    className="hover:bg-surface-hover/40 transition-colors">
                    <td className="table-cell">
                      <Link to={`/teams/${team.id}`} className="font-medium text-white hover:text-brand-400 transition-colors">
                        {team.teamName}
                      </Link>
                    </td>
                    <td className="table-cell hidden sm:table-cell" style={{ color: "#94a3b8" }}>
                      {team.tournamentId ? `Tournament #${team.tournamentId}` : "—"}
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span style={{
                        background: "rgba(14,165,233,0.1)", color: "#7dd3fc",
                        border: "1px solid rgba(14,165,233,0.2)",
                        padding: "2px 10px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 600,
                      }}>
                        {team.memberCount ?? team.memberIds?.length ?? 0} members
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────────────── */
const ic = "w-5 h-5";
const TrophyIcon = ({ sm }) => (
  <svg className={sm ? "w-4 h-4" : ic} style={{ color: "#38bdf8" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M8 21h8M12 17v4M5 3H3v4a4 4 0 004 4h1m6 0h1a4 4 0 004-4V3h-2M5 3h14M5 3a7 7 0 007 9 7 7 0 007-9" />
  </svg>
);
const ShieldIcon = ({ sm }) => (
  <svg className={sm ? "w-4 h-4" : ic} style={{ color: "#38bdf8" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const UsersIcon = ({ sm }) => (
  <svg className={sm ? "w-4 h-4" : ic} style={{ color: "#f97316" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default Dashboard;
