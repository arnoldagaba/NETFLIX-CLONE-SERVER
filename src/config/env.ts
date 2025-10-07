import z from "zod";

import "dotenv/config";

const envSchema = z.object({
	// DATABASE
	DATABASE_URL: z.url(),

	// SERVER
	PORT: z.coerce.number().default(3_000),
	NODE_ENV: z.enum(["development", "production"]).default("development"),

	// CORS
	ALLOWED_ORIGINS: z.string(),

	// TMDB
	TMDB_API_KEY: z.string(),
	TMDB_BASE_URL: z.url(),

	// CLERK
	CLERK_PUBLISHABLE_KEY: z.string(),
	CLERK_SECRET_KEY: z.string(),
	CLERK_JWKS_URL: z.url()
});

const _env = envSchema.safeParse(process.env);
if (!_env.success) {
	process.exit(1);
}

export const env = _env.data;
export type Env = typeof env;
