import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Calendar, Loader2 } from "lucide-react";
import { castingCallAPI } from "@/lib/api";
import { toast } from "sonner";

export default function CreateCasting() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "film",
    title: "",
    description: "",
    requirements: "",
    category: "drama",
    location: "",
    deadline: "",
    status: "open"
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchCasting = async () => {
        setIsLoading(true);
        try {
          const response = await castingCallAPI.getOne(id);
          if (response.data.success) {
            const data = response.data.data;
            setFormData({
              projectName: data.projectName || "",
              projectType: data.projectType || "film",
              title: data.title || "",
              description: data.description || "",
              requirements: Array.isArray(data.requirements) ? data.requirements.join("\n") : (data.requirements || ""),
              category: data.category || "drama",
              location: data.location || "",
              deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : "",
              status: data.status || "open"
            });
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

  const handleSubmit = async (e: React.FormEvent, status: string = "open") => {
    e.preventDefault();
    if (!formData.title || !formData.deadline || !formData.projectName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const requirementsArray = formData.requirements.split("\n").filter(r => r.trim() !== "");
      
      const payload = {
        ...formData,
        requirements: requirementsArray,
        status: status,
        roles: [{
          roleName: formData.title,
          description: formData.description,
          requirements: requirementsArray
        }]
      };

      let response;
      if (isEditMode) {
        response = await castingCallAPI.update(id, payload);
      } else {
        response = await castingCallAPI.create(payload);
      }

      if (response.data.success) {
        toast.success(isEditMode ? "Casting call updated" : "Casting call created");
        navigate("/director/projects");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save casting call");
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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Link 
        to="/director/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Projects
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit Casting Call" : "Create Casting Call"}</h1>
        <p className="text-muted-foreground">Post a new casting opportunity to discover amazing talent</p>
      </div>

      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <p className="text-sm text-muted-foreground">Provide the essential details for your casting call</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Project Name *</label>
                  <Input 
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder="e.g., The Midnight Echo" 
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Project Type *</label>
                  <Select 
                    value={formData.projectType}
                    onValueChange={(v) => handleSelectChange("projectType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="film">Film</SelectItem>
                      <SelectItem value="tv">TV Series</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="web_series">Web Series</SelectItem>
                      <SelectItem value="theater">Theater</SelectItem>
                      <SelectItem value="music_video">Music Video</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Role Title *</label>
                <Input 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Lead Role - Male (20-30)" 
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the role, project and what you're looking for in talent..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Requirements (one per line)</label>
                <Textarea 
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Specific skills, experience, or attributes required"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <Select 
                    value={formData.category}
                    onValueChange={(v) => handleSelectChange("category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drama">Drama</SelectItem>
                      <SelectItem value="comedy">Comedy</SelectItem>
                      <SelectItem value="thriller">Thriller</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="animation">Animation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Location</label>
                  <Input 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Los Angeles, CA or Remote" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Application Deadline *</label>
                <Input 
                  name="deadline"
                  type="date" 
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options - Mocked for now as backend might not support them yet */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
              <p className="text-sm text-muted-foreground">Configure additional features for your casting call</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border opacity-50">
                <div>
                  <p className="font-medium">Enable Public Voting</p>
                  <p className="text-sm text-muted-foreground">Allow the public to vote on submissions to help with selection</p>
                </div>
                <Switch disabled />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border opacity-50">
                <div>
                  <p className="font-medium">Escrow Prize</p>
                  <p className="text-sm text-muted-foreground">Set up an escrow prize that will be automatically awarded to the selected talent</p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            {!isEditMode && (
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={(e) => handleSubmit(e, "draft")}
                disabled={isSubmitting}
              >
                Save as draft
              </Button>
            )}
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditMode ? "Update Casting Call" : "Create Casting Call"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
