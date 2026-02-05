import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Phone, 
  Eye, 
  TrendingUp,
  MapPin,
  Calendar,
  ArrowUpRight
} from "lucide-react";

import castingIndieDrama from "@/assets/casting-indie-drama.jpg";
import castingCommercial from "@/assets/casting-commercial.jpg";

const stats = [
  { label: "Active Applications", value: "12", change: "+2 from last week", icon: FileText },
  { label: "Callbacks", value: "5", change: "This week", icon: Phone },
  { label: "Profile views", value: "89", change: "+12% from last week", icon: Eye },
  { label: "Success rate", value: "26%", change: "Above average", icon: TrendingUp },
];

const upcomingCastings = [
  {
    id: 1,
    title: "Lead Role - Indie Drama",
    description: "Seeking passionate actor for lead role in upcoming indie drama about family relationships.",
    location: "Los Angeles, CA",
    deadline: "18/01/2024",
    type: "Film",
    image: castingIndieDrama,
  },
  {
    id: 2,
    title: "Commercial - Tech Brand",
    description: "Looking for diverse talent for national tech commercial campaign.",
    location: "New York, NY",
    deadline: "20/01/2024",
    type: "Commercial",
    image: castingCommercial,
  },
];

const recentSubmissions = [
  { id: 1, title: "Romantic Comedy Lead", date: "12/01/2024", status: "In Review" },
  { id: 2, title: "TV Series Pilot", date: "08/01/2024", status: "Callback" },
  { id: 3, title: "Commercial Campaign", date: "03/01/2024", status: "Rejected" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, Sarah!</h1>
        <p className="text-muted-foreground">Here's what's happening with your casting opportunities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className="icon-circle-primary w-10 h-10">
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Casting Calls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Upcoming Casting Calls</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/browse">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingCastings.map((casting) => (
              <div key={casting.id} className="rounded-lg border border-border overflow-hidden card-elevated">
                <div className="relative h-40">
                  <img 
                    src={casting.image} 
                    alt={casting.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-primary">{casting.type}</Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{casting.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{casting.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {casting.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Deadline: {casting.deadline}
                    </span>
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/dashboard/browse/${casting.id}`}>
                      View Details
                      <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Submissions</CardTitle>
          <p className="text-sm text-muted-foreground">Track the status of your latest applications</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <div 
                key={submission.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium">{submission.title}</p>
                  <p className="text-sm text-muted-foreground">Submitted {submission.date}</p>
                </div>
                <Badge 
                  variant={
                    submission.status === "Callback" ? "default" : 
                    submission.status === "Rejected" ? "destructive" : 
                    "secondary"
                  }
                >
                  {submission.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
