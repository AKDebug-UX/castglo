import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Link as LinkIcon, FileCheck, X, FileText, Image as ImageIcon } from "lucide-react";
import { applicationAPI, uploadAPI } from "@/lib/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/utils";

interface ProjectSubmissionModalProps {
  submission?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSubmissionModal({ submission, isOpen, onClose }: ProjectSubmissionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ id: string; url: string | null; file: File }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic project selection states
  const [acceptedProjects, setAcceptedProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    const previews = files.map((f, idx) => ({
      id: `${f.name}-${f.size}-${idx}`,
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      file: f,
    }));
    setFilePreviews(previews);

    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [files]);

  const activeSubmissionId =
    submission?._id ||
    submission?.id ||
    submission?.applicationId ||
    submission?.projectId ||
    (typeof submission?.castingCallId === "string" ? submission.castingCallId : submission?.castingCallId?._id || submission?.castingCallId?.id) ||
    "";

  useEffect(() => {
    if (isOpen) {
      const fetchAcceptedProjects = async () => {
        setIsLoadingProjects(true);
        try {
          const res = await applicationAPI.getMe();
          if (res.data?.success) {
            const apps = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.applications || []);
            setAcceptedProjects(apps);

            if (apps.length > 0 && !activeSubmissionId) {
              const firstId = apps[0]._id || apps[0].id || apps[0].applicationId || "";
              setSelectedProjectId(firstId);
            }
          }
        } catch (error) {
          console.error("Failed to load accepted projects:", error);
        } finally {
          setIsLoadingProjects(false);
        }
      };
      fetchAcceptedProjects();
    }
  }, [isOpen, submission, activeSubmissionId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles = Array.from(selectedFiles);
    if (files.length + newFiles.length > 20) {
      toast.error("Maximum 20 files allowed per submission.");
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleRemoveFileAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllFiles = () => {
    setFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetSubmissionId = activeSubmissionId || selectedProjectId;

    if (!targetSubmissionId) {
      toast.error("Please select a project to submit work for.");
      return;
    }

    if (files.length === 0 && !externalLink.trim() && !description.trim()) {
      toast.error("Please upload at least one file/image, provide an external link, or add notes for your deliverable.");
      return;
    }

    const submissionTitle = title.trim() || submission?.castingCall?.title || "Project Deliverable";

    setIsSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      if (files.length > 0) {
        for (const f of files) {
          const formData = new FormData();
          formData.append("image", f);
          const uploadRes = await uploadAPI.uploadImage(formData);
          const url = uploadRes.data?.data?.url || uploadRes.data?.url || "";
          if (url) uploadedUrls.push(url);
        }
      }

      const fileFormattedList =
        uploadedUrls.length > 0 ? uploadedUrls.join("\n") : "None";

      // Format the delivery message
      const deliveryMessage = `📦 **Project Deliverable Submitted**\n\n**Title:** ${submissionTitle}\n**Link:** ${externalLink.trim() || "None"}\n**Files (${uploadedUrls.length}):**\n${fileFormattedList}\n\n**Notes:**\n${description.trim() || "No additional notes."}`;


      // Send via communication API
      const res = await applicationAPI.addCommunication(targetSubmissionId, deliveryMessage);

      if (res.data?.success) {
        toast.success("Project deliverables submitted successfully!");
        onClose();
        // Reset state
        setTitle("");
        setDescription("");
        setExternalLink("");
        setFiles([]);
      } else {
        toast.error(res.data?.message || "Failed to submit deliverables.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "An error occurred during submission."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] rounded-[24px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileCheck className="w-5 h-5 text-teal-600" />
            Submit Project Deliverables
          </DialogTitle>
          {activeSubmissionId ? (
            <DialogDescription>
              Submit your work for: <strong>{submission?.castingCall?.title || submission?.title || "Selected Project"}</strong>
            </DialogDescription>
          ) : (
            <DialogDescription>
              Select an active project or casting call and submit your deliverables.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {!activeSubmissionId && (
            <div className="space-y-2">
              <Label htmlFor="projectSelect">Select Project / Casting Call <span className="text-destructive">*</span></Label>
              {isLoadingProjects ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading projects...
                </div>
              ) : acceptedProjects.length > 0 ? (
                <select
                  id="projectSelect"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                >
                  {acceptedProjects.map((proj, idx) => {
                    const pId = proj.id || proj._id || proj.applicationId || "";
                    const titleVal =
                      proj.castingCall?.title ||
                      proj.castingCallId?.project_title ||
                      proj.project?.projectName ||
                      proj.castingCall?.project_title ||
                      proj.project?.title ||
                      proj.title ||
                      (typeof proj.castingCallId === "string" ? `Casting Call #${proj.castingCallId.substring(0, 8)}` : null) ||
                      `Application #${String(pId).substring(0, 8)}`;
                    const role = proj.appliedRole || proj.role?.role_name || proj.role?.title || proj.role?.name || "Standard Role";
                    const statusStr = proj.status ? ` (${proj.status.toUpperCase()})` : "";
                    return (
                      <option key={pId || idx} value={pId}>
                        {titleVal} - {role}{statusStr}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <p className="text-sm text-destructive font-medium">No active projects or casting calls found.</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Deliverable Title (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g. Final Video Cut, Voiceover WAV file, Draft 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">External Link / URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="link"
                className="pl-9"
                placeholder="Google Drive, Dropbox, YouTube, or Vimeo link"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                type="url"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="file">Upload Files / Images ({files.length}/20)</Label>
              {files.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFiles}
                  className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1 focus:outline-none"
                >
                  <X className="w-3.5 h-3.5" /> Remove all
                </button>
              )}
            </div>

            {/* Multi-file grid view */}
            {filePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                {filePreviews.map((item, idx) => (
                  <div
                    key={item.id}
                    className="relative group border border-slate-200 rounded-xl p-2 bg-white flex items-center gap-2 overflow-hidden shadow-2xs hover:border-[#009698] transition-colors"
                  >
                    {item.url ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-200 relative">
                        <img src={item.url} alt={item.file.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#DEFCFE] text-[#009698] flex items-center justify-center shrink-0 font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-[11px] font-bold text-slate-900 truncate" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFileAt(idx)}
                      className="absolute top-1 right-1 bg-slate-200 hover:bg-destructive hover:text-white text-slate-600 p-1 rounded-full transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Dropzone */}
            <div className="border border-dashed border-slate-300 hover:border-[#009698] rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-[#DEFCFE]/20 cursor-pointer transition relative group">
              <input
                id="file"
                type="file"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <Upload className="w-6 h-6 text-[#009698] group-hover:scale-110 transition-transform mb-1" />
              <p className="text-xs font-bold text-slate-800">
                {files.length > 0 ? "+ Add More Files / Images" : "Click or drag to select images & files"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Select multiple images, PDFs, audio or video files (Max 20 files)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes / Message</Label>
            <Textarea
              id="description"
              placeholder="Provide details about the files or links submitted..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={isSubmitting || (!activeSubmissionId && acceptedProjects.length === 0)}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Submit Work (${files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'Deliverable'})`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
