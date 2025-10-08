import { Router } from "express";
import {
	discoverTVShows,
	getPopularTVShows,
	getSimilarTVShows,
	getTopRatedTVShows,
	getTrendingTVShows,
	getTVShowCredits,
	getTVShowDetails,
	getTVShowGenres,
	getTVShowRecommendations,
	getTVShowVideos,
	searchTVShows,
} from "../controllers/tv.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

/**
 * TV Show Routes
 *
 * These routes handle all TV show related endpoints.
 * The structure mirrors the movie routes for consistency.
 */

const router: Router = Router();

// List endpoints
router.get("/trending", optionalAuth, getTrendingTVShows);
router.get("/popular", optionalAuth, getPopularTVShows);
router.get("/top-rated", optionalAuth, getTopRatedTVShows);

// Utility endpoints
router.get("/genres", optionalAuth, getTVShowGenres);
router.get("/search", optionalAuth, searchTVShows);
router.get("/discover", optionalAuth, discoverTVShows);

// Detail endpoints
router.get("/:id", optionalAuth, getTVShowDetails);
router.get("/:id/credits", optionalAuth, getTVShowCredits);
router.get("/:id/videos", optionalAuth, getTVShowVideos);
router.get("/:id/similar", optionalAuth, getSimilarTVShows);
router.get("/:id/recommendations", optionalAuth, getTVShowRecommendations);

export default router;
