import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { CheckCircle2, MoreVertical, Flag, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { FlagReviewModal } from "./FlagReviewModal";

export interface ReviewItem {
  id: string;
  deliverableId?: string;
  rating: number;
  comment?: string;
  isVerifiedParticipant?: boolean;
  createdAt: string;
  reviewer?: {
    id?: string;
    _id?: string;
    fullName?: string;
    profilePicture?: string;
  };
  _count?: {
    flags?: number;
  };
}

interface ReviewCardProps {
  review: ReviewItem;
  deliverableId: string;
  onEdit?: (review: ReviewItem) => void;
  onDelete?: (reviewId: string) => void;
  onFlagged?: () => void;
}

export function ReviewCard({
  review,
  deliverableId,
  onEdit,
  onDelete,
  onFlagged,
}: ReviewCardProps) {
  const { user } = useAuth();
  const [flagOpen, setFlagOpen] = useState(false);

  const reviewerId = review.reviewer?.id || review.reviewer?._id;
  const currentUserId = user?._id || user?.id;
  const isMyReview = currentUserId && reviewerId === currentUserId;

  const reviewerName = review.reviewer?.fullName || "Anonymous Contributor";
  const initials = reviewerName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const formattedDate = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2.5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={review.reviewer?.profilePicture} />
            <AvatarFallback className="bg-[#DEFCFE] text-[#009698] font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-slate-900 truncate">
                {reviewerName}
              </span>
              {review.isVerifiedParticipant !== false && (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold px-1.5 py-0 rounded-full flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  Verified Co-worker
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StarRating rating={review.rating} size="sm" />

          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-full text-slate-400 hover:text-slate-900 focus:outline-none">
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-100">
              {isMyReview ? (
                <>
                  <DropdownMenuItem
                    onClick={() => onEdit?.(review)}
                    className="font-medium text-xs cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-2 text-slate-600" /> Edit Review
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(review.id)}
                    className="font-medium text-xs text-destructive cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={() => setFlagOpen(true)}
                  className="font-medium text-xs text-amber-700 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 mr-2" /> Report / Flag
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {review.comment && (
        <p className="text-xs text-slate-600 leading-relaxed pl-12">
          "{review.comment}"
        </p>
      )}

      <FlagReviewModal
        open={flagOpen}
        onOpenChange={setFlagOpen}
        deliverableId={deliverableId}
        reviewId={review.id}
        onFlagged={onFlagged}
      />
    </div>
  );
}
