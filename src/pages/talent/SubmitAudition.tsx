import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload, Loader2, File, Image as ImageIcon, Video, Zap } from "lucide-react";
import { castingCallAPI, applicationAPI, uploadAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatLocation } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const SKILLS_LIST = [
  "Acting", "Voice over", "Modeling", "Dancing", "Stunts", "Presenting", "Singing", "Comedy"
];

export default function SubmitAudition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [casting, setCasting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCasting = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const response = await castingCallAPI.getOne(id);
        if (response.data.success) {
          setCasting(response.data.data);
        }
      } catch (error: any) {
        toast.error("Failed to load casting details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCasting();
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
    if (!headshotFile) return toast.error("Please upload a headshot");
    if (!formData.legal_consent) return toast.error("You must agree to the application terms");

    setIsSubmitting(true);

    try {
      // Upload Headshot
      const headshotData = new FormData();
      headshotData.append("image", headshotFile);
      const headshotRes = await uploadAPI.uploadImage(headshotData);
      const headshotUrl = headshotRes.data?.data?.url || headshotRes.data?.url;

      if (!headshotUrl) {
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
        mediaUrl
      };

      const finalNotes = formData.additional_notes + "\n__META__:" + JSON.stringify(metaData);

      const response = await applicationAPI.create({
        castingCallId: id,
        notes: finalNotes,
        auditionVideo: mediaUrl,
        auditionVideoUrl: mediaUrl,
      });

      if (response.data.success) {
        toast.success("Application submitted successfully!");
        navigate("/talent/submissions");
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
          <h1 className="text-3xl font-bold">Talent Application Form</h1>
          <p className="text-muted-foreground">Submit your application and portfolio for this role.</p>
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
          <CardTitle>A. Core Application Message</CardTitle>
          <CardDescription>Introduce yourself professionally</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cover Message / Introduction <span className="text-red-500">*</span></Label>
            <Textarea 
              placeholder="e.g. I believe I am a strong fit for this role because..."
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
          <CardTitle>B. Role-Specific Response</CardTitle>
          <CardDescription>Tell the Casting Director why you are the perfect fit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Why are you suitable for this role? <span className="text-red-500">*</span></Label>
            <Textarea 
              placeholder="Detail your specific attributes or background that match this role..."
              value={formData.why_suitable}
              onChange={(e) => handleChange("why_suitable", e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Relevant Experience <span className="text-red-500">*</span></Label>
            <Textarea 
              placeholder="Previous roles, productions worked on, years of experience..."
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
              {SKILLS_LIST.map((skill) => (
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
          <CardTitle>D. Media Submission</CardTitle>
          <CardDescription>Upload your headshot and portfolio media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Headshot <span className="text-red-500">*</span></Label>
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
                  <p className="font-medium text-sm">Upload Headshot</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG or PNG</p>
                  <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleHeadshotChange} />
                </label>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Showreel / Portfolio Media (Optional)</Label>
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
                  <p className="font-medium text-sm">Upload Video/Media</p>
                  <input type="file" accept="video/*,image/*,application/pdf" className="hidden" onChange={handleMediaChange} />
                </label>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Showreel Video URL (Optional)</Label>
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
          <CardTitle>E. Physical Attributes & Logistics</CardTitle>
          <CardDescription>Basic details required for casting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label>Location</Label>
              <Input 
                placeholder="Current city" 
                value={formData.location_override}
                onChange={(e) => handleChange("location_override", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Availability Date</Label>
              <Input 
                type="date"
                value={formData.availability_date}
                onChange={(e) => handleChange("availability_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Compensation Expectation</Label>
              <Input 
                placeholder="Fixed, Negotiable, Rate per day..." 
                value={formData.compensation_expectation}
                onChange={(e) => handleChange("compensation_expectation", e.target.value)}
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Willingness to Travel</Label>
              <p className="text-sm text-muted-foreground">Are you willing to travel for this role?</p>
            </div>
            <Switch 
              checked={formData.willing_to_travel}
              onCheckedChange={(c) => handleChange("willing_to_travel", c)}
            />
          </div>
        </CardContent>
      </Card>

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
