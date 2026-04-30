import { z } from "zod";
import {
  UNIFIED_TALENT_PROFILE_FIELD_SPEC,
  isMinorFromAgeGroup,
  shouldShowField,
} from "./fieldSpec";

const urlOrEmpty = z.string().trim().optional().refine((value) => {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}, "Must be a valid URL");

export const unifiedTalentProfileSchema = z
  .object({
    full_name: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name cannot exceed 100 characters"),
    display_name: z.string().min(2, "Display name must be at least 2 characters").max(100, "Display name cannot exceed 100 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone_number: z.string().min(7, "Phone number is too short").max(30, "Phone number is too long"),
    dateOfBirth: z.string(),
    age_group: z.string(),
    gender: z.string(),
    gender_self_describe: z.string().max(50).optional(),
    nationality: z.string().min(2, "Nationality is required"),
    current_city: z.string().min(2, "City must be at least 2 characters").max(100, "City name is too long"),
    current_country: z.string().min(2, "Country is required"),
    right_to_work: z.boolean(),
    valid_passport: z.boolean(),
    willing_to_travel: z.boolean(),
    international_availability: z.boolean(),
    remote_work_open: z.boolean().optional(),
    short_bio: z.string().min(50, "Bio is too short (minimum 50 characters)").max(1000, "Bio is too long (maximum 1000 characters)"),
    career_goals: z.string().max(1000, "Career goals cannot exceed 1000 characters").optional(),
    languages_spoken: z.array(z.string()).optional(),
    fluent_languages: z.array(z.string()).optional(),
    natural_accent: z.string().optional(),
    primary_talent_type: z.string(),
    additional_talent_types: z.array(z.string()).optional(),
    years_of_experience: z.string(),
    experience_level: z.string(),
    representation_status: z.string(),
    agency_name: z.string().max(150, "Agency name is too long").optional(),
    agency_contact_details: z.string().max(500, "Contact details are too long").optional(),
    expected_rate_other: z.string().max(100, "Custom rate text is too long").optional(),
    opportunities_not_accepted: z.string().max(1000, "Description is too long").optional(),
    guardian_full_name: z.string().min(2, "Guardian name must be at least 2 characters").max(100, "Guardian name is too long").optional(),
    guardian_relationship: z.string().optional(),
    guardian_email: z.string().email("Please enter a valid guardian email").optional(),
    guardian_phone: z.string().min(7, "Guardian phone is too short").max(30, "Guardian phone is too long").optional(),
    guardian_consent_checkbox: z.boolean().optional(),
    portfolio_url: urlOrEmpty,
    instagram_url: urlOrEmpty,
    linkedin_url: urlOrEmpty,
    social_youtube: urlOrEmpty,
  })
  .passthrough()
  .superRefine((values, ctx) => {
    if (values.gender === "Prefer to self-describe" && !values.gender_self_describe) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["gender_self_describe"], message: "Gender self description is required." });
    }

    if (values.representation_status && values.representation_status !== "Self-represented") {
      if (!values.agency_name) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["agency_name"], message: "Agency/manager name is required for represented talent." });
      }
    }

    if (values.expected_rate_range === "Other" && !values.expected_rate_other) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["expected_rate_other"], message: "Custom rate is required when expected rate is Other." });
    }

    if (values.primary_talent_type && values.additional_talent_types?.includes(values.primary_talent_type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["additional_talent_types"], message: "Additional talent types cannot include the primary talent type." });
    }

    if (isMinorFromAgeGroup(values.age_group)) {
      if (!values.guardian_full_name) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["guardian_full_name"], message: "Guardian full name is required for minors." });
      }
      if (!values.guardian_relationship) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["guardian_relationship"], message: "Guardian relationship is required for minors." });
      }
      if (!values.guardian_email) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["guardian_email"], message: "Guardian email is required for minors." });
      }
      if (!values.guardian_phone) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["guardian_phone"], message: "Guardian phone is required for minors." });
      }
      if (!values.guardian_consent_checkbox) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["guardian_consent_checkbox"], message: "Guardian consent confirmation must be checked." });
      }
    }

    for (const field of UNIFIED_TALENT_PROFILE_FIELD_SPEC) {
      if (!field.required) continue;
      if (!shouldShowField(field, values)) continue;
      const value = values[field.id];
      const missing = value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
      if (missing) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field.id],
          message: `${field.label} is required.`,
        });
      }
    }
  });

export type UnifiedTalentProfileData = z.infer<typeof unifiedTalentProfileSchema>;

export const validateUnifiedTalentProfile = (data: Record<string, any>) => unifiedTalentProfileSchema.safeParse(data);
