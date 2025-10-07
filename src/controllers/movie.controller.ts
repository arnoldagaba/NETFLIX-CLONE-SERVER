import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { tmdbService } from "#services/tmdb.service.js";
import logger from "#utils/logger.js";

/**
 * Movie Controllers
 *
 * These controllers handle HTTP requests related to movies.
 * They act as the interface between your frontend and the TMDB service.
 *
 * Each controller follows a pattern:
 * 1. Extract parameters from the request (query params, route params, body)
 * 2. Call the appropriate service method
 * 3. Format and send the response
 * 4. Handle any errors gracefully
 */

/**
 * Get Trending Movies
 * Example: GET /api/movies/trending?timeWindow=week
 */
export const getTrendingMovies = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const timeWindow = (req.query.timeWindow as "day" | "week") || "week";

		const movies = await tmdbService.getTrending("movie", timeWindow);

		res.json({
			success: true,
			data: movies,
		});
	} catch (error) {
		logger.error(error, "Error in getSimilarMovies:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch similar movies",
		});
	}
};

/**
 * Get Movie Recommendations
 * Example: GET /api/movies/550/recommendations?page=1
 */
export const getMovieRecommendations = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// biome-ignore lint/style/noNonNullAssertion: The id must be provided when using this route
		const movieId = parseInt(req.params.id!, 10);
		const page = parseInt(req.query.page as string, 10) || 1;

		if (Number.isNaN(movieId)) {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				error: "Invalid movie ID",
			});
			return;
		}

		const movies = await tmdbService.getRecommendations("movie", movieId, page);

		res.json({
			success: true,
			data: movies,
		});
	} catch (error) {
		logger.error(error, "Error in getMovieRecommendations:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch movie recommendations",
		});
	}
};

/**
 * Search Movies
 * Example: GET /api/movies/search?query=inception&page=1
 */
export const searchMovies = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const query = req.query.query as string;
		const page = parseInt(req.query.page as string, 10) || 1;

		if (!query || query.trim() === "") {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				error: "Search query is required",
			});
			return;
		}

		const movies = await tmdbService.search(query, "movie", page);

		res.json({
			success: true,
			data: movies,
		});
	} catch (error) {
		logger.error(error, "Error in searchMovies:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to search movies",
		});
	}
};

/**
 * Discover Movies with Filters
 * Example: GET /api/movies/discover?with_genres=28,12&year=2023&sort_by=popularity.desc&page=1
 */
export const discoverMovies = async (
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

		const movies = await tmdbService.discover("movie", filters);

		res.json({
			success: true,
			data: movies,
		});
	} catch (error) {
		logger.error(error, "Error in discoverMovies:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to discover movies",
		});
	}
};

/**
 * Get Movie Genres
 * Example: GET /api/movies/genres
 */
export const getMovieGenres = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	try {
		const genres = await tmdbService.getGenres("movie");

		res.json({
			success: true,
			data: genres,
		});
	} catch (error) {
		logger.error(error, "Error in getMovieGenres:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch movie genres",
		});
	}
};

/**
 * Get Popular Movies
 * Example: GET /api/movies/popular?page=1
 */
export const getPopularMovies = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string, 10) || 1;

		const movies = await tmdbService.getPopular("movie", page);

		res.json({
			success: true,
			data: movies,
		});
	} catch (error) {
		logger.error(error, "Error in getPopularMovies:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch popular movies",
		});
	}
};

/**
 * Get Top Rated Movies
 * Example: GET /api/movies/top-rated?page=1
 */
export const getTopRatedMovies = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string, 10) || 1;

		const movies = await tmdbService.getTopRated("movie", page);

		res.json({
			success: true,
			data: movies,
		});
	} catch (error) {
		logger.error(error, "Error in getTopRatedMovies:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch top rated movies",
		});
	}
};

/**
 * Get Now Playing Movies
 * Example: GET /api/movies/now-playing?page=1
 */
export const getNowPlayingMovies = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string, 10) || 1;

		const movies = await tmdbService.getNowPlaying(page);

		res.json({
			success: true,
			data: movies,
		});
	} catch (error) {
		logger.error(error, "Error in getNowPlayingMovies:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch now playing movies",
		});
	}
};

/**
 * Get Upcoming Movies
 * Example: GET /api/movies/upcoming?page=1
 */
export const getUpcomingMovies = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const page = parseInt(req.query.page as string, 10) || 1;

		const movies = await tmdbService.getUpcoming(page);

		res.json({
			success: true,
			data: movies,
		});
	} catch (error) {
		logger.error(error, "Error in getUpcomingMovies:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch upcoming movies",
		});
	}
};

/**
 * Get Movie Details
 * Example: GET /api/movies/550 (where 550 is Fight Club's ID)
 */
export const getMovieDetails = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// biome-ignore lint/style/noNonNullAssertion: The id must be provided when using this route
		const movieId = parseInt(req.params.id!, 10);

		if (Number.isNaN(movieId)) {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				error: "Invalid movie ID",
			});
			return;
		}

		const movie = await tmdbService.getMovieDetails(movieId);

		res.json({
			success: true,
			data: movie,
		});
	} catch (error) {
		logger.error(error, "Error in getMovieDetails:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch movie details",
		});
	}
};

/**
 * Get Movie Credits (Cast and Crew)
 * Example: GET /api/movies/550/credits
 */
export const getMovieCredits = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// biome-ignore lint/style/noNonNullAssertion: The id must be provided when using this route
		const movieId = parseInt(req.params.id!, 10);

		if (Number.isNaN(movieId)) {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				error: "Invalid movie ID",
			});
			return;
		}

		const credits = await tmdbService.getCredits("movie", movieId);

		res.json({
			success: true,
			data: credits,
		});
	} catch (error) {
		logger.error(error, "Error in getMovieCredits:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch movie credits",
		});
	}
};

/**
 * Get Movie Videos (Trailers, Clips, etc.)
 * Example: GET /api/movies/550/videos
 */
export const getMovieVideos = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// biome-ignore lint/style/noNonNullAssertion: The id must be provided when using this route
		const movieId = parseInt(req.params.id!, 10);

		if (Number.isNaN(movieId)) {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				error: "Invalid movie ID",
			});
			return;
		}

		const videos = await tmdbService.getVideos("movie", movieId);

		res.json({
			success: true,
			data: videos,
		});
	} catch (error) {
		logger.error(error, "Error in getMovieVideos:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch movie videos",
		});
	}
};

/**
 * Get Similar Movies
 * Example: GET /api/movies/550/similar?page=1
 */
export const getSimilarMovies = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// biome-ignore lint/style/noNonNullAssertion: The id must be provided when using this route
		const movieId = parseInt(req.params.id!, 10);
		const page = parseInt(req.query.page as string, 10) || 1;

		if (Number.isNaN(movieId)) {
			res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				error: "Invalid movie ID",
			});
			return;
		}

		const movies = await tmdbService.getSimilar("movie", movieId, page);

		res.json({
			success: true,
			data: movies,
		});
	} catch (error) {
		logger.error(error, "Error in getSimilarMovies:");
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			error: "Failed to fetch similar movies",
		});
	}
};
