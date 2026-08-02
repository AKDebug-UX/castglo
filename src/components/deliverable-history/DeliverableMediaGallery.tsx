import React, { useState } from "react";
import { PlayCircle, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface DeliverableMediaGalleryProps {
  mediaUrls: string[];
}

export const DeliverableMediaGallery: React.FC<DeliverableMediaGalleryProps> = ({ mediaUrls }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const isVideo = (url: string) => {
    return (
      url.match(/\.(mp4|mov|webm|ogg)$/i) ||
      (url.includes("cloudinary.com") && url.includes("/video/upload/"))
    );
  };

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + mediaUrls.length) % mediaUrls.length);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % mediaUrls.length);
    }
  };

  return (
    <div className="w-full space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5" /> Media Gallery ({mediaUrls.length})
      </h4>

      {/* Horizontal Scroll Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {mediaUrls.map((url, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className="relative flex-shrink-0 w-36 h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer group shadow-sm hover:opacity-90 transition-opacity"
          >
            {isVideo(url) ? (
              <div className="w-full h-full flex items-center justify-center relative">
                <video src={url} className="w-full h-full object-cover opacity-75" preload="metadata" />
                <PlayCircle className="w-8 h-8 text-white absolute drop-shadow-md group-hover:scale-110 transition-transform" />
              </div>
            ) : (
              <img
                src={url}
                alt={`Media preview ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 text-white p-2 sm:p-4 overflow-hidden">
          <DialogTitle className="sr-only">Media Preview</DialogTitle>

          {selectedIndex !== null && (
            <div className="relative w-full h-[75vh] flex items-center justify-center">
              {/* Media viewer */}
              {isVideo(mediaUrls[selectedIndex]) ? (
                <video
                  src={mediaUrls[selectedIndex]}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg object-contain"
                />
              ) : (
                <img
                  src={mediaUrls[selectedIndex]}
                  alt={`Expanded media ${selectedIndex + 1}`}
                  className="max-w-full max-h-full rounded-lg object-contain"
                />
              )}

              {/* Counter tag */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium">
                {selectedIndex + 1} / {mediaUrls.length}
              </div>

              {/* Navigation Arrows */}
              {mediaUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 bg-black/60 hover:bg-black/90 p-2 rounded-full text-white transition-colors"
                    aria-label="Previous media"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 bg-black/60 hover:bg-black/90 p-2 rounded-full text-white transition-colors"
                    aria-label="Next media"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
