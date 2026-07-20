/**
 * project.utils.ts
 *
 * Single source of truth for all data transforms between the backend API shape
 * and the frontend form shape in the Castglo project/casting module.
 *
 * Backend speaks:  camelCase  (roleType, ageRange, nudityRequired, …)
 * Form speaks:     snake_case (role_type[], minimum_age, nudity_required, …)
 *
 * Extra form fields that have no native backend column are persisted as a
 * URL-encoded JSON blob prefixed "__META__:" inside the projectAttachments array.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FormRole {
  id: string;
  role_name: string;
  role_type: string[];
  role_status: string;
  character_role_summary: string;
  full_role_description: string;
  number_of_talents_needed: string;
  featured_role: boolean;
  role_talent_types_needed: string[];
  playing_age_range: string;
  minimum_age: string;
  maximum_age: string;
  gender: string[];
  ethnicity: string[];
  open_to_all_ethnicities: boolean;
  height_range: string;
  build_physical_type: string[];
  languages_required: string[];
  accents_required: string[];
  skills_required: string[];
  preferred_skills: string[];
  professional_experience_required: boolean;
  experience_level_preferred: string;
  union_status_required: string;
  driving_licence_required: boolean;
  passport_required: boolean;
  travel_required: boolean;
  speaking_role: boolean;
  singing_required: boolean;
  dancing_required: boolean;
  stunts_required: boolean;
  modelling_posing_required: boolean;
  hosting_presenting_required: boolean;
  intimacy_scene: boolean;
  nudity_required: boolean;
  nudity_type: string;
  action_combat_required: boolean;
  safeguarding_conditions_apply: boolean;
  role_shoot_performance_location: string;
  role_city: string;
  role_country: string;
  remote_option_available: boolean;
  rehearsal_dates: string;
  shoot_dates: string;
  performance_dates: string;
  availability_requirement: string;
  is_paid_role: boolean;
  payment_type: string;
  payment_amount: string;
  currency: string;
  expenses_covered: boolean;
  accommodation_covered: boolean;
  travel_covered: boolean;
  compensation_notes: string;
  /** True when this role was loaded from the server (edit mode). False for locally-added new roles. */
  _fromServer?: boolean;
  [key: string]: any;
}

// ── Status helpers ──────────────────────────────────────────────────────────────

/** Maps backend status values to human-readable display labels. */
export function getStatusLabel(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "open" || s === "open_for_applications") return "Open";
  if (s === "published") return "Published";
  if (s === "draft") return "Draft";
  if (s === "closed" || s === "cancelled") return "Closed";
  if (s === "paused") return "Paused";
  if (s === "pending" || s === "pending_review" || s === "pending_approval") return "Pending";
  if (s === "filled") return "Filled";
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Draft";
}

/** Returns the Tailwind badge className for a given backend status. */
export function getStatusClass(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "open" || s === "open_for_applications" || s === "published")
    return "bg-success text-success-foreground";
  if (s === "pending" || s === "pending_review" || s === "pending_approval")
    return "bg-blue-500 hover:bg-blue-600 text-white";
  if (s === "draft") return "bg-warning text-warning-foreground";
  return "bg-muted text-muted-foreground";
}

export const isOpenStatus = (status: string) =>
  ["active", "open", "open_for_applications", "published"].includes((status || "").toLowerCase());

export const isDraftStatus = (status: string) =>
  (status || "").toLowerCase() === "draft";

// ── Date helpers ───────────────────────────────────────────────────────────────

/** Safely format any date value for display. Returns "—" for invalid/missing. */
export function formatDateDisplay(v: any): string {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v) || "—";
    return d.toLocaleDateString();
  } catch {
    return String(v);
  }
}

/** Convert a date value to an HTML date-input value (YYYY-MM-DD). */
export function toDateInput(value: any): string {
  if (!value) return "";
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ── String / array helpers ─────────────────────────────────────────────────────

export function toStringArray(value: any): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

// ── Project type / status label normalisation ─────────────────────────────────

export function toProjectTypeLabel(value: any): string {
  const v = String(value || "").trim();
  if (!v) return "";
  const map: Record<string, string> = {
    film: "Film",
    tv: "TV",
    theatre: "Theatre",
    theater: "Theatre",
    commercial: "Commercial",
    voiceover: "Voiceover",
    voice_over: "Voiceover",
    voice: "Voiceover",
    musicvideo: "Music Video",
    music_video: "Music Video",
  };
  return map[v.toLowerCase()] || v.charAt(0).toUpperCase() + v.slice(1);
}

export function toProjectStatusLabel(value: any): string {
  const v = String(value || "").trim();
  if (!v) return "";
  const s = v.toLowerCase();
  if (s === "open" || s === "active") return "Open for Applications";
  if (s === "draft") return "Draft";
  if (s === "closed") return "Closed";
  if (s === "filled") return "Role Filled";
  return v;
}

// ── __META__ blob helpers ──────────────────────────────────────────────────────

/**
 * Searches projectAttachments and requirements arrays for the hidden __META__:
 * blob and decodes it. Returns null if not found.
 */
export function parseMetaFromAttachments(
  projectAttachments: any[],
  requirements: any[] = []
): any | null {
  const searchArray = [
    ...(Array.isArray(projectAttachments) ? projectAttachments : []),
    ...(Array.isArray(requirements) ? requirements : []),
  ];

  for (const item of searchArray) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed.startsWith("__META__:")) continue;

    const raw = trimmed.substring(9);
    // Try URI-decode first (new format), then raw (legacy)
    for (const attempt of [() => JSON.parse(decodeURIComponent(raw)), () => JSON.parse(raw)]) {
      try {
        return attempt();
      } catch {
        /* try next */
      }
    }
  }
  return null;
}

/**
 * Builds a keyed lookup map from the roles array inside parsed meta.
 * Keys are the role id/._id strings.
 */
export function buildMetaRolesById(parsedMeta: any | null): Record<string, any> {
  const byId: Record<string, any> = {};
  if (!Array.isArray(parsedMeta?.roles)) return byId;
  for (const mr of parsedMeta.roles) {
    const key = String(mr.id || mr._id || "");
    if (key) byId[key] = mr;
  }
  return byId;
}

// ── Cover image helper ─────────────────────────────────────────────────────────

/**
 * Extracts the project cover image URL from any of the possible locations
 * the backend or meta might store it.
 */
export function getProjectCoverImage(
  projectData: any,
  metaData?: any
): string {
  // 1. Native backend fields
  if (projectData?.project_cover_image) return projectData.project_cover_image;
  if (projectData?.image) return projectData.image;
  if (projectData?.coverImage) return projectData.coverImage;
  // 2. Meta blob field
  if (metaData?.project_cover_image) return metaData.project_cover_image;
  // 3. First non-META entry in projectAttachments
  if (Array.isArray(projectData?.projectAttachments)) {
    const url = projectData.projectAttachments.find(
      (a: any) => typeof a === "string" && !a.startsWith("__META__:")
    );
    if (url) return url;
  }
  return "";
}

// ── Role normalisation ─────────────────────────────────────────────────────────

const ROLE_TYPE_MAP: Record<string, string> = {
  lead: "Lead",
  supporting: "Supporting",
  "featured extra": "Featured Extra",
  extra: "Extra",
  "voice over": "Voice Over",
  presenter: "Presenter",
  voiceover: "Voice Over",
  "voice actor": "Voice Over",
  background: "Extra",
  other: "Other",
};

/** Map the raw role_type string/array to one of the backend enum values. */
export function mapRoleTypeToBackend(roleTypeArr: string[]): string {
  const raw = (roleTypeArr?.[0] || "").toLowerCase();
  return ROLE_TYPE_MAP[raw] || "Other";
}

/**
 * Normalises a backend API role object (camelCase) merged with its meta counterpart
 * (snake_case) into a clean FormRole ready for the form.
 */
export function normaliseRoleFromAPI(backendRole: any, metaRole?: any): FormRole {
  // Start with meta (has all original form fields), then overlay backend (source of truth for IDs)
  const merged = { ...(metaRole || {}), ...backendRole };
  const roleId = String(merged.id || merged._id || merged.role_id || "");

  return {
    ...merged,
    id: roleId || Math.random().toString(36).slice(2),
    _fromServer: true, // Sourced from the API — safe to call updateRole on submit

    // Name
    role_name: merged.role_name || merged.name || merged.title || "",

    // Type — backend: string, form: string[]
    role_type: Array.isArray(merged.role_type)
      ? merged.role_type
      : Array.isArray(merged.roleType)
      ? merged.roleType
      : merged.roleType || merged.role_type
      ? [String(merged.roleType || merged.role_type)]
      : [],

    role_status: merged.role_status || merged.status || "Open",

    // Description — backend uses roleDescription for both
    character_role_summary:
      merged.character_role_summary || merged.roleDescription || merged.description || "",
    full_role_description:
      merged.full_role_description || merged.roleDescription || "",

    // Gender — backend: single string, form: string[]
    gender: Array.isArray(merged.gender)
      ? merged.gender
      : merged.gender && merged.gender !== "any"
      ? [String(merged.gender)]
      : [],

    // Ethnicity — backend: single string, form: string[]
    ethnicity: Array.isArray(merged.ethnicity)
      ? merged.ethnicity
      : merged.ethnicity && merged.ethnicity !== "any"
      ? [String(merged.ethnicity)]
      : [],

    // Age — backend: ageRange.min / ageRange.max
    minimum_age: String(
      merged.minimum_age ?? merged.minAge ?? merged.min_age ?? merged.ageRange?.min ?? "18"
    ),
    maximum_age: String(
      merged.maximum_age ?? merged.maxAge ?? merged.max_age ?? merged.ageRange?.max ?? "35"
    ),

    number_of_talents_needed:
      merged.number_of_talents_needed || merged.numberOfTalentsNeeded || "1",
    playing_age_range: merged.playing_age_range || merged.playingAgeRange || "",
    role_city: merged.role_city || merged.city || "",
    role_country: merged.role_country || merged.country || "UK",

    // Union — backend: unionStatusRequirement
    union_status_required:
      merged.union_status_required ||
      merged.unionStatusRequirement ||
      merged.unionStatus ||
      "Open to All",

    payment_amount: merged.payment_amount || merged.payRate || merged.pay_rate || "",
    payment_type: merged.payment_type || merged.paymentType || "Fixed Fee",
    currency: merged.currency || "GBP",
    is_paid_role: merged.is_paid_role ?? true,

    // Skills — backend: skillsRequired (camelCase)
    skills_required: Array.isArray(merged.skills_required)
      ? merged.skills_required
      : Array.isArray(merged.skillsRequired)
      ? merged.skillsRequired
      : [],

    role_talent_types_needed: Array.isArray(merged.role_talent_types_needed)
      ? merged.role_talent_types_needed
      : [],
    build_physical_type: Array.isArray(merged.build_physical_type)
      ? merged.build_physical_type
      : [],

    // Languages — backend: languageRequirements (single string)
    languages_required: Array.isArray(merged.languages_required)
      ? merged.languages_required
      : merged.languageRequirements && merged.languageRequirements !== "English"
      ? [merged.languageRequirements]
      : [],

    // Accents — backend: accentRequirements (single string)
    accents_required: Array.isArray(merged.accents_required)
      ? merged.accents_required
      : merged.accentRequirements && merged.accentRequirements !== "any"
      ? [merged.accentRequirements]
      : [],

    preferred_skills: Array.isArray(merged.preferred_skills) ? merged.preferred_skills : [],

    // Booleans
    speaking_role: merged.speaking_role ?? true,
    singing_required: merged.singing_required ?? false,
    dancing_required: merged.dancing_required ?? false,
    stunts_required: merged.stunts_required ?? false,
    intimacy_scene: merged.intimacy_scene ?? false,
    nudity_required: merged.nudity_required ?? merged.nudityRequired ?? false,
    travel_required: merged.travel_required ?? false,
    remote_option_available: merged.remote_option_available ?? false,
    featured_role: merged.featured_role ?? false,
    expenses_covered: merged.expenses_covered ?? false,
    accommodation_covered: merged.accommodation_covered ?? false,
    travel_covered: merged.travel_covered ?? false,
    open_to_all_ethnicities: merged.open_to_all_ethnicities ?? true,
    professional_experience_required: merged.professional_experience_required ?? false,
    driving_licence_required: merged.driving_licence_required ?? false,
    passport_required: merged.passport_required ?? false,
    modelling_posing_required: merged.modelling_posing_required ?? false,
    hosting_presenting_required: merged.hosting_presenting_required ?? false,
    nudity_type: merged.nudity_type || "To Be Discussed",
    action_combat_required: merged.action_combat_required ?? false,
    safeguarding_conditions_apply: merged.safeguarding_conditions_apply ?? false,
    experience_level_preferred: merged.experience_level_preferred || "Professional",

    // Location / dates
    role_shoot_performance_location:
      merged.role_shoot_performance_location || merged.locationRequirements || "",
    shoot_dates: merged.shoot_dates || "",
    rehearsal_dates: merged.rehearsal_dates || "",
    performance_dates: merged.performance_dates || "",
    availability_requirement:
      merged.availability_requirement || merged.availabilityRequirement || "",
    compensation_notes: merged.compensation_notes || "",
    height_range: merged.height_range || "",
  };
}

// ── Role backend payload builder ───────────────────────────────────────────────

/**
 * Converts a FormRole into the payload shape the backend POST /projects/:id/roles accepts.
 * Does NOT include `id` — callers should strip that for creates and use it for updates.
 */
export function buildRolePayload(role: FormRole, formMediaRequired: string[], applicationDeadline: string, customUploadDescription?: string) {
  const payload: any = {
    name: role.role_name || "Role",
    roleType: mapRoleTypeToBackend(role.role_type),
    status: "active",
    ageRange: {
      min: Number(role.minimum_age || 18),
      max: Number(role.maximum_age || 35),
    },
    gender: role.gender?.[0] || "any",
    ethnicity: role.ethnicity?.[0] || "any",
    skillsRequired: Array.isArray(role.skills_required) ? role.skills_required : [],
    roleDescription: role.full_role_description || role.character_role_summary || "No description",
    nudityRequired: role.nudity_required ?? false,
    mediaRequiredFromApplicants: formMediaRequired || [],
    locationRequirements: role.role_shoot_performance_location || "any",
    accentRequirements: role.accents_required?.[0] || "any",
    languageRequirements: role.languages_required?.[0] || "English",
    unionStatusRequirement: role.union_status_required || "any",
    availabilityRequirement: role.availability_requirement || "flexible",
    preAudition: {
      requestCustomVideo: formMediaRequired?.includes("Reel") || false,
      requestCustomAudio: formMediaRequired?.includes("Voice Reel") || false,
      requestAdditionalMedia: false,
      sendMessage: false,
      questionsEnabled: !!customUploadDescription,
      deadline: applicationDeadline
        ? new Date(applicationDeadline).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      questions: [],
      ...(customUploadDescription ? { instructions: customUploadDescription } : {}),
    },
  };

  return payload;
}

// ── Project backend payload builder ───────────────────────────────────────────

/**
 * Converts the top-level form state into the payload the backend
 * POST/PATCH /projects accepts.
 *
 * Does NOT include projectAttachments — caller adds the META blob and image URL.
 */
export function buildProjectPayload(formData: any, statusOverride?: string): any {
  const isBoosted = formData.featured_project || formData.instant_posting_addon;

  const payload: any = {
    title:
      formData.project_title ||
      (formData.roles?.[0]?.role_name ? formData.roles[0].role_name : "Untitled Project"),
    productionType: formData.project_type || "Film",
    description:
      formData.full_project_description || formData.short_project_summary || "No description",
    talentTypesNeeded: formData.talent_types_needed?.length
      ? formData.talent_types_needed
      : ["Actors"],
    genre: formData.genre || [],
    productionCompany: formData.production_company_name || "Independent",
    personnel: [formData.director_name, formData.producer_name, formData.writer_name].filter(
      Boolean
    ) as string[],
    payment: {
      paidUnpaid: formData.project_type === "Student Film" ? "unpaid" : "paid",
      type: "fixed",
      amount: 0,
      currency: "GBP",
      notes: "Rates variable by role",
    },
    dates: {
      submission: formData.application_deadline
        ? new Date(formData.application_deadline).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    },
    location: {
      locationType: formData.audition_location?.toLowerCase().includes("remote")
        ? "Remote"
        : "On Location",
      city: formData.preferred_talent_base || "Anywhere",
      country: "Anywhere",
      addressDetails: formData.audition_location || "",
      remote: formData.audition_location?.toLowerCase().includes("remote") || false,
    },
    auditionRequired: formData.audition_required ? "Yes" : "No",
    interviewRequired: formData.interview_required ? "Yes" : "No",
    auditionType: formData.audition_type?.[0]?.toLowerCase().includes("zoom")
      ? "zoom"
      : "self-tape",
    projectVideos: [],
    status:
      statusOverride === "draft" || isBoosted
        ? "draft"
        : formData.project_status?.toLowerCase().includes("open")
        ? "active"
        : "draft",
  };

  if (formData.project_website) payload.projectWebsite = formData.project_website;
  if (formData.director_name) payload.directorBio = `Directed by ${formData.director_name}`;

  return payload;
}

// ── Deadline extraction ────────────────────────────────────────────────────────

/**
 * Extracts and formats the submission deadline from a project object.
 * New API stores it in dates.submission; legacy stored it in deadline / application_deadline.
 */
export function getProjectDeadline(project: any): string {
  const raw =
    project?.dates?.submission ||
    project?.application_deadline ||
    project?.deadline ||
    "";
  return formatDateDisplay(raw);
}
