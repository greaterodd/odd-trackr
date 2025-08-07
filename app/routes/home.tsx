import {
  type ActionFunctionArgs,
  isRouteErrorResponse,
  type LoaderFunctionArgs,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/home";
import type { Habit } from "../lib/stores/habitStore";
import { useUser } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import HabitTracker from "../components/HabitTracker";
import { habitService, habitCompletionService } from "../lib/db/services";
import { ensureUserExists } from "../lib/auth/user-sync";
import { randomUUID } from "node:crypto";
import { useOptimisticAuth } from "../lib/hooks/useOptimisticAuth";
import { useOptimisticHabits } from "../lib/hooks/useOptimisticHabits";

// Simple type for valid action intents
type ActionIntent = "createHabit" | "toggleCompletion" | "deleteHabit";

// Helper function for JSON responses
function json<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
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
    useLoaderData<typeof loader>();
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useOptimisticAuth();
  const { habits, isFromCache } = useOptimisticHabits(serverHabits, user?.id);

  // Determine auth state: use loader's value initially, then Clerk's once loaded
  const showSignInPrompt = isLoaded ? !isSignedIn : !isAuthenticated;

  if (showSignInPrompt) {
    return (
      <div className="text-center">
        Pal, please authenticate above to change your life
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
