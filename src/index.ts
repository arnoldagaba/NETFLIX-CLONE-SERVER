import app from "#app.js";
import { env } from "#config/env.js";
import logger from "#utils/logger.js";

const PORT = env.PORT;

app.listen(PORT, () => {
	logger.info(
		{
			port: PORT,
			environment: env.NODE_ENV,
			nodeVersion: process.version,
		},
		"🚀 Server started successfully",
	);

	logger.info(`
  ╔════════════════════════════════════════════════╗
  ║                                                ║
  ║   🚀 Netflix Clone API Started!               ║
  ║                                                ║
  ║   📡 Server: http://localhost:${PORT}              ║
  ║   🏥 Health: http://localhost:${PORT}/health       ║
  ║   👤 User: http://localhost:${PORT}/api/user       ║
  ║   🎬 Movies: http://localhost:${PORT}/api/movies   ║
  ║   📺 TV Shows: http://localhost:${PORT}/api/tv     ║
  ║   📝 Watchlist: http://localhost:${PORT}/api/watchlist
  ║   ⭐ Favorites: http://localhost:${PORT}/api/favorites
  ║   🌍 Environment: ${env.NODE_ENV || "development"}         ║
  ║                                                ║
  ╚════════════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
	logger.info("SIGTERM received, shutting down gracefully...");
	process.exit(0);
});

process.on("SIGINT", () => {
	logger.info("SIGINT received, shutting down gracefully...");
	process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
	logger.error(
		{
			message: error.message,
			stack: error.stack,
		},
		"Uncaught Exception!",
	);
	process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: unknown) => {
	logger.error({ reason }, "Unhandled Rejection!");
	process.exit(1);
});
