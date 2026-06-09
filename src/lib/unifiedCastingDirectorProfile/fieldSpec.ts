export type CastingDirectorFieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "multi-select"
  | "boolean"
  | "number"
  | "integer"
  | "url"
  | "file"
  | "date"
  | "multi-item-text";

export interface CastingDirectorVisibilityRule {
  showWhenField?: string;
  equals?: string | boolean;
}

export interface CastingDirectorFieldSpec {
  id: string;
  label: string;
  section: string;
  type: CastingDirectorFieldType;
  required: boolean;
  searchable: boolean;
  options?: string[];
  optionSource?:
    | "account_types"
    | "industry_areas"
    | "talent_types"
    | "applicant_statuses"
    | "folder_types"
    | "payment_types"
    | "currencies"
    | "location_types"
    | "audition_types"
    | "role_types"
    | "role_statuses"
    | "genders"
    | "media_requirements"
    | "preaudition_question_types"
    | "addons"
    | "public_tabs"
    | "private_tabs"
    | "years_of_experience"
    | "experience_levels"
    | "age_ranges"
    | "countries";
  validation?: string;
  visibility?: CastingDirectorVisibilityRule;
}

const CORE_FIELDS: CastingDirectorFieldSpec[] = [
  { id: "full_name", label: "Full Name", section: "Basic Information", type: "text", required: true, searchable: false, validation: "2-100 chars" },
  { id: "display_name", label: "Display Name", section: "Basic Information", type: "text", required: true, searchable: true },
  { id: "company_name", label: "Company / Agency Name", section: "Basic Information", type: "text", required: false, searchable: true },
  { id: "professional_title", label: "Professional Title", section: "Basic Information", type: "text", required: true, searchable: true },
  { id: "profile_photo", label: "Profile Photo / Company Logo", section: "Basic Information", type: "file", required: true, searchable: false },
  { id: "cover_image", label: "Cover Image / Banner", section: "Basic Information", type: "file", required: false, searchable: false },
  { id: "short_bio", label: "Short Bio", section: "Basic Information", type: "textarea", required: true, searchable: true, validation: "50-300 chars" },
  { id: "full_about", label: "Full About Description", section: "Basic Information", type: "textarea", required: false, searchable: true, validation: "Max 3000 chars" },
  { id: "city", label: "City", section: "Basic Information", type: "text", required: true, searchable: true },
  { id: "country", label: "Country", section: "Basic Information", type: "select", required: true, searchable: true, optionSource: "countries" },
  { id: "website", label: "Website", section: "Basic Information", type: "url", required: false, searchable: false },
  { id: "social_links", label: "Social Links", section: "Basic Information", type: "multi-item-text", required: false, searchable: false },
  { id: "email", label: "Email", section: "Basic Information", type: "email", required: true, searchable: false },
  { id: "phone_number", label: "Phone Number", section: "Basic Information", type: "phone", required: false, searchable: false },

  { id: "primary_account_type", label: "Primary Account Type", section: "Professional Identity", type: "select", required: true, searchable: true, optionSource: "account_types" },
  { id: "additional_account_types", label: "Additional Account Types", section: "Professional Identity", type: "multi-select", required: false, searchable: true, optionSource: "account_types" },
  { id: "years_of_experience", label: "Years of Experience", section: "Professional Identity", type: "select", required: true, searchable: true, optionSource: "years_of_experience" },
  { id: "experience_level", label: "Experience Level", section: "Professional Identity", type: "select", required: true, searchable: true, optionSource: "experience_levels" },
  { id: "industry_areas", label: "Industry Areas", section: "Professional Identity", type: "multi-select", required: false, searchable: true, optionSource: "industry_areas" },

  { id: "notable_productions", label: "Notable Productions", section: "Credibility / Trust", type: "textarea", required: false, searchable: true },
  { id: "notable_clients", label: "Notable Clients / Production Companies", section: "Credibility / Trust", type: "textarea", required: false, searchable: true },
  { id: "awards_recognition", label: "Awards / Recognition", section: "Credibility / Trust", type: "textarea", required: false, searchable: true },
  { id: "professional_memberships", label: "Professional Memberships", section: "Credibility / Trust", type: "textarea", required: false, searchable: true },
  { id: "verified_badge", label: "Verified Badge", section: "Credibility / Trust", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "response_time", label: "Response Time", section: "Credibility / Trust", type: "text", required: false, searchable: true },
  { id: "completed_castings", label: "Completed Castings", section: "Credibility / Trust", type: "integer", required: false, searchable: true },
  { id: "active_calls_count", label: "Active Calls Count", section: "Credibility / Trust", type: "integer", required: false, searchable: true },
];

const HIRING_TOOL_FIELDS: CastingDirectorFieldSpec[] = [
  { id: "applicant_statuses", label: "Applicant Pipeline Statuses", section: "Hiring Manager Tools", type: "multi-select", required: true, searchable: true, optionSource: "applicant_statuses" },
  { id: "enable_manage_applicants", label: "Manage Applicants", section: "Hiring Manager Tools", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "enable_switch_between_roles", label: "Switch Between Roles", section: "Hiring Manager Tools", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "enable_filter_applicants", label: "Filter Applicants", section: "Hiring Manager Tools", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "enable_matched_applicants", label: "Matched Applicants", section: "Hiring Manager Tools", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "enable_bulk_actions", label: "Bulk Actions", section: "Hiring Manager Tools", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "enable_folders", label: "Folders", section: "Hiring Manager Tools", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "enable_audition_requests", label: "Audition Requests", section: "Hiring Manager Tools", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "enable_private_notes", label: "Notes", section: "Hiring Manager Tools", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "enable_messaging", label: "Messaging", section: "Hiring Manager Tools", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "enable_collaborators", label: "Collaborators", section: "Hiring Manager Tools", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "enable_role_management", label: "Role Management", section: "Hiring Manager Tools", type: "select", options: ["Yes", "No"], required: false, searchable: false },

  { id: "filter_fields", label: "Applicant Filter Fields", section: "Applicant Management", type: "multi-item-text", required: false, searchable: false },
  { id: "match_engine_enabled", label: "Match Engine Enabled", section: "Applicant Management", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "match_criteria", label: "Match Criteria", section: "Applicant Management", type: "multi-item-text", required: false, searchable: false },
  { id: "bulk_actions", label: "Bulk Actions Available", section: "Applicant Management", type: "multi-item-text", required: false, searchable: false },
  { id: "folder_types", label: "Folder Types", section: "Applicant Management", type: "multi-select", required: false, searchable: false, optionSource: "folder_types" },
  { id: "notes_policy", label: "Private Notes Policy", section: "Applicant Management", type: "textarea", required: false, searchable: false },
  { id: "messaging_features", label: "Messaging Features", section: "Applicant Management", type: "multi-item-text", required: false, searchable: false },
  { id: "collaborator_permissions", label: "Collaborator Permission Levels", section: "Applicant Management", type: "multi-item-text", required: false, searchable: false },
];



const MARKETPLACE_FIELDS: CastingDirectorFieldSpec[] = [
  { id: "marketplace_addons", label: "Marketplace Add-ons", section: "Marketplace / Commercial", type: "multi-select", required: false, searchable: true, optionSource: "addons" },
  { id: "instant_posting", label: "Instant Posting", section: "Marketplace / Commercial", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "featured_posting", label: "Featured Posting", section: "Marketplace / Commercial", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "urgent_hiring_badge", label: "Urgent Hiring Badge", section: "Marketplace / Commercial", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "priority_matched_applicants", label: "Priority Matched Applicants", section: "Marketplace / Commercial", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "extended_visibility", label: "Extended Visibility", section: "Marketplace / Commercial", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "featured_role_highlight", label: "Featured Role Highlight", section: "Marketplace / Commercial", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "social_promotion_boost", label: "Social Promotion Boost", section: "Marketplace / Commercial", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "additional_collaborator_seats", label: "Additional Collaborator Seats", section: "Marketplace / Commercial", type: "integer", required: false, searchable: true },
  { id: "premium_analytics", label: "Premium Analytics", section: "Marketplace / Commercial", type: "select", options: ["Yes", "No"], required: false, searchable: true },
];

export const UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC: CastingDirectorFieldSpec[] = [
  ...CORE_FIELDS,
  ...HIRING_TOOL_FIELDS,
  ...MARKETPLACE_FIELDS,
];

export const UNIFIED_CASTING_DIRECTOR_FIELD_IDS = new Set(
  UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC.map((field) => field.id)
);

export const castingDirectorSectionTabMap: Record<string, "overview" | "hiring" | "audition" | "commercial" | "navigation"> = {
  "Basic Information": "overview",
  "Professional Identity": "overview",
  "Credibility / Trust": "overview",
  "Hiring Manager Tools": "hiring",
  "Applicant Management": "hiring",
  "Pre-Audition Workflow": "audition",
  "Pre-Audition Form": "audition",
  "Marketplace / Commercial": "commercial",
};

export const shouldShowCastingDirectorField = (
  field: CastingDirectorFieldSpec,
  values: Record<string, any>
): boolean => {
  const visibility = field.visibility;
  if (!visibility) return true;

  if (visibility.showWhenField) {
    const current = values[visibility.showWhenField];
    if (visibility.equals !== undefined && current !== visibility.equals) return false;
  }

  return true;
};
