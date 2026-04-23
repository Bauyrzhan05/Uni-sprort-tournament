import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import useAuth from "../../hooks/useAuth";
import {
  adminAddMember,
  adminRemoveMember,
  deleteTeam,
  getTeam,
  joinTeam,
  leaveTeam,
} from "../../api/teamService";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Input from "../../components/common/Input";
import { extractError, getInitials } from "../../utils/helpers";

function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";

  const [pageError, setPageError] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [memberUserId, setMemberUserId] = useState("");
  const [removeUserId, setRemoveUserId] = useState("");

  const fetchTeam = useCallback(() => getTeam(id), [id]);
  const { data: team, loading, error, refetch } = useFetch(fetchTeam, [id]);

  const memberIds = useMemo(() => team?.memberIds || [], [team]);
  const isOwner = team?.ownerId === user?.id;

  const runAction = async (actionKey, request, afterSuccess) => {
    setBusyAction(actionKey);
    setPageError("");
    try {
      await request();
      await refetch();
      if (afterSuccess) afterSuccess();
    } catch (err) {
      setPageError(extractError(err));
    } finally {
      setBusyAction("");
    }
  };

  const handleDelete = async () => {
    await runAction(
      "delete-team",
      () => deleteTeam(id),
      () => navigate("/teams"),
    );
  };

  const handleJoinLeave = async () => {
    if (!team) return;

    await runAction(
      team.isMember ? "leave-team" : "join-team",
      () => (team.isMember ? leaveTeam(team.id) : joinTeam(team.id)),
    );
  };

  const handleAdminAdd = async () => {
    if (!memberUserId.trim()) {
      setPageError("Enter a user id to add.");
      return;
    }

    await runAction(
      "add-member",
      () => adminAddMember(team.id, Number(memberUserId)),
      () => setMemberUserId(""),
    );
  };

  const handleAdminRemove = async () => {
    if (!removeUserId.trim()) {
      setPageError("Enter a user id to remove.");
      return;
    }

    await runAction(
      "remove-member",
      () => adminRemoveMember(team.id, Number(removeUserId)),
      () => setRemoveUserId(""),
    );
  };

  if (loading) return <Loader text="Loading team..." />;
  if (error) return <ErrorCard message={error} onBack={() => navigate("/teams")} />;
  if (!team) return null;

  const players = team.players || [];

  return (
    <div className="space-y-6 animate-in">
      <Link
        to="/teams"
        style={{ fontSize: "0.875rem", color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 }}
        className="hover:text-brand-400 transition-colors"
      >
        ← Back to Teams
      </Link>

      {(pageError || error) && <ErrorBanner message={pageError || error} />}

      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: "rgba(3,105,161,0.3)", border: "1px solid rgba(14,165,233,0.2)", color: "#7dd3fc" }}
            >
              {getInitials(team.teamName || "T")}
            </div>
            <div className="space-y-2">
              <h1 className="page-title leading-none">{team.teamName}</h1>
              <div className="flex flex-wrap gap-2">
                {isOwner && <Tag tone="owner">Owner</Tag>}
                {team.isMember && <Tag tone="member">Member</Tag>}
                {team.canManage && <Tag tone="manage">Can Manage</Tag>}
                {isAdmin && <Tag tone="admin">Admin</Tag>}
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                Owner: <span style={{ color: "#e2e8f0" }}>{team.ownerName || `User #${team.ownerId}`}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {!isOwner && (
              <Button
                variant={team.isMember ? "ghost" : "primary"}
                loading={busyAction === "join-team" || busyAction === "leave-team"}
                onClick={handleJoinLeave}
              >
                {team.isMember ? "Leave Team" : "Join Team"}
              </Button>
            )}
            {team.canManage && (
              <Button
                variant="danger"
                loading={busyAction === "delete-team"}
                onClick={() => setDeleteOpen(true)}
              >
                Delete Team
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <InfoCard label="Members" value={team.memberCount} />
          <InfoCard label="Tournament" value={team.tournamentId ? `#${team.tournamentId}` : "Not assigned"} />
          <InfoCard label="Member IDs" value={memberIds.length ? memberIds.join(", ") : "None"} />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">
            Team Members
            <span className="ml-2 px-2 py-0.5 rounded text-xs" style={{ background: "rgba(14,165,233,0.15)", color: "#7dd3fc" }}>
              {players.length}
            </span>
          </h2>
        </div>

        {players.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No members on this team yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #334155" }}>
                  <th className="table-header text-left">#</th>
                  <th className="table-header text-left">Member</th>
                  <th className="table-header text-left hidden sm:table-cell">Team ID</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr
                    key={player.id}
                    style={{ borderBottom: "1px solid #1e293b" }}
                    className="hover:bg-surface-hover/40 transition-colors"
                  >
                    <td className="table-cell" style={{ color: "#64748b", width: 48 }}>{index + 1}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#334155", color: "#94a3b8" }}>
                          {player.fullName?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{player.fullName}</span>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell" style={{ color: "#94a3b8" }}>
                      {player.teamId ? `#${player.teamId}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="card">
          <h2 className="text-base font-semibold text-white mb-4">Admin Member Management</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }} className="mb-4">
            This backend accepts `userId` directly, so admin can manually add or remove any member by user id.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Input
                label="Add User By ID"
                placeholder="Enter user id"
                value={memberUserId}
                onChange={(event) => setMemberUserId(event.target.value)}
              />
              <Button loading={busyAction === "add-member"} onClick={handleAdminAdd}>
                Add Member
              </Button>
            </div>
            <div className="space-y-3">
              <Input
                label="Remove User By ID"
                placeholder="Enter user id"
                value={removeUserId}
                onChange={(event) => setRemoveUserId(event.target.value)}
              />
              <Button variant="danger" loading={busyAction === "remove-member"} onClick={handleAdminRemove}>
                Remove Member
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-base font-semibold text-white mb-3">Security Notes</h2>
        <div className="space-y-2 text-sm" style={{ color: "#94a3b8" }}>
          <p>Owner or admin can edit and delete this team.</p>
          <p>Regular users can only join or leave themselves.</p>
          <p>Regular users do not see add/remove member controls.</p>
          <p>Admin sees manual member-management controls only.</p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={busyAction === "delete-team"}
        title="Delete Team"
        message={`Delete "${team.teamName}"? Only the owner or admin should do this.`}
      />
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="card py-4">
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#64748b" }}>{label}</p>
      <p className="text-white font-semibold text-sm break-all">{value}</p>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div
      className="px-4 py-3 rounded-lg text-sm"
      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
    >
      {message}
    </div>
  );
}

function ErrorCard({ message, onBack }) {
  return (
    <div className="card text-center py-16">
      <p style={{ color: "#f87171" }} className="mb-4">{message}</p>
      <Button variant="ghost" onClick={onBack}>Go Back</Button>
    </div>
  );
}

function Tag({ children, tone }) {
  const styles = {
    owner: { background: "rgba(56,189,248,0.12)", color: "#7dd3fc", border: "1px solid rgba(56,189,248,0.2)" },
    member: { background: "rgba(34,197,94,0.12)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" },
    manage: { background: "rgba(249,115,22,0.12)", color: "#fdba74", border: "1px solid rgba(249,115,22,0.2)" },
    admin: { background: "rgba(244,114,182,0.12)", color: "#f9a8d4", border: "1px solid rgba(244,114,182,0.2)" },
  };

  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={styles[tone]}>
      {children}
    </span>
  );
}

export default TeamDetails;
