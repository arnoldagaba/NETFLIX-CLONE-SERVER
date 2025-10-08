import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../utils/errors.js";

/**
 * Validation Middleware
 *
 * These middleware functions validate request data before it reaches controllers.
 * Think of them as quality control inspectors that reject bad data early.
 */

/**
 * Validate required fields in request body
 *
 * Usage:
 * router.post('/endpoint', validateBody(['field1', 'field2']), controller)
 */
export const validateBody = (requiredFields: string[]) => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		const missingFields: string[] = [];

		for (const field of requiredFields) {
			if (!req.body[field]) {
				missingFields.push(field);
			}
		}

		if (missingFields.length > 0) {
			throw new BadRequestError(
				`Missing required fields: ${missingFields.join(", ")}`,
			);
		}

		next();
	};
};

/**
 * Validate that a parameter is a valid number
 *
 * Usage:
 * router.get('/movies/:id', validateNumericParam('id'), controller)
 */
export const validateNumericParam = (paramName: string) => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		// biome-ignore lint/style/noNonNullAssertion: I know it exists
		const value = req.params[paramName]!;
		const numValue = parseInt(value, 10);

		if (Number.isNaN(numValue) || numValue < 0) {
			throw new BadRequestError(
				`Invalid ${paramName}: must be a positive number`,
			);
		}

		// Attach the parsed number to req.params for convenience
		req.params[paramName] = numValue.toString();
		next();
	};
};

/**
 * Validate pagination parameters
 *
 * Usage:
 * router.get('/movies', validatePagination, controller)
 */
export const validatePagination = (
	req: Request,
	_res: Response,
	next: NextFunction,
): void => {
	if (req.query.page) {
		const page = parseInt(req.query.page as string, 10);
		if (Number.isNaN(page) || page < 1) {
			throw new BadRequestError("Page must be a positive number");
		}
	}

	if (req.query.limit) {
		const limit = parseInt(req.query.limit as string, 10);
		if (Number.isNaN(limit) || limit < 1 || limit > 100) {
			throw new BadRequestError("Limit must be between 1 and 100");
		}
	}

	next();
};

/**
 * Validate content type (movie or tv)
 *
 * Usage in request body validation
 */
export const validateContentType = (
	req: Request,
	_res: Response,
	next: NextFunction,
): void => {
	const { contentType } = req.body;

	if (!contentType) {
		throw new BadRequestError("contentType is required");
	}

	if (contentType !== "movie" && contentType !== "tv") {
		throw new BadRequestError('contentType must be either "movie" or "tv"');
	}

	next();
};

/**
 * Validate TMDB ID
 *
 * Usage:
 * router.post('/watchlist', validateTMDBId, controller)
 */
export const validateTMDBId = (
	req: Request,
	_res: Response,
	next: NextFunction,
): void => {
	const { tmdbId } = req.body;

	if (!tmdbId) {
		throw new BadRequestError("tmdbId is required");
	}

	const id = parseInt(tmdbId, 10);
	if (Number.isNaN(id) || id < 0) {
		throw new BadRequestError("tmdbId must be a positive number");
	}

	// Store the parsed number back
	req.body.tmdbId = id;
	next();
};
