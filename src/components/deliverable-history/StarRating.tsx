import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: number;
  showValue?: boolean;
  countText?: string;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  interactive = false,
  onRatingChange,
  size = 18,
  showValue = false,
  countText,
  className
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleClick = (starValue: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (interactive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = displayRating >= star;
          const half = !filled && displayRating >= star - 0.5;

          return (
            <button
              key={star}
              type={interactive ? "button" : undefined}
              disabled={!interactive}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              className={cn(
                "p-0.5 rounded transition-transform focus:outline-none",
                interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
              )}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                size={size}
                className={cn(
                  "transition-colors",
                  filled
                    ? "fill-amber-400 text-amber-400"
                    : half
                    ? "fill-amber-400/50 text-amber-400"
                    : "fill-slate-100 text-slate-300 dark:fill-slate-800 dark:text-slate-700"
                )}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm ml-0.5">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {countText && (
        <span className="text-slate-500 text-xs font-normal">
          ({countText})
        </span>
      )}
    </div>
  );
};
