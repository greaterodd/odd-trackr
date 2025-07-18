import { AlertTriangle } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/Button";

export interface HabitData {
	id: string;
	title: string;
	description: string;
	isGood: boolean;
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
	return date.toISOString().split("T")[0];
};

const Habit = memo(({
	habit,
	selectedDate,
	className,
	onToggleComplete,
	onDeleteHabit,
}: HabitProps) => {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteTimeout, setDeleteTimeout] = useState<NodeJS.Timeout | null>(
		null,
	);

	// Memoize expensive calculations
	const { dateKey, isCompleted, isBadHabitCompleted, isGoodHabitCompleted, formattedStartDate, formattedSelectedDate } = useMemo(() => {
		const dateKey = formatDateKey(selectedDate);
		const isCompleted = habit.completions[dateKey] || false;
		const isBadHabitCompleted = !habit.isGood && !isCompleted;
		const isGoodHabitCompleted = habit.isGood && isCompleted;
		const formattedStartDate = habit.startDate.toLocaleDateString();
		const formattedSelectedDate = selectedDate.toLocaleDateString();
		
		return {
			dateKey,
			isCompleted,
			isBadHabitCompleted,
			isGoodHabitCompleted,
			formattedStartDate,
			formattedSelectedDate,
		};
	}, [habit.completions, habit.isGood, habit.startDate, selectedDate]);

	const handleDeleteClick = useCallback(() => {
		// Clear any existing timeout
		if (deleteTimeout) {
			clearTimeout(deleteTimeout);
		}

		setShowDeleteConfirm(true);

		// Auto-cancel after 6 seconds
		const timeout = setTimeout(() => {
			setShowDeleteConfirm(false);
		}, 6000);
		setDeleteTimeout(timeout);
	}, [deleteTimeout]);

	const handleConfirmDelete = useCallback(() => {
		if (deleteTimeout) {
			clearTimeout(deleteTimeout);
		}
		onDeleteHabit(habit.id);
		setShowDeleteConfirm(false);
	}, [deleteTimeout, onDeleteHabit, habit.id]);

	const handleCancelDelete = useCallback(() => {
		if (deleteTimeout) {
			clearTimeout(deleteTimeout);
		}
		setShowDeleteConfirm(false);
	}, [deleteTimeout]);

	const handleToggleComplete = useCallback(() => {
		onToggleComplete(habit.id, selectedDate);
	}, [onToggleComplete, habit.id, selectedDate]);

	// Clean up timeout on unmount
	useEffect(() => {
		return () => {
			if (deleteTimeout) {
				clearTimeout(deleteTimeout);
			}
		};
	}, [deleteTimeout]);

	return (
		<div
			className={cn(
				"bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all",
				isGoodHabitCompleted &&
					"bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
				isBadHabitCompleted &&
					"bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
				showDeleteConfirm &&
					"border-red-200 dark:border-red-800 shadow-red-100 dark:shadow-red-900/20",
				className,
			)}
		>
			<div className="mb-2 flex items-center gap-2">
				<h3
					className={cn(
						"text-lg font-semibold",
						isGoodHabitCompleted &&
							"text-green-800 dark:text-green-200 line-through",
						isBadHabitCompleted &&
							"text-red-800 dark:text-red-200 line-through",
						!isGoodHabitCompleted &&
							!isBadHabitCompleted &&
							"text-gray-900 dark:text-gray-100",
					)}
				>
					{habit.title}
				</h3>
				<span
					className={cn(
						"text-xs font-semibold px-2 py-1 rounded-full",
						habit.isGood
							? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
							: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
					)}
				>
					{habit.isGood ? "Good" : "Bad"}
				</span>
			</div>
			<p
				className={cn(
					"text-sm mb-3",
					isGoodHabitCompleted && "text-green-700 dark:text-green-300",
					isBadHabitCompleted && "text-red-700 dark:text-red-300",
					!isGoodHabitCompleted &&
						!isBadHabitCompleted &&
						"text-gray-600 dark:text-gray-300",
				)}
			>
				{habit.description}
			</p>
			<div className="flex justify-between items-center text-xs">
				<span className="text-gray-400 dark:text-gray-500">
					Started: {formattedStartDate}
				</span>
				<div className="flex items-center gap-2">
					{showDeleteConfirm ? (
						<div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 shadow-sm animate-in fade-in duration-200">
							<AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
							<span className="text-xs font-medium text-red-700 dark:text-red-300 mr-1">
								Delete?
							</span>
							<div className="flex gap-1">
								<Button
									variant="destructive"
									size="sm"
									className="px-2.5 py-1 text-xs h-7 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-sm"
									onClick={handleConfirmDelete}
								>
									Yes
								</Button>
								<Button
									variant="secondary"
									size="sm"
									className="px-2.5 py-1 text-xs h-7 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-md shadow-sm"
									onClick={handleCancelDelete}
								>
									No
								</Button>
							</div>
						</div>
					) : (
						<>
							{isGoodHabitCompleted && (
								<span className="text-green-600 dark:text-green-400">
									Completed: {formattedSelectedDate}
								</span>
							)}
							{isBadHabitCompleted && (
								<span className="text-red-600 dark:text-red-400">
									Avoided: {formattedSelectedDate}
								</span>
							)}
							<Button
								size="sm"
								variant={
									isGoodHabitCompleted || isBadHabitCompleted
										? "default"
										: "outline"
								}
								onClick={handleToggleComplete}
								className={cn(
									"shrink-0 transition-all",
									isGoodHabitCompleted && "bg-green-600 hover:bg-green-700",
									isBadHabitCompleted && "bg-red-600 hover:bg-red-700",
								)}
							>
								{isGoodHabitCompleted || isBadHabitCompleted
									? "✓ Done"
									: "Mark Done"}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="px-3 py-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
								onClick={handleDeleteClick}
							>
								Delete
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
});

Habit.displayName = "Habit";

export default Habit;
