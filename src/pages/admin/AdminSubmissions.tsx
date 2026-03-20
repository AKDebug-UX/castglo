 import { useState, useEffect } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { Play, Loader2 } from "lucide-react";
 import { adminAPI } from "@/lib/api";
 import { toast } from "sonner";
 
 const getStatusBadge = (status: string) => {
   switch (status) {
     case "Approved":
       return <Badge className="bg-success text-success-foreground">{status}</Badge>;
     case "Under Review":
       return <Badge variant="outline">{status}</Badge>;
     case "Flagged":
       return <Badge variant="destructive">{status}</Badge>;
     default:
       return <Badge variant="secondary">{status}</Badge>;
   }
 };
 
 export default function AdminSubmissions() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, underReview: 0, flagged: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [submissionsRes, statsRes] = await Promise.all([
        adminAPI.getSubmissions({ status: statusFilter === "all" ? undefined : statusFilter }),
        adminAPI.getSubmissionStats()
      ]);

      if (submissionsRes.data.success) {
        setSubmissions(submissionsRes.data.data.submissions || []);
      }
      if (statsRes.data.success) {
        const s = statsRes.data.data;
        setStats({
          total: s.total || 0,
          approved: s.approved || 0,
          underReview: s.underReview || 0,
          flagged: s.flagged || 0
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch submissions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await adminAPI.updateSubmissionStatus(id, status);
      if (response.data.success) {
        toast.success(`Submission status updated to ${status}`);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const statItems = [
    { label: "Total Submissions", value: stats.total.toLocaleString(), color: "foreground" },
    { label: "Approved", value: stats.approved.toLocaleString(), color: "success" },
    { label: "Under Review", value: stats.underReview.toLocaleString(), color: "warning" },
    { label: "Flagged", value: stats.flagged.toLocaleString(), color: "destructive" },
  ];
 
   return (
     <div className="space-y-6">
       <div>
         <h1 className="text-2xl font-bold">Submissions Management</h1>
         <p className="text-muted-foreground">Monitor and manage all audition submissions</p>
       </div>
 
       {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">All Submissions</CardTitle>
            <p className="text-sm text-muted-foreground">Review audition submissions and AI feedback</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No submissions found.
            </div>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission._id || submission.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
              >
                <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={submission.mediaUrl || submission.image} alt={submission.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{submission.castingCallId?.title || submission.title}</h4>
                  <p className="text-sm text-muted-foreground">by {submission.talentId?.fullName || submission.author}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">AI Score: {submission.aiAnalysis?.score || submission.aiScore || 0}/10</span>
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success"
                        style={{ width: `${(submission.aiAnalysis?.score || submission.aiScore || 0) * 10}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Submitted {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : submission.submittedDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(submission.status)}
                  <Button variant="outline" size="sm">Preview</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

