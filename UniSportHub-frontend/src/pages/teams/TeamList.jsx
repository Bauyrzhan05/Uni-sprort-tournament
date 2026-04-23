import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import useAuth from "../../hooks/useAuth";
import {
  createTeam,
  deleteTeam,
  getTeams,
  joinTeam,
  leaveTeam,
  updateTeam,
} from "../../api/teamService";
import { getTournaments } from "../../api/tournamentService";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { extractError, getInitials } from "../../utils/helpers";

function TeamModal({ isOpen, onClose, team, tournaments, onSaved }) {
  const isEdit = !!team;
  const [form, setForm] = useState({ teamName: "", tournamentId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      teamName: team?.teamName || "",
      tournamentId: team?.tournamentId || "",
    });
    setError("");
  }, [team, isOpen]);

  const handleChange = (event) => {
    setError("");
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.teamName.trim()) {
      setError("Team name is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        teamName: form.teamName.trim(),
        tournamentId: form.tournamentId ? Number(form.tournamentId) : null,
      };

      if (isEdit) {
        await updateTeam(team.id, payload);
      } else {
        await createTeam(payload);
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Team" : "Create Team"} size="sm">
      {error && <ErrorBanner message={error} className="mb-4" />}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Team Name"
          name="teamName"
          placeholder="Eagles FC"
          value={form.teamName}
          onChange={handleChange}
          required
        />
        <Input
          label="Tournament (optional)"
          name="tournamentId"
          as="select"
          value={form.tournamentId}
          onChange={handleChange}
        >
          <option value="">No tournament</option>
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
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

function TeamList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, team: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pageError, setPageError] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const { data, loading, error, refetch } = useFetch(getTeams);
  const { data: tournamentsData } = useFetch(getTournaments);

  const allTeams = Array.isArray(data) ? data : [];
  const tournaments = Array.isArray(tournamentsData) ? tournamentsData : [];

  const teams = useMemo(() => {
    if (!search.trim()) return allTeams;

    const query = search.trim().toLowerCase();
    return allTeams.filter((team) => {
      const ownerName = (team.ownerName || "").toLowerCase();
      return team.teamName.toLowerCase().includes(query) || ownerName.includes(query);
    });
  }, [allTeams, search]);

  const getTournamentName = (tournamentId) => {
    if (!tournamentId) return "No tournament";
    const tournament = tournaments.find((item) => item.id === tournamentId);
    return tournament ? tournament.name : `Tournament #${tournamentId}`;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setBusyAction(`delete-${deleteTarget.id}`);
    setPageError("");
    try {
      await deleteTeam(deleteTarget.id);
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      setPageError(extractError(err));
    } finally {
      setBusyAction("");
    }
  };

  const handleMembership = async (team) => {
    setBusyAction(`membership-${team.id}`);
    setPageError("");
    try {
      if (team.isMember) {
        await leaveTeam(team.id);
      } else {
        await joinTeam(team.id);
      }
      await refetch();
    } catch (err) {
      setPageError(extractError(err));
    } finally {
      setBusyAction("");
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Teams</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
            Owner-only management with self join/leave for users.
          </p>
        </div>
        <Button onClick={() => setModal({ open: true, team: null })}>
          <PlusIcon /> Create Team
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <input
          className="input-field sm:w-80"
          placeholder="Search by team or owner..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="text-sm" style={{ color: "#64748b" }}>
          Signed in as <span style={{ color: "#e2e8f0" }}>{user?.username || user?.email}</span>
        </div>
      </div>

      <div className="card">
        <div className="space-y-2 text-sm" style={{ color: "#94a3b8" }}>
          <p>Only the team owner or admin can edit and delete a team.</p>
          <p>Regular users can only join or leave as themselves.</p>
          <p>Only admin can manually add or remove other members on the team details page.</p>
          {isAdmin && <p style={{ color: "#fdba74" }}>Admin mode is active.</p>}
        </div>
      </div>

      {(error || pageError) && <ErrorBanner message={pageError || error} />}

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <Loader text="Loading teams..." />
        ) : teams.length === 0 ? (
          <EmptyState
            title="No teams found"
            description="Create a team or change your search."
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
                  <th className="table-header text-left hidden md:table-cell">Owner</th>
                  <th className="table-header text-left hidden md:table-cell">Tournament</th>
                  <th className="table-header text-left hidden sm:table-cell">Members</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr
                    key={team.id}
                    style={{ borderBottom: "1px solid #1e293b" }}
                    className="hover:bg-surface-hover/40 transition-colors"
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: "rgba(3,105,161,0.3)",
                            border: "1px solid rgba(14,165,233,0.2)",
                            color: "#7dd3fc",
                          }}
                        >
                          {getInitials(team.teamName || "T")}
                        </div>
                        <div className="space-y-1">
                          <Link to={`/teams/${team.id}`} className="font-medium text-white hover:text-brand-400 transition-colors">
                            {team.teamName}
                          </Link>
                          <div className="flex flex-wrap gap-2">
                            {team.ownerId === user?.id && <Tag tone="owner">Owner</Tag>}
                            {team.isMember && <Tag tone="member">Member</Tag>}
                            {team.canManage && <Tag tone="manage">Can Manage</Tag>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell" style={{ color: "#cbd5e1" }}>
                      {team.ownerName || "Unknown"}
                    </td>
                    <td className="table-cell hidden md:table-cell" style={{ color: "#94a3b8" }}>
                      {getTournamentName(team.tournamentId)}
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span style={pillStyle}>{team.memberCount ?? team.memberIds?.length ?? 0} members</span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {team.ownerId !== user?.id && (
                          <Button
                            variant={team.isMember ? "ghost" : "primary"}
                            size="sm"
                            loading={busyAction === `membership-${team.id}`}
                            onClick={() => handleMembership(team)}
                          >
                            {team.isMember ? "Leave" : "Join"}
                          </Button>
                        )}
                        {team.canManage && (
                          <Button variant="ghost" size="sm" onClick={() => setModal({ open: true, team })}>
                            Edit
                          </Button>
                        )}
                        {team.canManage && (
                          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(team)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
        loading={busyAction === `delete-${deleteTarget?.id}`}
        title="Delete Team"
        message={`Delete "${deleteTarget?.teamName}"? Only the owner or admin can do this.`}
      />
    </div>
  );
}

function ErrorBanner({ message, className = "" }) {
  return (
    <div
      className={`px-4 py-3 rounded-lg text-sm ${className}`}
      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
    >
      {message}
    </div>
  );
}

function Tag({ children, tone }) {
  const styles = {
    owner: { background: "rgba(56,189,248,0.12)", color: "#7dd3fc", border: "1px solid rgba(56,189,248,0.2)" },
    member: { background: "rgba(34,197,94,0.12)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" },
    manage: { background: "rgba(249,115,22,0.12)", color: "#fdba74", border: "1px solid rgba(249,115,22,0.2)" },
  };

  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={styles[tone]}>
      {children}
    </span>
  );
}

const pillStyle = {
  background: "rgba(14,165,233,0.1)",
  color: "#7dd3fc",
  border: "1px solid rgba(14,165,233,0.2)",
  padding: "2px 10px",
  borderRadius: 9999,
  fontSize: "0.75rem",
  fontWeight: 600,
};

const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const BigShieldIcon = () => <svg className="w-12 h-12" style={{ color: "#475569" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;

export default TeamList;
