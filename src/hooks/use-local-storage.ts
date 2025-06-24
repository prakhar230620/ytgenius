"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { get, set, createStore } from 'idb-keyval';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Lazily create the store only on the client-side.
  // useMemo ensures this is only created once per component instance.
  const customStore = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createStore('ytgenius-db', 'ytgenius-store');
    }
    return undefined;
  }, []);

  // Effect to read the value from IndexedDB when the component mounts.
  useEffect(() => {
    // Only run on the client where customStore is defined.
    if (!customStore) {
      return;
    }

    get<T>(key, customStore)
      .then(val => {
        if (val !== undefined && val !== null) {
          setStoredValue(val);
        }
      })
      .catch(err => {
        console.warn(`Error reading from IndexedDB key “${key}”:`, err);
      });
  }, [key, customStore]);

  // A stable setter function that persists data to IndexedDB.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      // Only run on the client where customStore is defined.
      if (!customStore) {
        return;
      }

      try {
        setStoredValue(currentValue => {
          const valueToStore = value instanceof Function ? value(currentValue) : value;
          
          set(key, valueToStore, customStore).catch(err => {
            console.warn(`Error writing to IndexedDB key “${key}”:`, err);
          });

          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error in setValue for IndexedDB key “${key}”:`, error);
      }
    },
    [key, customStore]
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
