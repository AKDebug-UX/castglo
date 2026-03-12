import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Calendar,
  DollarSign,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { castingCallAPI } from "@/lib/api";
import { MOCK_CASTINGS } from "@/lib/data";

import castingIndieDrama from "@/assets/casting-indie-drama.jpg";

export function BrowseCastSection() {
  const [castings, setCastings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCastings = async () => {
    setIsLoading(true);
    try {
      const response = await castingCallAPI.getAll({ 
        search, 
        status: "open",
        limit: 6
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        setCastings(response.data.data);
      } else {
        setCastings(MOCK_CASTINGS.slice(0, 6));
      }
    } catch (error) {
      console.error("Failed to fetch casting calls:", error);
      setCastings(MOCK_CASTINGS.slice(0, 6));
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
    <section id="browse-castings" className="py-20 bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">Browse Casting Calls</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Discover your next big opportunity. From indie films to major commercial productions, find the role that fits you perfectly.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search casting calls..." 
                className="pl-10 h-12 bg-muted/50 border-none rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 rounded-xl bg-[#009698] hover:bg-[#009698]/90" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </form>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching latest opportunities...</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {castings.length > 0 ? castings.map((casting) => (
              <Card key={casting._id || casting.id} className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl bg-white flex flex-col group">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={casting.image || castingIndieDrama} 
                    alt={casting.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success text-white border-none px-3 py-1">
                      Active
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-[#E9B3D3]/20 text-[#D98EB3] border-none font-semibold px-2 py-0.5 text-[10px] uppercase tracking-wider">
                        {casting.type || casting.category || "Film"}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">
                        {casting.company || "Industry Production"}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {casting.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                      {casting.description}
                    </p>
                    
                    <div className="space-y-3 text-sm text-slate-600 mb-8">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-slate-400" />
                        </div>
                        {casting.location}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-slate-400" />
                        </div>
                        Deadline: {casting.deadline ? new Date(casting.deadline).toLocaleDateString() : "N/A"}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                        </div>
                        {casting.budget || "Competitive Pay"}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-[#009698] hover:bg-[#009698]/90 text-white rounded-xl h-12 font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#009698]/20 transition-all active:scale-[0.98]" asChild>
                    <Link to={casting._id ? `/cast/${casting._id}` : "/sign-in"}>
                      View Details
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Search className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">No results found</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto">Try adjusting your search terms to find more opportunities.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-16 text-center">
          <Button variant="outline" size="lg" className="rounded-xl px-10 h-14 border-2 font-bold" asChild>
            <Link to="/sign-in">View All Casting Calls</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
