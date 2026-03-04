import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Grid3X3, 
  List, 
  Plus,
  Play,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  Award
} from "lucide-react";

const submissions = [
  {
    id: 1,
    name: "Sarah Johnson",
    initials: "SJ",
    location: "Los Angeles, CA",
    role: "Lead Role - Indie Drama",
    date: "Submitted 1/12/2024",
    experience: "5+ years",
    status: "pending",
    feedback: "Strong emotional range, perfect for the character arc.",
  },
  {
    id: 2,
    name: "Michael Chen",
    initials: "MC",
    location: "New York, NY",
    role: "Supporting Actor - Netflix Series",
    date: "Submitted 1/11/2024",
    experience: "8+ years",
    status: "approved",
    feedback: "Excellent screen presence and chemistry with lead actors.",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    initials: "ER",
    location: "Chicago, IL",
    role: "Lead Role - Indie Drama",
    date: "Submitted 1/10/2024",
    experience: "3+ years",
    status: "pending",
    feedback: "Great energy and natural charisma for this.",
  },
  {
    id: 4,
    name: "David Kim",
    initials: "DK",
    location: "Atlanta, GA",
    role: "Commercial - Tech Brand",
    date: "Submitted 1/9/2024",
    experience: "6+ years",
    status: "rejected",
    feedback: "Good performance but not quite the right fit for this particular role.",
  },
  {
    id: 5,
    name: "Lisa Park",
    initials: "LP",
    location: "Los Angeles, CA",
    role: "Voice Over - Animation",
    date: "Submitted 1/8/2024",
    experience: "4+ years",
    status: "pending",
    feedback: "Versatile voice with great character range.",
  },
  {
    id: 6,
    name: "James Wilson",
    initials: "JW",
    location: "Vancouver, BC",
    role: "Supporting Actor - Netflix Series",
    date: "Submitted 1/7/2024",
    experience: "8+ years",
    status: "approved",
    feedback: "Strong dramatic skills and professional attitude.",
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

export default function DirectorSubmissions() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  const filteredSubmissions = submissions.filter((sub) => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return sub.status === "pending";
    if (activeTab === "closed") return sub.status === "approved";
    if (activeTab === "drafts") return sub.status === "rejected";
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">Manage all your casting calls and projects</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Casting Call
        </Button>
      </div>

      {/* Tabs and View Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "grid" ? "secondary" : "ghost"} 
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "secondary" : "ghost"} 
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="card-elevated overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {submission.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{submission.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {submission.location}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[submission.status]}>
                    {submission.status}
                  </Badge>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">{submission.role}</p>
                  <p className="text-xs text-muted-foreground">{submission.date}</p>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-medium">{submission.experience}</span>
                </div>

                {/* Video Preview Placeholder */}
                <div className="relative aspect-video rounded-lg bg-muted mb-3 flex items-center justify-center group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
                  <Button variant="ghost" size="icon" className="z-10 bg-white/20 hover:bg-white/30 rounded-full w-12 h-12">
                    <Play className="w-5 h-5 text-white" fill="white" />
                  </Button>
                  <span className="absolute bottom-2 left-2 text-xs text-white/80 flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    Preview Audition
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{submission.feedback}</p>

                {submission.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1">
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                ) : submission.status === "approved" ? (
                  <Button size="sm" className="w-full bg-success hover:bg-success/90">
                    <Award className="w-3 h-3 mr-1" />
                    Award Role
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Rejected
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {submission.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{submission.name}</p>
                        <Badge className={statusColors[submission.status]}>
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{submission.role}</p>
                      <p className="text-xs text-muted-foreground">{submission.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {submission.status === "pending" ? (
                      <>
                        <Button size="sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm">
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    ) : submission.status === "approved" ? (
                      <Button size="sm" className="bg-success hover:bg-success/90">
                        <Award className="w-3 h-3 mr-1" />
                        Award Role
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
