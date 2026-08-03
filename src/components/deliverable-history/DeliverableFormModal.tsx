import React, { useState, useEffect } from "react";
import { DeliverableEntry, PRODUCTION_TYPES, ProductionType } from "./types";
import { deliverableHistoryAPI, uploadAPI, projectAPI } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FolderKanban, Upload, Trash2, Plus, Loader2, Link2, Film, Image as ImageIcon, PlayCircle 
} from "lucide-react";
import { toast } from "sonner";

interface DeliverableFormModalProps {
  isOpen: boolean;
  entry?: DeliverableEntry | null;
  onClose: () => void;
  onSuccess: (entry: DeliverableEntry) => void;
}

export const DeliverableFormModal: React.FC<DeliverableFormModalProps> = ({
  isOpen,
  entry,
  onClose,
  onSuccess
}) => {
  const currentYear = new Date().getFullYear();

  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [productionType, setProductionType] = useState<string>("Film");
  const [year, setYear] = useState<number>(currentYear);
  const [description, setDescription] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);

  const [customMediaInput, setCustomMediaInput] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProjects, setUserProjects] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || "");
      setRole(entry.role || "");
      setProductionType(entry.productionType || "Film");
      setYear(entry.year || currentYear);
      setDescription(entry.description || "");
      setMediaUrls(entry.mediaUrls || []);
      setProjectId(entry.projectId || null);
    } else {
      setTitle("");
      setRole("");
      setProductionType("Film");
      setYear(currentYear);
      setDescription("");
      setMediaUrls([]);
      setProjectId(null);
    }
  }, [entry, isOpen]);

  // Load platform projects for project linking dropdown
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectAPI.getMe();
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setUserProjects(res.data.data);
        } else if (Array.isArray(res.data)) {
          setUserProjects(res.data);
        }
      } catch (err) {
        // Silent catch if not a director or projects fail to load
      }
    };
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mediaUrls.length + files.length > 3) {
      toast.error("You can upload a maximum of 3 media files per project.");
      return;
    }

    setIsUploadingMedia(true);
    try {
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`File "${file.name}" exceeds 50MB limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append("image", file);
        const res = await uploadAPI.uploadImage(formData);

        const url = res.data?.data?.url || res.data?.url || res.data?.imageUrl;
        if (url) {
          uploaded.push(url);
        }
      }

      if (uploaded.length > 0) {
        setMediaUrls((prev) => [...prev, ...uploaded]);
        toast.success(`Successfully uploaded ${uploaded.length} media file(s).`);
      }
    } catch (err) {
      toast.error("Failed to upload media file. Please try again.");
    } finally {
      setIsUploadingMedia(false);
      e.target.value = "";
    }
  };

  const handleAddMediaUrl = () => {
    if (!customMediaInput.trim()) return;
    if (mediaUrls.length >= 3) {
      toast.error("Maximum 3 media items allowed.");
      return;
    }
    setMediaUrls((prev) => [...prev, customMediaInput.trim()]);
    setCustomMediaInput("");
  };

  const handleRemoveMedia = (idx: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Project Title is required.");
      return;
    }
    if (!role.trim()) {
      toast.error("Your Role / Credit is required.");
      return;
    }
    if (!description.trim()) {
      toast.error("Project Description is required.");
      return;
    }
    if (year < 1900 || year > currentYear + 1) {
      toast.error(`Year must be between 1900 and ${currentYear + 1}`);
      return;
    }

    setIsSubmitting(true);
    const payload: any = {
      title: title.trim(),
      role: role.trim(),
      productionType,
      year: Number(year),
      description: description.trim(),
      mediaUrls,
    };

    if (projectId) {
      payload.projectId = projectId;
    }

    try {
      let saved: DeliverableEntry;
      if (entry) {
        const res = await deliverableHistoryAPI.update(entry.id, payload);
        saved = res.data?.data || res.data;
        toast.success("Project entry updated successfully!");
      } else {
        const res = await deliverableHistoryAPI.create(payload);
        saved = res.data?.data || res.data;
        toast.success("Project history entry created!");
      }
      onSuccess(saved);
      onClose();
    } catch (err: any) {
      const errData = err?.response?.data;
      const errMsg = Array.isArray(errData?.data) && errData.data.length > 0
        ? errData.data[0]
        : errData?.message || errData?.error || "Failed to save project entry.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <FolderKanban className="w-5 h-5 text-[#009698]" />
            {entry ? "Edit Deliverable History Entry" : "Add Project History Entry"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-3">
          {/* Title & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Project Title *
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Lost Signal"
                maxLength={300}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Role / Credit *
              </Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Director, Lead Actor, DP"
                maxLength={200}
                required
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Production Type & Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Production Type
              </Label>
              <Select value={productionType} onValueChange={setProductionType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Year of Completion
              </Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1900}
                max={currentYear + 1}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Project Description *
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the storyline, production scope, or key achievements..."
              maxLength={5000}
              rows={4}
              required
              className="rounded-xl text-sm"
            />
          </div>

          {/* Link to Platform Project (Optional) */}
          {userProjects.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#009698]" /> Link to Castglo Platform Project (optional)
              </Label>
              <Select
                value={projectId || "none"}
                onValueChange={(val) => setProjectId(val === "none" ? null : val)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select platform project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No platform project link</SelectItem>
                  {userProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Media Upload Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#009698]" /> Media & Stills (Max 3)
              </Label>
              <span className="text-[11px] text-slate-400 font-medium">
                {mediaUrls.length} / 3 items
              </span>
            </div>

            {/* File Upload Dropzone / Button */}
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700">
                {isUploadingMedia ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#009698]" />
                ) : (
                  <Upload className="w-4 h-4 text-[#009698]" />
                )}
                Upload Stills / Video Clips
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={isUploadingMedia || mediaUrls.length >= 3}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-slate-400">or</span>

              <div className="flex-1 flex items-center gap-1.5">
                <Input
                  value={customMediaInput}
                  onChange={(e) => setCustomMediaInput(e.target.value)}
                  placeholder="Paste image/video URL..."
                  className="rounded-xl h-9 text-xs"
                />
                <Button
                  type="button"
                  onClick={handleAddMediaUrl}
                  disabled={!customMediaInput.trim()}
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-9 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Media Thumbnails Grid */}
            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                {mediaUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group w-full h-20 bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800"
                  >
                    <img src={url} alt="Uploaded preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingMedia}
              className="bg-[#009698] hover:bg-[#007a7c] text-white rounded-xl gap-2 font-semibold px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                entry ? "Save Changes" : "Create Entry"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
