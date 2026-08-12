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
  return `https://api.dicebear.com/7.x/initials/svg?seed=${nameSeed}&backgroundColor=5849D7,FF5C62&fontFamily=Arial&fontWeight=600`;
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

/**
 * Checks if a string value represents a "None" selection in a list.
 */
export function isNoneOption(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase().trim();
  return normalized === "none" || normalized === "n/a" || normalized === "none of the above";
}

/**
 * Resolves media URLs, handling relative paths and prepending the API base URL if needed.
 */
export function resolveMediaUrl(value: any, apiBaseUrl?: string) {
  if (!value) return "";
  
  // Handle object with url property
  const raw = typeof value === "string" ? value : (typeof value === "object" && value?.url ? String(value.url) : "");
  const url = raw.trim();
  
  if (!url) return "";
  
  // If it's already a full URL or data URI, return as is
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("data:")) return url; // base64 / data URIs — pass through unchanged
  
  // If we have an API base URL, prepend it
  const baseUrl = apiBaseUrl || import.meta.env.VITE_API_BASE_URL || "https://castglo-qupm.onrender.com/api/v1";
  
  // Clean up the URL
  const cleanedUrl = url.startsWith("/") ? url.substring(1) : url;
  const cleanedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanedBase}/${cleanedUrl}`;
}

/**
 * Extracts a clear, user-friendly error message from Axios / API errors,
 * handling various backend error formats:
 * - data.message
 * - data.error
 * - data.errors (array of strings or object map of field -> message)
 * - data.data (object or string)
 * - Axios network error / timeout message
 * - Fallback string
 */
export function getApiErrorMessage(error: any, fallback = "An unexpected error occurred"): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  const data = error.response?.data;
  if (data) {
    if (typeof data === "string" && data.trim()) return data.trim();

    // 1. Array of error strings in data.data (e.g. ["\"projectWebsite\" must be a valid uri"])
    if (Array.isArray(data.data) && data.data.length > 0) {
      const messages = data.data
        .map((e: any) => {
          if (typeof e === "string") {
            return e.replace(/^["']|["']$/g, "").replace(/\\"/g, '"');
          }
          return e?.msg || e?.message || (typeof e === "object" ? JSON.stringify(e) : String(e));
        })
        .filter(Boolean);
      if (messages.length > 0) return messages.join(", ");
    }

    // 2. Array of errors in data.errors (e.g. express-validator or validation errors)
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const messages = data.errors
        .map((e: any) => {
          if (typeof e === "string") {
            return e.replace(/^["']|["']$/g, "").replace(/\\"/g, '"');
          }
          return e?.msg || e?.message || (typeof e === "object" ? JSON.stringify(e) : String(e));
        })
        .filter(Boolean);
      if (messages.length > 0) return messages.join(", ");
    }

    // 3. Object of field errors in data.errors (e.g. { project_title: "Title is required" })
    if (data.errors && typeof data.errors === "object") {
      const values = Object.values(data.errors)
        .map((v: any) => (typeof v === "string" ? v : v?.msg || v?.message || ""))
        .filter(Boolean);
      if (values.length > 0) return values.join(", ");
    }

    // 4. Object of field errors in data.data
    if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
      const values = Object.values(data.data)
        .map((v: any) => (typeof v === "string" ? v : v?.msg || v?.message || ""))
        .filter(Boolean);
      if (values.length > 0) return values.join(", ");
    }

    // 5. Specific message / error if not generic "Validation error"
    if (typeof data.message === "string" && data.message.trim() && data.message.trim().toLowerCase() !== "validation error") {
      return data.message.trim();
    }
    if (typeof data.error === "string" && data.error.trim() && data.error.trim().toLowerCase() !== "validation error") {
      return data.error.trim();
    }

    // 6. Direct message or error string fallback
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error.trim();
    }
    if (typeof data.data === "string" && data.data.trim()) {
      return data.data.trim();
    }
  }

  // Axios or standard Error message
  if (error.message && typeof error.message === "string" && error.message.trim()) {
    if (error.message.includes("Network Error")) {
      return "Network error. Please check your internet connection and try again.";
    }
    return error.message.trim();
  }

  return fallback;
}
