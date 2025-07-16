import { cn } from "~/lib/utils";
import { Button } from "./ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";

export interface HabitData {
	id: string;
	title: string;
	description: string;
	startDate: Date; // When the habit was created
	completions: Record<string, boolean>; // Key: YYYY-MM-DD, Value: completed status
}

interface HabitProps {
	habit: HabitData;
	selectedDate: Date;
	className?: string;
	onToggleComplete: (habitId: string, date: Date) => void;
	onDeleteHabit: (habitId: string) => void;
}

// Helper function to format date as YYYY-MM-DD
export const formatDateKey = (date: Date): string => {
	return date.toISOString().split('T')[0];
};

const Habit = ({ habit, selectedDate, className, onToggleComplete, onDeleteHabit }: HabitProps) => {
	const dateKey = formatDateKey(selectedDate);
	const isCompleted = habit.completions[dateKey] || false;
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	
	const handleDelete = () => {
		onDeleteHabit(habit.id);
		setIsDialogOpen(false);
	};
	
	return (
		<div
			className={cn(
				"bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all",
				isCompleted && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
				className
			)}
		>
			<div className="mb-2">
				<h3 className={cn(
					"text-lg font-semibold",
					isCompleted
						? "text-green-800 dark:text-green-200 line-through"
						: "text-gray-900 dark:text-gray-100"
				)}>
					{habit.title}
				</h3>
			</div>
			<p className={cn(
				"text-sm mb-3",
				isCompleted
					? "text-green-700 dark:text-green-300"
					: "text-gray-600 dark:text-gray-300"
			)}>
				{habit.description}
			</p>
			<div className="flex justify-between items-center text-xs">
				<span className="text-gray-400 dark:text-gray-500">
					Started: {habit.startDate.toLocaleDateString()}
				</span>
				<div className="flex items-center gap-2">
					{isCompleted && (
						<span className="text-green-600 dark:text-green-400">
							Completed: {selectedDate.toLocaleDateString()}
						</span>
					)}
					<Button
						size="sm"
						variant={isCompleted ? "default" : "outline"}
						onClick={() => onToggleComplete(habit.id, selectedDate)}
						className={cn(
							"shrink-0",
							isCompleted && "bg-green-600 hover:bg-green-700"
						)}
					>
						{isCompleted ? "✓ Done" : "Mark Done"}
					</Button>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button
								variant="destructive"
								size="sm"
								className="px-3 py-1.5"
							>
								Delete
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Delete Habit</DialogTitle>
								<DialogDescription>
									Are you sure you want to delete the habit "{habit.title}"? This action cannot be undone.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									variant="destructive"
									onClick={handleDelete}
								>
									Delete Habit
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	);
};

export default Habit;