import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getTeams, deleteTeam, createTeam, updateTeam } from "../../api/teamService";
import { getTournaments } from "../../api/tournamentService";
import Button        from "../../components/common/Button";
import Loader        from "../../components/common/Loader";
import EmptyState    from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal         from "../../components/common/Modal";
import Input         from "../../components/common/Input";
import { extractError } from "../../utils/helpers";

/**
 * TeamList
 * Backend: GET /api/teams → List<TeamDto>
 * TeamDto: { id, teamName, players: List<PlayerDto>, tournamentId }
 *
 * POST /teams: { teamName, tournamentId? }
 * PUT  /teams/{id}: { teamName }  (only teamName updated by backend service)
 * DELETE /teams/{id}
 */

/* ── Team Modal (create / edit) ─────────────────────────────────────────────── */
function TeamModal({ isOpen, onClose, team, tournaments, onSaved }) {
  const isEdit = !!team;
  const [form, setForm]       = useState({
    teamName:     team?.teamName     || "",
    tournamentId: team?.tournamentId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => {
    setError("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.teamName.trim()) { setError("Team name is required."); return; }
    setLoading(true);
    try {
      const payload = {
        teamName:     form.teamName,
        tournamentId: form.tournamentId ? Number(form.tournamentId) : null,
      };
      if (isEdit) await updateTeam(team.id, payload);
      else        await createTeam(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Team" : "New Team"} size="sm">
      {error && (
        <div className="mb-4 px-3 py-2 rounded text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Team Name" name="teamName" placeholder="Eagles FC"
          value={form.teamName} onChange={handleChange} required
        />
        <Input
          label="Tournament (optional)" name="tournamentId" as="select"
          value={form.tournamentId} onChange={handleChange}
        >
          <option value="">No tournament</option>
          {(tournaments || []).map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Input>
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? "Save" : "Create"}</Button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
function TeamList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState({ open: false, team: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data, loading, error, refetch } = useFetch(getTeams);
  const { data: tournamentsData } = useFetch(getTournaments);

  // Plain arrays from backend
  const allTeams    = Array.isArray(data)             ? data             : [];
  const tournaments = Array.isArray(tournamentsData)  ? tournamentsData  : [];

  // Client-side search by teamName
  const teams = search.trim()
    ? allTeams.filter((t) => t.teamName.toLowerCase().includes(search.toLowerCase()))
    : allTeams;

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteTeam(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      console.error(extractError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Find tournament name for display
  const getTournamentName = (tournamentId) => {
    if (!tournamentId) return "—";
    const t = tournaments.find((t) => t.id === tournamentId);
    return t ? t.name : `Tournament #${tournamentId}`;
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Teams</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
            {allTeams.length} team{allTeams.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button onClick={() => setModal({ open: true, team: null })}>
          <PlusIcon /> New Team
        </Button>
      </div>

      {/* Search */}
      <input
        className="input-field sm:w-72"
        placeholder="Search teams…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <Loader text="Loading teams…" />
        ) : teams.length === 0 ? (
          <EmptyState
            title="No teams found"
            description="Create the first team to get started."
            action={() => setModal({ open: true, team: null })}
            actionLabel="Create Team"
            icon={<BigShieldIcon />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #334155", background: "rgba(15,23,42,0.5)" }}>
                  <th className="table-header text-left">Team</th>
                  <th className="table-header text-left hidden md:table-cell">Tournament</th>
                  <th className="table-header text-left hidden sm:table-cell">Players</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}
                    style={{ borderBottom: "1px solid #1e293b" }}
                    className="hover:bg-surface-hover/40 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: "rgba(3,105,161,0.3)",
                            border: "1px solid rgba(14,165,233,0.2)",
                            color: "#7dd3fc",
                          }}>
                          {team.teamName?.[0]?.toUpperCase()}
                        </div>
                        <Link to={`/teams/${team.id}`} className="font-medium text-white hover:text-brand-400 transition-colors">
                          {team.teamName}
                        </Link>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell" style={{ color: "#94a3b8" }}>
                      {getTournamentName(team.tournamentId)}
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span style={{
                        background: "rgba(14,165,233,0.1)", color: "#7dd3fc",
                        border: "1px solid rgba(14,165,233,0.2)",
                        padding: "2px 10px", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 600,
                      }}>
                        {team.players?.length ?? 0} players
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm"
                          onClick={() => setModal({ open: true, team })}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm"
                          onClick={() => setDeleteTarget(team)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <TeamModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, team: null })}
        team={modal.team}
        tournaments={tournaments}
        onSaved={refetch}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Team"
        message={`Delete "${deleteTarget?.teamName}"? All players will also be removed.`}
      />
    </div>
  );
}

const PlusIcon    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const BigShieldIcon = () => <svg className="w-12 h-12" style={{ color: "#475569" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;

export default TeamList;
