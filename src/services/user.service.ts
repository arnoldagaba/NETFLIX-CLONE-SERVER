import { clerkClient } from "@clerk/clerk-sdk-node";
import prisma from "../config/prisma.js";
import logger from "../utils/logger.js";

/**
 * User Service
 *
 * This service handles all operations related to users in our database.
 * It acts as a bridge between Clerk (which handles authentication) and
 * our PostgreSQL database (which stores user-specific app data).
 */

/**
 * Find or create a user in our database based on their Clerk ID
 *
 * This is like a hotel check-in process:
 * - If you've stayed here before, we pull up your existing record
 * - If you're a new guest, we create a new record for you
 *
 * This ensures that every authenticated user has a corresponding record
 * in our database that we can use to store their watchlist, favorites, etc.
 */
export const findOrCreateUser = async (clerkUserId: string) => {
	try {
		// First, try to find the user in our database
		let user = await prisma.user.findUnique({
			where: {
				clerkId: clerkUserId,
			},
		});

		// If the user exists, return them immediately
		if (user) {
			return user;
		}

		// If the user doesn't exist, this is their first time using our app
		// We need to fetch their info from Clerk and create a local record
		logger.info(`Creating new user record for Clerk ID: ${clerkUserId}`);

		// Fetch the user's information from Clerk
		// This gives us their email, username, profile picture, etc.
		const clerkUser = await clerkClient.users.getUser(clerkUserId);

		// Create a new user in our database with their Clerk information
		user = await prisma.user.create({
			data: {
				clerkId: clerkUserId,
				email: clerkUser.emailAddresses[0]?.emailAddress || "",
				username: clerkUser.username || clerkUser.firstName || "User",
				imageUrl: clerkUser.imageUrl || null,
			},
		});

		logger.info(`Successfully created user: ${user.id}`);
		return user;
	} catch (error) {
		logger.error(error, "Error in findOrCreateUser");
		throw new Error("Failed to find or create user");
	}
};

/**
 * Get a user by their Clerk ID
 *
 * This is a simple lookup function that finds a user in our database
 * using their Clerk ID. It's like looking up someone's hotel room number
 * using their reservation confirmation code.
 */
export const getUserByClerkId = async (clerkUserId: string) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				clerkId: clerkUserId,
			},
		});

		return user;
	} catch (error) {
		logger.error(error, "Error getting user by Clerk ID");
		throw new Error("Failed to get user");
	}
};

/**
 * Get a user by their internal database ID
 *
 * Sometimes we need to look up a user by our internal ID rather than
 * their Clerk ID. This is useful when we have relationships in our database
 * that reference the user's internal ID.
 */
export const getUserById = async (userId: string) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		return user;
	} catch (error) {
		logger.error(error, "Error getting user by ID");
		throw new Error("Failed to get user");
	}
};

/**
 * Update user information
 *
 * This allows us to update user details in our database.
 * We might use this if a user changes their username or profile picture.
 */
export const updateUser = async (
	userId: string,
	data: {
		username?: string;
		imageUrl?: string;
	},
) => {
	try {
		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				...data,
				updatedAt: new Date(), // Track when this update happened
			},
		});

		return user;
	} catch (error) {
		logger.error(error, "Error updating user");
		throw new Error("Failed to update user");
	}
};
