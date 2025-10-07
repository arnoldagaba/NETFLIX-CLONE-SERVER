import rateLimit from "express-rate-limit";

/**
 * Rate Limiting Middleware
 *
 * Prevents abuse by limiting how many requests a user can make.
 * Think of it as a bouncer that says "slow down" if someone is making
 * too many requests too quickly.
 */

/**
 * General API rate limiter
 * Allows 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Max 100 requests per window
	message: {
		success: false,
		error: "Too many requests, please try again later.",
	},
	standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
	legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for authentication endpoints
 * Allows 5 requests per 15 minutes
 *
 * This is stricter to prevent brute force attacks
 */
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Max 5 requests per window
	message: {
		success: false,
		error: "Too many authentication attempts, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Search rate limiter
 * Allows 30 searches per minute
 *
 * Search can be expensive, so we limit it more strictly
 */
export const searchLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 30, // Max 30 requests per minute
	message: {
		success: false,
		error: "Too many search requests, please slow down.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});