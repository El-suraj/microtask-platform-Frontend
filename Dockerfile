# Stage 1: Build the frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache bash git

# Copy package manifests
COPY package.json package-lock.json pnpm-lock.yaml ./

# Install dependencies
RUN npm ci

# Install vite globally to avoid permission issues
RUN npm install -g vite

# Copy the rest of the project
COPY . .

# Set environment variable for build
ARG VITE_DATABASE_URL
ENV VITE_DATABASE_URL=${VITE_DATABASE_URL}

# Build the frontend
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy built frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

