import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Briefcase } from "lucide-react";

export default function Browse() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-4">Discover Amazing Talent</h1>
          <p className="text-muted-foreground mb-8">
            Browse profiles, watch demo reels, and find your next favorite performer
          </p>

          {/* Search */}
          <div className="flex gap-2 max-w-xl mx-auto mb-12">
            <Input 
              placeholder="Search for talent, skills or location"
              className="flex-1"
            />
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Join CTA */}
          <div className="bg-card rounded-2xl shadow-card p-8">
            <h2 className="text-xl font-bold mb-2">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Join Castglo to unlock full access to talent profiles and connect with industry professionals
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/join/talent">
                  <User className="w-4 h-4 mr-2" />
                  Join as Talent
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/join/director">
                  <Search className="w-4 h-4 mr-2" />
                  Join as Casting Director
                </Link>
              </Button>
              <Button variant="outline" asChild>
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
