import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl(): string {
  // In production, use the production domain
  if (process.env.NODE_ENV === "production") {
    return "https://www.votophoto.com";
  }

  // In development, use localhost
  return "http://localhost:3000";
}
