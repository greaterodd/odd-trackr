import { create } from "zustand";
import type { Habit } from "~/lib/types";

interface HabitState {
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  setHabits: (habits: Habit[]) => void;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
  updateHabit: (id, updates) =>
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === id ? { ...habit, ...updates } : habit
      ),
    })),
  deleteHabit: (id) =>
    set((state) => ({
      habits: state.habits.filter((habit) => habit.id !== id),
    })),
  setHabits: (habits) => set({ habits }),
}));
