import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Zap, Star, FastForward } from "lucide-react";
import { CastingFormData } from "./types";

interface Step6PublishReviewProps {
  formData: CastingFormData;
  setFormData: React.Dispatch<React.SetStateAction<CastingFormData>>;
  formatPrice: (price: number) => string;
}

export default function Step6PublishReview({
  formData,
  setFormData,
  formatPrice,
}: Step6PublishReviewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Boost Your Casting Call
          </CardTitle>
          <CardDescription>Upgrade your listing to gain maximum visibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.featured_project 
                ? 'border-amber-400 bg-amber-100/50' 
                : 'border-slate-200 bg-white hover:border-amber-200'
            }`} 
            onClick={() => setFormData(p => ({ ...p, featured_project: !p.featured_project }))}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="mt-1">
                  <Star className={`w-5 h-5 ${formData.featured_project ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Featured Listing</h4>
                  <p className="text-sm text-slate-600 mt-1">Pin your project to the top for 7 days. Gets up to 5x more applications.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg">{formatPrice(29.99)}</span>
              </div>
            </div>
          </div>

          <div 
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.instant_posting_addon 
                ? 'border-red-400 bg-red-50/50' 
                : 'border-slate-200 bg-white hover:border-red-200'
            }`} 
            onClick={() => setFormData(p => ({ ...p, instant_posting_addon: !p.instant_posting_addon }))}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="mt-1">
                  <FastForward className={`w-5 h-5 ${formData.instant_posting_addon ? 'text-red-500' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Instant Posting</h4>
                  <p className="text-sm text-slate-600 mt-1">Skip moderation and publish immediately.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg">{formatPrice(14.99)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review & Compliance</CardTitle>
          <CardDescription>Section 11: Final confirmations before publishing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="confirm_information_accurate" 
                checked={formData.confirm_information_accurate} 
                onCheckedChange={(c) => setFormData(p => ({ ...p, confirm_information_accurate: !!c }))} 
              />
              <Label htmlFor="confirm_information_accurate" className="text-sm font-normal leading-tight">I confirm the information provided is accurate</Label>
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="confirm_right_to_post" 
                checked={formData.confirm_right_to_post} 
                onCheckedChange={(c) => setFormData(p => ({ ...p, confirm_right_to_post: !!c }))} 
              />
              <Label htmlFor="confirm_right_to_post" className="text-sm font-normal leading-tight">I confirm I have the right to post this casting/project</Label>
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="confirm_legal_safeguarding_compliance" 
                checked={formData.confirm_legal_safeguarding_compliance} 
                onCheckedChange={(c) => setFormData(p => ({ ...p, confirm_legal_safeguarding_compliance: !!c }))} 
              />
              <Label htmlFor="confirm_legal_safeguarding_compliance" className="text-sm font-normal leading-tight">I confirm this project complies with legal and safeguarding requirements</Label>
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="confirm_platform_policy" 
                checked={formData.confirm_platform_policy} 
                onCheckedChange={(c) => setFormData(p => ({ ...p, confirm_platform_policy: !!c }))} 
              />
              <Label htmlFor="confirm_platform_policy" className="text-sm font-normal leading-tight">I understand Castglo policies on fairness, privacy, and conduct</Label>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="p-4 bg-slate-50 rounded-lg border">
            <p className="text-sm text-muted-foreground">You are about to publish <strong>{formData.project_title || "Untitled Project"}</strong> with <strong>{formData.roles.length} role(s)</strong>.</p>
            {(formData.featured_project || formData.instant_posting_addon) && (
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="font-bold">Total Add-ons Cost:</span>
                <span className="font-bold text-lg">
                  {formatPrice((formData.featured_project ? 29.99 : 0) + (formData.instant_posting_addon ? 14.99 : 0))}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
