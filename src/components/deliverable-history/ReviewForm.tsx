import React, { useState, useEffect } from "react";
import { DeliverableReview } from "./types";
import { StarRating } from "./StarRating";
import { deliverableHistoryAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, AlertCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface ReviewFormProps {
  deliverableId: string;
  existingReview?: DeliverableReview | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  deliverableId,
  existingReview,
  onSuccess,
  onCancel
}) => {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [comment, setComment] = useState<string>(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please select a star rating from 1 to 5.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const trimmedComment = comment.trim();
      const payload: { rating: number; comment?: string } = {
        rating,
        ...(trimmedComment ? { comment: trimmedComment } : {})
      };

      if (existingReview) {
        await deliverableHistoryAPI.updateReview(deliverableId, existingReview.id, payload);
        toast.success("Review updated successfully");
      } else {
        await deliverableHistoryAPI.addReview(deliverableId, payload);
        toast.success("Review submitted successfully");
      }
      onSuccess();
    } catch (error: any) {
      const status = error?.response?.status;
      const errData = error?.response?.data;
      const msg = Array.isArray(errData?.data) && errData.data.length > 0
        ? errData.data[0]
        : errData?.message || errData?.error;

      if (status === 403) {
        setErrorMessage("Only verified co-workers / participants on this project are eligible to leave a review.");
      } else if (status === 400 && msg?.toLowerCase()?.includes("own")) {
        setErrorMessage("You cannot leave a review on your own project entry.");
      } else if (status === 409) {
        setErrorMessage("You have already submitted a review for this deliverable.");
      } else {
        toast.error(msg || "Failed to submit review. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-2xl bg-teal-50/40 dark:bg-slate-900 border border-teal-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
          {existingReview ? "Edit Your Review" : "Write a Co-Worker Review"}
        </h4>
        <span className="text-xs text-slate-500 font-medium">Verified Participants Only</span>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Star Selector */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Rating (1 to 5 Stars) *
        </label>
        <div>
          <StarRating
            rating={rating}
            interactive
            onRatingChange={setRating}
            size={24}
            showValue
          />
        </div>
      </div>

      {/* Comment Field */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Share your working experience (optional)
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe your experience collaborating with this professional..."
          maxLength={2000}
          rows={3}
          className="rounded-xl text-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-[#009698]"
        />
        <div className="text-right text-[11px] text-slate-400">
          {comment.length} / 2000 chars
        </div>
      </div>

      {/* Submit / Cancel Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#009698] hover:bg-[#007a7c] text-white rounded-xl gap-2 text-xs font-medium px-5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" /> {existingReview ? "Update Review" : "Submit Review"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
