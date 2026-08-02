FROM node:26-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 2. Dev stage: Runs the standard Vite dev server
FROM base AS dev
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# 3. Prod stage: Builds the app and serves the optimized production bundle
FROM base AS prod
RUN npm run build
# We force it to port 5173 so you don't have to change your docker-compose port mappings
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]