import * as React from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DatePickerProps {
	date: Date;
	setDate: (date: Date | undefined) => void;
}

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
	weekday: "short",
	month: "short",
	day: "numeric",
});

export function DatePicker({ date, setDate }: DatePickerProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const formattedDate = shortDateFormatter.format(date);

	const handleDateSelect = (selectedDate: Date | undefined) => {
		setDate(selectedDate);
		setIsOpen(false);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-auto px-2 py-1 text-sm font-medium lg:text-base"
					aria-haspopup="dialog"
					aria-expanded={isOpen}
					aria-label={`Selected date: ${formattedDate}. Open date picker`}
				>
					{formattedDate}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="center">
				<Calendar mode="single" selected={date} onSelect={handleDateSelect} />
			</PopoverContent>
		</Popover>
	);
}
