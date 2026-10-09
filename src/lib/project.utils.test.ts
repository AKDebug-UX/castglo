import { describe, it, expect } from "vitest";
import {
  parseMetaFromAttachments,
  buildProjectPayload,
  toBackendProjectStatus,
  getProjectDeadline,
} from "./project.utils";

describe("Project Utils Module", () => {
  describe("parseMetaFromAttachments", () => {
    it("parses URL-encoded __META__: JSON blob from attachments", () => {
      const sampleMeta = { project_title: "Test Project", genre: ["Drama"] };
      const encoded = "__META__:" + encodeURIComponent(JSON.stringify(sampleMeta));
      const parsed = parseMetaFromAttachments([encoded]);
      expect(parsed).toEqual(sampleMeta);
    });

    it("parses raw __META__: JSON blob without URL encoding", () => {
      const sampleMeta = { project_title: "Raw Project" };
      const raw = "__META__:" + JSON.stringify(sampleMeta);
      const parsed = parseMetaFromAttachments([raw]);
      expect(parsed).toEqual(sampleMeta);
    });

    it("returns null if no __META__ string is found", () => {
      expect(parseMetaFromAttachments(["https://example.com/file.pdf"])).toBeNull();
      expect(parseMetaFromAttachments(null)).toBeNull();
      expect(parseMetaFromAttachments([])).toBeNull();
    });
  });

  describe("toBackendProjectStatus", () => {
    it("converts form status strings to backend statuses", () => {
      expect(toBackendProjectStatus("published")).toBe("active");
      expect(toBackendProjectStatus("draft")).toBe("draft");
      expect(toBackendProjectStatus("active")).toBe("active");
      expect(toBackendProjectStatus("closed")).toBe("closed");
      expect(toBackendProjectStatus("cancelled")).toBe("closed");
      expect(toBackendProjectStatus("paused")).toBe("paused");
    });

    it("prioritizes statusOverride if specified", () => {
      expect(toBackendProjectStatus("published", undefined, "draft")).toBe("draft");
    });
  });

  describe("buildProjectPayload", () => {
    it("converts formData to backend API project payload format", () => {
      const formData: any = {
        project_title: "Hamlet 2026",
        project_type: "Theater",
        short_project_summary: "A modern rendition of Hamlet.",
        talent_types_needed: ["Actor"],
        production_company_name: "Globe Ltd",
        project_website: "example.com",
        roles: [],
      };

      const payload = buildProjectPayload(formData);
      expect(payload.title).toBe("Hamlet 2026");
      expect(payload.productionType).toBe("Theater");
      expect(payload.description).toBe("A modern rendition of Hamlet.");
      expect(payload.productionCompany).toBe("Globe Ltd");
      expect(payload.projectWebsite).toBe("https://example.com");
    });
  });

  describe("getProjectDeadline", () => {
    it("extracts and formats submission dates", () => {
      const project = {
        dates: {
          submission: "2026-12-31",
        },
      };
      const formatted = getProjectDeadline(project);
      expect(formatted).toBeTruthy();
      expect(formatted).not.toBe("—");
    });

    it("returns dash when deadline is not provided", () => {
      expect(getProjectDeadline({})).toBe("—");
    });
  });
});
