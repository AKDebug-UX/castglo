import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { Film, Calendar, Image as ImageIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeliverableItem {
  id: string;
  userId: string;
  projectId?: string | null;
  title: string;
  role: string;
  productionType?: string;
  description?: string;
  year?: number;
  mediaUrls?: string[];
  isPublic?: boolean;
  averageRating?: number | string;
  reviewCount?: number;
  createdAt?: string;
  user?: {
    id: string;
    fullName: string;
    profilePicture?: string;
    role?: string;
  };
  project?: {
    id: string;
    title: string;
  };
  _count?: {
    reviews?: number;
  };
}

interface DeliverableCardProps {
  item: DeliverableItem;
  onClick?: () => void;
  className?: string;
}

export function DeliverableCard({ item, onClick, className }: DeliverableCardProps) {
  const ratingNum = Number(item.averageRating || 0);
  const reviewCount = item.reviewCount ?? item._count?.reviews ?? 0;
  const firstMedia = item.mediaUrls?.[0];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group hover:shadow-lg transition-all duration-200 border-slate-200/80 rounded-2xl overflow-hidden cursor-pointer bg-white flex flex-col justify-between",
        className
      )}
    >
      <CardContent className="p-5 flex flex-col justify-between flex-1 space-y-4">
        {/* Top Header info */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-[#DEFCFE] text-[#009698] border-none text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  {item.role || "Participant"}
                </Badge>
                {item.productionType && (
                  <Badge variant="outline" className="text-[10px] text-slate-600 font-semibold border-slate-200 rounded-full">
                    {item.productionType}
                  </Badge>
                )}
                {item.projectId && (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Platform Verified</span>
                  </Badge>
                )}
              </div>
              <h4 className="font-bold text-base text-slate-900 group-hover:text-[#009698] transition-colors truncate mt-1">
                {item.title}
              </h4>
            </div>

            {item.year && (
              <span className="text-xs font-semibold text-slate-400 shrink-0 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {item.year}
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Media Thumbnail preview if available */}
        {firstMedia && (
          <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
            <img
              src={firstMedia}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {item.mediaUrls && item.mediaUrls.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                +{item.mediaUrls.length - 1}
              </span>
            )}
          </div>
        )}

        {/* Footer info: Rating & Review count */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <StarRating rating={ratingNum} size="sm" showText reviewCount={reviewCount} />

          <span className="text-[11px] font-semibold text-[#009698] group-hover:underline flex items-center gap-1">
            View Details
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
