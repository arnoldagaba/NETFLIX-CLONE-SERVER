import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { tmdbService } from "../services/tmdb.service.js";
import logger from "../utils/logger.js";

/**
 * TV Show Controllers
 *
 * These controllers are similar to movie controllers but specifically
 * handle TV shows and series. TV shows have additional complexity like
 * seasons and episodes that movies don't have.
 */

export const getTrendingTVShows = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const timeWindow = (req.query.timeWindow as "day" | "week") || "week";
		const shows = await tmdbService.getTrending("tv", timeWindow);

		res.json({
			success: true,
			data: shows,
		});
	} catch (error) {
		logger.error(error, "Error in getTrendingTVShows:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch trending TV shows",
		});
	}
};

export const getPopularTVShows = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string, 10) || 1;
		const shows = await tmdbService.getPopular("tv", page);

		res.json({
			success: true,
			data: shows,
		});
	} catch (error) {
		logger.error(error, "Error in getPopularTVShows:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch popular TV shows",
		});
	}
};

export const getTopRatedTVShows = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string, 10) || 1;
		const shows = await tmdbService.getTopRated("tv", page);

		res.json({
			success: true,
			data: shows,
		});
	} catch (error) {
		logger.error(error, "Error in getTopRatedTVShows:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch top rated TV shows",
		});
	}
};

export const getTVShowDetails = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// biome-ignore lint/style/noNonNullAssertion: It must exist when this route is used
		const showId = parseInt(req.params.id!, 10);

		if (Number.isNaN(showId)) {
			res.status(400).json({
				success: false,
				error: "Invalid TV show ID",
			});
			return;
		}

		const show = await tmdbService.getTVShowDetails(showId);

		res.json({
			success: true,
			data: show,
		});
	} catch (error) {
		logger.error(error, "Error in getTVShowDetails:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch TV show details",
		});
	}
};

export const getTVShowCredits = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// biome-ignore lint/style/noNonNullAssertion: It must exist when this route is used
		const showId = parseInt(req.params.id!, 10);

		if (Number.isNaN(showId)) {
			res.status(400).json({
				success: false,
				error: "Invalid TV show ID",
			});
			return;
		}

		const credits = await tmdbService.getCredits("tv", showId);

		res.json({
			success: true,
			data: credits,
		});
	} catch (error) {
		logger.error(error, "Error in getTVShowCredits:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch TV show credits",
		});
	}
};

export const getTVShowVideos = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// biome-ignore lint/style/noNonNullAssertion: It must exist when this route is used
		const showId = parseInt(req.params.id!, 10);

		if (Number.isNaN(showId)) {
			res.status(400).json({
				success: false,
				error: "Invalid TV show ID",
			});
			return;
		}

		const videos = await tmdbService.getVideos("tv", showId);

		res.json({
			success: true,
			data: videos,
		});
	} catch (error) {
		logger.error(error, "Error in getTVShowVideos:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch TV show videos",
		});
	}
};

export const getSimilarTVShows = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// biome-ignore lint/style/noNonNullAssertion: It must exist when this route is used
		const showId = parseInt(req.params.id!, 10);
		const page = parseInt(req.query.page as string, 10) || 1;

		if (Number.isNaN(showId)) {
			res.status(400).json({
				success: false,
				error: "Invalid TV show ID",
			});
			return;
		}

		const shows = await tmdbService.getSimilar("tv", showId, page);

		res.json({
			success: true,
			data: shows,
		});
	} catch (error) {
		logger.error(error, "Error in getSimilarTVShows:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch similar TV shows",
		});
	}
};

export const getTVShowRecommendations = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// biome-ignore lint/style/noNonNullAssertion: It must exist when this route is used
		const showId = parseInt(req.params.id!, 10);
		const page = parseInt(req.query.page as string, 10) || 1;

		if (Number.isNaN(showId)) {
			res.status(400).json({
				success: false,
				error: "Invalid TV show ID",
			});
			return;
		}

		const shows = await tmdbService.getRecommendations("tv", showId, page);

		res.json({
			success: true,
			data: shows,
		});
	} catch (error) {
		logger.error(error, "Error in getTVShowRecommendations:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch TV show recommendations",
		});
	}
};

export const searchTVShows = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const query = req.query.query as string;
		const page = parseInt(req.query.page as string, 10) || 1;

		if (!query || query.trim() === "") {
			res.status(400).json({
				success: false,
				error: "Search query is required",
			});
			return;
		}

		const shows = await tmdbService.search(query, "tv", page);

		res.json({
			success: true,
			data: shows,
		});
	} catch (error) {
		logger.error(error, "Error in searchTVShows:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to search TV shows",
		});
	}
};

export const discoverTVShows = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const filters = {
			with_genres: req.query.with_genres as string,
			year: parseInt(req.query.year as string, 10),
			sort_by: (req.query.sort_by as string) || "popularity.desc",
			page: parseInt(req.query.page as string, 10) || 1,
		};

		const shows = await tmdbService.discover("tv", filters);

		res.json({
			success: true,
			data: shows,
		});
	} catch (error) {
		logger.error(error, "Error in discoverTVShows");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to discover TV shows",
		});
	}
};

export const getTVShowGenres = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	try {
		const genres = await tmdbService.getGenres("tv");

		res.json({
			success: true,
			data: genres,
		});
	} catch (error) {
		logger.error(error, "Error in getTVShowGenres");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch TV show genres",
		});
	}
};
