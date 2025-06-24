"use client";

import { useState, useEffect, useMemo } from 'react';
import { get, set, createStore } from 'idb-keyval';

/**
 * A hook to manage state that is persisted in IndexedDB.
 * It ensures that data is loaded on startup and saved on any change.
 * @param key The key for the data in IndexedDB.
 * @param initialValue The initial value to use if none is found in storage.
 * @returns A stateful value, and a function to update it.
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Lazily create the IndexedDB store instance on the client-side.
  const customStore = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createStore('ytgenius-db', 'ytgenius-store');
    }
    return undefined;
  }, []);

  // Effect to read the initial value from IndexedDB when the hook mounts.
  useEffect(() => {
    if (!customStore) {
      return;
    }

    get<T>(key, customStore)
      .then(val => {
        // If a value is found in storage, update the state.
        if (val !== undefined && val !== null) {
          setStoredValue(val);
        }
      })
      .catch(err => {
        console.warn(`Error reading from IndexedDB key “${key}”:`, err);
      })
      .finally(() => {
        // Mark the hook as initialized after attempting to load data.
        setIsInitialized(true);
      });
  }, [key, customStore]);

  // Effect to write the state value to IndexedDB whenever it changes.
  useEffect(() => {
    // We don't want to write the initial value to storage on the first render.
    // This effect should only run after we've loaded the persisted state.
    if (!isInitialized || !customStore) {
      return;
    }

    set(key, storedValue, customStore).catch(err => {
      console.warn(`Error writing to IndexedDB key “${key}”:`, err);
    });
  }, [key, storedValue, customStore, isInitialized]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
