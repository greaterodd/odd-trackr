import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";
import Habit, { type HabitData, formatDateKey } from "./Habit";

// Form validation schema
const habitSchema = z.object({
	title: z
		.string()
		.min(1, "Habit title is required")
		.min(3, "Habit title must be at least 3 characters")
		.max(100, "Habit title must be less than 100 characters"),
	description: z
		.string()
		.min(1, "Description is required")
		.min(10, "Description must be at least 10 characters")
		.max(500, "Description must be less than 500 characters"),
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
						startDate: new Date(habit.createdAt),
						completions: habit.completedToday ? { [formatDateKey(new Date())]: true } : {},
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

const Hero = ({ selectedDate, onDateChange }: HeroProps) => {
	const [habits, setHabits] = useState<HabitData[]>([]);
	const [isInitialized, setIsInitialized] = useState(false);
	
	// Load habits from localStorage on component mount
	useEffect(() => {
		const loadedHabits = loadHabitsFromStorage();
		setHabits(loadedHabits);
		setIsInitialized(true);
	}, []);
	
	// Save habits to localStorage whenever habits state changes (but not on initial load)
	useEffect(() => {
		if (isInitialized) {
			saveHabitsToStorage(habits);
		}
	}, [habits, isInitialized]);
	
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<HabitFormData>({
		resolver: zodResolver(habitSchema),
	});

	const onSubmit = async (data: HabitFormData) => {
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			
			// Create new habit
			const newHabit: HabitData = {
				id: crypto.randomUUID(),
				title: data.title,
				description: data.description,
				startDate: selectedDate,
				completions: {},
			};
			
			// Add habit to state
			setHabits((prevHabits) => [newHabit, ...prevHabits]);
			
			console.log("Habit created:", newHabit);
			reset();
		} catch (error) {
			console.error("Error creating habit:", error);
		}
	};

	const toggleHabitCompletion = (habitId: string, date: Date) => {
		const dateKey = formatDateKey(date);
		setHabits((prevHabits) =>
			prevHabits.map((habit) =>
				habit.id === habitId
					? {
							...habit,
							completions: {
								...habit.completions,
								[dateKey]: !habit.completions[dateKey],
							},
					  }
					: habit
			)
		);
	};

	const deleteHabit = (habitId: string) => {
		setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== habitId));
	};

	// Filter habits to show only those that started on or before the selected date
	const visibleHabits = habits.filter(habit => habit.startDate <= selectedDate);

	return (
		<div className="flex items-center py-12 flex-col">
			<h1 className="text-5xl font-bold">Tracker</h1>
			<div className="flex flex-col gap-3">
				<p className="text-3xl font-semibold mb-2">The to-do list that helps you form good habits</p>
				<div className="text-center mb-4">
					<p className="text-lg text-gray-600 dark:text-gray-400">
						{selectedDate.toDateString()}
					</p>
				</div>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
					<div className="flex flex-col gap-1">
						<Input
							{...register("title")}
							placeholder="Add habit title"
							aria-invalid={errors.title ? "true" : "false"}
						/>
						{errors.title && (
							<span className="text-sm text-red-500">{errors.title.message}</span>
						)}
					</div>
					<div className="flex flex-col gap-1">
						<Textarea
							{...register("description")}
							placeholder="Add description"
							aria-invalid={errors.description ? "true" : "false"}
						/>
						{errors.description && (
							<span className="text-sm text-red-500">{errors.description.message}</span>
						)}
					</div>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Adding habit..." : "Add habit"}
					</Button>
				</form>
			</div>
			
			{/* Habits Display Section */}
			{visibleHabits.length > 0 && (
				<div className="mt-12 w-full max-w-2xl">
					<h2 className="text-2xl font-semibold mb-6 text-center">Your Habits</h2>
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
			)}
		</div>
	);
};

export default Hero;
