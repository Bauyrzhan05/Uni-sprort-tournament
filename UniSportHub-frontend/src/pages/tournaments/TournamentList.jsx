import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getTournaments, deleteTournament } from "../../api/tournamentService";
import Button        from "../../components/common/Button";
import Loader        from "../../components/common/Loader";
import EmptyState    from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatDate, formatPrize, getImageUrl, extractError } from "../../utils/helpers";
import useAuth from "../../hooks/useAuth";

/**
 * TournamentList
 * Backend: GET /api/tournaments → List<TournamentDto>
 * TournamentDto: { id, name, sport, imageUrl, maxTeams, startDate, endDate,
 *                  location, description, prize, createAt }
 * NOTE: no status field in backend entity → removed status badge
 * NOTE: only ROLE_ADMIN can create (POST); all authenticated can read/delete
 */
function TournamentList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";

  const [search, setSearch]   = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState("");

  const { data, loading, error, refetch } = useFetch(getTournaments);

  // Plain array — no pagination from backend
  const allTournaments = Array.isArray(data) ? data : [];

  // Client-side search filter (backend has no search param)
  const tournaments = search.trim()
    ? allTournaments.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.sport || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.location || "").toLowerCase().includes(search.toLowerCase())
      )
    : allTournaments;

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteTournament(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(extractError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Tournaments</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
            {allTournaments.length} tournament{allTournaments.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        {isAdmin && (
          <Link to="/tournaments/new">
            <Button><PlusIcon /> New Tournament</Button>
          </Link>
        )}
      </div>

      {/* Search (client-side) */}
      <input
        className="input-field sm:w-80"
        placeholder="Search by name, sport, location…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Role note for non-admins */}
      {!isAdmin && (
        <div className="px-4 py-2 rounded-lg text-xs"
          style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", color: "#7dd3fc" }}>
          ℹ️ Only administrators can create tournaments.
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Cards grid */}
      {loading ? (
        <Loader text="Loading tournaments…" />
      ) : tournaments.length === 0 ? (
        <EmptyState
          title="No tournaments found"
          description={isAdmin ? "Create the first tournament to get started." : "No tournaments have been created yet."}
          action={isAdmin ? () => navigate("/tournaments/new") : undefined}
          actionLabel="Create Tournament"
          icon={<BigTrophyIcon />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tournaments.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              isAdmin={isAdmin}
              onDelete={() => setDeleteTarget(t)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(""); }}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Tournament"
        message={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}

/* ── Tournament card ─────────────────────────────────────────────────────────── */
function TournamentCard({ tournament: t, isAdmin, onDelete }) {
  const imgSrc = getImageUrl(t.imageUrl);

  return (
    <div className="card p-0 overflow-hidden flex flex-col hover:border-brand-500/40 transition-all duration-200"
      style={{ border: "1px solid #334155" }}>
      {/* Image */}
      <div className="relative h-40 bg-surface-DEFAULT overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} alt={t.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#0c4a6e,#1e293b)" }}>
            <BigTrophyIcon light />
          </div>
        )}
        {/* Sport badge */}
        {t.sport && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold"
            style={{ background: "rgba(14,165,233,0.85)", color: "white", backdropFilter: "blur(4px)" }}>
            {t.sport}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link to={`/tournaments/${t.id}`}>
          <h3 className="font-semibold text-white hover:text-brand-400 transition-colors line-clamp-1">{t.name}</h3>
        </Link>

        {t.description && (
          <p className="text-xs line-clamp-2" style={{ color: "#64748b" }}>{t.description}</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1" style={{ color: "#94a3b8" }}>
          {t.location && <span>📍 {t.location}</span>}
          <span>📅 {formatDate(t.startDate)} → {formatDate(t.endDate)}</span>
          <span>👥 Max {t.maxTeams} teams</span>
          {t.prize > 0 && (
            <span className="font-semibold" style={{ color: "#f97316" }}>🏆 {formatPrize(t.prize)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-3" style={{ borderTop: "1px solid #334155" }}>
          <Link to={`/tournaments/${t.id}`} className="btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "6px 12px", fontSize: "0.75rem" }}>
            View
          </Link>
          <Link to={`/tournaments/${t.id}/edit`} className="btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "6px 12px", fontSize: "0.75rem" }}>
            Edit
          </Link>
          {isAdmin && (
            <button
              onClick={onDelete}
              className="btn-ghost"
              style={{ padding: "6px 12px", fontSize: "0.75rem", color: "#f87171", borderColor: "rgba(239,68,68,0.3)" }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const PlusIcon    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const BigTrophyIcon = ({ light }) => (
  <svg className="w-12 h-12" style={{ color: light ? "rgba(148,163,184,0.3)" : "#475569" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
      d="M8 21h8M12 17v4M5 3H3v4a4 4 0 004 4h1m6 0h1a4 4 0 004-4V3h-2M5 3h14M5 3a7 7 0 007 9 7 7 0 007-9" />
  </svg>
);

export default TournamentList;
