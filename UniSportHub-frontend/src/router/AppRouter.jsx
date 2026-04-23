import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout     from "../layouts/AuthLayout";
import MainLayout     from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

import Login    from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Dashboard         from "../pages/dashboard/Dashboard";
import TournamentList    from "../pages/tournaments/TournamentList";
import TournamentDetails from "../pages/tournaments/TournamentDetails";
import CreateTournament  from "../pages/tournaments/CreateTournament";
import TeamList          from "../pages/teams/TeamList";
import TeamDetails       from "../pages/teams/TeamDetails";
import PlayerList        from "../pages/players/PlayerList";
import PlayerForm        from "../pages/players/PlayerForm";
import VolunteerShifts   from "../pages/volunteer-shifts/VolunteerShifts";

function AppRouter() {
  return (
    <Routes>
      {/* ── Public routes ────────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ── Protected routes ─────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          {/* Tournaments */}
          <Route path="/tournaments"          element={<TournamentList />} />
          <Route path="/tournaments/new"      element={<CreateTournament />} />
          <Route path="/tournaments/:id"      element={<TournamentDetails />} />
          <Route path="/tournaments/:id/edit" element={<CreateTournament />} />

          {/* Teams */}
          <Route path="/teams"     element={<TeamList />} />
          <Route path="/teams/:id" element={<TeamDetails />} />

          {/* Players */}
          <Route path="/players"          element={<PlayerList />} />
          {/* /players/new redirects back to /players (no backend create-standalone) */}
          <Route path="/players/new"      element={<PlayerForm />} />
          <Route path="/players/:id/edit" element={<PlayerForm />} />

          {/* Volunteer Shifts */}
          <Route path="/volunteer-shifts" element={<VolunteerShifts />} />

        </Route>
      </Route>

      {/* ── Fallback ─────────────────────────────────────────── */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRouter;
