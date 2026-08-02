import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { deliverableHistoryAPI } from "@/lib/api";
import { DeliverableEntry } from "@/components/deliverable-history/types";
import { StarRating } from "@/components/deliverable-history/StarRating";
import { DeliverableMediaGallery } from "@/components/deliverable-history/DeliverableMediaGallery";
import { ReviewList } from "@/components/deliverable-history/ReviewList";
import { DeliverableFormModal } from "@/components/deliverable-history/DeliverableFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, Film, Calendar, Link2, Edit2, Trash2, Loader2, Sparkles, User 
} from "lucide-react";
import { toast } from "sonner";

export default function DeliverableDetailPage() {
  const { deliverableId, username } = useParams<{ deliverableId: string; username?: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [entry, setEntry] = useState<DeliverableEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchDetail = async () => {
    if (!deliverableId) return;
    setIsLoading(true);
    try {
      const res = await deliverableHistoryAPI.getOne(deliverableId);
      if (res.data?.success) {
        const item: DeliverableEntry = res.data.data;
        setEntry(item);
        
        // Dynamic Page Title for SEO
        if (item.title && item.user?.fullName) {
          document.title = `${item.title} — ${item.user.fullName} on Castglo`;
        }
      }
    } catch (err) {
      console.error("Error loading deliverable detail:", err);
      toast.error("Project entry not found or unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [deliverableId]);

  const isOwner = authUser?.id && entry?.userId === authUser.id;
  const ratingNum = typeof entry?.averageRating === "string"
    ? parseFloat(entry.averageRating)
    : (entry?.averageRating || 0);

  const reviewCount = entry?.reviewCount || entry?._count?.reviews || 0;

  const handleDelete = async () => {
    if (!entry || !window.confirm(`Are you sure you want to delete "${entry.title}"?`)) return;

    try {
      await deliverableHistoryAPI.delete(entry.id);
      toast.success("Deliverable entry deleted successfully.");
      if (username || entry.user?.id) {
        navigate(`/talent/${username || entry.user?.id}`);
      } else {
        navigate(-1);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete deliverable entry.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 container max-w-4xl py-8 px-4 sm:px-6">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#009698] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#009698]" />
            <p className="text-xs text-slate-500 font-medium mt-2">Loading project details...</p>
          </div>
        ) : entry ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
            {/* Top Media Gallery */}
            {entry.mediaUrls && entry.mediaUrls.length > 0 && (
              <DeliverableMediaGallery mediaUrls={entry.mediaUrls} />
            )}

            {/* Header / Title block */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-teal-50 dark:bg-teal-950/60 text-[#009698] font-bold text-xs px-3 py-1 border-none">
                    {entry.role}
                  </Badge>

                  {entry.productionType && (
                    <Badge variant="outline" className="text-slate-600 dark:text-slate-300 font-medium text-xs">
                      <Film className="w-3.5 h-3.5 mr-1 text-slate-400" /> {entry.productionType}
                    </Badge>
                  )}

                  {entry.year && (
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {entry.year}
                    </span>
                  )}
                </div>

                {/* Owner action buttons */}
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditModalOpen(true)}
                      className="rounded-xl text-xs gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Project
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDelete}
                      className="rounded-xl text-xs gap-1.5 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {entry.title}
              </h1>

              {/* Creator info & Rating summary */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {entry.user && (
                  <Link
                    to={`/talent/${entry.user.id}`}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#009698]"
                  >
                    <User className="w-4 h-4 text-[#009698]" />
                    <span>{entry.user.fullName}</span>
                  </Link>
                )}

                <div className="flex items-center gap-2">
                  <StarRating rating={ratingNum} size={18} showValue={ratingNum > 0} />
                  <span className="text-xs text-slate-500 font-medium">
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>
            </div>

            {/* Linked Project Chip */}
            {entry.projectId && (
              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#009698]">
                  <Sparkles className="w-4 h-4" /> Verified Castglo Platform Project
                </div>
                {entry.project && (
                  <Link
                    to={`/project/${entry.projectId}`}
                    className="text-xs font-semibold text-[#009698] hover:underline flex items-center gap-1"
                  >
                    View Platform Project <Link2 className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            {/* Description */}
            {entry.description && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Description & Production Notes
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {entry.description}
                </p>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewList
              deliverableId={entry.id}
              isOwner={!!isOwner}
              initialReviews={entry.reviews}
              onReviewUpdated={fetchDetail}
            />
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 space-y-3">
            <p className="text-base font-semibold">Deliverable history entry not found.</p>
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
              Go Back
            </Button>
          </div>
        )}

        {/* Edit Form Modal */}
        {isEditModalOpen && entry && (
          <DeliverableFormModal
            isOpen={isEditModalOpen}
            entry={entry}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              fetchDetail();
              setIsEditModalOpen(false);
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
