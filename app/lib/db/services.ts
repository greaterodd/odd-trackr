import { and, eq } from "drizzle-orm";
import { db } from "./connection";
import {
	type NewHabit,
	type NewHabitCompletion,
	type NewUser,
	habitCompletions,
	habits,
	users,
} from "./schema";

// User service functions
export const userService = {
	async createUser(userData: NewUser) {
		const [user] = await db.insert(users).values(userData).returning();
		return user;
	},

	async getUserByEmail(email: string) {
		const [user] = await db.select().from(users).where(eq(users.email, email));
		return user;
	},

	async getUserById(userId: string) {
		const [user] = await db.select().from(users).where(eq(users.id, userId));
		return user;
	},

	async updateUser(userId: string, updates: Partial<NewUser>) {
		const [user] = await db
			.update(users)
			.set({ ...updates, updatedAt: new Date() })
			.where(eq(users.id, userId))
			.returning();
		return user;
	},
};

// Habit service functions
export const habitService = {
	async createHabit(habitData: NewHabit) {
		const [habit] = await db.insert(habits).values(habitData).returning();
		return habit;
	},

	async getUserHabits(userId: string) {
		return await db.select().from(habits).where(eq(habits.userId, userId));
	},

	async updateHabit(habitId: string, updates: Partial<NewHabit>) {
		const [habit] = await db
			.update(habits)
			.set({ ...updates, updatedAt: new Date() })
			.where(eq(habits.id, habitId))
			.returning();
		return habit;
	},

	async deleteHabit(habitId: string) {
		await db.delete(habits).where(eq(habits.id, habitId));
	},

	async getHabitById(habitId: string) {
		const [habit] = await db
			.select()
			.from(habits)
			.where(eq(habits.id, habitId));
		return habit;
	},
};

// Habit completion service functions
export const habitCompletionService = {
	async setCompletion(completionData: NewHabitCompletion) {
		// First, try to find existing completion for this habit and date
		const [existing] = await db
			.select()
			.from(habitCompletions)
			.where(
				and(
					eq(habitCompletions.habitId, completionData.habitId),
					eq(habitCompletions.date, completionData.date),
				),
			);

		if (existing) {
			// Update existing completion
			const [updated] = await db
				.update(habitCompletions)
				.set({
					completed: completionData.completed,
					updatedAt: new Date(),
				})
				.where(eq(habitCompletions.id, existing.id))
				.returning();
			return updated;
		}
		// Create new completion
		const [completion] = await db
			.insert(habitCompletions)
			.values(completionData)
			.returning();
		return completion;
	},

	async getHabitCompletions(habitId: string) {
		return await db
			.select()
			.from(habitCompletions)
			.where(eq(habitCompletions.habitId, habitId));
	},

	async getUserCompletionsForDate(userId: string, date: string) {
		return await db
			.select({
				habitId: habitCompletions.habitId,
				date: habitCompletions.date,
				completed: habitCompletions.completed,
				habitTitle: habits.title,
			})
			.from(habitCompletions)
			.innerJoin(habits, eq(habits.id, habitCompletions.habitId))
			.where(and(eq(habits.userId, userId), eq(habitCompletions.date, date)));
	},

	async deleteCompletion(habitId: string, date: string) {
		await db
			.delete(habitCompletions)
			.where(
				and(
					eq(habitCompletions.habitId, habitId),
					eq(habitCompletions.date, date),
				),
			);
	},
};
