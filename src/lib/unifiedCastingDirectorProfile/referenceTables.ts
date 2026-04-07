export const ACCOUNT_TYPES = [
  "Casting Director",
  "Casting Agency",
  "Production Company",
  "Talent Agency",
  "Independent Hirer",
  "Other",
];

export const INDUSTRY_AREAS = [
  "Film",
  "TV",
  "Theatre",
  "Commercials",
  "Voiceover",
  "Music Videos",
  "Fashion",
  "Content Creation",
  "Live Events",
  "Other",
];

export const TALENT_TYPES = [
  "Actor / Performer",
  "Model",
  "Singer",
  "Dancer",
  "Voice Artist",
  "Presenter",
  "Child Talent",
  "Extras",
  "Multiple Types",
  "Other",
];

export const APPLICANT_STATUSES = [
  "Review",
  "Shortlist",
  "Contacting",
  "Audition Requested",
  "Self-Tape Requested",
  "Invite",
  "Offer / Hire",
  "Decline",
  "Matched",
];

export const FOLDER_TYPES = [
  "Review",
  "Shortlist",
  "Hire / Offer",
  "Contacting",
  "Matched",
  "Invite",
  "Decline",
  "Custom Folder",
];

export const PAYMENT_TYPES = [
  "Fixed fee",
  "Per day",
  "Per hour",
  "Profit share",
  "Expenses only",
  "Negotiable",
];

export const CURRENCIES = ["GBP", "USD", "EUR", "NGN", "Other"];

export const LOCATION_TYPES = ["Local", "Nationwide", "International"];

export const AUDITION_TYPES = [
  "Open Call",
  "By Appointment Only",
  "Self-Tape Only",
  "Invite Only",
  "Online Audition",
];

export const ROLE_TYPES = [
  "Lead",
  "Supporting",
  "Featured",
  "Background / Extra",
  "Voice Role",
  "Dancer",
  "Child Role",
  "Other",
];

export const ROLE_STATUSES = ["Open", "Paused", "Offered", "Closed"];

export const GENDERS = ["Any", "Female", "Male", "Non-binary", "Other"];

export const MEDIA_REQUIREMENTS = [
  "Headshot",
  "Video Reel",
  "Audio Reel",
  "Cover Letter",
  "CV / Resume",
  "Custom Upload",
];

export const PREAUDITION_QUESTION_TYPES = [
  "Short text",
  "Long text",
  "Yes/No",
  "Multiple choice",
  "File upload",
  "Video upload",
  "Audio upload",
];

export const ADDONS = [
  "Instant Posting",
  "Featured Posting",
  "Urgent Hiring Badge",
  "Priority Matched Applicants",
  "Extended Visibility",
  "Featured Role Highlight",
  "Social Promotion Boost",
  "Additional Collaborator Seats",
  "Premium Analytics",
];

export const PUBLIC_PROFILE_TABS = [
  "Overview",
  "Active Calls",
  "Past Projects",
  "About",
  "Team",
  "Reviews",
  "Contact",
];

export const PRIVATE_DASHBOARD_TABS = [
  "Dashboard",
  "Projects",
  "Roles",
  "Applicants",
  "Matched",
  "Messages",
  "Collaborators",
  "Billing / Add-ons",
  "Settings",
];

export const YEARS_OF_EXPERIENCE = [
  "No experience yet",
  "<1 year",
  "1-2 years",
  "3-5 years",
  "5+ years",
  "10+ years",
];

export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Experienced", "Expert"];

export const COUNTRIES = [
  "Nigeria",
  "United Kingdom",
  "United States",
  "Canada",
  "South Africa",
  "Ghana",
  "Kenya",
  "France",
  "Germany",
  "India",
  "United Arab Emirates",
  "Other",
];

export const getCastingDirectorReferenceOptions = (source: string): string[] => {
  switch (source) {
    case "account_types":
      return ACCOUNT_TYPES;
    case "industry_areas":
      return INDUSTRY_AREAS;
    case "talent_types":
      return TALENT_TYPES;
    case "applicant_statuses":
      return APPLICANT_STATUSES;
    case "folder_types":
      return FOLDER_TYPES;
    case "payment_types":
      return PAYMENT_TYPES;
    case "currencies":
      return CURRENCIES;
    case "location_types":
      return LOCATION_TYPES;
    case "audition_types":
      return AUDITION_TYPES;
    case "role_types":
      return ROLE_TYPES;
    case "role_statuses":
      return ROLE_STATUSES;
    case "genders":
      return GENDERS;
    case "media_requirements":
      return MEDIA_REQUIREMENTS;
    case "preaudition_question_types":
      return PREAUDITION_QUESTION_TYPES;
    case "addons":
      return ADDONS;
    case "public_tabs":
      return PUBLIC_PROFILE_TABS;
    case "private_tabs":
      return PRIVATE_DASHBOARD_TABS;
    case "years_of_experience":
      return YEARS_OF_EXPERIENCE;
    case "experience_levels":
      return EXPERIENCE_LEVELS;
    case "countries":
      return COUNTRIES;
    default:
      return [];
  }
};
