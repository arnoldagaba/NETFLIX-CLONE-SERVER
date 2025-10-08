import axios, { type AxiosInstance } from "axios";
import { env } from "../config/env.js";
import prisma from "../config/prisma.js";
import type {
	TMDBContentType,
	TMDBCredits,
	TMDBGenre,
	TMDBMovie,
	TMDBMovieDetails,
	TMDBPaginatedResponse,
	TMDBTimeWindow,
	TMDBTVShow,
	TMDBTVShowDetails,
	TMDBVideo,
} from "../types/tmdb.types.js";
import logger from "../utils/logger.js";

/**
 * TMDB Service
 *
 * This service is your gateway to The Movie Database API. It handles all
 * communication with TMDB, implements intelligent caching to reduce API calls,
 * and provides clean, easy-to-use methods for fetching movie and TV show data.
 *
 * Think of this as hiring a specialized librarian who knows exactly where
 * to find every movie in the world and remembers what you've already looked up.
 */

class TMDBService {
	private client: AxiosInstance;
	private apiKey: string;
	private baseURL: string;

	constructor() {
		// Get configuration from environment variables
		this.apiKey = env.TMDB_API_KEY || "";
		this.baseURL = env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

		if (!this.apiKey) {
			logger.warn(
				"⚠️  TMDB API key is not set! Please add it to your .env file.",
			);
		}

		// Create an axios instance configured specifically for TMDB
		// This is like having a dedicated phone line to TMDB
		this.client = axios.create({
			baseURL: this.baseURL,
			params: {
				api_key: this.apiKey, // Automatically add API key to every request
			},
			timeout: 10_000, // Wait maximum 10 seconds for a response
		});
	}

	/**
	 * Generic method to fetch from TMDB with caching
	 *
	 * This is the workhorse method that all other methods use. It implements
	 * a caching strategy to avoid hitting TMDB's API unnecessarily.
	 *
	 * The flow:
	 * 1. Check if we have this data cached and it's still fresh
	 * 2. If yes, return cached data (super fast!)
	 * 3. If no, fetch from TMDB
	 * 4. Cache the new data for next time
	 * 5. Return the data
	 */
	private async fetchWithCache<T>(
		endpoint: string,
		cacheKey: string,
		cacheDuration: number = 24 * 60 * 60 * 1000, // Default: 24 hours in milliseconds
	): Promise<T> {
		try {
			// Step 1: Check cache
			const cached = await prisma.contentCache.findFirst({
				where: {
					endpoint: cacheKey,
					expiresAt: {
						gt: new Date(), // Only get cache that hasn't expired yet
					},
				},
			});

			// Step 2: Return cached data if found
			if (cached) {
				logger.info(`✅ Cache hit for: ${cacheKey}`);
				return cached.data as T;
			}

			// Step 3: Cache miss - fetch from TMDB
			logger.info(`🌐 Fetching from TMDB: ${endpoint}`);
			const response = await this.client.get<T>(endpoint);

			// Step 4: Save to cache for next time
			await prisma.contentCache.create({
				data: {
					tmdbId: 0, // We'll use 0 for general endpoints
					contentType: "general",
					endpoint: cacheKey,
					// biome-ignore lint/suspicious/noExplicitAny: Suppress error message
					data: response.data as any,
					expiresAt: new Date(Date.now() + cacheDuration),
				},
			});

			// Step 5: Return fresh data
			return response.data;
		} catch (error) {
			logger.error(error, `Error fetching from TMDB (${endpoint}):`);
			throw new Error(`Failed to fetch from TMDB: ${endpoint}`);
		}
	}

	/**
	 * Get Trending Movies or TV Shows
	 *
	 * TMDB provides trending content that changes daily or weekly.
	 * This is perfect for your homepage's "Trending Now" section.
	 */
	async getTrending(
		mediaType: TMDBContentType,
		timeWindow: TMDBTimeWindow = "week",
	): Promise<TMDBPaginatedResponse<TMDBMovie | TMDBTVShow>> {
		const endpoint = `/trending/${mediaType}/${timeWindow}`;
		const cacheKey = `trending_${mediaType}_${timeWindow}`;

		// Cache trending content for 6 hours (it doesn't change that often)
		return this.fetchWithCache(endpoint, cacheKey, 6 * 60 * 60 * 1000);
	}

	/**
	 * Get Popular Movies or TV Shows
	 *
	 * These are consistently popular titles, not just what's trending right now.
	 * Good for a "Popular" section on your homepage.
	 */
	async getPopular(
		mediaType: TMDBContentType,
		page: number = 1,
	): Promise<TMDBPaginatedResponse<TMDBMovie | TMDBTVShow>> {
		const endpoint = `/${mediaType}/popular`;
		const cacheKey = `popular_${mediaType}_page${page}`;

		return this.fetchWithCache(endpoint, cacheKey, 12 * 60 * 60 * 1000);
	}

	/**
	 * Get Top Rated Movies or TV Shows
	 *
	 * These are the highest-rated titles by TMDB users.
	 * Perfect for a "Top Rated" or "Critically Acclaimed" section.
	 */
	async getTopRated(
		mediaType: TMDBContentType,
		page: number = 1,
	): Promise<TMDBPaginatedResponse<TMDBMovie | TMDBTVShow>> {
		const endpoint = `/${mediaType}/top_rated`;
		const cacheKey = `top_rated_${mediaType}_page${page}`;

		return this.fetchWithCache(endpoint, cacheKey, 12 * 60 * 60 * 1000);
	}

	/**
	 * Get Now Playing Movies
	 *
	 * Movies currently in theaters. Great for a "Now in Theaters" section.
	 */
	async getNowPlaying(
		page: number = 1,
	): Promise<TMDBPaginatedResponse<TMDBMovie>> {
		const endpoint = "/movie/now_playing";
		const cacheKey = `now_playing_page${page}`;

		// These change frequently so cache for only 3 hours
		return this.fetchWithCache(endpoint, cacheKey, 3 * 60 * 60 * 1000);
	}

	/**
	 * Get Upcoming Movies
	 *
	 * Movies coming soon to theaters. Perfect for building anticipation!
	 */
	async getUpcoming(
		page: number = 1,
	): Promise<TMDBPaginatedResponse<TMDBMovie>> {
		const endpoint = "/movie/upcoming";
		const cacheKey = `upcoming_page${page}`;

		return this.fetchWithCache(endpoint, cacheKey, 12 * 60 * 60 * 1000);
	}

	/**
	 * Get Movie Details
	 *
	 * Fetches complete information about a specific movie including
	 * runtime, budget, genres, production companies, and more.
	 */
	async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
		const endpoint = `/movie/${movieId}`;
		const cacheKey = `movie_details_${movieId}`;

		// Movie details rarely change, cache for 7 days
		return this.fetchWithCache(endpoint, cacheKey, 7 * 24 * 60 * 60 * 1000);
	}

	/**
	 * Get TV Show Details
	 *
	 * Complete information about a TV show including seasons, episodes,
	 * networks, creators, and more.
	 */
	async getTVShowDetails(showId: number): Promise<TMDBTVShowDetails> {
		const endpoint = `/tv/${showId}`;
		const cacheKey = `tv_details_${showId}`;

		return this.fetchWithCache(endpoint, cacheKey, 7 * 24 * 60 * 60 * 1000);
	}

	/**
	 * Get Movie or TV Show Credits
	 *
	 * Returns cast (actors) and crew (directors, writers, etc.) for a title.
	 * This is what you need to show "Starring" information.
	 */
	async getCredits(
		mediaType: TMDBContentType,
		id: number,
	): Promise<TMDBCredits> {
		const endpoint = `/${mediaType}/${id}/credits`;
		const cacheKey = `${mediaType}_credits_${id}`;

		return this.fetchWithCache(endpoint, cacheKey, 7 * 24 * 60 * 60 * 1000);
	}

	/**
	 * Get Videos (Trailers, Teasers, Clips)
	 *
	 * Returns available videos for a movie or show, usually trailers and clips.
	 * Most videos are YouTube links.
	 */
	async getVideos(
		mediaType: TMDBContentType,
		id: number,
	): Promise<{ results: TMDBVideo[] }> {
		const endpoint = `/${mediaType}/${id}/videos`;
		const cacheKey = `${mediaType}_videos_${id}`;

		return this.fetchWithCache(endpoint, cacheKey, 7 * 24 * 60 * 60 * 1000);
	}

	/**
	 * Get Similar Movies or TV Shows
	 *
	 * Returns content similar to a given title based on genres, keywords, etc.
	 * Perfect for a "More Like This" or "You Might Also Like" section.
	 */
	async getSimilar(
		mediaType: TMDBContentType,
		id: number,
		page: number = 1,
	): Promise<TMDBPaginatedResponse<TMDBMovie | TMDBTVShow>> {
		const endpoint = `/${mediaType}/${id}/similar`;
		const cacheKey = `${mediaType}_similar_${id}_page${page}`;

		return this.fetchWithCache(endpoint, cacheKey, 24 * 60 * 60 * 1000);
	}

	/**
	 * Get Recommendations
	 *
	 * Returns recommended content based on a given title. This uses TMDB's
	 * recommendation algorithm which is more sophisticated than just "similar".
	 */
	async getRecommendations(
		mediaType: TMDBContentType,
		id: number,
		page: number = 1,
	): Promise<TMDBPaginatedResponse<TMDBMovie | TMDBTVShow>> {
		const endpoint = `/${mediaType}/${id}/recommendations`;
		const cacheKey = `${mediaType}_recommendations_${id}_page${page}`;

		return this.fetchWithCache(endpoint, cacheKey, 24 * 60 * 60 * 1000);
	}

	/**
	 * Search Movies and TV Shows
	 *
	 * Searches TMDB's entire database. This is what powers your search bar.
	 * Note: Search results are NOT cached because every query is different.
	 */
	async search(
		query: string,
		mediaType: TMDBContentType,
		page: number = 1,
	): Promise<TMDBPaginatedResponse<TMDBMovie | TMDBTVShow>> {
		try {
			const endpoint = `/search/${mediaType}`;
			const response = await this.client.get<
				TMDBPaginatedResponse<TMDBMovie | TMDBTVShow>
			>(endpoint, {
				params: {
					query,
					page,
				},
			});

			return response.data;
		} catch (error) {
			logger.error(error, `Error searching TMDB`);
			throw new Error("Search failed");
		}
	}

	/**
	 * Get All Genres
	 *
	 * Returns the complete list of genres (Action, Comedy, Drama, etc.)
	 * You'll use this to build genre filters and display genre names.
	 */
	async getGenres(mediaType: TMDBContentType): Promise<TMDBGenre[]> {
		const endpoint = `/genre/${mediaType}/list`;
		const cacheKey = `genres_${mediaType}`;

		// Genres almost never change, cache for 30 days
		const response = await this.fetchWithCache<{ genres: TMDBGenre[] }>(
			endpoint,
			cacheKey,
			30 * 24 * 60 * 60 * 1000,
		);

		return response.genres;
	}

	/**
	 * Discover Movies or TV Shows with Filters
	 *
	 * This is TMDB's most powerful endpoint. You can filter by genre, year,
	 * rating, language, and many other criteria. Perfect for building a
	 * browse/filter page where users can find exactly what they want.
	 */
	async discover(
		mediaType: TMDBContentType,
		filters: {
			with_genres?: string; // Comma-separated genre IDs
			year?: number;
			sort_by?: string; // e.g., 'popularity.desc', 'vote_average.desc'
			page?: number;
		} = {},
	): Promise<TMDBPaginatedResponse<TMDBMovie | TMDBTVShow>> {
		try {
			const endpoint = `/discover/${mediaType}`;
			const response = await this.client.get<
				TMDBPaginatedResponse<TMDBMovie | TMDBTVShow>
			>(endpoint, {
				params: filters,
			});

			return response.data;
		} catch (error) {
			logger.error(error, `Error discovering content`);
			throw new Error("Discover failed");
		}
	}

	/**
	 * Build Image URL
	 *
	 * TMDB returns image paths like "/abc123.jpg" but you need the full URL
	 * to actually display the image. This helper builds the complete URL.
	 *
	 * Sizes: w92, w154, w185, w342, w500, w780, original
	 */
	getImageURL(path: string | null, size: string = "w500"): string | null {
		if (!path) return null;
		return `https://image.tmdb.org/t/p/${size}${path}`;
	}
}

// Create and export a single instance of the service
// This ensures we reuse the same axios client and cache throughout the app
export const tmdbService = new TMDBService();
