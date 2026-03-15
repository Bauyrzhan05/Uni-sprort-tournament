import { Link, useParams, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getTournament, getTournamentTeams, deleteTournament } from "../../api/tournamentService";
import Button        from "../../components/common/Button";
import Loader        from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatDate, formatPrize, getImageUrl, extractError } from "../../utils/helpers";
import useAuth from "../../hooks/useAuth";
import { useState, useCallback } from "react";

/**
 * TournamentDetails
 * Backend: GET /api/tournaments/{id} → TournamentDto
 * TournamentDto: { id, name, sport, imageUrl, maxTeams, startDate, endDate,
 *                  location, description, prize, createAt }
 * Teams for this tournament: GET /api/teams → filter by tournamentId client-side
 */
function TournamentDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin  = user?.role === "ROLE_ADMIN";

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTournament = useCallback(() => getTournament(id), [id]);
  const fetchTeams      = useCallback(() => getTournamentTeams(id), [id]);

  const { data: tournament, loading, error } = useFetch(fetchTournament, [id]);
  const { data: teams, loading: tLoading }   = useFetch(fetchTeams, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteTournament(id);
      navigate("/tournaments");
    } catch (err) {
      console.error(extractError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <Loader text="Loading tournament…" />;
  if (error)   return <ErrorCard message={error} onBack={() => navigate("/tournaments")} />;
  if (!tournament) return null;

  const imgSrc   = getImageUrl(tournament.imageUrl);
  const teamList = Array.isArray(teams) ? teams : [];

  return (
    <div className="space-y-6 animate-in">
      {/* Back */}
      <Link to="/tournaments"
        style={{ fontSize: "0.875rem", color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 }}
        className="hover:text-brand-400 transition-colors">
        ← Back to Tournaments
      </Link>

      {/* Hero */}
      <div className="card p-0 overflow-hidden">
        {imgSrc ? (
          <div className="relative h-56 overflow-hidden">
            <img src={imgSrc} alt={tournament.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)" }} />
            <div className="absolute bottom-0 left-0 p-6">
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.05em", color: "white", lineHeight: 1 }}>
                {tournament.name}
              </h1>
              {tournament.sport && (
                <span className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(14,165,233,0.8)", color: "white" }}>
                  {tournament.sport}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6"
            style={{ background: "linear-gradient(135deg,#0c4a6e,#1e293b)" }}>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", letterSpacing: "0.05em", color: "white" }}>
              {tournament.name}
            </h1>
          </div>
        )}

        {/* Actions bar */}
        <div className="px-6 py-3 flex items-center gap-3 justify-end"
          style={{ borderTop: "1px solid #334155" }}>
          <Link to={`/tournaments/${id}/edit`}>
            <Button variant="ghost" size="sm">✏️ Edit</Button>
          </Link>
          {isAdmin && (
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>🗑 Delete</Button>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Sport",      value: tournament.sport     || "—"                   },
          { label: "Location",   value: tournament.location  || "—"                   },
          { label: "Start Date", value: formatDate(tournament.startDate)               },
          { label: "End Date",   value: formatDate(tournament.endDate)                 },
          { label: "Max Teams",  value: tournament.maxTeams || "—"                    },
          { label: "Prize",      value: formatPrize(tournament.prize)                  },
          { label: "Created",    value: tournament.createAt ? formatDate(tournament.createAt.slice?.(0,10)) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="card py-4">
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#64748b" }}>{label}</p>
            <p className="font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {tournament.description && (
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-2">Description</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.7 }}>{tournament.description}</p>
        </div>
      )}

      {/* Teams */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">
            Participating Teams
            <span className="ml-2 px-2 py-0.5 rounded text-xs"
              style={{ background: "rgba(14,165,233,0.15)", color: "#7dd3fc" }}>
              {teamList.length}
            </span>
          </h2>
          <Link to="/teams">
            <Button size="sm" variant="ghost">+ Add Team</Button>
          </Link>
        </div>

        {tLoading ? (
          <Loader />
        ) : teamList.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: "#64748b" }}>
            No teams registered for this tournament yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamList.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`}
                className="flex items-center gap-3 p-3 rounded-lg transition-all"
                style={{ border: "1px solid #334155" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(14,165,233,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "rgba(3,105,161,0.3)", border: "1px solid rgba(14,165,233,0.2)", color: "#7dd3fc" }}>
                  {team.teamName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{team.teamName}</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>{team.players?.length ?? 0} players</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Tournament"
        message={`Delete "${tournament.name}"? This action cannot be undone.`}
      />
    </div>
  );
}

function ErrorCard({ message, onBack }) {
  return (
    <div className="card text-center py-16">
      <p style={{ color: "#f87171" }} className="mb-4">{message}</p>
      <Button variant="ghost" onClick={onBack}>← Go Back</Button>
    </div>
  );
}

export default TournamentDetails;
