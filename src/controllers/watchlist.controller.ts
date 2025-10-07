import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "#config/prisma.js";
import { findOrCreateUser } from "#services/user.service.js";
import logger from "#utils/logger.js";

/**
 * Watchlist Controllers
 *
 * The watchlist is like a personal library where users save content
 * they want to watch later. It's one of the core features that makes
 * your Netflix clone feel personal and useful.
 *
 * All these endpoints require authentication because a watchlist is
 * specific to each user.
 */

/**
 * Get User's Watchlist
 * Returns all movies and TV shows the user has saved
 */
export const getWatchlist = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const clerkUserId = req.auth?.userId;

		if (!clerkUserId) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				success: false,
				error: "Unauthorized",
			});
			return;
		}

		// Ensure user exists in our database
		const user = await findOrCreateUser(clerkUserId);

		// Fetch all watchlist items for this user
		const watchlist = await prisma.watchlist.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				addedAt: "desc", // Most recently added first
			},
		});

		res.json({
			success: true,
			data: watchlist,
		});
	} catch (error) {
		logger.error(error, "Error in getWatchlist:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch watchlist",
		});
	}
};

/**
 * Add Item to Watchlist
 * Saves a movie or TV show to the user's watchlist
 */
export const addToWatchlist = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const clerkUserId = req.auth?.userId;

		if (!clerkUserId) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				success: false,
				error: "Unauthorized",
			});
			return;
		}

		// Extract content details from request body
		const { tmdbId, contentType, title, posterPath, note } = req.body;

		// Validate required fields
		if (!tmdbId || !contentType || !title) {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				error: "tmdbId, contentType, and title are required",
			});
			return;
		}

		if (contentType !== "movie" && contentType !== "tv") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				error: 'contentType must be either "movie" or "tv"',
			});
			return;
		}

		const user = await findOrCreateUser(clerkUserId);

		// Check if this item is already in the watchlist
		const existing = await prisma.watchlist.findUnique({
			where: {
				userId_tmdbId_contentType: {
					userId: user.id,
					tmdbId: parseInt(tmdbId, 10),
					contentType,
				},
			},
		});

		if (existing) {
			res.status(409).json({
				success: false,
				error: "Item already in watchlist",
				data: existing,
			});
			return;
		}

		// Add the item to the watchlist
		const watchlistItem = await prisma.watchlist.create({
			data: {
				userId: user.id,
				tmdbId: parseInt(tmdbId, 10),
				contentType,
				title,
				posterPath: posterPath || null,
				note: note || null,
			},
		});

		res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Added to watchlist successfully",
			data: watchlistItem,
		});
	} catch (error) {
		logger.error(error, "Error in addToWatchlist:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to add to watchlist",
		});
	}
};

/**
 * Remove Item from Watchlist
 * Removes a movie or TV show from the user's watchlist
 */
export const removeFromWatchlist = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const clerkUserId = req.auth?.userId;

		if (!clerkUserId) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				success: false,
				error: "Unauthorized",
			});
			return;
		}

		// biome-ignore lint/style/noNonNullAssertion: It must exist when this route is used
		const watchlistId = req.params.id!;

		const user = await findOrCreateUser(clerkUserId);

		// Check if the item exists and belongs to this user
		const item = await prisma.watchlist.findUnique({
			where: {
				id: watchlistId,
			},
		});

		if (!item) {
			res.status(StatusCodes.NOT_FOUND).json({
				success: false,
				error: "Watchlist item not found",
			});
			return;
		}

		if (item.userId !== user.id) {
			res.status(StatusCodes.FORBIDDEN).json({
				success: false,
				error: "You do not have permission to remove this item",
			});
			return;
		}

		// Delete the item
		await prisma.watchlist.delete({
			where: {
				id: watchlistId,
			},
		});

		res.json({
			success: true,
			message: "Removed from watchlist successfully",
		});
	} catch (error) {
		logger.error(error, "Error in removeFromWatchlist:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to remove from watchlist",
		});
	}
};

/**
 * Check if Item is in Watchlist
 * Useful for showing/hiding "Add to Watchlist" button in UI
 */
export const checkWatchlistStatus = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const clerkUserId = req.auth?.userId;

		if (!clerkUserId) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				success: false,
				error: "Unauthorized",
			});
			return;
		}

		const { tmdbId, contentType } = req.query;

		if (!tmdbId || !contentType) {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				error: "tmdbId and contentType are required",
			});
			return;
		}

		const user = await findOrCreateUser(clerkUserId);

		const item = await prisma.watchlist.findUnique({
			where: {
				userId_tmdbId_contentType: {
					userId: user.id,
					tmdbId: parseInt(tmdbId as string, 10),
					contentType: contentType as string,
				},
			},
		});

		res.json({
			success: true,
			inWatchlist: !!item,
			data: item || null,
		});
	} catch (error) {
		logger.error(error, "Error in checkWatchlistStatus:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to check watchlist status",
		});
	}
};
