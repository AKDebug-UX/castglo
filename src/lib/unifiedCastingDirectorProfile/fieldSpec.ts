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

const PROJECT_FIELDS: CastingDirectorFieldSpec[] = [
  { id: "project_title", label: "Project Title", section: "Project / Casting Call", type: "text", required: true, searchable: true },
  { id: "production_type", label: "Production Type", section: "Project / Casting Call", type: "select", required: true, searchable: true, optionSource: "production_types" },
  { id: "genre", label: "Genre", section: "Project / Casting Call", type: "text", required: false, searchable: true },
  { id: "production_company", label: "Production Company", section: "Project / Casting Call", type: "text", required: false, searchable: true },
  { id: "production_personnel", label: "Production Personnel", section: "Project / Casting Call", type: "multi-item-text", required: false, searchable: false },
  { id: "production_description", label: "Production Description", section: "Project / Casting Call", type: "textarea", required: true, searchable: true },
  { id: "project_website", label: "Website", section: "Project / Casting Call", type: "url", required: false, searchable: false },

  { id: "talent_type_needed", label: "Type of Talent Needed", section: "Project / Casting Call", type: "multi-select", required: true, searchable: true, optionSource: "talent_types" },
  { id: "paid_unpaid", label: "Paid / Unpaid", section: "Project / Casting Call", type: "select", required: true, searchable: true, options: ["Paid", "Unpaid"] },
  { id: "payment_type", label: "Payment Type", section: "Project / Casting Call", type: "select", required: false, searchable: true, optionSource: "payment_types" },
  { id: "payment_amount", label: "Payment Amount", section: "Project / Casting Call", type: "number", required: false, searchable: true },
  { id: "currency", label: "Currency", section: "Project / Casting Call", type: "select", required: false, searchable: true, optionSource: "currencies" },
  { id: "compensation_notes", label: "Additional Compensation Notes", section: "Project / Casting Call", type: "textarea", required: false, searchable: false },

  { id: "project_date", label: "Project Date", section: "Project / Casting Call", type: "text", required: false, searchable: false },
  { id: "start_date", label: "Start Date", section: "Project / Casting Call", type: "text", required: false, searchable: false },
  { id: "end_date", label: "End Date", section: "Project / Casting Call", type: "text", required: false, searchable: false },
  { id: "audition_date", label: "Audition Date", section: "Project / Casting Call", type: "text", required: false, searchable: false },
  { id: "callback_date", label: "Callback Date", section: "Project / Casting Call", type: "text", required: false, searchable: false },
  { id: "submission_deadline", label: "Submission Deadline", section: "Project / Casting Call", type: "text", required: false, searchable: false },
  { id: "location_type", label: "Location Type", section: "Project / Casting Call", type: "select", required: false, searchable: true, optionSource: "location_types" },
  { id: "location_city", label: "City", section: "Project / Casting Call", type: "text", required: false, searchable: true },
  { id: "location_country", label: "Country", section: "Project / Casting Call", type: "select", required: false, searchable: true, optionSource: "countries" },
  { id: "address_details", label: "Address Details", section: "Project / Casting Call", type: "textarea", required: false, searchable: false },
  { id: "remote_option_available", label: "Remote Option Available", section: "Project / Casting Call", type: "select", options: ["Yes", "No"], required: false, searchable: true },

  { id: "audition_required", label: "Audition Required", section: "Project / Casting Call", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "interview_required", label: "Interview Required", section: "Project / Casting Call", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "audition_type", label: "Audition Type", section: "Project / Casting Call", type: "select", required: false, searchable: true, optionSource: "audition_types" },

  { id: "script_sides", label: "Script Sides", section: "Project / Casting Call", type: "file", required: false, searchable: false },
  { id: "project_poster", label: "Project Poster", section: "Project / Casting Call", type: "file", required: false, searchable: false },
  { id: "director_bio", label: "Director Bio", section: "Project / Casting Call", type: "textarea", required: false, searchable: false },
  { id: "project_videos", label: "Videos", section: "Project / Casting Call", type: "multi-item-text", required: false, searchable: false },
  { id: "project_attachments", label: "Attachments", section: "Project / Casting Call", type: "multi-item-text", required: false, searchable: false },
];

const ROLE_FIELDS: CastingDirectorFieldSpec[] = [
  { id: "role_name", label: "Role Name", section: "Role Management", type: "text", required: true, searchable: true },
  { id: "role_type", label: "Role Type", section: "Role Management", type: "select", required: true, searchable: true, optionSource: "role_types" },
  { id: "role_status", label: "Role Status", section: "Role Management", type: "select", required: true, searchable: true, optionSource: "role_statuses" },
  { id: "age_range", label: "Age Range", section: "Role Management", type: "select", required: false, searchable: true, optionSource: "age_ranges" },
  { id: "gender", label: "Gender", section: "Role Management", type: "select", required: false, searchable: true, optionSource: "genders" },
  { id: "ethnicity", label: "Ethnicity", section: "Role Management", type: "text", required: false, searchable: true },
  { id: "skills_required", label: "Skills Required", section: "Role Management", type: "multi-item-text", required: false, searchable: true },
  { id: "role_description", label: "Role Description", section: "Role Management", type: "textarea", required: false, searchable: true },
  { id: "nudity_required", label: "Nudity Required", section: "Role Management", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "media_required_from_applicants", label: "Media Required from Applicants", section: "Role Management", type: "multi-select", required: false, searchable: true, optionSource: "media_requirements" },
  { id: "location_requirements", label: "Location Requirements", section: "Role Management", type: "textarea", required: false, searchable: false },
  { id: "accent_requirements", label: "Accent Requirements", section: "Role Management", type: "textarea", required: false, searchable: true },
  { id: "language_requirements", label: "Language Requirements", section: "Role Management", type: "textarea", required: false, searchable: true },
  { id: "union_status_requirement", label: "Union Status Requirement", section: "Role Management", type: "text", required: false, searchable: true },
  { id: "availability_requirement", label: "Availability Requirement", section: "Role Management", type: "text", required: false, searchable: true },

  { id: "preaudition_request_custom_video", label: "Request Custom Video", section: "Pre-Audition Workflow", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "preaudition_request_custom_audio", label: "Request Custom Audio", section: "Pre-Audition Workflow", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "preaudition_request_additional_media", label: "Request Additional Media", section: "Pre-Audition Workflow", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "preaudition_send_message", label: "Send Message to Talent", section: "Pre-Audition Workflow", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "preaudition_questions_enabled", label: "Enable Pre-Audition Questions", section: "Pre-Audition Workflow", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "preaudition_instructions", label: "Instructions", section: "Pre-Audition Workflow", type: "textarea", required: false, searchable: false },
  { id: "preaudition_deadline", label: "Submission Deadline", section: "Pre-Audition Workflow", type: "text", required: false, searchable: false },

  { id: "preaudition_question_text", label: "Question Text", section: "Pre-Audition Form", type: "text", required: false, searchable: false },
  { id: "preaudition_question_type", label: "Question Type", section: "Pre-Audition Form", type: "select", required: false, searchable: false, optionSource: "preaudition_question_types" },
  { id: "preaudition_question_required", label: "Required / Optional Toggle", section: "Pre-Audition Form", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "preaudition_sort_order", label: "Sort Order", section: "Pre-Audition Form", type: "integer", required: false, searchable: false },
  { id: "preaudition_question_examples", label: "Question Examples", section: "Pre-Audition Form", type: "multi-item-text", required: false, searchable: false },
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

  { id: "public_profile_tabs", label: "Public Profile Tabs", section: "Profile Navigation", type: "multi-select", required: false, searchable: false, optionSource: "public_tabs" },
  { id: "private_dashboard_tabs", label: "Private Dashboard Tabs", section: "Profile Navigation", type: "multi-select", required: false, searchable: false, optionSource: "private_tabs" },
];

export const UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC: CastingDirectorFieldSpec[] = [
  ...CORE_FIELDS,
  ...HIRING_TOOL_FIELDS,
  ...PROJECT_FIELDS,
  ...ROLE_FIELDS,
  ...MARKETPLACE_FIELDS,
];

export const UNIFIED_CASTING_DIRECTOR_FIELD_IDS = new Set(
  UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC.map((field) => field.id)
);

export const castingDirectorSectionTabMap: Record<string, "overview" | "hiring" | "projects" | "roles" | "audition" | "commercial" | "navigation"> = {
  "Basic Information": "overview",
  "Professional Identity": "overview",
  "Credibility / Trust": "overview",
  "Hiring Manager Tools": "hiring",
  "Applicant Management": "hiring",
  "Project / Casting Call": "projects",
  "Role Management": "roles",
  "Pre-Audition Workflow": "audition",
  "Pre-Audition Form": "audition",
  "Marketplace / Commercial": "commercial",
  "Profile Navigation": "navigation",
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
