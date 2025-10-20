import { customAlphabet } from "nanoid";

// Alphanumeric character set (letters and numbers only)
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 4);
const nanoidLong = customAlphabet(alphabet, 12);

/**
 * Generates a compact, alphanumeric contest ID.
 * Format: 2-digit year + 4 random alphanumeric characters (e.g. "24A1b2c").
 * Uses only letters and numbers for compatibility.
 * @returns A unique string with 2-digit year and 4 random alphanumeric characters
 */
export function generateContestId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  return `${year}${nanoid()}`;
}

/**
 * Generates a longer alphanumeric ID for other entities if needed
 * @param length - The length of the ID (default: 12)
 * @returns A unique alphanumeric string of specified length
 */
export function generateId(length: number = 12): string {
  return nanoidLong(length);
}
