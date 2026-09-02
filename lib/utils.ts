import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Shared gradient color palette for user and patient avatars
 */
export const AVATAR_GRADIENTS = [
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-amber-500 to-orange-600",
  "from-fuchsia-500 to-pink-600",
  "from-blue-500 to-indigo-600",
  "from-teal-500 to-emerald-600",
];

export function getAvatarGradient(identifier: string | number): string {
  const num = typeof identifier === "number"
    ? identifier
    : identifier.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[Math.abs(num) % AVATAR_GRADIENTS.length];
}

/**
 * Extracts 2-letter uppercase initials from a full name
 */
export function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Standard Indian Locale Date Formatting
 */
export function formatDate(date: string | Date | number): string {
  const d = new Date(date);
  return isNaN(d.getTime())
    ? String(date)
    : d.toLocaleDateString("en-AE", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Standard Indian Locale Time Formatting (12-hour)
 */
export function formatTime(date: string | Date | number): string {
  const d = new Date(date);
  return isNaN(d.getTime())
    ? String(date)
    : d.toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
