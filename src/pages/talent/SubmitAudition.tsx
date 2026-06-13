import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Upload, Loader2, File, Image as ImageIcon, Video, Zap } from "lucide-react";
import { castingCallAPI, applicationAPI, uploadAPI, projectAPI, profileAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatLocation } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";



export default function SubmitAudition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [casting, setCasting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const initialRoleId = searchParams.get("roleId") || "";
  const [selectedRoleId, setSelectedRoleId] = useState(initialRoleId);
  const [userProfile, setUserProfile] = useState<any>(null);
  const isProfessional = user?.role === "industry_professional";
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    if (isProfessional) {
      setAvailableSkills([
        "Photography", "Makeup & Hair", "Coaching / Training", "Video Editing", "Fashion Styling", "Lighting", "Sound Design", "Production Assistant"
      ]);
    } else {
      setAvailableSkills([
        "Acting", "Voice over", "Modeling", "Dancing", "Stunts", "Presenting", "Singing", "Comedy"
      ]);
    }
  }, [user, isProfessional]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, any>>({});
  const [hasExistingApplication, setHasExistingApplication] = useState(false);

  const [formData, setFormData] = useState({
    cover_message: "",
    why_suitable: "",
    relevant_experience: "",
    skills: [] as string[],
    showreel_url: "",
    portfolio_links: "",
    height: "",
    age_range: "",
    location_override: "",
    availability_date: "",
    willing_to_travel: false,
    compensation_expectation: "",
    legal_consent: false,
    previous_work_links: "",
    additional_notes: ""
  });

  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [useProfileHeadshot, setUseProfileHeadshot] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const getProfileFieldValue = (key: string): any => {
    console.log(`getProfileFieldValue called for key: ${key}`);
    if (!userProfile) return null;
    
    // Check various places the value might be stored
    const flatData: Record<string, any> = {};
    const flatten = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      Object.entries(obj).forEach(([k, v]) => {
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
          flatten(v);
        } else {
          if (v !== undefined && v !== null && v !== "") {
            flatData[k] = v;
          }
        }
      });
    };
    flatten(userProfile);
    console.log("flatData:", flatData);
    
    // Check unified talent profile fields
    const unified = userProfile.unifiedTalentProfile || {};
    console.log("unifiedTalentProfile:", unified);
    if (unified[key] && unified[key] !== "") {
      console.log(`Found in unifiedTalentProfile: ${unified[key]}`);
      return unified[key];
    }
    
    // Check flat data
    const keysToCheck = [key, key.replace(/_/g, ''), key.replace(/_/g, '-'), key.replace(/_/g, ' ')];
    for (const k of keysToCheck) {
      if (flatData[k] && flatData[k] !== "") {
        console.log(`Found in flatData[${k}]: ${flatData[k]}`);
        return flatData[k];
      }
    }
    
    // Special cases for common fields
    const specialCases: Record<string, string[]> = {
      short_bio: ['bio', 'shortBio', 'short_bio'],
      relevant_experience: ['experience', 'yearsOfExperience', 'years_of_experience'],
      skills: ['skills', 'coreSkills', 'core_skills', 'actor_special_skills', 'special_skills'],
      height: ['height', 'appearance.height'],
      age_range: ['playingAgeRange', 'actor_playing_age_range', 'age_range'],
      location_override: ['location', 'current_city', 'city'],
      portfolio_links: ['portfolio_url', 'website', 'socialLinks'],
      showreel_url: ['showreel', 'actor_showreel', 'reel'],
      previous_work_links: ['notableCredits', 'actor_notable_credits']
    };
    
    if (specialCases[key]) {
      for (const specialKey of specialCases[key]) {
        console.log(`Checking specialKey: ${specialKey}`);
        if (specialKey.includes('.')) {
          const parts = specialKey.split('.');
          let val = userProfile;
          for (const p of parts) {
            val = val?.[p];
          }
          if (val) {
            console.log(`Found in nested key ${specialKey}: ${val}`);
            return val;
          }
        }
        if (unified[specialKey]) {
          console.log(`Found in unified[${specialKey}]: ${unified[specialKey]}`);
          return unified[specialKey];
        }
        if (flatData[specialKey]) {
          console.log(`Found in flatData[${specialKey}]: ${flatData[specialKey]}`);
          return flatData[specialKey];
        }
      }
    }
    
    console.log(`No value found for key: ${key}`);
    return null;
  };
  
  const useProfileData = (profileToUse: any = userProfile) => {
    console.log("useProfileData called!", profileToUse);
    
    // Make a deep copy of formData
    let newFormData = { ...formData };
    
    // Auto-fill common fields from profile with explicit mappings
    const fieldMappings: Record<string, string[]> = {
      cover_message: ['short_bio', 'bio', 'shortBio', 'short_bio'],
      relevant_experience: ['experience', 'yearsOfExperience', 'years_of_experience'],
      skills: ['skills', 'coreSkills', 'core_skills', 'actor_special_skills', 'special_skills'],
      height: ['height', 'appearance.height'],
      age_range: ['playingAgeRange', 'actor_playing_age_range', 'age_range'],
      location_override: ['location', 'current_city', 'city'],
      portfolio_links: ['portfolio_url', 'website', 'socialLinks'],
      showreel_url: ['showreel', 'actor_showreel', 'reel'],
      previous_work_links: ['notableCredits', 'actor_notable_credits']
    };
    
    // Override getProfileFieldValue to use profileToUse if provided
    const getVal = (key: string): any => {
      console.log(`getVal called for key: ${key}`, profileToUse);
      if (!profileToUse) return null;
      
      // Check various places the value might be stored
      const flatData: Record<string, any> = {};
      const flatten = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        Object.entries(obj).forEach(([k, v]) => {
          if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
            flatten(v);
          } else {
            if (v !== undefined && v !== null && v !== "") {
              flatData[k] = v;
            }
          }
        });
      };
      flatten(profileToUse);
      console.log("flatData:", flatData);
      
      // Check unified talent profile fields
      const unified = profileToUse.unifiedTalentProfile || {};
      console.log("unifiedTalentProfile:", unified);
      if (unified[key] && unified[key] !== "") {
        console.log(`Found in unifiedTalentProfile: ${unified[key]}`);
        return unified[key];
      }
      
      // Check flat data
      const keysToCheck = [key, key.replace(/_/g, ''), key.replace(/_/g, '-'), key.replace(/_/g, ' ')];
      for (const k of keysToCheck) {
        if (flatData[k] && flatData[k] !== "") {
          console.log(`Found in flatData[${k}]: ${flatData[k]}`);
          return flatData[k];
        }
      }
      
      // Special cases for common fields
      const specialCases: Record<string, string[]> = {
        short_bio: ['bio', 'shortBio', 'short_bio'],
        relevant_experience: ['experience', 'yearsOfExperience', 'years_of_experience'],
        skills: ['skills', 'coreSkills', 'core_skills', 'actor_special_skills', 'special_skills'],
        height: ['height', 'appearance.height'],
        age_range: ['playingAgeRange', 'actor_playing_age_range', 'age_range'],
        location_override: ['location', 'current_city', 'city'],
        portfolio_links: ['portfolio_url', 'website', 'socialLinks'],
        showreel_url: ['showreel', 'actor_showreel', 'reel'],
        previous_work_links: ['notableCredits', 'actor_notable_credits']
      };
      
      if (specialCases[key]) {
        for (const specialKey of specialCases[key]) {
          console.log(`Checking specialKey: ${specialKey}`);
          if (specialKey.includes('.')) {
            const parts = specialKey.split('.');
            let val = profileToUse;
            for (const p of parts) {
              val = val?.[p];
            }
            if (val) {
              console.log(`Found in nested key ${specialKey}: ${val}`);
              return val;
            }
          }
          if (unified[specialKey]) {
            console.log(`Found in unified[${specialKey}]: ${unified[specialKey]}`);
            return unified[specialKey];
          }
          if (flatData[specialKey]) {
            console.log(`Found in flatData[${specialKey}]: ${flatData[specialKey]}`);
            return flatData[specialKey];
          }
        }
      }
      
      console.log(`No value found for key: ${key}`);
      return null;
    };
    
    for (const [targetField, sourceKeys] of Object.entries(fieldMappings)) {
      let val: any = null;
      for (const key of sourceKeys) {
        val = getVal(key);
        if (val !== null && val !== undefined) break;
      }
      console.log(`Field ${targetField}:`, val);
      if (val !== null && val !== undefined) {
        if (typeof val === 'boolean') {
          (newFormData as any)[targetField] = val;
        } else if (typeof val === 'string' && (val.toLowerCase() === 'yes' || val.toLowerCase() === 'no')) {
          if (targetField === 'willing_to_travel') {
            newFormData.willing_to_travel = val.toLowerCase() === 'yes';
          }
        } else if (Array.isArray(val)) {
          if (val.length > 0 && typeof val[0] === 'string') {
            (newFormData as any)[targetField] = val.filter(s => availableSkills.includes(s));
          }
        } else if (typeof val === 'string' && val.trim() !== '') {
          (newFormData as any)[targetField] = val;
        }
      }
    }
    
    console.log("New formData:", newFormData);
    setFormData(newFormData);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const [castingRes, profileRes, applicationsRes] = await Promise.all([
          projectAPI.getOne(id),
          profileAPI.getMe().catch(() => {
            console.log("profileAPI.getMe() failed");
            return { data: { success: false, data: null } };
          }),
          applicationAPI.getMe().catch(() => {
            console.log("applicationAPI.getMe() failed");
            return { data: { success: false, data: [] } };
          })
        ]);
        console.log("castingRes:", castingRes);
        console.log("profileRes:", profileRes);
        console.log("applicationsRes:", applicationsRes);
        
        if (castingRes.data.success) {
          const data = castingRes.data.data;
          setCasting(data);
          
          // Initialize question answers if there are pre-audition questions
          if (data.pre_audition_questions && Array.isArray(data.pre_audition_questions)) {
            const initialAnswers: Record<string, any> = {};
            data.pre_audition_questions.forEach((q: any) => {
              const qKey = `q-${q.sort_order || Date.now()}`;
              initialAnswers[qKey] = '';
            });
            setQuestionAnswers(initialAnswers);
          }
          
          // If no roleId in URL but there's exactly one role, auto-select it
          if (!initialRoleId && data.roles && data.roles.length === 1) {
            setSelectedRoleId(data.roles[0].id || data.roles[0].roleId || data.roles[0]._id);
          }
        }
        
        // Check for existing applications
        if (applicationsRes.data.success) {
          let appsData: any[] = [];
          if (Array.isArray(applicationsRes.data.data)) {
            appsData = applicationsRes.data.data;
          } else if (applicationsRes.data.data && Array.isArray(applicationsRes.data.data.applications)) {
            appsData = applicationsRes.data.data.applications;
          }

          // Check if user has already applied to this casting/project
          const existingApp = appsData.find((app: any) => {
            // Check if castingCallId or projectId matches
            const castingIdMatch = 
              app.castingCallId?._id === id || 
              app.castingCallId?.id === id ||
              app.castingCallId === id;
              
            const projectIdMatch = 
              app.projectId?._id === id || 
              app.projectId?.id === id ||
              app.projectId === id ||
              app.project?._id === id ||
              app.project?.id === id;
              
            return castingIdMatch || projectIdMatch;
          });
          
          if (existingApp) {
            setHasExistingApplication(true);
          }
        }
        
        if (profileRes.data.success && profileRes.data.data) {
          console.log("Setting userProfile to:", profileRes.data.data);
          const profile = profileRes.data.data;
          setUserProfile(profile);
          
          // Extract skills from profile and add to available skills
          const getProfileSkills = () => {
            const flatData: Record<string, any> = {};
            const flatten = (obj: any) => {
              if (!obj || typeof obj !== 'object') return;
              Object.entries(obj).forEach(([k, v]) => {
                if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
                  flatten(v);
                } else {
                  if (v !== undefined && v !== null && v !== "") {
                    flatData[k] = v;
                  }
                }
              });
            };
            flatten(profile);
            
            const unified = isProfessional ? (profile.unifiedProfessionalProfile || {}) : (profile.unifiedTalentProfile || {});
            const skillKeysToCheck = isProfessional 
              ? ['skills', 'specialties', 'services', 'coachingSpecialities']
              : ['skills', 'coreSkills', 'core_skills', 'actor_special_skills', 'special_skills'];
            
            let profileSkills: string[] = [];
            for (const key of skillKeysToCheck) {
              const val = unified[key] || flatData[key];
              if (Array.isArray(val)) {
                profileSkills = [...profileSkills, ...val];
              } else if (typeof val === 'string' && val.trim()) {
                profileSkills.push(val.trim());
              }
            }
            return profileSkills;
          };
          
          const profileSkills = getProfileSkills();
          console.log("Profile skills found:", profileSkills);
          
          const baseSkills = isProfessional ? [
            "Photography", "Makeup & Hair", "Coaching / Training", "Video Editing", "Fashion Styling", "Lighting", "Sound Design", "Production Assistant"
          ] : [
            "Acting", "Voice over", "Modeling", "Dancing", "Stunts", "Presenting", "Singing", "Comedy"
          ];

          const uniqueCombinedSkills = [...new Set([
            ...baseSkills,
            ...profileSkills
          ])];
          setAvailableSkills(uniqueCombinedSkills as string[]);
          
          // Auto-fill form with profile data if no existing application
          if (castingRes.data.success && !hasExistingApplication) {
            useProfileData(profile);
          }
        }
      } catch (error: any) {
        console.error("fetchData error:", error);
        toast.error("Failed to load details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        location_override: user.location || prev.location_override
      }));
    }
  }, [user]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleHeadshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setHeadshotFile(e.target.files[0]);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  const handleAutoFill = () => {
    setFormData({
      cover_message: "Hello, I am extremely interested in this project and believe I would be a great fit. I have reviewed the requirements and my background aligns perfectly.",
      why_suitable: "I have 5 years of professional experience in similar genres and a strong passion for the subject matter explored in this production.",
      relevant_experience: "Lead role in 'The Wanderer' (2022), Supporting in 'City Lights' (2023). Trained at the National Conservatory for Dramatic Arts.",
      skills: ["Acting", "Voice over", "Presenting"],
      showreel_url: "https://youtube.com/watch?v=mockreel",
      portfolio_links: "https://instagram.com/mocktalent",
      height: "5'9\"",
      age_range: "20-30",
      location_override: user?.location || "London, UK",
      availability_date: new Date().toISOString().split('T')[0],
      willing_to_travel: true,
      compensation_expectation: "Standard union rate / Negotiable",
      legal_consent: true,
      previous_work_links: "https://vimeo.com/mockwork",
      additional_notes: "Looking forward to the opportunity to audition in person!"
    });
  };

  const handleSubmit = async () => {
    if (!id) return;
    
    // Validation
    if (!formData.cover_message.trim()) return toast.error("Cover Message is required");
    if (!formData.why_suitable.trim()) return toast.error("Please explain why you are suitable");
    if (!formData.relevant_experience.trim()) return toast.error("Relevant Experience is required");
    if (formData.skills.length === 0) return toast.error("Please select at least one skill");
    if (!headshotFile && !useProfileHeadshot) {
      return toast.error(isProfessional ? "Please upload a logo/photo or select your profile picture" : "Please upload a headshot or select your profile picture");
    }
    
    const isProjectPipeline = !!(casting?.roles && casting.roles.length > 0);
    if (isProjectPipeline && !selectedRoleId) {
      return toast.error("Please select a role to apply for");
    }

    if (!formData.legal_consent) return toast.error("You must agree to the application terms");
    
    // Validate required pre-audition questions
    if (casting?.pre_audition_questions) {
      for (const question of casting.pre_audition_questions) {
        if (question.required) {
          const qKey = `q-${question.sort_order || 0}`;
          const answer = questionAnswers[qKey];
          if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
            return toast.error(`Please answer the question: ${question.title}`);
          }
        }
      }
    }

    setIsSubmitting(true);

    try {
      // Upload Headshot or use Profile Picture
      let headshotUrl = "";
      if (useProfileHeadshot && user?.profilePicture) {
        headshotUrl = user.profilePicture;
      } else if (headshotFile) {
        const headshotData = new FormData();
        headshotData.append("image", headshotFile);
        const headshotRes = await uploadAPI.uploadImage(headshotData);
        headshotUrl = headshotRes.data?.data?.url || headshotRes.data?.url;
      }

      if (!headshotUrl && useProfileHeadshot) {
        // Fallback to placeholder if they checked it but somehow it's empty (though shouldn't happen)
        headshotUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.fullName || "User");
      } else if (!headshotUrl) {
        setIsSubmitting(false);
        return toast.error("Headshot upload failed. Please try again.");
      }

      // Upload Media if exists
      let mediaUrl = "";
      if (mediaFile) {
        const mediaData = new FormData();
        mediaData.append("image", mediaFile);
        const mediaRes = await uploadAPI.uploadImage(mediaData);
        mediaUrl = mediaRes.data?.data?.url || mediaRes.data?.url;
      }

      const metaData = {
        ...formData,
        headshotUrl,
        mediaUrl,
        preAuditionAnswers: questionAnswers
      };

      const finalNotes = formData.additional_notes + "\n__META__:" + JSON.stringify(metaData);

      let response;

      if (isProjectPipeline && selectedRoleId !== "general") {
        if (!selectedRoleId) {
          setIsSubmitting(false);
          return toast.error("Please select a role to apply for");
        }
        
        response = await projectAPI.applyToRole(id, selectedRoleId, {
          ...metaData,
          notes: finalNotes,
          auditionVideo: mediaUrl,
          auditionVideoUrl: mediaUrl,
        });
      } else {
        // It's a standard casting call
        response = await applicationAPI.create({
          castingCallId: id,
          ...metaData,
          notes: finalNotes,
          auditionVideo: mediaUrl,
          auditionVideoUrl: mediaUrl,
        });
      }

      if (response.data.success) {
        toast.success("Application submitted successfully!");
        navigate("/talent/applications");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application");
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

  if (!casting) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Casting call not found.</p>
        <Button variant="link" asChild>
          <Link to="/talent/browse-cast">Back to browse</Link>
        </Button>
      </div>
    );
  }

  if (hasExistingApplication) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
        <Link 
          to={`/talent/browse-cast/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Casting Call
        </Link>
        
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-2xl font-bold mb-2">You've already applied!</h2>
            <p className="text-muted-foreground mb-6">
              You have already submitted an application for this casting call.
            </p>
            <Button asChild>
              <Link to="/talent/submissions">
                View Deliverables
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
      <Link 
        to={`/talent/browse-cast/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Casting Call
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{isProfessional ? "Professional Service Proposal" : "Talent Application Form"}</h1>
          <p className="text-muted-foreground">{isProfessional ? "Submit your proposal and portfolio details to the Casting Director." : "Submit your application and portfolio for this role."}</p>
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

      {/* Casting Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <img 
              src={casting.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=200"} 
              alt={casting.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-lg">{casting.title}</h3>
              <p className="text-sm text-muted-foreground">{casting.postedBy?.fullName || "Casting Director"}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{casting.category}</Badge>
                <span className="text-sm text-muted-foreground">{formatLocation(casting.location)}</span>
              </div>
            </div>
          </div>

          {casting.roles && casting.roles.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <Label className="text-base mb-3 block">Which role are you applying for? <span className="text-red-500">*</span></Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="w-full sm:w-[400px]">
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general" className="font-semibold text-primary">
                    General Submission (No specific role)
                  </SelectItem>
                  {casting.roles.map((role: any) => {
                    const roleIdentifier = role.id || role.roleId || role._id;
                    return (
                      <SelectItem key={roleIdentifier} value={roleIdentifier}>
                        {role.role_name || role.name || role.title || "Unnamed Role"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Talent Profile Info */}
      {user && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 flex items-center gap-4">
            <img 
              src={user.profilePicture || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.fullName)} 
              alt={user.fullName}
              className="w-12 h-12 rounded-full object-cover border bg-background"
            />
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Applying as</p>
              <h3 className="font-semibold text-base leading-none">{user.fullName}</h3>
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section A: Core Message */}
      <Card>
        <CardHeader>
          <CardTitle>{isProfessional ? "A. Core Proposal Message" : "A. Core Application Message"}</CardTitle>
          <CardDescription>{isProfessional ? "Introduce your services and proposal" : "Introduce yourself professionally"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{isProfessional ? "Proposal Cover Message" : "Cover Message / Introduction"} <span className="text-red-500">*</span></Label>
            <Textarea 
              placeholder={isProfessional ? "Describe your service proposal for this project..." : "e.g. I believe I am a strong fit for this role because..."}
              value={formData.cover_message}
              onChange={(e) => handleChange("cover_message", e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section B: Role Specific Response */}
      <Card>
        <CardHeader>
          <CardTitle>{isProfessional ? "B. Project Suitability" : "B. Role-Specific Response"}</CardTitle>
          <CardDescription>{isProfessional ? "Tell the Casting Director why you are the perfect choice." : "Tell the Casting Director why you are the perfect fit."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{isProfessional ? "Why are you suitable for this project?" : "Why are you suitable for this role?"} <span className="text-red-500">*</span></Label>
            <Textarea 
              placeholder={isProfessional ? "Detail your professional expertise matching this project..." : "Detail your specific attributes or background that match this role..."}
              value={formData.why_suitable}
              onChange={(e) => handleChange("why_suitable", e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>{isProfessional ? "Relevant Professional Experience" : "Relevant Experience"} <span className="text-red-500">*</span></Label>
            <Textarea 
              placeholder={isProfessional ? "Previous clients, bookings, portfolio work..." : "Previous roles, productions worked on, years of experience..."}
              value={formData.relevant_experience}
              onChange={(e) => handleChange("relevant_experience", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section C: Skills */}
      <Card>
        <CardHeader>
          <CardTitle>C. Skills & Attributes</CardTitle>
          <CardDescription>Select the skills that apply to you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Skills Selection <span className="text-red-500">*</span></Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant={formData.skills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer text-sm py-1.5 px-3"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section D: Media Submission */}
      <Card>
        <CardHeader>
          <CardTitle>{isProfessional ? "D. Portfolio & Media Submission" : "D. Media Submission"}</CardTitle>
          <CardDescription>{isProfessional ? "Upload your business logo, professional photo, and work samples" : "Upload your headshot and portfolio media"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{isProfessional ? "Professional Photo / Business Logo" : "Headshot"} <span className="text-red-500">*</span></Label>
            
            {user && (
              <div className="flex items-center space-x-2 mt-2 mb-4">
                <Checkbox 
                  id="use-profile-headshot" 
                  checked={useProfileHeadshot}
                  onCheckedChange={(checked) => {
                    setUseProfileHeadshot(!!checked);
                    if (checked) setHeadshotFile(null);
                  }}
                />
                <label
                  htmlFor="use-profile-headshot"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {isProfessional ? "Use my profile picture as professional photo" : "Use my profile picture as headshot"}
                </label>
              </div>
            )}

            {useProfileHeadshot ? (
              <div className="border border-border rounded-xl p-4 flex items-center gap-4 bg-muted/20">
                <img 
                  src={user?.profilePicture || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.fullName || "User")} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-lg object-cover" 
                />
                <div>
                  <p className="font-medium text-sm">Using Profile Picture</p>
                  <p className="text-xs text-muted-foreground">{isProfessional ? "This image will be submitted as your professional photo." : "This image will be submitted as your headshot."}</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/20">
                {headshotFile ? (
                  <div className="space-y-2">
                    <ImageIcon className="w-8 h-8 mx-auto text-success" />
                    <p className="font-medium text-sm">{headshotFile.name}</p>
                    <Button variant="outline" size="sm" onClick={() => setHeadshotFile(null)}>Change</Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="font-medium text-sm">{isProfessional ? "Upload Logo / Photo" : "Upload Headshot"}</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG or PNG</p>
                    <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleHeadshotChange} />
                  </label>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>{isProfessional ? "Showcase Work / Portfolio Item (Optional)" : "Showreel / Portfolio Media (Optional)"}</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/20">
              {mediaFile ? (
                <div className="space-y-2">
                  <File className="w-8 h-8 mx-auto text-success" />
                  <p className="font-medium text-sm">{mediaFile.name}</p>
                  <Button variant="outline" size="sm" onClick={() => setMediaFile(null)}>Change</Button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Video className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium text-sm">{isProfessional ? "Upload Portfolio Media" : "Upload Video/Media"}</p>
                  <input type="file" accept="video/*,image/*,application/pdf" className="hidden" onChange={handleMediaChange} />
                </label>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{isProfessional ? "Portfolio Video URL (Optional)" : "Showreel Video URL (Optional)"}</Label>
            <Input 
              placeholder="YouTube, Vimeo, etc." 
              value={formData.showreel_url}
              onChange={(e) => handleChange("showreel_url", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Additional Portfolio Links (Optional)</Label>
            <Input 
              placeholder="IMDb, Instagram, personal website" 
              value={formData.portfolio_links}
              onChange={(e) => handleChange("portfolio_links", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section E: Logistics */}
      <Card>
        <CardHeader>
          <CardTitle>{isProfessional ? "E. Logistics & Business Details" : "E. Physical Attributes & Logistics"}</CardTitle>
          <CardDescription>{isProfessional ? "Basic operational details required for casting" : "Basic details required for casting"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isProfessional && (
              <>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input 
                    placeholder="e.g. 5'9'' or 175cm" 
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <Input 
                    placeholder="e.g. 20-25" 
                    value={formData.age_range}
                    onChange={(e) => handleChange("age_range", e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>{isProfessional ? "Business Location / Base" : "Location"}</Label>
              <Input 
                placeholder={isProfessional ? "e.g. London, UK" : "Current city"} 
                value={formData.location_override}
                onChange={(e) => handleChange("location_override", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{isProfessional ? "Earliest Available Date" : "Availability Date"}</Label>
              <Input 
                type="date"
                value={formData.availability_date}
                onChange={(e) => handleChange("availability_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{isProfessional ? "Rate / Quote Expectation" : "Compensation Expectation"}</Label>
              <Input 
                placeholder={isProfessional ? "e.g. £500/day, Negotiable" : "Fixed, Negotiable, Rate per day..."} 
                value={formData.compensation_expectation}
                onChange={(e) => handleChange("compensation_expectation", e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">{isProfessional ? "Willingness to Travel for On-site Work" : "Willingness to Travel"}</Label>
              <p className="text-sm text-muted-foreground">{isProfessional ? "Are you willing to travel to project locations?" : "Are you willing to travel for this role?"}</p>
            </div>
            <Switch 
              checked={formData.willing_to_travel}
              onCheckedChange={(c) => handleChange("willing_to_travel", c)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pre-audition Questions */}
      {casting?.pre_audition_questions && casting.pre_audition_questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>F. Pre-Audition Questions</CardTitle>
            <CardDescription>Please answer the following questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {casting.pre_audition_questions.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((question: any, index: number) => {
              const qKey = `q-${question.sort_order || index}`;
              return (
                <div key={qKey} className="space-y-2">
                  <Label>{question.title}{question.required ? <span className="text-red-500 ml-1">*</span> : ''}</Label>
                  {question.help_text && (
                    <p className="text-sm text-muted-foreground">{question.help_text}</p>
                  )}
                  
                  {/* Render question based on type */}
                  {question.type?.toLowerCase() === 'yes/no' || question.type?.toLowerCase() === 'yes / no' ? (
                    <div className="flex items-center gap-3">
                      <Button 
                        variant={questionAnswers[qKey] === 'Yes' ? 'default' : 'outline'}
                        onClick={() => setQuestionAnswers(prev => ({ ...prev, [qKey]: 'Yes' }))}
                      >
                        Yes
                      </Button>
                      <Button 
                        variant={questionAnswers[qKey] === 'No' ? 'default' : 'outline'}
                        onClick={() => setQuestionAnswers(prev => ({ ...prev, [qKey]: 'No' }))}
                      >
                        No
                      </Button>
                    </div>
                  ) : question.type?.toLowerCase() === 'select' && question.options?.length > 0 ? (
                    <Select 
                      value={questionAnswers[qKey] || ''} 
                      onValueChange={(val) => setQuestionAnswers(prev => ({ ...prev, [qKey]: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((option: string, optIdx: number) => (
                          <SelectItem key={optIdx} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Textarea 
                      placeholder="Your answer..."
                      value={questionAnswers[qKey] || ''}
                      onChange={(e) => setQuestionAnswers(prev => ({ ...prev, [qKey]: e.target.value }))}
                      rows={3}
                    />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Section G & H: Legal & Optional */}
      <Card>
        <CardHeader>
          <CardTitle>H. Support Data & Legal Consent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Previous Work Links</Label>
            <Textarea 
              placeholder="Paste URLs to previous work..."
              value={formData.previous_work_links}
              onChange={(e) => handleChange("previous_work_links", e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Notes to Casting Director</Label>
            <Textarea 
              placeholder="Any other information..."
              value={formData.additional_notes}
              onChange={(e) => handleChange("additional_notes", e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-start space-x-3 pt-4 border-t border-border">
            <Checkbox 
              id="legal_consent"
              checked={formData.legal_consent}
              onCheckedChange={(c) => handleChange("legal_consent", !!c)}
            />
            <div className="space-y-1 leading-none">
              <label htmlFor="legal_consent" className="text-sm font-medium leading-none cursor-pointer">
                I confirm that all information provided is accurate
              </label>
              <p className="text-sm text-muted-foreground">
                I agree to the Castglo application terms and conditions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        className="w-full text-lg h-14 font-semibold" 
        onClick={handleSubmit} 
        disabled={isSubmitting || !formData.legal_consent}
      >
        {isSubmitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        Submit Application
      </Button>
    </div>
  );
}
