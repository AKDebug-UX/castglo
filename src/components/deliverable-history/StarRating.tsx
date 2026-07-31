import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // 0 to 5 (can be decimal for display)
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  showText?: boolean;
  reviewCount?: number;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
  showText = false,
  reviewCount,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1;
          const isFull = activeRating >= starValue;
          const isHalf = !isFull && activeRating >= starValue - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={cn(
                "transition-transform focus:outline-none",
                interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
              )}
            >
              <Star
                className={cn(
                  starSizes[size],
                  isFull
                    ? "fill-amber-400 text-amber-400"
                    : isHalf
                    ? "fill-amber-400/50 text-amber-400"
                    : "fill-muted/20 text-muted-foreground/30"
                )}
              />
            </button>
          );
        })}
      </div>

      {showText && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {Number(rating).toFixed(1)}
          {typeof reviewCount === "number" && (
            <span className="text-muted-foreground font-normal ml-1">
              ({reviewCount})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
