import { useState } from 'react';

/**
 * Custom hook to safely access and persist state to localStorage
 *
 * @template T - The type of the stored value
 * @param key - LocalStorage key to store the value under
 * @param initialValue - Default value if nothing is stored
 * @returns A tuple of [value, setValue] similar to useState
 *
 * @example
 * const [name, setName] = useLocalStorage('userName', 'Anonymous');
 * setName('John'); // Stores to localStorage and updates state
 */
export const useLocalStorage = <T,>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
    // Get from localStorage on initial render
    const getStoredValue = (): T => {
        try {
            const item = localStorage.getItem(key);
            return (item !== null && item !== '') ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState<T>(getStoredValue);

    // Return a wrapped version that persists the new value to localStorage
    const setValue = (value: T | ((prev: T) => T)): void => {
        // Use React's functional update to access current state reliably
        setStoredValue((currentState) => {
            // Handle both direct values and functional updates
            const valueToStore = value instanceof Function ? value(currentState) : value;

            // Persist to localStorage with error handling
            try {
                localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch {
                // Silent fail on localStorage errors (e.g., quota exceeded)
            }

            return valueToStore;
        });
    };

    return [storedValue, setValue];
};
