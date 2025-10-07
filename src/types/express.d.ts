import "express";

/**
 * This middleware extends the Express Request type to include auth information
 * Think of this as adding a new pocket to every request where we store user info
 */
declare global {
	namespace Express {
		interface Request {
			auth?: {
				userId: string;
				sessionId: string;
			};
		}
	}
}