# UniSportHub — Frontend v2
**Fully integrated with Spring Boot backend**

---

## Quick Start

```bash
# 1. Install deps
npm install

# 2. Configure (copy and edit)
cp .env.example .env

# 3. Run dev server
npm run dev   # → http://localhost:5173

# 4. Production build
npm run build
```

---

## Backend Integration Map

### 🔐 Auth  (`/api/auth/*`)
| Frontend action | HTTP | Endpoint | Payload |
|---|---|---|---|
| Login | POST | `/api/auth/login` | `{ email, password }` |
| Register | POST | `/api/auth/register` | `{ username, email, password }` |
| Response | — | — | `{ token }` only — user info decoded from JWT |

### 🏆 Tournaments  (`/api/tournaments`)
| Action | HTTP | Notes |
|---|---|---|
| Get all | GET | Returns `List<TournamentDto>` — plain array, no pagination |
| Get one | GET `/{id}` | Returns `TournamentDto` |
| Create | POST | **multipart/form-data**: `tournament` (JSON blob) + `image` (file). **ROLE_ADMIN only** |
| Update | PUT `/{id}` | JSON body, no image on update |
| Delete | DELETE `/{id}` | Returns boolean |

**TournamentDto fields**: `id, name, sport, imageUrl, maxTeams, startDate, endDate, location, description, prize, createAt`

### 🛡 Teams  (`/api/teams`)
| Action | HTTP | Notes |
|---|---|---|
| Get all | GET | `List<TeamDto>` — players embedded inside each team |
| Get one | GET `/{id}` | Includes `players: List<PlayerDto>` |
| Create | POST | `{ teamName, tournamentId? }` |
| Update | PUT `/{id}` | Only `teamName` is updated by backend |
| Delete | DELETE `/{id}` | Cascades to players |

**TeamDto fields**: `id, teamName, players: [{id, fullName, teamId}], tournamentId`

### 👥 Players  (`/api/players`)
| Action | HTTP | Notes |
|---|---|---|
| Get all | GET | `List<PlayerDto>` |
| Get by team | GET `/{teamId}` | ⚠️ This is NOT get-by-id — it's filter-by-team |
| Create | POST | `{ fullName, teamId? }` |
| Delete | DELETE `/{id}` | |
| ❌ Update | — | **No PUT endpoint in backend** |

**PlayerDto fields**: `id, fullName, teamId`

---

## ⚠️ Required Backend Changes

### 1. CORS — `SecurityConfig.java`
```java
corsConfiguration.setAllowedOrigins(List.of(
    "http://localhost:5173",   // Vite dev server
    "http://localhost:3000"    // (optional) CRA / other
));
corsConfiguration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
corsConfiguration.setAllowedHeaders(List.of("*"));
corsConfiguration.setAllowCredentials(false);
```

### 2. Static image serving — `application.properties`
```properties
# Serve /uploads/** as static resources
spring.web.resources.static-locations=file:uploads/,classpath:/static/
spring.mvc.static-path-pattern=/**
```
> Without this, tournament images will return 404.

---

## Frontend Adaptations Made

| Issue | How Fixed |
|---|---|
| Backend returns only `{ token }` on auth | Decode JWT payload with `atob()` to extract `id, email, role` |
| `teamName` field (not `name`) | All team forms + displays use `teamName` |
| `fullName` field (not `name`) | All player forms + displays use `fullName` |
| `POST /tournaments` requires multipart | `createTournament()` sends `FormData` with JSON blob + file |
| No pagination — plain `List<T>` | Removed all `.content` / `.totalElements` references |
| Client-side search (no backend filter params) | `.filter()` applied after fetch |
| No `PUT /players/{id}` endpoint | Player editing removed; delete + re-add instead |
| `GET /players/{teamId}` = "by team" (not by id) | Service correctly named `getPlayersByTeam()` |
| Tournament images stored at `/uploads/tournaments/…` | `getImageUrl()` prefixes `IMAGE_BASE_URL` |
| Role-based UI (`ROLE_ADMIN` only can create tournaments) | `user?.role === "ROLE_ADMIN"` check in TournamentList + CreateTournament |

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=UniSportHub
VITE_TOKEN_KEY=unisport_token
VITE_USER_KEY=unisport_user
VITE_IMAGE_BASE_URL=http://localhost:8080
```
