import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Play,
  Film,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DeliverableMediaGalleryProps {
  mediaUrls?: string[];
  title?: string;
  className?: string;
}

export function DeliverableMediaGallery({
  mediaUrls = [],
  title = "Media",
  className,
}: DeliverableMediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const isVideo = (url: string) => {
    if (!url) return false;
    const lowercaseUrl = url.toLowerCase();
    return (
      lowercaseUrl.includes(".mp4") ||
      lowercaseUrl.includes(".webm") ||
      lowercaseUrl.includes(".mov") ||
      lowercaseUrl.includes("youtube.com") ||
      lowercaseUrl.includes("vimeo.com") ||
      lowercaseUrl.includes("/video/upload/")
    );
  };

  const currentMedia = mediaUrls[selectedIndex] || mediaUrls[0];
  const currentIsVideo = isVideo(currentMedia);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Featured Media View */}
      <div className="relative group rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-96 w-full flex items-center justify-center border border-slate-800 shadow-inner">
        {currentIsVideo ? (
          <video
            src={currentMedia}
            controls
            className="w-full h-full object-contain"
            poster={mediaUrls.find((u) => !isVideo(u))}
          />
        ) : (
          <img
            src={currentMedia}
            alt={`${title} media ${selectedIndex + 1}`}
            className="w-full h-full object-contain transition-transform duration-300"
          />
        )}

        {/* Action Controls & Overlay */}
        {!currentIsVideo && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {mediaUrls.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-80 hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-80 hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
              {selectedIndex + 1} / {mediaUrls.length}
            </div>
          </>
        )}
      </div>

      {/* Horizontal Scroll Thumbnail Carousel */}
      {mediaUrls.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300">
          {mediaUrls.map((url, idx) => {
            const isVid = isVideo(url);
            const isSelected = idx === selectedIndex;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  "relative h-16 w-24 shrink-0 rounded-xl overflow-hidden border-2 bg-slate-900 transition-all duration-200",
                  isSelected
                    ? "border-[#009698] ring-2 ring-[#009698]/30 scale-105 shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                {isVid ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                    <Film className="w-5 h-5 text-[#009698]" />
                    <span className="text-[9px] font-extrabold uppercase mt-0.5">Video</span>
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}

                {isVid && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl bg-slate-950/95 border-slate-800 p-2 text-white overflow-hidden rounded-3xl">
          <div className="relative aspect-video max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={currentMedia}
              alt={title}
              className="max-h-full max-w-full object-contain"
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
