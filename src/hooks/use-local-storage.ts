"use client";

import { useState, useEffect, useCallback } from 'react';
import { get, set, createStore } from 'idb-keyval';

// Using IndexedDB for larger, more persistent storage.
// We create a custom store within the IndexedDB database for this app.
const customStore = createStore('ytgenius-db', 'ytgenius-store');

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Effect to read the value from IndexedDB when the component mounts.
  // This runs only on the client.
  useEffect(() => {
    get<T>(key, customStore)
      .then(val => {
        // If a value is found in IndexedDB, update the state.
        if (val !== undefined && val !== null) {
          setStoredValue(val);
        }
      })
      .catch(err => {
        console.warn(`Error reading from IndexedDB key “${key}”:`, err);
      });
  }, [key]);

  // A stable setter function that persists data to IndexedDB.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Use a functional update to get the latest state value, ensuring stability.
        setStoredValue(currentValue => {
          const valueToStore = value instanceof Function ? value(currentValue) : value;
          
          // Asynchronously set the value in IndexedDB.
          set(key, valueToStore, customStore).catch(err => {
            console.warn(`Error writing to IndexedDB key “${key}”:`, err);
          });

          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error in setValue for IndexedDB key “${key}”:`, error);
      }
    },
    [key] // The key is the only dependency, so this function is stable.
  );

  // Note: Cross-tab synchronization is more complex with IndexedDB.
  // This implementation focuses on providing larger storage and fixing the render loop.

  return [storedValue, setValue];
}

export default useLocalStorage;
