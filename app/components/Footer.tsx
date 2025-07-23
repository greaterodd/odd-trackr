import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/Button";

interface FooterProps {
	selectedDate: Date;
	onDateChange: (date: Date) => void;
	earliestHabitDate?: Date;
}

const Footer = ({
	selectedDate,
	onDateChange,
	earliestHabitDate,
}: FooterProps) => {
	const today = new Date();
	const isToday = selectedDate.toDateString() === today.toDateString();
	const [isAnimating, setIsAnimating] = useState(false);

	// Handle date changes with simple animation
	useEffect(() => {
		if (selectedDate.getTime() !== new Date().setTime(selectedDate.getTime())) {
			setIsAnimating(true);
			const timer = setTimeout(() => {
				setIsAnimating(false);
			}, 200);
			return () => clearTimeout(timer);
		}
	}, [selectedDate]);

	const goToPreviousDay = () => {
		const previousDay = new Date(selectedDate);
		previousDay.setDate(previousDay.getDate() - 1);
		onDateChange(previousDay);
	};

	const goToNextDay = () => {
		const nextDay = new Date(selectedDate);
		nextDay.setDate(nextDay.getDate() + 1);
		onDateChange(nextDay);
	};

	const goToToday = () => {
		onDateChange(new Date());
	};

	// Check if we can go to previous day (don't go before earliest habit date)
	const canGoPrevious = !earliestHabitDate || selectedDate > earliestHabitDate;

	// Check if we can go to next day (don't go beyond today)
	const canGoNext = selectedDate < today;

	return (
		<footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center min-h-24 py-4">
			<div className="max-w-2xl mx-auto flex items-center justify-between lg:max-w-4xl w-full px-4">
				<Button
					variant="outline"
					size="sm"
					onClick={goToPreviousDay}
					disabled={!canGoPrevious}
					className="flex items-center gap-2"
				>
					<ChevronLeft className="w-4 h-4" />
					Previous Day
				</Button>

				<div className="flex flex-col items-center gap-1">
					<span 
						className={`
							text-sm font-medium text-gray-900 dark:text-gray-100
							transition-all duration-200 ease-out will-change-transform
							${isAnimating ? 'transform scale-110' : 'transform scale-100'}
						`}
					>
						{selectedDate.toLocaleDateString("en-US", {
							weekday: "short",
							month: "short",
							day: "numeric",
						})}
					</span>
					<div 
						className={`
							transition-all duration-300 ease-out will-change-transform
							${!isToday 
								? 'transform translate-y-0 opacity-100 max-h-8' 
								: 'transform -translate-y-2 opacity-0 max-h-0'
							}
						`}
					>
						<Button
							variant="ghost"
							size="sm"
							onClick={goToToday}
							className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200"
						>
							Go to Today
						</Button>
					</div>
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={goToNextDay}
					disabled={!canGoNext}
					className="flex items-center gap-2"
				>
					Next Day
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>
		</footer>
	);
};

export default Footer;
