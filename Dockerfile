# Multi-stage Dockerfile for Next.js app (production)

FROM node:20-bullseye-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies (production only) to keep runtime image small
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Build the app
FROM base AS builder
# copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure build uses production mode for assets
RUN npm run build

# Production image
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built assets and production node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

# Create non-root user
RUN groupadd -r nextgroup && useradd --no-log-init -r -g nextgroup nextuser && chown -R nextuser:nextgroup /app
USER nextuser

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "start"]
