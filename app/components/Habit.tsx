import { AlertTriangle, Check, Trash2, X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Habit as HabitData } from "~/lib/types";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

interface HabitProps {
	habit: HabitData;
	selectedDate: Date;
	className?: string;
	onToggleComplete: (habitId: string, date: Date) => void;
	onDeleteHabit: (habitId: string) => void;
}

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
	month: "short",
	day: "numeric",
	year: "numeric",
});

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
		const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

		const { isBadHabitAvoided, isGoodHabitCompleted, formattedStartDate } =
			useMemo(() => {
				const dateKey = formatDateKey(selectedDate);
				const completion = habit.completions?.[dateKey];
				const badHabitAvoided = !habit.isGood && completion === false;
				const goodHabitCompleted = habit.isGood && completion === true;

				return {
					isBadHabitAvoided: badHabitAvoided,
					isGoodHabitCompleted: goodHabitCompleted,
					formattedStartDate: shortDateFormatter.format(habit.startDate),
				};
			}, [habit.completions, habit.isGood, habit.startDate, selectedDate]);

		const handleDeleteClick = useCallback(() => {
			if (deleteTimeoutRef.current) {
				clearTimeout(deleteTimeoutRef.current);
			}

			setShowDeleteConfirm(true);

			deleteTimeoutRef.current = setTimeout(() => {
				setShowDeleteConfirm(false);
			}, 6000);
		}, []);

		const handleConfirmDelete = useCallback(() => {
			if (deleteTimeoutRef.current) {
				clearTimeout(deleteTimeoutRef.current);
				deleteTimeoutRef.current = null;
			}
			onDeleteHabit(habit.id);
			setShowDeleteConfirm(false);
		}, [habit.id, onDeleteHabit]);

		const handleCancelDelete = useCallback(() => {
			if (deleteTimeoutRef.current) {
				clearTimeout(deleteTimeoutRef.current);
				deleteTimeoutRef.current = null;
			}
			setShowDeleteConfirm(false);
		}, []);

		const handleToggleComplete = useCallback(() => {
			onToggleComplete(habit.id, selectedDate);
		}, [habit.id, onToggleComplete, selectedDate]);

		useEffect(() => {
			return () => {
				if (deleteTimeoutRef.current) {
					clearTimeout(deleteTimeoutRef.current);
					deleteTimeoutRef.current = null;
				}
			};
		}, []);

		return (
			<div
				className={cn(
					"bg-card border border-border rounded-xl p-4 transition-colors transition-shadow hover:shadow-sm",
					isGoodHabitCompleted &&
						"bg-green-50 border-green-200 dark:border-green-800 dark:bg-green-950/50",
					isBadHabitAvoided &&
						"bg-green-50 border-green-200 dark:border-green-800 dark:bg-green-950/50",
					!habit.isGood &&
						!isBadHabitAvoided &&
						"bg-red-50 border-red-200 dark:border-red-800 dark:bg-red-950/50",
					className,
				)}
			>
				<div className="mb-3 flex items-start justify-between">
					<div className="min-w-0 flex-1">
						<div className="mb-1 flex items-center gap-2">
							<h3
								className={cn(
									"truncate text-base font-medium",
									isGoodHabitCompleted && "text-green-700 dark:text-green-300",
									isBadHabitAvoided && "text-green-700 dark:text-green-300",
									!habit.isGood &&
										!isBadHabitAvoided &&
										"text-red-700 dark:text-red-300",
									habit.isGood && !isGoodHabitCompleted && "text-foreground",
								)}
							>
								{habit.title}
							</h3>
							<div
								className={cn(
									"flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
									habit.isGood
										? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
										: isBadHabitAvoided
											? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
											: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
								)}
							>
								{habit.isGood ? (
									<>
										<Check className="h-3 w-3" aria-hidden="true" />
										Good
									</>
								) : isBadHabitAvoided ? (
									<>
										<Check className="h-3 w-3" aria-hidden="true" />
										Avoided
									</>
								) : (
									<>
										<X className="h-3 w-3" aria-hidden="true" />
										Bad
									</>
								)}
							</div>
						</div>
						{habit.description && (
							<p className="line-clamp-2 text-sm text-muted-foreground">
								{habit.description}
							</p>
						)}
					</div>
				</div>

				<div className="flex items-center justify-between">
					<span className="text-xs text-muted-foreground">
						Started {formattedStartDate}
					</span>

					<div className="flex items-center gap-2">
						{showDeleteConfirm ? (
							<div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-1.5">
								<AlertTriangle
									className="h-3 w-3 text-destructive"
									aria-hidden="true"
								/>
								<span className="text-xs font-medium text-destructive">
									Delete?
								</span>
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
									variant={
										isGoodHabitCompleted || isBadHabitAvoided
											? "default"
											: "outline"
									}
									onClick={handleToggleComplete}
									className={cn(
										"h-8 w-24 text-xs font-medium",
										isGoodHabitCompleted &&
											"bg-green-600 text-white hover:bg-green-700",
										isBadHabitAvoided &&
											"bg-green-600 text-white hover:bg-green-700",
									)}
								>
									{habit.isGood ? (
										isGoodHabitCompleted ? (
											<>
												<Check className="mr-1 h-3 w-3" aria-hidden="true" />
												Done
											</>
										) : (
											"Mark Done"
										)
									) : isBadHabitAvoided ? (
										<>
											<Check className="mr-1 h-3 w-3" aria-hidden="true" />
											Avoided
										</>
									) : (
										"Mark Avoided"
									)}
								</Button>

								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
									onClick={handleDeleteClick}
									aria-label={`Delete habit ${habit.title}`}
								>
									<Trash2 className="h-3 w-3" aria-hidden="true" />
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
