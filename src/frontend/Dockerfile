FROM node:20-alpine

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./

# Copy shared source
COPY shared ./shared

# Copy frontend source
COPY frontend ./frontend

# Install dependencies
RUN npm install

# Build shared first
RUN npm run build -w shared

# Build the frontend
RUN npm run build -w frontend

EXPOSE 3000

# Run using npm start (which aliases to vite preview)
CMD ["npm", "start", "-w", "frontend"]
