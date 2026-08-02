import React, { useState, useEffect } from "react";
import { DeliverableEntry } from "./types";
import { deliverableHistoryAPI } from "@/lib/api";
import { DeliverableCard } from "./DeliverableCard";
import { DeliverableDetailModal } from "./DeliverableDetailModal";
import { DeliverableFormModal } from "./DeliverableFormModal";
import { EmptyHistoryState } from "./EmptyHistoryState";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Award, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface DeliverableHistoryTabProps {
  userId: string;
  userName?: string;
}

export const DeliverableHistoryTab: React.FC<DeliverableHistoryTabProps> = ({
  userId,
  userName = "User"
}) => {
  const { user: authUser } = useAuth();
  const isOwnProfile = authUser?.id === userId;

  const [deliverables, setDeliverables] = useState<DeliverableEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);
  const [selectedEntryData, setSelectedEntryData] = useState<DeliverableEntry | null>(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DeliverableEntry | null>(null);

  const fetchDeliverables = async (pageNum: number, replace = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const res = await deliverableHistoryAPI.getByUser(userId, {
        page: pageNum,
        limit: 20
      });

      if (res.data?.success) {
        const list = res.data.data.deliverables || [];
        const count = res.data.data.total || list.length;
        setTotal(count);

        if (replace) {
          setDeliverables(list);
        } else {
          setDeliverables((prev) => [...prev, ...list]);
        }
      }
    } catch (err) {
      console.error("Failed to load deliverable history:", err);
      toast.error("Could not fetch deliverable history");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (userId) {
      setPage(1);
      fetchDeliverables(1, true);
    }
  }, [userId]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDeliverables(nextPage, false);
  };

  const handleCreateNew = () => {
    setEditingEntry(null);
    setFormModalOpen(true);
  };

  const handleEdit = (entry: DeliverableEntry) => {
    setEditingEntry(entry);
    setFormModalOpen(true);
  };

  const handleDelete = async (entry: DeliverableEntry) => {
    if (!window.confirm(`Are you sure you want to delete "${entry.title}"?`)) return;

    try {
      await deliverableHistoryAPI.delete(entry.id);
      toast.success("Deliverable entry deleted successfully.");
      setDeliverables((prev) => prev.filter((item) => item.id !== entry.id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (selectedDeliverableId === entry.id) {
        setSelectedDeliverableId(null);
        setSelectedEntryData(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete deliverable entry.");
    }
  };

  const handleCardClick = (entry: DeliverableEntry) => {
    setSelectedDeliverableId(entry.id);
    setSelectedEntryData(entry);
  };

  const handleFormSuccess = (savedEntry: DeliverableEntry) => {
    fetchDeliverables(1, true);
  };

  const hasMore = deliverables.length < total;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#009698]" /> Deliverable History & Portfolio
            </h2>
            {total > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-[#009698]">
                {total} {total === 1 ? "project" : "projects"}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Verified work record with star ratings & reviews from project co-workers.
          </p>
        </div>

        {isOwnProfile && (
          <Button
            onClick={handleCreateNew}
            className="bg-[#009698] hover:bg-[#007a7c] text-white rounded-xl gap-2 font-semibold shadow-sm self-start sm:self-auto px-5"
          >
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        )}
      </div>

      {/* Main Grid / Loading / Empty State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#009698]" />
          <p className="text-xs text-slate-500 font-medium mt-2">Loading deliverable history...</p>
        </div>
      ) : deliverables.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {deliverables.map((entry) => (
              <DeliverableCard
                key={entry.id}
                entry={entry}
                isOwner={isOwnProfile}
                onSelect={handleCardClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="rounded-xl px-8 text-xs font-semibold shadow-xs"
              >
                {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More Projects"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <EmptyHistoryState
          isOwnProfile={isOwnProfile}
          userName={userName}
          onAddClick={handleCreateNew}
        />
      )}

      {/* Detail View Modal */}
      {selectedDeliverableId && (
        <DeliverableDetailModal
          isOpen={!!selectedDeliverableId}
          deliverableId={selectedDeliverableId}
          initialData={selectedEntryData}
          currentUserId={authUser?.id}
          onClose={() => {
            setSelectedDeliverableId(null);
            setSelectedEntryData(null);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create / Edit Form Modal */}
      {formModalOpen && (
        <DeliverableFormModal
          isOpen={formModalOpen}
          entry={editingEntry}
          onClose={() => setFormModalOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};
