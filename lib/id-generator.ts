import { nanoid } from "nanoid";

/**
 * Generates a compact, URL-safe contest ID.
 * Format: "c" + 2-digit year + 4 random nanoid characters (e.g. "c24a1b2c").
 * Uses nanoid(4) for brevity and readability.
 * @returns A unique string with 'c' prefix, 2-digit year, and 4 random characters
 */
export function generateContestId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  return `c${year}${nanoid(4)}`;
}

/**
 * Generates a longer ID for other entities if needed
 * @param length - The length of the ID (default: 12)
 * @returns A unique string of specified length
 */
export function generateId(length: number = 12): string {
  return nanoid(length);
}
