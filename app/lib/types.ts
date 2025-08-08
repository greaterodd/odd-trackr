import type { Habit as DbHabit, HabitCompletion as DbHabitCompletion } from "./db/schema";

export interface Habit extends DbHabit {
  completed?: boolean;
  isOptimistic?: boolean;
  completions?: Record<string, boolean>;
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  completed: boolean;
}

export interface HabitWithStreaks extends Habit {
  currentStreak: number;
  longestStreak: number;
}

export interface LoaderData {
  habits: HabitWithStreaks[];
  isAuthenticated: boolean;
}
