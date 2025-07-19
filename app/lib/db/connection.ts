import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Validate environment variables
if (!process.env.TURSO_DATABASE_URL) {
	throw new Error("TURSO_DATABASE_URL is not defined");
}

if (!process.env.TURSO_AUTH_TOKEN) {
	throw new Error("TURSO_AUTH_TOKEN is not defined");
}

// Create the database client
const client = createClient({
	url: process.env.TURSO_DATABASE_URL,
	authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create the drizzle database instance
export const db = drizzle(client, { schema });

// Export the client for direct access if needed
export { client };
