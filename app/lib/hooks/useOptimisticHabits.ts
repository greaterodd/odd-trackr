import { useEffect, useState } from 'react';
import type { Habit } from '../stores/habitStore';

const HABITS_CACHE_KEY = 'habits-cache';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

interface CachedHabits {
  habits: Habit[];
  timestamp: number;
  userId?: string;
}

/**
 * Hook that provides optimistic habits loading
 * Shows cached habits immediately while server data loads
 */
export function useOptimisticHabits(serverHabits: Habit[], userId?: string) {
  const [cachedHabits, setCachedHabits] = useState<Habit[]>([]);
  const [hasCachedData, setHasCachedData] = useState(false);

  // Load cached habits on mount
  useEffect(() => {
    const cached = localStorage.getItem(HABITS_CACHE_KEY);
    if (cached && userId) {
      try {
        const parsedCache: CachedHabits = JSON.parse(cached);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;
        const isCorrectUser = parsedCache.userId === userId;
        
        if (!isExpired && isCorrectUser && parsedCache.habits.length > 0) {
          // Convert cached date strings back to Date objects
          const habitsWithDates = parsedCache.habits.map(habit => ({
            ...habit,
            startDate: new Date(habit.startDate)
          }));
          setCachedHabits(habitsWithDates);
          setHasCachedData(true);
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }, [userId]);

  // Cache server habits when they arrive
  useEffect(() => {
    if (serverHabits.length > 0 && userId) {
      const cacheData: CachedHabits = {
        habits: serverHabits,
        timestamp: Date.now(),
        userId
      };
      localStorage.setItem(HABITS_CACHE_KEY, JSON.stringify(cacheData));
    }
  }, [serverHabits, userId]);

  // Return cached habits if server hasn't loaded yet, otherwise server habits
  const habitsToShow = serverHabits.length > 0 ? serverHabits : cachedHabits;
  
  return {
    habits: habitsToShow,
    isFromCache: hasCachedData && serverHabits.length === 0,
    hasData: habitsToShow.length > 0
  };
}