import React, { useState, useEffect } from "react";
import { DeliverableReview } from "./types";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { deliverableHistoryAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewListProps {
  deliverableId: string;
  isOwner?: boolean;
  initialReviews?: DeliverableReview[];
  onReviewUpdated?: () => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  deliverableId,
  isOwner = false,
  initialReviews = [],
  onReviewUpdated
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<DeliverableReview[]>(initialReviews);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingReview, setEditingReview] = useState<DeliverableReview | null>(null);
  const [isWriteFormOpen, setIsWriteFormOpen] = useState(false);

  const fetchReviews = async (pageNum: number, replace = false) => {
    setIsLoading(true);
    try {
      const response = await deliverableHistoryAPI.getReviews(deliverableId, {
        page: pageNum,
        limit: 10
      });
      if (response.data.success) {
        const fetched = response.data.data.reviews || response.data.data || [];
        const total = response.data.data.total || fetched.length;

        if (replace) {
          setReviews(fetched);
        } else {
          setReviews((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const newOnly = fetched.filter((r: DeliverableReview) => !existingIds.has(r.id));
            return [...prev, ...newOnly];
          });
        }

        setHasMore((pageNum * 10) < total && fetched.length >= 10);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialReviews.length > 0) {
      setReviews(initialReviews);
    } else {
      fetchReviews(1, true);
    }
  }, [deliverableId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, false);
  };

  const handleReviewSuccess = () => {
    setEditingReview(null);
    setIsWriteFormOpen(false);
    fetchReviews(1, true);
    if (onReviewUpdated) onReviewUpdated();
  };

  const handleDeleteReview = async (review: DeliverableReview) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    try {
      await deliverableHistoryAPI.deleteReview(deliverableId, review.id);
      toast.success("Review deleted successfully");
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      if (onReviewUpdated) onReviewUpdated();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete review");
    }
  };

  // Find if current user has already reviewed
  const userReview = user ? reviews.find((r) => r.reviewer?.id === user.id) : null;
  const canWriteNew = user && !isOwner && !userReview;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#009698]" />
          Verified Participant Reviews ({reviews.length})
        </h3>

        {canWriteNew && !isWriteFormOpen && (
          <Button
            onClick={() => setIsWriteFormOpen(true)}
            size="sm"
            className="bg-[#009698] hover:bg-[#007a7c] text-white rounded-xl gap-1.5 text-xs"
          >
            <PlusCircle className="w-4 h-4" /> Leave Review
          </Button>
        )}
      </div>

      {/* Review Form (New or Editing) */}
      {(isWriteFormOpen || editingReview) && (
        <ReviewForm
          deliverableId={deliverableId}
          existingReview={editingReview}
          onSuccess={handleReviewSuccess}
          onCancel={() => {
            setIsWriteFormOpen(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* Unauthenticated nudge */}
      {!user && (
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs text-center">
          Sign in to leave a peer review if you participated in this project.
        </div>
      )}

      {/* Review Cards List */}
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              deliverableId={deliverableId}
              currentUserId={user?.id}
              onEdit={(r) => setEditingReview(r)}
              onDelete={handleDeleteReview}
            />
          ))}

          {hasMore && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="rounded-xl text-xs px-6"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More Reviews"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        !isWriteFormOpen && (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            No peer reviews left yet for this project.
          </p>
        )
      )}
    </div>
  );
};
