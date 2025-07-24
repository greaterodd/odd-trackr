import { sql } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Users table - stores user authentication and profile data
export const users = sqliteTable("users", {
	id: text("id").primaryKey(), // This will store the Clerk User ID
	email: text("email").notNull().unique(),
	name: text("name").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`)
		.$onUpdate(() => new Date()),
});

// Habits table - stores habit definitions
export const habits = sqliteTable(
	"habits",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		description: text("description"),
		isGood: integer("is_good", { mode: "boolean" }).notNull(),
		startDate: integer("start_date", { mode: "timestamp" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`)
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		// Index for fast user habits lookup
		userIdIdx: index("idx_habits_user_id").on(table.userId),
	}),
);

// Habit completions table - stores daily completion status
export const habitCompletions = sqliteTable(
	"habit_completions",
	{
		id: text("id").primaryKey(),
		habitId: text("habit_id")
			.notNull()
			.references(() => habits.id, { onDelete: "cascade" }),
		date: text("date").notNull(), // YYYY-MM-DD format
		completed: integer("completed", { mode: "boolean" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`)
			.$onUpdate(() => new Date()),
	},
	(table) => ({
		// Unique constraint to prevent duplicate completions for same habit+date
		habitDateUnique: uniqueIndex("idx_habit_completions_unique").on(
			table.habitId,
			table.date,
		),
		// Composite index for fast habit+date lookups
		habitDateIdx: index("idx_habit_completions_habit_date").on(
			table.habitId,
			table.date,
		),
		// Index for date-based queries (e.g., "all completions for today")
		dateIdx: index("idx_habit_completions_date").on(table.date),
	}),
);

// Type exports for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;
