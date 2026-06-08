import { useState } from 'react';

/**
 * Safely sets a localStorage item, returning false on failure
 * instead of throwing. Used to avoid console statements in catch blocks.
 *
 * @param key - localStorage key
 * @param value - value to store
 * @returns true if the write succeeded, false otherwise
 */
function safeSetItem(key: string, value: string): boolean {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

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

            // Persist to localStorage - best-effort, silently ignore failures.
            // A failed write should never block state updates.
            safeSetItem(key, JSON.stringify(valueToStore));

            return valueToStore;
        });
    };

    return [storedValue, setValue];
};
