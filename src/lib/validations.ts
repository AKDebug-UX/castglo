import * as z from "zod";

/**
 * Reusable primitive Zod schemas
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email format (e.g. name@example.com)");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const simplePasswordSchema = z
  .string()
  .min(1, "Password is required");

export const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || val === "" || /^https?:\/\/.+/i.test(val),
    "URL must start with http:// or https://"
  );

export const requiredUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine(
    (val) => /^https?:\/\/.+/i.test(val),
    "URL must start with http:// or https://"
  );

export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || val === "" || /^[+\d\s()-]{7,20}$/.test(val),
    "Invalid phone number format"
  );

/**
 * Authentication Schemas
 */

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full Name must be at least 2 characters long")
      .max(100, "Full Name cannot exceed 100 characters"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreed: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms of Service and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: simplePasswordSchema,
  rememberMe: z.boolean().default(false),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const twoFactorCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Verification code is required")
    .refine(
      (val) => {
        const cleaned = val.replace(/\s+/g, "");
        // 6 digits or 8-10 char alphanumeric backup code
        return /^\d{6}$/.test(cleaned) || /^[A-Za-z0-9]{8,12}$/.test(cleaned);
      },
      "Code must be a 6-digit number or a valid backup code"
    ),
});

export type TwoFactorCodeFormValues = z.infer<typeof twoFactorCodeSchema>;

/**
 * Contact & Lead Forms Schema
 */

export const contactSchema = z.object({
  firstName: z.string().trim().min(2, "First Name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last Name must be at least 2 characters"),
  email: emailSchema,
  subject: z.string().trim().min(3, "Subject must be at least 3 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

/**
 * Deliverable History Form Schema
 */

const currentYear = new Date().getFullYear();

export const deliverableSchema = z.object({
  title: z.string().trim().min(1, "Project Title is required").max(300, "Title is too long"),
  role: z.string().trim().min(1, "Your Role / Credit is required").max(200, "Role is too long"),
  productionType: z.string().min(1, "Production Type is required"),
  year: z
    .number({ invalid_type_error: "Year must be a valid number" })
    .min(1900, "Year must be 1900 or later")
    .max(currentYear + 1, `Year cannot be past ${currentYear + 1}`),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000, "Description too long"),
  mediaUrls: z.array(requiredUrlSchema).max(3, "Maximum 3 media files allowed").optional().default([]),
  projectId: z.string().nullable().optional(),
});

export type DeliverableFormValues = z.infer<typeof deliverableSchema>;

/**
 * Project Submission Form Schema
 */

export const projectSubmissionSchema = z.object({
  coverLetter: z.string().trim().min(10, "Cover letter / notes must be at least 10 characters"),
  mediaUrl: optionalUrlSchema,
  showcaseRole: z.string().trim().optional(),
});

export type ProjectSubmissionFormValues = z.infer<typeof projectSubmissionSchema>;
