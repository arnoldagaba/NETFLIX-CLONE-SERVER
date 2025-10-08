import { Router } from "express";
import {
	discoverMovies,
	getMovieCredits,
	getMovieDetails,
	getMovieGenres,
	getMovieRecommendations,
	getMovieVideos,
	getNowPlayingMovies,
	getPopularMovies,
	getSimilarMovies,
	getTopRatedMovies,
	getTrendingMovies,
	getUpcomingMovies,
	searchMovies,
} from "../controllers/movie.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

/**
 * Movie Routes
 *
 * These routes define all the endpoints for fetching movie data.
 * Most routes use optionalAuth middleware, which means they work
 * without authentication but can provide personalized data if the user is logged in.
 *
 * This is perfect for a Netflix-like experience where you can browse content
 * without logging in, but get personalized recommendations when you do.
 */

const router: Router = Router();

// List endpoints - these return multiple movies
router.get("/trending", optionalAuth, getTrendingMovies);
router.get("/popular", optionalAuth, getPopularMovies);
router.get("/top-rated", optionalAuth, getTopRatedMovies);
router.get("/now-playing", optionalAuth, getNowPlayingMovies);
router.get("/upcoming", optionalAuth, getUpcomingMovies);

// Utility endpoints
router.get("/genres", optionalAuth, getMovieGenres);
router.get("/search", optionalAuth, searchMovies);
router.get("/discover", optionalAuth, discoverMovies);

// Detail endpoints - these are for a specific movie
// These use :id as a route parameter (e.g., /api/movies/550)
router.get("/:id", optionalAuth, getMovieDetails);
router.get("/:id/credits", optionalAuth, getMovieCredits);
router.get("/:id/videos", optionalAuth, getMovieVideos);
router.get("/:id/similar", optionalAuth, getSimilarMovies);
router.get("/:id/recommendations", optionalAuth, getMovieRecommendations);

export default router;
