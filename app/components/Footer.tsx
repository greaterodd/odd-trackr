import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { DatePicker } from "./DatePicker";

interface FooterProps {
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
}

const Footer = ({ selectedDate, onDateChange }: FooterProps) => {
  const today = new Date();
  const todayAtMidnight = new Date(today);
  todayAtMidnight.setHours(0, 0, 0, 0);
  const selectedAtMidnight = new Date(selectedDate);
  selectedAtMidnight.setHours(0, 0, 0, 0);
  const isToday = selectedAtMidnight.getTime() === todayAtMidnight.getTime();

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

  const canGoNext = selectedAtMidnight < todayAtMidnight;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-border">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Previous Day */}
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousDay}
            className="flex items-center gap-2"
            aria-label="Go to previous day"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Center - Date Picker */}
          <div className="flex flex-col items-center gap-2">
            <DatePicker date={selectedDate} setDate={onDateChange} />
            {!isToday && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="h-auto px-2 py-1 text-xs text-primary hover:text-primary/80"
              >
                Go to Today
              </Button>
            )}
          </div>

          {/* Next Day */}
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextDay}
            disabled={!canGoNext}
            className="flex items-center gap-2 disabled:opacity-50"
            aria-label="Go to next day"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
