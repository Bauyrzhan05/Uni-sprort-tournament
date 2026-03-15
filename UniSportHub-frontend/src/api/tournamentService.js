import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "../utils/constants";

/**
 * Tournament API — maps to Spring Boot TournamentController (/api/tournaments)
 *
 * Backend endpoints:
 *   GET    /tournaments        → List<TournamentDto>   (public, no auth required for GET)
 *   GET    /tournaments/{id}   → TournamentDto
 *   POST   /tournaments        → TournamentDto  (multipart/form-data: tournament + image)  ROLE_ADMIN only
 *   PUT    /tournaments/{id}   → TournamentDto  (JSON body)
 *   DELETE /tournaments/{id}   → boolean
 *
 * TournamentDto fields:
 *   id, name, sport, imageUrl, maxTeams, startDate (yyyy-MM-dd),
 *   endDate (yyyy-MM-dd), location, description, prize, createAt
 */

const BASE = ENDPOINTS.TOURNAMENTS;

/** GET /tournaments – returns List<TournamentDto> */
export const getTournaments = () =>
  axiosInstance.get(BASE);

/** GET /tournaments/{id} */
export const getTournament = (id) =>
  axiosInstance.get(`${BASE}/${id}`);

/**
 * POST /tournaments – multipart/form-data
 * @param {object} tournamentData – matches TournamentDto fields
 * @param {File}   imageFile      – required image file
 */
export const createTournament = (tournamentData, imageFile) => {
  const formData = new FormData();
  // Spring expects @RequestPart("tournament") as JSON blob
  formData.append(
    "tournament",
    new Blob([JSON.stringify(tournamentData)], { type: "application/json" })
  );
  formData.append("image", imageFile);

  return axiosInstance.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * PUT /tournaments/{id} – JSON body (no image update in PUT)
 * @param {number} id
 * @param {object} tournamentData – TournamentDto fields
 */
export const updateTournament = (id, tournamentData) =>
  axiosInstance.put(`${BASE}/${id}`, tournamentData);

/** DELETE /tournaments/{id} */
export const deleteTournament = (id) =>
  axiosInstance.delete(`${BASE}/${id}`);

/**
 * GET /teams?tournamentId={id}
 * NOTE: The backend does not have /tournaments/{id}/teams endpoint.
 * Teams are fetched via TeamController with tournamentId filter.
 * This helper is kept for semantic convenience — it calls TeamService.
 */
export const getTournamentTeams = (tournamentId) =>
  axiosInstance.get(`/teams`).then((res) => ({
    ...res,
    data: (res.data || []).filter((t) => t.tournamentId === tournamentId),
  }));
