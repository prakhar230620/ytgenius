"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Lazy state initialization to read from localStorage only on the client and only once.
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Prevent execution on server
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  // The setter function. It's wrapped in useCallback to ensure it's stable
  // and doesn't cause unnecessary re-renders in consumer components.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Use the functional update form of setState to get the latest state.
        setStoredValue((prevValue) => {
          const valueToStore = value instanceof Function ? value(prevValue) : value;
          
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            // Dispatch event to sync tabs.
            window.dispatchEvent(new Event("local-storage"));
          }
          
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key]
  );

  // Effect to listen for changes in other tabs.
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        if (typeof window !== 'undefined') {
          const item = window.localStorage.getItem(key);
          setStoredValue(item ? JSON.parse(item) : initialValue);
        }
      } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
