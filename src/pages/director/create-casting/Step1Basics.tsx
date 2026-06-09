import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PROJECT_TYPES, INDUSTRY_AREAS, GENRES } from "./constants";
import { CastingFormData } from "./types";

interface Step1BasicsProps {
  formData: CastingFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<CastingFormData>>;
}

export default function Step1Basics({
  formData,
  handleChange,
  handleSelectChange,
  setFormData,
}: Step1BasicsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
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
  );
}
