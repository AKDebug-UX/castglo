import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TALENT_TYPES } from "./constants";
import { CastingFormData } from "./types";

interface Step2TalentNeededProps {
  formData: CastingFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<CastingFormData>>;
}

export default function Step2TalentNeeded({
  formData,
  handleChange,
  handleSelectChange,
  setFormData,
}: Step2TalentNeededProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Talent Needed</CardTitle>
          <CardDescription>Section 3: High-level requirements for the talent pool.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Talent Types Needed *</Label>
            <div className="flex flex-wrap gap-2">
              {TALENT_TYPES.map(t => (
                <Badge 
                  key={t} 
                  variant={formData.talent_types_needed?.includes(t) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    const newTypes = formData.talent_types_needed?.includes(t) 
                      ? formData.talent_types_needed.filter(i => i !== t)
                      : [...(formData.talent_types_needed || []), t];
                    handleSelectChange("talent_types_needed", newTypes);
                  }}
                >
                  {t.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role_scope">Is this for a single role or multiple roles? *</Label>
              <Select value={formData.role_scope} onValueChange={(v) => handleSelectChange("role_scope", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single Role">Single Role</SelectItem>
                  <SelectItem value="Multiple Roles">Multiple Roles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_number_of_roles">Total Number of Roles</Label>
              <Input type="number" id="total_number_of_roles" name="total_number_of_roles" value={formData.total_number_of_roles} onChange={handleChange} min="1" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Switch id="open_to_mixed_talent_categories" checked={formData.open_to_mixed_talent_categories} onCheckedChange={(c) => setFormData(p => ({...p, open_to_mixed_talent_categories: c}))} />
              <Label htmlFor="open_to_mixed_talent_categories">Open to mixed talent categories?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="child_talent_involved" checked={formData.child_talent_involved} onCheckedChange={(c) => setFormData(p => ({...p, child_talent_involved: c}))} />
              <Label htmlFor="child_talent_involved">Child Talent Involved?</Label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Switch id="represented_talent_only" checked={formData.represented_talent_only} onCheckedChange={(c) => setFormData(p => ({...p, represented_talent_only: c}))} />
              <Label htmlFor="represented_talent_only">Open to represented talent only?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="open_to_unrepresented_talent" checked={formData.open_to_unrepresented_talent} onCheckedChange={(c) => setFormData(p => ({...p, open_to_unrepresented_talent: c}))} />
              <Label htmlFor="open_to_unrepresented_talent">Open to unrepresented talent?</Label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="talent_location_scope">Talent Location Scope *</Label>
              <Select value={formData.talent_location_scope} onValueChange={(v) => handleSelectChange("talent_location_scope", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local Only">Local Only</SelectItem>
                  <SelectItem value="Nationwide">Nationwide</SelectItem>
                  <SelectItem value="International">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_talent_base">Preferred Talent Base</Label>
              <Input id="preferred_talent_base" name="preferred_talent_base" value={formData.preferred_talent_base} onChange={handleChange} placeholder="e.g. London, New York" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
