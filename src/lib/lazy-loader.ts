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
      
      // We only want to reload if we haven't already reloaded for this session
      // to avoid infinite loops if the chunk is truly missing or server is down.
      const hasReloaded = window.sessionStorage.getItem("chunk_load_reload");
      
      if (!hasReloaded) {
        window.sessionStorage.setItem("chunk_load_reload", "true");
        window.location.reload();
      }
      
      // Fallback: If it's still failing after reload, we let the error bubble
      // up to be caught by an ErrorBoundary if one exists.
      throw error;
    }
  });
}
