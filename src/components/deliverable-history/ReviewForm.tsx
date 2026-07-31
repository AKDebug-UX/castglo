import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { deliverableHistoryAPI } from "@/lib/api";
import { toast } from "sonner";
import { Send, CheckCircle2, ShieldAlert } from "lucide-react";

interface ReviewFormProps {
  deliverableId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment?: string;
  } | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  deliverableId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [comment, setComment] = useState<string>(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [notVerifiedNotice, setNotVerifiedNotice] = useState(false);

  const isEditing = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a star rating (1–5).");
      return;
    }

    setSubmitting(true);
    setNotVerifiedNotice(false);
    try {
      if (isEditing) {
        await deliverableHistoryAPI.updateReview(deliverableId, existingReview.id, {
          rating,
          comment: comment.trim() || undefined,
        });
        toast.success("Review updated successfully!");
      } else {
        await deliverableHistoryAPI.addReview(deliverableId, {
          rating,
          comment: comment.trim() || undefined,
        });
        toast.success("Review published successfully!");
      }

      onSuccess?.();
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.response?.data?.error;

      if (status === 403) {
        setNotVerifiedNotice(true);
        toast.error("Only verified co-workers on this project can submit a review.");
      } else if (status === 409) {
        toast.error("You have already reviewed this project entry.");
      } else if (status === 400 && msg?.includes("own entry")) {
        toast.error("You cannot review your own deliverable entry.");
      } else {
        toast.error(msg || "Failed to submit review.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (notVerifiedNotice) {
    return (
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Verified Co-worker Review Only</span>
        </div>
        <p className="text-amber-800 leading-relaxed">
          Reviews are reserved for verified participants who worked together on this project.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900">
          {isEditing ? "Edit Your Review" : "Write a Co-Worker Review"}
        </span>
        <StarRating
          rating={rating}
          interactive
          onRatingChange={setRating}
          size="md"
        />
      </div>

      <Textarea
        placeholder="Share your experience working on this project (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={2000}
        rows={3}
        className="text-xs bg-white border-slate-200 rounded-xl resize-none focus-visible:ring-1 focus-visible:ring-[#009698]"
      />

      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs rounded-xl"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#009698] hover:bg-[#009698]/90 text-white font-bold text-xs rounded-xl px-4 py-2 flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? "Submitting..." : isEditing ? "Update Review" : "Post Review"}</span>
        </Button>
      </div>
    </form>
  );
}
