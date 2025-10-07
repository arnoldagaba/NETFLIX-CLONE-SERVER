# Netflix Clone API Documentation

## Base URL

```bash
http://localhost:3000
```

## Authentication

Most user-specific endpoints require authentication. Include the Clerk JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

---

## 📍 Health Check

### GET /health

Check if the API is running.

**Response:**

```json
{
  "status": "ok",
  "message": "Netflix Clone API is running!",
  "timestamp": "2025-10-07T..."
}
```

---

## 👤 User Endpoints

### GET /api/user/profile

Get the current user's profile. **Requires authentication.**

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "clerkId": "clerk_456",
    "email": "user@example.com",
    "username": "moviefan",
    "imageUrl": "https://...",
    "createdAt": "2025-01-01T...",
    "updatedAt": "2025-01-01T..."
  }
}
```

### POST /api/user/sync

Sync user profile with Clerk. **Requires authentication.**

---

## 🎬 Movie Endpoints

### GET /api/movies/trending

Get trending movies.

**Query Parameters:**

- `timeWindow` (optional): "day" or "week" (default: "week")

**Response:**

```json
{
  "success": true,
  "data": {
    "page": 1,
    "results": [...],
    "total_pages": 100,
    "total_results": 2000
  }
}
```

### GET /api/movies/popular

Get popular movies.

**Query Parameters:**

- `page` (optional): Page number (default: 1)

### GET /api/movies/top-rated

Get top rated movies.

**Query Parameters:**

- `page` (optional): Page number (default: 1)

### GET /api/movies/now-playing

Get movies currently in theaters.

**Query Parameters:**

- `page` (optional): Page number (default: 1)

### GET /api/movies/upcoming

Get upcoming movies.

**Query Parameters:**

- `page` (optional): Page number (default: 1)

### GET /api/movies/:id

Get detailed information about a specific movie.

**Example:** `/api/movies/550` (Fight Club)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 550,
    "title": "Fight Club",
    "overview": "...",
    "runtime": 139,
    "budget": 63000000,
    "revenue": 100853753,
    "genres": [...],
    "release_date": "1999-10-15",
    ...
  }
}
```

### GET /api/movies/:id/credits

Get cast and crew for a movie.

**Example:** `/api/movies/550/credits`

### GET /api/movies/:id/videos

Get trailers and videos for a movie.

**Example:** `/api/movies/550/videos`

### GET /api/movies/:id/similar

Get similar movies.

**Query Parameters:**

- `page` (optional): Page number (default: 1)

### GET /api/movies/:id/recommendations

Get recommended movies based on a movie.

**Query Parameters:**

- `page` (optional): Page number (default: 1)

### GET /api/movies/search

Search for movies.

**Query Parameters:**

- `query` (required): Search query
- `page` (optional): Page number (default: 1)

**Example:** `/api/movies/search?query=inception`

### GET /api/movies/discover

Discover movies with filters.

**Query Parameters:**

- `with_genres` (optional): Comma-separated genre IDs (e.g., "28,12")
- `year` (optional): Release year
- `sort_by` (optional): Sort order (default: "popularity.desc")
- `page` (optional): Page number (default: 1)

**Example:** `/api/movies/discover?with_genres=28,12&year=2023&sort_by=vote_average.desc`

### GET /api/movies/genres

Get list of all movie genres.

**Response:**

```json
{
  "success": true,
  "data": [
    { "id": 28, "name": "Action" },
    { "id": 12, "name": "Adventure" },
    { "id": 35, "name": "Comedy" },
    ...
  ]
}
```

---

## 📺 TV Show Endpoints

All TV show endpoints follow the same pattern as movie endpoints but use `/api/tv` instead of `/api/movies`.

### Available Endpoints

- `GET /api/tv/trending?timeWindow=week`
- `GET /api/tv/popular?page=1`
- `GET /api/tv/top-rated?page=1`
- `GET /api/tv/:id` - Get TV show details
- `GET /api/tv/:id/credits` - Get cast and crew
- `GET /api/tv/:id/videos` - Get trailers and videos
- `GET /api/tv/:id/similar?page=1`
- `GET /api/tv/:id/recommendations?page=1`
- `GET /api/tv/search?query=breaking+bad`
- `GET /api/tv/discover?with_genres=18&sort_by=popularity.desc`
- `GET /api/tv/genres`

---

## 📝 Watchlist Endpoints

All watchlist endpoints **require authentication**.

### GET /api/watchlist

Get the user's complete watchlist.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "watchlist_123",
      "userId": "user_456",
      "tmdbId": 550,
      "contentType": "movie",
      "title": "Fight Club",
      "posterPath": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "note": "Must watch this weekend",
      "addedAt": "2025-01-05T..."
    },
    ...
  ]
}
```

### POST /api/watchlist

Add an item to the watchlist.

**Request Body:**

```json
{
  "tmdbId": 550,
  "contentType": "movie",
  "title": "Fight Club",
  "posterPath": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "note": "Optional personal note"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Added to watchlist successfully",
  "data": { ... }
}
```

### DELETE /api/watchlist/:id

Remove an item from the watchlist.

**Example:** `DELETE /api/watchlist/watchlist_123`

### GET /api/watchlist/check

Check if an item is in the watchlist.

**Query Parameters:**

- `tmdbId` (required): TMDB ID of the content
- `contentType` (required): "movie" or "tv"

**Example:** `/api/watchlist/check?tmdbId=550&contentType=movie`

**Response:**

```json
{
  "success": true,
  "inWatchlist": true,
  "data": { ... }
}
```

---

## ⭐ Favorites Endpoints

All favorites endpoints **require authentication**. The structure is identical to watchlist endpoints.

- `GET /api/favorites` - Get all favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites
- `GET /api/favorites/check?tmdbId=550&contentType=movie` - Check favorite status

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Not permitted to access resource
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource already exists (e.g., duplicate watchlist item)
- `500 Internal Server Error` - Server error

---

## Rate Limiting & Caching

The API implements intelligent caching to reduce TMDB API calls:

- **Movie/TV details**: Cached for 7 days
- **Trending content**: Cached for 6 hours
- **Popular/Top rated**: Cached for 12 hours
- **Now playing**: Cached for 3 hours
- **Genres**: Cached for 30 days
- **Search results**: Not cached (unique queries)

---

## Image URLs

TMDB returns image paths like `/abc123.jpg`. To display images, construct the full URL:

```bash
https://image.tmdb.org/t/p/{size}{path}
```

**Available sizes:**

- Poster: w92, w154, w185, w342, w500, w780, original
- Backdrop: w300, w780, w1280, original

**Example:**

```bash
https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg
```
