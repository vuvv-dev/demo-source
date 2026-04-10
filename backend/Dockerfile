# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install Nest CLI and app dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/src/main"]
