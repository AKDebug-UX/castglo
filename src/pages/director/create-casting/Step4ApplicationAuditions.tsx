import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AUDITION_TYPES } from "./constants";
import { CastingFormData } from "./types";

interface Step4ApplicationAuditionsProps {
  formData: CastingFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<CastingFormData>>;
}

export default function Step4ApplicationAuditions({
  formData,
  handleChange,
  handleSelectChange,
  setFormData,
}: Step4ApplicationAuditionsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Section 5: Define how and when talent can apply.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="application_deadline">Application Deadline *</Label>
              <Input 
                id="application_deadline" 
                name="application_deadline"
                type="date" 
                required 
                value={formData.application_deadline}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="who_can_apply">Who Can Apply? *</Label>
              <Select value={formData.who_can_apply} onValueChange={(v) => handleSelectChange("who_can_apply", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Anyone on Castglo">Anyone on Castglo</SelectItem>
                  <SelectItem value="Invited Talent Only">Invited Talent Only</SelectItem>
                  <SelectItem value="Represented Talent Only">Represented Talent Only</SelectItem>
                  <SelectItem value="Specific Talent Type Only">Specific Talent Type Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Switch id="accept_until_role_filled" checked={formData.accept_until_role_filled} onCheckedChange={(c) => setFormData(p => ({...p, accept_until_role_filled: c}))} />
              <Label htmlFor="accept_until_role_filled">Accept until role is filled?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="invite_only" checked={formData.invite_only} onCheckedChange={(c) => setFormData(p => ({...p, invite_only: c}))} />
              <Label htmlFor="invite_only">Is Application by Invite Only?</Label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Switch id="direct_invitations_enabled" checked={formData.direct_invitations_enabled} onCheckedChange={(c) => setFormData(p => ({...p, direct_invitations_enabled: c}))} />
              <Label htmlFor="direct_invitations_enabled">Are direct invitations enabled?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="castglo_matches_enabled" checked={formData.castglo_matches_enabled} onCheckedChange={(c) => setFormData(p => ({...p, castglo_matches_enabled: c}))} />
              <Label htmlFor="castglo_matches_enabled">Enable Castglo Matches?</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audition Settings</CardTitle>
          <CardDescription>Section 6: Audition and interview process details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch id="audition_required" checked={formData.audition_required} onCheckedChange={(c) => setFormData(p => ({...p, audition_required: c}))} />
            <Label htmlFor="audition_required">Is an audition required? *</Label>
          </div>

          {formData.audition_required && (
            <div className="space-y-6 pt-4 animate-fade-in">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="audition_type">Audition Type</Label>
                  <Select value={formData.audition_type} onValueChange={(v) => handleSelectChange("audition_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AUDITION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audition_date">Audition Date</Label>
                  <Input type="date" id="audition_date" name="audition_date" value={formData.audition_date} onChange={handleChange} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="callback_date">Callback Date</Label>
                  <Input type="date" id="callback_date" name="callback_date" value={formData.callback_date} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audition_location">Audition Location</Label>
                  <Input id="audition_location" name="audition_location" value={formData.audition_location} onChange={handleChange} placeholder="e.g. Studio A, Online" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audition_instructions">Audition Instructions</Label>
                <Textarea id="audition_instructions" name="audition_instructions" value={formData.audition_instructions} onChange={handleChange} rows={3} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch id="self_tape_accepted" checked={formData.self_tape_accepted} onCheckedChange={(c) => setFormData(p => ({...p, self_tape_accepted: c}))} />
                  <Label htmlFor="self_tape_accepted">Self-Tape Accepted?</Label>
                </div>
                {formData.self_tape_accepted && (
                  <div className="space-y-2">
                    <Label htmlFor="self_tape_deadline">Self-Tape Deadline</Label>
                    <Input type="date" id="self_tape_deadline" name="self_tape_deadline" value={formData.self_tape_deadline} onChange={handleChange} />
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center space-x-2">
            <Switch id="interview_required" checked={formData.interview_required} onCheckedChange={(c) => setFormData(p => ({...p, interview_required: c}))} />
            <Label htmlFor="interview_required">Interview Required?</Label>
          </div>

          {formData.interview_required && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="interview_format">Interview Format</Label>
              <Select value={formData.interview_format} onValueChange={(v) => handleSelectChange("interview_format", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-person">In-person</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="To Be Confirmed">To Be Confirmed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
