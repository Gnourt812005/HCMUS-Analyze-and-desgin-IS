# Multi-package build for Backend
FROM node:20-alpine

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./

# Copy shared source
COPY shared ./shared

# Copy backend source
COPY backend ./backend

# Install dependencies for all workspaces
RUN npm install

# Build shared first
RUN npm run build -w shared

EXPOSE 3001

CMD ["npm", "run", "dev", "-w", "backend"]
