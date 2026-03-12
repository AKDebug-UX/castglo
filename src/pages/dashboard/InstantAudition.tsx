import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Info, Loader2, Globe, Lock, Users as UsersIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { livestreamAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function InstantAudition() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "audition",
    isRecordingEnabled: true,
    isPublic: true,
    scheduledDate: "",
    scheduledTime: "",
    invitedTalents: [] as string[],
  });

  const [talentEmail, setTalentEmail] = useState("");

  const addTalent = () => {
    if (talentEmail && !formData.invitedTalents.includes(talentEmail)) {
      setFormData({ ...formData, invitedTalents: [...formData.invitedTalents, talentEmail] });
      setTalentEmail("");
    }
  };

  const removeTalent = (email: string) => {
    setFormData({ ...formData, invitedTalents: formData.invitedTalents.filter(t => t !== email) });
  };

  const handleCreate = async () => {
    if (!formData.title) {
      toast.error("Please enter an audition title");
      return;
    }

    setIsLoading(true);
    try {
      const response = await livestreamAPI.create(formData);
      if (response.data.success) {
        toast.success("Virtual audition created successfully!");
        // Redirect back to the livestreams list
        navigate(user?.role === "talent" ? "/dashboard/livestreams" : "/director/livestreams");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create audition");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link 
        to={user?.role === "talent" ? "/dashboard/livestreams" : "/director/livestreams"}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Livestreams
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Create Virtual Audition</h1>
        <p className="text-muted-foreground">Set up and schedule a virtual audition session with casting directors or industry professionals</p>
      </div>

      {/* Audition Details */}
      <Card>
        <CardHeader>
          <CardTitle>Audition Details</CardTitle>
          <p className="text-sm text-muted-foreground">Provide information about your virtual audition session</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Audition Title *</label>
            <Input 
              placeholder="e.g., Monologue Performance - Shakespeare" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <Textarea 
              rows={3}
              placeholder="Describe what you'll be performing and any special requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Date</label>
              <Input 
                type="date" 
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Time</label>
              <Input 
                type="time" 
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium block">Privacy Settings</label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.isPublic ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                onClick={() => setFormData({ ...formData, isPublic: true })}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.isPublic ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">Public</p>
                  <p className="text-[10px] text-muted-foreground">Visible to everyone</p>
                </div>
              </div>
              <div 
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${!formData.isPublic ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                onClick={() => setFormData({ ...formData, isPublic: false })}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!formData.isPublic ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">Private</p>
                  <p className="text-[10px] text-muted-foreground">Invitation only</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium block">Invite Talents</label>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter talent email address" 
                value={talentEmail}
                onChange={(e) => setTalentEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTalent())}
              />
              <Button type="button" onClick={addTalent} variant="secondary">
                Invite
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.invitedTalents.map(email => (
                <Badge key={email} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1 gap-2 border-none">
                  {email}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTalent(email)} />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Category</label>
            <Select 
              value={formData.category} 
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audition">Audition</SelectItem>
                <SelectItem value="masterclass">Masterclass</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium">Enable Recording</p>
              <p className="text-sm text-muted-foreground">Automatically record this session for later review</p>
            </div>
            <Switch 
              checked={formData.isRecordingEnabled} 
              onCheckedChange={(checked) => setFormData({ ...formData, isRecordingEnabled: checked })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Upload Audition Script/Materials</label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <span className="text-sm text-muted-foreground">No file chosen</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Upload scripts, sides, or other materials for participants (PDF, DOC, DOCX, TXT)</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          className="flex-1" 
          size="lg" 
          onClick={handleCreate} 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create Virtual Audition
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")}>Cancel</Button>
      </div>

      {/* Tips */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4" />
            Tips for a Successful Virtual Audition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Test your audio and video setup before the scheduled time</li>
            <li>• Choose a quiet, well-lit location with a neutral background</li>
            <li>• Have your materials ready and rehearsed</li>
            <li>• Send calendar invites to participants after creating the audition</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
