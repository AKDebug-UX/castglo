import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon } from "lucide-react";
import { CastingFormData } from "./types";

interface Step5MediaRequirementsProps {
  formData: CastingFormData;
  selectedImage: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<CastingFormData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function Step5MediaRequirements({
  formData,
  selectedImage,
  handleImageChange,
  handleSelectChange,
  setFormData,
  handleChange,
}: Step5MediaRequirementsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Project Media</CardTitle>
          <CardDescription>Section 8: Upload assets related to the production.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Project Poster / Cover Image *</Label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition-colors cursor-pointer relative group">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
              {selectedImage || formData.project_cover_image ? (
                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden max-w-2xl">
                  <img src={selectedImage || formData.project_cover_image || ""} alt="Project Header" className="w-full h-full object-cover" />
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
  );
}
