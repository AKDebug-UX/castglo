import { FormRole } from "@/lib/project.utils";

export interface PreAuditionQuestion {
  title: string;
  type: string;
  required: boolean;
  options?: string[];
  help_text?: string;
  sort_order: number;
}

export interface CastingFormData {
  // Step 1: Project Basics & Production Details
  project_title: string;
  internal_project_reference: string;
  casting_company_name: string;
  production_company_name: string;
  project_status: string;
  project_type: string;
  genre: string[];
  is_union_project: boolean;
  union_details: string;
  project_website: string;
  short_project_summary: string;
  full_project_description: string;
  director_name: string;
  producer_name: string;
  writer_name: string;
  casting_director_name: string;
  production_personnel: { name: string; role: string }[];
  production_notes: string;
  industry_areas: string[];
  intended_audience_market: string;

  // Step 2: Talent Needed
  talent_types_needed: string[];
  role_scope: string;
  total_number_of_roles: string;
  open_to_mixed_talent_categories: boolean;
  represented_talent_only: boolean;
  open_to_unrepresented_talent: boolean;
  talent_location_scope: string;
  preferred_talent_base: string;
  child_talent_involved: boolean;

  // Step 3: Roles
  roles: FormRole[];

  // Step 4: Application & Audition Settings
  application_deadline: string;
  accept_until_role_filled: boolean;
  who_can_apply: string;
  invite_only: boolean;
  direct_invitations_enabled: boolean;
  castglo_matches_enabled: boolean;
  audition_required: boolean;
  audition_type: string;
  audition_date: string;
  callback_date: string;
  audition_location: string;
  audition_instructions: string;
  self_tape_accepted: boolean;
  self_tape_deadline: string;
  live_online_audition_available: boolean;
  interview_required: boolean;
  interview_format: string;

  // Step 5: Pre-Audition & Media
  pre_audition_questions: PreAuditionQuestion[];
  project_cover_image: string | null;
  additional_images: string[];
  moodboard_references: string[];
  script_sides: string | null;
  director_producer_brief: string | null;
  video_brief: string | null;
  audio_brief: string | null;
  additional_attachments: string[];
  media_required: string[];
  custom_upload_requested: boolean;
  custom_upload_description: string;

  // Step 6: Publishing & Review
  visibility_level: string;
  publish_immediately: boolean;
  save_as_draft: boolean;
  scheduled_publish_date: string;
  featured_project: boolean;
  instant_posting_addon: boolean;
  homepage_featured_addon: boolean;
  priority_matching_addon: boolean;
  extend_listing_duration_addon: boolean;
  confirm_information_accurate: boolean;
  confirm_right_to_post: boolean;
  confirm_legal_safeguarding_compliance: boolean;
  confirm_platform_policy: boolean;
}
