import { isRouteErrorResponse, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/home";
import type { Habit } from "../lib/stores/habitStore";
import { useUser } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { createClerkClient } from "@clerk/backend";
import HabitTracker from "../components/HabitTracker";
import { habitService, habitCompletionService, userService } from "../lib/db/services";
import { randomUUID } from "node:crypto";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

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
		{ title: "Make it your own | Transformative" },
		{ name: "description", content: "Welcome to your next project!" },
	];
}

export async function loader(args: LoaderFunctionArgs) {
	const { userId } = await getAuth(args);
	if (!userId) {
		return json({ habits: [] });
	}

	// Get or create user in our database
	let dbUser = await userService.getUserById(userId);

	if (!dbUser) {
		try {
			const clerkUser = await clerkClient.users.getUser(userId);
			const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;

			if (primaryEmail) {
				// Try to find user by email before creating
				dbUser = await userService.getUserByEmail(primaryEmail);

				if (!dbUser) {
					dbUser = await userService.createUser({
						id: userId,
						email: primaryEmail,
						name: clerkUser.firstName ?? "User",
					});
				}
			}
		} catch (error) {
			console.error("Error during user sync:", error);
		}
	}

	if (!dbUser) {
		return json({ habits: [] });
	}

	const dbHabits = await habitService.getUserHabits(userId);
	
	// Get today's date in YYYY-MM-DD format
	const today = new Date().toISOString().split('T')[0];
	
	// Transform database habits to match UI interface and load completions
	const habits = await Promise.all(dbHabits.map(async (habit) => {
		// Get all completions for this habit
		const completions = await habitCompletionService.getHabitCompletions(habit.id);
		
		// Convert completions array to object with date keys
		const completionsMap: Record<string, boolean> = {};
		completions.forEach(completion => {
			completionsMap[completion.date] = completion.completed;
		});
		
		return {
			...habit,
			startDate: new Date(habit.startDate), // Convert timestamp to Date
			completions: completionsMap,
			completed: completionsMap[today] || false // Set today's completion status
		};
	}));
	
	return json({ habits });
}

export async function action(args: ActionFunctionArgs) {
	const { userId } = await getAuth(args);
	if (!userId) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	const formData = await args.request.formData();
	const { _action, ...values } = Object.fromEntries(formData);

	if (_action === "createHabit") {
		try {
			const title = values.title as string;
			const description = values.description as string | undefined;
			
			const newHabit = await habitService.createHabit({
				id: randomUUID(),
				userId,
				title,
				description,
				isGood: values.isGood === "true",
				startDate: new Date(),
			});
			
			// Transform the new habit to match UI interface
			const transformedHabit = {
				...newHabit,
				startDate: new Date(newHabit.startDate),
				completions: {},
				completed: false
			};
			
			return json(transformedHabit);
		} catch (error) {
			console.error("Error creating habit:", error);
			return json({ error: "Failed to create habit" }, { status: 500 });
		}
	}

	if (_action === "toggleHabitCompletion") {
		try {
			const { habitId, date, completed } = values;
			const updatedCompletion = await habitCompletionService.setCompletion({
				id: randomUUID(),
				habitId: habitId as string,
				date: date as string,
				completed: completed === "true",
			});
			return json(updatedCompletion);
		} catch (error) {
			console.error("Error toggling habit completion:", error);
			return json({ error: "Failed to update habit completion" }, { status: 500 });
		}
	}

	if (_action === "deleteHabit") {
		try {
			const { habitId } = values;
			await habitService.deleteHabit(habitId as string);
			return json({ success: true, deletedId: habitId });
		} catch (error) {
			console.error("Error deleting habit:", error);
			return json({ error: "Failed to delete habit" }, { status: 500 });
		}
	}

	return json({ error: "Invalid action" }, { status: 400 });
}

export default function Home() {
	const { habits } = useLoaderData() as { habits: Habit[] };
	const { isSignedIn, user, isLoaded } = useUser();

	if (!isLoaded) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
					<p className="text-gray-600">Checking authentication...</p>
				</div>
			</div>
		);
	}

	if (!isSignedIn) {
		return (
			<div className="text-center">
				Pal, please authenticate above to change your life
			</div>
		);
	}

	return <HabitTracker initialHabits={habits} />;
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
