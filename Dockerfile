# syntax=docker/dockerfile:1.7

# Stage 1: Build on the native build platform (JS output is platform-independent)
FROM --platform=$BUILDPLATFORM oven/bun:1.4.4 AS builder

WORKDIR /app

# Build metadata + public build-time Vite variables.
# Vite inlines VITE_* values at build time, so they must be passed here as
# --build-arg; passing them to `docker run -e` has no effect.
ARG BUILD_ID=dev
ARG GIT_SHA=unknown
ARG VITE_API_BASE_URL=
ARG VITE_FRONTEND_URL=

# Install dependencies first so this layer stays cached when only source changes.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Generated output is excluded by .dockerignore; this is a second safety net.
COPY . .
RUN rm -rf .output .vercel

# Build a self-hosted Node server. NITRO_PRESET=node-server is required:
# the default "vercel" preset writes to .vercel/output, which is NOT what the
# runtime stage copies. Fail the build if the expected artifacts are missing.
RUN NITRO_PRESET=node-server \
    VITE_API_BASE_URL="$VITE_API_BASE_URL" \
    VITE_FRONTEND_URL="$VITE_FRONTEND_URL" \
    node ./node_modules/vite/bin/vite.js build \
 && node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('.output/nitro.json','utf8'));if(p.preset!=='node-server')throw new Error('Expected node-server output, got: '+p.preset);if(!fs.existsSync('.output/server/index.mjs'))throw new Error('Missing .output/server/index.mjs');console.log('Build verified: preset='+p.preset+' entry='+p.serverEntry)" \
 && printf '{"buildId":"%s","gitSha":"%s"}\n' "$BUILD_ID" "$GIT_SHA" > .output/build-info.json

# Stage 2: Production server
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8081

ARG BUILD_ID=dev
ARG GIT_SHA=unknown
ENV APP_BUILD_ID=$BUILD_ID
ENV APP_GIT_SHA=$GIT_SHA

LABEL org.opencontainers.image.title="grahaura-main-site" \
      org.opencontainers.image.version="$BUILD_ID" \
      org.opencontainers.image.revision="$GIT_SHA"

COPY --from=builder /app/.output ./.output

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8081)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
