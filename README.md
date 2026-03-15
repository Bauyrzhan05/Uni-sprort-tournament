# 🏆 UniSportHub

<div align="center">

![UniSportHub Banner](https://img.shields.io/badge/UniSportHub-Tournament%20Management-0ea5e9?style=for-the-badge&logo=trophy&logoColor=white)

**University Sports Tournament Management System**

A full-stack web application for managing university sports tournaments, teams, and players.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Docs](#-api-endpoints) · [Project Structure](#-project-structure)

</div>

---

## 📸 Screenshots

| Dashboard | Tournaments | Teams |
|-----------|-------------|-------|
| Stats, recent tournaments, team overview | Card grid with images, sport badges | Player roster, tournament assignment |

---

## ✨ Features

- 🔐 **JWT Authentication** — Register / Login with role-based access (`ROLE_USER`, `ROLE_ADMIN`)
- 🏆 **Tournament Management** — Create (with image upload), edit, delete, view details
- 🛡 **Team Management** — Create teams, assign to tournaments, manage inline
- 👥 **Player Management** — Add players to teams, filter by team
- 🖼 **Image Upload** — Tournament cover images served as static resources
- 📱 **Responsive UI** — Works on desktop and mobile
- 🌙 **Dark Theme** — Deep navy design system throughout

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 3.x | Framework |
| Spring Security | 6.x | Authentication & Authorization |
| JWT (jjwt) | 0.12 | Token generation & validation |
| PostgreSQL | 15 | Database |
| Spring Data JPA | — | ORM |
| MapStruct | — | DTO mapping |
| Lombok | — | Boilerplate reduction |
| Gradle | 9.x | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI Framework |
| Vite | 5.x | Build tool & dev server |
| React Router | 6 | Client-side routing |
| Axios | — | HTTP client + JWT interceptor |
| Tailwind CSS | 3 | Utility-first styling |
| Context API + useReducer | — | Auth state management |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/UniSportHub.git
cd UniSportHub
```

---

### 2. Backend setup

#### Create PostgreSQL database

```sql
CREATE DATABASE "UniSportHub-db";
```

#### Configure application properties

```bash
cd UniSportHub-backend/src/main/resources
cp application.properties.example application.properties
```

Edit `application.properties`:

```properties
spring.application.name=UniSportHub-backend
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/UniSportHub-db
spring.datasource.username=your_postgres_username
spring.datasource.password=your_postgres_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Generate a strong key: openssl rand -base64 32
token.signing.key=your_secret_key_here
```

#### Run the backend

```bash
cd UniSportHub-backend
./gradlew bootRun
```

Backend starts at → `http://localhost:8080`

---

### 3. Frontend setup

```bash
cd UniSportHub-frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=UniSportHub
VITE_TOKEN_KEY=unisport_token
VITE_USER_KEY=unisport_user
VITE_IMAGE_BASE_URL=http://localhost:8080
```

Install dependencies and run:

```bash
npm install
npm run dev
```

Frontend starts at → `http://localhost:5173`

---

### 4. Create first Admin user

Register normally through the UI, then update the role directly in the database:

```sql
UPDATE users SET role = 'ROLE_ADMIN' WHERE email = 'your@email.com';
```

> Only `ROLE_ADMIN` users can create tournaments (with image upload).

---

## 📁 Project Structure

```
UniSportHub/
│
├── 📂 UniSportHub-backend/
│   └── src/main/java/org/example/unisporthubbackend/
│       ├── config/
│       │   ├── SecurityConfig.java        # JWT filter chain, CORS
│       │   └── WebConfig.java             # Static resource handler (/uploads/**)
│       ├── controller/
│       │   ├── AuthController.java        # POST /api/auth/login, /register
│       │   ├── TournamentController.java  # CRUD /api/tournaments
│       │   ├── TeamController.java        # CRUD /api/teams
│       │   └── PlayerController.java      # CRUD /api/players
│       ├── dto/
│       │   ├── TournamentDto.java
│       │   ├── TeamDto.java
│       │   ├── PlayerDto.java
│       │   ├── AuthResponse.java          # { token }
│       │   ├── LoginRequest.java          # { email, password }
│       │   └── RegisterRequest.java       # { username, email, password }
│       ├── entity/
│       │   ├── Tournament.java
│       │   ├── Team.java
│       │   ├── Player.java
│       │   ├── User.java
│       │   └── Role.java                  # ROLE_USER, ROLE_ADMIN
│       ├── mapper/                        # MapStruct mappers
│       ├── repository/                    # JPA repositories
│       ├── security/
│       │   ├── JwtService.java            # Token generation & validation
│       │   └── JwtAuthenticationFilter.java
│       └── service/
│           ├── AuthService.java
│           ├── TournamentService.java
│           ├── TeamService.java
│           ├── PlayerService.java
│           └── ImageService.java          # Saves images to /uploads/tournaments/
│
└── 📂 UniSportHub-frontend/
    └── src/
        ├── api/
        │   ├── axiosConfig.js             # Axios instance + JWT interceptor
        │   ├── authService.js             # Login, register, JWT decode
        │   ├── tournamentService.js       # Tournament CRUD (multipart POST)
        │   ├── teamService.js             # Team CRUD
        │   └── playerService.js           # Player CRUD
        ├── components/
        │   ├── common/                    # Button, Input, Modal, Loader, Badge...
        │   └── layout/                    # Sidebar, Navbar, Footer
        ├── context/
        │   └── AuthContext.jsx            # JWT auth state (Context + Reducer)
        ├── hooks/
        │   ├── useAuth.js
        │   └── useFetch.js                # Generic data-fetching hook
        ├── layouts/
        │   ├── MainLayout.jsx             # Sidebar + Navbar shell
        │   └── AuthLayout.jsx             # Centered auth shell
        ├── pages/
        │   ├── auth/                      # Login, Register
        │   ├── dashboard/                 # Dashboard
        │   ├── tournaments/               # List, Details, Create/Edit
        │   ├── teams/                     # List, Details
        │   └── players/                   # List
        ├── router/
        │   ├── AppRouter.jsx              # Full route tree
        │   └── ProtectedRoute.jsx         # JWT-gated routes
        └── utils/
            ├── constants.js               # Env vars, endpoints, enums
            └── helpers.js                 # formatDate, getImageUrl, formatPrize...
```

---

## 📡 API Endpoints

### Authentication — `/api/auth`
| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| `POST` | `/api/auth/register` | `{ username, email, password }` | `{ token }` | ❌ Public |
| `POST` | `/api/auth/login` | `{ email, password }` | `{ token }` | ❌ Public |

### Tournaments — `/api/tournaments`
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| `GET` | `/api/tournaments` | — | ✅ Any |
| `GET` | `/api/tournaments/{id}` | — | ✅ Any |
| `POST` | `/api/tournaments` | `multipart: tournament (JSON) + image (File)` | 🔒 ADMIN |
| `PUT` | `/api/tournaments/{id}` | `TournamentDto (JSON)` | ✅ Any |
| `DELETE` | `/api/tournaments/{id}` | — | ✅ Any |

### Teams — `/api/teams`
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| `GET` | `/api/teams` | — | ✅ Any |
| `GET` | `/api/teams/{id}` | — | ✅ Any |
| `POST` | `/api/teams` | `{ teamName, tournamentId? }` | ✅ Any |
| `PUT` | `/api/teams/{id}` | `{ teamName }` | ✅ Any |
| `DELETE` | `/api/teams/{id}` | — | ✅ Any |

### Players — `/api/players`
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| `GET` | `/api/players` | — | ✅ Any |
| `GET` | `/api/players/{teamId}` | — | ✅ Any |
| `POST` | `/api/players` | `{ fullName, teamId? }` | ✅ Any |
| `DELETE` | `/api/players/{id}` | — | ✅ Any |

> ⚠️ `GET /api/players/{teamId}` — returns players **filtered by team**, not a single player by ID.

---

## 🔐 Authentication Flow

```
User → POST /api/auth/login { email, password }
     ← { token: "eyJ..." }

Frontend → decodes JWT payload → extracts { id, email, username, role }
         → saves to localStorage
         → attaches "Authorization: Bearer <token>" to every request

Protected route → Spring Security validates JWT
               → @PreAuthorize checks role
```

---

## ⚙️ Environment Variables

### Backend — `application.properties`
| Variable | Description |
|---|---|
| `spring.datasource.url` | PostgreSQL connection URL |
| `spring.datasource.username` | DB username |
| `spring.datasource.password` | DB password |
| `token.signing.key` | JWT signing secret (Base64) |
| `server.port` | Server port (default: 8080) |

### Frontend — `.env`
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_IMAGE_BASE_URL` | Backend base URL for images |
| `VITE_TOKEN_KEY` | localStorage key for JWT |
| `VITE_USER_KEY` | localStorage key for user object |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m "feat: add your feature"`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👤 Author

**Erman Bauyrzhan** — University Sports Tournament Management System

---

<div align="center">
  <sub>Built with ☕ Java + ⚛️ React</sub>
</div>
