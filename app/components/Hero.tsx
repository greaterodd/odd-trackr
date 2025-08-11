import { zodResolver } from "@hookform/resolvers/zod";
import { List, Flame, Plus, Calendar, Target, TrendingUp, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useHotKey } from "~/lib/hooks";
import { cn } from "~/lib/utils";
import Habit, { formatDateKey } from "./Habit";
import { Button } from "./ui/button";
import { useHabitStore } from "~/lib/stores/habitStore";
import { Input } from "./ui/Input";
import type { Habit as HabitType } from "~/lib/types";
import { Textarea } from "./ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Link } from "react-router";

// Form validation schema
const habitSchema = z.object({
  title: z
    .string()
    .min(1, "Habit title is required")
    .min(3, "Habit title must be at least 3 characters")
    .max(100, "Habit title must be less than 100 characters"),
  description: z
    .string()
    .max(320, "Description must be less than 500 characters")
    .optional(),
  isGood: z.boolean(),
});

type HabitFormData = z.infer<typeof habitSchema>;

interface HeroProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const Hero = ({ selectedDate }: HeroProps) => {
  const { habits, addHabit } = useHabitStore();
  const fetcher = useFetcher();
  const [isGood, setIsGood] = useState(true);

  // Handle fetcher responses
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.error) {
        // Handle errors - could revert optimistic updates here if needed
        toast.error("Something went wrong. Please try again.");
        return;
      }

      // Handle successful createHabit response
      if (fetcher.data.id && fetcher.data.title) {
        // Replace the optimistic habit with the real one from the server
        const { deleteHabit, habits: currentHabits } = useHabitStore.getState();

        // Find and remove the optimistic habit
        const optimisticHabit = currentHabits.find(
          (h) => h.isOptimistic && h.title === fetcher.data.title
        );
        if (optimisticHabit) {
          deleteHabit(optimisticHabit.id);
        }

        // Add the real habit from server
        const habitWithProperDate = {
          ...fetcher.data,
          startDate: new Date(fetcher.data.startDate),
        };
        addHabit(habitWithProperDate);
      }

      // Handle successful deleteHabit response
      if (fetcher.data.success && fetcher.data.deletedId) {
        // Delete was successful on server, optimistic update was correct
      }

      // Handle successful toggleHabitCompletion response
      if (fetcher.data.habitId && fetcher.data.date !== undefined) {
        // Completion toggle was successful on server, optimistic update was correct
      }
    }
  }, [fetcher.data, fetcher.state, addHabit]);

  const habitPlaceholder = isGood
    ? "What habit do you want to build?"
    : "What habit do you want to break?";

  useHotKey(
    "Backspace",
    () => {
      setIsGood((prev) => {
        const newIsGood = !prev;
        toast.success(`Habit type changed to ${newIsGood ? "Good" : "Bad"}`);
        return newIsGood;
      });
    },
    { shiftKey: true }
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      isGood: true,
    },
  });

  const onSubmit = (data: HabitFormData) => {
    // Optimistically add the habit immediately
    const optimisticHabit = {
      id: `temp-${Date.now()}`, // Temporary ID
      userId: "current-user", // Will be replaced by server
      title: data.title,
      description: data.description || "",
      isGood: isGood,
      startDate: new Date(selectedDate), // Use selectedDate instead of today
      completions: {},
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isOptimistic: true, // Flag to identify optimistic updates
    };

    addHabit(optimisticHabit);
    toast.success("Habit added!");

    const formData = new FormData();
    formData.append("intent", "createHabit");
    formData.append("title", data.title);
    if (data.description) {
      formData.append("description", data.description);
    }
    formData.append("isGood", String(isGood));
    formData.append("startDate", String(optimisticHabit.startDate));
    fetcher.submit(formData, { method: "post" });
    reset();
  };

  const toggleHabitCompletion = (habitId: string, date: Date) => {
    const { habits: currentHabits, updateHabit } = useHabitStore.getState();
    const habit = currentHabits.find((h) => h.id === habitId);

    if (habit) {
      const dateKey = formatDateKey(date);
      const currentCompletion = habit.completions?.[dateKey];

      let newCompletion: boolean;
      let feedbackMessage: string;

      if (habit.isGood) {
        // Good habit: toggle between false/undefined and true
        newCompletion = currentCompletion !== true;
        feedbackMessage = newCompletion ? "Marked as completed!" : "Marked as incomplete!";
      } else {
        // Bad habit: simple toggle between avoided (false) and did it (true/undefined/null)
        if (currentCompletion === false) {
          newCompletion = true; // Mark as did it (back to default state)
          feedbackMessage = "Marked as done";
        } else {
          newCompletion = false; // Mark as avoided
          feedbackMessage = "Great! Marked as avoided!";
        }
      }

      // Optimistically update the store immediately
      updateHabit(habitId, {
        completions: { ...habit.completions, [dateKey]: newCompletion },
        completed: newCompletion,
      });

      // Show immediate feedback
      toast.success(feedbackMessage);

      // Send to server in background
      fetcher.submit(
        {
          intent: "toggleCompletion",
          habitId,
          date: dateKey,
          completed: String(newCompletion),
        },
        { method: "post" }
      );
    }
  };

  const deleteHabit = (habitId: string) => {
    // Optimistically remove the habit immediately
    const { deleteHabit: removeHabit } = useHabitStore.getState();
    removeHabit(habitId);
    toast.success("Habit deleted!");

    // Send delete request to server
    fetcher.submit(
      {
        intent: "deleteHabit",
        habitId,
      },
      { method: "post" }
    );
  };

  // Filter habits to show only those that started on or before the selected date
  const visibleHabits = habits.filter((habit) => {
    // Compare dates by converting both to date strings (YYYY-MM-DD) to avoid time issues
    const habitStartDate = new Date(habit.startDate);
    const selectedDateOnly = new Date(selectedDate);

    // Set both dates to start of day for fair comparison
    habitStartDate.setHours(0, 0, 0, 0);
    selectedDateOnly.setHours(0, 0, 0, 0);

    return habitStartDate <= selectedDateOnly;
  });

  // Update habits with completion status for the selected date
  const habitsForSelectedDate = visibleHabits.map((habit) => {
    const dateKey = formatDateKey(selectedDate);
    const completedForDate = habit.completions?.[dateKey] || false;
    return {
      ...habit,
      completed: completedForDate,
    };
  });

  // Count habits that are not completed for the selected date
  const incompleteHabitsCount = habitsForSelectedDate.filter(
    (habit) => {
      if (habit.isGood) return !habit.completed
      return habit.completed
    }).length;

  return (
    <div className="flex flex-col">
      {/* Clean Header */}
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 text-center">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center justify-center space-x-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Trackr</h1>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl lg:text-3xl font-medium text-muted-foreground">
            Change your life, starting today
          </p>

          {/* Date */}
          <div className="flex items-center justify-center space-x-2 text-lg text-muted-foreground">
            <Calendar className="w-5 h-5" />
            <span>{selectedDate.toDateString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-2xl mx-auto px-4 pb-6 w-full">
        {/* Add Habit Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                {...register("title")}
                placeholder={habitPlaceholder}
                aria-invalid={errors.title ? "true" : "false"}
                className="text-base h-12"
              />
              {errors.title && (
                <span className="text-sm text-destructive">
                  {errors.title.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Textarea
                {...register("description")}
                placeholder="Why is this habit important to you? (optional)"
                aria-invalid={errors.description ? "true" : "false"}
                className="text-base resize-none"
                rows={2}
              />
              {errors.description && (
                <span className="text-sm text-destructive">
                  {errors.description.message}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 text-base"
              >
                {isSubmitting ? "Adding..." : "Add Habit"}
              </Button>

              <div className="flex bg-muted rounded-lg p-1 h-12">
                <Button
                  type="button"
                  onClick={() => setIsGood(true)}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "flex-1 h-10 rounded-r-none text-sm transition-all",
                    isGood
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "hover:bg-background",
                  )}
                >
                  Good
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsGood(false)}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "flex-1 h-10 rounded-l-none text-sm transition-all",
                    !isGood
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "hover:bg-background",
                  )}
                >
                  Bad
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="relative">
                <List className="w-4 h-4 mr-2" />
                View Habits
                {incompleteHabitsCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Your Habits</DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span>Total: {habits.length}</span>
                  <span>Today: {visibleHabits.length}</span>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto min-h-0 mt-4">
                {visibleHabits.length > 0 ? (
                  <div className="space-y-3 pr-2">
                    {habitsForSelectedDate.map((habit) => (
                      <Habit
                        key={habit.id}
                        habit={{
                          ...habit,
                          description: habit.description ?? "",
                        }}
                        selectedDate={selectedDate}
                        onToggleComplete={toggleHabitCompletion}
                        onDeleteHabit={deleteHabit}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <List className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg font-medium mb-2">No habits for this date</p>
                    <p className="text-muted-foreground/70 text-sm">
                      {habits.length > 0
                        ? `You have ${habits.length} habit${habits.length === 1 ? '' : 's'} total, but none started on or before this date.`
                        : "Start by adding your first habit above."
                      }
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Link to="/streaks" prefetch="render">
            <Button variant="outline">
              <Flame className="w-4 h-4 mr-2 text-orange-500" />
              Streaks
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
