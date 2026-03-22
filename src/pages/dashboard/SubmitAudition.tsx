import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video, Upload, Loader2 } from "lucide-react";
import { castingCallAPI, applicationAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatLocation } from "@/lib/utils";

export default function SubmitAudition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [casting, setCasting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCasting = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const response = await castingCallAPI.getOne(id);
        if (response.data.success) {
          setCasting(response.data.data);
        }
      } catch (error) {
        toast.error("Failed to load casting details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCasting();
  }, [id]);

  const handleSubmit = async () => {
    if (!id) return;
    if (!videoFile) {
      toast.error("Please upload an audition video");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("castingCallId", id);
      formData.append("notes", notes);
      formData.append("auditionVideo", videoFile);

      const response = await applicationAPI.create(formData);
      if (response.data.success) {
        toast.success("Audition submitted successfully!");
        navigate("/dashboard/submissions");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit audition");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!casting) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Casting call not found.</p>
        <Button variant="link" asChild>
          <Link to="/dashboard/browse-cast">Back to browse</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link 
        to={`/dashboard/browse-cast/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Browsing Call
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Submit Audition</h1>
        <p className="text-muted-foreground">Upload your audition video for this casting call</p>
      </div>

      {/* Casting Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <img 
              src={casting.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=200"} 
              alt={casting.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold">{casting.title}</h3>
              <p className="text-sm text-muted-foreground">{casting.postedBy?.fullName}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{casting.category}</Badge>
                <span className="text-sm text-muted-foreground">{formatLocation(casting.location)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Audition Video</CardTitle>
          <p className="text-sm text-muted-foreground">Upload your MP4 audition video (max 200MB)</p>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
            {videoFile ? (
              <div className="space-y-4">
                <Video className="w-12 h-12 mx-auto text-success" />
                <p className="font-medium">{videoFile.name}</p>
                <Button variant="outline" size="sm" onClick={() => setVideoFile(null)}>
                  Change File
                </Button>
              </div>
            ) : (
              <>
                <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium mb-1">Upload your audition video</p>
                <p className="text-sm text-muted-foreground mb-4">MP4 format, maximum 200MB</p>
                <label htmlFor="video-upload">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </span>
                  </Button>
                  <input 
                    id="video-upload" 
                    type="file" 
                    accept="video/mp4" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <p className="text-sm text-muted-foreground">Any additional information you'd like to share (optional)</p>
        </CardHeader>
        <CardContent>
          <Textarea 
            rows={4}
            placeholder="Tell the casting director anything else about your audition or experience"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        className="w-full" 
        size="lg" 
        onClick={handleSubmit} 
        disabled={isSubmitting || !videoFile}
      >
        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Submit Audition
      </Button>
    </div>
  );
}
