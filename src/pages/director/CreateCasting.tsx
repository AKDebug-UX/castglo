import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";

export default function CreateCasting() {
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
        <h1 className="text-2xl font-bold">Create Casting Call</h1>
        <p className="text-muted-foreground">Post a new casting opportunity to discover amazing talent</p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <p className="text-sm text-muted-foreground">Provide the essential details for your casting call</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Title *</label>
            <Input placeholder="e.g., Lead Role - Indie Drama" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <Textarea 
              rows={4}
              placeholder="Describe the role, project and what you're looking for in talent..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Requirements</label>
            <Textarea 
              rows={3}
              placeholder="Specific skills, experience, or attributes required"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Genre</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
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
              <Input placeholder="e.g., Los Angeles, CA or Remote" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Application Deadline *</label>
            <Input type="date" />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Options</CardTitle>
          <p className="text-sm text-muted-foreground">Configure additional features for your casting call</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium">Enable Public Voting</p>
              <p className="text-sm text-muted-foreground">Allow the public to vote on submissions to help with selection</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium">Escrow Prize</p>
              <p className="text-sm text-muted-foreground">Set up an escrow prize that will be automatically awarded to the selected talent</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <p className="text-sm text-muted-foreground">How your casting call will appear to talent</p>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <h3 className="font-semibold text-lg">Your Casting Call Title</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Deadline
              </span>
            </div>
            <p className="mt-3 text-muted-foreground">Your casting call description will appear here...</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" size="lg">Save as draft</Button>
        <Button size="lg">Create Casting Call</Button>
      </div>
    </div>
  );
}
