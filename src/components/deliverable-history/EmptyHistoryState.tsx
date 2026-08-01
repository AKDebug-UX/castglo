import React from "react";
import { FolderPlus, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyHistoryStateProps {
  isOwner: boolean;
  userFullName?: string;
  onAddClick?: () => void;
}

export function EmptyHistoryState({
  isOwner,
  userFullName = "This user",
  onAddClick,
}: EmptyHistoryStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-muted/20 border border-dashed border-border rounded-3xl animate-fade-in">
      <div className="w-16 h-16 rounded-3xl bg-[#DEFCFE] text-[#009698] flex items-center justify-center mb-4 shadow-sm">
        <Award className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1">
        {isOwner ? "No Deliverable History Yet" : "No Completed Projects Listed"}
      </h3>

      <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {isOwner
          ? "You haven't added any project history yet. Add your first completed project."
          : `${userFullName} hasn't added any project history yet.`}
      </p>

      {isOwner && onAddClick && (
        <Button
          onClick={onAddClick}
          className="bg-[#009698] hover:bg-[#009698]/90 text-white font-bold rounded-xl px-6 py-2.5 shadow-md shadow-[#009698]/10 flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Add Completed Project</span>
        </Button>
      )}
    </div>
  );
}
