import { getAuth } from "@clerk/react-router/ssr.server";
import { ArrowLeft, Flame } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import type {
  HabitCompletion,
  HabitWithStreaks,
  LoaderData,
} from "~/lib/types";
import { json } from "~/lib/utils";


// Optimized streak calculation function
function calculateStreaks(
  completions: HabitCompletion[],
  isGood: boolean
): Pick<HabitWithStreaks, "currentStreak" | "longestStreak"> {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Determine success days based on habit type:
  // - Good habits: completed === true is a success
  // - Bad habits: completed === false (avoided) is a success
  const successDates = completions
    .filter((c) => (isGood ? c.completed === true : c.completed === false))
    .map((c) => new Date(c.date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (successDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 1;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Calculate current streak
  const mostRecentDate = new Date(successDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  if (
    mostRecentDate.getTime() === today.getTime() ||
    mostRecentDate.getTime() === yesterday.getTime()
  ) {
    currentStreak = 1;
    let lastDate = mostRecentDate;

    for (let i = 1; i < successDates.length; i++) {
      const currentDate = new Date(successDates[i]);
      currentDate.setHours(0, 0, 0, 0);

      const dayDiff =
        (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        currentStreak++;
        lastDate = currentDate;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  longestStreak = currentStreak;
  if (successDates.length > 0) {
    tempStreak = 1;
    for (let i = 1; i < successDates.length; i++) {
      const prevDate = new Date(successDates[i - 1]);
      const currentDate = new Date(successDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      const dayDiff =
        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

      // Using exact 1-day difference; assumes no gaps in success days

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return {
    currentStreak,
    longestStreak,
  };
}

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return json({ habits: [], isAuthenticated: false });
  }

  try {
    const { habitService } = await import("~/lib/db/services");
    const habitsWithCompletions =
      await habitService.getHabitsWithCompletions(userId);

    const habitsWithStreaks: HabitWithStreaks[] = habitsWithCompletions.map(
      ({ habit, completions }) => {
        const streaks = calculateStreaks(completions, habit.isGood);
        return { ...habit, ...streaks };
      },
    );

    return json({ habits: habitsWithStreaks, isAuthenticated: true });
  } catch (error) {
    console.error("Error loading streaks:", error);
    return json({ habits: [], isAuthenticated: true });
  }
}

export default function StreaksPage() {
  const { habits } = useLoaderData() as LoaderData;

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Header with back link */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-6"
            prefetch="intent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
              Your Streaks
            </h1>
          </div>
        </div>

        {/* Content */}
        {habits.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="mx-auto max-w-md">
              <Flame className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No habits yet
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Once you start tracking habits, your streaks will appear here.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Your First Habit
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {habits.map((habit: HabitWithStreaks) => (
              <div
                key={habit.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
              >
                {/* Habit info */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {habit.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 h-10">
                    {habit.description || "No description"}
                  </p>
                </div>

                {/* Streak stats */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="text-3xl font-bold text-orange-500">
                        {habit.currentStreak}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Current Streak
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="text-3xl font-bold text-blue-500">
                        {habit.longestStreak}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Best Streak
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
