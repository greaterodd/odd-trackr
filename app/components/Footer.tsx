import { ChevronLeft, ChevronRight, Calendar, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { DatePicker } from "./DatePicker";

interface FooterProps {
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void; // Actualizamos el tipo aquí
}

const Footer = ({ selectedDate, onDateChange }: FooterProps) => {
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  const [isAnimating, setIsAnimating] = useState(false);

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

  const canGoNext = selectedDate < today;

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
          >
            <ChevronLeft className="w-4 h-4" />
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
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
