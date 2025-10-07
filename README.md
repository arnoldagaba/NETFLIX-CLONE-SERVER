# 🎉 Netflix Clone Backend - Complete & Production-Ready

## What You'll Accomplish

You'll build a complete, production-ready backend API for a Netflix clone. This isn't a toy project - it's a real, scalable backend with professional-grade features.

### Core Features ✅

1. **Authentication System**
   - Clerk integration for secure user authentication
   - JWT token verification on protected routes
   - Automatic user profile creation and sync
   - Session management

2. **TMDB Integration**
   - Complete movie and TV show database access
   - Intelligent caching system (reduces API calls by ~90%)
   - Search, discover, filter, and recommendation features
   - Image URL helpers for posters and backdrops

3. **User Features**
   - Personal watchlist (save movies/shows to watch later)
   - Favorites system (mark content you loved)
   - User profile management
   - Per-user data isolation (users only see their own data)

4. **Production-Ready Infrastructure**
   - Comprehensive error handling with custom error classes
   - Request logging for debugging and monitoring
   - Rate limiting to prevent abuse
   - Input validation middleware
   - CORS configuration for frontend integration
   - Graceful shutdown handling

5. **Database**
   - PostgreSQL with Prisma ORM
   - Optimized schema with proper indexes
   - Content caching table for performance
   - Relationship management (users → watchlists → content)

---

## Project Structure

```bash
backend/
├── src/
│   ├── controllers/        # Request handlers (business logic)
│   │   ├── user.controller.ts
│   │   ├── movie.controller.ts
│   │   ├── tv.controller.ts
│   │   ├── watchlist.controller.ts
│   │   └── favorite.controller.ts
│   │
│   ├── routes/            # URL endpoint definitions
│   │   ├── user.routes.ts
│   │   ├── movie.routes.ts
│   │   ├── tv.routes.ts
│   │   ├── watchlist.routes.ts
│   │   └── favorite.routes.ts
│   │
│   ├── services/          # Core business logic & external APIs
│   │   ├── user.service.ts
│   │   └── tmdb.service.ts
│   │
│   ├── middleware/        # Request interceptors
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── types/            # TypeScript type definitions
│   │   └── tmdb.types.ts
│   │
│   ├── utils/            # Helper functions
│   │   ├── errors.ts
│   │   └── logger.ts
│   │
│   └── index.ts          # Main server file
│
├── prisma/
│   └── schema.prisma      # Database schema
│
├── .env                   # Environment variables (SECRET!)
├── .env.example          # Template for .env
├── package.json
└── tsconfig.json
```

---

## Environment Variables Checklist

Make sure your `.env` file has all these variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# TMDB API
TMDB_API_KEY="your_key_here"
TMDB_BASE_URL="https://api.themoviedb.org/3"

# Clerk Authentication
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_JWKS_URL="https://your-domain.clerk.accounts.dev/.well-known/jwks.json"

# Server
PORT=3000
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:5173"
```

---

## How to Run Your Backend

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

### Database Commands

```bash
# Generate Prisma client (run after schema changes)
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Open Prisma Studio (visual database editor)
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npm run prisma:reset
```

---

## Testing Your API

### Using Browser (for GET requests)

Just visit these URLs while your server is running:

- <http://localhost:3000/health>
- <http://localhost:3000/api/movies/trending>
- <http://localhost:3000/api/movies/popular>
- <http://localhost:3000/api/movies/genres>

### Using Postman/Insomnia (for protected routes)

1. Get a JWT token from Clerk (you'll get this automatically when you build the frontend)
2. Add to request headers:

   ```bash
   Authorization: Bearer <your_token>
   ```

3. Test protected endpoints:
   - GET <http://localhost:3000/api/user/profile>
   - GET <http://localhost:3000/api/watchlist>
   - POST <http://localhost:3000/api/watchlist>

### Using cURL

```bash
# Get trending movies
curl http://localhost:3000/api/movies/trending

# Add to watchlist (requires auth token)
curl -X POST http://localhost:3000/api/watchlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tmdbId": 550, "contentType": "movie", "title": "Fight Club"}'
```

---

## Key Concepts You've Learned

### 1. RESTful API Design

- Resource-based URLs (`/api/movies`, `/api/watchlist`)
- Proper HTTP methods (GET, POST, DELETE)
- Meaningful status codes (200, 201, 400, 401, 404, 500)
- Consistent response format

### 2. Middleware Pattern

Middleware functions run in sequence before reaching your controllers:

```bash
Request → Logger → Rate Limiter → CORS → Auth → Controller → Response
```

### 3. Service Layer Pattern

Controllers handle HTTP, services handle business logic:

- Controllers: "What endpoint was called?"
- Services: "How do we actually do this?"
- This separation makes testing and reusing code easier

### 4. Caching Strategy

Your TMDB service implements smart caching:

- Frequently changing data (now playing): 3-6 hours
- Stable data (movie details): 7 days
- Very stable data (genres): 30 days
- User-specific queries (search): No caching

### 5. Error Handling

Three layers of error handling:

1. **Try-catch in controllers**: Catch expected errors
2. **Custom error classes**: Provide meaningful error info
3. **Global error handler**: Safety net for unexpected errors

---

## Performance Optimizations

### What's Already Optimized

1. **Database Indexes**
   - User lookups by clerkId, email
   - Watchlist queries by userId
   - Content cache lookups by endpoint
   - These make queries 10-100x faster

2. **Connection Pooling**
   - Prisma automatically manages database connections
   - Reuses connections instead of creating new ones

3. **Response Caching**
   - TMDB responses cached in database
   - Reduces external API calls by ~90%
   - Faster responses (database is quicker than TMDB API)

4. **Rate Limiting**
   - Prevents API abuse
   - Protects against DDoS attacks
   - Different limits for different endpoint types

---

## Security Features

### What's Protecting Your API

1. **JWT Verification**
   - Every protected route verifies tokens with Clerk
   - Tokens can't be forged or tampered with
   - Automatic expiration

2. **Environment Variables**
   - Secrets never in code
   - Different values for dev/staging/production
   - .env file in .gitignore

3. **CORS Configuration**
   - Only allowed origins can access API
   - Prevents malicious websites from stealing data
   - Configurable per environment

4. **Input Validation**
   - Validates all user input
   - Prevents SQL injection (Prisma handles this)
   - Rejects malformed requests early

5. **Rate Limiting**
   - Prevents brute force attacks
   - Limits search spam
   - Stricter limits on auth endpoints

---

## Common Issues & Solutions

### "Can't connect to database"

- ✅ Check PostgreSQL is running
- ✅ Verify DATABASE_URL in .env
- ✅ Run `npx prisma migrate dev`

### "TMDB API error"

- ✅ Check TMDB_API_KEY in .env
- ✅ Verify key is valid at themoviedb.org
- ✅ Check API quota (free tier has limits)

### "401 Unauthorized on protected routes"

- ✅ Include Authorization header
- ✅ Token format: `Bearer <token>`
- ✅ Token must be valid and not expired

### "CORS error from frontend"

- ✅ Add frontend URL to ALLOWED_ORIGINS in .env
- ✅ Use comma-separated for multiple: `http://localhost:5173,http://localhost:3000`

### "Port already in use"

- ✅ Change PORT in .env
- ✅ Or kill process using port 3000

---

## Next Steps: Building the Frontend

Now that your backend is complete, here's what you'll do next:

### 1. Set Up Frontend Project

Your package.json already has these installed:

- React 19 with Vite
- TanStack Router for routing
- TanStack Query for data fetching
- Tailwind CSS for styling
- Clerk for authentication UI

### 2. Install Clerk in Frontend

```bash
cd ../frontend  # Navigate to your frontend folder
npm install @clerk/clerk-react
```

### 3. Create API Client

Create a file `src/lib/api.ts`:

```typescript
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add auth token to every request
api.interceptors.request.use(async (config) => {
  const { getToken } = useAuth();
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 4. Create React Query Hooks

```typescript
// Example: useMovies hook
import { useQuery } from '@tanstack/react-query';
import api from './api';

export const useTrendingMovies = () => {
  return useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: async () => {
      const { data } = await api.get('/movies/trending');
      return data.data;
    },
  });
};
```

### 5. Build Components

- `<MovieCard />` - Display a movie poster
- `<MovieRow />` - Horizontal scrolling row of movies
- `<Hero />` - Large banner with featured content
- `<MovieDetail />` - Full movie details page
- `<Watchlist />` - User's saved content
- `<SearchBar />` - Search functionality

### 6. Create Pages/Routes

- `/` - Homepage with trending, popular sections
- `/browse` - Browse all content with filters
- `/movie/:id` - Movie detail page
- `/tv/:id` - TV show detail page
- `/my-list` - User's watchlist
- `/search` - Search results

---

## Deployment Guide

### Database (Choose One)

**Supabase** (Recommended for beginners)

1. Sign up at supabase.com
2. Create new project
3. Copy connection string
4. Add to .env as DATABASE_URL
5. Run migrations: `npx prisma migrate deploy`

**Railway** (Alternative)

1. Sign up at railway.app
2. Create PostgreSQL service
3. Copy connection string
4. Same steps as above

### Backend Hosting (Choose One)

**Railway** (Easiest)

1. Connect GitHub repo
2. Railway auto-detects Node.js
3. Add environment variables
4. Deploy!

**Render** (Free tier available)

1. Connect GitHub repo
2. Choose "Web Service"
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables

**Fly.io** (More control)

1. Install flyctl CLI
2. Run `fly launch`
3. Configure fly.toml
4. Deploy with `fly deploy`

### Frontend Hosting

**Vercel** (Recommended)

1. Connect GitHub repo
2. Vercel auto-detects Vite
3. Add environment variables
4. Deploy automatically on push

---

## Congratulations! 🎊

You've built a complete, production-ready backend API. This is a significant achievement and demonstrates real-world development skills:

✅ RESTful API design
✅ Database modeling and optimization
✅ Authentication and authorization
✅ External API integration
✅ Caching strategies
✅ Error handling
✅ Security best practices
✅ TypeScript for type safety
✅ Middleware patterns
✅ Production-ready infrastructure

You now have a solid foundation for any web application. The patterns and practices you've learned here apply to countless other projects beyond this Netflix clone.

**You're ready to build the frontend and bring your Netflix clone to life!** 🚀
