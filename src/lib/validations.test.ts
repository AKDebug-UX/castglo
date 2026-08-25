import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  twoFactorCodeSchema,
  contactSchema,
  deliverableSchema,
  projectSubmissionSchema,
} from "./validations";

describe("Validations Module", () => {
  describe("emailSchema", () => {
    it("accepts valid email addresses", () => {
      expect(emailSchema.safeParse("user@example.com").success).toBe(true);
      expect(emailSchema.safeParse("  john.doe@sub.domain.co  ").success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      expect(emailSchema.safeParse("invalid-email").success).toBe(false);
      expect(emailSchema.safeParse("user@").success).toBe(false);
      expect(emailSchema.safeParse("").success).toBe(false);
    });
  });

  describe("passwordSchema", () => {
    it("accepts valid passwords (>=8 chars with letters & numbers)", () => {
      expect(passwordSchema.safeParse("password123").success).toBe(true);
      expect(passwordSchema.safeParse("SecureP@ss1").success).toBe(true);
    });

    it("rejects short or weak passwords", () => {
      expect(passwordSchema.safeParse("short1").success).toBe(false);
      expect(passwordSchema.safeParse("onlyletters").success).toBe(false);
      expect(passwordSchema.safeParse("12345678").success).toBe(false);
    });
  });

  describe("signUpSchema", () => {
    it("validates a correct sign up payload", () => {
      const validPayload = {
        fullName: "John Doe",
        email: "john@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        agreed: true,
      };
      expect(signUpSchema.safeParse(validPayload).success).toBe(true);
    });

    it("rejects when passwords do not match", () => {
      const invalidPayload = {
        fullName: "John Doe",
        email: "john@example.com",
        password: "Password123",
        confirmPassword: "DifferentPassword123",
        agreed: true,
      };
      const result = signUpSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects when terms are not agreed to", () => {
      const invalidPayload = {
        fullName: "John Doe",
        email: "john@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        agreed: false,
      };
      const result = signUpSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("twoFactorCodeSchema", () => {
    it("accepts valid 6-digit OTP code", () => {
      expect(twoFactorCodeSchema.safeParse({ code: "123456" }).success).toBe(true);
    });

    it("accepts valid 8-12 character backup code", () => {
      expect(twoFactorCodeSchema.safeParse({ code: "AB12CD34EF" }).success).toBe(true);
    });

    it("rejects invalid code formats", () => {
      expect(twoFactorCodeSchema.safeParse({ code: "12" }).success).toBe(false);
      expect(twoFactorCodeSchema.safeParse({ code: "" }).success).toBe(false);
    });
  });

  describe("contactSchema", () => {
    it("validates correct contact data", () => {
      const payload = {
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        subject: "Inquiry regarding casting",
        message: "Hello, I would like to know more about the casting procedure.",
      };
      expect(contactSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects short message or subject", () => {
      const payload = {
        firstName: "Alice",
        lastName: "Smith",
        email: "alice@example.com",
        subject: "Hi",
        message: "Short",
      };
      expect(contactSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("deliverableSchema", () => {
    it("validates correct deliverable entry", () => {
      const payload = {
        title: "The Great Film",
        role: "Lead Actor",
        productionType: "Film",
        year: 2024,
        description: "This is a detailed description of the film project and production details.",
        mediaUrls: ["https://example.com/image.jpg"],
      };
      expect(deliverableSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects invalid year or non-http media URL", () => {
      const payload = {
        title: "The Great Film",
        role: "Lead Actor",
        productionType: "Film",
        year: 1850,
        description: "Short details",
        mediaUrls: ["ftp://invalid-url.com"],
      };
      expect(deliverableSchema.safeParse(payload).success).toBe(false);
    });
  });
});
