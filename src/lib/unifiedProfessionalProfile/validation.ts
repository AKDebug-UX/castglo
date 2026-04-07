import { z } from "zod";
import {
  shouldShowProfessionalField,
  UNIFIED_PROFESSIONAL_PROFILE_FIELD_SPEC,
} from "./fieldSpec";

const optionalUrl = z.string().trim().optional().refine((value) => {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}, "Must be a valid URL");

export const unifiedProfessionalProfileSchema = z
  .object({
    full_name: z.string().min(2).max(100),
    display_name: z.string().min(2).max(100),
    professional_title: z.string().min(2).max(120),
    email: z.string().email(),
    phone_number: z.string().min(7).max(30),
    short_bio: z.string().min(50).max(300),
    full_bio: z.string().max(3000).optional(),
    city: z.string().min(2).max(100),
    country: z.string().min(2),
    years_of_experience: z.string(),
    experience_level: z.string(),
    profile_status: z.string(),
    profile_visibility: z.string(),
    primary_professional_type: z.string(),
    additional_professional_types: z.array(z.string()).optional(),
    serves_client_types: z.array(z.string()).min(1),
    industry_areas: z.array(z.string()).optional(),
    availability_type: z.string(),
    preferred_contact_method: z.string(),
    booking_method: z.string(),
    service_title: z.string().min(3).max(120),
    service_category: z.string(),
    service_short_description: z.string().min(30).max(250),
    target_client_types: z.array(z.string()).min(1),
    delivery_type: z.string(),
    duration_type: z.string(),
    pricing_model: z.string(),
    currency: z.string(),
    service_status: z.string(),
    portfolio_item_title: z.string().min(3).max(120),
    portfolio_item_type: z.string(),
    portfolio_website: optionalUrl,
    instagram_url: optionalUrl,
    youtube_url: optionalUrl,
    vimeo_url: optionalUrl,
    external_url: optionalUrl,
  })
  .passthrough()
  .superRefine((values, ctx) => {
    if (values.additional_professional_types?.includes(values.primary_professional_type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["additional_professional_types"],
        message: "Additional professional types cannot include the primary professional type.",
      });
    }

    if (values.deposit_required && (values.deposit_percentage === undefined || values.deposit_percentage === null || values.deposit_percentage === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deposit_percentage"],
        message: "Deposit percentage is required when deposit is required.",
      });
    }

    if (values.deposit_percentage !== undefined && values.deposit_percentage !== null && values.deposit_percentage !== "") {
      const n = Number(values.deposit_percentage);
      if (Number.isNaN(n) || n < 0 || n > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deposit_percentage"],
          message: "Deposit percentage must be between 0 and 100.",
        });
      }
    }

    if (values.duration_type === "Custom" && !values.custom_duration_text) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["custom_duration_text"], message: "Custom duration is required." });
    }

    if (values.pricing_model !== "Custom Quote" && (values.price_amount === undefined || values.price_amount === null || values.price_amount === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["price_amount"], message: "Price amount is required unless pricing model is Custom Quote." });
    }

    if (values.add_ons_available && !values.add_on_summary) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["add_on_summary"], message: "Add-On summary is required when add-ons are available." });
    }

    if (values.delivery_type === "In-person" || values.delivery_type === "Hybrid") {
      if (!values.service_city) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["service_city"], message: "Service city is required for in-person/hybrid delivery." });
      }
      if (!values.service_country) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["service_country"], message: "Service country is required for in-person/hybrid delivery." });
      }
    }

    if (!values.media_id && !values.external_url) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["media_id"], message: "Provide media file or external URL for portfolio item." });
    }

    for (const field of UNIFIED_PROFESSIONAL_PROFILE_FIELD_SPEC) {
      if (!field.required) continue;
      if (!shouldShowProfessionalField(field, values)) continue;
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

export type UnifiedProfessionalProfileData = z.infer<typeof unifiedProfessionalProfileSchema>;

export const validateUnifiedProfessionalProfile = (data: Record<string, any>) =>
  unifiedProfessionalProfileSchema.safeParse(data);
