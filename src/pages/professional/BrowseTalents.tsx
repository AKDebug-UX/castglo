import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Star,
  Mail,
  Eye,
  Loader2
} from "lucide-react";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";

export default function BrowseTalents() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [location, setLocation] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [talents, setTalents] = useState([]);
  const [selectedTalent, setSelectedTalent] = useState<any>(null);

  const fetchTalents = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (role !== "all") params.userRole = role;
      if (location !== "all") params.location = location;
      
      // If no role is selected, default to talent for this page
      if (role === "all") params.userRole = "talent";

      // Also send 'role' as fallback if backend expects it instead of 'userRole'
      params.role = params.userRole;

      const response = await profileAPI.search(params);
      if (response.data.success && Array.isArray(response.data.data)) {
        setTalents(response.data.data);
      } else {
        setTalents([]);
      }
    } catch (error) {
      console.error("Failed to load talents:", error);
      toast.error("Failed to load talents from server.");
      setTalents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTalents();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, role, location]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Browse Talent</h1>
        <p className="text-muted-foreground">Discover and connect with amazing performers</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search talents by name, skill, or location" 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="actor">Actor</SelectItem>
                <SelectItem value="model">Model</SelectItem>
                <SelectItem value="dancer">Dancer</SelectItem>
                <SelectItem value="voice">Voice Actor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="la">Los Angeles</SelectItem>
                <SelectItem value="ny">New York</SelectItem>
                <SelectItem value="miami">Miami</SelectItem>
                <SelectItem value="chicago">Chicago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Searching..." : `Showing ${talents.length} talents`}
      </p>

      {/* Talents Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {talents.length > 0 ? talents.map((talent) => (
            <Card key={talent._id} className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={talent.profilePicture} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {talent.fullName?.[0] || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{talent.fullName}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span>{talent.rating || "0.0"}</span>
                        <span className="text-muted-foreground">({talent.reviewCount || 0})</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{talent.professionalRoles?.join(", ") || "Performer"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {talent.location || "Remote"}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {talent.skills?.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {talent.bio || "No bio provided."}
                    </p>

                    <div className="flex gap-2 mt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex-1" onClick={() => setSelectedTalent(talent)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Talent Profile</DialogTitle>
                            <p className="text-sm text-muted-foreground">Detailed information about this talent</p>
                          </DialogHeader>
                          {selectedTalent && (
                            <div className="space-y-4 mt-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={selectedTalent.profilePicture} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                    {selectedTalent.fullName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-lg">{selectedTalent.fullName}</h3>
                                  <p className="text-muted-foreground capitalize">{selectedTalent.professionalRoles?.join(", ")}</p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-warning text-warning" />
                                    {selectedTalent.rating || "0.0"} ({selectedTalent.reviewCount || 0} reviews) • 
                                    <MapPin className="w-3 h-3 ml-1" />
                                    {selectedTalent.location || "Remote"}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-1">About</h4>
                                <p className="text-sm text-muted-foreground">{selectedTalent.bio || "No bio provided."}</p>
                              </div>

                              {selectedTalent.skills?.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Skills</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedTalent.skills.map((skill: string) => (
                                      <Badge key={skill} variant="secondary">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <Button className="w-full" asChild>
                                <Link to={`/professional/messages?talentId=${selectedTalent.userId ? (typeof selectedTalent.userId === 'object' ? (selectedTalent.userId?._id || selectedTalent.userId?.id) : selectedTalent.userId) : selectedTalent._id}`}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send Message
                                </Link>
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/professional/messages?talentId=${talent.userId ? (typeof talent.userId === 'object' ? (talent.userId?._id || talent.userId?.id) : talent.userId) : talent._id}`}>
                          <Mail className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No talents found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
