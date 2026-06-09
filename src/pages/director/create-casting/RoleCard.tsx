import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { PAYMENT_TYPES } from "./constants";
import { FormRole } from "@/lib/project.utils";

interface RoleCardProps {
  role: FormRole;
  index: number;
  isOnlyRole: boolean;
  removeRole: (roleId: string) => void;
  handleRoleChange: (roleID: string, field: string, value: any) => void;
}

export default function RoleCard({
  role,
  index,
  isOnlyRole,
  removeRole,
  handleRoleChange,
}: RoleCardProps) {
  return (
    <Card className="border-primary/20 shadow-sm relative overflow-visible">
      {!isOnlyRole && (
        <Button 
          type="button" 
          variant="destructive" 
          size="icon" 
          className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-md z-10"
          onClick={() => removeRole(role.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
      <CardHeader className="bg-slate-50 border-b relative pb-4 rounded-t-xl">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-tl-xl" />
        <CardTitle className="text-lg flex items-center gap-2">
          Role {index + 1}: {role.role_name || "Untitled Role"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">
        {/* ROLE IDENTITY */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Role Identity</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Role Name *</Label>
              <Input 
                value={role.role_name} 
                onChange={(e) => handleRoleChange(role.id, 'role_name', e.target.value)} 
                placeholder="e.g. John Doe" 
              />
            </div>
            <div className="space-y-2">
              <Label>Role Status</Label>
              <Select value={role.role_status} onValueChange={(v) => handleRoleChange(role.id, 'role_status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Cast">Cast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Character / Role Summary *</Label>
            <Textarea 
              value={role.character_role_summary} 
              onChange={(e) => handleRoleChange(role.id, 'character_role_summary', e.target.value)} 
              rows={2} 
              placeholder="20-300 chars" 
            />
          </div>
          <div className="space-y-2">
            <Label>Full Role Description</Label>
            <Textarea 
              value={role.full_role_description} 
              onChange={(e) => handleRoleChange(role.id, 'full_role_description', e.target.value)} 
              rows={4} 
              placeholder="50-4000 chars" 
            />
          </div>
        </div>

        {/* ROLE REQUIREMENTS */}
        <Separator />
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Role Requirements</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Min Age</Label>
              <Input 
                type="number" 
                value={role.minimum_age} 
                onChange={(e) => handleRoleChange(role.id, 'minimum_age', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Max Age</Label>
              <Input 
                type="number" 
                value={role.maximum_age} 
                onChange={(e) => handleRoleChange(role.id, 'maximum_age', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex flex-wrap gap-1">
                {["Male", "Female", "Non-binary", "Any"].map(g => (
                  <Badge 
                    key={g} 
                    variant={role.gender?.includes(g) ? "default" : "outline"}
                    className="cursor-pointer text-[10px]"
                    onClick={() => {
                      const newG = role.gender?.includes(g) ? role.gender.filter(i => i !== g) : [...(role.gender || []), g];
                      handleRoleChange(role.id, 'gender', newG);
                    }}
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Union Status Required</Label>
              <Select value={role.union_status_required} onValueChange={(v) => handleRoleChange(role.id, 'union_status_required', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Union Only">Union Only</SelectItem>
                  <SelectItem value="Non-Union Only">Non-Union Only</SelectItem>
                  <SelectItem value="Open to All">Open to All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience Level Preferred</Label>
              <Select value={role.experience_level_preferred} onValueChange={(v) => handleRoleChange(role.id, 'experience_level_preferred', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`pro_exp_${role.id}`}
                checked={role.professional_experience_required} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'professional_experience_required', !!c)} 
              />
              <Label htmlFor={`pro_exp_${role.id}`} className="text-xs">Pro Experience Req?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`driving_${role.id}`}
                checked={role.driving_licence_required} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'driving_licence_required', !!c)} 
              />
              <Label htmlFor={`driving_${role.id}`} className="text-xs">Driving Licence?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`passport_${role.id}`}
                checked={role.passport_required} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'passport_required', !!c)} 
              />
              <Label htmlFor={`passport_${role.id}`} className="text-xs">Passport?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`travel_${role.id}`}
                checked={role.travel_required} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'travel_required', !!c)} 
              />
              <Label htmlFor={`travel_${role.id}`} className="text-xs">Travel Required?</Label>
            </div>
          </div>
        </div>

        {/* ROLE PERFORMANCE */}
        <Separator />
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Performance Details</h3>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`speaking_${role.id}`}
                checked={role.speaking_role} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'speaking_role', !!c)} 
              />
              <Label htmlFor={`speaking_${role.id}`} className="text-xs">Speaking Role?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`singing_${role.id}`}
                checked={role.singing_required} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'singing_required', !!c)} 
              />
              <Label htmlFor={`singing_${role.id}`} className="text-xs">Singing?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`dancing_${role.id}`}
                checked={role.dancing_required} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'dancing_required', !!c)} 
              />
              <Label htmlFor={`dancing_${role.id}`} className="text-xs">Dancing?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`stunts_${role.id}`}
                checked={role.stunts_required} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'stunts_required', !!c)} 
              />
              <Label htmlFor={`stunts_${role.id}`} className="text-xs">Stunts?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`intimacy_${role.id}`}
                checked={role.intimacy_scene} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'intimacy_scene', !!c)} 
              />
              <Label htmlFor={`intimacy_${role.id}`} className="text-xs">Intimacy Scene?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`nudity_${role.id}`}
                checked={role.nudity_required} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'nudity_required', !!c)} 
              />
              <Label htmlFor={`nudity_${role.id}`} className="text-xs">Nudity Required?</Label>
            </div>
          </div>
          {role.nudity_required && (
            <div className="space-y-2">
              <Label>Nudity Type</Label>
              <Select value={role.nudity_type} onValueChange={(v) => handleRoleChange(role.id, 'nudity_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="To Be Discussed">To Be Discussed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* ROLE PAYMENT */}
        <Separator />
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Payment & Compensation</h3>
          <div className="flex items-center space-x-2">
            <Switch 
              id={`paid_${role.id}`}
              checked={role.is_paid_role} 
              onCheckedChange={(c) => handleRoleChange(role.id, 'is_paid_role', c)} 
            />
            <Label htmlFor={`paid_${role.id}`}>Is this a paid role? *</Label>
          </div>
          {role.is_paid_role && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Payment Type *</Label>
                <Select value={role.payment_type} onValueChange={(v) => handleRoleChange(role.id, 'payment_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rate / Amount</Label>
                <Input 
                  type="number" 
                  value={role.payment_amount} 
                  onChange={(e) => handleRoleChange(role.id, 'payment_amount', e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Currency *</Label>
                <Select value={role.currency} onValueChange={(v) => handleRoleChange(role.id, 'currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="grid gap-4 grid-cols-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`expenses_${role.id}`}
                checked={role.expenses_covered} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'expenses_covered', !!c)} 
              />
              <Label htmlFor={`expenses_${role.id}`} className="text-xs">Expenses Covered?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`accommodation_${role.id}`}
                checked={role.accommodation_covered} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'accommodation_covered', !!c)} 
              />
              <Label htmlFor={`accommodation_${role.id}`} className="text-xs">Accommodation?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`travel_cov_${role.id}`}
                checked={role.travel_covered} 
                onCheckedChange={(c) => handleRoleChange(role.id, 'travel_covered', !!c)} 
              />
              <Label htmlFor={`travel_cov_${role.id}`} className="text-xs">Travel Covered?</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Additional Compensation Notes</Label>
            <Textarea 
              value={role.compensation_notes} 
              onChange={(e) => handleRoleChange(role.id, 'compensation_notes', e.target.value)} 
              rows={2} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
