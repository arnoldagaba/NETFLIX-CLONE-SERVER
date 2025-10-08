import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env.js";
import { APIError } from "../utils/errors.js";
import logger from "../utils/logger.js";

/**
 * Global Error Handler Middleware
 *
 * This is like a safety net that catches all errors in your application.
 * It determines if the error is one we expected (operational) or unexpected (bug),
 * logs appropriately, and sends a proper response to the client.
 *
 * This MUST be the last middleware added to your Express app.
 */
export const errorHandler = (
	err: Error | APIError,
	req: Request,
	res: Response,
	_next: NextFunction,
): void => {
	// Default to 500 Internal Server Error
	let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
	let message = "Internal Server Error";
	let isOperational = false;

	// If it's one of our custom API errors, use its details
	if (err instanceof APIError) {
		statusCode = err.statusCode;
		message = err.message;
		isOperational = err.isOperational;
	} else {
		// Unknown error - could be a bug
		message = err.message || message;
	}

	// Log the error for debugging
	if (!isOperational) {
		// This is likely a bug - log full details
		logger.error(
			{
				message: err.message,
				stack: err.stack,
				url: req.originalUrl,
				method: req.method,
				body: req.body,
				params: req.params,
				query: req.query,
			},
			"❌ Unexpected Error",
		);
	} else {
		// Operational error - just log the message
		logger.warn(
			{
				message: err.message,
				url: req.originalUrl,
				method: req.method,
			},
			"⚠️  Operational Error",
		);
	}

	// Send response to client
	res.status(statusCode).json({
		success: false,
		error: message,
		// Only include stack trace in development
		...(env.NODE_ENV === "development" && { stack: err.stack }),
	});
};

/**
 * 404 Not Found Handler
 *
 * This catches requests to routes that don't exist.
 * It should be added BEFORE the error handler but AFTER all your routes.
 */
export const notFoundHandler = (
	req: Request,
	res: Response,
	_next: NextFunction,
): void => {
	res.status(StatusCodes.NOT_FOUND).json({
		success: false,
		error: "Not Found",
		message: `Cannot ${req.method} ${req.originalUrl}`,
	});
};
