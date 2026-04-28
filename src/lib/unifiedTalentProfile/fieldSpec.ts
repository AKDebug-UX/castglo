
export type UnifiedFieldType =
  | "text"
  | "email"
  | "phone"
  | "password"
  | "date"
  | "boolean"
  | "select"
  | "multi-select"
  | "textarea"
  | "url"
  | "file"
  | "multi-file"
  | "checkbox"
  | "number"
  | "url-list"
  | "file-or-url"
  | "multi-file-or-url"
  | "credits-list";

export type TalentType =
  | "Actor / Performer"
  | "Model"
  | "Singer"
  | "Dancer"
  | "Voice Artist"
  | "Presenter / Host"
  | "Extra / Supporting Artist"
  | "Musician"
  | "Content Creator"
  | "Comedian"
  | "Stunt Performer"
  | "Other"
  | "Talent Agent"
  | "Talent Manager"
  | "Casting Professional"
  | "Photographer"
  | "Videographer"
  | "Stylist"
  | "Makeup Artist"
  | "Acting Coach"
  | "Voice Coach"
  | "Producer"
  | "Director";

export interface VisibilityRule {
  showWhenField?: string;
  equals?: string | boolean;
  notEquals?: string | boolean;
  showWhenTalentTypeIn?: TalentType[];
  showWhenUnder18?: boolean;
}

export interface UnifiedFieldSpec {
  id: string;
  label: string;
  section: string;
  type: UnifiedFieldType;
  required: boolean;
  searchable: boolean;
  options?: string[];
  optionSource?:
  | "countries"
  | "languages"
  | "accents"
  | "music_genres"
  | "instruments"
  | "dance_styles"
  | "opportunities_sought";
  validation?: string;
  visibility?: VisibilityRule;
}

export const TALENT_TYPES: TalentType[] = [
  "Actor / Performer",
  "Model",
  "Singer",
  "Dancer",
  "Voice Artist",
  "Presenter / Host",
  "Extra / Supporting Artist",
  "Musician",
  "Content Creator",
  "Comedian",
  "Stunt Performer",
  "Talent Agent",
  "Talent Manager",
  "Casting Professional",
  "Photographer",
  "Videographer",
  "Stylist",
  "Makeup Artist",
  "Acting Coach",
  "Voice Coach",
  "Producer",
  "Director",
  "Other",
];

export const CORE_PROFILE_FIELDS: UnifiedFieldSpec[] = [
  { id: "full_name", label: "Full Name", section: "Basic Profile", type: "text", required: true, searchable: false, validation: "2-100 chars" },
  { id: "display_name", label: "Stage Name", section: "Basic Profile", type: "text", required: true, searchable: true, validation: "2-100 chars" },
  { id: "email", label: "Email Address", section: "Contact", type: "email", required: true, searchable: false, validation: "Valid email + unique" },
  { id: "phone_number", label: "Phone Number", section: "Contact", type: "phone", required: true, searchable: false, validation: "Intl format" },
  { id: "address", label: "Address", section: "Contact", type: "text", required: false, searchable: false, validation: "Max 200 chars" },
  { id: "dateOfBirth", label: "Date of Birth", section: "Basic Profile", type: "date", required: true, searchable: false, validation: "YYYY-MM-DD, past date" },
  { id: "age_group", label: "Age Group", section: "Basic Profile", type: "select", required: true, searchable: true, options: ["Under 13", "13-15", "16-17", "18-24", "25-34", "35-44", "45-54", "55+"], validation: "Auto-derived optional" },
  { id: "gender", label: "Gender", section: "Basic Profile", type: "select", required: true, searchable: true, options: ["Female", "Male", "Non-binary", "Prefer to self-describe", "Prefer not to say"] },
  { id: "gender_self_describe", label: "Gender Self Description", section: "Basic Profile", type: "text", required: false, searchable: true, validation: "Max 50 chars", visibility: { showWhenField: "gender", equals: "Prefer to self-describe" } },
  { id: "nationality", label: "Nationality", section: "Basic Profile", type: "select", required: true, searchable: true, optionSource: "countries", validation: "ISO country list preferred" },
  { id: "current_city", label: "City", section: "Basic Profile", type: "text", required: true, searchable: true, validation: "2-100 chars" },
  { id: "current_country", label: "Country", section: "Basic Profile", type: "select", required: true, searchable: true, optionSource: "countries", validation: "ISO country list preferred" },
  { id: "right_to_work", label: "Right to Work", section: "Basic Profile", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "valid_passport", label: "Hold a Valid Passport", section: "Basic Profile", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "willing_to_travel", label: "Willing to Travel for Work", section: "Availability", type: "select", options: ["Yes", "No"], required: true, searchable: true },
  { id: "international_availability", label: "Available for International Opportunities", section: "Availability", type: "select", options: ["Yes", "No"], required: true, searchable: true },
  { id: "remote_work_open", label: "Open to Remote / Virtual Work", section: "Availability", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "short_bio", label: "Short Bio", section: "About You", type: "textarea", required: true, searchable: true, validation: "50-1000 chars" },
  { id: "career_goals", label: "Career Goals", section: "About You", type: "textarea", required: false, searchable: false, validation: "Max 1000 chars" },
  { id: "languages_spoken", label: "Languages Spoken", section: "Basic Profile", type: "multi-select", required: true, searchable: true, optionSource: "languages", validation: "Store as array" },
  { id: "fluent_languages", label: "Fluent Languages", section: "Basic Profile", type: "multi-select", required: false, searchable: true, optionSource: "languages", validation: "Store as array" },
  { id: "natural_accent", label: "Natural Accent", section: "Basic Profile", type: "select", required: true, searchable: true, optionSource: "accents" },
  { id: "profile_photo", label: "Profile Photo / Headshot", section: "Media", type: "file", required: true, searchable: false, validation: "jpg/png/webp" },
  { id: "full_body_photo", label: "Full Body Photo", section: "Media", type: "file", required: false, searchable: false, validation: "jpg/png/webp" },
  { id: "additional_photos", label: "Additional Photos", section: "Media", type: "multi-file", required: false, searchable: false, validation: "Max file count/size" },
  { id: "intro_video", label: "Introduction Video", section: "Media", type: "file-or-url", required: false, searchable: false, validation: "mp4/mov or valid URL" },
  { id: "cv_resume", label: "CV / Resume", section: "Media", type: "file", required: false, searchable: false, validation: "PDF/DOC/DOCX" },
  { id: "portfolio_url", label: "Website / Portfolio URL", section: "Contact / Media", type: "url", required: false, searchable: false, validation: "HTTPS preferred" },
  { id: "cover_image", label: "Cover Image / Banner", section: "Media", type: "file", required: false, searchable: false, validation: "jpg/png/webp" },
  { id: "full_bio", label: "Full About Description", section: "About You", type: "textarea", required: false, searchable: true, validation: "Max 3000 chars" },
  { id: "social_instagram", label: "Instagram Profile", section: "Social", type: "url", required: false, searchable: false },
  { id: "social_tiktok", label: "TikTok Profile", section: "Social", type: "url", required: false, searchable: false },
  { id: "social_youtube", label: "YouTube Profile", section: "Social", type: "url", required: false, searchable: false },
  { id: "vimeo_url", label: "Vimeo URL", section: "Social", type: "url", required: false, searchable: false },
];

export const TALENT_TYPE_SELECTION_FIELDS: UnifiedFieldSpec[] = [
  { id: "primary_talent_type", label: "Primary Talent Type", section: "Talent Type", type: "select", required: true, searchable: true, options: TALENT_TYPES },
  { id: "additional_talent_types", label: "Additional Talent Types", section: "Talent Type", type: "multi-select", required: false, searchable: true, options: TALENT_TYPES, validation: "Cannot duplicate primary_talent_type" },
  { id: "years_of_experience", label: "Years of Experience", section: "Professional Overview", type: "select", required: true, searchable: true, options: ["No experience yet", "<1 year", "1-2 years", "3-5 years", "5+ years"] },
  { id: "experience_level", label: "Experience Level", section: "Professional Overview", type: "select", required: true, searchable: true, options: ["Beginner", "Intermediate", "Professional"] },
];

export const REPRESENTATION_FIELDS: UnifiedFieldSpec[] = [
  { id: "representation_status", label: "Representation Status", section: "Representation", type: "select", required: true, searchable: true, options: ["Self-represented", "Represented by Agent", "Represented by Manager", "Represented by Agency and Manager"] },
  { id: "agency_name", label: "Agency / Manager Name", section: "Representation", type: "text", required: false, searchable: true, validation: "Max 150 chars", visibility: { showWhenField: "representation_status", notEquals: "Self-represented" } },
  { id: "agency_contact_details", label: "Agency / Manager Contact Details", section: "Representation", type: "textarea", required: false, searchable: false, validation: "Max 500 chars", visibility: { showWhenField: "representation_status", notEquals: "Self-represented" } },
  { id: "union_membership", label: "Union / Professional Membership", section: "Representation", type: "text", required: false, searchable: true, validation: "Max 100 chars" },
  { id: "preferred_contact_method", label: "Preferred Contact Method", section: "Contact", type: "select", required: true, searchable: false, options: ["Castglo", "Email", "Phone", "Agent/Manager"] },
  { id: "currency", label: "Currency", section: "Booking Preferences", type: "select", required: false, searchable: true, options: ["GBP (£)", "NGN (₦)", "USD ($)", "EUR (€)"] },
  { id: "expected_rate_range", label: "Expected Rate / Fee Range", section: "Booking Preferences", type: "select", required: false, searchable: true, options: ["Open to discussion", "50-100", "100-250", "250-500", "500+", "Other"] },
  { id: "expected_rate_other", label: "Custom Rate", section: "Booking Preferences", type: "text", required: false, searchable: true, validation: "Max 100 chars", visibility: { showWhenField: "expected_rate_range", equals: "Other" } },
  { id: "open_to_unpaid", label: "Open to Portfolio-Building / Unpaid Opportunities", section: "Booking Preferences", type: "select", options: ["Yes", "No"], required: false, searchable: true },
];

export const APPEARANCE_FIELDS: UnifiedFieldSpec[] = [
  { id: "height", label: "Height", section: "Appearance", type: "text", required: false, searchable: true },
  { id: "weight", label: "Weight", section: "Appearance", type: "text", required: false, searchable: true },
  { id: "build", label: "Build", section: "Appearance", type: "select", required: false, searchable: true, options: ["Slim", "Athletic", "Average", "Curvy", "Broad", "Heavyset", "Other"] },
  { id: "hair_colour", label: "Hair Colour", section: "Appearance", type: "select", required: false, searchable: true, options: ["Black", "Brown", "Blonde", "Red", "Grey", "White", "Other"] },
  { id: "hair_length", label: "Hair Length", section: "Appearance", type: "select", required: false, searchable: true, options: ["Bald", "Very Short", "Short", "Medium", "Long"] },
  { id: "eye_colour", label: "Eye Colour", section: "Appearance", type: "select", required: false, searchable: true, options: ["Brown", "Black", "Blue", "Green", "Hazel", "Grey", "Other"] },
  { id: "skin_tone", label: "Skin Tone / Complexion", section: "Appearance", type: "select", required: false, searchable: true, options: ["Fair", "Light", "Medium", "Olive", "Brown", "Dark", "Other"] },
  { id: "ethnicity_visible", label: "Visible Ethnicity", section: "Appearance", type: "select", required: false, searchable: true, options: ["Caucasian/White", "Black/African", "Asian", "Latino/Hispanic", "Middle Eastern", "Mixed", "Other"] },
  { id: "clothing_size_top", label: "Clothing Size (Top)", section: "Appearance", type: "text", required: false, searchable: true },
  { id: "clothing_size_bottom", label: "Clothing Size (Bottom)", section: "Appearance", type: "text", required: false, searchable: true },
  { id: "shoe_size", label: "Shoe Size (UK/EU/US)", section: "Appearance", type: "text", required: false, searchable: true },
  { id: "chest_bust_measurement", label: "Chest / Bust Measurement", section: "Appearance", type: "text", required: false, searchable: true },
  { id: "waist_measurement", label: "Waist Measurement", section: "Appearance", type: "text", required: false, searchable: true },
  { id: "hip_measurement", label: "Hip Measurement", section: "Appearance", type: "text", required: false, searchable: true },
  { id: "inside_leg_measurement", label: "Inside Leg Measurement", section: "Appearance", type: "text", required: false, searchable: true },
  { id: "distinguishing_features", label: "Distinguishing Features", section: "Appearance", type: "multi-select", required: false, searchable: true, options: ["Freckles", "Dimples", "Beard", "Tattoos", "Piercings", "Scars", "Glasses", "None", "Other"] },
  { id: "visible_tattoos_piercings", label: "Visible Tattoos / Piercings", section: "Appearance", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "open_to_appearance_changes", label: "Open to Hair / Appearance Changes for Roles", section: "Appearance", type: "select", options: ["Yes", "No"], required: false, searchable: true },
];

export const AVAILABILITY_FIELDS: UnifiedFieldSpec[] = [
  { id: "availability_type", label: "Availability Type", section: "Availability", type: "select", required: true, searchable: true, options: ["Full-time", "Part-time", "Weekends only", "Occasionally", "On request"] },
  { id: "last_minute_bookings", label: "Available for Last-Minute Bookings", section: "Availability", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "notice_required", label: "Notice Required", section: "Availability", type: "select", required: false, searchable: true, options: ["Same day", "24 hours", "2-3 days", "1 week", "Flexible"] },
  { id: "opportunities_sought", label: "Opportunities Sought", section: "Booking Preferences", type: "multi-select", required: false, searchable: true, optionSource: "opportunities_sought" },
  { id: "opportunities_not_accepted", label: "Work Not Accepted", section: "Booking Preferences", type: "textarea", required: false, searchable: false, validation: "Max 1000 chars" },
];

const byTalentType = (talentType: TalentType, fields: Omit<UnifiedFieldSpec, "visibility">[]): UnifiedFieldSpec[] =>
  fields.map((field) => ({ ...field, visibility: { showWhenTalentTypeIn: [talentType] } }));
export const ACTOR_FIELDS = byTalentType("Actor / Performer", [
  { id: "actor_performance_category", label: "Primary Performance Category", section: "Actor Details", type: "select", required: true, searchable: true, options: ["Screen Actor", "Stage Actor", "Musical Theatre Performer", "Voice Actor", "Dancer-Actor", "Presenter", "Comedian", "Other"] },
  { id: "actor_playing_age_range", label: "Playing Age Range", section: "Actor Details", type: "select", required: false, searchable: true, options: ["4-7", "8-12", "13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"] },
  { id: "actor_training", label: "Formal Acting / Performance Training", section: "Actor Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "actor_training_school", label: "Drama School / Training Institution", section: "Actor Details", type: "text", required: false, searchable: true, validation: "Max 200 chars" },
  { id: "actor_techniques", label: "Acting Techniques Studied", section: "Actor Details", type: "multi-select", required: false, searchable: true, options: ["Method Acting", "Meisner", "Stanislavski", "Improvisation", "Classical", "Screen Acting", "Voice Training", "Movement Training", "Other"] },
  { id: "actor_accents", label: "Accents You Can Perform", section: "Actor Details", type: "multi-select", required: false, searchable: true, optionSource: "accents" },
  { id: "actor_special_skills", label: "Special Performance Skills", section: "Actor Details", type: "multi-select", required: false, searchable: true, options: ["Improvisation", "Stage Combat", "Self-taping", "Character Work", "Comedy", "Presenting", "Motion Capture", "Other"] },
  { id: "actor_notable_credits", label: "Notable Credits / Productions", section: "Actor Details", type: "credits-list", required: false, searchable: false },
  { id: "actor_showreel", label: "Acting Showreel", section: "Actor Profile", type: "file-or-url", required: false, searchable: false },
  { id: "actor_monologue", label: "Monologue / Self-Tape", section: "Actor Profile", type: "file-or-url", required: false, searchable: false },
  { id: "actor_voice_reel", label: "Voice Reel", section: "Actor Profile", type: "file-or-url", required: false, searchable: false },
]);

export const MODEL_FIELDS = byTalentType("Model", [
  { id: "model_primary_category", label: "Primary Modelling Category", section: "Model Details", type: "select", required: true, searchable: true, options: ["Fashion", "Commercial", "Editorial", "Runway", "Beauty", "Fitness", "Lifestyle", "E-commerce", "Promotional", "Child Model", "Mature Model", "Petite", "Plus-size", "Parts Model", "Swimwear", "Lingerie", "Other"] },
  { id: "model_additional_categories", label: "Additional Modelling Categories", section: "Model Details", type: "multi-select", required: false, searchable: true },
  { id: "model_chest_bust", label: "Chest / Bust", section: "Model Measurements", type: "text", required: false, searchable: true },
  { id: "model_waist", label: "Waist", section: "Model Measurements", type: "text", required: false, searchable: true },
  { id: "model_hips", label: "Hips", section: "Model Measurements", type: "text", required: false, searchable: true },
  { id: "model_dress_size", label: "Dress Size", section: "Model Measurements", type: "text", required: false, searchable: true },
  { id: "model_shoe_size", label: "Shoe Size", section: "Model Measurements", type: "text", required: false, searchable: true },
  { id: "model_collar_size", label: "Collar Size", section: "Model Measurements", type: "text", required: false, searchable: true },
  { id: "model_inseam", label: "Inseam", section: "Model Measurements", type: "text", required: false, searchable: true },
  { id: "model_suit_size", label: "Suit Size", section: "Model Measurements", type: "text", required: false, searchable: true },
  { id: "model_open_hair_changes", label: "Open to Hair Styling Changes", section: "Model Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "model_open_beauty_campaigns", label: "Open to Beauty Campaigns", section: "Model Preferences", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "model_open_runway", label: "Open to Runway", section: "Model Preferences", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "model_open_swimwear", label: "Open to Swimwear", section: "Model Preferences", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "model_open_lingerie", label: "Open to Lingerie", section: "Model Preferences", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "model_comp_card", label: "Comp Card / Digital Casting Card", section: "Model Profile", type: "file", required: false, searchable: false },
  { id: "model_runway_video", label: "Runway Walk Video", section: "Model Profile", type: "file-or-url", required: false, searchable: false },
  { id: "model_campaign_links", label: "Published Campaign Links", section: "Model Profile", type: "url-list", required: false, searchable: false },
]);

export const SINGER_FIELDS = byTalentType("Singer", [
  { id: "singer_category", label: "Singing Category", section: "Singer Details", type: "select", required: true, searchable: true, options: ["Solo Artist", "Backing Vocalist", "Musical Theatre Singer", "Worship Singer", "Pop Singer", "R&B Singer", "Classical Singer", "Jazz Singer", "Rap / Spoken Word", "Other"] },
  { id: "singer_vocal_range", label: "Vocal Range", section: "Singer Details", type: "select", required: false, searchable: true, options: ["Soprano", "Mezzo-Soprano", "Alto", "Tenor", "Baritone", "Bass", "Other"] },
  { id: "singer_genres", label: "Music Genres", section: "Singer Details", type: "multi-select", required: false, searchable: true, optionSource: "music_genres" },
  { id: "singer_can_harmonise", label: "Can Harmonise", section: "Singer Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "singer_sight_read", label: "Can Sight-Read Music", section: "Singer Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "singer_songwriting", label: "Songwriting Ability", section: "Singer Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "singer_live_experience", label: "Live Performance Experience", section: "Singer Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "singer_studio_experience", label: "Studio Recording Experience", section: "Singer Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "singer_notable_credits", label: "Notable Performances / Credits", section: "Singer Details", type: "credits-list", required: false, searchable: false },
  { id: "singer_vocal_reel", label: "Vocal Reel / Audio Sample", section: "Singer Profile", type: "file-or-url", required: false, searchable: false },
  { id: "singer_performance_video", label: "Performance Video", section: "Singer Profile", type: "file-or-url", required: false, searchable: false },
  { id: "singer_original_music_links", label: "Original Music Links", section: "Singer Profile", type: "url-list", required: false, searchable: false },
]);

export const DANCER_FIELDS = byTalentType("Dancer", [
  { id: "dancer_primary_style", label: "Primary Dance Style", section: "Dancer Details", type: "select", required: true, searchable: true, optionSource: "dance_styles" },
  { id: "dancer_additional_styles", label: "Additional Dance Styles", section: "Dancer Details", type: "multi-select", required: false, searchable: true, optionSource: "dance_styles" },
  { id: "dancer_training_school", label: "Dance Training School / Academy", section: "Dancer Details", type: "text", required: false, searchable: true },
  { id: "dancer_choreography_experience", label: "Choreography Experience", section: "Dancer Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "dancer_partner_work", label: "Partner Work Experience", section: "Dancer Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "dancer_teaching_experience", label: "Teaching Experience", section: "Dancer Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "dancer_live_experience", label: "Live Performance Experience", section: "Dancer Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "dancer_touring_experience", label: "Touring Experience", section: "Dancer Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "dancer_notable_credits", label: "Notable Productions / Credits", section: "Dancer Details", type: "credits-list", required: false, searchable: false },
  { id: "dancer_reel", label: "Dance Reel", section: "Dancer Profile", type: "file-or-url", required: false, searchable: false },
  { id: "dancer_clips", label: "Performance Clips", section: "Dancer Profile", type: "multi-file-or-url", required: false, searchable: false },
  { id: "dancer_choreography_samples", label: "Choreography Samples", section: "Dancer Profile", type: "file-or-url", required: false, searchable: false },
]);
export const VOICE_ARTIST_FIELDS = byTalentType("Voice Artist", [
  { id: "voice_work_type", label: "Voice Work Type", section: "Voice Artist Details", type: "multi-select", required: true, searchable: true, options: ["Commercial Voiceover", "Animation", "Audiobook", "Narration", "Dubbing", "Radio", "Podcast", "Video Games", "E-learning", "Corporate", "Other"] },
  { id: "voice_age_range", label: "Voice Age Range", section: "Voice Artist Details", type: "select", required: false, searchable: true, options: ["Child", "Teen", "Young Adult", "Adult", "Middle Age", "Senior", "Versatile"] },
  { id: "voice_natural_accent", label: "Natural Accent", section: "Voice Artist Details", type: "select", required: false, searchable: true, optionSource: "accents" },
  { id: "voice_performed_accents", label: "Performed Accents", section: "Voice Artist Details", type: "multi-select", required: false, searchable: true, optionSource: "accents" },
  { id: "voice_home_studio", label: "Home Studio Available", section: "Voice Artist Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "voice_equipment_quality", label: "Recording Equipment Quality", section: "Voice Artist Details", type: "select", required: false, searchable: true, options: ["Basic", "Semi-professional", "Professional"] },
  { id: "voice_remote_recording", label: "Remote Recording Available", section: "Voice Artist Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "voice_live_directed_sessions", label: "Live Directed Sessions Available", section: "Voice Artist Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "voice_audio_editing", label: "Editing / Clean Audio Delivery", section: "Voice Artist Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "voice_languages", label: "Languages for Voice Work", section: "Voice Artist Details", type: "multi-select", required: false, searchable: true, optionSource: "languages" },
  { id: "voice_reel", label: "Voice Reel", section: "Voice Artist Profile", type: "file-or-url", required: false, searchable: false },
  { id: "voice_character_demo", label: "Character Demo Reel", section: "Voice Artist Profile", type: "file-or-url", required: false, searchable: false },
  { id: "voice_narration_sample", label: "Narration Sample", section: "Voice Artist Profile", type: "file-or-url", required: false, searchable: false },
]);

export const PRESENTER_FIELDS = byTalentType("Presenter / Host", [
  { id: "presenter_type", label: "Presenter Type", section: "Presenter Details", type: "select", required: true, searchable: true, options: ["TV Presenter", "Event Host", "Red Carpet Host", "Corporate Host", "Interviewer", "Live Stream Host", "Radio Presenter", "Podcast Host", "Other"] },
  { id: "presenter_comfort", label: "Comfortable With", section: "Presenter Details", type: "multi-select", required: false, searchable: true, options: ["Autocue", "Live Audience", "Interview Format", "Scripted Delivery", "Improvised Delivery", "Brand Hosting", "Panel Moderation"] },
  { id: "presenter_languages", label: "Languages for Presentation", section: "Presenter Details", type: "multi-select", required: false, searchable: true, optionSource: "languages" },
  { id: "presenter_broadcast_experience", label: "Broadcast Experience", section: "Presenter Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "presenter_event_experience", label: "Event Hosting Experience", section: "Presenter Profile", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "presenter_notable_clients", label: "Notable Shows / Events / Clients", section: "Presenter Details", type: "textarea", required: false, searchable: false },
  { id: "presenter_reel", label: "Presenter Reel", section: "Presenter Profile", type: "file-or-url", required: false, searchable: false },
  { id: "presenter_hosting_clips", label: "Hosting Clips", section: "Presenter Profile", type: "multi-file-or-url", required: false, searchable: false },
  { id: "presenter_interview_samples", label: "Interview Samples", section: "Presenter Profile", type: "multi-file-or-url", required: false, searchable: false },
]);

export const EXTRA_FIELDS = byTalentType("Extra / Supporting Artist", [
  { id: "extra_experience", label: "Background Artist Experience", section: "Extra Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "extra_open_to", label: "Open To", section: "Extra Details", type: "multi-select", required: false, searchable: true, options: ["Film", "TV", "Commercials", "Crowd Scenes", "Featured Extra Roles", "Stand-in Work"] },
  { id: "extra_driving_licence", label: "Driving Licence", section: "Extra Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "extra_own_vehicle", label: "Own Vehicle", section: "Extra Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "extra_period_costume", label: "Comfortable with Period Costume", section: "Extra Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "extra_special_look", label: "Special Look / Character Type", section: "Extra Details", type: "text", required: false, searchable: true },
  { id: "extra_uniform_roles", label: "Comfortable with Uniformed Roles", section: "Extra Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "extra_long_shoot_days", label: "Comfortable with Long Shoot Days", section: "Extra Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
]);

export const MUSICIAN_FIELDS = byTalentType("Musician", [
  { id: "musician_primary_instrument", label: "Primary Instrument", section: "Musician Details", type: "text", required: true, searchable: true, optionSource: "instruments" },
  { id: "musician_additional_instruments", label: "Additional Instruments", section: "Musician Details", type: "multi-select", required: false, searchable: true, optionSource: "instruments" },
  { id: "musician_genres", label: "Music Genres", section: "Musician Details", type: "multi-select", required: false, searchable: true, optionSource: "music_genres" },
  { id: "musician_sight_reading", label: "Sight-Reading Ability", section: "Musician Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "musician_improvisation", label: "Improvisation Ability", section: "Musician Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "musician_live_gig_experience", label: "Live Gig Experience", section: "Musician Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "musician_studio_session_experience", label: "Studio Session Experience", section: "Musician Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "musician_touring_experience", label: "Touring Experience", section: "Musician Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "musician_composition_skills", label: "Composition / Arrangement Skills", section: "Musician Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "musician_notable_credits", label: "Notable Credits / Performances", section: "Musician Details", type: "credits-list", required: false, searchable: false },
  { id: "musician_reel", label: "Performance Reel", section: "Musician Profile", type: "file-or-url", required: false, searchable: false },
  { id: "musician_audio_samples", label: "Audio Samples", section: "Musician Profile", type: "multi-file-or-url", required: false, searchable: false },
  { id: "musician_original_links", label: "Original Composition Links", section: "Musician Profile", type: "url-list", required: false, searchable: false },
]);

export const CREATOR_FIELDS = byTalentType("Content Creator", [
  { id: "creator_content_type", label: "Content Type", section: "Creator Details", type: "multi-select", required: true, searchable: true, options: ["Lifestyle", "Beauty", "Fashion", "Comedy", "Music", "Education", "Entertainment", "Family", "Fitness", "Other"] },
  { id: "creator_platforms", label: "Primary Platforms", section: "Creator Details", type: "multi-select", required: false, searchable: true, options: ["Instagram", "TikTok", "YouTube", "Facebook", "Twitch", "Other"] },
  { id: "creator_audience_size", label: "Audience Size", section: "Creator Details", type: "text", required: false, searchable: true },
  { id: "creator_engagement_rate", label: "Average Engagement Rate", section: "Creator Details", type: "text", required: false, searchable: true },
  { id: "creator_brand_collabs", label: "Brand Collaboration Experience", section: "Creator Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "creator_ugc_experience", label: "UGC Experience", section: "Creator Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "creator_editing_skills", label: "Editing Skills", section: "Creator Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "creator_livestream_experience", label: "Livestream Experience", section: "Creator Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "creator_niche", label: "Niche / Audience Demographic", section: "Creator Details", type: "textarea", required: false, searchable: true },
  { id: "creator_reel", label: "Content Reel", section: "Creator Profile", type: "file-or-url", required: false, searchable: false },
  { id: "creator_media_kit", label: "Media Kit", section: "Creator Profile", type: "file-or-url", required: false, searchable: false },
  { id: "creator_social_links", label: "Social Profile Links", section: "Creator Profile", type: "url-list", required: false, searchable: false },
  { id: "creator_campaign_examples", label: "Brand Campaign Examples", section: "Creator Profile", type: "url-list", required: false, searchable: false },
]);

export const COMEDIAN_FIELDS = byTalentType("Comedian", [
  { id: "comedian_type", label: "Comedy Type", section: "Comedian Details", type: "multi-select", required: true, searchable: true, options: ["Stand-up", "Sketch", "Character Comedy", "Improvisation", "Writing", "Hosting", "Other"] },
  { id: "comedian_live_experience", label: "Live Comedy Experience", section: "Comedian Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "comedian_writing_experience", label: "Writing Experience", section: "Comedian Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "comedian_improv_experience", label: "Improv Experience", section: "Comedian Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "comedian_tv_digital_credits", label: "TV / Digital Comedy Credits", section: "Comedian Details", type: "credits-list", required: false, searchable: false },
  { id: "comedian_clean_sets", label: "Clean / Family-Friendly Sets Available", section: "Comedian Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "comedian_notable_venues", label: "Notable Venues / Shows", section: "Comedian Details", type: "credits-list", required: false, searchable: false },
  { id: "comedian_reel", label: "Comedy Reel", section: "Comedian Profile", type: "file-or-url", required: false, searchable: false },
  { id: "comedian_standup_clip", label: "Stand-up Clip", section: "Comedian Profile", type: "file-or-url", required: false, searchable: false },
  { id: "comedian_sketch_samples", label: "Sketch Samples", section: "Comedian Profile", type: "multi-file-or-url", required: false, searchable: false },
]);

export const STUNT_FIELDS = byTalentType("Stunt Performer", [
  { id: "stunt_speciality", label: "Stunt Speciality", section: "Stunt Details", type: "multi-select", required: true, searchable: true, options: ["Fight Performance", "Falls", "Driving", "Horse Work", "Fire Stunts", "Wire Work", "Water Work", "Weapons Handling", "Other"] },
  { id: "stunt_certifications", label: "Certifications / Safety Qualifications", section: "Stunt Details", type: "textarea", required: false, searchable: true },
  { id: "stunt_martial_arts", label: "Martial Arts Background", section: "Stunt Details", type: "text", required: false, searchable: true },
  { id: "stunt_weapons_training", label: "Weapons Training", section: "Stunt Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "stunt_driving_licence_types", label: "Driving Class / Licence Types", section: "Stunt Details", type: "text", required: false, searchable: true },
  { id: "stunt_swimming_ability", label: "Swimming Ability", section: "Stunt Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "stunt_rigging_experience", label: "Rigging / Harness Experience", section: "Stunt Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "stunt_mocap_experience", label: "Motion Capture Experience", section: "Stunt Details", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "stunt_notable_credits", label: "Notable Productions / Stunt Credits", section: "Stunt Details", type: "credits-list", required: false, searchable: false },
  { id: "stunt_reel", label: "Stunt Reel", section: "Stunt Profile", type: "file-or-url", required: false, searchable: false },
  { id: "stunt_fight_clips", label: "Fight Scene Clips", section: "Stunt Profile", type: "multi-file-or-url", required: false, searchable: false },
  { id: "stunt_cert_uploads", label: "Training / Certification Uploads", section: "Stunt Profile", type: "multi-file", required: false, searchable: false },
]);

export const GUARDIAN_FIELDS: UnifiedFieldSpec[] = [
  { id: "guardian_full_name", label: "Parent / Guardian Full Name", section: "Guardian Consent", type: "text", required: true, searchable: false, validation: "2-100 chars", visibility: { showWhenUnder18: true } },
  { id: "guardian_relationship", label: "Relationship to Child", section: "Guardian Consent", type: "select", required: true, searchable: false, options: ["Parent", "Legal Guardian"], visibility: { showWhenUnder18: true } },
  { id: "guardian_email", label: "Parent / Guardian Email", section: "Guardian Consent", type: "email", required: true, searchable: false, visibility: { showWhenUnder18: true } },
  { id: "guardian_phone", label: "Parent / Guardian Phone Number", section: "Guardian Consent", type: "phone", required: true, searchable: false, visibility: { showWhenUnder18: true } },
  { id: "guardian_consent_checkbox", label: "Guardian Consent Confirmation", section: "Guardian Consent", type: "select", options: ["Yes", "No"], required: true, searchable: false, validation: "Must be Yes", visibility: { showWhenUnder18: true } },
];

export const EMERGENCY_CONTACT_FIELDS: UnifiedFieldSpec[] = [
  { id: "emergency_full_name", label: "Emergency Contact Name", section: "Emergency Contact", type: "text", required: true, searchable: false, validation: "2-100 chars" },
  { id: "emergency_relationship", label: "Relationship to Talent", section: "Emergency Contact", type: "text", required: true, searchable: false, validation: "Max 50 chars" },
  { id: "emergency_phone", label: "Emergency Contact Phone", section: "Emergency Contact", type: "phone", required: true, searchable: false, validation: "Intl format" },
];

export const DYNAMIC_TALENT_FIELDS: UnifiedFieldSpec[] = [
  ...ACTOR_FIELDS,
  ...MODEL_FIELDS,
  ...SINGER_FIELDS,
  ...DANCER_FIELDS,
  ...VOICE_ARTIST_FIELDS,
  ...PRESENTER_FIELDS,
  ...EXTRA_FIELDS,
  ...MUSICIAN_FIELDS,
  ...CREATOR_FIELDS,
  ...COMEDIAN_FIELDS,
  ...STUNT_FIELDS,
];

export const PHOTOGRAPHER_FIELDS = byTalentType("Photographer", [
  { id: "equipment_summary", label: "Primary Equipment", section: "Photography Specialisms", type: "text", required: false, searchable: true },
  { id: "editing_software", label: "Editing Software", section: "Photography Specialisms", type: "text", required: false, searchable: true },
  { id: "lighting_style", label: "Lighting Style", section: "Photography Specialisms", type: "text", required: false, searchable: true },
]);

export const MUA_STYLIST_FIELDS = [
  ...byTalentType("Makeup Artist", [
    { id: "brands_used", label: "Brands Used", section: "MUA & Hair Specialisms", type: "text", required: false, searchable: true },
    { id: "sfx_experience", label: "SFX Experience", section: "MUA & Hair Specialisms", type: "select", options: ["Yes", "No"], required: false, searchable: true },
    { id: "group_booking_available", label: "Group Bookings Available", section: "MUA & Hair Specialisms", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  ]),
  ...byTalentType("Stylist", [
    { id: "brands_used", label: "Brands Used", section: "MUA & Hair Specialisms", type: "text", required: false, searchable: true },
    { id: "sfx_experience", label: "SFX Experience", section: "MUA & Hair Specialisms", type: "select", options: ["Yes", "No"], required: false, searchable: true },
    { id: "group_booking_available", label: "Group Bookings Available", section: "MUA & Hair Specialisms", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  ]),
];

export const COACH_FIELDS = [
  ...byTalentType("Acting Coach", [
    { id: "delivery_mode", label: "Delivery Mode", section: "Coaching Specialisms", type: "select", required: false, searchable: true, options: ["Online Only", "In-Person Only", "Hybrid"] },
    { id: "coaching_specialisms", label: "Specialisms", section: "Coaching Specialisms", type: "text", required: false, searchable: true },
  ]),
  ...byTalentType("Voice Coach", [
    { id: "delivery_mode", label: "Delivery Mode", section: "Coaching Specialisms", type: "select", required: false, searchable: true, options: ["Online Only", "In-Person Only", "Hybrid"] },
    { id: "coaching_specialisms", label: "Specialisms", section: "Coaching Specialisms", type: "text", required: false, searchable: true },
  ]),
];

export const VIDEO_EDITOR_FIELDS = [
  ...byTalentType("Videographer", [
    { id: "editing_specialisms", label: "Editing Specialisms", section: "Editing Specialisms", type: "text", required: false, searchable: true },
    { id: "transfer_method", label: "File Transfer Method", section: "Editing Specialisms", type: "text", required: false, searchable: true },
  ]),
  ...byTalentType("Director", [
    { id: "editing_specialisms", label: "Editing Specialisms", section: "Editing Specialisms", type: "text", required: false, searchable: true },
    { id: "transfer_method", label: "File Transfer Method", section: "Editing Specialisms", type: "text", required: false, searchable: true },
  ]),
];

export const PROFESSIONAL_CORE_FIELDS: UnifiedFieldSpec[] = [
  { id: "business_name", label: "Business / Studio Name", section: "Professional Identity", type: "text", required: false, searchable: true },
  { id: "professional_title", label: "Professional Title", section: "Professional Identity", type: "text", required: false, searchable: true },
  { id: "prof_experience_level", label: "Experience Level", section: "Professional Overview", type: "select", required: false, searchable: true, options: ["Beginner (0-2 years)", "Intermediate (2-5 years)", "Advanced (5-10 years)", "Expert (10+ years)"] },
  { id: "prof_years_of_experience", label: "Years of Experience", section: "Professional Overview", type: "select", required: false, searchable: true, options: ["No experience yet", "<1 year", "1-2 years", "3-5 years", "5+ years", "10+ years"] },
  { id: "notable_clients", label: "Notable Clients", section: "Professional Overview", type: "credits-list", required: false, searchable: true },
  { id: "notable_projects", label: "Notable Projects", section: "Professional Overview", type: "credits-list", required: false, searchable: true },
  { id: "awards_recognition", label: "Awards & Recognition", section: "Professional Overview", type: "textarea", required: false, searchable: true },
  { id: "studio_access", label: "Studio Access Available", section: "Business & Facilities", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "studio_details", label: "Studio Details", section: "Business & Facilities", type: "textarea", required: false, searchable: false, visibility: { showWhenField: "studio_access", equals: "Yes" } },
  { id: "insurance_available", label: "Professional Insurance", section: "Business & Facilities", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "nda_friendly", label: "NDA Friendly", section: "Business & Facilities", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "contract_required", label: "Contract Required", section: "Business & Facilities", type: "select", options: ["Yes", "No"], required: false, searchable: true },
  { id: "deposit_percent", label: "Deposit Required (%)", section: "Business Terms", type: "number", required: false, searchable: false },
  { id: "payment_methods", label: "Accepted Payment Methods", section: "Business Terms", type: "text", required: false, searchable: false },
  { id: "cancellation_policy", label: "Cancellation Policy", section: "Business Terms", type: "textarea", required: false, searchable: false },
  { id: "refund_policy", label: "Refund Policy", section: "Business Terms", type: "textarea", required: false, searchable: false },
  { id: "serves_client_types", label: "Client Groups Served", section: "Business & Facilities", type: "multi-select", required: false, searchable: true, options: ["Actors / Performers", "Models", "Musicians / Singers", "Dancers", "Corporate Clients", "Commercial Brands", "Other"] },
  { id: "specific_skills", label: "Specific Professional Skills", section: "Professional Identity", type: "multi-select", required: false, searchable: true, options: ["Consulting", "Management", "Content Creation", "Event Production", "Direction", "Editing", "Styling", "Post-production", "Other"] },
  { id: "testimonials_enabled", label: "Show Testimonials on Profile", section: "Business & Facilities", type: "select", options: ["Yes", "No"], required: false, searchable: false },
  { id: "instagram_url", label: "Instagram URL", section: "Social", type: "url", required: false, searchable: false },
  { id: "linkedin_url", label: "LinkedIn URL", section: "Social", type: "url", required: false, searchable: false },
];

export const UNIFIED_TALENT_PROFILE_FIELD_SPEC: UnifiedFieldSpec[] = [
  ...CORE_PROFILE_FIELDS,
  ...TALENT_TYPE_SELECTION_FIELDS,
  ...REPRESENTATION_FIELDS,
  ...APPEARANCE_FIELDS,
  ...AVAILABILITY_FIELDS,
  ...DYNAMIC_TALENT_FIELDS,
  ...GUARDIAN_FIELDS,
  ...EMERGENCY_CONTACT_FIELDS,
  ...PHOTOGRAPHER_FIELDS,
  ...MUA_STYLIST_FIELDS,
  ...COACH_FIELDS,
  ...VIDEO_EDITOR_FIELDS,
  ...PROFESSIONAL_CORE_FIELDS,
];

export const UNIFIED_FIELD_IDS = new Set(UNIFIED_TALENT_PROFILE_FIELD_SPEC.map((field) => field.id));

export const isMinorFromAgeGroup = (ageGroup?: string): boolean => {
  if (!ageGroup) return false;
  return ["Under 13", "13-15", "16-17"].includes(ageGroup);
};

export const shouldShowField = (field: UnifiedFieldSpec, values: Record<string, any>): boolean => {
  const rule = field.visibility;
  if (!rule) return true;

  if (rule.showWhenUnder18) {
    if (!isMinorFromAgeGroup(values.age_group)) {
      return false;
    }
  }

  if (rule.showWhenTalentTypeIn?.length) {
    const primary = values.primary_talent_type;
    const additional = Array.isArray(values.additional_talent_types) ? values.additional_talent_types : [];
    const selectedTypes = [primary, ...additional].filter(Boolean);
    const matches = selectedTypes.some((selected) => rule.showWhenTalentTypeIn?.includes(selected));
    if (!matches) return false;
  }

  if (rule.showWhenField) {
    const current = values[rule.showWhenField];
    if (rule.equals !== undefined && current !== rule.equals) return false;
    if (rule.notEquals !== undefined && current === rule.notEquals) return false;
  }

  return true;
};

export const searchableFieldIds = UNIFIED_TALENT_PROFILE_FIELD_SPEC.filter((field) => field.searchable).map((field) => field.id);