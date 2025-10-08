# Use Node.js LTS version as the base image
FROM node:22-slim AS base

# Install dependencies only when needed
FROM base AS deps
# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage - compile TypeScript
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code and Prisma schema
COPY . .

# Generate Prisma Client before building TypeScript
# This creates the Prisma client code that your TypeScript code imports
RUN npx prisma generate

# Build TypeScript code
# This assumes your build script is in package.json
RUN npm run build

# Production stage - create the final image
FROM base AS runner
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy only necessary files from previous stages
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose the port your app runs on (adjust if different)
EXPOSE 3000

# Start the application
# Adjust this command based on your start script in package.json
CMD ["node", "dist/index.js"]