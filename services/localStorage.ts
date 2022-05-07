// https://usehooks.com/useLocalStorage/
import { useState } from 'react';
import { isNumber } from 'util';

export function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const expiryKey = `${key}-expiry`;

    const [storedValue, setStoredValue] = useState<T>(() => {
      if (typeof window === "undefined") {
        return initialValue;
      }
      try {
        // Get from local storage by key
        const item = window.localStorage.getItem(key);
        const expiry = window.localStorage.getItem(expiryKey);
        
        if (expiry == null || new Date() > new Date(expiry)) {
            window.localStorage.removeItem(key);
            window.localStorage.removeItem(expiryKey);
        }
        
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        // If error also return initialValue
        console.log(error);
        return initialValue;
      }
    });
    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T | ((val: T) => T), seconds: number) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        const expiry = new Date(new Date().getTime() + seconds * 1000);

        if (valueToStore == null) {
            window.localStorage.removeItem(key);
            window.localStorage.removeItem(expiryKey);
        }
          // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.localStorage.setItem(expiryKey, expiry.toString());
        }
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error);
      }
    };

    return [storedValue, setValue] as const;
}
