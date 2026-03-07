import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, User, Briefcase, MapPin, Star, Loader2 } from "lucide-react";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";
import { MOCK_TALENTS } from "@/lib/data";

export default function Browse() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [talents, setTalents] = useState<any[]>([]);

  const fetchFeaturedTalents = async () => {
    setIsLoading(true);
    try {
      const response = await profileAPI.search({ limit: 6, userRole: "talent" });
      if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setTalents(response.data.data);
      } else {
        setTalents(MOCK_TALENTS);
      }
    } catch (error) {
      console.error("Failed to fetch talents", error);
      setTalents(MOCK_TALENTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedTalents();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const response = await profileAPI.search({ search, userRole: "talent" });
      if (response.data.success && Array.isArray(response.data.data)) {
        setTalents(response.data.data);
      } else {
        setTalents([]);
      }
    } catch (error) {
      toast.error("Search failed");
      setTalents([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-4xl font-bold mb-4">Discover Amazing Talent</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Browse profiles, watch demo reels, and find your next favorite performer
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
              <Input 
                placeholder="Search for talent, skills or location"
                className="flex-1 h-12"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Search
              </Button>
            </form>
          </div>

          {/* Results Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {Array.isArray(talents) && talents.map((talent) => (
              <Card key={talent._id} className="card-elevated group overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-muted">
                    <img 
                      src={talent.profilePicture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      alt={talent.fullName}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-background/80 backdrop-blur text-foreground border-none">
                        <Star className="w-3 h-3 mr-1 fill-warning text-warning" />
                        {talent.rating || "0.0"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{talent.fullName}</h3>
                    <p className="text-sm text-primary font-medium capitalize mb-2">
                      {talent.professionalRoles?.join(", ") || "Talent"}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                      <MapPin className="w-3 h-3" />
                      {talent.location || "Worldwide"}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {talent.skills?.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/talent/${talent._id}`}>View Profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!isLoading && talents.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No talents found. Try a different search term.
              </div>
            )}
          </div>

          {/* Join CTA */}
          <div className="bg-primary/5 rounded-3xl border border-primary/10 p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">
              Join Castglo to unlock full access to talent profiles and connect with industry professionals
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/join/talent">
                  <User className="w-4 h-4 mr-2" />
                  Join as Talent
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/join/director">
                  <Search className="w-4 h-4 mr-2" />
                  Join as Casting Director
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/join/professional">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Join as Industry Professional
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
