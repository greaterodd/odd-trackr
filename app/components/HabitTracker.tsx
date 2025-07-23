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
    const habitsWithCompletion = initialHabits.map(h => ({ ...h, completed: false, completions: {} }));
    setHabits(habitsWithCompletion);
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
