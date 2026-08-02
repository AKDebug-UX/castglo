import React from "react";
import { DeliverableEntry } from "./types";
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Film, Calendar, MessageSquare, MoreVertical, Edit2, Trash2, Link2, PlayCircle, Image as ImageIcon 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DeliverableCardProps {
  entry: DeliverableEntry;
  isOwner?: boolean;
  onSelect: (entry: DeliverableEntry) => void;
  onEdit?: (entry: DeliverableEntry) => void;
  onDelete?: (entry: DeliverableEntry) => void;
}

export const DeliverableCard: React.FC<DeliverableCardProps> = ({
  entry,
  isOwner = false,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const ratingNum = typeof entry.averageRating === "string" 
    ? parseFloat(entry.averageRating) 
    : (entry.averageRating || 0);

  const reviewCount = entry.reviewCount || entry._count?.reviews || 0;
  const firstMedia = entry.mediaUrls && entry.mediaUrls.length > 0 ? entry.mediaUrls[0] : null;

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|mov|webm|ogg)$/i) || url.includes("cloudinary.com") && url.includes("/video/upload/");
  };

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
      onClick={() => onSelect(entry)}
    >
      {/* Media Thumbnail Container */}
      <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {firstMedia ? (
          isVideo(firstMedia) ? (
            <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
              <video src={firstMedia} className="w-full h-full object-cover opacity-80" muted preload="metadata" />
              <PlayCircle className="w-12 h-12 text-white/90 absolute drop-shadow-md" />
            </div>
          ) : (
            <img 
              src={firstMedia} 
              alt={entry.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
            <Film className="w-10 h-10 mb-1 opacity-50" />
            <span className="text-xs font-medium">No media uploaded</span>
          </div>
        )}

        {/* Media count pill if multiple */}
        {entry.mediaUrls && entry.mediaUrls.length > 1 && (
          <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {entry.mediaUrls.length}
          </span>
        )}

        {/* Linked project badge */}
        {entry.projectId && (
          <span className="absolute top-2.5 left-2.5 bg-[#009698]/90 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <Link2 className="w-3 h-3" /> Project Verified
          </span>
        )}

        {/* Owner kebab menu */}
        {isOwner && (
          <div 
            className="absolute top-2.5 right-2.5 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(entry)} className="gap-2 text-xs">
                    <Edit2 className="w-3.5 h-3.5" /> Edit Project
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(entry)} 
                    className="gap-2 text-xs text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Entry
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <Badge className="bg-teal-50 dark:bg-teal-950/60 text-[#009698] hover:bg-teal-100 border-none font-semibold text-xs px-2.5 py-0.5">
              {entry.role}
            </Badge>

            {entry.year && (
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3" /> {entry.year}
              </span>
            )}
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-[#009698] transition-colors">
            {entry.title}
          </h3>

          {entry.productionType && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {entry.productionType}
            </p>
          )}

          {entry.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
              {entry.description}
            </p>
          )}
        </div>

        {/* Card Footer: Rating & Reviews */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <StarRating 
            rating={ratingNum} 
            size={14} 
            showValue={ratingNum > 0} 
          />

          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>
    </div>
  );
};
