import { AlertTriangle, Check, X, Trash2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import type { Habit as HabitData } from "~/lib/types";

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

const Habit = memo(
	({
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
		const {
			dateKey,
			isCompleted,
			isBadHabitAvoided,
			isGoodHabitCompleted,
			formattedStartDate,
			formattedSelectedDate,
		} = useMemo(() => {
			const dateKey = formatDateKey(selectedDate);
			const isCompleted = habit.completions?.[dateKey];
			
			// For bad habits: undefined/null/true = did the bad thing (default state)
			// false = explicitly marked as avoided
			
			// For good habits: undefined/null/false = not done, true = completed
			const isBadHabitAvoided = !habit.isGood && isCompleted === false;
			const isGoodHabitCompleted = habit.isGood && isCompleted === true;
			
			const formattedStartDate = habit.startDate.toLocaleDateString();
			const formattedSelectedDate = selectedDate.toLocaleDateString();

			return {
				dateKey,
				isCompleted,
				isBadHabitAvoided,
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
					"bg-card border border-border rounded-xl p-4 transition-all hover:shadow-sm",
					// Good habit completed - green success state
					isGoodHabitCompleted && "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800",
					// Bad habit avoided - green success state  
					isBadHabitAvoided && "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800",
					// Bad habit default state (did the bad thing) - red warning state
					!habit.isGood && !isBadHabitAvoided && "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
					className,
				)}
			>
				{/* Header */}
				<div className="flex items-start justify-between mb-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<h3 className={cn(
								"font-medium text-base truncate",
								// Good habit completed - green
								isGoodHabitCompleted && "text-green-700 dark:text-green-300",
								// Bad habit avoided - green (success)
								isBadHabitAvoided && "text-green-700 dark:text-green-300",
								// Bad habit default state (did it) - red
								!habit.isGood && !isBadHabitAvoided && "text-red-700 dark:text-red-300",
								// Default state for good habits not completed
								habit.isGood && !isGoodHabitCompleted && "text-foreground"
							)}>
								{habit.title}
							</h3>
							<div className={cn(
								"flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
								habit.isGood 
									? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
									: isBadHabitAvoided
										? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
										: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
							)}>
								{habit.isGood ? (
									<>
										<Check className="w-3 h-3" />
										Good
									</>
								) : isBadHabitAvoided ? (
									<>
										<Check className="w-3 h-3" />
										Avoided
									</>
								) : (
									<>
										<X className="w-3 h-3" />
										Bad
									</>
								)}
							</div>
						</div>
						{habit.description && (
							<p className="text-sm text-muted-foreground line-clamp-2">
								{habit.description}
							</p>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-between">
					<span className="text-xs text-muted-foreground">
						Started {formattedStartDate}
					</span>
					
					<div className="flex items-center gap-2">
						{showDeleteConfirm ? (
							<div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-1.5">
								<AlertTriangle className="w-3 h-3 text-destructive" />
								<span className="text-xs font-medium text-destructive">Delete?</span>
								<Button
									variant="destructive"
									size="sm"
									className="h-6 px-2 text-xs"
									onClick={handleConfirmDelete}
								>
									Yes
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 px-2 text-xs"
									onClick={handleCancelDelete}
								>
									No
								</Button>
							</div>
						) : (
							<>
								<Button
									size="sm"
									variant={isGoodHabitCompleted || isBadHabitAvoided ? "default" : "outline"}
									onClick={handleToggleComplete}
									className={cn(
										"h-8 w-24 text-xs font-medium",
										// Good habit completed - green
										isGoodHabitCompleted && "bg-green-600 hover:bg-green-700 text-white",
										// Bad habit avoided - green (success)
										isBadHabitAvoided && "bg-green-600 hover:bg-green-700 text-white"
									)}
								>
									{habit.isGood ? (
										// Good habit logic
										isGoodHabitCompleted ? (
											<>
												<Check className="w-3 h-3 mr-1" />
												Done
											</>
										) : (
											"Mark Done"
										)
									) : (
										// Bad habit logic - simple toggle between avoided and did it
										isBadHabitAvoided ? (
											<>
												<Check className="w-3 h-3 mr-1" />
												Avoided
											</>
										) : (
											"Mark Avoided"
										)
									)}
								</Button>
								
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
									onClick={handleDeleteClick}
								>
									<Trash2 className="w-3 h-3" />
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		);
	},
);

Habit.displayName = "Habit";

export default Habit;
