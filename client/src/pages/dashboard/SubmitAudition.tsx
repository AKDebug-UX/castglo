import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video, Upload } from "lucide-react";

import castingIndieDrama from "@/assets/casting-indie-drama.jpg";

export default function SubmitAudition() {
  const { id } = useParams();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link 
        to={`/dashboard/browse/${id}`}
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
              src={castingIndieDrama} 
              alt="Lead Role - Indie Drama"
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold">Lead Role - Indie Drama</h3>
              <p className="text-sm text-muted-foreground">Moonlight Studio</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">Drama</Badge>
                <span className="text-sm text-muted-foreground">Los Angeles, CA</span>
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
            <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium mb-1">Upload your audition video</p>
            <p className="text-sm text-muted-foreground mb-4">MP4 format, maximum 200MB</p>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
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
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button className="w-full" size="lg">
        Submit Audition
      </Button>
    </div>
  );
}
