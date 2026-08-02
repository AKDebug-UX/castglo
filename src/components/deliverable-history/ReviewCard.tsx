import React, { useState } from "react";
import { DeliverableReview } from "./types";
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Flag, MoreVertical, Edit3, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlagReviewModal } from "./FlagReviewModal";

interface ReviewCardProps {
  review: DeliverableReview;
  deliverableId: string;
  currentUserId?: string;
  onEdit?: (review: DeliverableReview) => void;
  onDelete?: (review: DeliverableReview) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  deliverableId,
  currentUserId,
  onEdit,
  onDelete
}) => {
  const [isFlagOpen, setIsFlagOpen] = useState(false);

  const isOwnReview = currentUserId && review.reviewer?.id === currentUserId;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        {/* Reviewer info */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">
            <AvatarImage src={review.reviewer?.profilePicture} alt={review.reviewer?.fullName} />
            <AvatarFallback className="bg-teal-100 dark:bg-teal-950 text-[#009698] font-bold text-xs">
              {getInitials(review.reviewer?.fullName)}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {review.reviewer?.fullName || "Anonymous Participant"}
              </span>

              {review.isVerifiedParticipant && (
                <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border-none text-[11px] px-2 py-0.5 gap-1 font-medium">
                  <BadgeCheck className="w-3 h-3 text-emerald-500" /> Verified Co-worker
                </Badge>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Kebab */}
        <div className="flex items-center gap-1">
          {isOwnReview ? (
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(review)}
                  className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title="Edit Review"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(review)}
                  className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            currentUserId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsFlagOpen(true)}
                    className="gap-2 text-xs text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                  >
                    <Flag className="w-3.5 h-3.5" /> Flag / Report Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </div>
      </div>

      {/* Star Rating */}
      <div>
        <StarRating rating={review.rating} size={15} showValue />
      </div>

      {/* Review Comment */}
      {review.comment && (
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          {review.comment}
        </p>
      )}

      {/* Moderation Flag Modal */}
      {isFlagOpen && (
        <FlagReviewModal
          isOpen={isFlagOpen}
          deliverableId={deliverableId}
          reviewId={review.id}
          onClose={() => setIsFlagOpen(false)}
        />
      )}
    </div>
  );
};
