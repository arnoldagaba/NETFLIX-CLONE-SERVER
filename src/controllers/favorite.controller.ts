import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import prisma from "../config/prisma.js";
import { findOrCreateUser } from "../services/user.service.js";
import logger from "../utils/logger.js";

/**
 * Favorites Controllers
 *
 * Favorites are for content users have watched and loved.
 * While watchlist is "I want to watch this", favorites is "I loved this!"
 */

export const getFavorites = async (
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

		const user = await findOrCreateUser(clerkUserId);

		const favorites = await prisma.favorite.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				addedAt: "desc",
			},
		});

		res.status(StatusCodes.OK).json({
			success: true,
			data: favorites,
		});
	} catch (error) {
		logger.error(error, "Error in getFavorites:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch favorites",
		});
	}
};

export const addToFavorites = async (
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

		const { tmdbId, contentType, title, posterPath } = req.body;

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

		const existing = await prisma.favorite.findUnique({
			where: {
				userId_tmdbId_contentType: {
					userId: user.id,
					tmdbId: parseInt(tmdbId, 10),
					contentType,
				},
			},
		});

		if (existing) {
			res.status(StatusCodes.CONFLICT).json({
				success: false,
				error: "Item already in favorites",
				data: existing,
			});
			return;
		}

		const favoriteItem = await prisma.favorite.create({
			data: {
				userId: user.id,
				tmdbId: parseInt(tmdbId, 10),
				contentType,
				title,
				posterPath: posterPath || null,
			},
		});

		res.status(StatusCodes.CREATED).json({
			success: true,
			message: "Added to favorites successfully",
			data: favoriteItem,
		});
	} catch (error) {
		logger.error(error, "Error in addToFavorites:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to add to favorites",
		});
	}
};

export const removeFromFavorites = async (
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
		const favoriteId = req.params.id!;

		const user = await findOrCreateUser(clerkUserId);

		const item = await prisma.favorite.findUnique({
			where: {
				id: favoriteId,
			},
		});

		if (!item) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				success: false,
				error: "Favorite item not found",
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

		await prisma.favorite.delete({
			where: {
				id: favoriteId,
			},
		});

		res.json({
			success: true,
			message: "Removed from favorites successfully",
		});
	} catch (error) {
		logger.error(error, "Error in removeFromFavorites:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to remove from favorites",
		});
	}
};

export const checkFavoriteStatus = async (
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

		const item = await prisma.favorite.findUnique({
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
			isFavorite: !!item,
			data: item || null,
		});
	} catch (error) {
		logger.error(error, "Error in checkFavoriteStatus:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to check favorite status",
		});
	}
};
