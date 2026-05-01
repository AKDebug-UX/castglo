import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import { formatLocation, formatBudget } from "@/lib/utils";

import castingIndieDrama from "@/assets/casting-indie-drama.jpg";
import castingCommercial from "@/assets/casting-commercial.jpg";

export default function BrowseCast() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [castings, setCastings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [genre, setGenre] = useState("all");
  const [status, setStatus] = useState("all");

  const fetchCastings = async (pageNumber = 1) => {
    setIsLoading(true);
    try {
      const params: any = { 
        search, 
        page: pageNumber,
        limit: 12
      };
      
      if (status !== "all") params.status = status;
      if (location !== "all") params.location = location;
      if (genre !== "all") params.productionType = genre;

      const response = await castingCallAPI.getAll(params);
      
      if (response.data.success) {
        const data = response.data.data;
        // Resilient data extraction
        const castingList = Array.isArray(data) ? data : (data.castingCalls || data.listings || data.data || []);
        
        setCastings(castingList);
        
        if (data.pagination) {
          setPagination(data.pagination);
        } else if (data.total !== undefined) {
          setPagination({
            page: pageNumber,
            total: data.total,
            pages: Math.ceil(data.total / 12)
          });
        }
      } else {
        setCastings([]);
      }
    } catch (error) {
      console.error("Failed to fetch casting calls:", error);
      setCastings([]);
      toast.error(error.response?.data?.message || "Server issue detected. Please try again later.");
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
    <>
      <Header />
      <main className="py-12">
        <div className="container">
          <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Browse Casting Calls</h1>
          <p className="text-muted-foreground">Discover new opportunities that match your profile</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"} 
            size="icon"
            className={viewMode === "grid" ? "bg-[#D98EB3] hover:bg-[#D98EB3]/90" : ""}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"} 
            size="icon"
            className={viewMode === "list" ? "bg-[#D98EB3] hover:bg-[#D98EB3]/90" : ""}
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-lg text-slate-700">Filters</span>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search Casting Call" 
                  className="pl-10 h-11 bg-white border-slate-200 rounded-lg focus:ring-primary/20" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">Locations</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg">
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
              <label className="text-sm font-medium text-slate-500 mb-2 block">Genre</label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg">
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
              <label className="text-sm font-medium text-slate-500 mb-2 block">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-11 bg-white border-slate-200 rounded-lg">
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
              <Button className="w-full h-11 bg-[#009698] hover:bg-[#009698]/90 text-white rounded-lg font-medium shadow-sm transition-all active:scale-[0.98]" onClick={() => fetchCastings()} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <p className="text-sm font-medium text-slate-500 px-1">
        {isLoading ? "Loading opportunities..." : `Showing ${castings.length} of ${pagination.total} casting calls`}
      </p>

      {/* Grid View */}
      {!isLoading && viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {castings.length > 0 ? castings.map((casting) => (
            <Card key={casting._id || casting.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-xl bg-white flex flex-col group">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={casting.image || castingIndieDrama} 
                  alt={casting.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <div className="w-6 h-1.5 rounded-full bg-success shadow-sm" />
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-primary transition-colors line-clamp-1">{casting.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{casting.description}</p>
                  
                  <div className="space-y-2.5 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {formatLocation(casting.location)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Deadline: {casting.deadline ? new Date(casting.deadline).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      {formatBudget(casting.budget)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <Badge variant="outline" className="bg-[#E9B3D3]/20 text-[#D98EB3] border-none font-semibold px-3 py-1">{casting.type || casting.category || "Film"}</Badge>
                  <Button size="sm" className="bg-[#009698] hover:bg-[#009698]/90 text-white rounded-lg h-9 px-4 font-medium flex items-center gap-1.5" asChild>
                    <Link to={`/cast/${casting._id || casting.id}`}>
                      View Details
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center bg-white rounded-xl shadow-sm">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">No results found</h3>
              <p className="text-slate-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or search terms to find more opportunities.</p>
            </div>
          )}
        </div>
      ) : !isLoading && (
        /* List View */
        <div className="space-y-4">
          {castings.length > 0 ? castings.map((casting) => (
            <Card key={casting._id || casting.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-xl bg-white group">
              <CardContent className="p-4">
                <div className="flex gap-6">
                  <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <img 
                      src={casting.image || castingIndieDrama} 
                      alt={casting.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 w-4 h-1 rounded-full bg-success shadow-sm" />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">{casting.title}</h3>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">{casting.company || casting.postedBy?.fullName || "Industry Production"}</p>
                      </div>
                      <Badge variant="outline" className="bg-[#E9B3D3]/20 text-[#D98EB3] border-none font-semibold px-3 py-1 flex-shrink-0">
                        {casting.type || casting.category || "Film"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">{casting.description}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {formatLocation(casting.location)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {casting.deadline ? new Date(casting.deadline).toLocaleDateString() : "N/A"}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-slate-500">
                        <DollarSign className="w-4 h-4" />
                        {formatBudget(casting.budget)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center pr-2">
                    <Button className="bg-[#009698] hover:bg-[#009698]/90 text-white rounded-lg h-10 px-6 font-medium shadow-sm" asChild>
                      <Link to={`/cast/${casting._id || casting.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="py-20 text-center bg-white rounded-xl shadow-sm">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">No results found</h3>
              <p className="text-slate-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or search terms to find more opportunities.</p>
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
        </div>
      </main>
      <Footer />
    </>
  );
}
