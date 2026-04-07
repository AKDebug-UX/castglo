export const PROFESSIONAL_TYPES = [
  "Photographer", "Videographer", "Cinematographer", "Video Editor", "Makeup Artist", "Hair Stylist", "Fashion Stylist", "Costume Designer",
  "Acting Coach", "Voice Coach", "Singing Coach", "Dance Coach", "Choreographer", "Graphic Designer", "Retoucher", "Sound Engineer",
  "Music Producer", "DJ", "Casting Assistant", "Production Assistant", "Camera Operator", "Lighting Technician", "Set Designer", "Creative Director",
  "Producer", "Event Host", "Publicist", "Talent Manager", "Model Coach", "Showreel Editor", "Self-Tape Specialist", "Studio Owner", "Other"
];

export const SERVICE_CATEGORIES = [
  "Actor Headshots", "Model Portfolio Shoot", "Fashion Photography", "Beauty Shoot", "Event Photography", "Self-Tape Filming", "Showreel Editing",
  "Video Editing", "Colour Grading", "Makeup Session", "Bridal Makeup", "Editorial Makeup", "Hair Styling", "Wardrobe Styling", "Audition Coaching",
  "Monologue Coaching", "Accent Coaching", "Voiceover Coaching", "Singing Lessons", "Choreography Session", "Rehearsal Direction", "Music Production",
  "Beat Creation", "Studio Recording", "Sound Mixing", "Mastering", "Graphic Design", "Branding Design", "Social Media Content Creation", "Casting Support",
  "Production Support", "Event Hosting", "Studio Hire", "Retouching", "Other"
];

export const PRICING_MODELS = [
  "Fixed Price", "Hourly Rate", "Half Day Rate", "Daily Rate", "Per Session", "Per Look", "Per Image", "Per Edit", "Per Track", "Per Project", "Package Price", "Starting From", "Custom Quote"
];

export const CLIENT_TYPES = [
  "Talents", "Actors", "Models", "Singers", "Dancers", "Voice Artists", "Casting Directors", "Agencies", "Production Companies", "Brands", "Event Organisers", "Content Creators", "General Public"
];

export const INDUSTRY_AREAS = [
  "Film", "TV", "Theatre", "Fashion", "Music", "Commercials", "Content Creation", "Live Events", "Corporate", "Weddings / Lifestyle", "Social Media / Creator Economy"
];

export const COUNTRIES = [
  "Nigeria","United Kingdom","United States","Canada","South Africa","Ghana","Kenya","Uganda","Rwanda","Tanzania","Ethiopia","Egypt","Morocco","Algeria","Tunisia","Cameroon","Senegal","Ivory Coast","France","Germany","Netherlands","Belgium","Spain","Portugal","Italy","Sweden","Norway","Denmark","Finland","Poland","Romania","Ukraine","Turkey","Greece","Ireland","India","Pakistan","Bangladesh","Sri Lanka","Nepal","China","Japan","South Korea","Indonesia","Malaysia","Singapore","Philippines","Thailand","Vietnam","Australia","New Zealand","Brazil","Mexico","Argentina","Jamaica","Trinidad and Tobago","United Arab Emirates","Saudi Arabia","Qatar","Israel","Russia"
];

export const EXPERIENCE_YEARS = ["No experience yet", "<1 year", "1-2 years", "3-5 years", "5+ years", "10+ years"];
export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Experienced", "Expert"];
export const PROFILE_STATUSES = ["Draft", "Pending Review", "Active", "Paused", "Suspended"];
export const PROFILE_VISIBILITY_OPTIONS = ["Public", "Private", "Hidden"];

export const AVAILABILITY_TYPES = ["Full-time", "Part-time", "Weekends Only", "By Appointment", "Project-Based", "On Request"];
export const NOTICE_REQUIRED = ["Same day", "24 hours", "2-3 days", "1 week", "Flexible"];
export const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const CONTACT_METHODS = ["Castglo Message", "Email", "Phone", "Booking Request Form", "External Website"];
export const BOOKING_METHODS = ["Direct Message", "Booking Request", "External Booking Link", "Email Enquiry", "Phone Enquiry"];
export const PAYMENT_METHODS = ["Bank Transfer", "Card Payment", "PayPal", "Cash", "Invoice", "Other"];

export const DELIVERY_TYPES = ["In-person", "Remote", "Hybrid"];
export const SERVICE_LOCATION_TYPES = ["Client Location", "My Studio", "Online", "On Set", "Event Venue", "Custom Location"];
export const DURATION_TYPES = ["30 mins", "1 hour", "2 hours", "Half Day", "Full Day", "Multi-Day", "Per Project", "Custom"];
export const CURRENCIES = ["GBP", "USD", "EUR", "Other"];
export const SERVICE_STATUSES = ["Draft", "Active", "Paused", "Archived"];

export const PORTFOLIO_ITEM_TYPES = ["Image", "Video", "Audio", "Document", "Link"];
export const PORTFOLIO_ITEM_CATEGORIES = ["Headshots", "Campaign", "Behind the Scenes", "Workshop", "Before/After", "Client Project", "Other"];

export const PHOTOGRAPHY_SPECIALISMS = ["Headshots", "Portfolio Shoots", "Fashion", "Editorial", "Beauty", "Event", "Product", "BTS", "Outdoor", "Studio", "Retouching"];
export const MUA_SPECIALISMS = ["Beauty", "Editorial", "Bridal", "TV / Film", "SFX", "Male Grooming", "Skin Prep", "Touch-Up"];
export const COACHING_SPECIALISMS = ["Audition Coaching", "Self-Tape Coaching", "Monologue Coaching", "Accent Coaching", "Screen Acting", "Drama School Prep", "Confidence Coaching"];
export const COACHING_DELIVERY_MODES = ["In-person", "Online", "Group Session", "1-to-1"];
export const EDITING_SPECIALISMS = ["Showreels", "Social Media", "Promotional Video", "Colour Grading", "Sound Sync", "Motion Graphics", "Reels / Shorts", "YouTube Editing"];
export const FILE_TRANSFER_METHODS = ["Google Drive", "WeTransfer", "Dropbox", "Frame.io", "Other"];

export const SOFTWARE_TOOLS = [
  "Adobe Photoshop", "Adobe Premiere Pro", "DaVinci Resolve", "Capture One", "Final Cut Pro", "Pro Tools", "Logic Pro", "After Effects", "Lightroom", "Canva", "Other"
];

export const getProfessionalReferenceOptions = (source: string): string[] => {
  switch (source) {
    case "professional_types":
      return PROFESSIONAL_TYPES;
    case "service_categories":
      return SERVICE_CATEGORIES;
    case "pricing_models":
      return PRICING_MODELS;
    case "client_types":
      return CLIENT_TYPES;
    case "industry_areas":
      return INDUSTRY_AREAS;
    case "countries":
      return COUNTRIES;
    case "experience_years":
      return EXPERIENCE_YEARS;
    case "experience_levels":
      return EXPERIENCE_LEVELS;
    case "profile_statuses":
      return PROFILE_STATUSES;
    case "profile_visibility":
      return PROFILE_VISIBILITY_OPTIONS;
    case "availability_types":
      return AVAILABILITY_TYPES;
    case "notice_required":
      return NOTICE_REQUIRED;
    case "working_days":
      return WORKING_DAYS;
    case "contact_methods":
      return CONTACT_METHODS;
    case "booking_methods":
      return BOOKING_METHODS;
    case "payment_methods":
      return PAYMENT_METHODS;
    case "delivery_types":
      return DELIVERY_TYPES;
    case "service_location_types":
      return SERVICE_LOCATION_TYPES;
    case "duration_types":
      return DURATION_TYPES;
    case "currencies":
      return CURRENCIES;
    case "service_statuses":
      return SERVICE_STATUSES;
    case "portfolio_item_types":
      return PORTFOLIO_ITEM_TYPES;
    case "portfolio_item_categories":
      return PORTFOLIO_ITEM_CATEGORIES;
    case "photography_specialisms":
      return PHOTOGRAPHY_SPECIALISMS;
    case "mua_specialisms":
      return MUA_SPECIALISMS;
    case "coaching_specialisms":
      return COACHING_SPECIALISMS;
    case "coaching_delivery_modes":
      return COACHING_DELIVERY_MODES;
    case "editing_specialisms":
      return EDITING_SPECIALISMS;
    case "file_transfer_methods":
      return FILE_TRANSFER_METHODS;
    case "software_tools":
      return SOFTWARE_TOOLS;
    default:
      return [];
  }
};
