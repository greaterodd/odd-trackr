-- Migration: Add indexes and constraints for performance optimization
-- Created: 2024-12-19

-- Add index for fast user habits lookup
CREATE INDEX `idx_habits_user_id` ON `habits` (`user_id`);

-- Add unique constraint to prevent duplicate completions for same habit+date
CREATE UNIQUE INDEX `idx_habit_completions_unique` ON `habit_completions` (`habit_id`, `date`);

-- Add composite index for fast habit+date lookups
CREATE INDEX `idx_habit_completions_habit_date` ON `habit_completions` (`habit_id`, `date`);

-- Add index for date-based queries (e.g., "all completions for today")
CREATE INDEX `idx_habit_completions_date` ON `habit_completions` (`date`);