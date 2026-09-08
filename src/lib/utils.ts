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

  if (typeof error === "string") {
    const trimmed = error.trim();
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
      return "Server returned an invalid response. Please try again later.";
    }
    return trimmed;
  }

  const response = error.response;
  const status = response?.status;
  const data = response?.data;

  if (data) {
    if (typeof data === "string" && data.trim()) {
      const trimmed = data.trim();
      if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
        return `Server error (${status ? `HTTP ${status}` : "Error"}). Please try again later.`;
      }
      return trimmed;
    }

    const extracted: string[] = [];

    const processItem = (item: any) => {
      if (!item) return;
      if (typeof item === "string" && item.trim()) {
        const cleaned = item.replace(/^["']|["']$/g, "").replace(/\\"/g, '"').trim();
        if (cleaned) extracted.push(cleaned);
      } else if (typeof item === "object") {
        const msg = item.message || item.msg || item.detail || item.error;
        if (typeof msg === "string" && msg.trim()) {
          extracted.push(msg.trim());
        } else if (item.field && item.message) {
          extracted.push(`${item.field}: ${item.message}`);
        }
      }
    };

    // 1. data.errors (array or object)
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      data.errors.forEach(processItem);
    } else if (data.errors && typeof data.errors === "object") {
      Object.entries(data.errors).forEach(([field, val]) => {
        if (typeof val === "string" && val.trim()) {
          extracted.push(val.trim());
        } else if (val && typeof val === "object") {
          processItem(val);
        }
      });
    }

    // 2. data.data (array or object)
    if (extracted.length === 0) {
      if (Array.isArray(data.data) && data.data.length > 0) {
        data.data.forEach(processItem);
      } else if (data.data && typeof data.data === "object") {
        Object.values(data.data).forEach(processItem);
      }
    }

    // 3. data.message (array, string, or object)
    if (extracted.length === 0 && data.message) {
      if (Array.isArray(data.message) && data.message.length > 0) {
        data.message.forEach(processItem);
      } else if (typeof data.message === "string" && data.message.trim()) {
        const msg = data.message.trim();
        if (msg.toLowerCase() !== "validation error") {
          extracted.push(msg);
        }
      } else if (typeof data.message === "object") {
        processItem(data.message);
      }
    }

    // 4. data.error (string, array, or object)
    if (extracted.length === 0 && data.error) {
      if (typeof data.error === "string" && data.error.trim()) {
        const errStr = data.error.trim();
        if (errStr.toLowerCase() !== "validation error") {
          extracted.push(errStr);
        }
      } else if (Array.isArray(data.error) && data.error.length > 0) {
        data.error.forEach(processItem);
      } else if (typeof data.error === "object") {
        processItem(data.error);
      }
    }

    // 5. data.detail / data.details
    if (extracted.length === 0) {
      const details = data.details || data.detail;
      if (details) {
        if (Array.isArray(details)) details.forEach(processItem);
        else processItem(details);
      }
    }

    if (extracted.length > 0) {
      const uniqueMsgs = Array.from(new Set(extracted));
      return uniqueMsgs.join(", ");
    }
  }

  // Axios or standard Error object message
  if (error.message && typeof error.message === "string" && error.message.trim()) {
    if (error.message.includes("Network Error")) {
      return "Network error. Please check your internet connection and try again.";
    }
    return error.message.trim();
  }

  return fallback;
}
