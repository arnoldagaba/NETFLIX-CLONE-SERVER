import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { findOrCreateUser, /* getUserByClerkId */} from "#services/user.service.js";
import logger from "#utils/logger.js";

/**
 * User Controller
 *
 * Controllers are like receptionists at different desks in a building.
 * Each controller handles requests for a specific area of functionality.
 * This controller handles everything related to user profiles and information.
 */

/**
 * Get Current User Profile
 *
 * This endpoint returns information about the currently authenticated user.
 * It's like showing someone their own profile page.
 *
 * The authentication middleware runs before this, so we know req.auth.userId
 * contains a valid Clerk user ID. We use that to look up the user in our database.
 */
export const getCurrentUser = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// The auth middleware has already verified this user is authenticated
		// and attached their Clerk user ID to req.auth
		const clerkUserId = req.auth?.userId;

		if (!clerkUserId) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "Unauthorized",
				message: "User ID not found in request",
			});
			return;
		}

		// Find or create the user in our database
		// If this is their first time using our app, this will create their record
		const user = await findOrCreateUser(clerkUserId);

		// Return the user information
		// We're sending back their profile data that we store in our database
		res.status(StatusCodes.OK).json({
			success: true,
			data: {
				id: user.id,
				clerkId: user.clerkId,
				email: user.email,
				username: user.username,
				imageUrl: user.imageUrl,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
		});
	} catch (error) {
		logger.error(error, "Error in getCurrentUser");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			error: "Internal Server Error",
			message: "Failed to fetch user profile",
		});
	}
};

/**
 * Sync User Profile
 *
 * This endpoint ensures the user exists in our database and returns their info.
 * It's similar to getCurrentUser but explicitly ensures synchronization.
 * You might call this when a user first logs in to make sure their profile
 * is set up in your database.
 */
export const syncUserProfile = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const clerkUserId = req.auth?.userId;

		if (!clerkUserId) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "Unauthorized",
				message: "User ID not found in request",
			});
			return;
		}

		// This will create the user if they don't exist, or return existing user
		const user = await findOrCreateUser(clerkUserId);

		res.status(StatusCodes.OK).json({
			success: true,
			message: "User profile synchronized successfully",
			data: {
				id: user.id,
				email: user.email,
				username: user.username,
				imageUrl: user.imageUrl,
			},
		});
	} catch (error) {
		logger.error(error, "Error in syncUserProfile");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			error: "Internal Server Error",
			message: "Failed to sync user profile",
		});
	}
};
