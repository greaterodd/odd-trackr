import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/Button";

interface FooterProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  earliestHabitDate?: Date;
}

const Footer = ({ selectedDate, onDateChange, earliestHabitDate }: FooterProps) => {
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  
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
    <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
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
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </span>
          {!isToday && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              Go to Today
            </Button>
          )}
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
