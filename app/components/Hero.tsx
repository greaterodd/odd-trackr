import { zodResolver } from "@hookform/resolvers/zod";
import { List } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { usePersistentState } from "~/lib/hooks";
import { useHotKey } from "~/lib/hooks";
import { cn } from "~/lib/utils";
import Habit, { type HabitData, formatDateKey } from "./Habit";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

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

const HABITS_STORAGE_KEY = "odd-trackr-habits";

// Helper functions for localStorage
const saveHabitsToStorage = (habits: HabitData[]) => {
	try {
		localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
	} catch (error) {
		console.error("Failed to save habits to localStorage:", error);
	}
};

const loadHabitsFromStorage = (): HabitData[] => {
	try {
		const stored = localStorage.getItem(HABITS_STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			// Convert date strings back to Date objects and handle legacy data
			return parsed.map((habit: any) => {
				// Handle legacy data structure
				if (habit.createdAt && !habit.startDate) {
					return {
						id: habit.id,
						title: habit.title,
						description: habit.description,
						isGood: habit.isGood,
						startDate: new Date(habit.createdAt),
						completions: habit.completedToday
							? { [formatDateKey(new Date())]: true }
							: {},
					};
				}
				// Handle new data structure
				return {
					...habit,
					startDate: new Date(habit.startDate),
					completions: habit.completions || {},
				};
			});
		}
	} catch (error) {
		console.error("Failed to load habits from localStorage:", error);
	}
	return [];
};

const Hero = ({ selectedDate }: HeroProps) => {
	const [habits, setHabits] = usePersistentState<HabitData[]>(
		HABITS_STORAGE_KEY,
		[],
		{
			parse: (value: string) => {
				const parsed = JSON.parse(value);
				return parsed.map((habit: any) => {
					if (habit.createdAt && !habit.startDate) {
						return {
							id: habit.id,
							title: habit.title,
							description: habit.description,
							isGood: habit.isGood,
							startDate: new Date(habit.createdAt),
							completions: habit.completedToday
								? { [formatDateKey(new Date())]: true }
								: {},
						};
					}
					return {
						...habit,
						startDate: new Date(habit.startDate),
						completions: habit.completions || {},
					};
				});
			},
			stringify: JSON.stringify,
		},
	);
	const [isGood, setIsGood] = useState(true);

	useHotKey(
		"T",
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
		try {
			// Create new habit
			const newHabit: HabitData = {
				id: crypto.randomUUID(),
				title: data.title,
				description: data.description ?? "",
				isGood,
				startDate: selectedDate,
				completions: {},
			};

			// Add habit to state
			setHabits((prevHabits: HabitData[]) => [newHabit, ...prevHabits]);

			console.log("Habit created:", newHabit);
			reset();
		} catch (error) {
			console.error("Error creating habit:", error);
		}
	};

	const toggleHabitCompletion = (habitId: string, date: Date) => {
		const dateKey = formatDateKey(date);
		setHabits((prevHabits: HabitData[]) =>
			prevHabits.map((habit: HabitData) =>
				habit.id === habitId
					? {
							...habit,
							completions: {
								...habit.completions,
								[dateKey]: !habit.completions[dateKey],
							},
						}
					: habit,
			),
		);
	};

	const deleteHabit = (habitId: string) => {
		setHabits((prevHabits: HabitData[]) =>
			prevHabits.filter((habit: HabitData) => habit.id !== habitId),
		);
	};

	// Filter habits to show only those that started on or before the selected date
	const visibleHabits = habits.filter(
		(habit) => habit.startDate <= selectedDate,
	);
	// Count habits that are not completed for the selected date
	const incompleteHabitsCount = visibleHabits.filter(
		(habit) => !habit.completions[formatDateKey(selectedDate)],
	).length;

	return (
		<>
			<div className="flex items-center py-12 md:py-16 lg:py-20 flex-col">
				<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">Tracker</h1>
				<div className="flex flex-col gap-3 md:gap-4 lg:gap-5">
					<p className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-2">
						The to-do list that helps you form good habits
					</p>
					<div className="text-center mb-4 md:mb-6">
						<p className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400">
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
							<div className="flex items-center justify-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg h-16">
								<Button
									type="button"
									onClick={() => setIsGood(true)}
									className={cn(
										"px-4 md:text-base lg:text-lg transition-colors",
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
										"px-4 md:text-base lg:text-lg transition-colors",
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
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Your Habits</DialogTitle>
							</DialogHeader>
							{/* Habits Display Section */}
							{visibleHabits.length > 0 ? (
								<div className="mt-4 w-full max-w-2xl">
									<div className="flex flex-col gap-4">
										{visibleHabits.map((habit) => (
											<Habit
												key={habit.id}
												habit={habit}
												selectedDate={selectedDate}
												onToggleComplete={toggleHabitCompletion}
												onDeleteHabit={deleteHabit}
											/>
										))}
									</div>
								</div>
							) : (
								<p>No habits to display for this date.</p>
							)}
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</>
	);
};

export default Hero;
