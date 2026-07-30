export type ProfessionalFieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "multi-select"
  | "boolean"
  | "number"
  | "integer"
  | "decimal"
  | "url"
  | "file"
  | "multi-item-text"
  | "file-reference";

export interface ProfessionalVisibilityRule {
  showWhenField?: string;
  equals?: string | boolean;
  in?: Array<string | boolean>;
  showWhenProfessionalTypeIn?: string[];
}

export interface ProfessionalFieldSpec {
  id: string;
  label: string;
  section: string;
  type: ProfessionalFieldType;
  required: boolean;
  searchable: boolean;
  options?: string[];
  optionSource?:
    | "countries"
    | "professional_types"
    | "service_categories"
    | "pricing_models"
    | "client_types"
    | "industry_areas"
    | "working_days"
    | "software_tools"
    | "payment_methods"
    | "experience_years"
    | "experience_levels"
    | "profile_statuses"
    | "profile_visibility"
    | "availability_types"
    | "notice_required"
    | "contact_methods"
    | "booking_methods"
    | "delivery_types"
    | "service_location_types"
    | "duration_types"
    | "currencies"
    | "service_statuses"
    | "portfolio_item_types"
    | "portfolio_item_categories"
    | "photography_specialisms"
    | "mua_specialisms"
    | "coaching_specialisms"
    | "coaching_delivery_modes"
    | "editing_specialisms"
    | "file_transfer_methods"
    | "accents"
    | "age_ranges";
  validation?: string;
  visibility?: ProfessionalVisibilityRule;
}

const CORE_FIELDS: ProfessionalFieldSpec[] = [
  { id: "full_name", label: "Full Name", section: "Basic Info", type: "text", required: true, searchable: false, validation: "2-100 chars" },
  { id: "display_name", label: "Display Name / Brand Name", section: "Basic Info", type: "text", required: true, searchable: true, validation: "2-100 chars" },
  { id: "business_name", label: "Business Name", section: "Basic Info", type: "text", required: false, searchable: true, validation: "Max 150 chars" },
  { id: "professional_title", label: "Professional Title", section: "Basic Info", type: "text", required: true, searchable: true, validation: "Max 120 chars" },
  { id: "email", label: "Email Address", section: "Contact", type: "email", required: true, searchable: false },
  { id: "phone_number", label: "Phone Number", section: "Contact", type: "phone", required: true, searchable: false },
  { id: "profile_photo", label: "Profile Photo / Logo", section: "Media", type: "file", required: true, searchable: false },
  { id: "cover_image", label: "Cover Image / Banner", section: "Media", type: "file", required: false, searchable: false },
  { id: "short_bio", label: "Short Bio", section: "About", type: "textarea", required: true, searchable: true, validation: "50-300 chars" },
  { id: "full_bio", label: "Full About Description", section: "About", type: "textarea", required: false, searchable: true, validation: "Max 3000 chars" },
  { id: "equipment_summary", label: "Primary Equipment / Gear", section: "About", type: "textarea", required: false, searchable: true, validation: "Max 1000 chars" },
  { id: "city", label: "City", section: "Location", type: "text", required: true, searchable: true, validation: "2-100 chars" },
  { id: "country", label: "Country", section: "Location", type: "select", required: true, searchable: true, optionSource: "countries" },
  { id: "willing_to_travel", label: "Willing to Travel", section: "Location / Availability", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "remote_services_available", label: "Available for Remote Services", section: "Availability", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "years_of_experience", label: "Years of Experience", section: "Professional Overview", type: "select", required: true, searchable: true, optionSource: "experience_years" },
  { id: "experience_level", label: "Experience Level", section: "Professional Overview", type: "select", required: true, searchable: true, optionSource: "experience_levels" },
  { id: "performed_accents", label: "Performed Accents / Specialists", section: "Professional Overview", type: "multi-select", required: false, searchable: true, optionSource: "accents" },
  { id: "profile_status", label: "Profile Status", section: "System", type: "select", required: true, searchable: true, optionSource: "profile_statuses" },
  { id: "profile_visibility", label: "Profile Visibility", section: "System", type: "select", required: true, searchable: true, optionSource: "profile_visibility" },
];

const IDENTITY_FIELDS: ProfessionalFieldSpec[] = [
  { id: "primary_professional_type", label: "Primary Professional Type", section: "Professional Identity", type: "select", required: true, searchable: true, optionSource: "professional_types" },
  { id: "additional_professional_types", label: "Additional Professional Types", section: "Professional Identity", type: "multi-select", required: false, searchable: true, optionSource: "professional_types", validation: "Cannot duplicate primary type" },
  { id: "serves_client_types", label: "Who Do You Serve?", section: "Professional Focus", type: "multi-select", required: true, searchable: true, optionSource: "client_types" },
  { id: "served_age_ranges", label: "Age Ranges Served", section: "Professional Focus", type: "multi-select", required: false, searchable: true, optionSource: "age_ranges" },
  { id: "industry_areas", label: "Industry Areas", section: "Professional Focus", type: "multi-select", required: false, searchable: true, optionSource: "industry_areas" },
];

const SKILLS_FIELDS: ProfessionalFieldSpec[] = [
  { id: "core_skills", label: "Core Skills / Specialisms", section: "Skills", type: "multi-select", required: false, searchable: true },
  { id: "custom_skills", label: "Additional Custom Skills", section: "Skills", type: "textarea", required: false, searchable: true, validation: "Max 1000 chars" },
  { id: "software_tools", label: "Software / Tools Used", section: "Skills / Tools", type: "multi-select", required: false, searchable: true, optionSource: "software_tools" },
];

const PORTFOLIO_FIELDS: ProfessionalFieldSpec[] = [
  { id: "portfolio_website", label: "Website / Portfolio URL", section: "Portfolio", type: "url", required: false, searchable: false },
  { id: "instagram_url", label: "Instagram URL", section: "Social", type: "url", required: false, searchable: false },
  { id: "youtube_url", label: "YouTube URL", section: "Social", type: "url", required: false, searchable: false },
  { id: "vimeo_url", label: "Vimeo URL", section: "Social", type: "url", required: false, searchable: false },
  { id: "portfolio_item_count", label: "Portfolio Item Count", section: "System", type: "integer", required: false, searchable: false },
  { id: "testimonials_enabled", label: "Show Testimonials", section: "Reviews", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "notable_clients", label: "Notable Clients / Brands", section: "Credibility", type: "textarea", required: false, searchable: true, validation: "Max 2000 chars" },
  { id: "notable_projects", label: "Notable Projects", section: "Credibility", type: "textarea", required: false, searchable: true, validation: "Max 2000 chars" },
];

const AVAILABILITY_FIELDS: ProfessionalFieldSpec[] = [
  { id: "availability_type", label: "Availability Type", section: "Availability", type: "select", required: true, searchable: true, optionSource: "availability_types" },
  { id: "last_minute_bookings", label: "Available for Last-Minute Bookings", section: "Availability", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "notice_required", label: "Notice Required", section: "Availability", type: "select", required: false, searchable: true, optionSource: "notice_required" },
  { id: "international_availability", label: "Available Internationally", section: "Availability", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "working_days", label: "Working Days", section: "Availability", type: "multi-select", required: false, searchable: true, optionSource: "working_days" },
  { id: "working_hours_summary", label: "Working Hours", section: "Availability", type: "text", required: false, searchable: false, validation: "Max 150 chars" },
  { id: "booking_lead_time", label: "Booking Lead Time", section: "Availability", type: "text", required: false, searchable: false, validation: "Max 100 chars" },
];

const BOOKING_TERMS_FIELDS: ProfessionalFieldSpec[] = [
  { id: "preferred_contact_method", label: "Preferred Contact Method", section: "Booking Terms", type: "select", required: true, searchable: false, optionSource: "contact_methods" },
  { id: "booking_method", label: "Booking Method", section: "Booking Terms", type: "select", required: true, searchable: true, optionSource: "booking_methods" },
  { id: "deposit_required", label: "Deposit Required", section: "Booking Terms", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "deposit_percentage", label: "Deposit Percentage", section: "Booking Terms", type: "number", required: false, searchable: false, visibility: { showWhenField: "deposit_required", equals: true } },
  { id: "payment_methods", label: "Payment Methods Accepted", section: "Booking Terms", type: "multi-select", required: false, searchable: true, optionSource: "payment_methods" },
  { id: "cancellation_policy", label: "Cancellation Policy", section: "Booking Terms", type: "textarea", required: false, searchable: false, validation: "Max 1500 chars" },
  { id: "refund_policy", label: "Refund Policy", section: "Booking Terms", type: "textarea", required: false, searchable: false, validation: "Max 1500 chars" },
  { id: "contract_required", label: "Contract Required", section: "Booking Terms", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "nda_friendly", label: "NDA Friendly", section: "Booking Terms", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "invoicing_available", label: "Invoicing Available", section: "Booking Terms", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "tax_registered", label: "Tax / VAT Registered", section: "Booking Terms", type: "select", options: ["Yes", "No"], required: false, searchable: true },
];

const TRUST_FIELDS: ProfessionalFieldSpec[] = [
  { id: "certifications", label: "Certifications / Training", section: "Credibility", type: "textarea", required: false, searchable: true, validation: "Max 2000 chars" },
  { id: "professional_memberships", label: "Professional Memberships", section: "Credibility", type: "textarea", required: false, searchable: true, validation: "Max 1000 chars" },
  { id: "awards_recognition", label: "Awards / Recognition", section: "Credibility", type: "textarea", required: false, searchable: true, validation: "Max 1000 chars" },
  { id: "studio_access", label: "Studio Access", section: "Credibility / Facilities", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "studio_details", label: "Studio Details", section: "Credibility / Facilities", type: "textarea", required: false, searchable: false, visibility: { showWhenField: "studio_access", equals: true }, validation: "Max 1000 chars" },
  { id: "insurance_available", label: "Insurance Available", section: "Credibility", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "insurance_details", label: "Insurance Details", section: "Credibility", type: "textarea", required: false, searchable: false, visibility: { showWhenField: "insurance_available", equals: true }, validation: "Max 1000 chars" },
  { id: "dbs_checked", label: "DBS / Background Checked", section: "Credibility", type: "select", options: ["Yes", "No"], required: false, searchable: true },
];

const SERVICE_LISTING_FIELDS: ProfessionalFieldSpec[] = [
  { id: "service_title", label: "Service Title", section: "Service Listing", type: "text", required: true, searchable: true, validation: "3-120 chars" },
  { id: "service_category", label: "Service Category", section: "Service Listing", type: "select", required: true, searchable: true, optionSource: "service_categories" },
  { id: "service_short_description", label: "Short Description", section: "Service Listing", type: "textarea", required: true, searchable: true, validation: "30-250 chars" },
  { id: "service_full_description", label: "Full Description", section: "Service Listing", type: "textarea", required: false, searchable: true, validation: "Max 3000 chars" },
  { id: "target_client_types", label: "Target Client Types", section: "Service Listing", type: "multi-select", required: true, searchable: true, optionSource: "client_types" },
  { id: "delivery_type", label: "Delivery Type", section: "Service Listing", type: "select", required: true, searchable: true, optionSource: "delivery_types" },
  { id: "service_location_type", label: "Service Location", section: "Service Listing", type: "select", required: false, searchable: true, optionSource: "service_location_types" },
  { id: "service_city", label: "Service City", section: "Service Listing", type: "text", required: false, searchable: true, visibility: { showWhenField: "delivery_type", in: ["In-person", "Hybrid"] } },
  { id: "service_country", label: "Service Country", section: "Service Listing", type: "select", required: false, searchable: true, optionSource: "countries", visibility: { showWhenField: "delivery_type", in: ["In-person", "Hybrid"] } },
  { id: "duration_type", label: "Duration", section: "Service Listing", type: "select", required: true, searchable: true, optionSource: "duration_types" },
  { id: "custom_duration_text", label: "Custom Duration", section: "Service Listing", type: "text", required: false, searchable: false, visibility: { showWhenField: "duration_type", equals: "Custom" } },
  { id: "pricing_model", label: "Pricing Model", section: "Service Listing", type: "select", required: true, searchable: true, optionSource: "pricing_models" },
  { id: "price_amount", label: "Price Amount", section: "Service Listing", type: "decimal", required: false, searchable: true, visibility: { showWhenField: "pricing_model", in: ["Fixed Price", "Hourly Rate", "Half Day Rate", "Daily Rate", "Per Session", "Per Look", "Per Image", "Per Edit", "Per Track", "Per Project", "Package Price", "Starting From"] } },
  { id: "currency", label: "Currency", section: "Service Listing", type: "select", required: true, searchable: true, optionSource: "currencies" },
  { id: "custom_quote_available", label: "Custom Quote Available", section: "Service Listing", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "turnaround_time", label: "Turnaround Time", section: "Service Listing", type: "text", required: false, searchable: true },
  { id: "revisions_included", label: "Revisions Included", section: "Service Listing", type: "text", required: false, searchable: true },
  { id: "booking_notice_required", label: "Booking Notice Required", section: "Service Listing", type: "select", required: false, searchable: true, optionSource: "notice_required" },
  { id: "cancellation_policy_summary", label: "Cancellation Policy", section: "Service Listing", type: "textarea", required: false, searchable: false },
  { id: "service_status", label: "Service Status", section: "Service Listing", type: "select", required: true, searchable: true, optionSource: "service_statuses" },
  { id: "featured_service", label: "Featured Service", section: "Service Listing", type: "select", options: ["Yes", "No"], required: false, searchable: true },
];

const SERVICE_DELIVERABLE_FIELDS: ProfessionalFieldSpec[] = [
  { id: "deliverables", label: "What's Included / Deliverables", section: "Deliverables", type: "multi-item-text", required: false, searchable: true },
  { id: "add_ons_available", label: "Add-ons Available", section: "Deliverables", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "add_on_summary", label: "Add-On Summary", section: "Deliverables", type: "textarea", required: false, searchable: false, visibility: { showWhenField: "add_ons_available", equals: true } },
  { id: "usage_rights_summary", label: "Usage Rights / Licence", section: "Deliverables", type: "textarea", required: false, searchable: false },
];

const PORTFOLIO_ITEM_FIELDS: ProfessionalFieldSpec[] = [
  { id: "portfolio_item_title", label: "Portfolio Item Title", section: "Portfolio Item", type: "text", required: true, searchable: true },
  { id: "portfolio_item_type", label: "Portfolio Item Type", section: "Portfolio Item", type: "select", required: true, searchable: true, optionSource: "portfolio_item_types" },
  { id: "portfolio_item_category", label: "Portfolio Category", section: "Portfolio Item", type: "select", required: false, searchable: true, optionSource: "portfolio_item_categories" },
  { id: "portfolio_item_description", label: "Portfolio Item Description", section: "Portfolio Item", type: "textarea", required: false, searchable: true },
  { id: "media_id", label: "Media File", section: "Portfolio Item", type: "file-reference", required: false, searchable: false },
  { id: "external_url", label: "External URL", section: "Portfolio Item", type: "url", required: false, searchable: false },
  { id: "related_service_ids", label: "Related Services", section: "Portfolio Item", type: "multi-select", required: false, searchable: false },
  { id: "featured_portfolio_item", label: "Featured Portfolio Item", section: "Portfolio Item", type: "select", options: ["Yes", "No"], required: false, searchable: true },
];

const dynamicFor = (types: string[], fields: Omit<ProfessionalFieldSpec, "visibility">[]): ProfessionalFieldSpec[] =>
  fields.map((field) => ({ ...field, visibility: { ...(field as ProfessionalFieldSpec).visibility, showWhenProfessionalTypeIn: types } }));

const DYNAMIC_FIELDS: ProfessionalFieldSpec[] = [
  ...dynamicFor(["Photographer"], [
    { id: "photographer_specialisms", label: "Photography Specialisms", section: "Photographer Profile", type: "multi-select", required: false, searchable: true, optionSource: "photography_specialisms" },
    { id: "photographer_studio_access", label: "Studio Access", section: "Photographer Profile", type: "select", options: ["Yes", "No"], required: false, searchable: true },
    { id: "photographer_retouching_included", label: "Retouching Included", section: "Photographer Profile", type: "select", options: ["Yes", "No"], required: false, searchable: true },
    { id: "photographer_equipment_summary", label: "Camera / Lighting Equipment", section: "Photographer Profile", type: "textarea", required: false, searchable: true },
  ]),
  ...dynamicFor(["Makeup Artist"], [
    { id: "mua_specialisms", label: "Makeup Specialisms", section: "Makeup Artist Profile", type: "multi-select", required: false, searchable: true, optionSource: "mua_specialisms" },
    { id: "kit_available", label: "Professional Kit Available", section: "Makeup Artist Profile", type: "select", options: ["Yes", "No"], required: false, searchable: true },
    { id: "travel_kit_available", label: "Travel Kit Available", section: "Makeup Artist Profile", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  ]),
  ...dynamicFor(["Acting Coach"], [
    { id: "coaching_specialisms", label: "Coaching Specialisms", section: "Acting Coach Profile", type: "multi-select", required: false, searchable: true, optionSource: "coaching_specialisms" },
    { id: "coaching_delivery_modes", label: "Coaching Delivery Modes", section: "Acting Coach Profile", type: "multi-select", required: false, searchable: true, optionSource: "coaching_delivery_modes" },
    { id: "youth_clients_supported", label: "Supports Under-18 Clients", section: "Acting Coach Profile", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  ]),
  ...dynamicFor(["Video Editor", "Showreel Editor"], [
    { id: "editing_specialisms", label: "Editing Specialisms", section: "Editor Profile", type: "multi-select", required: false, searchable: true, optionSource: "editing_specialisms" },
    { id: "file_transfer_methods", label: "File Transfer Methods", section: "Editor Profile", type: "multi-select", required: false, searchable: true, optionSource: "file_transfer_methods" },
    { id: "revision_workflow", label: "Revision Workflow", section: "Editor Profile", type: "textarea", required: false, searchable: false },
  ]),
];

export const UNIFIED_PROFESSIONAL_PROFILE_FIELD_SPEC: ProfessionalFieldSpec[] = [
  ...CORE_FIELDS,
  ...IDENTITY_FIELDS,
  ...SKILLS_FIELDS,
  ...PORTFOLIO_FIELDS,
  ...AVAILABILITY_FIELDS,
  ...BOOKING_TERMS_FIELDS,
  ...TRUST_FIELDS,
  ...SERVICE_LISTING_FIELDS,
  ...SERVICE_DELIVERABLE_FIELDS,
  ...PORTFOLIO_ITEM_FIELDS,
  ...DYNAMIC_FIELDS,
];

export const UNIFIED_PROFESSIONAL_FIELD_IDS = new Set(UNIFIED_PROFESSIONAL_PROFILE_FIELD_SPEC.map((field) => field.id));

export const sectionToTabMap: Record<string, "general" | "professional" | "business" | "specialized" | "media"> = {
  "Basic Info": "general",
  "Contact": "general",
  "Location": "general",
  "Location / Availability": "general",
  "About": "general",
  "Media": "media",
  "Social": "media",
  "System": "business",
  "Professional Overview": "professional",
  "Professional Identity": "professional",
  "Professional Focus": "professional",
  "Skills": "professional",
  "Skills / Tools": "professional",
  "Portfolio": "media",
  "Reviews": "business",
  "Credibility": "business",
  "Credibility / Facilities": "business",
  "Availability": "business",
  "Booking Terms": "business",
  "Service Listing": "business",
  "Deliverables": "business",
  "Portfolio Item": "media",
  "Photographer Profile": "professional",
  "Makeup Artist Profile": "professional",
  "Acting Coach Profile": "professional",
  "Editor Profile": "professional",
};

export const shouldShowProfessionalField = (field: ProfessionalFieldSpec, values: Record<string, any>): boolean => {
  const visibility = field.visibility;
  if (!visibility) return true;

  if (visibility.showWhenProfessionalTypeIn?.length) {
    const primary = values.primary_professional_type;
    const additional = Array.isArray(values.additional_professional_types) ? values.additional_professional_types : [];
    const selected = [primary, ...additional].filter(Boolean);
    const match = selected.some((item) => visibility.showWhenProfessionalTypeIn?.includes(item));
    if (!match) return false;
  }

  if (visibility.showWhenField) {
    const current = values[visibility.showWhenField];
    if (visibility.equals !== undefined && current !== visibility.equals) return false;
    if (visibility.in && !visibility.in.includes(current)) return false;
  }

  return true;
};
