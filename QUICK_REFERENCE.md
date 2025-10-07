# Quick Reference - Netflix Clone Backend

## Common Commands

```bash
# Development
npm run dev                  # Start dev server with auto-reload

# Database
npm run prisma:generate      # Generate Prisma client
npm run prisma:migrate      # Run database migrations
npm run prisma:studio       # Open database GUI

# Production
npm run build               # Compile TypeScript
npm start                   # Run compiled code
```

---

## API Endpoints Quick List

### Movies

- `GET /api/movies/trending?timeWindow=week`
- `GET /api/movies/popular?page=1`
- `GET /api/movies/top-rated`
- `GET /api/movies/now-playing`
- `GET /api/movies/upcoming`
- `GET /api/movies/genres`
- `GET /api/movies/search?query=inception`
- `GET /api/movies/discover?with_genres=28`
- `GET /api/movies/:id`
- `GET /api/movies/:id/credits`
- `GET /api/movies/:id/videos`
- `GET /api/movies/:id/similar`

### TV Shows

- `GET /api/tv/trending?timeWindow=week`
- `GET /api/tv/popular`
- `GET /api/tv/top-rated`
- `GET /api/tv/:id`
- (All other endpoints mirror movies)

### User (Requires Auth)

- `GET /api/user/profile`
- `POST /api/user/sync`

### Watchlist (Requires Auth)

- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/:id`
- `GET /api/watchlist/check?tmdbId=550&contentType=movie`

### Favorites (Requires Auth)

- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:id`
- `GET /api/favorites/check?tmdbId=550&contentType=movie`

---

## Response Format

### Success

```json
{
  "success": true,
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (no/invalid auth)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Adding Auth to Requests

```javascript
// Axios
axios.get('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Fetch
fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## TMDB Image URLs

```javascript
// Poster
`https://image.tmdb.org/t/p/w500${posterPath}`

// Backdrop
`https://image.tmdb.org/t/p/w1280${backdropPath}`

// Sizes: w92, w154, w185, w342, w500, w780, original
```

---

## Common Movie/TV Object Structure

```typescript
{
  id: number,
  title: string,              // or 'name' for TV
  overview: string,
  poster_path: string,
  backdrop_path: string,
  release_date: string,       // or 'first_air_date' for TV
  vote_average: number,
  vote_count: number,
  popularity: number,
  genre_ids: number[]
}
```

---

## Genres

### Movies

- 28: Action
- 12: Adventure  
- 16: Animation
- 35: Comedy
- 80: Crime
- 99: Documentary
- 18: Drama
- 10751: Family
- 14: Fantasy
- 36: History
- 27: Horror
- 10402: Music
- 9648: Mystery
- 10749: Romance
- 878: Science Fiction
- 10770: TV Movie
- 53: Thriller
- 10752: War
- 37: Western

### TV Shows

- 10759: Action & Adventure
- 16: Animation
- 35: Comedy
- 80: Crime
- 99: Documentary
- 18: Drama
- 10751: Family
- 10762: Kids
- 9648: Mystery
- 10763: News
- 10764: Reality
- 10765: Sci-Fi & Fantasy
- 10766: Soap
- 10767: Talk
- 10768: War & Politics
- 37: Western

---

## Rate Limits

- General API: 100 requests / 15 minutes
- Authentication: 5 requests / 15 minutes
- Search: 30 requests / 1 minute

---

## Cache Durations

- Movie/TV details: 7 days
- Trending: 6 hours
- Popular/Top Rated: 12 hours
- Now Playing: 3 hours
- Genres: 30 days
- Search: No cache

---

## Troubleshooting

### Server won't start

1. Check .env file exists and has all variables
2. Check PostgreSQL is running
3. Check port 3000 isn't already in use

### Database errors

1. Run `npx prisma generate`
2. Run `npx prisma migrate dev`
3. Check DATABASE_URL is correct

### Authentication errors

1. Check CLERK_SECRET_KEY is set
2. Check token is being sent in header
3. Check token format: `Bearer <token>`

### TMDB errors

1. Check TMDB_API_KEY is set
2. Check key is valid
3. Check you haven't exceeded API quota

---

## Project File Locations

- Environment vars: `.env`
- Database schema: `prisma/schema.prisma`
- Main server: `src/index.ts`
- Routes: `src/routes/*.routes.ts`
- Controllers: `src/controllers/*.controller.ts`
- Services: `src/services/*.service.ts`
- Types: `src/types/*.types.ts`
