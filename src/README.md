# DormArch Project

Dormitory Management System built with React, Node.js (Express), and PostgreSQL (Supabase).

## Quick Start

### 1. Environment Setup
Create a `.env` file in `src/backend/` with the following variables:
```env
PORT=3001
JWT_SECRET=your_jwt_secret
SUPABASE_URI=your_postgresql_uri
```

### 2. Run with Docker
Ensure you have Docker and Docker Compose installed, then run:
```bash
cd src
docker-compose up --build
```
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### 3. Local Development (without Docker)
If you prefer running locally:
```bash
cd src
npm install
npm run dev:backend   # Starts backend
npm run dev:frontend  # Starts frontend
```

## Architecture
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Shared**: Common DTOs and Utilities shared between frontend and backend.
- **Database**: PostgreSQL (Supabase)
