/**
 * TMDB Type Definitions
 *
 * These types define the shape of data we receive from TMDB API.
 * Think of them as blueprints that describe exactly what fields exist
 * in the data and what type each field is (string, number, etc.)
 *
 * TypeScript uses these to catch errors at compile time, like if we
 * try to access a field that doesn't exist or use a field as the wrong type.
 */

/**
 * Base Movie type - represents a movie in TMDB's database
 * This is what you get when fetching movie lists or search results
 */
export interface TMDBMovie {
	id: number;
	title: string;
	original_title: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	release_date: string;
	adult: boolean;
	genre_ids: number[];
	original_language: string;
	popularity: number;
	vote_average: number;
	vote_count: number;
	video: boolean;
}

/**
 * Detailed Movie type - includes additional fields you get
 * when fetching a specific movie's full details
 */
export interface TMDBMovieDetails extends TMDBMovie {
	budget: number;
	revenue: number;
	runtime: number | null;
	status: string;
	tagline: string | null;
	genres: Array<{
		id: number;
		name: string;
	}>;
	production_companies: Array<{
		id: number;
		name: string;
		logo_path: string | null;
		origin_country: string;
	}>;
	production_countries: Array<{
		iso_3166_1: string;
		name: string;
	}>;
	spoken_languages: Array<{
		english_name: string;
		iso_639_1: string;
		name: string;
	}>;
	homepage: string | null;
	imdb_id: string | null;
}

/**
 * TV Show type - similar to movies but for TV series
 */
export interface TMDBTVShow {
	id: number;
	name: string;
	original_name: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	first_air_date: string;
	origin_country: string[];
	genre_ids: number[];
	original_language: string;
	popularity: number;
	vote_average: number;
	vote_count: number;
}

/**
 * Detailed TV Show type with additional information
 */
export interface TMDBTVShowDetails extends TMDBTVShow {
	created_by: Array<{
		id: number;
		name: string;
		profile_path: string | null;
	}>;
	episode_run_time: number[];
	genres: Array<{
		id: number;
		name: string;
	}>;
	homepage: string;
	in_production: boolean;
	languages: string[];
	last_air_date: string;
	number_of_episodes: number;
	number_of_seasons: number;
	status: string;
	tagline: string;
	type: string;
	networks: Array<{
		id: number;
		name: string;
		logo_path: string | null;
		origin_country: string;
	}>;
	seasons: Array<{
		id: number;
		name: string;
		overview: string;
		poster_path: string | null;
		season_number: number;
		episode_count: number;
		air_date: string;
	}>;
}

/**
 * Genre type - categories like Action, Comedy, Drama
 */
export interface TMDBGenre {
	id: number;
	name: string;
}

/**
 * Cast member type - actors and their roles
 */
export interface TMDBCastMember {
	id: number;
	name: string;
	character: string;
	profile_path: string | null;
	order: number;
	known_for_department: string;
}

/**
 * Crew member type - directors, writers, producers
 */
export interface TMDBCrewMember {
	id: number;
	name: string;
	job: string;
	department: string;
	profile_path: string | null;
}

/**
 * Credits type - combines cast and crew
 */
export interface TMDBCredits {
	id: number;
	cast: TMDBCastMember[];
	crew: TMDBCrewMember[];
}

/**
 * Video type - trailers, teasers, clips
 */
export interface TMDBVideo {
	id: string;
	key: string; // YouTube video ID
	name: string;
	site: string; // Usually "YouTube"
	size: number;
	type: string; // "Trailer", "Teaser", "Clip", etc.
	official: boolean;
	published_at: string;
}

/**
 * Paginated response type - TMDB returns lists in pages
 * Think of this like a book with multiple pages of results
 */
export interface TMDBPaginatedResponse<T> {
	page: number;
	results: T[];
	total_pages: number;
	total_results: number;
}

/**
 * Search result that can be either a movie or TV show
 * This is useful for search endpoints that return mixed results
 */
export type TMDBSearchResult = (TMDBMovie | TMDBTVShow) & {
	media_type: "movie" | "tv";
};

/**
 * Time window for trending content
 * TMDB allows you to get trending content for day or week
 */
export type TMDBTimeWindow = "day" | "week";

/**
 * Content type - used to distinguish between movies and TV shows
 */
export type TMDBContentType = "movie" | "tv";