import { describe, it, expect } from "vitest";
import {
  cn,
  getAvatarUrl,
  getInitials,
  formatLocation,
  formatBudget,
  isNoneOption,
  resolveMediaUrl,
  getApiErrorMessage,
} from "./utils";

describe("Utils Module", () => {
  describe("cn", () => {
    it("merges class names and resolves tailwind conflicts", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
      expect(cn("text-red-500", undefined, "font-bold")).toBe("text-red-500 font-bold");
    });
  });

  describe("getInitials", () => {
    it("returns up to 2 uppercase initials", () => {
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials("Alice")).toBe("A");
      expect(getInitials("Robert Downey Junior")).toBe("RD");
    });

    it("returns 'U' for undefined or empty name", () => {
      expect(getInitials(undefined)).toBe("U");
      expect(getInitials("")).toBe("U");
    });
  });

  describe("getAvatarUrl", () => {
    it("creates an SVG avatar URL using dicebear API", () => {
      const url = getAvatarUrl("John Doe");
      expect(url).toContain("api.dicebear.com");
      expect(url).toContain("seed=John%20Doe");
    });

    it("uses default seed if name is undefined", () => {
      const url = getAvatarUrl(undefined);
      expect(url).toContain("seed=user");
    });
  });

  describe("formatLocation", () => {
    it("formats string location as is", () => {
      expect(formatLocation("London, UK")).toBe("London, UK");
    });

    it("formats object with city and state", () => {
      expect(formatLocation({ city: "Manchester", state: "Greater Manchester" })).toBe("Manchester, Greater Manchester");
    });

    it("handles remote location object", () => {
      expect(formatLocation({ remote: true })).toBe("Remote");
    });

    it("returns Remote when location is null or empty", () => {
      expect(formatLocation(null)).toBe("Remote");
      expect(formatLocation({})).toBe("Remote");
    });
  });

  describe("formatBudget", () => {
    it("formats min and max range", () => {
      expect(formatBudget({ min: 100, max: 500, currency: "£" })).toBe("£100 - £500");
    });

    it("formats min only", () => {
      expect(formatBudget({ min: 250, currency: "$" })).toBe("From $250");
    });

    it("formats max only", () => {
      expect(formatBudget({ max: 1000, currency: "€" })).toBe("Up to €1000");
    });

    it("returns string as is or fallback", () => {
      expect(formatBudget("Negotiable")).toBe("Negotiable");
      expect(formatBudget(undefined)).toBe("Competitive Pay");
    });
  });

  describe("isNoneOption", () => {
    it("detects 'none', 'n/a', and 'none of the above'", () => {
      expect(isNoneOption("None")).toBe(true);
      expect(isNoneOption("N/A")).toBe(true);
      expect(isNoneOption("none of the above")).toBe(true);
      expect(isNoneOption("Acting")).toBe(false);
      expect(isNoneOption(undefined)).toBe(false);
    });
  });

  describe("resolveMediaUrl", () => {
    it("returns absolute URLs directly", () => {
      expect(resolveMediaUrl("https://cloudinary.com/pic.jpg")).toBe("https://cloudinary.com/pic.jpg");
    });

    it("extracts url property from object", () => {
      expect(resolveMediaUrl({ url: "https://example.com/asset.png" })).toBe("https://example.com/asset.png");
    });

    it("prepends base URL for relative paths", () => {
      const resolved = resolveMediaUrl("/uploads/photo.jpg", "https://api.castglo.com");
      expect(resolved).toBe("https://api.castglo.com/uploads/photo.jpg");
    });
  });

  describe("getApiErrorMessage", () => {
    it("extracts error message from axios response structure", () => {
      const err = { response: { data: { message: "Invalid email or password" } } };
      expect(getApiErrorMessage(err, "Fallback")).toBe("Invalid email or password");
    });

    it("falls back to default message when response has no message", () => {
      const err = new Error("Network Error");
      expect(getApiErrorMessage(err, "Something went wrong")).toBe("Network error. Please check your internet connection and try again.");
      const customErr = new Error("Custom operational failure");
      expect(getApiErrorMessage(customErr, "Something went wrong")).toBe("Custom operational failure");
      expect(getApiErrorMessage(null, "Default error")).toBe("Default error");
    });
  });
});
