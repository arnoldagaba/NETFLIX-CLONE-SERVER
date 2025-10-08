# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development

```bash
# Start development server with auto-reload and TypeScript compilation
pnpm dev

# Start development server with debugger support
pnpm dev:debug

# Build TypeScript to JavaScript for production
pnpm build

# Run production build
pnpm start
```

### Database Operations

```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Create and apply database migrations
pnpm db:migrate

# Open Prisma Studio (visual database browser)
pnpm db:studio

# Reset database (WARNING: deletes all data)
pnpm db:reset
```

### Code Quality

```bash
# Format code with Biome (tab indentation, double quotes)
npx biome format --write .

# Lint code with Biome
npx biome lint .

# Check code format and lint issues
npx biome check .
```

### Docker Operations

```bash
# Build Docker image
docker build -t netflix-clone-server .

# Run container
docker run -p 3000:3000 --env-file .env netflix-clone-server
```

## Architecture Overview

This is a **Netflix Clone Backend API** built with Node.js, Express, TypeScript, and PostgreSQL. The application follows a **layered architecture pattern** with clear separation of concerns.

### Key Technologies

- **Runtime**: Node.js 22 with ESM modules
- **Framework**: Express.js 5 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk integration with JWT verification
- **External API**: TMDB (The Movie Database) integration with intelligent caching
- **Package Manager**: pnpm with workspace support
- **Code Quality**: Biome for formatting and linting
- **Logging**: Pino for structured logging

### Application Structure

```bash
src/
├── config/          # Configuration (env validation, Prisma setup)
├── controllers/     # HTTP request handlers (business logic entry points)
├── middleware/      # Request interceptors (auth, error handling, rate limiting)
├── routes/          # URL endpoint definitions and route composition
├── services/        # Core business logic and external API integration
├── types/           # TypeScript type definitions and Express extensions
├── utils/           # Shared utilities (errors, logging)
├── app.ts           # Express app configuration and middleware setup
└── index.ts         # Server startup and process management
```

### Database Schema (Prisma)

The application uses **PostgreSQL** with the following main entities:

- **User**: Clerk-synced user profiles with local storage
- **Watchlist**: User's saved content for later viewing
- **Favorites**: User's liked content
- **WatchHistory**: Tracking what users have watched
- **ShowProgress**: Episode-by-episode progress for TV shows
- **ContentCache**: TMDB API response caching to reduce external calls

All user-related tables include proper **cascading deletes** and **optimized indexes** for performance.

### Caching Strategy

The app implements **intelligent multi-layer caching**:

- **Database caching**: TMDB responses cached in PostgreSQL
- **TTL-based expiration**: Different cache durations based on content volatility
  - Movie/TV details: 7 days (stable content)
  - Trending: 6 hours (frequently changing)
  - Popular/Top Rated: 12 hours (semi-stable)
  - Now Playing: 3 hours (very dynamic)
  - Genres: 30 days (rarely changes)
  - Search queries: No caching (user-specific)

### Authentication Flow

1. **Frontend** authenticates with Clerk
2. **JWT token** sent in Authorization header: `Bearer <token>`
3. **Middleware** validates token with Clerk's JWKS endpoint
4. **User sync** creates/updates local user record automatically
5. **Protected routes** access user data via `req.user`

### API Design Patterns

- **RESTful endpoints** with consistent naming (`/api/movies`, `/api/tv`, `/api/watchlist`)
- **Standardized responses**: `{ success: boolean, data: any, error?: string }`
- **Query parameter validation** with meaningful defaults
- **Proper HTTP status codes** (200, 201, 400, 401, 404, 409, 500)
- **Rate limiting** with different tiers (general: 100/15min, auth: 5/15min, search: 30/1min)

### Error Handling Strategy

Three-layer error handling approach:

1. **Controller level**: Try-catch blocks for expected errors
2. **Custom error classes**: Structured error information with proper HTTP codes
3. **Global error handler**: Safety net for unexpected errors with request logging

## Environment Configuration

Required environment variables (see `.env.example`):

- **DATABASE_URL**: PostgreSQL connection string
- **TMDB_API_KEY**: The Movie Database API key
- **TMDB_BASE_URL**: TMDB API base URL
- **CLERK_SECRET_KEY**: Clerk authentication secret
- **CLERK_PUBLISHABLE_KEY**: Clerk public key
- **CLERK_JWKS_URL**: Clerk JWKS endpoint for token validation
- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Environment (development/production)
- **ALLOWED_ORIGINS**: CORS allowed origins (comma-separated)

## Development Patterns

### Path Mapping

The project uses **Node.js subpath imports** with `#` prefix:

- `#config/env.js` → `./src/config/env.js`
- `#controllers/movie.controller.js` → `./src/controllers/movie.controller.js`
- `#utils/logger.js` → `./src/utils/logger.js`

### Type Safety

- **Strict TypeScript configuration** with comprehensive type checking
- **Zod schemas** for runtime environment variable validation
- **Custom type definitions** for TMDB API responses and Express extensions
- **Prisma generated types** for database operations

### Code Quality Standards

- **Biome configuration**: Tab indentation, double quotes, auto import organization
- **ESLint-style rules** with Biome's recommended ruleset
- **Consistent error handling** patterns across controllers
- **Structured logging** with request correlation and performance metrics

## Testing and Debugging

### API Testing

```bash
# Health check
curl http://localhost:3000/health

# Public endpoints (no auth)
curl http://localhost:3000/api/movies/trending
curl http://localhost:3000/api/movies/popular
curl http://localhost:3000/api/tv/genres

# Protected endpoints (requires Bearer token)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/user/profile
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/watchlist
```

### Database Inspection

```bash
# Connect to database via Prisma Studio
pnpm db:studio

# Generate fresh Prisma client
pnpm db:generate

# View migration status
npx prisma migrate status
```

### Debugging

- **Development server**: Automatic restart on file changes with `tsx watch`
- **Debug mode**: `pnpm dev:debug` enables Node.js inspector on port 9229
- **Structured logging**: All requests logged with correlation IDs via Pino
- **Error tracking**: Comprehensive error logging with stack traces

## Deployment Considerations

### Production Build

```bash
# Install production dependencies only
npm ci --only=production

# Build TypeScript
pnpm build

# Start production server
pnpm start
```

### Docker Deployment

- **Multi-stage build** for optimized image size
- **Non-root user** for security
- **Alpine Linux** base for minimal attack surface
- **Build artifacts** only (no source code in final image)

### Database Migrations

```bash
# Deploy migrations to production
npx prisma migrate deploy

# Generate Prisma client for production
npx prisma generate
```

## Key Integration Points

### TMDB Service Layer

- **Centralized API client** with automatic caching
- **Error handling** for rate limits and API failures  
- **Response transformation** for consistent data shapes
- **Image URL helpers** for frontend poster/backdrop construction

### Clerk Authentication

- **Automatic user sync** on first authenticated request
- **JWT verification** via Clerk's public key infrastructure
- **User profile management** with local database storage
- **Session management** handled entirely by Clerk

### Database Performance

- **Connection pooling** managed by Prisma
- **Optimized indexes** on frequently queried fields (userId, clerkId, tmdbId)
- **Cascading deletes** for data consistency
- **Composite unique constraints** to prevent duplicate entries

This architecture supports a **production-ready Netflix clone** with proper authentication, caching, error handling, and scalability considerations.
