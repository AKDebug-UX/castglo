// ── Constants from Reference Tables ──────────────────────────────────────────
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
import { castingCallAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateCasting() {
  const { formatPrice } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const totalSteps = 3;
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Form State ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    // Step 1: Project Details
    projectName: "",
    projectType: "film",
    locationType: "nationwide",
    location: "",
    category: "drama",
    deadline: "",
    description: "",
    image: null as string | null,
    
    project_title: "",
    project_description: "",
    project_type: "",
    status: "open",
    genre: [] as string[],
    product_website: "",
    talent_type_needed: [] as string[],
    payment_type: "paid",
    payment_amount: "",
    currency: "GBP",
    submission_deadline: "",
    audition_date: "",
    callback_date: "",
    location_scope: "nationwide",
    city: "",
    country: "UK",
    address_details: "",
    audition_type: "in_person",
    
    // Step 2 & 3: Roles & Pre-Audition
    roles: [
      {
        id: "role_initial",
        title: "",
        description: "",
        roleType: "supporting",
        minAge: "18",
        maxAge: "35",
        gender: "any",
        ethnicity: "any",
        unionStatus: "non-union",
        payRate: "",
        requirements: "",
        requestVideo: false,
        requestAudio: false,
        requestCoverLetter: false,
        customQuestions: "Tell us why you fit this role"
      }
    ],

    // Step 3: Add-Ons
    instantPosting: false,
    featuredPosting: false,
    urgentHiringBadge: false,
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleAutoFill = () => {
    setFormData({
      projectName: "Project Aurora: Beyond the Horizon",
      projectType: "film",
      locationType: "nationwide",
      location: "London, UK",
      category: "drama",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
      description: "A groundbreaking science fiction feature film exploring human resilience and discovery. Standard cinema production set in various beautiful UK locales.",
      status: "open",
      genre: ["Sci-Fi", "Drama"],
      product_website: "https://projectaurora.com",
      talent_type_needed: ["actor_performer"],
      payment_type: "paid",
      payment_amount: "450",
      currency: "GBP",
      submission_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      audition_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      callback_date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location_scope: "nationwide",
      city: "London",
      country: "UK",
      address_details: "Pinewood Studios, Iver, Buckinghamshire",
      audition_type: "in_person",
      
      roles: [
        {
          id: "role_1",
          title: "Marcus Vance (Lead)",
          description: "A charismatic, intense astronaut in his mid-30s who leads the expedition. Must have a strong screen presence and emotional depth.",
          roleType: "lead",
          minAge: "28",
          maxAge: "40",
          gender: "male",
          ethnicity: "any",
          unionStatus: "both",
          payRate: "450",
          requirements: "Previous acting experience in feature films or television is required.\nStrong vocal projection and stage combat skills are a plus.",
          requestVideo: true,
          requestAudio: false,
          requestCoverLetter: true,
          customQuestions: "What is your experience with intense dramatic roles?"
        }
      ],

      instantPosting: false,
      featuredPosting: false,
      urgentHiringBadge: false,
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
            setFormData(prev => ({
              ...prev,
              projectName: data.projectName || data.title || "",
              projectType: data.projectType || "film",
              description: data.description || "",
              category: data.category || "drama",
              location: data.location || "",
              deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : "",
              status: data.status || "open"
              // Roles would ideally be populated here if the backend started supporting it.
              // We'll leave the first role blank or mock it.
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
          title: "",
          description: "",
          roleType: "supporting",
          minAge: "18",
          maxAge: "35",
          gender: "any",
          ethnicity: "any",
          unionStatus: "non-union",
          payRate: "",
          requirements: "",
          requestVideo: false,
          requestAudio: false,
          requestCoverLetter: false,
          customQuestions: ""
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
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!formData.projectName || !formData.deadline || !formData.location) {
        toast.error("Please fill all required project details.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (formData.roles.length === 0) {
        toast.error("Please add at least one role.");
        return false;
      }
      for (const role of formData.roles) {
        if (!role.title) {
          toast.error("All roles must have a title.");
          return false;
        }
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
    if (!validateStep(1) || !validateStep(2)) return;

    setIsSubmitting(true);
    try {
      // Assemble payload matching current backend needs but including our new data where possible
      // Existing backend expects 'title', 'requirements' array, so we try to format gracefully.
      const firstRole = formData.roles[0];
      const payload = {
        ...formData,
        title: firstRole ? firstRole.title : formData.projectName, // Fallback for backwards compatibility
        requirements: firstRole ? firstRole.requirements.split('\n') : [],
        roles: formData.roles,
        status: statusOverride || formData.status,
      };

      let response;
      let requestPayload: any = payload;

      if (imageFile) {
        const formDataPayload = new FormData();
        // Append the file under expected keys to support different backend conventions (image/poster/file)
        formDataPayload.append("image", imageFile);
        formDataPayload.append("poster", imageFile);
        formDataPayload.append("file", imageFile);

        // Append all other fields
        Object.entries(payload).forEach(([key, value]) => {
          if (key === "image") return; // Skip base64 preview string
          
          if (Array.isArray(value)) {
            formDataPayload.append(key, JSON.stringify(value));
          } else if (typeof value === "object" && value !== null) {
            formDataPayload.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            formDataPayload.append(key, String(value));
          }
        });
        requestPayload = formDataPayload;
      }

      if (isEditMode) {
        response = await castingCallAPI.update(id, requestPayload);
      } else {
        response = await castingCallAPI.create(requestPayload);
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
          { num: 1, label: "Project Basics" },
          { num: 2, label: "Roles & Auditions" },
          { num: 3, label: "Promote & Publish" }
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

      <form onSubmit={(e) => handleSubmit(e)}>
        {/* STEP 1: PROJECT DETAILS */}
        <div className={step === 1 ? "block space-y-6 animate-fade-in" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Provide the high-level details that describe the production itself.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Title *</Label>
                  <Input 
                    id="projectName"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder="e.g. Current Production Name" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectType">Production Type *</Label>
                  <Select value={formData.projectType} onValueChange={(v) => handleSelectChange("projectType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="film">Film</SelectItem>
                      <SelectItem value="tv">Television</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="music_video">Music Video</SelectItem>
                      <SelectItem value="theater">Theatre</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="locationType">Location Type</Label>
                  <Select value={formData.locationType} onValueChange={(v) => handleSelectChange("locationType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select location type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local (In-Person)</SelectItem>
                      <SelectItem value="nationwide">Nationwide</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">City / Location *</Label>
                  <Input 
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. London, UK" 
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Genre / Category</Label>
                  <Select value={formData.category} onValueChange={(v) => handleSelectChange("category", v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drama">Drama</SelectItem>
                      <SelectItem value="comedy">Comedy</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="documentary">Documentary</SelectItem>
                      <SelectItem value="modeling">Modeling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Submission Deadline *</Label>
                  <Input 
                    id="deadline" 
                    name="deadline"
                    type="date" 
                    required 
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Production Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the overall project, synopsis, and what you're trying to achieve..."
                />
              </div>

              <div className="space-y-2">
                <Label>Project Poster / Header</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition-colors cursor-pointer relative group">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                  {selectedImage || formData.image ? (
                    <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden max-w-2xl">
                      <img src={selectedImage || formData.image} alt="Project Header" className="w-full h-full object-cover" />
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
            </CardContent>
          </Card>
        </div>

        {/* STEP 2: ROLES & AUDITIONS */}
        <div className={step === 2 ? "block space-y-6 animate-fade-in" : "hidden"}>
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
                  Role {index + 1}: {role.title || "Untitled Role"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Role Name / Character *</Label>
                    <Input 
                      value={role.title} 
                      onChange={(e) => handleRoleChange(role.id, 'title', e.target.value)}
                      placeholder="e.g. John Doe, Lead Dancer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role Type</Label>
                    <Select value={role.roleType} onValueChange={(v) => handleRoleChange(role.id, 'roleType', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="supporting">Supporting</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="extra">Background / Extra</SelectItem>
                        <SelectItem value="voice">Voiceover</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={role.gender} onValueChange={(v) => handleRoleChange(role.id, 'gender', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Min Age</Label>
                    <Input type="number" value={role.minAge} onChange={(e) => handleRoleChange(role.id, 'minAge', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Age</Label>
                    <Input type="number" value={role.maxAge} onChange={(e) => handleRoleChange(role.id, 'maxAge', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ethnicity</Label>
                    <Select value={role.ethnicity} onValueChange={(v) => handleRoleChange(role.id, 'ethnicity', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="caucasian">Caucasian</SelectItem>
                        <SelectItem value="black">Black/African Descent</SelectItem>
                        <SelectItem value="asian">Asian</SelectItem>
                        <SelectItem value="latino">Latino</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Union Status</Label>
                    <Select value={role.unionStatus} onValueChange={(v) => handleRoleChange(role.id, 'unionStatus', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="non-union">Non-Union</SelectItem>
                        <SelectItem value="union">Union Only</SelectItem>
                        <SelectItem value="both">Open to Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pay Rate & Detail</Label>
                    <Input 
                      value={role.payRate} 
                      onChange={(e) => handleRoleChange(role.id, 'payRate', e.target.value)}
                      placeholder="e.g. $500/day, TBD, Unpaid"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Character Description & Context</Label>
                  <Textarea 
                    value={role.description} 
                    onChange={(e) => handleRoleChange(role.id, 'description', e.target.value)}
                    rows={3}
                    placeholder="Briefly describe the character's personality, arc, or the nature of this role."
                  />
                </div>
                
                <Separator />

                {/* Pre-Audition Workflow configs */}
                <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
                  <h4 className="font-bold flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" />
                    Pre-Audition Requirements
                  </h4>
                  <p className="text-sm text-muted-foreground">What must talent submit when they apply for this role?</p>
                  
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <Checkbox 
                        checked={role.requestVideo} 
                        onCheckedChange={(c) => handleRoleChange(role.id, 'requestVideo', !!c)} 
                      />
                      <span className="text-sm font-medium">Require Video Reel / Self-Tape</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <Checkbox 
                        checked={role.requestAudio} 
                        onCheckedChange={(c) => handleRoleChange(role.id, 'requestAudio', !!c)} 
                      />
                      <span className="text-sm font-medium">Require Voice Reel</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <Checkbox 
                        checked={role.requestCoverLetter} 
                        onCheckedChange={(c) => handleRoleChange(role.id, 'requestCoverLetter', !!c)} 
                      />
                      <span className="text-sm font-medium">Require Cover Letter</span>
                    </label>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label>Custom Pre-Audition Question</Label>
                    <Input 
                      value={role.customQuestions} 
                      onChange={(e) => handleRoleChange(role.id, 'customQuestions', e.target.value)}
                      placeholder="e.g. Are you willing to cut your hair for this role?"
                    />
                    <p className="text-xs text-muted-foreground">Applicants will need to answer this when submitting.</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
          
          <Button type="button" onClick={addRole} variant="outline" className="w-full border-dashed border-2 py-8 text-muted-foreground hover:text-primary hover:border-primary transition-colors">
            <Plus className="w-5 h-5 mr-2" /> Add Another Role
          </Button>
        </div>

        {/* STEP 3: PROMOTE & PUBLISH */}
        <div className={step === 3 ? "block space-y-6 animate-fade-in" : "hidden"}>
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Boost Your Casting Call
              </CardTitle>
              <CardDescription>Upgrade your listing to gain maximum visibility and find talent faster.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.featuredPosting ? 'border-amber-400 bg-amber-100/50' : 'border-slate-200 bg-white hover:border-amber-200'}`} onClick={() => setFormData(p => ({...p, featuredPosting: !p.featuredPosting}))}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="mt-1"><Star className={`w-5 h-5 ${formData.featuredPosting ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} /></div>
                    <div>
                      <h4 className="font-bold text-slate-800">Featured Listing</h4>
                      <p className="text-sm text-slate-600 mt-1">Pin your project to the top of the Castglo job board for 7 days. Gets up to 5x more applications.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">{formatPrice(29.99)}</span>
                    <Checkbox className="ml-2 mt-1 hidden" checked={formData.featuredPosting} readOnly />
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.urgentHiringBadge ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white hover:border-red-200'}`} onClick={() => setFormData(p => ({...p, urgentHiringBadge: !p.urgentHiringBadge}))}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="mt-1"><FastForward className={`w-5 h-5 ${formData.urgentHiringBadge ? 'text-red-500' : 'text-slate-400'}`} /></div>
                    <div>
                      <h4 className="font-bold text-slate-800">Urgent Hiring Badge</h4>
                      <p className="text-sm text-slate-600 mt-1">Highlights your project in red and alerts matching talent that you are casting immediately.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">{formatPrice(14.99)}</span>
                    <Checkbox className="ml-2 mt-1 hidden" checked={formData.urgentHiringBadge} readOnly />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <CardTitle>Final Review</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">You are about to publish <strong>{formData.projectName}</strong> with <strong>{formData.roles.length} role(s)</strong>.</p>
                {formData.featuredPosting || formData.urgentHiringBadge ? (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border flex justify-between items-center">
                     <span className="font-bold">Total Add-ons Cost:</span>
                     <span className="font-bold text-lg">
                        {formatPrice((formData.featuredPosting ? 29.99 : 0) + (formData.urgentHiringBadge ? 14.99 : 0))}
                     </span>
                  </div>
                ) : null}
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
              <Button type="button" onClick={nextStep} className="gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} size="lg" className="min-w-32">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (formData.featuredPosting || formData.urgentHiringBadge ? "Pay & Publish" : "Publish Project")}
              </Button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}
