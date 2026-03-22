import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility for merging tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a consistent, attractive avatar URL for users without a profile picture
 * using the DiceBear API.
 */
export function getAvatarUrl(fullName: string | undefined, seed?: string) {
  const nameSeed = fullName ? encodeURIComponent(fullName) : (seed || 'user');
  
  // Using the 'initials' style for a professional look, 
  // or 'adventurer-neutral' for a more friendly character look.
  // Options can be customized here.
  return `https://api.dicebear.com/7.x/initials/svg?seed=${nameSeed}&backgroundColor=009698,5849D7,FF7A30&fontFamily=Arial&fontWeight=600`;
}

/**
 * Returns the first character of each word in a name, up to 2 characters.
 */
export function getInitials(name: string | undefined) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Formats a location object or string into a readable string.
 * Handles both the old string format and the new {city, state, remote} object format.
 */
export function formatLocation(location: any) {
  if (!location) return "Remote";
  
  if (typeof location === 'string') return location;
  
  if (typeof location === 'object') {
    if (location.remote) return "Remote";
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    
    return parts.length > 0 ? parts.join(", ") : "Remote";
  }
  
  return "Remote";
}

/**
 * Formats a budget/price object or string into a readable string.
 * Handles both the old string format and the new {min, max, currency} object format.
 */
export function formatBudget(budget: any) {
  if (!budget) return "Competitive Pay";
  
  if (typeof budget === 'string') return budget;
  
  if (typeof budget === 'object') {
    const currency = budget.currency || "$";
    const min = budget.min;
    const max = budget.max;
    
    if (min !== undefined && max !== undefined) {
      return `${currency}${min} - ${currency}${max}`;
    } else if (min !== undefined) {
      return `From ${currency}${min}`;
    } else if (max !== undefined) {
      return `Up to ${currency}${max}`;
    }
  }
  
  return "Competitive Pay";
}
