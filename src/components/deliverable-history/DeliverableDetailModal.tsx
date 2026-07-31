import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { ReviewList } from "./ReviewList";
import { DeliverableFormModal } from "./DeliverableFormModal";
import { DeliverableItem } from "./DeliverableCard";
import { deliverableHistoryAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Calendar,
  Film,
  CheckCircle2,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Share2
} from "lucide-react";

interface DeliverableDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliverableId?: string | null;
  initialData?: DeliverableItem | null;
  onEntryUpdated?: () => void;
  onEntryDeleted?: () => void;
}

export function DeliverableDetailModal({
  open,
  onOpenChange,
  deliverableId,
  initialData,
  onEntryUpdated,
  onEntryDeleted,
}: DeliverableDetailModalProps) {
  const { user } = useAuth();
  const [data, setData] = useState<DeliverableItem | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const activeId = deliverableId || initialData?.id;

  const fetchDetail = async () => {
    if (!activeId) return;
    setLoading(true);
    try {
      const res = await deliverableHistoryAPI.getOne(activeId);
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load deliverable details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && activeId) {
      fetchDetail();
    } else if (initialData) {
      setData(initialData);
    }
  }, [open, activeId]);

  if (!open) return null;

  const currentUserId = user?._id || user?.id;
  const ownerId = data?.userId || data?.user?.id;
  const isOwner = !!(currentUserId && ownerId && currentUserId === ownerId);

  const mediaUrls = data?.mediaUrls || [];
  const ratingNum = Number(data?.averageRating || 0);
  const reviewCount = data?.reviewCount ?? data?._count?.reviews ?? 0;

  const handleDeleteEntry = async () => {
    if (!data?.id) return;
    if (!window.confirm("Are you sure you want to delete this deliverable history entry?")) return;

    try {
      await deliverableHistoryAPI.delete(data.id);
      toast.success("Deliverable entry deleted successfully.");
      onEntryDeleted?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete entry.");
    }
  };

  const handleCopyShareLink = () => {
    if (!data) return;
    const shareUrl = `${window.location.origin}/profiles/${ownerId}/history/${data.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          {loading && !data ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#009698]" />
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Media Gallery / Header Banner */}
              {mediaUrls.length > 0 && (
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-72 w-full flex items-center justify-center">
                  <img
                    src={mediaUrls[selectedMediaIndex]}
                    alt={data.title}
                    className="w-full h-full object-contain"
                  />
                  {mediaUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedMediaIndex((i) => (i > 0 ? i - 1 : mediaUrls.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMediaIndex((i) => (i < mediaUrls.length - 1 ? i + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                        {selectedMediaIndex + 1} / {mediaUrls.length}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Title & Core Metadata */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-[#DEFCFE] text-[#009698] border-none text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                        {data.role || "Participant"}
                      </Badge>
                      {data.productionType && (
                        <Badge variant="outline" className="text-xs font-semibold text-slate-700 border-slate-200 rounded-full">
                          {data.productionType}
                        </Badge>
                      )}
                      {data.projectId && (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Platform Verified</span>
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
                      {data.title}
                    </h2>
                  </div>

                  {/* Rating & Share */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyShareLink}
                      className="rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </Button>

                    {isOwner && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditOpen(true)}
                          className="rounded-xl text-xs"
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteEntry}
                          className="rounded-xl text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating Bar & Year */}
                <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 flex-wrap">
                  <StarRating rating={ratingNum} size="md" showText reviewCount={reviewCount} />
                  {data.year && (
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5" /> Completed {data.year}
                    </span>
                  )}
                  {data.user?.fullName && (
                    <span className="text-slate-500">
                      By <strong className="text-slate-800">{data.user.fullName}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {data.description && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-1">
                  <h5 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Synopsis / Description</h5>
                  <p className="whitespace-pre-line">{data.description}</p>
                </div>
              )}

              {/* Reviews Section */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    Co-Worker Reviews ({reviewCount})
                  </h3>
                </div>

                <ReviewList
                  deliverableId={data.id}
                  isOwner={isOwner}
                  totalReviewsCount={reviewCount}
                  onReviewsUpdated={() => {
                    fetchDetail();
                    onEntryUpdated?.();
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-muted-foreground">
              Deliverable history details not found.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form modal for editing */}
      {data && (
        <DeliverableFormModal
          open={editOpen}
          onOpenChange={setEditOpen}
          initialData={data}
          onSuccess={() => {
            fetchDetail();
            onEntryUpdated?.();
          }}
        />
      )}
    </>
  );
}
