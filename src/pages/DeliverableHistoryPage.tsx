import { useAuth } from "@/contexts/AuthContext";
import { DeliverableHistoryTab } from "@/components/deliverable-history/DeliverableHistoryTab";

export default function DeliverableHistoryPage() {
  const { user } = useAuth();

  if (!user?.id) return null;

  return (
    <div className="p-6">
      <DeliverableHistoryTab userId={user.id} userName={user.fullName || user.email} />
    </div>
  );
}
