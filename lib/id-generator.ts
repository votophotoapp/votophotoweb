import { nanoid } from "nanoid";

/**
 * Generates a short, URL-safe unique ID for contests
 * Uses nanoid with a length of 6 characters plus year prefix for readability
 * @returns A unique string with "con_" prefix, 2-digit year, and 6 characters
 */
export function generateContestId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  return `con_${year}${nanoid(6)}`;
}

/**
 * Generates a longer ID for other entities if needed
 * @param length - The length of the ID (default: 12)
 * @returns A unique string of specified length
 */
export function generateId(length: number = 12): string {
  return nanoid(length);
}
