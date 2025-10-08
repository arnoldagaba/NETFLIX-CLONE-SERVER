import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Express,
	type Request,
	type Response,
} from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { generalLimiter } from "./middleware/rateLimit.middleware.js";
import appRoutes from "./routes/index.js";
import { env } from "./config/env.js";

const app: Express = express();

// ==================== MIDDLEWARE ====================
// Request logger
app.use(pinoHttp());

// Rate limiting - prevents API abuse
app.use(generalLimiter);

app.use(helmet());

const allowedOrigins = env.ALLOWED_ORIGINS?.split(",") || [
	"http://localhost:5173",
];

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps or Postman)
			if (!origin) return callback(null, true);

			if (allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true, // Allow cookies to be sent
	}),
);

// Parse JSON bodies - this lets us read JSON data from request bodies
// Without this, req.body would be undefined
app.use(express.json());

// Parse URL-encoded bodies (from HTML forms)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==================== ROUTES ====================

// Health check endpoint - this is useful to check if your server is running
// When you visit http://localhost:3000/health you should see the JSON response
app.get("/health", (_req: Request, res: Response) => {
	res.json({
		status: "ok",
		message: "Netflix Clone API is running!",
		timestamp: new Date().toISOString(),
	});
});

app.get("/", (_req: Request, res: Response) => {
	res.json({
		message: "Welcome to Netflix Clone API",
		version: "1.0.0",
		endpoints: {
			health: "/health",
			user: "/api/user",
			movies: "/api/movies",
			tv: "/api/tv",
			watchlist: "/api/watchlist",
		},
	});
});

app.use("/api", appRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler - must come after all routes
app.use(notFoundHandler);

// Global error handler - must be the last middleware
app.use(errorHandler);

export default app;
