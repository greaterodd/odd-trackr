import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./app/lib/db/schema.ts",
	out: "./drizzle",
	dialect: "sqlite",
	dbCredentials: {
		// The TURSO_DATABASE_URL is expected to be present in the .env file
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		url: process.env.TURSO_DATABASE_URL!,
	},
});
