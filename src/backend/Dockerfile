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

# Build the backend
RUN npm run build -w backend

EXPOSE 3001

# Start backend using the workspace command
CMD ["npm", "start", "-w", "backend"]
