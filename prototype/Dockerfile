FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose Vite dev server port (default 5173)
EXPOSE 5173

# Run vite with --host to allow external access
CMD ["npm", "run", "dev", "--", "--host"]
