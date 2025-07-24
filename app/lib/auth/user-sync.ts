import { createClerkClient } from "@clerk/backend";
import { userService } from "../db/services";

const clerkClient = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Ensures a user exists in our database, creating them if necessary
 * This handles the sync between Clerk and our local database
 */
export async function ensureUserExists(userId: string) {
	// Check if user already exists in our database
	let dbUser = await userService.getUserById(userId);

	if (dbUser) {
		return dbUser;
	}

	// User doesn't exist, try to create from Clerk data
	try {
		const clerkUser = await clerkClient.users.getUser(userId);
		const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;

		if (!primaryEmail) {
			throw new Error("No email address found for user");
		}

		// Check if user exists by email (in case of ID mismatch)
		dbUser = await userService.getUserByEmail(primaryEmail);

		if (!dbUser) {
			// Create new user
			dbUser = await userService.createUser({
				id: userId,
				email: primaryEmail,
				name: clerkUser.firstName ?? "User",
			});
		}

		return dbUser;
	} catch (error) {
		console.error("Error during user sync:", error);
		throw new Error("Failed to sync user data");
	}
}