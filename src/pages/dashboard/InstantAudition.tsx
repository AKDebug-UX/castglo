import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Info } from "lucide-react";

export default function InstantAudition() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link 
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
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
            <Input placeholder="e.g., Monologue Performance - Shakespeare" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <Textarea 
              rows={3}
              placeholder="Describe what you'll be performing and any special requirements..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Date</label>
              <Input type="date" placeholder="DD/MM/YY" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Time</label>
              <Input type="time" placeholder="--:--" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Duration</label>
            <Select defaultValue="30">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium">Public Audition</p>
              <p className="text-sm text-muted-foreground">Allow anyone with the link to view this audition</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Participant Limit</label>
            <Select defaultValue="5">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 people</SelectItem>
                <SelectItem value="10">10 people</SelectItem>
                <SelectItem value="20">20 people</SelectItem>
                <SelectItem value="50">50 people</SelectItem>
              </SelectContent>
            </Select>
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
        <Button className="flex-1" size="lg">Create Virtual Audition</Button>
        <Button variant="outline" size="lg">Cancel</Button>
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
