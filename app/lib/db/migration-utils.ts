import type { Habit, HabitCompletion } from "./schema";
import { habitCompletionService, habitService } from "./services";

interface HabitData {
	id: string;
	title: string;
	description?: string;
	isGood: boolean;
	startDate: Date;
	completions: Record<string, boolean>;
}

// Utility to generate unique IDs (simple implementation)
function generateId(): string {
	return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Convert localStorage habit data to database format
export async function migrateLocalStorageToDatabase(
	userId: string,
	localHabits: HabitData[],
): Promise<void> {
	console.log(
		`Starting migration of ${localHabits.length} habits for user ${userId}`,
	);

	for (const localHabit of localHabits) {
		try {
			// Create the habit in the database
			const dbHabit = await habitService.createHabit({
				id: localHabit.id, // Keep the same ID to maintain consistency
				userId,
				title: localHabit.title,
				description: localHabit.description,
				isGood: localHabit.isGood,
				startDate: localHabit.startDate,
			});

			// Migrate all completions for this habit
			const completionPromises = Object.entries(
				localHabit.completions ?? {},
			).map(([date, completed]) =>
				habitCompletionService.setCompletion({
					id: generateId(),
					habitId: dbHabit.id,
					date,
					completed: completed === true,
				}),
			);

			await Promise.all(completionPromises);
			console.log(
				`Migrated habit: ${localHabit.title} with ${Object.keys(localHabit.completions ?? {}).length} completions`,
			);
		} catch (error) {
			console.error(`Failed to migrate habit ${localHabit.title}:`, error);
		}
	}

	console.log("Migration completed successfully!");
}

// Convert database habits back to localStorage format (for backward compatibility)
export function convertDbHabitsToLocalFormat(
	dbHabits: Habit[],
	completions: HabitCompletion[],
): HabitData[] {
	const completionsByHabit = completions.reduce<
		Record<string, Record<string, boolean>>
	>((acc, completion) => {
		if (!acc[completion.habitId]) {
			acc[completion.habitId] = {};
		}
		acc[completion.habitId][completion.date] = completion.completed;
		return acc;
	}, {});

	return dbHabits.map((habit) => {
		return {
			id: habit.id,
			title: habit.title,
			description: habit.description || "",
			isGood: habit.isGood,
			startDate: new Date(habit.startDate),
			completions: completionsByHabit[habit.id] ?? {},
		};
	});
}
