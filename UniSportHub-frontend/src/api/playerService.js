import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "../utils/constants";

/**
 * Player API — maps to Spring Boot PlayerController (/api/players)
 *
 * Backend endpoints:
 *   GET    /players          → List<PlayerDto>  (ROLE_USER | ROLE_ADMIN)
 *   GET    /players/{teamId} → List<PlayerDto>  — NOTE: /{teamId} not /{id}!
 *                              Returns players filtered by team
 *   POST   /players          → PlayerDto        (ROLE_USER | ROLE_ADMIN)
 *   DELETE /players/{id}     → boolean          (ROLE_USER | ROLE_ADMIN)
 *
 * PlayerDto fields:
 *   id, fullName, teamId
 *
 * IMPORTANT:
 *   - GET /players/{teamId} is the "by team" endpoint (not a player by id)
 *   - There is NO PUT /players/{id} in the backend → update not available
 *   - There is NO GET /players/{id} (only get all, or get by teamId)
 */

const BASE = ENDPOINTS.PLAYERS;

/** GET /players – returns all players */
export const getPlayers = () =>
  axiosInstance.get(BASE);

/**
 * GET /players/{teamId}
 * Returns List<PlayerDto> for the given team.
 * WARNING: This is the same path structure as "get by id" but the backend
 * implementation is getPlayersByTeam, not getPlayerById.
 */
export const getPlayersByTeam = (teamId) =>
  axiosInstance.get(`${BASE}/${teamId}`);

/**
 * POST /players
 * @param {{ fullName: string, teamId: number }} data
 */
export const createPlayer = (data) =>
  axiosInstance.post(BASE, data);

/** DELETE /players/{id} */
export const deletePlayer = (id) =>
  axiosInstance.delete(`${BASE}/${id}`);

// NOTE: No updatePlayer endpoint in backend.
// If editing is needed, delete + recreate the player.
