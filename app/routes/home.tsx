import { useUser } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	isRouteErrorResponse,
	useLoaderData,
} from "react-router";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import type { Habit } from "~/lib/types";
import { json } from "~/lib/utils";
import HabitTracker from "../components/HabitTracker";
import { ensureUserExists } from "../lib/auth/user-sync";
import { habitCompletionService, habitService } from "../lib/db/services";
import { useOptimisticHabits } from "../lib/hooks/useOptimisticHabits";
import type { Route } from "./+types/home";

interface LoaderData {
	habits: Habit[];
	isAuthenticated: boolean;
}

export function meta() {
	return [
		{ title: "Trackr | Be one percent better every day" },
		{
			name: "description",
			content: "Build healthier routines and track your habit progress daily.",
		},
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

		// Load habits and completions in parallel once user sync is done.
		const [dbHabits, allCompletions] = await Promise.all([
			habitService.getUserHabits(userId),
			habitCompletionService.getAllUserCompletions(userId),
		]);

		const today = new Date().toISOString().split("T")[0];

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
			id: crypto.randomUUID(),
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

	async toggleCompletion(formData: FormData, _userId: string) {
		const habitId = formData.get("habitId") as string;
		const date = formData.get("date") as string;
		const completed = formData.get("completed") as string;

		return await habitCompletionService.setCompletion({
			id: crypto.randomUUID(),
			habitId,
			date,
			completed: completed === "true",
		});
	},

	async deleteHabit(formData: FormData, _userId: string) {
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
						<div className="absolute inset-0 motion-safe:animate-pulse">
							<Sparkles
								className="mx-auto h-16 w-16 text-green-500/30"
								aria-hidden="true"
							/>
						</div>
						<Sparkles
							className="mx-auto h-16 w-16 text-green-600 motion-safe:animate-bounce"
							aria-hidden="true"
						/>
					</div>

					{/* Main message */}
					<div className="space-y-4">
						<h1 className="text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-balance leading-tight">
							<span className="text-foreground">Build momentum</span>
							<br />
							<span className="text-green-600 relative">
								one day at a time
								<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full" />
							</span>
						</h1>

						{/* Subtitle */}
						<p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto">
							Start building better habits today and transform your daily
							routine into a path of growth
						</p>
					</div>

					{/* Call to action */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
						<Button
							asChild
							variant="outline"
							size="lg"
							className="group transition-transform duration-300 hover:scale-105"
						>
							<Link to="/sign-in">
								<Lock className="mr-2 h-4 w-4" aria-hidden="true" />
								Sign in
								<ArrowRight
									className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
									aria-hidden="true"
								/>
							</Link>
						</Button>
					</div>

					{/* Features preview */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-sm text-muted-foreground">
						<div className="flex items-center justify-center gap-2">
							<div
								className="h-2 w-2 rounded-full bg-green-500"
								aria-hidden="true"
							/>
							<span>Track Daily Progress</span>
						</div>
						<div className="flex items-center justify-center gap-2">
							<div
								className="h-2 w-2 rounded-full bg-blue-500"
								aria-hidden="true"
							/>
							<span>Build Lasting Habits</span>
						</div>
						<div className="flex items-center justify-center gap-2">
							<div
								className="h-2 w-2 rounded-full bg-emerald-500"
								aria-hidden="true"
							/>
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
