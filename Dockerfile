# Stage 1: Build on the native build platform
FROM --platform=$BUILDPLATFORM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Run Vite using Node.js
RUN node ./node_modules/vite/bin/vite.js build

# Stage 2: Production server
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

COPY --from=builder /app/.output ./.output

EXPOSE 8080

CMD ["node", ".output/server/index.mjs"]
