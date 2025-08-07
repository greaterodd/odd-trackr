import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/Button";

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: "Trackr | Be one percent better every day" },
    { name: "description", content: "Welcome to your next project!" },
  ];
}


const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Calendar</h1>
          <p className="text-lg text-muted-foreground">Track your habits across the month</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={goToPreviousMonth}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Month
          </Button>
          
          <h2 className="text-2xl font-semibold text-foreground">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          
          <Button 
            variant="outline" 
            onClick={goToNextMonth}
            className="flex items-center gap-2"
          >
            Next Month
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {daysInMonth.map((date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                className={`
                  aspect-square p-4 rounded-lg border-2 transition-all duration-200
                  flex flex-col items-center justify-center min-h-[80px]
                  ${isSelected 
                    ? "bg-calendar-day-selected border-calendar-day-selected text-calendar-day-selected-foreground" 
                    : "bg-calendar-day border-border hover:bg-calendar-day-hover"
                  }
                  ${isTodayDate ? "ring-2 ring-accent" : ""}
                `}
              >
                <span className="text-lg font-semibold mb-1">
                  {format(date, "d")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(date, "EEE")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-card px-6 py-3 rounded-lg border">
              <span className="text-sm text-muted-foreground">Selected:</span>
              <span className="font-medium text-foreground">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;