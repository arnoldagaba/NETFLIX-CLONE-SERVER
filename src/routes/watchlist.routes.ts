import { Router } from "express";
import {
	getWatchlist,
	addToWatchlist,
	removeFromWatchlist,
	checkWatchlistStatus,
} from "#controllers/watchlist.controller.js";
import { requireAuth } from "#middleware/auth.middleware.js";

/**
 * Watchlist Routes
 *
 * All watchlist routes require authentication because
 * a watchlist is personal to each user.
 */

const router: Router = Router();

// Get user's complete watchlist
router.get("/", requireAuth, getWatchlist);

// Add item to watchlist
router.post("/", requireAuth, addToWatchlist);

// Remove item from watchlist by its ID
router.delete("/:id", requireAuth, removeFromWatchlist);

// Check if a specific item is in the watchlist
router.get("/check", requireAuth, checkWatchlistStatus);

export default router;