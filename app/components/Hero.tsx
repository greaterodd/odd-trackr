import { zodResolver } from "@hookform/resolvers/zod";
import { List, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useHotKey } from "~/lib/hooks";
import { cn } from "~/lib/utils";
import Habit, { formatDateKey } from "./Habit";
import { Button } from "./ui/button";
import { useHabitStore } from "~/lib/stores/habitStore";
import { Input } from "./ui/Input";
import type { Habit as HabitType } from "~/lib/types";
import { Textarea } from "./ui/Textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Link } from "react-router";

// Form validation schema
const habitSchema = z.object({
	title: z
		.string()
		.min(1, "Habit title is required")
		.min(3, "Habit title must be at least 3 characters")
		.max(100, "Habit title must be less than 100 characters"),
	description: z
		.string()
		.max(320, "Description must be less than 500 characters")
		.optional(),
	isGood: z.boolean(),
});

type HabitFormData = z.infer<typeof habitSchema>;

interface HeroProps {
	selectedDate: Date;
	onDateChange: (date: Date) => void;
}

const Hero = ({ selectedDate }: HeroProps) => {
	const { habits, addHabit } = useHabitStore();
	const fetcher = useFetcher();
	const [isGood, setIsGood] = useState(true);

	// Handle fetcher responses
	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data) {
			if (fetcher.data.error) {
				// Handle errors - could revert optimistic updates here if needed
				toast.error("Something went wrong. Please try again.");
				return;
			}

			// Handle successful createHabit response
			if (fetcher.data.id && fetcher.data.title) {
				// Replace the optimistic habit with the real one from the server
				const { deleteHabit, habits: currentHabits } = useHabitStore.getState();

				// Find and remove the optimistic habit
				const optimisticHabit = currentHabits.find(
					(h) => h.isOptimistic && h.title === fetcher.data.title,
				);
				if (optimisticHabit) {
					deleteHabit(optimisticHabit.id);
				}

				// Add the real habit from server
				const habitWithProperDate = {
					...fetcher.data,
					startDate: new Date(fetcher.data.startDate),
				};
				addHabit(habitWithProperDate);
			}

			// Handle successful deleteHabit response
			if (fetcher.data.success && fetcher.data.deletedId) {
				// Delete was successful on server, optimistic update was correct
			}

			// Handle successful toggleHabitCompletion response
			if (fetcher.data.habitId && fetcher.data.date !== undefined) {
				// Completion toggle was successful on server, optimistic update was correct
			}
		}
	}, [fetcher.data, fetcher.state, addHabit]);

	useHotKey(
		"Backspace",
		() => {
			setIsGood((prev) => {
				const newIsGood = !prev;
				toast.success(`Habit type changed to ${newIsGood ? "Good" : "Bad"}`);
				return newIsGood;
			});
		},
		{ shiftKey: true },
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<HabitFormData>({
		resolver: zodResolver(habitSchema),
		defaultValues: {
			isGood: true,
		},
	});

	const onSubmit = (data: HabitFormData) => {
		// Optimistically add the habit immediately
		const optimisticHabit = {
			id: `temp-${Date.now()}`, // Temporary ID
			userId: "current-user", // Will be replaced by server
			title: data.title,
			description: data.description || "",
			isGood: isGood,
			startDate: new Date(selectedDate), // Use selectedDate instead of today
			completions: {},
			completed: false,
			createdAt: new Date(),
			updatedAt: new Date(),
			isOptimistic: true, // Flag to identify optimistic updates
		};

		addHabit(optimisticHabit);
		toast.success("Habit added!");

		const formData = new FormData();
		formData.append("intent", "createHabit");
		formData.append("title", data.title);
		if (data.description) {
			formData.append("description", data.description);
		}
		formData.append("isGood", String(isGood));
		formData.append("startDate", String(optimisticHabit.startDate));
		fetcher.submit(formData, { method: "post" });
		reset();
	};

	const toggleHabitCompletion = (habitId: string, date: Date) => {
		const { habits: currentHabits, updateHabit } = useHabitStore.getState();
		const habit = currentHabits.find((h) => h.id === habitId);

		if (habit) {
			const dateKey = formatDateKey(date);
			const currentCompletion = habit.completions?.[dateKey] || false;
			const newCompletion = !currentCompletion;

			// Optimistically update the store immediately
			updateHabit(habitId, {
				completions: { ...habit.completions, [dateKey]: newCompletion },
				completed: newCompletion,
			});

			// Show immediate feedback
			toast.success(
				newCompletion ? "Marked as completed!" : "Marked as incomplete!",
			);

			// Send to server in background
			fetcher.submit(
				{
					intent: "toggleCompletion",
					habitId,
					date: dateKey,
					completed: String(newCompletion),
				},
				{ method: "post" },
			);
		}
	};

	const deleteHabit = (habitId: string) => {
		// Optimistically remove the habit immediately
		const { deleteHabit: removeHabit } = useHabitStore.getState();
		removeHabit(habitId);
		toast.success("Habit deleted!");

		// Send delete request to server
		fetcher.submit(
			{
				intent: "deleteHabit",
				habitId,
			},
			{ method: "post" },
		);
	};

	// Filter habits to show only those that started on or before the selected date
	const visibleHabits = habits.filter((habit) => {
		// Compare dates by converting both to date strings (YYYY-MM-DD) to avoid time issues
		const habitStartDate = new Date(habit.startDate);
		const selectedDateOnly = new Date(selectedDate);

		// Set both dates to start of day for fair comparison
		habitStartDate.setHours(0, 0, 0, 0);
		selectedDateOnly.setHours(0, 0, 0, 0);

		return habitStartDate <= selectedDateOnly;
	});

	// Update habits with completion status for the selected date
	const habitsForSelectedDate = visibleHabits.map((habit) => {
		const dateKey = formatDateKey(selectedDate);
		const completedForDate = habit.completions?.[dateKey] || false;
		return {
			...habit,
			completed: completedForDate,
		};
	});

	// Count habits that are not completed for the selected date
	const incompleteHabitsCount = habitsForSelectedDate.filter(
		(habit) => !habit.completed,
	).length;

	return (
		<>
			<div className="flex items-center py-2 sm:py-12 md:py-16 lg:py-20 2xl:py-40 flex-col max-w-2xl px-4 mx-auto lg:max-w-4xl">
				<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">Tracker</h1>
				<div className="flex flex-col gap-3 md:gap-4 lg:gap-5">
					<p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-center">
						Change your life, starting today
					</p>
					<div>
						<p className="text-center text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400">
							{selectedDate.toDateString()}
						</p>
					</div>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col gap-3 md:gap-4 lg:gap-5"
					>
						<div className="flex flex-col gap-1 md:gap-2">
							<Input
								{...register("title")}
								placeholder="Add habit title"
								aria-invalid={errors.title ? "true" : "false"}
								className="md:text-lg lg:text-xl"
							/>
							{errors.title && (
								<span className="text-sm md:text-base text-red-500">
									{errors.title.message}
								</span>
							)}
						</div>
						<div className="flex flex-col gap-1 md:gap-2">
							<Textarea
								{...register("description")}
								placeholder="Add description"
								aria-invalid={errors.description ? "true" : "false"}
								className="md:text-lg lg:text-xl"
							/>
							{errors.description && (
								<span className="text-sm md:text-base text-red-500">
									{errors.description.message}
								</span>
							)}
						</div>
						<div className="flex items-center gap-4">
							<Button
								type="submit"
								disabled={isSubmitting}
								className="flex-1 md:text-lg lg:text-xl h-16"
							>
								{isSubmitting ? "Adding..." : "Add Habit"}
							</Button>
							<div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg h-16">
								<Button
									type="button"
									onClick={() => setIsGood(true)}
									className={cn(
										"px-4 py-6 rounded-r-none md:text-base lg:text-lg transition-colors",
										isGood
											? "bg-green-500 hover:bg-green-600 text-white"
											: "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200",
									)}
								>
									Good
								</Button>
								<Button
									type="button"
									onClick={() => setIsGood(false)}
									className={cn(
										"px-4 py-6 rounded-l-none md:text-base lg:text-lg transition-colors",
										!isGood
											? "bg-red-500 hover:bg-red-600 text-white"
											: "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200",
									)}
								>
									Bad
								</Button>
							</div>
						</div>
					</form>
					<div className="flex gap-3">
						<Dialog>
							<DialogTrigger asChild>
								<div className="relative max-w-fit">
									<Button
										variant="outline"
										size="icon"
										className="border border-gray-900 dark:border-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
									>
										<List className="h-5 w-5" />
									</Button>
									{incompleteHabitsCount > 0 && (
										<div className="absolute -top-1 -right-1">
											<span className="relative flex h-3 w-3">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
												<span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
											</span>
										</div>
									)}
								</div>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Your Habits</DialogTitle>
								</DialogHeader>
								{/* Habits Display Section */}
								<div className="mt-4 w-full max-w-2xl">
									<p className="text-sm text-gray-500 mb-2">
										Total habits: {habits.length}, Visible for{" "}
										{selectedDate.toDateString()}: {visibleHabits.length}
									</p>
									{visibleHabits.length > 0 ? (
										<div className="flex flex-col gap-4">
											{habitsForSelectedDate.map((habit) => (
												<Habit
													key={habit.id}
													habit={{
														...habit,
														description: habit.description ?? "",
													}}
													selectedDate={selectedDate}
													onToggleComplete={toggleHabitCompletion}
													onDeleteHabit={deleteHabit}
												/>
											))}
										</div>
									) : (
										<div>
											<p>No habits to display for this date.</p>
											{habits.length > 0 && (
												<p className="text-sm text-gray-500 mt-2">
													You have {habits.length} habit(s) total, but none
													started on or before {selectedDate.toDateString()}.
												</p>
											)}
										</div>
									)}
								</div>
							</DialogContent>
						</Dialog>
						<Link to="/streaks" prefetch="render">
							<Button
								variant="outline"
								size="icon"
								className="border border-gray-900 dark:border-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
							>
								<Flame className="h-5 w-5 text-orange-500" />
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
};

export default Hero;
