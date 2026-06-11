import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Plus, Trash2, GripVertical } from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";
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
  
  const addQuestion = () => {
    const newQuestion = {
      title: "",
      type: "Text",
      required: true,
      help_text: "",
      options: [],
      sort_order: (formData.pre_audition_questions?.length || 0) + 1
    };
    setFormData(p => ({
      ...p,
      pre_audition_questions: [...(p.pre_audition_questions || []), newQuestion]
    }));
  };
  
  const updateQuestion = (index: number, field: string, value: any) => {
    setFormData(p => {
      const newQuestions = [...(p.pre_audition_questions || [])];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return { ...p, pre_audition_questions: newQuestions };
    });
  };
  
  const removeQuestion = (index: number) => {
    setFormData(p => {
      const newQuestions = [...(p.pre_audition_questions || [])];
      newQuestions.splice(index, 1);
      // Reorder sort_order
      newQuestions.forEach((q, i) => q.sort_order = i + 1);
      return { ...p, pre_audition_questions: newQuestions };
    });
  };
  
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
              {(() => {
                // Determine the best available image source:
                // 1. selectedImage — set when user picks a new file or on edit-mode load
                // 2. formData.project_cover_image — resolveMediaUrl handles https:// and data: URIs
                const imgSrc = selectedImage
                  || (formData.project_cover_image ? resolveMediaUrl(formData.project_cover_image) : "");
                return imgSrc ? (
                  <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden max-w-2xl">
                    <img src={imgSrc} alt="Project Header" className="w-full h-full object-cover" />
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
                );
              })()}
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
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pre-Audition Questions</CardTitle>
            <CardDescription>Add custom questions for applicants to answer.</CardDescription>
          </div>
          <Button onClick={addQuestion} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Question
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {(formData.pre_audition_questions || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No questions added yet. Click "Add Question" to start.
            </div>
          ) : (
            (formData.pre_audition_questions || []).map((question, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label>Question Title</Label>
                      <Input 
                        value={question.title} 
                        onChange={(e) => updateQuestion(index, "title", e.target.value)} 
                        placeholder="e.g., Do you have prior experience in this genre?"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Select 
                          value={question.type} 
                          onValueChange={(val) => updateQuestion(index, "type", val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Text">Text</SelectItem>
                            <SelectItem value="Yes / No">Yes / No</SelectItem>
                            <SelectItem value="Select">Select</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Switch 
                          checked={question.required} 
                          onCheckedChange={(c) => updateQuestion(index, "required", c)} 
                        />
                        <Label>Required</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Help Text (Optional)</Label>
                      <Textarea 
                        value={question.help_text || ''} 
                        onChange={(e) => updateQuestion(index, "help_text", e.target.value)} 
                        placeholder="Add more context or instructions for this question"
                      />
                    </div>
                    {question.type === "Select" && (
                      <div className="space-y-2">
                        <Label>Options (comma separated)</Label>
                        <Input 
                          value={(question.options || []).join(", ")} 
                          onChange={(e) => updateQuestion(index, "options", e.target.value.split(",").map(o => o.trim()).filter(Boolean))} 
                          placeholder="e.g., Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
