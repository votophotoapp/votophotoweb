import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export function formatUtcToLocal(
  dateString: string | Date | undefined,
  format = "MMMM D, YYYY h:mm A",
) {
  if (!dateString) return "";
  return dayjs.utc(dateString).tz(dayjs.tz.guess()).format(format);
}
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
