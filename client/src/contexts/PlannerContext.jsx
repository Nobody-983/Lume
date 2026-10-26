import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createStarterEntries } from '../services/plannerSeed.js';
import { addDays, startOfWeek, toDateKey } from '../services/dates.js';
import { makeId, readLocal, writeLocal } from '../services/storage.js';

const STORAGE_KEY = 'lume.planner.v1';
const PlannerContext = createContext(null);

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.order ?? 0) - (b.order ?? 0) || String(a.createdAt).localeCompare(String(b.createdAt));
  });
}

function buildInitialState() {
  const stored = readLocal(STORAGE_KEY, null);
  if (stored && Array.isArray(stored.entries) && Array.isArray(stored.seededWeeks)) {
    return {
      initialized: true,
      entries: sortEntries(stored.entries),
      seededWeeks: stored.seededWeeks,
    };
  }

  const weekStart = startOfWeek(new Date());
  const weekKey = toDateKey(weekStart);
  return {
    initialized: true,
    entries: sortEntries(createStarterEntries(weekStart)),
    seededWeeks: [weekKey],
  };
}

export function PlannerProvider({ children }) {
  const [state, setState] = useState(buildInitialState);

  useEffect(() => {
    writeLocal(STORAGE_KEY, state);
  }, [state]);

  const addEntry = useCallback((entry) => {
    const nextEntry = {
      id: makeId(),
      date: entry.date,
      title: entry.title?.trim() || 'A considered plan',
      occasion: entry.occasion || 'Everyday',
      outfit: entry.outfit?.trim() || '',
      beauty: entry.beauty?.trim() || '',
      notes: entry.notes?.trim() || '',
      starter: false,
      createdAt: new Date().toISOString(),
      order: Date.now(),
    };
    setState((current) => ({
      ...current,
      entries: sortEntries([...current.entries, nextEntry]),
    }));
    return nextEntry;
  }, []);

  const updateEntry = useCallback((id, changes) => {
    setState((current) => ({
      ...current,
      entries: sortEntries(
        current.entries.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                ...changes,
                title: changes.title?.trim() || entry.title,
                outfit: changes.outfit !== undefined ? changes.outfit.trim() : entry.outfit,
                beauty: changes.beauty !== undefined ? changes.beauty.trim() : entry.beauty,
                notes: changes.notes !== undefined ? changes.notes.trim() : entry.notes,
                starter: false,
              }
            : entry,
        ),
      ),
    }));
  }, []);

  const removeEntry = useCallback((id) => {
    setState((current) => ({
      ...current,
      entries: current.entries.filter((entry) => entry.id !== id),
    }));
  }, []);

  const seedWeek = useCallback(
    (weekStart) => {
      const weekKey = toDateKey(weekStart);
      const startKey = toDateKey(weekStart);
      const endKey = toDateKey(addDays(weekStart, 6));
      const starterEntries = createStarterEntries(weekStart);
      const occupiedDates = new Set(
        state.entries
          .filter((entry) => entry.date >= startKey && entry.date <= endKey)
          .map((entry) => entry.date),
      );
      const additions = starterEntries.filter((entry) => !occupiedDates.has(entry.date));

      setState((current) => {
        const currentOccupied = new Set(
          current.entries
            .filter((entry) => entry.date >= startKey && entry.date <= endKey)
            .map((entry) => entry.date),
        );
        const freshEntries = starterEntries.filter((entry) => !currentOccupied.has(entry.date));
        return {
          ...current,
          entries: sortEntries([...current.entries, ...freshEntries]),
          seededWeeks: current.seededWeeks.includes(weekKey)
            ? current.seededWeeks
            : [...current.seededWeeks, weekKey],
        };
      });

      return additions.length;
    },
    [state.entries],
  );

  const clearWeek = useCallback((weekStart) => {
    const weekKey = toDateKey(weekStart);
    const startKey = toDateKey(weekStart);
    const endKey = toDateKey(addDays(weekStart, 6));
    setState((current) => ({
      ...current,
      entries: current.entries.filter((entry) => entry.date < startKey || entry.date > endKey),
      seededWeeks: current.seededWeeks.includes(weekKey)
        ? current.seededWeeks
        : [...current.seededWeeks, weekKey],
    }));
  }, []);

  const value = useMemo(
    () => ({
      entries: state.entries,
      seededWeeks: state.seededWeeks,
      addEntry,
      updateEntry,
      removeEntry,
      seedWeek,
      clearWeek,
    }),
    [addEntry, clearWeek, removeEntry, seedWeek, state.entries, state.seededWeeks, updateEntry],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error('usePlanner must be used inside PlannerProvider');
  return context;
}
