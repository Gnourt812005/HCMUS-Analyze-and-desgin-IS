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

EXPOSE 3000

CMD ["npm", "run", "dev", "-w", "frontend"]
