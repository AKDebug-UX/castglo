import React, { useState } from "react";
import { FLAG_REASONS } from "./types";
import { deliverableHistoryAPI } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FlagReviewModalProps {
  isOpen: boolean;
  deliverableId: string;
  reviewId: string;
  onClose: () => void;
}

export const FlagReviewModal: React.FC<FlagReviewModalProps> = ({
  isOpen,
  deliverableId,
  reviewId,
  onClose
}) => {
  const [reason, setReason] = useState<string>("false_information");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await deliverableHistoryAPI.flagReview(deliverableId, reviewId, {
        reason: reason as any
      });
      toast.success("Report submitted — our moderation team will review this review.");
      onClose();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.info("You've already reported this review.");
        onClose();
      } else {
        toast.error(error?.response?.data?.message || "Failed to submit report. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Flag className="w-5 h-5 text-rose-500" />
            Report Review for Moderation
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Please select a reason why this review violates Castglo community standards:
          </p>

          <RadioGroup value={reason} onValueChange={setReason} className="space-y-3">
            {FLAG_REASONS.map((item) => (
              <div key={item.value} className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <RadioGroupItem value={item.value} id={`flag-reason-${item.value}`} />
                <Label htmlFor={`flag-reason-${item.value}`} className="cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
                  {item.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
