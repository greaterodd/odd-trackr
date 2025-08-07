import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { DatePicker } from "./DatePicker"; // ¡Importamos nuestro nuevo componente!

interface FooterProps {
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void; // Actualizamos el tipo aquí
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

  const canGoPrevious = !earliestHabitDate || selectedDate > earliestHabitDate;
  const canGoNext = selectedDate < today;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between min-h-12">
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
          <DatePicker date={selectedDate} setDate={onDateChange} />

          {!isToday && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="h-auto p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              Go to Today
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextDay}
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
