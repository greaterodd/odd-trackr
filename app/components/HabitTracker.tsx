import { useEffect, useState } from "react";
import type { Habit } from "~/lib/stores/habitStore";
import { useHabitStore } from "~/lib/stores/habitStore";
import Footer from "./Footer";
import Hero from "./Hero";

interface HabitTrackerProps {
  initialHabits: Habit[];
  isFromCache?: boolean;
  isOptimistic?: boolean;
}

export default function HabitTracker({ 
  initialHabits, 
  isFromCache = false, 
  isOptimistic = false 
}: HabitTrackerProps) {
  const setHabits = useHabitStore((state) => state.setHabits);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    // Initialize the store with the server-loaded data
    // Ensure startDate is properly converted to Date object (JSON serialization converts it to string)
    const habitsWithProperDates = initialHabits.map(habit => ({
      ...habit,
      startDate: new Date(habit.startDate) // Ensure it's a proper Date object
    }));
    
    setHabits(habitsWithProperDates);
  }, [initialHabits, setHabits]);

  // This state is not used, but keeping it to match original logic
  const [earliestHabitDate, setEarliestHabitDate] = useState<
    Date | undefined
  >();

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <div className="pb-20">
      {/* Show subtle indicator when showing cached data */}
      {isFromCache && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-4 mx-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-blue-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm text-blue-700">
                Syncing latest data...
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Hero selectedDate={selectedDate} onDateChange={handleDateChange} />
      <Footer
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        earliestHabitDate={earliestHabitDate}
      />
    </div>
  );
}
