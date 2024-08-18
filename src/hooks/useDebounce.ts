// Importing React's useEffect and useState hooks for managing state and side effects
import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a value. The debounced value will only update after the specified delay.
 *
 * @template T - The type of the value being debounced.
 * @param {T} value - The value that needs to be debounced.
 * @param {number} [delay=250] - The delay in milliseconds before updating the debounced value.
 * @returns {T} - The debounced value.
 */
export default function useDebounce<T>(value: T, delay: number = 250): T {
  // State to hold the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // useEffect to update the debounced value after the specified delay
  useEffect(() => {
    // Skip unnecessary setTimeout if value hasn't changed
    if (debouncedValue === value) return;
    // Set a timeout to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout if the component unmounts or value/delay changes
    return () => clearTimeout(handler);
  }, [value, delay, debouncedValue]); // Effect dependencies: re-run effect if value or delay changes

  // Return the debounced value
  return debouncedValue;
}
