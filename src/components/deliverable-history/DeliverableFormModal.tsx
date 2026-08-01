import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deliverableHistoryAPI, projectAPI, uploadAPI } from "@/lib/api";
import { toast } from "sonner";
import { DeliverableItem } from "./DeliverableCard";
import { Plus, X, Image as ImageIcon, Link as LinkIcon, Film, Loader2, Upload } from "lucide-react";

interface DeliverableFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: DeliverableItem | null;
  onSuccess?: () => void;
}

const PRODUCTION_TYPES = [
  "Film",
  "TV",
  "Theatre",
  "Commercial",
  "Music Video",
  "Short Film",
  "Web Series",
  "Documentary",
  "Podcast",
  "Photography",
  "Other",
] as const;

export function DeliverableFormModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: DeliverableFormModalProps) {
  const isEditing = !!initialData;

  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [productionType, setProductionType] = useState<string>("Film");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [description, setDescription] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaInput, setNewMediaInput] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setRole(initialData.role || "");
      setProductionType(initialData.productionType || "Film");
      setYear(initialData.year ? String(initialData.year) : new Date().getFullYear().toString());
      setDescription(initialData.description || "");
      setMediaUrls(initialData.mediaUrls || []);
      setProjectId(initialData.projectId ? String(initialData.projectId) : "");
    } else {
      setTitle("");
      setRole("");
      setProductionType("Film");
      setYear(new Date().getFullYear().toString());
      setDescription("");
      setMediaUrls([]);
      setProjectId("");
    }
  }, [initialData, open]);

  // Load platform projects for project link dropdown
  useEffect(() => {
    if (!open) return;
    const fetchUserProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await projectAPI.getMe();
        if (res.data?.success) {
          const list = Array.isArray(res.data.data)
            ? res.data.data
            : res.data.data?.projects || res.data.data?.castingCalls || [];
          setMyProjects(list);
        }
      } catch (err) {
        console.error("Failed to load user projects for dropdown:", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchUserProjects();
  }, [open]);

  const handleAddMediaUrl = () => {
    const url = newMediaInput.trim();
    if (!url) return;
    if (mediaUrls.length >= 20) {
      toast.error("Maximum 20 media items allowed.");
      return;
    }
    setMediaUrls((prev) => [...prev, url]);
    setNewMediaInput("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (mediaUrls.length + files.length > 20) {
      toast.error("Maximum 20 media items allowed.");
      return;
    }

    setUploadingMedia(true);
    try {
      const uploadedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("image", files[i]);
        const res = await uploadAPI.uploadImage(formData);
        const url = res.data?.data?.url || res.data?.url;
        if (url) uploadedList.push(url);
      }
      setMediaUrls((prev) => [...prev, ...uploadedList]);
      toast.success(`${uploadedList.length} file(s) uploaded successfully!`);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.response?.data?.message || "Failed to upload media file.");
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const handleRemoveMediaUrl = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a project title.");
      return;
    }
    if (!role.trim()) {
      toast.error("Please enter your role or credit.");
      return;
    }

    const currentYearNum = new Date().getFullYear();
    const yearNum = year ? parseInt(year, 10) : undefined;
    if (yearNum && (yearNum < 1900 || yearNum > currentYearNum)) {
      toast.error(`Please enter a valid year between 1900 and ${currentYearNum}.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title: title.trim(),
        role: role.trim(),
        productionType: productionType || undefined,
        description: description.trim() || undefined,
        year: yearNum,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        projectId: projectId && projectId !== "none" ? projectId : undefined,
      };

      if (isEditing && initialData?.id) {
        await deliverableHistoryAPI.update(initialData.id, payload);
        toast.success("Deliverable history entry updated successfully!");
      } else {
        await deliverableHistoryAPI.create(payload);
        toast.success("Deliverable history entry created successfully!");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        toast.error("Backend endpoint for Deliverable History (POST /deliverable-history) returned 404. Please deploy the latest backend build.");
      } else {
        toast.error(err?.response?.data?.message || "Failed to save deliverable entry.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            {isEditing ? "Edit Deliverable History Entry" : "Add Completed Project"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Update details of your completed work entry."
              : "Add a verified project entry to your public deliverable history portfolio."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Project Title & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="deliv-title" className="text-xs font-bold uppercase text-slate-500">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deliv-title"
                placeholder="e.g. The Lost Signal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deliv-role" className="text-xs font-bold uppercase text-slate-500">
                Your Role / Credit <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deliv-role"
                placeholder="e.g. Director, Lead Actor, DP"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                maxLength={200}
                required
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Production Type & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-slate-500">Production Type</Label>
              <Select value={productionType} onValueChange={setProductionType}>
                <SelectTrigger className="rounded-xl text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {PRODUCTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="text-xs">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deliv-year" className="text-xs font-bold uppercase text-slate-500">
                Year of Completion
              </Label>
              <Input
                id="deliv-year"
                type="number"
                placeholder={new Date().getFullYear().toString()}
                min="1900"
                max={new Date().getFullYear().toString()}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="deliv-desc" className="text-xs font-bold uppercase text-slate-500">
              Project Description / Synopsis
            </Label>
            <Textarea
              id="deliv-desc"
              placeholder="Describe the production, plot, key highlights, or awards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={5000}
              className="rounded-xl text-xs resize-none"
            />
          </div>

          {/* Media Multi-File Upload & URL Inputs */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500 flex items-center justify-between">
              <span>Media (photos/clips)</span>
              <span className="text-[10px] text-muted-foreground font-normal">Max 20</span>
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-[#009698] bg-slate-50 hover:bg-[#DEFCFE]/20 cursor-pointer transition-colors text-xs font-semibold text-slate-700">
                {uploadingMedia ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#009698]" />
                ) : (
                  <Upload className="w-4 h-4 text-[#009698]" />
                )}
                <span>{uploadingMedia ? "Uploading..." : "Upload Photos / Clips"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploadingMedia || mediaUrls.length >= 20}
                  className="hidden"
                />
              </label>

              <div className="flex gap-1.5">
                <Input
                  placeholder="Or paste media URL"
                  value={newMediaInput}
                  onChange={(e) => setNewMediaInput(e.target.value)}
                  className="rounded-xl text-xs flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMediaUrl();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMediaUrl}
                  disabled={mediaUrls.length >= 20}
                  className="rounded-xl text-xs px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Thumbnail previews */}
            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-2 max-h-36 overflow-y-auto">
                {mediaUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-200"
                  >
                    <img src={url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveMediaUrl(idx)}
                      className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-90 hover:opacity-100 hover:bg-destructive transition-colors"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Project Link */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-bold uppercase text-slate-500">
              Link to Platform Project (Optional)
            </Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="rounded-xl text-xs">
                <SelectValue placeholder="Select platform project if applicable" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none" className="text-xs">
                  None (External / Manual Project)
                </SelectItem>
                {myProjects.map((p) => {
                  const pId = p._id || p.id;
                  return (
                    <SelectItem key={pId} value={pId} className="text-xs">
                      {p.projectName || p.title}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#009698] hover:bg-[#009698]/90 text-white font-bold rounded-xl px-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Publish Entry"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
