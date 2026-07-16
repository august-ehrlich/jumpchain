FROM node:26-alpine

WORKDIR /app

# Copy dependency definitions first
COPY package*.json ./

# Install packages inside the container
RUN npm install

# Copy application source code
COPY . .
