FROM node:18-alpine AS builder
WORKDIR /app

COPY server/package.json server/package-lock.json* ./
RUN npm install

COPY server/ ./
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY .env.example .env.example

EXPOSE 4000
CMD ["node", "dist/index.js"]