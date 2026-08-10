import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Loader2,
  X,
  Upload,
  Monitor,
  Youtube,
  ImageIcon,
  Film,
  Play,
  ImagePlus,
  Video,
} from "lucide-react";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";

export interface PortfolioMediaGalleryProps {
  profileData: any;
  setProfileData: any;
  pendingProfilePhoto: any;
  setPendingProfilePhoto: any;
  pendingPortfolioPhotos: any[];
  setPendingPortfolioPhotos?: React.Dispatch<React.SetStateAction<any[]>>;
  removePendingPortfolioPhoto: (index: number) => void;
  handlePortfolioSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pendingPortfolioVideos: any[];
  setPendingPortfolioVideos?: React.Dispatch<React.SetStateAction<any[]>>;
  removePendingPortfolioVideo: (index: number) => void;
  handlePortfolioVideoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pendingIntroVideo: any;
  setPendingIntroVideo: any;
  handleIntroVideoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: (skipValidation?: boolean) => void;
  isSaving: boolean;
}

export function PortfolioMediaGallery({
  profileData,
  setProfileData,
  pendingProfilePhoto,
  setPendingProfilePhoto,
  pendingPortfolioPhotos,
  setPendingPortfolioPhotos,
  removePendingPortfolioPhoto,
  handlePortfolioSelect,
  pendingPortfolioVideos,
  setPendingPortfolioVideos,
  removePendingPortfolioVideo,
  handlePortfolioVideoSelect,
  pendingIntroVideo,
  setPendingIntroVideo,
  handleIntroVideoSelect,
  handleSave,
  isSaving,
}: PortfolioMediaGalleryProps) {
  const savedPhotos = (profileData?.talent?.headshots || []).filter(
    (shot: any) => shot.url !== profileData?.profilePicture
  );
  const savedVideos = profileData?.talent?.portfolioVideos || [];

  const totalMedia =
    savedPhotos.length +
    savedVideos.length +
    pendingPortfolioPhotos.length +
    pendingPortfolioVideos.length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="pb-4 border-b">
        <h2 className="text-xl font-bold tracking-tight text-[#006b6d] flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#009698]" />
          Portfolio &amp; Media
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          High-quality media increases your chances of being shortlisted by 70%.
        </p>
      </div>

      {/* ── Main Profile Photo ── */}
      {(pendingProfilePhoto?.preview || profileData?.profilePicture) && (
        <div className="space-y-4 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-bold text-lg">Main Profile Photo</p>
              <p className="text-xs text-muted-foreground">
                This is your primary representative image across the platform.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[#009698] hover:bg-[#009698]/5 font-bold"
            >
              <label htmlFor="profile-photo-upload" className="cursor-pointer">
                Change Main Photo
              </label>
            </Button>
          </div>

          <div className="relative w-full sm:w-64 aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-xl group">
            <img
              src={pendingProfilePhoto?.preview || profileData?.profilePicture}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-[#009698] text-white border-none px-3 py-1 shadow-lg">
                PRIMARY HEADSHOT
              </Badge>
            </div>
            {pendingProfilePhoto && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#009698]" />
                  <span className="text-sm font-bold text-[#009698]">
                    Uploading...
                  </span>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label
                htmlFor="profile-photo-upload"
                className="h-12 w-12 rounded-full bg-white text-[#009698] flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform"
              >
                <Camera className="w-6 h-6" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Mixed Media Grid: Photos + Videos ── */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="font-bold text-lg">Portfolio Media</p>
            <p className="text-xs text-muted-foreground">
              Add up to 10 photos and videos — casting directors love variety.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {totalMedia < 10 && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#009698] text-[#009698] text-sm font-bold cursor-pointer hover:bg-[#009698]/5 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePortfolioSelect}
                    disabled={isSaving}
                  />
                  <ImagePlus className="w-4 h-4" />
                  Add Photos
                </label>
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#009698] text-[#009698] text-sm font-bold cursor-pointer hover:bg-[#009698]/5 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    className="hidden"
                    onChange={handlePortfolioVideoSelect}
                    disabled={isSaving}
                  />
                  <Film className="w-4 h-4" />
                  Add Videos
                </label>
              </div>
            )}
          </div>
        </div>

        {totalMedia === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center bg-gray-50/50 space-y-4">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <ImageIcon className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Film className="w-7 h-7 text-muted-foreground/40" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No portfolio media yet — add photos or videos above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* ── Saved Photos ── */}
            {savedPhotos.map((shot: any) => (
              <div key={shot._id} className="flex flex-col gap-2">
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-gray-100 group transition-all duration-300 hover:border-[#009698]/50 shadow-sm"
                >
                  <img
                    src={shot.url}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-10 w-10 rounded-full shadow-xl transform scale-0 group-hover:scale-100 transition-transform duration-300"
                      onClick={async () => {
                        try {
                          await profileAPI.deleteHeadshot(shot._id);
                          setProfileData((prev: any) => ({
                            ...prev,
                            talent: {
                              ...(prev?.talent || {}),
                              headshots: (prev?.talent?.headshots || []).filter(
                                (s: any) => s._id !== shot._id
                              ),
                            },
                          }));
                          toast.success("Image removed");
                        } catch {
                          toast.error("Failed to delete image");
                        }
                      }}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <Input
                  type="text"
                  placeholder="Image title (e.g. Commercial Headshot)"
                  value={shot.caption || ""}
                  className="h-9 text-sm text-center border-gray-200 focus-visible:ring-[#009698] rounded-xl bg-white shadow-sm"
                  onChange={(e) => {
                    const nextHeadshots = (profileData?.talent?.headshots || []).map((s: any) =>
                      s._id === shot._id ? { ...s, caption: e.target.value } : s
                    );
                    setProfileData((prev: any) => ({
                      ...prev,
                      talent: {
                        ...(prev?.talent || {}),
                        headshots: nextHeadshots,
                      }
                    }));
                  }}
                />
              </div>
            ))}

            {/* ── Saved Portfolio Videos ── */}
            {savedVideos.map((vid: any, i: number) => {
              const videoUrl = typeof vid === "string" ? vid : vid.url;
              const videoCaption = typeof vid === "string" ? "" : (vid.caption || "");
              return (
                <div key={i} className="flex flex-col gap-2">
                  <div
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-gray-100 group transition-all duration-300 hover:border-[#009698]/50 shadow-sm bg-black"
                  >
                    <video
                      src={videoUrl}
                      className="w-full h-full object-cover opacity-80"
                      muted
                      preload="metadata"
                    />
                    {/* Play badge */}
                    <div className="absolute top-2 left-2">
                      <div className="w-6 h-6 rounded-full bg-[#009698] flex items-center justify-center shadow-lg">
                        <Play className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-10 w-10 rounded-full shadow-xl transform scale-0 group-hover:scale-100 transition-transform duration-300"
                        onClick={() => {
                          setProfileData((prev: any) => ({
                            ...prev,
                            talent: {
                              ...(prev?.talent || {}),
                              portfolioVideos: (
                                prev?.talent?.portfolioVideos || []
                              ).filter((_: any, idx: number) => idx !== i),
                            },
                          }));
                          toast.success("Video removed");
                        }}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <Input
                    type="text"
                    placeholder="Video title (e.g. Acting Showreel)"
                    value={videoCaption}
                    className="h-9 text-sm text-center border-gray-200 focus-visible:ring-[#009698] rounded-xl bg-white shadow-sm"
                    onChange={(e) => {
                      const nextVideos = (profileData?.talent?.portfolioVideos || []).map((v: any, idx: number) =>
                        idx === i
                          ? (typeof v === "object" ? { ...v, caption: e.target.value } : { url: v, caption: e.target.value })
                          : v
                      );
                      setProfileData((prev: any) => ({
                        ...prev,
                        talent: {
                          ...(prev?.talent || {}),
                          portfolioVideos: nextVideos,
                        }
                      }));
                    }}
                  />
                </div>
              );
            })}

            {/* ── Pending Photos (queued for upload) ── */}
            {pendingPortfolioPhotos.map((photo, index) => (
              <div key={`pp-${index}`} className="flex flex-col gap-2">
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-[#009698]/40 bg-[#009698]/5 animate-pulse"
                >
                  <img
                    src={photo.preview}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white text-destructive shadow-lg"
                      onClick={() => removePendingPortfolioPhoto(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center">
                    <Badge variant="secondary" className="text-[8px] bg-white/80">
                      PENDING PHOTO
                    </Badge>
                  </div>
                </div>
                {setPendingPortfolioPhotos && (
                  <Input
                    type="text"
                    placeholder="Enter image title..."
                    value={photo.caption || ""}
                    className="h-9 text-sm text-center border-gray-200 focus-visible:ring-[#009698] rounded-xl bg-white shadow-sm"
                    onChange={(e) => {
                      setPendingPortfolioPhotos((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? { ...item, caption: e.target.value } : item
                        )
                      );
                    }}
                  />
                )}
              </div>
            ))}

            {/* ── Pending Videos (queued for upload) ── */}
            {pendingPortfolioVideos.map((vid, index) => (
              <div key={`pv-${index}`} className="flex flex-col gap-2">
                <div
                  className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-[#009698]/40 bg-[#009698]/5 animate-pulse bg-black"
                >
                  <video
                    src={vid.preview}
                    className="w-full h-full object-cover opacity-50"
                    muted
                    preload="metadata"
                  />
                  {/* Video icon overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Video className="w-5 h-5 text-[#009698]" />
                    </div>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-white text-destructive shadow-lg"
                      onClick={() => removePendingPortfolioVideo(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center">
                    <Badge variant="secondary" className="text-[8px] bg-white/80 max-w-full truncate">
                      {vid.name.length > 16 ? vid.name.slice(0, 14) + "…" : vid.name}
                    </Badge>
                  </div>
                </div>
                {setPendingPortfolioVideos && (
                  <Input
                    type="text"
                    placeholder="Enter video title..."
                    value={vid.caption || ""}
                    className="h-9 text-sm text-center border-gray-200 focus-visible:ring-[#009698] rounded-xl bg-white shadow-sm"
                    onChange={(e) => {
                      setPendingPortfolioVideos((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? { ...item, caption: e.target.value } : item
                        )
                      );
                    }}
                  />
                )}
              </div>
            ))}

            {/* ── Add More slot (inline, when slots remain) ── */}
            {totalMedia < 10 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors group">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    // Route by MIME type
                    if (!e.target.files) return;
                    const imageFiles = Array.from(e.target.files).filter((f) =>
                      f.type.startsWith("image/")
                    );
                    const videoFiles = Array.from(e.target.files).filter((f) =>
                      f.type.startsWith("video/")
                    );
                    if (imageFiles.length > 0) {
                      const syntheticImg = {
                        target: { files: imageFiles },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handlePortfolioSelect(syntheticImg);
                    }
                    if (videoFiles.length > 0) {
                      const syntheticVid = {
                        target: { files: videoFiles },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handlePortfolioVideoSelect(syntheticVid);
                    }
                  }}
                  disabled={isSaving}
                />
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#009698]/10 group-hover:text-[#009698] transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-muted-foreground group-hover:text-[#009698] text-center leading-tight">
                  Add<br />Media
                </span>
              </label>
            )}
          </div>
        )}

        {/* Bottom Upload Action Button */}
        {(pendingPortfolioPhotos.length > 0 || pendingPortfolioVideos.length > 0) && (
          <div className="flex justify-center sm:justify-end pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <Button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="w-full sm:w-auto bg-[#009698] hover:bg-[#009698]/90 font-bold px-8 py-6 rounded-2xl shadow-xl shadow-[#009698]/20 flex items-center gap-3 text-lg"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              Upload {pendingPortfolioPhotos.length + pendingPortfolioVideos.length} Pending {pendingPortfolioPhotos.length + pendingPortfolioVideos.length === 1 ? 'Item' : 'Items'}
            </Button>
          </div>
        )}
      </div>

      {/* ── Introduction Video (unchanged) ── */}
      <div className="pt-10 border-t space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-lg">Introduction Video</p>
            <p className="text-xs text-muted-foreground">
              Upload a 30–60s video introducing yourself.
            </p>
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <Input
              type="file"
              accept="video/*"
              className="hidden"
              id="video-upload"
              onChange={handleIntroVideoSelect}
              disabled={isSaving}
            />
            <Button
              variant="outline"
              asChild
              className="flex-1 sm:flex-none rounded-xl border-[#009698] text-[#009698] hover:bg-[#009698]/5 font-bold"
            >
              <label htmlFor="video-upload" className="cursor-pointer">
                <Monitor className="w-4 h-4 mr-2" />
                Select Video
              </label>
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={isSaving || !pendingIntroVideo}
              className="flex-1 sm:flex-none bg-[#009698] hover:bg-[#009698]/90 font-bold px-6 rounded-xl shadow-lg shadow-[#009698]/20"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Upload Video"
              )}
            </Button>
          </div>
        </div>

        {pendingIntroVideo ? (
          <div className="rounded-2xl border-2 border-[#009698]/30 bg-[#009698]/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#009698] shadow-sm">
                  <Youtube className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold truncate max-w-[200px]">
                    {pendingIntroVideo.name}
                  </p>
                  <p className="text-xs text-[#009698] font-medium">
                    Ready for upload •{" "}
                    {(pendingIntroVideo.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive rounded-full"
                onClick={() => setPendingIntroVideo(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : profileData?.unifiedTalentProfile?.intro_video ? (
          <div className="rounded-2xl overflow-hidden border bg-black shadow-xl group">
            <video
              src={profileData.unifiedTalentProfile.intro_video}
              controls
              className="w-full aspect-video object-contain"
            />
            <div className="bg-white/95 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">
                  Live Portfolio Video
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-primary"
              >
                Replace
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center bg-gray-50/50">
            <Youtube className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-sm font-medium text-muted-foreground">
              Showcase your personality and communication skills.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              MP4 or MOV formats supported (Max 100MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
