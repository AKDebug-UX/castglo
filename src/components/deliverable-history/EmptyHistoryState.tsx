import React from "react";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyHistoryStateProps {
  isOwnProfile?: boolean;
  userName?: string;
  onAddClick?: () => void;
}

export const EmptyHistoryState: React.FC<EmptyHistoryStateProps> = ({
  isOwnProfile = false,
  userName = "This user",
  onAddClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 md:p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/20 my-4">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#009698] flex items-center justify-center mb-4 shadow-sm">
        <FolderKanban className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        No Deliverable History Yet
      </h3>

      <p className="text-slate-600 dark:text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
        {isOwnProfile
          ? "You haven't added any project history entries yet. Add completed films, TV shows, commercials, or stage productions to showcase peer-verified work."
          : `${userName} hasn't added any project history entries yet.`}
      </p>

      {isOwnProfile && onAddClick && (
        <Button
          onClick={onAddClick}
          className="bg-[#009698] hover:bg-[#007a7c] text-white gap-2 font-medium px-6 shadow-md rounded-xl"
        >
          <Plus className="w-4 h-4" /> Add First Project
        </Button>
      )}
    </div>
  );
};
