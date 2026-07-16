import { lazy, ComponentType } from "react";

/**
 * A wrapper for React.lazy that handles "Failed to fetch dynamically imported module" errors.
 * This typically happens when a new version is deployed and the browser tries to load old, 
 * now-deleted chunks. This function will force a full page reload if a chunk fails to load,
 * allowing the browser to fetch the new asset manifest and the latest code.
 */
export function safeLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error("Chunk load error detected, attempting to reload...", error);
      
      // Prevent infinite loops by only reloading if the last reload was more than 10 seconds ago.
      const now = Date.now();
      const lastReloadTime = window.sessionStorage.getItem("chunk_load_reload_time");
      
      if (!lastReloadTime || now - parseInt(lastReloadTime, 10) > 10000) {
        window.sessionStorage.setItem("chunk_load_reload_time", now.toString());
        window.location.reload();
      }
      
      throw error;
    }
  });
}
