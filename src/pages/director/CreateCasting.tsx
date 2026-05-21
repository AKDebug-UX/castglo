// ── Constants from Reference Tables ──────────────────────────────────────────
const PROJECT_TYPES = [
  "Film", "TV", "Theatre", "Commercial", "Music Video", "Voiceover", 
  "Fashion Campaign", "Content Project", "Live Event", "Other"
];

const INDUSTRY_AREAS = [
  "Film", "TV", "Theatre", "Music", "Fashion", "Commercials", "Digital", "Live Events", "Corporate", "Other"
];

const AUDITION_TYPES = [
  "Open Call", "By Appointment", "Self-Tape Only", "Invite Only", "Online Live Audition", "Callback Only", "No Audition Required"
];

const PAYMENT_TYPES = [
  "Fixed Fee", "Per Hour", "Per Day", "Per Week", "Flat Project Fee", "Expenses Only", "Profit Share", "Negotiable", "Unpaid", "Deferred Payment"
];

const VISIBILITY_LEVELS = [
  "Public on Castglo", "Invite Only", "Private Draft", "Visible to Selected Talent Only"
];

const TALENT_TYPES = [
  "actor_performer", "model", "singer", "dancer", "voice_artist", "presenter_host",
  "extra_supporting_artist", "musician", "content_creator", "comedian", "stunt_performer",
  "child_talent", "mixed_cast", "other"
];

const GENRES = [
  "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Documentary", 
  "Reality", "Musical", "Commercial", "Corporate", "Educational", "Other"
];

const ETHNICITIES = [
  "black_african", "black_caribbean", "black_british", "mixed_black_white", 
  "mixed_asian_white", "mixed_other", "south_asian_indian", "south_asian_pakistani", 
  "south_asian_bangladeshi", "south_asian_other", "east_asian_chinese", 
  "east_asian_japanese", "east_asian_korean", "east_asian_other", "south_east_asian", 
  "middle_eastern", "north_african", "hispanic_latinx", "white_british", 
  "white_irish", "white_european", "white_other", "indigenous", "pacific_islander", 
  "ethnically_ambiguous", "open_to_all"
];

const ROLE_SKILLS = [
  "acting", "improvisation", "comedy", "dramatic_performance", "stage_combat", 
  "screen_combat", "self_taping", "voiceover", "narration", "character_voice", 
  "singing", "harmonising", "songwriting", "piano", "guitar", "drums", "violin", 
  "dancing", "ballet", "contemporary_dance", "hip_hop", "commercial_dance", 
  "choreography", "modelling", "runway_walk", "posing", "hosting", "presenting", 
  "interviewing", "public_speaking", "accents", "multilingual", "horse_riding", 
  "swimming", "cycling", "driving", "martial_arts", "weapons_handling", "stunts", 
  "motion_capture", "sports_fitness", "content_creation", "social_media_presence", "other"
];

const HAIR_COLORS = ["Black", "Brown", "Blonde", "Red", "Grey", "White", "Bald", "Other"];
const EYE_COLORS = ["Blue", "Brown", "Green", "Hazel", "Grey", "Other"];

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, ChevronRight, HelpCircle, Rocket, X, Loader2, Trash2, Plus, Video, Image as ImageIcon, Zap, Star, FastForward, Upload } from "lucide-react";
import { castingCallAPI, profileAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateCasting() {
  const { formatPrice } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const totalSteps = 6;
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Form State ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
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
          const response = await castingCallAPI.getOne(id as string);
          if (response.data.success) {
            const data = response.data.data;
            
            // Safely map roles to ensure all required array fields exist
            const safeRoles = (data.roles || []).map((r: any) => ({
              ...r,
              id: r.id || r._id || Math.random().toString(),
              role_name: r.role_name || r.title || "",
              role_type: Array.isArray(r.role_type) ? r.role_type : (r.roleType ? [r.roleType] : []),
              role_status: r.role_status || "Open",
              character_role_summary: r.character_role_summary || r.description || "",
              full_role_description: r.full_role_description || r.requirements || "",
              gender: Array.isArray(r.gender) ? r.gender : (r.gender ? [r.gender] : []),
              ethnicity: Array.isArray(r.ethnicity) ? r.ethnicity : (r.ethnicity ? [r.ethnicity] : []),
              role_talent_types_needed: Array.isArray(r.role_talent_types_needed) ? r.role_talent_types_needed : [],
              build_physical_type: Array.isArray(r.build_physical_type) ? r.build_physical_type : [],
              languages_required: Array.isArray(r.languages_required) ? r.languages_required : [],
              accents_required: Array.isArray(r.accents_required) ? r.accents_required : [],
              skills_required: Array.isArray(r.skills_required) ? r.skills_required : [],
              preferred_skills: Array.isArray(r.preferred_skills) ? r.preferred_skills : [],
            }));

            setFormData(prev => ({
              ...prev,
              ...data,
              project_title: data.project_title || data.projectName || data.title || "",
              project_type: data.project_type || data.projectType || "Film",
              full_project_description: data.full_project_description || data.description || "",
              project_status: data.project_status || data.status || "Open for Applications",
              application_deadline: data.application_deadline || data.deadline || "",
              genre: Array.isArray(data.genre) ? data.genre : [],
              industry_areas: Array.isArray(data.industry_areas) ? data.industry_areas : [],
              talent_types_needed: Array.isArray(data.talent_types_needed) ? data.talent_types_needed : [],
              roles: safeRoles.length > 0 ? safeRoles : prev.roles,
            }));
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
    
    // Only allow final submission if on the last step
    if (statusOverride !== "draft" && step !== totalSteps) {
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
      const firstRole = formData.roles[0];
      
      // Map new roles to legacy format for backend compatibility
      const mappedRoles = formData.roles.map(r => ({
        ...r,
        title: r.role_name,
        description: r.full_role_description || r.character_role_summary,
        roleType: r.role_type?.[0] || "supporting",
        minAge: r.minimum_age,
        maxAge: r.maximum_age,
        gender: r.gender?.[0]?.toLowerCase() || "any",
        ethnicity: r.ethnicity?.[0]?.toLowerCase() || "any",
        unionStatus: r.union_status_required?.toLowerCase()?.includes('non') ? "non-union" : (r.union_status_required?.toLowerCase()?.includes('union') ? "union" : "both"),
        payRate: r.payment_amount,
        requirements: (r.character_role_summary + "\n" + (r.full_role_description || "")).split('\n').filter(Boolean).join('\n'),
         requestVideo: formData.media_required?.includes("Reel"),
         requestAudio: formData.media_required?.includes("Voice Reel"),
         requestCoverLetter: formData.media_required?.includes("Cover Letter"),
         customQuestions: formData.custom_upload_description || ""
       }));

      let payload: any = {
        ...formData,
        // Legacy fields for backward compatibility
        title: formData.project_title || (firstRole ? firstRole.role_name : ""),
        projectName: formData.project_title,
        projectType: formData.project_type?.toLowerCase(),
        description: formData.full_project_description || formData.short_project_summary,
        deadline: formData.application_deadline,
        status: statusOverride || (formData.project_status?.toLowerCase().includes('open') ? "open" : (formData.project_status?.toLowerCase().includes('draft') ? "draft" : "open")),
        location: formData.preferred_talent_base || formData.talent_location_scope,
        category: formData.genre?.[0] || "other",
        requirements: firstRole ? (firstRole.character_role_summary + "\n" + (firstRole.full_role_description || "")).split('\n').filter(Boolean) : [],
        roles: mappedRoles,
        // Add-ons legacy names
        featuredPosting: formData.featured_project,
        urgentHiringBadge: formData.instant_posting_addon,
        instantPosting: formData.instant_posting_addon
      };

      if (imageFile) {
        try {
          const uploadFormData = new FormData();
          // The backend addHeadshot endpoint specifically expects "headshot" field
          uploadFormData.append("headshot", imageFile);
          
          const uploadRes = await profileAPI.addHeadshot(uploadFormData);
          const imageUrl = uploadRes.data?.data?.url || uploadRes.data?.data?.imageUrl || uploadRes.data?.data?.image;
          if (imageUrl) {
            payload.project_cover_image = imageUrl;
            payload.image = imageUrl; // Legacy field
          }
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
        }
      }

      let response;
      if (isEditMode) {
        response = await castingCallAPI.update(id as string, payload);
      } else {
        response = await castingCallAPI.create(payload);
      }

      if (response.data.success) {
        toast.success(isEditMode ? "Project updated successfully!" : "Project created successfully!");
        navigate("/director/projects");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save project");
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
        {!isEditMode && (
          <Button
            type="button"
            onClick={handleAutoFill}
            variant="outline"
            className="self-start sm:self-center bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100/80 hover:text-teal-800 flex items-center gap-2 font-semibold shadow-sm transition-all duration-200"
          >
            <Zap className="w-4 h-4 text-teal-600 fill-teal-600 animate-pulse" />
            Auto-fill Mock Data
          </Button>
        )}
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

      <form onSubmit={(e) => handleSubmit(e)} onKeyDown={handleKeyDown}>
        {/* STEP 1: PROJECT BASICS & PRODUCTION DETAILS */}
        <div className={step === 1 ? "block space-y-6 animate-fade-in" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle>Project Basics</CardTitle>
              <CardDescription>Section 1: High-level identification of the project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project_title">Project Title *</Label>
                  <Input 
                    id="project_title"
                    name="project_title"
                    value={formData.project_title}
                    onChange={handleChange}
                    placeholder="e.g. Current Production Name" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internal_project_reference">Internal Project Reference</Label>
                  <Input 
                    id="internal_project_reference"
                    name="internal_project_reference"
                    value={formData.internal_project_reference}
                    onChange={handleChange}
                    placeholder="e.g. REF-123" 
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="casting_company_name">Casting Company / Agency Name *</Label>
                  <Input 
                    id="casting_company_name"
                    name="casting_company_name"
                    value={formData.casting_company_name}
                    onChange={handleChange}
                    placeholder="Auto-fills if profile exists" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="production_company_name">Production Company Name</Label>
                  <Input 
                    id="production_company_name"
                    name="production_company_name"
                    value={formData.production_company_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project_status">Project Status *</Label>
                  <Select value={formData.project_status} onValueChange={(v) => handleSelectChange("project_status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Open for Applications">Open for Applications</SelectItem>
                      <SelectItem value="Invite Only">Invite Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_type">Project Type *</Label>
                  <Select value={formData.project_type} onValueChange={(v) => handleSelectChange("project_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Genre</Label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => (
                    <Badge 
                      key={g} 
                      variant={formData.genre?.includes(g) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newGenre = formData.genre?.includes(g) 
                          ? formData.genre.filter(i => i !== g)
                          : [...(formData.genre || []), g];
                        handleSelectChange("genre", newGenre);
                      }}
                    >
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_union_project" 
                  checked={formData.is_union_project} 
                  onCheckedChange={(c) => setFormData(p => ({...p, is_union_project: c}))} 
                />
                <Label htmlFor="is_union_project">Is this a union project?</Label>
              </div>

              {formData.is_union_project && (
                <div className="space-y-2">
                  <Label htmlFor="union_details">Union Details</Label>
                  <Input 
                    id="union_details"
                    name="union_details"
                    value={formData.union_details}
                    onChange={handleChange}
                    placeholder="e.g. SAG-AFTRA, Equity" 
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="project_website">Project Website</Label>
                <Input 
                  id="project_website"
                  name="project_website"
                  value={formData.project_website}
                  onChange={handleChange}
                  placeholder="https://..." 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Production Details</CardTitle>
              <CardDescription>Section 2: Detailed description of the production.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="short_project_summary">Short Project Summary *</Label>
                <Textarea 
                  id="short_project_summary"
                  name="short_project_summary"
                  value={formData.short_project_summary}
                  onChange={handleChange}
                  rows={2}
                  placeholder="30-300 chars summary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_project_description">Full Project Description *</Label>
                <Textarea 
                  id="full_project_description"
                  name="full_project_description"
                  value={formData.full_project_description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="100-5000 chars detailed description"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="director_name">Director Name</Label>
                  <Input id="director_name" name="director_name" value={formData.director_name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="producer_name">Producer Name</Label>
                  <Input id="producer_name" name="producer_name" value={formData.producer_name} onChange={handleChange} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="writer_name">Writer Name</Label>
                  <Input id="writer_name" name="writer_name" value={formData.writer_name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="casting_director_name">Casting Director Name</Label>
                  <Input id="casting_director_name" name="casting_director_name" value={formData.casting_director_name} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Industry Areas</Label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRY_AREAS.map(a => (
                    <Badge 
                      key={a} 
                      variant={formData.industry_areas?.includes(a) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newAreas = formData.industry_areas?.includes(a) 
                          ? formData.industry_areas.filter(i => i !== a)
                          : [...(formData.industry_areas || []), a];
                        handleSelectChange("industry_areas", newAreas);
                      }}
                    >
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intended_audience_market">Intended Audience / Market</Label>
                <Input id="intended_audience_market" name="intended_audience_market" value={formData.intended_audience_market} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="production_notes">Production Notes</Label>
                <Textarea id="production_notes" name="production_notes" value={formData.production_notes} onChange={handleChange} rows={3} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* STEP 2: TALENT NEEDED */}
        <div className={step === 2 ? "block space-y-6 animate-fade-in" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle>Talent Needed</CardTitle>
              <CardDescription>Section 3: High-level requirements for the talent pool.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Talent Types Needed *</Label>
                <div className="flex flex-wrap gap-2">
                  {TALENT_TYPES.map(t => (
                    <Badge 
                      key={t} 
                      variant={formData.talent_types_needed?.includes(t) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newTypes = formData.talent_types_needed?.includes(t) 
                          ? formData.talent_types_needed.filter(i => i !== t)
                          : [...(formData.talent_types_needed || []), t];
                        handleSelectChange("talent_types_needed", newTypes);
                      }}
                    >
                      {t.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role_scope">Is this for a single role or multiple roles? *</Label>
                  <Select value={formData.role_scope} onValueChange={(v) => handleSelectChange("role_scope", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single Role">Single Role</SelectItem>
                      <SelectItem value="Multiple Roles">Multiple Roles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_number_of_roles">Total Number of Roles</Label>
                  <Input type="number" id="total_number_of_roles" name="total_number_of_roles" value={formData.total_number_of_roles} onChange={handleChange} min="1" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch id="open_to_mixed_talent_categories" checked={formData.open_to_mixed_talent_categories} onCheckedChange={(c) => setFormData(p => ({...p, open_to_mixed_talent_categories: c}))} />
                  <Label htmlFor="open_to_mixed_talent_categories">Open to mixed talent categories?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="child_talent_involved" checked={formData.child_talent_involved} onCheckedChange={(c) => setFormData(p => ({...p, child_talent_involved: c}))} />
                  <Label htmlFor="child_talent_involved">Child Talent Involved?</Label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch id="represented_talent_only" checked={formData.represented_talent_only} onCheckedChange={(c) => setFormData(p => ({...p, represented_talent_only: c}))} />
                  <Label htmlFor="represented_talent_only">Open to represented talent only?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="open_to_unrepresented_talent" checked={formData.open_to_unrepresented_talent} onCheckedChange={(c) => setFormData(p => ({...p, open_to_unrepresented_talent: c}))} />
                  <Label htmlFor="open_to_unrepresented_talent">Open to unrepresented talent?</Label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="talent_location_scope">Talent Location Scope *</Label>
                  <Select value={formData.talent_location_scope} onValueChange={(v) => handleSelectChange("talent_location_scope", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Local Only">Local Only</SelectItem>
                      <SelectItem value="Nationwide">Nationwide</SelectItem>
                      <SelectItem value="International">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_talent_base">Preferred Talent Base</Label>
                  <Input id="preferred_talent_base" name="preferred_talent_base" value={formData.preferred_talent_base} onChange={handleChange} placeholder="e.g. London, New York" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* STEP 3: ROLES */}
        <div className={step === 3 ? "block space-y-6 animate-fade-in" : "hidden"}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Characters & Roles</h2>
            <Button type="button" onClick={addRole} variant="outline" size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Add Role
            </Button>
          </div>

          {formData.roles.map((role, index) => (
            <Card key={role.id} className="border-primary/20 shadow-sm relative overflow-visible">
              {formData.roles.length > 1 && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-md z-10"
                  onClick={() => removeRole(role.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <CardHeader className="bg-slate-50 border-b relative pb-4 rounded-t-xl">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-tl-xl" />
                <CardTitle className="text-lg flex items-center gap-2">
                  Role {index + 1}: {role.role_name || "Untitled Role"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                {/* 4 B. ROLE IDENTITY */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Role Identity</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Role Name *</Label>
                      <Input value={role.role_name} onChange={(e) => handleRoleChange(role.id, 'role_name', e.target.value)} placeholder="e.g. John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Role Status</Label>
                      <Select value={role.role_status} onValueChange={(v) => handleRoleChange(role.id, 'role_status', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="Paused">Paused</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="Cast">Cast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Character / Role Summary *</Label>
                    <Textarea value={role.character_role_summary} onChange={(e) => handleRoleChange(role.id, 'character_role_summary', e.target.value)} rows={2} placeholder="20-300 chars" />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Role Description</Label>
                    <Textarea value={role.full_role_description} onChange={(e) => handleRoleChange(role.id, 'full_role_description', e.target.value)} rows={4} placeholder="50-4000 chars" />
                  </div>
                </div>

                {/* 4 C. ROLE REQUIREMENTS */}
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Role Requirements</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Min Age</Label>
                      <Input type="number" value={role.minimum_age} onChange={(e) => handleRoleChange(role.id, 'minimum_age', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Age</Label>
                      <Input type="number" value={role.maximum_age} onChange={(e) => handleRoleChange(role.id, 'maximum_age', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <div className="flex flex-wrap gap-1">
                        {["Male", "Female", "Non-binary", "Any"].map(g => (
                          <Badge 
                            key={g} 
                            variant={role.gender?.includes(g) ? "default" : "outline"}
                            className="cursor-pointer text-[10px]"
                            onClick={() => {
                              const newG = role.gender?.includes(g) ? role.gender.filter(i => i !== g) : [...(role.gender || []), g];
                              handleRoleChange(role.id, 'gender', newG);
                            }}
                          >
                            {g}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Union Status Required</Label>
                      <Select value={role.union_status_required} onValueChange={(v) => handleRoleChange(role.id, 'union_status_required', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Union Only">Union Only</SelectItem>
                          <SelectItem value="Non-Union Only">Non-Union Only</SelectItem>
                          <SelectItem value="Open to All">Open to All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Experience Level Preferred</Label>
                      <Select value={role.experience_level_preferred} onValueChange={(v) => handleRoleChange(role.id, 'experience_level_preferred', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.professional_experience_required} onCheckedChange={(c) => handleRoleChange(role.id, 'professional_experience_required', !!c)} />
                      <Label className="text-xs">Pro Experience Req?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.driving_licence_required} onCheckedChange={(c) => handleRoleChange(role.id, 'driving_licence_required', !!c)} />
                      <Label className="text-xs">Driving Licence?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.passport_required} onCheckedChange={(c) => handleRoleChange(role.id, 'passport_required', !!c)} />
                      <Label className="text-xs">Passport?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.travel_required} onCheckedChange={(c) => handleRoleChange(role.id, 'travel_required', !!c)} />
                      <Label className="text-xs">Travel Required?</Label>
                    </div>
                  </div>
                </div>

                {/* 4 D. ROLE PERFORMANCE */}
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Performance Details</h3>
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.speaking_role} onCheckedChange={(c) => handleRoleChange(role.id, 'speaking_role', !!c)} />
                      <Label className="text-xs">Speaking Role?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.singing_required} onCheckedChange={(c) => handleRoleChange(role.id, 'singing_required', !!c)} />
                      <Label className="text-xs">Singing?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.dancing_required} onCheckedChange={(c) => handleRoleChange(role.id, 'dancing_required', !!c)} />
                      <Label className="text-xs">Dancing?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.stunts_required} onCheckedChange={(c) => handleRoleChange(role.id, 'stunts_required', !!c)} />
                      <Label className="text-xs">Stunts?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.intimacy_scene} onCheckedChange={(c) => handleRoleChange(role.id, 'intimacy_scene', !!c)} />
                      <Label className="text-xs">Intimacy Scene?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.nudity_required} onCheckedChange={(c) => handleRoleChange(role.id, 'nudity_required', !!c)} />
                      <Label className="text-xs">Nudity Required?</Label>
                    </div>
                  </div>
                  {role.nudity_required && (
                    <div className="space-y-2">
                      <Label>Nudity Type</Label>
                      <Select value={role.nudity_type} onValueChange={(v) => handleRoleChange(role.id, 'nudity_type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Partial">Partial</SelectItem>
                          <SelectItem value="Full">Full</SelectItem>
                          <SelectItem value="To Be Discussed">To Be Discussed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* 4 F. ROLE PAYMENT */}
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Payment & Compensation</h3>
                  <div className="flex items-center space-x-2">
                    <Switch checked={role.is_paid_role} onCheckedChange={(c) => handleRoleChange(role.id, 'is_paid_role', c)} />
                    <Label>Is this a paid role? *</Label>
                  </div>
                  {role.is_paid_role && (
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Payment Type *</Label>
                        <Select value={role.payment_type} onValueChange={(v) => handleRoleChange(role.id, 'payment_type', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PAYMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Rate / Amount</Label>
                        <Input type="number" value={role.payment_amount} onChange={(e) => handleRoleChange(role.id, 'payment_amount', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency *</Label>
                        <Select value={role.currency} onValueChange={(v) => handleRoleChange(role.id, 'currency', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <div className="grid gap-4 grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.expenses_covered} onCheckedChange={(c) => handleRoleChange(role.id, 'expenses_covered', !!c)} />
                      <Label className="text-xs">Expenses Covered?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.accommodation_covered} onCheckedChange={(c) => handleRoleChange(role.id, 'accommodation_covered', !!c)} />
                      <Label className="text-xs">Accommodation?</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={role.travel_covered} onCheckedChange={(c) => handleRoleChange(role.id, 'travel_covered', !!c)} />
                      <Label className="text-xs">Travel Covered?</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Compensation Notes</Label>
                    <Textarea value={role.compensation_notes} onChange={(e) => handleRoleChange(role.id, 'compensation_notes', e.target.value)} rows={2} />
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
          
          <Button type="button" onClick={addRole} variant="outline" className="w-full border-dashed border-2 py-8 text-muted-foreground hover:text-primary hover:border-primary transition-colors">
            <Plus className="w-5 h-5 mr-2" /> Add Another Role
          </Button>
        </div>

        {/* STEP 4: APPLICATION & AUDITION SETTINGS */}
        <div className={step === 4 ? "block space-y-6 animate-fade-in" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>Section 5: Define how and when talent can apply.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="application_deadline">Application Deadline *</Label>
                  <Input 
                    id="application_deadline" 
                    name="application_deadline"
                    type="date" 
                    required 
                    value={formData.application_deadline}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="who_can_apply">Who Can Apply? *</Label>
                  <Select value={formData.who_can_apply} onValueChange={(v) => handleSelectChange("who_can_apply", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Anyone on Castglo">Anyone on Castglo</SelectItem>
                      <SelectItem value="Invited Talent Only">Invited Talent Only</SelectItem>
                      <SelectItem value="Represented Talent Only">Represented Talent Only</SelectItem>
                      <SelectItem value="Specific Talent Type Only">Specific Talent Type Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch id="accept_until_role_filled" checked={formData.accept_until_role_filled} onCheckedChange={(c) => setFormData(p => ({...p, accept_until_role_filled: c}))} />
                  <Label htmlFor="accept_until_role_filled">Accept until role is filled?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="invite_only" checked={formData.invite_only} onCheckedChange={(c) => setFormData(p => ({...p, invite_only: c}))} />
                  <Label htmlFor="invite_only">Is Application by Invite Only?</Label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch id="direct_invitations_enabled" checked={formData.direct_invitations_enabled} onCheckedChange={(c) => setFormData(p => ({...p, direct_invitations_enabled: c}))} />
                  <Label htmlFor="direct_invitations_enabled">Are direct invitations enabled?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="castglo_matches_enabled" checked={formData.castglo_matches_enabled} onCheckedChange={(c) => setFormData(p => ({...p, castglo_matches_enabled: c}))} />
                  <Label htmlFor="castglo_matches_enabled">Enable Castglo Matches?</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audition Settings</CardTitle>
              <CardDescription>Section 6: Audition and interview process details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch id="audition_required" checked={formData.audition_required} onCheckedChange={(c) => setFormData(p => ({...p, audition_required: c}))} />
                <Label htmlFor="audition_required">Is an audition required? *</Label>
              </div>

              {formData.audition_required && (
                <div className="space-y-6 pt-4 animate-fade-in">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="audition_type">Audition Type</Label>
                      <Select value={formData.audition_type} onValueChange={(v) => handleSelectChange("audition_type", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {AUDITION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audition_date">Audition Date</Label>
                      <Input type="date" id="audition_date" name="audition_date" value={formData.audition_date} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="callback_date">Callback Date</Label>
                      <Input type="date" id="callback_date" name="callback_date" value={formData.callback_date} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audition_location">Audition Location</Label>
                      <Input id="audition_location" name="audition_location" value={formData.audition_location} onChange={handleChange} placeholder="e.g. Studio A, Online" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audition_instructions">Audition Instructions</Label>
                    <Textarea id="audition_instructions" name="audition_instructions" value={formData.audition_instructions} onChange={handleChange} rows={3} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="self_tape_accepted" checked={formData.self_tape_accepted} onCheckedChange={(c) => setFormData(p => ({...p, self_tape_accepted: c}))} />
                      <Label htmlFor="self_tape_accepted">Self-Tape Accepted?</Label>
                    </div>
                    {formData.self_tape_accepted && (
                      <div className="space-y-2">
                        <Label htmlFor="self_tape_deadline">Self-Tape Deadline</Label>
                        <Input type="date" id="self_tape_deadline" name="self_tape_deadline" value={formData.self_tape_deadline} onChange={handleChange} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center space-x-2">
                <Switch id="interview_required" checked={formData.interview_required} onCheckedChange={(c) => setFormData(p => ({...p, interview_required: c}))} />
                <Label htmlFor="interview_required">Interview Required?</Label>
              </div>

              {formData.interview_required && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="interview_format">Interview Format</Label>
                  <Select value={formData.interview_format} onValueChange={(v) => handleSelectChange("interview_format", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In-person">In-person</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="To Be Confirmed">To Be Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* STEP 5: MEDIA & PRE-AUDITION */}
        <div className={step === 5 ? "block space-y-6 animate-fade-in" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle>Project Media</CardTitle>
              <CardDescription>Section 8: Upload assets related to the production.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Project Poster / Cover Image</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition-colors cursor-pointer relative group">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                  {selectedImage || formData.project_cover_image ? (
                    <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden max-w-2xl">
                      <img src={selectedImage || formData.project_cover_image} alt="Project Header" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-8 h-8 text-white" />
                        <span className="ml-2 text-white font-medium">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Click or drag to upload header image</p>
                      <p className="text-xs text-slate-400 mt-1">Recommended size: 1200x600px</p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Script Sides (PDF)</Label>
                  <Input type="file" accept=".pdf" onChange={(e) => {}} />
                </div>
                <div className="space-y-2">
                  <Label>Director / Producer Brief</Label>
                  <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => {}} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applicant Requirements</CardTitle>
              <CardDescription>Section 9: What talent must provide in their application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Media Required *</Label>
                <div className="flex flex-wrap gap-2">
                  {["Headshot", "Reel", "Voice Reel", "Portfolio", "Cover Letter"].map(m => (
                    <Badge 
                      key={m} 
                      variant={formData.media_required?.includes(m) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newM = formData.media_required?.includes(m) 
                          ? formData.media_required.filter(i => i !== m)
                          : [...(formData.media_required || []), m];
                        handleSelectChange("media_required", newM);
                      }}
                    >
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="custom_upload_requested" checked={formData.custom_upload_requested} onCheckedChange={(c) => setFormData(p => ({...p, custom_upload_requested: c}))} />
                <Label htmlFor="custom_upload_requested">Custom Upload Requested?</Label>
              </div>

              {formData.custom_upload_requested && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="custom_upload_description">Custom Upload Description</Label>
                  <Textarea id="custom_upload_description" name="custom_upload_description" value={formData.custom_upload_description} onChange={handleChange} placeholder="Describe what custom file you need..." />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* STEP 6: PUBLISHING & REVIEW */}
        <div className={step === 6 ? "block space-y-6 animate-fade-in" : "hidden"}>
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Boost Your Casting Call
              </CardTitle>
              <CardDescription>Upgrade your listing to gain maximum visibility.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.featured_project ? 'border-amber-400 bg-amber-100/50' : 'border-slate-200 bg-white hover:border-amber-200'}`} onClick={() => setFormData(p => ({...p, featured_project: !p.featured_project}))}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="mt-1"><Star className={`w-5 h-5 ${formData.featured_project ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} /></div>
                    <div>
                      <h4 className="font-bold text-slate-800">Featured Listing</h4>
                      <p className="text-sm text-slate-600 mt-1">Pin your project to the top for 7 days. Gets up to 5x more applications.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">{formatPrice(29.99)}</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.instant_posting_addon ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white hover:border-red-200'}`} onClick={() => setFormData(p => ({...p, instant_posting_addon: !p.instant_posting_addon}))}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="mt-1"><FastForward className={`w-5 h-5 ${formData.instant_posting_addon ? 'text-red-500' : 'text-slate-400'}`} /></div>
                    <div>
                      <h4 className="font-bold text-slate-800">Instant Posting</h4>
                      <p className="text-sm text-slate-600 mt-1">Skip moderation and publish immediately.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">{formatPrice(14.99)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review & Compliance</CardTitle>
              <CardDescription>Section 11: Final confirmations before publishing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox id="confirm_information_accurate" checked={formData.confirm_information_accurate} onCheckedChange={(c) => setFormData(p => ({...p, confirm_information_accurate: !!c}))} />
                  <Label htmlFor="confirm_information_accurate" className="text-sm font-normal leading-tight">I confirm the information provided is accurate</Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox id="confirm_right_to_post" checked={formData.confirm_right_to_post} onCheckedChange={(c) => setFormData(p => ({...p, confirm_right_to_post: !!c}))} />
                  <Label htmlFor="confirm_right_to_post" className="text-sm font-normal leading-tight">I confirm I have the right to post this casting/project</Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox id="confirm_legal_safeguarding_compliance" checked={formData.confirm_legal_safeguarding_compliance} onCheckedChange={(c) => setFormData(p => ({...p, confirm_legal_safeguarding_compliance: !!c}))} />
                  <Label htmlFor="confirm_legal_safeguarding_compliance" className="text-sm font-normal leading-tight">I confirm this project complies with legal and safeguarding requirements</Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox id="confirm_platform_policy" checked={formData.confirm_platform_policy} onCheckedChange={(c) => setFormData(p => ({...p, confirm_platform_policy: !!c}))} />
                  <Label htmlFor="confirm_platform_policy" className="text-sm font-normal leading-tight">I understand Castglo policies on fairness, privacy, and conduct</Label>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm text-muted-foreground">You are about to publish <strong>{formData.project_title || "Untitled Project"}</strong> with <strong>{formData.roles.length} role(s)</strong>.</p>
                {(formData.featured_project || formData.instant_posting_addon) && (
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="font-bold">Total Add-ons Cost:</span>
                    <span className="font-bold text-lg">
                      {formatPrice((formData.featured_project ? 29.99 : 0) + (formData.instant_posting_addon ? 14.99 : 0))}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
            {step === 1 && (
              <Button type="button" variant="ghost" onClick={(e) => handleSubmit(e, "draft")} disabled={isSubmitting}>
                Save Draft
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button key="next-step-button" type="button" onClick={nextStep} className="gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button key="submit-form-button" type="submit" disabled={isSubmitting} size="lg" className="min-w-32">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (formData.featured_project || formData.instant_posting_addon ? "Pay & Publish" : "Publish Project")}
              </Button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}
