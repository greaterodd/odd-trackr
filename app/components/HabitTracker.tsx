import { useEffect, useState } from "react";
import type { Habit } from "~/lib/stores/habitStore";
import { useHabitStore } from "~/lib/stores/habitStore";
import Footer from "./Footer";
import Hero from "./Hero";

interface HabitTrackerProps {
  initialHabits: Habit[];
}

export default function HabitTracker({ initialHabits }: HabitTrackerProps) {
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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen pb-20">
      {" "}
      {/* Add padding bottom for fixed footer */}
      <Hero selectedDate={selectedDate} onDateChange={handleDateChange} />
      <Footer
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        earliestHabitDate={earliestHabitDate}
      />
    </div>
  );
}
