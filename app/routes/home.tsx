import {
	type ActionFunctionArgs,
	isRouteErrorResponse,
	type LoaderFunctionArgs,
	useLoaderData,
} from "react-router";
import type { Route } from "./+types/home";
import { useUser } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import HabitTracker from "../components/HabitTracker";
import { habitService, habitCompletionService } from "../lib/db/services";
import { ensureUserExists } from "../lib/auth/user-sync";
import { randomUUID } from "node:crypto";
import { useOptimisticHabits } from "../lib/hooks/useOptimisticHabits";
import type { Habit } from "~/lib/types";
import { json } from "~/lib/utils";
import { Sparkles, ArrowRight, Lock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router"

interface LoaderData {
	habits: Habit[];
	isAuthenticated: boolean;
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: "Trackr | Be one percent better every day" },
    { name: "description", content: "Welcome to your next project!" },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return json({ habits: [], isAuthenticated: false });
  }

  try {
    // Ensure user exists in our database
    await ensureUserExists(userId);

    // Load user's habits
    const dbHabits = await habitService.getUserHabits(userId);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Get ALL completions for user in one query (instead of N queries)
    const allCompletions =
      await habitCompletionService.getAllUserCompletions(userId);

    // Group completions by habitId for efficient lookup
    const completionsByHabit: Record<string, Record<string, boolean>> = {};
    for (const completion of allCompletions) {
      if (!completionsByHabit[completion.habitId]) {
        completionsByHabit[completion.habitId] = {};
      }
      completionsByHabit[completion.habitId][completion.date] =
        completion.completed;
    }

    // Transform database habits to match UI interface
    const habits = dbHabits.map((habit) => {
      const completionsMap = completionsByHabit[habit.id] || {};

      return {
        ...habit,
        startDate: new Date(habit.startDate), // Convert timestamp to Date
        completions: completionsMap,
        completed: completionsMap[today] || false, // Set today's completion status
      };
    });

    return json({ habits, isAuthenticated: true });
  } catch (error) {
    console.error("Error loading habits:", error);
    // Return empty habits array on error rather than throwing
    return json({ habits: [], isAuthenticated: false });
  }
}

// Action handlers map - much cleaner than switch statements
const actionHandlers = {
  async createHabit(formData: FormData, userId: string) {
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || undefined;
    const isGood = formData.get("isGood") as string;
    const startDate = formData.get("startDate") as string;

    const newHabit = await habitService.createHabit({
      id: randomUUID(),
      userId,
      title,
      description,
      isGood: isGood === "true",
      startDate: startDate ? new Date(startDate) : new Date(),
    });

    // Transform the new habit to match UI interface
    return {
      ...newHabit,
      startDate: new Date(newHabit.startDate),
      completions: {},
      completed: false,
    };
  },

  async toggleCompletion(formData: FormData, userId: string) {
    const habitId = formData.get("habitId") as string;
    const date = formData.get("date") as string;
    const completed = formData.get("completed") as string;

    return await habitCompletionService.setCompletion({
      id: randomUUID(),
      habitId,
      date,
      completed: completed === "true",
    });
  },

  async deleteHabit(formData: FormData, userId: string) {
    const habitId = formData.get("habitId") as string;
    await habitService.deleteHabit(habitId);
    return { success: true, deletedId: habitId };
  },
};

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await args.request.formData();
    const intent = formData.get("intent") as string;

    const handler = actionHandlers[intent as keyof typeof actionHandlers];
    if (!handler) {
      return json({ error: "Invalid intent" }, { status: 400 });
    }

    const result = await handler(formData, userId);
    return json(result);
  } catch (error) {
    console.error("Action error:", error);
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

export default function Home() {
	const { habits: serverHabits, isAuthenticated } =
		useLoaderData() as LoaderData;
  const { isSignedIn, user, isLoaded } = useUser();
  const { habits, isFromCache } = useOptimisticHabits(serverHabits, user?.id);

  // Determine auth state: use loader's value initially, then Clerk's once loaded
  const showSignInPrompt = isLoaded ? !isSignedIn : !isAuthenticated;

  if (showSignInPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Animated icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-pulse">
              <Sparkles className="w-16 h-16 mx-auto text-green-500/30" />
            </div>
            <Sparkles className="w-16 h-16 mx-auto text-green-600 animate-bounce" />
          </div>
          
          {/* Main message */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-balance leading-tight">
              <span className="text-foreground">Pal, please</span>
              <br />
              <span className="text-green-600 relative">
                change your life
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
              Start building better habits today and transform your daily routine into a path of growth
            </p>
          </div>
          
          {/* Call to action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/sign-in">
             <Button 
              variant="outline" 
              size="lg"
              className="group transition-all duration-300 hover:scale-105"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Lock className="w-4 h-4 mr-2" />
              Sign In Above
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
           </div>
          
          {/* Features preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Track Daily Progress</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Build Lasting Habits</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Visualize Streaks</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <HabitTracker initialHabits={habits} isFromCache={isFromCache} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
