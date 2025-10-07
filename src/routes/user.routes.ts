import { Router } from "express";
import {
	getCurrentUser,
	syncUserProfile,
} from "#controllers/user.controller.js";
import { requireAuth } from "#middleware/auth.middleware.js";

/**
 * User Routes
 *
 * This file defines the URL endpoints for user-related operations.
 * Think of routes as a map that tells your application:
 * "When someone visits THIS address, run THAT function"
 *
 * The pattern is:
 * router.METHOD(PATH, MIDDLEWARE, CONTROLLER)
 *
 * For example:
 * router.get('/profile', requireAuth, getCurrentUser)
 * means: "When someone makes a GET request to /profile, first check if they're
 * authenticated (requireAuth), then run the getCurrentUser function"
 */

const router: Router = Router();

/**
 * GET /api/user/profile
 *
 * Returns the current user's profile information.
 * This route is protected - you must be logged in to access it.
 *
 * The requireAuth middleware runs first and verifies the JWT token.
 * If valid, it attaches the user ID to req.auth and lets the request continue.
 * If invalid, it stops the request and returns 401 Unauthorized.
 */
router.get("/profile", requireAuth, getCurrentUser);

/**
 * POST /api/user/sync
 *
 * Ensures the user exists in our database.
 * Useful to call when a user first signs in to make sure their
 * profile is set up in your system.
 *
 * Also protected - requires authentication.
 */
router.post("/sync", requireAuth, syncUserProfile);

export default router;
