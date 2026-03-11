import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MapPin, 
  Calendar,
  DollarSign,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { castingCallAPI } from "@/lib/api";
import { toast } from "sonner";
import { MOCK_CASTINGS } from "@/lib/data";

import castingIndieDrama from "@/assets/casting-indie-drama.jpg";
import castingCommercial from "@/assets/casting-commercial.jpg";

export default function BrowseCastings() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [castings, setCastings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [genre, setGenre] = useState("all");
  const [status, setStatus] = useState("all");

  const fetchCastings = async () => {
    setIsLoading(true);
    try {
      const response = await castingCallAPI.getAll({ 
        search, 
        status: "open", // Use the backend enum status: "open"
        page: 1 
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        setCastings(response.data.data);
      } else {
        setCastings(MOCK_CASTINGS);
      }
    } catch (error) {
      console.error("Failed to fetch casting calls:", error);
      // Fallback to mock data on server error (500)
      setCastings(MOCK_CASTINGS);
      toast.error(error.response?.data?.message || "Server issue detected. Showing featured opportunities.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCastings();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCastings();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Browse Casting Calls</h1>
          <p className="text-muted-foreground">Discover new opportunities that match your profile</p>
        </div>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Filters</span>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search Casting Call" 
                  className="pl-9" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Locations</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  <SelectItem value="la">Los Angeles, CA</SelectItem>
                  <SelectItem value="ny">New York, NY</SelectItem>
                  <SelectItem value="atl">Atlanta, GA</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Genre</label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="All genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genres</SelectItem>
                  <SelectItem value="drama">Drama</SelectItem>
                  <SelectItem value="comedy">Comedy</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                  <SelectItem value="thriller">Thriller</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closing">Closing Soon</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={() => fetchCastings()} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Loading..." : `Showing ${castings.length} casting calls`}
      </p>

      {/* Grid View */}
      {!isLoading && viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {castings.length > 0 ? castings.map((casting) => (
            <Card key={casting._id || casting.id} className="overflow-hidden card-elevated">
              <div className="relative h-40">
                <img 
                  src={casting.image || castingIndieDrama} 
                  alt={casting.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-success">{casting.status}</Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{casting.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">{casting.company || casting.postedBy?.fullName}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{casting.description}</p>
                
                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {casting.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Deadline: {casting.deadline ? new Date(casting.deadline).toLocaleDateString() : "N/A"}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {casting.budget}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{casting.type || casting.category}</Badge>
                  <Button size="sm" asChild>
                    <Link to={`/dashboard/browse/${casting._id || casting.id}`}>
                      View Details
                      <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No casting calls found matching your filters.
            </div>
          )}
        </div>
      ) : !isLoading && (
        /* List View */
        <div className="space-y-3">
          {castings.length > 0 ? castings.map((casting) => (
            <Card key={casting._id || casting.id} className="card-elevated">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img 
                    src={casting.image || castingIndieDrama} 
                    alt={casting.title}
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{casting.title}</h3>
                        <p className="text-sm text-muted-foreground">{casting.company || casting.postedBy?.fullName}</p>
                      </div>
                      <Badge className="bg-success flex-shrink-0">{casting.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{casting.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {casting.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {casting.deadline ? new Date(casting.deadline).toLocaleDateString() : "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {casting.budget}
                      </span>
                      <Badge variant="secondary">{casting.type || casting.category}</Badge>
                    </div>
                  </div>
                  <Button size="sm" className="flex-shrink-0 self-center" asChild>
                    <Link to={`/dashboard/browse/${casting._id || casting.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="py-12 text-center text-muted-foreground">
              No casting calls found matching your filters.
            </div>
          )}
        </div>
      )}
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Fetching latest casting calls...</p>
        </div>
      )}
    </div>
  );
}
