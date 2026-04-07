import { z } from "zod";
import {
  shouldShowCastingDirectorField,
  UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC,
} from "./fieldSpec";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, "Must be a valid URL");

export const unifiedCastingDirectorProfileSchema = z
  .object({
    full_name: z.string().min(2).max(100),
    display_name: z.string().min(2).max(100),
    professional_title: z.string().min(2).max(120),
    short_bio: z.string().min(50).max(300),
    city: z.string().min(2).max(100),
    country: z.string().min(2),
    primary_account_type: z.string(),
    years_of_experience: z.string(),
    experience_level: z.string(),
    project_title: z.string().min(2).max(150),
    production_type: z.string().min(2),
    production_description: z.string().min(10),
    talent_type_needed: z.array(z.string()).min(1),
    paid_unpaid: z.string(),
    role_name: z.string().min(2).max(120),
    role_type: z.string(),
    role_status: z.string(),
    applicant_statuses: z.array(z.string()).min(1),
    website: optionalUrl,
    project_website: optionalUrl,
  })
  .passthrough()
  .superRefine((values, ctx) => {
    if (values.additional_account_types?.includes(values.primary_account_type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["additional_account_types"],
        message: "Additional account types cannot contain primary account type.",
      });
    }

    if (values.paid_unpaid === "Paid") {
      if (!values.payment_type) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["payment_type"], message: "Payment type is required for paid casting calls." });
      }
      if (values.payment_amount === undefined || values.payment_amount === null || values.payment_amount === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["payment_amount"], message: "Payment amount is required for paid casting calls." });
      }
    }

    if (values.preaudition_questions_enabled) {
      if (!values.preaudition_question_text) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["preaudition_question_text"], message: "Pre-audition question text is required when questions are enabled." });
      }
      if (!values.preaudition_question_type) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["preaudition_question_type"], message: "Question type is required when questions are enabled." });
      }
    }

    for (const field of UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC) {
      if (!field.required) continue;
      if (!shouldShowCastingDirectorField(field, values)) continue;
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

export type UnifiedCastingDirectorProfileData = z.infer<typeof unifiedCastingDirectorProfileSchema>;

export const validateUnifiedCastingDirectorProfile = (data: Record<string, any>) =>
  unifiedCastingDirectorProfileSchema.safeParse(data);
