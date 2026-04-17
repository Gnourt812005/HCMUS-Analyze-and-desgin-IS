# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands run from `src/` (the npm workspace root):

```bash
# Install all dependencies
npm install                        # from src/

# Run dev servers (two separate terminals)
npm run dev:backend                # Express on :4000
npm run dev:frontend               # Vite on :3000

# Build shared types (required before first run, or after shared/ changes)
npm run build -w shared

# Build backend for production
npm run build -w backend
```

**Reset from scratch:**
```bash
lsof -ti :4000 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
rm -rf src/frontend/node_modules/.vite
npm run build -w shared            # from src/
```

**Frontend `.env` is required** — copy from `src/frontend/.env.example` if missing:
```
VITE_API_BASE_URL=http://localhost:4000/api
```

## Architecture

This is an **npm monorepo** under `src/` with three workspaces:

```
src/
├── shared/       # @dormarch/shared — TypeScript types & enums shared across FE/BE
├── backend/      # Express + ts-node-dev, port 4000
└── frontend/     # React 19 + Vite + Tailwind CSS 4, port 3000
```

### Shared Package (`src/shared/`)

Contains all DTOs and enums used by both frontend and backend: `UserRole`, `UserDTO`, `SignInDTO`, `SignUpDTO`, `SignInResponseDTO`, `UserProfileDTO`, `ChangePasswordDTO`.

**Critical:** The Vite config aliases `@dormarch/shared` directly to the TypeScript source (`../shared/index.ts`), bypassing the CJS `dist/`. Do not remove this alias — it prevents a CJS/ESM import conflict that causes a white screen.

### Backend (`src/backend/src/`)

3-layer architecture:
- **`routes/`** — Express routers (auth, user), mounted at `/api/*`
- **`business/`** — Business logic classes (e.g. `User`)
- **`database/`** — Mock in-memory DB classes (e.g. `UserDB`) — no real database yet

Auth uses JWT (`jsonwebtoken`). Token payload contains `{ email, role }`. The `authMiddleware` validates the Bearer token on protected routes.

### Frontend (`src/frontend/src/`)

- **`api/ApiClient.ts`** — Singleton fetch wrapper; auto-attaches `Authorization: Bearer <token>` from `localStorage`, auto-rejects non-2xx responses
- **`api/AuthService.ts`** — JWT decode from `localStorage`; dispatches `auth-change` window event on login/logout
- **`components/`** — Layouts (`UserLayout`, `AdminLayout`) and sidebars
- **`pages/admin/`** — One file per admin feature; all currently use **in-memory mock data** (no API calls yet)

**Routing:** React Router v7. Admin portal lives under `/admin/*`, protected by role check (`UserRole.STAFF`). All admin routes are in `App.tsx`.

**UI conventions:** Tailwind CSS 4, Material Symbols Outlined icons (`<span className="material-symbols-outlined">`), slate/blue color palette.

## Mock Accounts

| Role | Email | Password |
|------|-------|----------|
| STAFF (admin) | `staff@gmail.com` | `staff@123` |
| GUEST | `test@gmail.com` | `test@123` |
