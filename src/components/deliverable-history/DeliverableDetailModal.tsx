import React, { useState, useEffect } from "react";
import { DeliverableEntry } from "./types";
import { deliverableHistoryAPI } from "@/lib/api";
import { StarRating } from "./StarRating";
import { DeliverableMediaGallery } from "./DeliverableMediaGallery";
import { ReviewList } from "./ReviewList";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Film, Link2, Edit2, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface DeliverableDetailModalProps {
  isOpen: boolean;
  deliverableId: string | null;
  initialData?: DeliverableEntry | null;
  currentUserId?: string;
  onClose: () => void;
  onEdit?: (entry: DeliverableEntry) => void;
  onDelete?: (entry: DeliverableEntry) => void;
}

export const DeliverableDetailModal: React.FC<DeliverableDetailModalProps> = ({
  isOpen,
  deliverableId,
  initialData,
  currentUserId,
  onClose,
  onEdit,
  onDelete
}) => {
  const [entry, setEntry] = useState<DeliverableEntry | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDetail = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await deliverableHistoryAPI.getOne(id);
      if (res.data?.success) {
        setEntry(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load deliverable details:", err);
      toast.error("Failed to load project details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deliverableId) {
      if (initialData && initialData.id === deliverableId) {
        setEntry(initialData);
      } else {
        fetchDetail(deliverableId);
      }
    }
  }, [deliverableId, initialData]);

  if (!isOpen) return null;

  const isOwner = currentUserId && entry?.userId === currentUserId;
  const ratingNum = typeof entry?.averageRating === "string"
    ? parseFloat(entry.averageRating)
    : (entry?.averageRating || 0);

  const reviewCount = entry?.reviewCount || entry?._count?.reviews || 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-h-[92vh] overflow-y-auto space-y-6">
        <DialogHeader className="sr-only">
          <DialogTitle>{entry?.title || "Deliverable Detail"}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#009698]" />
            <p className="text-xs text-slate-500 mt-2 font-medium">Loading project details...</p>
          </div>
        ) : entry ? (
          <div className="space-y-6">
            {/* Top Media Gallery */}
            {entry.mediaUrls && entry.mediaUrls.length > 0 && (
              <DeliverableMediaGallery mediaUrls={entry.mediaUrls} />
            )}

            {/* Title & Metadata Section */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-teal-50 dark:bg-teal-950/60 text-[#009698] font-bold text-xs px-3 py-1 border-none">
                    {entry.role}
                  </Badge>

                  {entry.productionType && (
                    <Badge variant="outline" className="text-slate-600 dark:text-slate-300 font-medium text-xs">
                      <Film className="w-3 h-3 mr-1 text-slate-400" /> {entry.productionType}
                    </Badge>
                  )}

                  {entry.year && (
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {entry.year}
                    </span>
                  )}
                </div>

                {/* Owner controls */}
                {isOwner && (
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onClose();
                          onEdit(entry);
                        }}
                        className="rounded-xl text-xs gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onClose();
                          onDelete(entry);
                        }}
                        className="rounded-xl text-xs gap-1.5 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {entry.title}
              </h2>

              {/* Rating summary */}
              <div className="flex items-center gap-3 pt-1">
                <StarRating rating={ratingNum} size={18} showValue={ratingNum > 0} />
                <span className="text-xs text-slate-500 font-medium">
                  · {reviewCount} {reviewCount === 1 ? "verified review" : "verified reviews"}
                </span>
              </div>
            </div>

            {/* Linked Project Chip */}
            {entry.projectId && (
              <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#009698]">
                  <Sparkles className="w-4 h-4" /> Verified Castglo Platform Project
                </div>
                {entry.project && (
                  <Link
                    to={`/project/${entry.projectId}`}
                    className="text-xs font-semibold text-[#009698] hover:underline flex items-center gap-1"
                  >
                    View Project Page <Link2 className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            {/* Description */}
            {entry.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Project Description
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                  {entry.description}
                </p>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewList
              deliverableId={entry.id}
              isOwner={!!isOwner}
              initialReviews={entry.reviews}
              onReviewUpdated={() => fetchDetail(entry.id)}
            />
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-sm">
            Deliverable entry not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
