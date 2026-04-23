# UniSportHub

UniSportHub is a full-stack university sports management system built with Spring Boot, PostgreSQL, React, Vite, and JWT authentication. The project supports tournament management, secure team ownership and membership flows, player management, and volunteer shift selection.

## What This Project Does

- Register and login with JWT-based authentication
- Manage tournaments with image upload
- Create teams and enforce owner-based team management
- Allow users to join or leave teams as themselves
- Restrict manual team member management to admins
- Manage players
- Let users choose volunteer shifts and allow admins to review or clear them

## Current Security Model

### Roles

- `ROLE_USER`
- `ROLE_ADMIN`

### Team permissions

- A logged-in user can create a team
- The team creator becomes the owner
- Only the team owner or an admin can update or delete that team
- A normal user can join a team only as themselves
- A normal user can leave a team only as themselves
- A normal user cannot manually add or remove other users from a team
- Only an admin can manually add or remove other users to or from a team

### Volunteer shift permissions

- Any authenticated user can select or update their own shift
- Any authenticated user can view their own shift
- Only an admin can view all selected shifts
- Only an admin can clear another user’s shift

## Tech Stack

### Backend

- Java 17
- Spring Boot 4.0.3
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT (`jjwt`)
- MapStruct
- Lombok
- Gradle

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Context API for auth state

## Project Structure

```text
UniSportTournament/
├── README.md
├── UniSportHub-backend/
│   ├── build.gradle
│   └── src/main/
│       ├── java/org/example/unisporthubbackend/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── exception/
│       │   ├── mapper/
│       │   ├── repository/
│       │   ├── security/
│       │   └── service/
│       └── resources/
│           └── application.properties
└── UniSportHub-frontend/
    ├── package.json
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── hooks/
        ├── layouts/
        ├── pages/
        ├── router/
        └── utils/
```

## Backend Features

### Authentication

Base path: `/api/auth`

- `POST /register`
- `POST /login`

Backend returns a JWT token, and the frontend decodes it to keep user data in local storage.

### Tournaments

Base path: `/api/tournaments`

- `GET /`
- `GET /{id}`
- `POST /` admin only
- `PUT /{id}`
- `DELETE /{id}`

Notes:

- Tournament creation uses multipart form data
- Request parts: `tournament` and `image`
- Tournament update and delete endpoints exist in the backend and should be treated carefully because controller-level protection is lighter than team ownership rules

### Teams

Base path: `/api/teams`

- `GET /`
- `GET /{id}`
- `POST /`
- `PUT /{id}`
- `DELETE /{id}`
- `POST /{id}/join`
- `POST /{id}/leave`
- `POST /{id}/members/{userId}` admin only
- `DELETE /{id}/members/{userId}` admin only

Important behavior:

- Team owner is assigned automatically from the authenticated user
- Team DTO includes permission flags and ownership metadata:
  - `ownerId`
  - `ownerName`
  - `memberIds`
  - `memberCount`
  - `canManage`
  - `isMember`

### Players

Base path: `/api/players`

- `GET /`
- `GET /{teamId}`
- `POST /`
- `DELETE /{id}`

Note:

- `GET /api/players/{teamId}` returns players by team id, not player details by player id

### Volunteer Shifts

Base path: `/api/volunteer-shifts`

- `POST /` choose or update own shift
- `GET /me` get current user’s shift
- `GET /` admin gets all selected shifts
- `DELETE /{userId}` admin clears a user shift

Allowed shift values:

- `MORNING`
- `EVENING`

Example request:

```json
{
  "shift": "MORNING"
}
```

## Frontend Features

The React frontend reuses the existing JWT auth flow and Axios interceptor setup.

### Current pages

- `/dashboard`
- `/tournaments`
- `/tournaments/:id`
- `/tournaments/new`
- `/tournaments/:id/edit`
- `/teams`
- `/teams/:id`
- `/players`
- `/players/new`
- `/players/:id/edit`
- `/volunteer-shifts`

### Frontend behavior

- JWT is attached automatically through `axiosConfig.js`
- Unauthorized requests clear stored auth and redirect to `/login`
- Team pages use backend permission flags to decide which actions to show
- Volunteer Shifts page shows the admin section only for `ROLE_ADMIN`

## Getting Started

## 1. Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL

## 2. Clone the project

```bash
git clone <your-repo-url>
cd UniSportTournament
```

## 3. Database setup

Create the database:

```sql
CREATE DATABASE "UniSportHub-db";
```

## 4. Backend configuration

Current backend config file:

`UniSportHub-backend/src/main/resources/application.properties`

Current values in the repository point to:

- database: `UniSportHub-db`
- username: `postgres`
- server port: `8080`

Before production or public sharing, you should change:

- database password
- JWT signing key

Recommended properties:

```properties
spring.application.name=UniSportHub-backend
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/UniSportHub-db
spring.datasource.username=postgres
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

token.signing.key=your_base64_secret_key
```

## 5. Run the backend

Windows PowerShell:

```powershell
cd .\UniSportHub-backend
.\gradlew.bat bootRun
```

Backend URL:

`http://localhost:8080`

## 6. Run the frontend

```powershell
cd .\UniSportHub-frontend
npm install
npm run dev
```

Frontend URL:

`http://localhost:5173`

## 7. Create an admin user

Register a normal user through the app, then update the role in PostgreSQL:

```sql
UPDATE users
SET role = 'ROLE_ADMIN'
WHERE email = 'your-email@example.com';
```

## Important Files

### Backend

- `UniSportHub-backend/src/main/java/org/example/unisporthubbackend/config/SecurityConfig.java`
- `UniSportHub-backend/src/main/java/org/example/unisporthubbackend/controller/AuthController.java`
- `UniSportHub-backend/src/main/java/org/example/unisporthubbackend/controller/TournamentController.java`
- `UniSportHub-backend/src/main/java/org/example/unisporthubbackend/controller/TeamController.java`
- `UniSportHub-backend/src/main/java/org/example/unisporthubbackend/controller/PlayerController.java`
- `UniSportHub-backend/src/main/java/org/example/unisporthubbackend/controller/VolunteerShiftController.java`
- `UniSportHub-backend/src/main/java/org/example/unisporthubbackend/service/TeamService.java`

### Frontend

- `UniSportHub-frontend/src/api/axiosConfig.js`
- `UniSportHub-frontend/src/context/AuthContext.jsx`
- `UniSportHub-frontend/src/router/AppRouter.jsx`
- `UniSportHub-frontend/src/components/layout/Sidebar.jsx`
- `UniSportHub-frontend/src/pages/teams/TeamList.jsx`
- `UniSportHub-frontend/src/pages/teams/TeamDetails.jsx`
- `UniSportHub-frontend/src/pages/volunteer-shifts/VolunteerShifts.jsx`

## Known Notes

- CORS is configured for `http://localhost:5173` and `http://localhost:3000`
- Team security logic is stronger and more business-specific than tournament/player endpoints
- The frontend already contains a Volunteer Shifts page and service integrated with JWT auth
- Sensitive values are currently present in `application.properties`; move them to environment variables before deployment

## README Update Summary

This README was updated to reflect:

- current backend endpoints
- secure team ownership rules
- team join/leave and admin member management
- volunteer shifts feature
- actual frontend routes
- current local run instructions

