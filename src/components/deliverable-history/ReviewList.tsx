import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReviewCard, ReviewItem } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { deliverableHistoryAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquarePlus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewListProps {
  deliverableId: string;
  isOwner: boolean;
  initialReviews?: ReviewItem[];
  totalReviewsCount?: number;
  onReviewsUpdated?: () => void;
}

export function ReviewList({
  deliverableId,
  isOwner,
  initialReviews = [],
  totalReviewsCount = 0,
  onReviewsUpdated,
}: ReviewListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const loadMoreReviews = async () => {
    if (loading || !deliverableId) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const res = await deliverableHistoryAPI.getReviews(deliverableId, {
        page: nextPage,
        limit: 10,
      });
      if (res.data?.success) {
        const newItems = res.data.data?.reviews || [];
        setReviews((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(newItems.length >= 10);
      }
    } catch (err) {
      console.error("Failed to load more reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = () => {
    onReviewsUpdated?.();
    setEditingReview(null);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      await deliverableHistoryAPI.deleteReview(deliverableId, reviewId);
      toast.success("Review deleted successfully.");
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      onReviewsUpdated?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete review.");
    }
  };

  const currentUserId = user?._id || user?.id;
  const userHasReviewed = reviews.some(
    (r) => (r.reviewer?.id || r.reviewer?._id) === currentUserId
  );

  // Sort user's own review to top of the list if present
  const sortedReviews = [...reviews].sort((a, b) => {
    const aIsMine = (a.reviewer?.id || a.reviewer?._id) === currentUserId;
    const bIsMine = (b.reviewer?.id || b.reviewer?._id) === currentUserId;
    if (aIsMine && !bIsMine) return -1;
    if (!aIsMine && bIsMine) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Review Form - shown if user is logged in, not owner, and hasn't reviewed yet */}
      {user && !isOwner && !userHasReviewed && !editingReview && (
        <ReviewForm
          deliverableId={deliverableId}
          onSuccess={handleReviewAdded}
        />
      )}

      {/* Editing Form */}
      {editingReview && (
        <ReviewForm
          deliverableId={deliverableId}
          existingReview={editingReview}
          onSuccess={handleReviewAdded}
          onCancel={() => setEditingReview(null)}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            No co-worker reviews published yet.
          </div>
        ) : (
          sortedReviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              deliverableId={deliverableId}
              onEdit={setEditingReview}
              onDelete={handleDeleteReview}
              onFlagged={onReviewsUpdated}
            />
          ))
        )}
      </div>

      {/* Scenario D: Unauthenticated Visitor Sign In Nudge */}
      {!user && (
        <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
          <span>Sign in to leave a review as a verified co-worker.</span>
          <Link to="/login" className="font-bold text-[#009698] hover:underline flex items-center gap-1">
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </Link>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMoreReviews}
            disabled={loading}
            className="text-xs rounded-xl"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}

