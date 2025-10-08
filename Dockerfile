# Use Node.js LTS version as the base image
FROM node:22-slim AS base

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

# Build stage - compile TypeScript
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Copy source code and Prisma schema
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build TypeScript code
RUN pnpm build

# Production stage - create the final image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy necessary files from previous stages
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Switch to non-root user
USER nodejs

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
