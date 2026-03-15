import { useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getTeam, deleteTeam } from "../../api/teamService";
import { createPlayer, deletePlayer } from "../../api/playerService";
import Button        from "../../components/common/Button";
import Loader        from "../../components/common/Loader";
import Modal         from "../../components/common/Modal";
import Input         from "../../components/common/Input";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { extractError } from "../../utils/helpers";

/**
 * TeamDetails
 * Backend: GET /api/teams/{id} → TeamDto
 * TeamDto: { id, teamName, players: List<PlayerDto>, tournamentId }
 * PlayerDto: { id, fullName, teamId }
 *
 * Players are embedded inside TeamDto — no separate /teams/{id}/players endpoint.
 * Add player: POST /api/players { fullName, teamId }
 * Delete player: DELETE /api/players/{id}
 */
function TeamDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [addOpen, setAddOpen]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTeam = useCallback(() => getTeam(id), [id]);
  const { data: team, loading, error, refetch } = useFetch(fetchTeam, [id]);

  const handleDeletePlayer = async () => {
    setDeleteLoading(true);
    try {
      await deletePlayer(deleteTarget.id);
      setDeleteTarget(null);
      refetch(); // reload team to refresh embedded players list
    } catch (err) {
      console.error(extractError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <Loader text="Loading team…" />;
  if (error)   return <p style={{ color: "#f87171", padding: 24 }}>{error}</p>;
  if (!team)   return null;

  const players = team.players || [];

  return (
    <div className="space-y-6 animate-in">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to="/teams"
            style={{ fontSize: "0.875rem", color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 8 }}
            className="hover:text-brand-400 transition-colors">
            ← Back to Teams
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: "rgba(3,105,161,0.3)", border: "1px solid rgba(14,165,233,0.2)", color: "#7dd3fc" }}>
              {team.teamName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="page-title leading-none">{team.teamName}</h1>
              {team.tournamentId && (
                <Link to={`/tournaments/${team.tournamentId}`}
                  style={{ fontSize: "0.75rem", color: "#38bdf8" }}
                  className="hover:text-brand-300 transition-colors">
                  Tournament #{team.tournamentId}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card py-4">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#64748b" }}>Total Players</p>
          <p className="text-white font-semibold text-2xl" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em" }}>
            {players.length}
          </p>
        </div>
        <div className="card py-4">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#64748b" }}>Tournament</p>
          <p className="text-white font-semibold text-sm">{team.tournamentId ? `#${team.tournamentId}` : "Not assigned"}</p>
        </div>
        <div className="card py-4">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#64748b" }}>Team ID</p>
          <p className="font-mono text-white font-semibold">#{team.id}</p>
        </div>
      </div>

      {/* Players */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">
            Roster
            <span className="ml-2 px-2 py-0.5 rounded text-xs"
              style={{ background: "rgba(14,165,233,0.15)", color: "#7dd3fc" }}>
              {players.length}
            </span>
          </h2>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <PlusIcon /> Add Player
          </Button>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-10">
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No players on this team yet.</p>
            <Button className="mt-4" size="sm" onClick={() => setAddOpen(true)}>Add First Player</Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #334155" }}>
                  <th className="table-header text-left">#</th>
                  <th className="table-header text-left">Player</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #1e293b" }}
                    className="hover:bg-surface-hover/40 transition-colors">
                    <td className="table-cell" style={{ color: "#64748b", width: 48 }}>{idx + 1}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "#334155", color: "#94a3b8" }}>
                          {p.fullName?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{p.fullName}</span>
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(p)}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Player Modal */}
      <AddPlayerModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        teamId={Number(id)}
        onAdded={refetch}
      />

      {/* Delete Player Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePlayer}
        loading={deleteLoading}
        title="Remove Player"
        message={`Remove "${deleteTarget?.fullName}" from the team?`}
      />
    </div>
  );
}

/* ── Add Player Modal ────────────────────────────────────────────────────────── */
function AddPlayerModal({ isOpen, onClose, teamId, onAdded }) {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("Player name is required."); return; }
    setLoading(true);
    try {
      // Backend: POST /api/players { fullName, teamId }
      await createPlayer({ fullName: fullName.trim(), teamId });
      setFullName("");
      onAdded();
      onClose();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { setError(""); onClose(); }} title="Add Player" size="sm">
      {error && (
        <div className="mb-4 px-3 py-2 rounded text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full Name" placeholder="Alex Johnson"
          value={fullName}
          onChange={(e) => { setError(""); setFullName(e.target.value); }}
          required
        />
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Add Player</Button>
        </div>
      </form>
    </Modal>
  );
}

const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

export default TeamDetails;
