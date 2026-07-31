import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/deliverable-history/StarRating";
import { ReviewList } from "@/components/deliverable-history/ReviewList";
import { DeliverableFormModal } from "@/components/deliverable-history/DeliverableFormModal";
import { DeliverableItem } from "@/components/deliverable-history/DeliverableCard";
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
  ChevronLeft,
  ChevronRight,
  Share2,
  ArrowLeft,
  Award,
} from "lucide-react";

export default function DeliverableDetailPage() {
  const { userId, deliverableId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState<DeliverableItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const fetchDetail = async () => {
    if (!deliverableId) return;
    setLoading(true);
    try {
      const res = await deliverableHistoryAPI.getOne(deliverableId);
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load deliverable history page:", err);
      toast.error("Deliverable entry not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [deliverableId]);

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
      if (ownerId) navigate(`/talent/${ownerId}`);
      else navigate(-1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete entry.");
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Share link copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          {ownerId && (
            <Link
              to={`/talent/${ownerId}`}
              className="text-xs font-bold text-[#009698] hover:underline flex items-center gap-1"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#009698]" />
          </div>
        ) : data ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-8 animate-fade-in">
            {/* Media Gallery */}
            {mediaUrls.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-96 w-full flex items-center justify-center">
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-xs transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMediaIndex((i) => (i < mediaUrls.length - 1 ? i + 1 : 0))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-xs transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                      {selectedMediaIndex + 1} / {mediaUrls.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Title & Metadata */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2 min-w-0 flex-1">
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

                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    {data.title}
                  </h1>
                </div>

                {/* Actions */}
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

              {/* Rating Bar */}
              <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 flex-wrap">
                <StarRating rating={ratingNum} size="md" showText reviewCount={reviewCount} />
                {data.year && (
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <Calendar className="w-4 h-4" /> Completed {data.year}
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
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2">
                <h5 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Synopsis / Description</h5>
                <p className="whitespace-pre-line text-sm">{data.description}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Verified Co-Worker Reviews ({reviewCount})
              </h3>
              <ReviewList
                deliverableId={data.id}
                isOwner={isOwner}
                totalReviewsCount={reviewCount}
                onReviewsUpdated={fetchDetail}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
            Deliverable entry not found or removed.
          </div>
        )}
      </main>

      <Footer />

      {data && (
        <DeliverableFormModal
          open={editOpen}
          onOpenChange={setEditOpen}
          initialData={data}
          onSuccess={fetchDetail}
        />
      )}
    </div>
  );
}
