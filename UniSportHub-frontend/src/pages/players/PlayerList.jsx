import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getPlayers, deletePlayer } from "../../api/playerService";
import { getTeams } from "../../api/teamService";
import Button        from "../../components/common/Button";
import Loader        from "../../components/common/Loader";
import EmptyState    from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal         from "../../components/common/Modal";
import Input         from "../../components/common/Input";
import { createPlayer } from "../../api/playerService";
import { extractError } from "../../utils/helpers";
import { Link } from "react-router-dom";

/**
 * PlayerList
 * Backend: GET /api/players → List<PlayerDto>
 * PlayerDto: { id, fullName, teamId }
 *
 * NOTE: No update player endpoint in backend.
 * Add player: POST /api/players { fullName, teamId }
 * Delete player: DELETE /api/players/{id}
 */

/* ── Add Player Modal ────────────────────────────────────────────────────────── */
function AddPlayerModal({ isOpen, onClose, teams, onAdded }) {
  const [form, setForm]       = useState({ fullName: "", teamId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => {
    setError("");
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) { setError("Player name is required."); return; }
    setLoading(true);
    try {
      await createPlayer({
        fullName: form.fullName.trim(),
        teamId:   form.teamId ? Number(form.teamId) : null,
      });
      setForm({ fullName: "", teamId: "" });
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
        <Input label="Full Name" name="fullName" placeholder="Alex Johnson"
          value={form.fullName} onChange={handleChange} required />
        <Input label="Assign to Team (optional)" name="teamId" as="select"
          value={form.teamId} onChange={handleChange}>
          <option value="">No team</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.teamName}</option>)}
        </Input>
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Add Player</Button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
function PlayerList() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState("");
  const [teamFilter, setTeam] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data, loading, error, refetch } = useFetch(getPlayers);
  const { data: teamsData } = useFetch(getTeams);

  const allPlayers = Array.isArray(data)      ? data      : [];
  const allTeams   = Array.isArray(teamsData) ? teamsData : [];

  // Client-side filter (backend has no filter params)
  const players = allPlayers.filter((p) => {
    const matchSearch = !search.trim() ||
      p.fullName.toLowerCase().includes(search.toLowerCase());
    const matchTeam = !teamFilter ||
      String(p.teamId) === String(teamFilter);
    return matchSearch && matchTeam;
  });

  // Map teamId → teamName for display
  const teamMap = allTeams.reduce((acc, t) => ({ ...acc, [t.id]: t.teamName }), {});

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deletePlayer(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      console.error(extractError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Players</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
            {allPlayers.length} player{allPlayers.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}><PlusIcon /> Add Player</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="input-field sm:w-64"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field sm:w-48"
          value={teamFilter}
          onChange={(e) => setTeam(e.target.value)}
        >
          <option value="">All teams</option>
          {allTeams.map((t) => <option key={t.id} value={t.id}>{t.teamName}</option>)}
        </select>
      </div>

      {/* No-update notice */}
      <div className="px-4 py-2 rounded-lg text-xs"
        style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#fdba74" }}>
        ℹ️ To edit a player's details, delete them and add them again with the correct name.
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <Loader text="Loading players…" />
        ) : players.length === 0 ? (
          <EmptyState
            title="No players found"
            description="Add players and assign them to teams."
            action={() => setAddOpen(true)}
            actionLabel="Add Player"
            icon={<BigUsersIcon />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #334155", background: "rgba(15,23,42,0.5)" }}>
                  <th className="table-header text-left" style={{ width: 48 }}>#</th>
                  <th className="table-header text-left">Player</th>
                  <th className="table-header text-left hidden sm:table-cell">Team</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, idx) => (
                  <tr key={p.id}
                    style={{ borderBottom: "1px solid #1e293b" }}
                    className="hover:bg-surface-hover/40 transition-colors">
                    <td className="table-cell" style={{ color: "#64748b" }}>{idx + 1}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "#334155", border: "1px solid #475569", color: "#94a3b8" }}>
                          {p.fullName?.[0]?.toUpperCase()}
                        </div>
                        <p className="font-medium text-white">{p.fullName}</p>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      {p.teamId ? (
                        <Link to={`/teams/${p.teamId}`}
                          style={{ color: "#38bdf8", fontSize: "0.875rem" }}
                          className="hover:text-brand-300 transition-colors">
                          {teamMap[p.teamId] || `Team #${p.teamId}`}
                        </Link>
                      ) : (
                        <span style={{ color: "#64748b" }}>—</span>
                      )}
                    </td>
                    <td className="table-cell text-right">
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(p)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddPlayerModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        teams={allTeams}
        onAdded={refetch}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Player"
        message={`Delete "${deleteTarget?.fullName}"? This cannot be undone.`}
      />
    </div>
  );
}

const PlusIcon    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const BigUsersIcon = () => <svg className="w-12 h-12" style={{ color: "#475569" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default PlayerList;
