/**
 * Custom Error Classes
 *
 * These provide more specific error information than generic JavaScript errors.
 * Using custom errors makes debugging easier and allows for better error handling.
 *
 * Think of these as different types of alarm bells - each sounds different
 * so you immediately know what kind of problem occurred.
 */

import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Base API Error
 * All our custom errors extend from this
 */
export class APIError extends Error {
	statusCode: number;
	isOperational: boolean;

	constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true; // This means it's an expected error, not a bug

		// Maintains proper stack trace for debugging
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * 400 Bad Request
 * Use when the client sends invalid data
 */
export class BadRequestError extends APIError {
	constructor(message: string = "Bad Request") {
		super(message, StatusCodes.BAD_REQUEST);
		this.name = "BadRequestError";
	}
}

/**
 * 401 Unauthorized
 * Use when authentication is required but not provided or invalid
 */
export class UnauthorizedError extends APIError {
	constructor(message: string = "Unauthorized") {
		super(message, StatusCodes.UNAUTHORIZED);
		this.name = "UnauthorizedError";
	}
}

/**
 * 403 Forbidden
 * Use when user is authenticated but doesn't have permission
 */
export class ForbiddenError extends APIError {
	constructor(message: string = "Forbidden") {
		super(message, StatusCodes.FORBIDDEN);
		this.name = "ForbiddenError";
	}
}

/**
 * 404 Not Found
 * Use when a requested resource doesn't exist
 */
export class NotFoundError extends APIError {
	constructor(message: string = "Resource not found") {
		super(message, StatusCodes.NOT_FOUND);
		this.name = "NotFoundError";
	}
}

/**
 * 409 Conflict
 * Use when there's a conflict, like trying to create a duplicate
 */
export class ConflictError extends APIError {
	constructor(message: string = "Conflict") {
		super(message, StatusCodes.CONFLICT);
		this.name = "ConflictError";
	}
}

/**
 * 500 Internal Server Error
 * Use for unexpected errors
 */
export class InternalServerError extends APIError {
	constructor(message: string = "Internal Server Error") {
		super(message, StatusCodes.INTERNAL_SERVER_ERROR);
		this.name = "InternalServerError";
	}
}

/**
 * Async Handler Wrapper
 *
 * This wraps async route handlers so you don't need try-catch in every controller.
 * Any errors thrown inside will be caught and passed to Express error middleware.
 *
 * Instead of:
 * export const getMovie = async (req, res) => {
 *   try {
 *     // code
 *   } catch (error) {
 *     // handle error
 *   }
 * }
 *
 * You can do:
 * export const getMovie = asyncHandler(async (req, res) => {
 *   // code - errors automatically caught
 * });
 */
export const asyncHandler = (
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
