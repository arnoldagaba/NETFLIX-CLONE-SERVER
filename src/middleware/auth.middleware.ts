import { clerkClient } from "@clerk/clerk-sdk-node";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import logger from "../utils/logger.js";

/**
 * Authentication Middleware
 *
 * This is like a bouncer at a club. Every request trying to access protected routes
 * must pass through here first. The bouncer checks their ID (JWT token) and either
 * lets them in or turns them away.
 *
 * How it works:
 * 1. Extract the token from the Authorization header
 * 2. Verify the token with Clerk to make sure it's real and not expired
 * 3. If valid, attach the user's ID to the request so downstream code knows who they are
 * 4. If invalid, reject the request with a 401 Unauthorized status
 */
export const requireAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		// Step 1: Get the token from the Authorization header
		// The header should look like: "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "Unauthorized",
				message: "No authorization header provided",
			});
			return;
		}

		// Split "Bearer token" into ["Bearer", "token"] and take the second part
		const token = authHeader.split(" ")[1];

		if (!token) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "Unauthorized",
				message:
					"Invalid authorization header format. Expected: Bearer <token>",
			});
			return;
		}

		// Step 2: Verify the token with Clerk
		// This is like calling the ID issuer to confirm the ID card is legitimate
		try {
			const verifiedToken = await clerkClient.verifyToken(token, {
				// We could add additional options here like checking specific permissions
			});

			// Step 3: Attach the user information to the request
			// Now every route handler after this middleware can access req.auth.userId
			req.auth = {
				userId: verifiedToken.sub, // 'sub' is the standard JWT field for user ID
				sessionId: verifiedToken.sid, // 'sid' is Clerk's session ID
			};

			// Let the request continue to the next middleware or route handler
			next();
		} catch (verificationError) {
			// Token verification failed - it might be expired, invalid, or tampered with
			logger.error(verificationError, "Token verification failed");
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "Unauthorized",
				message: "Invalid or expired token",
			});
			return;
		}
	} catch (error) {
		// Something unexpected went wrong
		logger.error(error, "Auth middleware error");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			error: "Internal Server Error",
			message: "Authentication check failed",
		});
	}
};

/**
 * Optional Authentication Middleware
 *
 * This is like a VIP section that's open to everyone, but VIPs get special treatment.
 * It checks if a user is authenticated but doesn't reject the request if they're not.
 *
 * Use this for routes that work differently based on whether someone is logged in,
 * but don't require login. For example, a homepage that shows personalized content
 * for logged-in users but still works for guests.
 */
export const optionalAuth = async (
	req: Request,
	_res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;

		// If there's no token, that's okay - just continue without auth info
		if (!authHeader) {
			next();
			return;
		}

		const token = authHeader.split(" ")[1];

		if (!token) {
			next();
			return;
		}

		try {
			const verifiedToken = await clerkClient.verifyToken(token);
			req.auth = {
				userId: verifiedToken.sub,
				sessionId: verifiedToken.sid,
			};
		} catch (verificationError) {
			// Token verification failed, but since auth is optional, we just continue
			logger.warn(verificationError, "Optional auth verification failed");
		}

		next();
	} catch (error) {
		// Even if something goes wrong, we continue since auth is optional
		logger.error(error, "Optional auth middleware error");
		next();
	}
};
