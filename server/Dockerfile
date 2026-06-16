FROM node:18-alpine AS builder
WORKDIR /app

# Install build deps
COPY server/package.json server/package-lock.json* ./
RUN npm install

# Copy source and build
COPY server/ ./
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY server/.env.example .env.example

EXPOSE 4000
CMD ["node", "dist/index.js"]
