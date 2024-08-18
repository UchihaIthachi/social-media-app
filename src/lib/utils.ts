import { type ClassValue, clsx } from "clsx"; // Importing necessary types and functions from the "clsx" package
import { format as formatDate, formatDistanceToNowStrict } from "date-fns"; // Importing date formatting functions from "date-fns"
import { twMerge } from "tailwind-merge"; // Importing the function for merging Tailwind CSS class names

/**
 * Combines multiple class names into a single string.
 *
 * This function accepts multiple class name inputs, merges them using "clsx" to handle conditional class names,
 * and then further merges them using "twMerge" to remove any conflicting Tailwind CSS classes.
 *
 * @param inputs - An array of class names or expressions that resolve to class names.
 * @returns A single string with the merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date relative to the current time or as a standard date.
 *
 * Shows relative time if within the last 24 hours, otherwise formats the date based on the year.
 *
 * @param from - The date to format.
 * @param threshold - Time threshold for showing relative date (default is 24 hours).
 * @returns A string representing the relative time or formatted date.
 */
export function formatRelativeDate(
  from: Date,
  threshold: number = 24 * 60 * 60 * 1000,
): string {
  const currentDate = new Date();
  const isRecent = currentDate.getTime() - from.getTime() < threshold; // Check if date is recent

  if (isRecent) {
    return formatDistanceToNowStrict(from, { addSuffix: true }); // Show relative time
  } else {
    // Return formatted date based on year
    return currentDate.getFullYear() === from.getFullYear()
      ? formatDate(from, "MMM d") // Same year
      : formatDate(from, "MMM d, yyyy"); // Different year
  }
}

/**
 * Formats a number into a compact, human-readable format.
 *
 * Converts large numbers to a shorter format using compact notation (e.g., 1K for 1000).
 *
 * @param n - The number to format.
 * @param locale - The locale to use for formatting (default is "en-US").
 * @param maximumFractionDigits - Maximum number of decimal places (default is 1).
 * @returns A formatted string representing the number.
 */
export function formatNumber(
  n: number,
  locale: string = "en-US",
  maximumFractionDigits: number = 1,
): string {
  return Intl.NumberFormat(locale, {
    notation: "compact", // Use compact notation
    maximumFractionDigits: maximumFractionDigits, // Limit decimal places
  }).format(n);
}

/**
 * Converts a string into a URL-friendly "slug".
 *
 * This function takes an input string, converts it to lowercase, replaces spaces with hyphens,
 * and removes any characters that are not alphanumeric or hyphens.
 *
 * @param input - The string to convert.
 * @returns A URL-friendly slug.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase() // Convert the string to lowercase
    .replace(/ /g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ""); // Remove any character that is not a letter, number, or hyphen
}
