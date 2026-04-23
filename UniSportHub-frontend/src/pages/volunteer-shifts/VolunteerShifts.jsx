import { useCallback, useEffect, useMemo, useState } from "react";
import useFetch from "../../hooks/useFetch";
import useAuth from "../../hooks/useAuth";
import {
  clearVolunteerShift,
  getAllVolunteerShifts,
  getMyVolunteerShift,
  saveMyVolunteerShift,
} from "../../api/volunteerShiftService";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Input from "../../components/common/Input";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { extractError } from "../../utils/helpers";

const SHIFT_OPTIONS = ["MORNING", "EVENING"];

function VolunteerShifts() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";

  const [selectedShift, setSelectedShift] = useState("MORNING");
  const [saveLoading, setSaveLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [clearTarget, setClearTarget] = useState(null);
  const [clearLoading, setClearLoading] = useState(false);

  const fetchMyShift = useCallback(() => getMyVolunteerShift(), []);
  const fetchAllShifts = useCallback(() => getAllVolunteerShifts(), []);

  const {
    data: myShiftData,
    loading: myShiftLoading,
    error: myShiftError,
    refetch: refetchMyShift,
  } = useFetch(fetchMyShift, []);

  const {
    data: allShiftData,
    loading: allShiftsLoading,
    error: allShiftsError,
    refetch: refetchAllShifts,
  } = useFetch(fetchAllShifts, [], isAdmin);

  const myShift = useMemo(() => normalizeSingleShift(myShiftData), [myShiftData]);
  const allShifts = useMemo(() => normalizeShiftList(allShiftData), [allShiftData]);

  useEffect(() => {
    if (myShift?.shift && SHIFT_OPTIONS.includes(myShift.shift)) {
      setSelectedShift(myShift.shift);
    }
  }, [myShift]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaveLoading(true);
    setPageError("");
    setPageMessage("");

    try {
      await saveMyVolunteerShift(selectedShift);
      await refetchMyShift();
      if (isAdmin) await refetchAllShifts();
      setPageMessage(`Your shift was updated to ${selectedShift}.`);
    } catch (err) {
      setPageError(extractError(err));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleClear = async () => {
    if (!clearTarget) return;

    setClearLoading(true);
    setPageError("");
    setPageMessage("");

    try {
      await clearVolunteerShift(clearTarget.userId);
      await refetchAllShifts();
      if (clearTarget.userId === user?.id) {
        await refetchMyShift();
      }
      setPageMessage(`Cleared shift for ${getDisplayName(clearTarget)}.`);
      setClearTarget(null);
    } catch (err) {
      setPageError(extractError(err));
    } finally {
      setClearLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Volunteer Shifts</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
            Choose your own shift and {isAdmin ? "manage all submitted shifts." : "view your current selection."}
          </p>
        </div>
        <ShiftBadge shift={myShift?.shift} />
      </div>

      {(pageError || myShiftError || allShiftsError) && (
        <ErrorBanner message={pageError || myShiftError || allShiftsError} />
      )}

      {pageMessage && <SuccessBanner message={pageMessage} />}

      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">My Shift</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginTop: 4 }}>
              Logged-in users can choose only their own shift.
            </p>
          </div>
          <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Signed in as <span style={{ color: "#e2e8f0" }}>{user?.username || user?.email}</span>
          </div>
        </div>

        {myShiftLoading ? (
          <Loader text="Loading your shift..." />
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Shift"
              as="select"
              value={selectedShift}
              onChange={(event) => setSelectedShift(event.target.value)}
            >
              {SHIFT_OPTIONS.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </Input>

            <div className="grid gap-4 sm:grid-cols-3">
              <InfoCard label="Current Selection" value={myShift?.shift || "Not selected"} />
              <InfoCard label="User" value={getDisplayName(myShift) || user?.username || user?.email || "Unknown"} />
              <InfoCard label="Role" value={isAdmin ? "ADMIN" : "USER"} />
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={saveLoading}>
                Save My Shift
              </Button>
            </div>
          </form>
        )}
      </div>

      {isAdmin && (
        <div className="card">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Admin Shift Overview</h2>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginTop: 4 }}>
                Admin can see all selected shifts and clear any user&apos;s shift.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={refetchAllShifts} disabled={allShiftsLoading}>
              Refresh
            </Button>
          </div>

          {allShiftsLoading ? (
            <Loader text="Loading all shifts..." />
          ) : allShifts.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              No volunteer shifts have been selected yet.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #334155", background: "rgba(15,23,42,0.5)" }}>
                    <th className="table-header text-left">User</th>
                    <th className="table-header text-left hidden sm:table-cell">Email</th>
                    <th className="table-header text-left">Shift</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allShifts.map((item) => (
                    <tr
                      key={item.userId ?? `${item.email}-${item.shift}`}
                      style={{ borderBottom: "1px solid #1e293b" }}
                      className="hover:bg-surface-hover/40 transition-colors"
                    >
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <AvatarLabel name={getDisplayName(item)} />
                          <div className="space-y-1">
                            <p className="font-medium text-white">{getDisplayName(item)}</p>
                            {item.userId && (
                              <p style={{ color: "#64748b", fontSize: "0.75rem" }}>User ID: {item.userId}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell" style={{ color: "#94a3b8" }}>
                        {item.email || "-"}
                      </td>
                      <td className="table-cell">
                        <ShiftPill shift={item.shift} />
                      </td>
                      <td className="table-cell text-right">
                        <Button variant="danger" size="sm" onClick={() => setClearTarget(item)}>
                          Clear
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!clearTarget}
        onClose={() => setClearTarget(null)}
        onConfirm={handleClear}
        loading={clearLoading}
        title="Clear Volunteer Shift"
        message={`Clear shift for "${getDisplayName(clearTarget)}"?`}
      />
    </div>
  );
}

function normalizeSingleShift(data) {
  if (!data) return null;
  if (typeof data === "string") return { shift: data };
  return {
    userId: data.userId ?? data.id ?? data.user?.id ?? null,
    username: data.username ?? data.userName ?? data.user?.username ?? null,
    email: data.email ?? data.user?.email ?? null,
    shift: data.shift ?? data.selectedShift ?? null,
  };
}

function normalizeShiftList(data) {
  if (!Array.isArray(data)) return [];
  return data.map((item) => normalizeSingleShift(item)).filter(Boolean);
}

function getDisplayName(item) {
  if (!item) return "Unknown user";
  return item.username || item.email || (item.userId ? `User #${item.userId}` : "Unknown user");
}

function InfoCard({ label, value }) {
  return (
    <div className="card py-4">
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#64748b" }}>{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  );
}

function AvatarLabel({ name }) {
  const initials = (name || "U")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ background: "#334155", border: "1px solid #475569", color: "#cbd5e1" }}
    >
      {initials || "U"}
    </div>
  );
}

function ShiftBadge({ shift }) {
  return (
    <div className="card py-3 px-4">
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#64748b" }}>Current Shift</p>
      <ShiftPill shift={shift || "Not selected"} />
    </div>
  );
}

function ShiftPill({ shift }) {
  const styles = {
    MORNING: { background: "rgba(245,158,11,0.12)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.2)" },
    EVENING: { background: "rgba(56,189,248,0.12)", color: "#7dd3fc", border: "1px solid rgba(56,189,248,0.2)" },
    default: { background: "rgba(100,116,139,0.12)", color: "#cbd5e1", border: "1px solid rgba(100,116,139,0.2)" },
  };

  const tone = styles[shift] || styles.default;

  return (
    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold" style={tone}>
      {shift}
    </span>
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

function SuccessBanner({ message }) {
  return (
    <div
      className="px-4 py-3 rounded-lg text-sm"
      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }}
    >
      {message}
    </div>
  );
}

export default VolunteerShifts;
