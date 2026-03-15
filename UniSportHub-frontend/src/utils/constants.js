// ── Environment variables ────────────────────────────────────────────────────
export const API_BASE_URL    = import.meta.env.VITE_API_BASE_URL  || "http://localhost:8080/api";
export const APP_NAME        = import.meta.env.VITE_APP_NAME      || "UniSportHub";
export const TOKEN_KEY       = import.meta.env.VITE_TOKEN_KEY     || "unisport_token";
export const USER_KEY        = import.meta.env.VITE_USER_KEY      || "unisport_user";
export const IMAGE_BASE_URL  = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8080";

// ── API Endpoints (matches Spring Boot controllers exactly) ──────────────────
export const ENDPOINTS = {
  // Auth – /api/auth/...
  LOGIN:    "/auth/login",
  REGISTER: "/auth/register",

  // Resources
  TOURNAMENTS: "/tournaments",
  TEAMS:       "/teams",
  PLAYERS:     "/players",
};

// ── Sport types for dropdowns ────────────────────────────────────────────────
export const SPORT_TYPES = [
  "Football", "Basketball", "Volleyball", "Tennis",
  "Table Tennis", "Badminton", "Swimming", "Athletics",
  "Handball", "Chess",
];

// ── Player positions by sport ─────────────────────────────────────────────────
export const PLAYER_POSITIONS = {
  Football:   ["Goalkeeper", "Defender", "Midfielder", "Forward"],
  Basketball: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
  Volleyball: ["Setter", "Libero", "Outside Hitter", "Middle Blocker", "Opposite Hitter"],
  default:    ["Player"],
};

// ── Default pagination ───────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
