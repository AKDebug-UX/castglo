import React, { useState, useEffect } from "react";
import { DeliverableCard, DeliverableItem } from "./DeliverableCard";
import { DeliverableDetailModal } from "./DeliverableDetailModal";
import { DeliverableFormModal } from "./DeliverableFormModal";
import { EmptyHistoryState } from "./EmptyHistoryState";
import { deliverableHistoryAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Award } from "lucide-react";
import { toast } from "sonner";

interface DeliverableHistoryTabProps {
  userId: string;
  userFullName?: string;
}

export function DeliverableHistoryTab({
  userId,
  userFullName = "User",
}: DeliverableHistoryTabProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<DeliverableItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modal states
  const [selectedItem, setSelectedItem] = useState<DeliverableItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const currentUserId = user?._id || user?.id;
  const isOwner = !!(currentUserId && userId && (currentUserId === userId || currentUserId === String(userId)));

  const fetchDeliverables = async (resetPage = false) => {
    if (!userId) return;
    const targetPage = resetPage ? 1 : page;
    if (resetPage) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await deliverableHistoryAPI.getByUser(userId, {
        page: targetPage,
        limit,
      });

      if (res.data?.success) {
        const list = res.data.data?.deliverables || [];
        const totalCount = res.data.data?.total ?? list.length;
        setTotal(totalCount);

        if (resetPage) {
          setItems(list);
          setPage(1);
        } else {
          setItems((prev) => [...prev, ...list]);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch deliverable history:", err);
      if (err?.response?.status === 404) {
        setItems([]);
      } else {
        toast.error("Failed to load deliverable history.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchDeliverables(true);
  }, [userId]);

  const handleCardClick = (item: DeliverableItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleLoadMore = () => {
    if (items.length >= total) return;
    setPage((p) => p + 1);
    fetchDeliverables(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#009698]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-[#009698]" />
            Deliverable History & Verified Work
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified completed projects, role credits, and peer reviews.
          </p>
        </div>

        {isOwner && (
          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-[#009698] hover:bg-[#009698]/90 text-white font-bold rounded-xl px-5 py-2.5 shadow-md shadow-[#009698]/10 flex items-center gap-2 text-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Completed Project</span>
          </Button>
        )}
      </div>

      {/* Grid or Empty State */}
      {items.length === 0 ? (
        <EmptyHistoryState
          isOwner={isOwner}
          userFullName={userFullName}
          onAddClick={() => setAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <DeliverableCard
                key={item.id}
                item={item}
                onClick={() => handleCardClick(item)}
              />
            ))}
          </div>

          {items.length < total && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-xl text-xs font-semibold px-6"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#009698]" />}
                Load More Projects
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <DeliverableDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        initialData={selectedItem}
        onEntryUpdated={() => fetchDeliverables(true)}
        onEntryDeleted={() => fetchDeliverables(true)}
      />

      {/* Create Modal */}
      <DeliverableFormModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={() => fetchDeliverables(true)}
      />
    </div>
  );
}
