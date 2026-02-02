import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function serializeForClient<T extends Record<string, unknown>>(
  record: T
): { [K in keyof T]: T[K] extends Date ? string : T[K] } {
  const result = {} as { [K in keyof T]: T[K] extends Date ? string : T[K] };

  for (const key in record) {
    const value = record[key];
    if (value instanceof Date) {
      (result as Record<string, unknown>)[key] = value.toISOString();
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
}
