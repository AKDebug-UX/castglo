import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Link as LinkIcon, FileCheck } from "lucide-react";
import { applicationAPI, uploadAPI } from "@/lib/api";
import { toast } from "sonner";

interface ProjectSubmissionModalProps {
  submission: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSubmissionModal({ submission, isOpen, onClose }: ProjectSubmissionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic project selection states
  const [acceptedProjects, setAcceptedProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    if (isOpen && !submission) {
      const fetchAcceptedProjects = async () => {
        setIsLoadingProjects(true);
        try {
          const res = await applicationAPI.getMe();
          if (res.data?.success) {
            const apps = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.applications || []);
            // Filter to include accepted, hired, offer, or matched statuses (case-insensitive)
            const filtered = apps.filter((app: any) => 
              app.status && ["accepted", "hired", "offer", "matched"].includes(app.status.toLowerCase())
            );
            
            // Fallback to all applications if no accepted/hired ones are found
            const projectsToShow = filtered.length > 0 ? filtered : apps;
            setAcceptedProjects(projectsToShow);
            
            if (projectsToShow.length > 0) {
              setSelectedProjectId(projectsToShow[0]._id || projectsToShow[0].id || "");
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
  }, [isOpen, submission]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetSubmissionId = submission?._id || submission?.id || selectedProjectId;
    
    if (!targetSubmissionId) {
      toast.error("Please select a project to submit work for.");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please enter a title for your submission.");
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl = "";
      if (file) {
        const formData = new FormData();
        formData.append("image", file); // Backend expects "image" or similar for general file uploads
        const uploadRes = await uploadAPI.uploadImage(formData);
        fileUrl = uploadRes.data?.data?.url || uploadRes.data?.url || "";
      }

      // Format the delivery message
      const deliveryMessage = `📦 **Project Deliverable Submitted**\n\n**Title:** ${title.trim()}\n**Link:** ${externalLink.trim() || "None"}\n**File:** ${fileUrl || "None"}\n\n**Notes:**\n${description.trim() || "No additional notes."}`;

      // Send via communication API
      const res = await applicationAPI.addCommunication(targetSubmissionId, deliveryMessage);
      
      if (res.data?.success) {
        toast.success("Project deliverables submitted successfully!");
        onClose();
        // Reset state
        setTitle("");
        setDescription("");
        setExternalLink("");
        setFile(null);
      } else {
        toast.error(res.data?.message || "Failed to submit deliverables.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg h-[70%] rounded-[24px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileCheck className="w-5 h-5 text-teal-600" />
            Submit Project Deliverables
          </DialogTitle>
          {submission ? (
            <DialogDescription>
              Submit your work for the project: <strong>{submission?.castingCall?.title || "Project"}</strong>
            </DialogDescription>
          ) : (
            <DialogDescription>
              Select an accepted project and submit your deliverables.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {!submission && (
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
                  {acceptedProjects.map((proj) => {
                    const titleVal = proj.castingCallId?.project_title || proj.project?.projectName || proj.castingCall?.title || proj.project?.title || "Unknown Project";
                    const role = proj.appliedRole || proj.role?.role_name || proj.role?.title || "Standard Role";
                    const statusStr = proj.status ? ` (${proj.status.toUpperCase()})` : "";
                    return (
                      <option key={proj._id} value={proj._id}>
                        {titleVal} - {role}{statusStr}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <p className="text-sm text-destructive font-medium">No accepted projects or casting calls found.</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Deliverable Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="e.g. Final Video Cut, Voiceover WAV file, Draft 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
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
            <Label htmlFor="file">Upload File</Label>
            <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 cursor-pointer transition relative">
              <input
                id="file"
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-slate-700">
                {file ? file.name : "Click to select a file"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Images, PDFs, audio or video files"}
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
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={isSubmitting || (!submission && acceptedProjects.length === 0)}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Work"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
