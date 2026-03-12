import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Star, 
  Loader2, 
  Users, 
  Flame,
  ZoomIn,
  Mail,
  MessageCircle,
  Heart,
  Play,
  UserPlus,
  Theater,
  UserCircle,
  Mic2,
  Clapperboard,
  Video
} from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";
import { MOCK_TALENTS } from "@/lib/data";

export default function BrowseTalent() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Actors & Performers");
  const [isLoading, setIsLoading] = useState(false);
  const [talents, setTalents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  const categories = [
    { name: "Actors & Performers", icon: Theater, key: "talent" },
    { name: "Content Creators", icon: UserCircle, key: "content_creator" },
    { name: "Voiceover Artists", icon: Mic2, key: "voiceover" },
    { name: "Crew", icon: Video, key: "crew" },
  ];

  const categoryDetails: { [key: string]: { popular: string[], label: string, topHeading: string } } = {
    "Actors & Performers": {
      popular: ["Female Actors", "LA Actors", "London Actors", "Male Actors", "NYC Actors", "Theatre", "Union Actors"],
      label: "Actors & Performers",
      topHeading: "Top Actors and Performers"
    },
    "Content Creators": {
      popular: ["YouTubers", "TikTokers", "Instagram Models", "Streamers", "Bloggers", "Influencers", "UGC Creators"],
      label: "Content Creators",
      topHeading: "Top Content Creators"
    },
    "Voiceover Artists": {
      popular: ["Animation", "Commercial VO", "Audiobooks", "Video Games", "Dubbing", "Narrators", "Radio"],
      label: "Voiceover Artists",
      topHeading: "Top Voiceover Talent"
    },
    "Crew": {
      popular: ["Directors", "Producers", "DOPs", "Editors", "Sound Engineers", "Makeup Artists", "Stylists"],
      label: "Crew Members",
      topHeading: "Top Industry Crew"
    }
  };

  const currentDetails = categoryDetails[activeCategory] || categoryDetails["Actors & Performers"];

  const fetchTalents = async (page = 1) => {
    setIsLoading(true);
    try {
      const categoryMap: { [key: string]: string } = {
        "Actors & Performers": "talent",
        "Content Creators": "content_creator",
        "Voiceover Artists": "voiceover",
        "Crew": "crew"
      };

      const response = await profileAPI.search({ 
        search, 
        userRole: categoryMap[activeCategory] || "talent",
        page,
        limit: itemsPerPage
      });
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setTalents(response.data.data);
        setTotalPages(Math.ceil((response.data.total || MOCK_TALENTS.length) / itemsPerPage));
      } else {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setTalents(MOCK_TALENTS.slice(start, end));
        setTotalPages(Math.ceil(MOCK_TALENTS.length / itemsPerPage));
      }
    } catch (error) {
      console.error("Failed to fetch talents", error);
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      setTalents(MOCK_TALENTS.slice(start, end));
      setTotalPages(Math.ceil(MOCK_TALENTS.length / itemsPerPage));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents(currentPage);
  }, [currentPage, activeCategory]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchTalents(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2]">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container">
          {/* Category Navigation */}
          <div className="flex flex-wrap items-center justify-start gap-2 mb-8 border-b border-slate-200 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setCurrentPage(1);
                }}
                className={`flex flex-col items-center justify-center gap-2 px-8 py-4 rounded-xl transition-all duration-300 min-w-[140px] ${
                  activeCategory === cat.name 
                    ? "bg-[#E0E7FF] text-[#5849D7]" 
                    : "bg-transparent text-slate-900 hover:bg-slate-50"
                }`}
              >
                <cat.icon className={`w-6 h-6 ${activeCategory === cat.name ? "text-[#5849D7]" : "text-slate-900"}`} />
                <span className="text-xs font-bold whitespace-nowrap">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Popular Searches */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
              <Search className="w-4 h-4" />
              Popular {activeCategory} Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {currentDetails.popular.map((term) => (
                <Button 
                  key={term} 
                  variant="outline" 
                  size="sm" 
                  className="bg-white hover:bg-primary/5 border-none shadow-sm rounded-lg px-4 py-5 font-bold text-slate-700"
                  onClick={() => {
                    setSearch(term);
                    // Explicitly fetch talents with the new search term
                    setIsLoading(true);
                    profileAPI.search({ 
                      search: term, 
                      userRole: categories.find(c => c.name === activeCategory)?.key || "talent",
                      page: 1,
                      limit: itemsPerPage
                    }).then(response => {
                      if (response.data.success && Array.isArray(response.data.data)) {
                        setTalents(response.data.data);
                        setTotalPages(Math.ceil((response.data.total || MOCK_TALENTS.length) / itemsPerPage));
                      }
                      setIsLoading(false);
                    }).catch(() => setIsLoading(false));
                  }}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats and Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-800">
              <span>10,000 {currentDetails.label} <span className="text-muted-foreground font-normal">across</span> All Locations</span>
              <div className="flex items-center gap-2 ml-2">
                <Switch className="data-[state=checked]:bg-[#5849D7]" />
                <span className="font-medium text-slate-600 flex items-center gap-1">
                  Autoplay on zoom <ZoomIn className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Sort by</span>
                <Select defaultValue="recommended">
                  <SelectTrigger className="w-[180px] bg-white border-[#5849D7]/30 text-[#5849D7] font-bold rounded-lg">
                    <SelectValue placeholder="Recommended" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="bg-white border-slate-300 font-bold text-slate-700 rounded-lg flex items-center gap-2">
                <Users className="w-4 h-4" />
                Bulk Actions
              </Button>
            </div>
          </div>

          {/* Top Actors Section */}
          <div className="bg-[#FFE5D4] rounded-2xl p-6 mb-12 border border-[#FFD5B8]">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <Flame className="w-4 h-4 text-[#FF7A30]" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{currentDetails.topHeading}</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {talents.map((talent) => (
                  <Card key={talent._id} className="overflow-hidden border border-slate-100 shadow-sm bg-white rounded-xl group">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden bg-slate-100">
                        <img 
                          src={talent.profilePicture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          alt={talent.fullName}
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white/90 backdrop-blur text-slate-900 border-none font-bold text-xs px-2 py-1 flex items-center gap-1 shadow-sm">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {talent.rating || "4.8"}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-xl text-slate-900 leading-tight">{talent.fullName}</h3>
                          <p className="text-[#009698] font-medium text-lg">
                            {talent.category || "Talent"}
                          </p>
                          <p className="text-slate-400 flex items-center gap-1.5 text-lg font-light">
                            <MapPin className="w-4 h-4" />
                            {talent.location || "Worldwide"}
                          </p>
                        </div>

                        <Button 
                          variant="outline" 
                          className="w-full h-12 border-slate-200 text-slate-900 font-medium text-lg rounded-xl hover:bg-slate-50 transition-colors mt-2"
                          asChild
                        >
                          <Link to={`/talent/${talent._id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-12 mb-16">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            href="#" 
                            isActive={currentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      page === currentPage - 2 || 
                      page === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Join CTA */}
          <div className="bg-[#5849D7] rounded-3xl p-8 md:p-12 text-center text-white shadow-xl shadow-[#5849D7]/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto text-lg">
              Join Castglo to unlock full access to talent profiles and connect with industry professionals
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-[#5849D7] hover:bg-white/90 font-bold" asChild>
                <Link to="/join/talent">
                  Join as Talent
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-primary hover:bg-white/10 font-bold" asChild>
                <Link to="/join/director">
                  Join as Casting Director
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
