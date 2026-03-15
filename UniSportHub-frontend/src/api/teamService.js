import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "../utils/constants";

/**
 * Team API — maps to Spring Boot TeamController (/api/teams)
 *
 * Backend endpoints:
 *   GET    /teams        → List<TeamDto>     (ROLE_USER | ROLE_ADMIN)
 *   GET    /teams/{id}   → TeamDto           (ROLE_USER | ROLE_ADMIN)
 *   POST   /teams        → TeamDto           (ROLE_USER | ROLE_ADMIN)
 *   PUT    /teams/{id}   → TeamDto           (ROLE_USER | ROLE_ADMIN)
 *   DELETE /teams/{id}   → boolean           (ROLE_USER | ROLE_ADMIN)
 *
 * TeamDto fields:
 *   id, teamName, players: List<PlayerDto>, tournamentId
 *
 * NOTE: No pagination — returns plain List<TeamDto>
 * NOTE: No /teams/{id}/players endpoint — players are embedded in TeamDto
 */

const BASE = ENDPOINTS.TEAMS;

/** GET /teams */
export const getTeams = () =>
  axiosInstance.get(BASE);

/** GET /teams/{id} – includes players list */
export const getTeam = (id) =>
  axiosInstance.get(`${BASE}/${id}`);

/**
 * POST /teams
 * @param {{ teamName: string, tournamentId?: number }} data
 */
export const createTeam = (data) =>
  axiosInstance.post(BASE, data);

/**
 * PUT /teams/{id}
 * Only teamName is updated by the backend service
 */
export const updateTeam = (id, data) =>
  axiosInstance.put(`${BASE}/${id}`, data);

/** DELETE /teams/{id} */
export const deleteTeam = (id) =>
  axiosInstance.delete(`${BASE}/${id}`);

/**
 * Get players for a team.
 * Backend: TeamDto embeds List<PlayerDto> players.
 * We fetch the team and return its players array.
 */
export const getTeamPlayers = (teamId) =>
  getTeam(teamId).then((res) => ({
    ...res,
    data: res.data?.players || [],
  }));
