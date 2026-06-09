import { useState, useEffect, useCallback } from "react";
import { projectAPI } from "@/lib/api";
import { parseMetaFromAttachments, getProjectCoverImage } from "@/lib/project.utils";

export interface ProjectWithRoles {
  /** The raw project object returned by the backend, with `roles` array attached */
  project: any | null;
  /** The decoded __META__ blob (extra form fields not in the backend schema) */
  meta: any | null;
  /** The extracted cover image URL */
  coverImage: string;
  isLoading: boolean;
  error: string | null;
  /** Call this to refetch the project and roles */
  reload: () => void;
}

/**
 * Fetches a project and its roles in parallel, merges them, extracts the
 * __META__ blob and cover image. Used by all viewer and editor pages.
 */
export function useProjectWithRoles(id: string | undefined): ProjectWithRoles {
  const [project, setProject] = useState<any | null>(null);
  const [meta, setMeta] = useState<any | null>(null);
  const [coverImage, setCoverImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const [projectRes, rolesRes] = await Promise.all([
          projectAPI.getOne(id),
          projectAPI.getRoles(id).catch(() => ({ data: { success: false, data: [] } })),
        ]);

        if (cancelled) return;

        if (!projectRes.data.success) {
          setError("Project not found");
          return;
        }

        // Unwrap the nested structure the backend sometimes returns
        const raw = projectRes.data.data;
        const data: any = raw?.castingCall || raw?.project || raw;

        // Attach roles from the dedicated endpoint (overrides any partial list on data.roles)
        const rolesData = rolesRes.data?.data;
        if (rolesRes.data?.success) {
          data.roles = Array.isArray(rolesData)
            ? rolesData
            : Array.isArray(rolesData?.roles)
            ? rolesData.roles
            : data.roles || [];
        }

        // Decode the __META__ blob
        const parsedMeta = parseMetaFromAttachments(
          data.projectAttachments,
          data.requirements
        );

        // Extract cover image from all possible locations
        const img = getProjectCoverImage(data, parsedMeta);

        setProject(data);
        setMeta(parsedMeta);
        setCoverImage(img);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load project");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  return { project, meta, coverImage, isLoading, error, reload };
}
