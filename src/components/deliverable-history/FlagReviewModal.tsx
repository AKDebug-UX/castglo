import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Flag, AlertTriangle } from "lucide-react";
import { deliverableHistoryAPI } from "@/lib/api";
import { toast } from "sonner";

interface FlagReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliverableId: string;
  reviewId: string;
  onFlagged?: () => void;
}

const FLAG_REASONS = [
  { value: "spam", label: "Spam or promotional content" },
  { value: "harassment", label: "Harassment or hate speech" },
  { value: "false_information", label: "False or misleading information" },
  { value: "inappropriate_content", label: "Inappropriate language or media" },
  { value: "other", label: "Other issue" },
] as const;

export function FlagReviewModal({
  open,
  onOpenChange,
  deliverableId,
  reviewId,
  onFlagged,
}: FlagReviewModalProps) {
  const [selectedReason, setSelectedReason] = useState<typeof FLAG_REASONS[number]["value"]>("false_information");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableId || !reviewId) return;

    setSubmitting(true);
    try {
      await deliverableHistoryAPI.flagReview(deliverableId, reviewId, {
        reason: selectedReason,
      });
      toast.success("Report submitted — our team will review it.");
      onFlagged?.();
      onOpenChange(false);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error("You have already reported this review.");
      } else {
        toast.error(err?.response?.data?.message || "Failed to flag review.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-500" />
            Flag Review
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Report this review for moderation if it violates community standards or contains false information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Reason for Report</label>
            <div className="space-y-2">
              {FLAG_REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="flagReason"
                    value={r.value}
                    checked={selectedReason === r.value}
                    onChange={() => setSelectedReason(r.value)}
                    className="accent-[#009698]"
                  />
                  <span className="text-xs font-medium text-slate-800">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
