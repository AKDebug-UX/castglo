import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ChevronRight, Loader2, Zap } from "lucide-react";
import { castingCallAPI, uploadAPI, projectAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { resolveMediaUrl } from "@/lib/utils";
import {
  parseMetaFromAttachments,
  buildMetaRolesById,
  normaliseRoleFromAPI,
  buildRolePayload,
  buildProjectPayload,
  getProjectCoverImage,
  toDateInput,
  toStringArray,
  toProjectTypeLabel,
  toProjectStatusLabel,
} from "@/lib/project.utils";

import Step1Basics from "./create-casting/Step1Basics";
import Step2TalentNeeded from "./create-casting/Step2TalentNeeded";
import Step3Roles from "./create-casting/Step3Roles";
import Step4ApplicationAuditions from "./create-casting/Step4ApplicationAuditions";
import Step5MediaRequirements from "./create-casting/Step5MediaRequirements";
import Step6PublishReview from "./create-casting/Step6PublishReview";
import { CastingFormData } from "./create-casting/types";

export default function CreateCasting() {
  const { formatPrice, user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const totalSteps = 6;
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const { getPermissionsForProject } = useWorkspace();
  const canEdit = !isEditMode || getPermissionsForProject(id).editProject;

  // ── Form State ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<CastingFormData>({
    // Step 1: Project Basics & Production Details
    project_title: "",
    internal_project_reference: "",
    casting_company_name: "",
    production_company_name: "",
    project_status: "Open for Applications",
    project_type: "Film",
    genre: [] as string[],
    is_union_project: false,
    union_details: "",
    project_website: "",
    short_project_summary: "",
    full_project_description: "",
    director_name: "",
    producer_name: "",
    writer_name: "",
    casting_director_name: "",
    production_personnel: [] as {name: string, role: string}[],
    production_notes: "",
    industry_areas: [] as string[],
    intended_audience_market: "",

    // Step 2: Talent Needed
    talent_types_needed: [] as string[],
    role_scope: "Multiple Roles",
    total_number_of_roles: "1",
    open_to_mixed_talent_categories: true,
    represented_talent_only: false,
    open_to_unrepresented_talent: true,
    talent_location_scope: "Nationwide",
    preferred_talent_base: "",
    child_talent_involved: false,

    // Step 3: Roles
    roles: [
      {
        id: "role_initial",
        role_name: "",
        role_type: [] as string[],
        role_status: "Open",
        character_role_summary: "",
        full_role_description: "",
        number_of_talents_needed: "1",
        featured_role: false,
        role_talent_types_needed: [] as string[],
        playing_age_range: "",
        minimum_age: "18",
        maximum_age: "35",
        gender: [] as string[],
        ethnicity: [] as string[],
        open_to_all_ethnicities: true,
        height_range: "",
        build_physical_type: [] as string[],
        languages_required: [] as string[],
        accents_required: [] as string[],
        skills_required: [] as string[],
        preferred_skills: [] as string[],
        professional_experience_required: false,
        experience_level_preferred: "Professional",
        union_status_required: "Open to All",
        driving_licence_required: false,
        passport_required: false,
        travel_required: false,
        speaking_role: true,
        singing_required: false,
        dancing_required: false,
        stunts_required: false,
        modelling_posing_required: false,
        hosting_presenting_required: false,
        intimacy_scene: false,
        nudity_required: false,
        nudity_type: "To Be Discussed",
        action_combat_required: false,
        safeguarding_conditions_apply: false,
        role_shoot_performance_location: "",
        role_city: "",
        role_country: "UK",
        remote_option_available: false,
        rehearsal_dates: "",
        shoot_dates: "",
        performance_dates: "",
        availability_requirement: "",
        is_paid_role: true,
        payment_type: "Fixed Fee",
        payment_amount: "",
        currency: "GBP",
        expenses_covered: false,
        accommodation_covered: false,
        travel_covered: false,
        compensation_notes: "",
      }
    ],

    // Step 4: Application & Audition Settings
    application_deadline: "",
    accept_until_role_filled: true,
    who_can_apply: "Anyone on Castglo",
    invite_only: false,
    direct_invitations_enabled: true,
    castglo_matches_enabled: true,
    audition_required: true,
    audition_type: "Self-Tape Only",
    audition_date: "",
    callback_date: "",
    audition_location: "",
    audition_instructions: "",
    self_tape_accepted: true,
    self_tape_deadline: "",
    live_online_audition_available: false,
    interview_required: false,
    interview_format: "Online",

    // Step 5: Pre-Audition & Media
    pre_audition_questions: [] as {title: string, type: string, required: boolean, options?: string[], help_text?: string, sort_order: number}[],
    project_cover_image: null as string | null,
    additional_images: [] as string[],
    moodboard_references: [] as string[],
    script_sides: null as string | null,
    director_producer_brief: null as string | null,
    video_brief: null as string | null,
    audio_brief: null as string | null,
    additional_attachments: [] as string[],
    media_required: ["Headshot", "Reel"],
    custom_upload_requested: false,
    custom_upload_description: "",

    // Step 6: Publishing & Review
    visibility_level: "Public on Castglo",
    publish_immediately: true,
    save_as_draft: false,
    scheduled_publish_date: "",
    featured_project: false,
    instant_posting_addon: false,
    homepage_featured_addon: false,
    priority_matching_addon: false,
    extend_listing_duration_addon: false,
    confirm_information_accurate: false,
    confirm_right_to_post: false,
    confirm_legal_safeguarding_compliance: false,
    confirm_platform_policy: false,
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleAutoFill = () => {
    setFormData({
      project_title: "Project Aurora: Beyond the Horizon",
      internal_project_reference: "AUR-2024-001",
      casting_company_name: "Castglo Studios",
      production_company_name: "Aurora Films",
      project_status: "Open for Applications",
      project_type: "Film",
      genre: ["Sci-Fi", "Drama"],
      is_union_project: false,
      union_details: "",
      project_website: "https://projectaurora.com",
      short_project_summary: "A groundbreaking science fiction feature film exploring human resilience and discovery.",
      full_project_description: "Standard cinema production set in various beautiful UK locales. Exploring the theme of hope in a post-apocalyptic world.",
      director_name: "Christopher Nolan",
      producer_name: "Emma Thomas",
      writer_name: "Jonathan Nolan",
      casting_director_name: "John Smith",
      production_personnel: [
        {name: "Alice", role: "Cinematographer"},
        {name: "Bob", role: "Editor"}
      ],
      production_notes: "Focus on practical effects where possible.",
      industry_areas: ["Film", "Digital"],
      intended_audience_market: "Global cinema audience",

      talent_types_needed: ["actor_performer", "model"],
      role_scope: "Multiple Roles",
      total_number_of_roles: "2",
      open_to_mixed_talent_categories: true,
      represented_talent_only: false,
      open_to_unrepresented_talent: true,
      talent_location_scope: "Nationwide",
      preferred_talent_base: "UK Based",
      child_talent_involved: false,

      roles: [
        {
          id: "role_1",
          role_name: "Marcus Vance (Lead)",
          role_type: ["Lead"],
          role_status: "Open",
          character_role_summary: "A charismatic, intense astronaut in his mid-30s who leads the expedition.",
          full_role_description: "Must have a strong screen presence and emotional depth. Experience in physical training preferred.",
          number_of_talents_needed: "1",
          featured_role: true,
          role_talent_types_needed: ["actor_performer"],
          playing_age_range: "28-40",
          minimum_age: "28",
          maximum_age: "40",
          gender: ["Male"],
          ethnicity: ["Caucasian", "Mixed"],
          open_to_all_ethnicities: false,
          height_range: "5'10\" - 6'2\"",
          build_physical_type: ["Athletic"],
          languages_required: ["English"],
          accents_required: ["Standard American"],
          skills_required: ["Acting", "Improvisation"],
          preferred_skills: ["Stage Combat"],
          professional_experience_required: true,
          experience_level_preferred: "Professional",
          union_status_required: "Open to All",
          driving_licence_required: true,
          passport_required: true,
          travel_required: true,
          speaking_role: true,
          singing_required: false,
          dancing_required: false,
          stunts_required: false,
          modelling_posing_required: false,
          hosting_presenting_required: false,
          intimacy_scene: false,
          nudity_required: false,
          nudity_type: "To Be Discussed",
          action_combat_required: false,
          safeguarding_conditions_apply: false,
          role_shoot_performance_location: "London, UK",
          role_city: "London",
          role_country: "UK",
          remote_option_available: false,
          rehearsal_dates: "2024-06-01 to 2024-06-15",
          shoot_dates: "2024-07-01 to 2024-09-30",
          performance_dates: "N/A",
          availability_requirement: "Full availability required during shoot dates.",
          is_paid_role: true,
          payment_type: "Flat Project Fee",
          payment_amount: "5000",
          currency: "GBP",
          expenses_covered: true,
          accommodation_covered: true,
          travel_covered: true,
          compensation_notes: "Travel and accommodation provided for duration of shoot.",
        }
      ],

      application_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      accept_until_role_filled: true,
      who_can_apply: "Anyone on Castglo",
      invite_only: false,
      direct_invitations_enabled: true,
      castglo_matches_enabled: true,
      audition_required: true,
      audition_type: "Self-Tape Only",
      audition_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      callback_date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      audition_location: "Online",
      audition_instructions: "Please submit a 2-minute dramatic monologue.",
      self_tape_accepted: true,
      self_tape_deadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      live_online_audition_available: true,
      interview_required: true,
      interview_format: "Online",

      pre_audition_questions: [
        {title: "Are you willing to travel?", type: "Yes / No", required: true, sort_order: 1}
      ],
      project_cover_image: null,
      additional_images: [],
      moodboard_references: [],
      script_sides: null,
      director_producer_brief: null,
      video_brief: null,
      audio_brief: null,
      additional_attachments: [],
      media_required: ["Headshot", "Reel"],
      custom_upload_requested: false,
      custom_upload_description: "",

      visibility_level: "Public on Castglo",
      publish_immediately: true,
      save_as_draft: false,
      scheduled_publish_date: "",
      featured_project: false,
      instant_posting_addon: false,
      homepage_featured_addon: false,
      priority_matching_addon: false,
      extend_listing_duration_addon: false,
      confirm_information_accurate: true,
      confirm_right_to_post: true,
      confirm_legal_safeguarding_compliance: true,
      confirm_platform_policy: true,
    });
    toast.success("New project basics and role details auto-filled with high-quality mock data!");
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchCasting = async () => {
        setIsLoading(true);
        try {
          const [projectRes, rolesRes] = await Promise.all([
            projectAPI.getOne(id as string),
            projectAPI.getRoles(id as string).catch(() => ({ data: { success: false, data: [] } }))
          ]);
          
          if (projectRes.data.success) {
            const raw = projectRes.data.data;
            const data = raw?.castingCall || raw?.project || raw;
            // Overwrite data.roles with actual roles from the separate endpoint if the endpoint returned data
            if (rolesRes.data?.success && Array.isArray(rolesRes.data?.data)) {
              data.roles = rolesRes.data.data;
            } else if (rolesRes.data?.success && Array.isArray(rolesRes.data?.data?.roles)) {
              data.roles = rolesRes.data.data.roles;
            }

            // ── Extract __META__ blob ────────────────────────────────────
            let parsedMeta: any = parseMetaFromAttachments(
              data.projectAttachments,
              data.requirements
            );

            // Meta roles keyed by ID — used to fill gaps in backend role objects
            const metaRolesById = buildMetaRolesById(parsedMeta);

            // ── Normalise roles using shared util ────────────────────────
            const rawRoles = Array.isArray(data.roles) ? data.roles : [];
            const safeRoles = rawRoles.map((r: any) => {
              const roleId = String(r.id || r._id || r.role_id || "");
              const metaRole = metaRolesById[roleId] || {};
              return normaliseRoleFromAPI(r, metaRole);
            });

            // ── Build the merged top-level form state ────────────────────
            // Prefer parsedMeta for fields the backend doesn't natively store,
            // then override with live backend values where they exist.
            const metaTop = parsedMeta || {};

            setFormData(prev => ({
              ...prev,
              ...metaTop,      // fill in all meta fields first
              // Then explicitly override with reliable backend/meta values:
              project_title: data.project_title || data.projectName || data.title || metaTop.project_title || "",
              project_type: toProjectTypeLabel(data.project_type || data.projectType || metaTop.project_type) || "Film",
              full_project_description: data.full_project_description || data.description || metaTop.full_project_description || "",
              project_status: toProjectStatusLabel(data.project_status || data.status || metaTop.project_status) || "Open for Applications",
              short_project_summary: data.short_project_summary || metaTop.short_project_summary || "",
              internal_project_reference: data.internal_project_reference || metaTop.internal_project_reference || "",
              casting_company_name: data.casting_company_name || metaTop.casting_company_name || "",
              production_company_name: data.production_company_name || metaTop.production_company_name || "",
              project_website: data.project_website || metaTop.project_website || "",
              director_name: data.director_name || metaTop.director_name || "",
              producer_name: data.producer_name || metaTop.producer_name || "",
              writer_name: data.writer_name || metaTop.writer_name || "",
              casting_director_name: data.casting_director_name || metaTop.casting_director_name || "",
              production_notes: data.production_notes || metaTop.production_notes || "",
              intended_audience_market: data.intended_audience_market || metaTop.intended_audience_market || "",
              // Dates — use shared toDateInput helper
              application_deadline: toDateInput(data.application_deadline || data.deadline || metaTop.application_deadline
                || data.dates?.submission),
              self_tape_deadline: toDateInput(data.self_tape_deadline || metaTop.self_tape_deadline),
              audition_date: toDateInput(data.audition_date || metaTop.audition_date),
              callback_date: toDateInput(data.callback_date || metaTop.callback_date),
              // Arrays
              genre: toStringArray(data.genre || metaTop.genre || data.category),
              industry_areas: toStringArray(data.industry_areas || metaTop.industry_areas),
              talent_types_needed: toStringArray(data.talent_types_needed || metaTop.talent_types_needed || data.talentTypes),
              media_required: Array.isArray(data.media_required) && data.media_required.length > 0
                ? data.media_required
                : Array.isArray(metaTop.media_required) && metaTop.media_required.length > 0
                  ? metaTop.media_required
                  : prev.media_required,
              pre_audition_questions: Array.isArray(data.pre_audition_questions)
                ? data.pre_audition_questions
                : Array.isArray(metaTop.pre_audition_questions)
                  ? metaTop.pre_audition_questions
                  : prev.pre_audition_questions,
              // Location
              talent_location_scope: data.talent_location_scope || metaTop.talent_location_scope || prev.talent_location_scope,
              preferred_talent_base: data.preferred_talent_base || metaTop.preferred_talent_base || (typeof data.location === "string" ? data.location : prev.preferred_talent_base),
              // Images — use shared helper
              project_cover_image: getProjectCoverImage(data, metaTop) || prev.project_cover_image,
              additional_images: Array.isArray(data.additional_images) ? data.additional_images : (Array.isArray(metaTop.additional_images) ? metaTop.additional_images : prev.additional_images),
              moodboard_references: Array.isArray(data.moodboard_references) ? data.moodboard_references : (Array.isArray(metaTop.moodboard_references) ? metaTop.moodboard_references : prev.moodboard_references),
              // Audition settings
              audition_type: data.audition_type || metaTop.audition_type || prev.audition_type,
              audition_instructions: data.audition_instructions || metaTop.audition_instructions || "",
              audition_location: data.audition_location || metaTop.audition_location || "",
              self_tape_accepted: data.self_tape_accepted ?? metaTop.self_tape_accepted ?? prev.self_tape_accepted,
              live_online_audition_available: data.live_online_audition_available ?? metaTop.live_online_audition_available ?? false,
              interview_required: data.interview_required ?? metaTop.interview_required ?? false,
              interview_format: data.interview_format || metaTop.interview_format || "Online",
              // Publish settings
              visibility_level: data.visibility_level || metaTop.visibility_level || prev.visibility_level,
              featured_project: data.featured_project ?? metaTop.featured_project ?? false,
              // Roles — use our fully normalised safeRoles
              roles: safeRoles.length > 0 ? safeRoles : prev.roles,
            }));

            // Restore the cover image preview so it shows in the upload widget on edit.
            // Priority: CDN URL from attachments → meta blob URL/base64 → existing selectedImage
            const coverUrl = getProjectCoverImage(data, metaTop);
            const fallbackCover = coverUrl || metaTop?.project_cover_image || "";
            if (fallbackCover) {
              setSelectedImage(resolveMediaUrl(fallbackCover));
            }
          }
        } catch (error) {
          toast.error("Failed to load casting call details");
        } finally {
          setIsLoading(false);
        }
      };
      fetchCasting();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (roleID: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map(role => role.id === roleID ? { ...role, [field]: value } : role)
    }));
  };

  const addRole = () => {
    setFormData(prev => ({
      ...prev,
      roles: [
        ...prev.roles,
        {
          id: Date.now().toString(),
          _fromServer: false,
          role_name: "",
          role_type: [],
          role_status: "Open",
          character_role_summary: "",
          full_role_description: "",
          number_of_talents_needed: "1",
          featured_role: false,
          role_talent_types_needed: [],
          playing_age_range: "",
          minimum_age: "18",
          maximum_age: "35",
          gender: [],
          ethnicity: [],
          open_to_all_ethnicities: true,
          height_range: "",
          build_physical_type: [],
          languages_required: [],
          accents_required: [],
          skills_required: [],
          preferred_skills: [],
          professional_experience_required: false,
          experience_level_preferred: "Professional",
          union_status_required: "Open to All",
          driving_licence_required: false,
          passport_required: false,
          travel_required: false,
          speaking_role: true,
          singing_required: false,
          dancing_required: false,
          stunts_required: false,
          modelling_posing_required: false,
          hosting_presenting_required: false,
          intimacy_scene: false,
          nudity_required: false,
          nudity_type: "To Be Discussed",
          action_combat_required: false,
          safeguarding_conditions_apply: false,
          role_shoot_performance_location: "",
          role_city: "",
          role_country: "UK",
          remote_option_available: false,
          rehearsal_dates: "",
          shoot_dates: "",
          performance_dates: "",
          availability_requirement: "",
          is_paid_role: true,
          payment_type: "Fixed Fee",
          payment_amount: "",
          currency: "GBP",
          expenses_covered: false,
          accommodation_covered: false,
          travel_covered: false,
          compensation_notes: "",
        }
      ]
    }));
  };

  const removeRole = (roleID: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r.id !== roleID)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        setFormData(prev => ({ ...prev, project_cover_image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!formData.project_title || !formData.short_project_summary) {
        toast.error("Please fill required project basics.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (formData.talent_types_needed.length === 0) {
        toast.error("Please select at least one talent type needed.");
        return false;
      }
    }
    if (currentStep === 3) {
      if (formData.roles.length === 0) {
        toast.error("Please add at least one role.");
        return false;
      }
      for (const role of formData.roles) {
        if (!role.role_name || !role.character_role_summary) {
          toast.error("All roles must have a name and summary.");
          return false;
        }
      }
    }
    if (currentStep === 4) {
      if (!formData.application_deadline) {
        toast.error("Please set an application deadline.");
        return false;
      }
    }
    if (currentStep === 5) {
      if (!formData.project_cover_image && !selectedImage && !imageFile) {
        toast.error("Please upload a Project Poster / Cover Image.");
        return false;
      }
      if (formData.media_required.length === 0) {
        toast.error("Please select at least one media requirement.");
        return false;
      }
    }
    if (currentStep === 6) {
      if (!formData.confirm_information_accurate || !formData.confirm_right_to_post || !formData.confirm_legal_safeguarding_compliance || !formData.confirm_platform_policy) {
        toast.error("Please confirm all compliance requirements.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent, statusOverride?: string) => {
    e.preventDefault();
    
    // Only allow final submission if on the last step, unless explicitly updating from edit mode
    if (statusOverride !== "draft" && statusOverride !== "edit_update" && step !== totalSteps) {
      return;
    }

    // For final submission, validate all steps. For draft, only validate the basics (Step 1).
    if (statusOverride === "draft") {
      if (!validateStep(1)) return;
    } else {
      if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5) || !validateStep(6)) return;
    }

    setIsSubmitting(true);
    try {
      // Map roles to backend payload using shared util
      const mappedRoles = formData.roles.map(r => ({
        id: r.id || r._id,
        ...buildRolePayload(
          r,
          formData.media_required,
          formData.application_deadline,
          formData.custom_upload_description
        ),
      }));

      const isBoosted = formData.featured_project || formData.instant_posting_addon;

      // Build project payload using shared util, then attach META blob
      const metaString = encodeURIComponent(JSON.stringify({ ...formData }));
      let payload: any = {
        ...buildProjectPayload(formData, statusOverride),
        projectAttachments: ["__META__:" + metaString],
      };

      if (imageFile) {
        try {
          const uploadFormData = new FormData();
          // Use the new /upload/image endpoint which expects "image" field
          uploadFormData.append("image", imageFile);
          
          const uploadRes = await uploadAPI.uploadImage(uploadFormData);
          const imageUrl = uploadRes.data?.data?.url || uploadRes.data?.url;
          if (imageUrl) {
            payload.projectAttachments.push(imageUrl);
          }
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          toast.error("Image upload failed. Project saved without cover image.");
        }
      } else if (formData.project_cover_image) {
        payload.projectAttachments.push(formData.project_cover_image);
      }

      let response;
      if (isEditMode) {
        response = await projectAPI.update(id as string, payload);
      } else {
        response = await projectAPI.create(payload);
      }

      if (response.data.success) {
        const projectData = response.data.data;
        const projectId = projectData?.id || projectData?._id || id;
        
        // --- Add/Update roles via projectAPI ---
        if (mappedRoles.length > 0) {
          try {
            await Promise.all(mappedRoles.map(r => {
              const roleId = r.id;
              // Remove the local id before sending to backend
              const payload = { ...r };
              delete payload.id;
              
              if (isEditMode && r._fromServer && roleId) {
                // Server-sourced role — update it, fall back to create on 404
                return projectAPI.updateRole(projectId, roleId, payload).catch(() => projectAPI.createRole(projectId, payload));
              } else {
                return projectAPI.createRole(projectId, payload);
              }
            }));
          } catch (roleErr) {
            console.error("Failed to add/update roles:", roleErr);
            toast.error("Project saved, but some roles failed to attach or update. Please check the project details.");
          }
        }

        // If any boost is selected, redirect to checkout
        if ((formData.featured_project || formData.instant_posting_addon) && statusOverride !== "draft") {
          try {
            let response;
            if (formData.featured_project) {
              response = await castingCallAPI.boost(projectId);
            } else if (formData.instant_posting_addon) {
              response = await castingCallAPI.instantPost(projectId);
            }

            if (response?.data?.success) {
              const { url } = response.data.data;
              if (url) {
                window.location.href = url;
                return;
              }
            }
            
            toast.error("Could not initiate payment. Project saved as draft.");
            navigate("/director/projects");
            return;
          } catch (checkoutErr) {
            console.error("Checkout initiation failed:", checkoutErr);
            toast.error("Failed to initiate payment. Project saved.");
            navigate("/director/projects");
            return;
          }
        }

        toast.success(isEditMode ? "Project updated successfully!" : "Project created successfully!");
        navigate("/director/projects");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "";
      if (errorMsg.toLowerCase().includes("limit") || errorMsg.toLowerCase().includes("upgrade")) {
        setShowLimitModal(true);
      } else {
        toast.error(errorMsg || "Failed to save project");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (step < totalSteps) {
        nextStep();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link 
            to="/director/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Projects
          </Link>
          <h1 className="text-3xl font-bold">{isEditMode ? "Edit Project" : "Post a New Project"}</h1>
          <p className="text-muted-foreground">Find the perfect talent for your upcoming production</p>
        </div>
        <Button
          type="button"
          onClick={handleAutoFill}
          variant="outline"
          className="self-start sm:self-center bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100/80 hover:text-teal-800 flex items-center gap-2 font-semibold shadow-sm transition-all duration-200"
        >
          <Zap className="w-4 h-4 text-teal-600 fill-teal-600 animate-pulse" />
          Auto-fill Mock Data
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative mb-12">
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-muted -z-10 translate-y-[-50%] rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
        {[
          { num: 1, label: "Basics" },
          { num: 2, label: "Talent" },
          { num: 3, label: "Roles" },
          { num: 4, label: "Auditions" },
          { num: 5, label: "Media" },
          { num: 6, label: "Publish" }
        ].map(s => (
          <div key={s.num} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => { if(s.num < step) setStep(s.num) }}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
              step >= s.num ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-muted"
            }`}>
              {s.num}
            </div>
            <span className={`text-xs font-semibold ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Director Profile Info */}
      {user && (
        <Card className="bg-muted/30 border-dashed mb-8">
          <CardContent className="p-4 flex items-center gap-4">
            <img 
              src={user.profilePicture || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.fullName)} 
              alt={user.fullName}
              className="w-12 h-12 rounded-full object-cover border bg-background"
            />
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Posting as</p>
              <h3 className="font-semibold text-base leading-none">{user.fullName}</h3>
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!canEdit && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="text-amber-800 font-semibold">Read-Only Access</h3>
            <p className="text-amber-700 text-sm mt-1">You have view-only access to this project. You cannot make any changes.</p>
          </div>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} onKeyDown={handleKeyDown}>
        <fieldset disabled={!canEdit} className="space-y-6">
        {/* STEP 1: PROJECT BASICS & PRODUCTION DETAILS */}
        {step === 1 && (
          <Step1Basics
            formData={formData}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            setFormData={setFormData}
          />
        )}

        {/* STEP 2: TALENT NEEDED */}
        {step === 2 && (
          <Step2TalentNeeded
            formData={formData}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            setFormData={setFormData}
          />
        )}

        {/* STEP 3: ROLES */}
        {step === 3 && (
          <Step3Roles
            roles={formData.roles}
            addRole={addRole}
            removeRole={removeRole}
            handleRoleChange={handleRoleChange}
          />
        )}

        {/* STEP 4: APPLICATION & AUDITION SETTINGS */}
        {step === 4 && (
          <Step4ApplicationAuditions
            formData={formData}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            setFormData={setFormData}
          />
        )}

        {/* STEP 5: MEDIA & PRE-AUDITION */}
        {step === 5 && (
          <Step5MediaRequirements
            formData={formData}
            selectedImage={selectedImage}
            handleImageChange={handleImageChange}
            handleSelectChange={handleSelectChange}
            setFormData={setFormData}
            handleChange={handleChange}
          />
        )}

        {/* STEP 6: PUBLISHING & REVIEW */}
        {step === 6 && (
          <Step6PublishReview
            formData={formData}
            setFormData={setFormData}
            formatPrice={formatPrice}
          />
        )}

        {/* BOTTOM NAVIGATION ACTIONS */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <div></div> // Placeholder for flex spacing
          )}

          <div className="flex gap-3">
            {step === 1 && canEdit && !isEditMode && (
              <Button type="button" variant="ghost" onClick={(e) => handleSubmit(e, "draft")} disabled={isSubmitting}>
                Save Draft
              </Button>
            )}

            {isEditMode && canEdit && step < totalSteps && (
              <Button 
                key="submit-form-button-edit" 
                type="button" 
                variant="outline"
                onClick={(e) => handleSubmit(e as any, "edit_update")}
                disabled={isSubmitting} 
                className="min-w-32 border-primary text-primary hover:bg-primary/10"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Project"}
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button key="next-step-button" type="button" onClick={nextStep} className="gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              canEdit && (
                <Button key="submit-form-button" type="submit" disabled={isSubmitting} size="lg" className="min-w-32">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (formData.featured_project || formData.instant_posting_addon ? "Pay & Publish" : "Publish Project")}
                </Button>
              )
            )}
          </div>
        </div>
        </fieldset>
      </form>

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limit Reached</DialogTitle>
            <DialogDescription>
              You have reached your limit for creating casting calls. Please upgrade your plan to continue posting new projects and discovering top talent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowLimitModal(false)}>Cancel</Button>
            <Button onClick={() => navigate("/pricing")} className="gap-2">
              <Zap className="w-4 h-4 fill-current" />
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
