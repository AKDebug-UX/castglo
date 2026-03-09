import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export default function Join() {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return "/sign-in";
    
    switch (user.role) {
      case "admin":
        return "/admin";
      case "casting_director":
        return "/director";
      case "industry_professional":
        return "/professional";
      case "talent":
      default:
        return "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-primary/10">
      {/* Top Nav */}
      <header className="border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/browse" className="text-foreground hover:text-primary">Browse</Link>
            <Link to="/about" className="text-foreground hover:text-primary">About</Link>
            <Link to="/contact" className="text-foreground hover:text-primary">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to={getDashboardLink()}>
                <Button variant="default" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/sign-in">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/join">
                  <Button variant="hero" size="sm">Join Now</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pt-10 pb-8">
        <h1 className="text-center text-2xl font-semibold">Discover Amazing Talent</h1>
        <p className="mt-2 text-center text-muted-foreground">
          Browse profiles, watch demo reels, and find your next favorite performer
        </p>

        {/* Search Bar */}
        <div className="mx-auto mt-6 flex max-w-xl items-center gap-3">
          <Input
            className="h-12 flex-1"
            placeholder="Search for talent, skills or location"
          />
          <Button variant="secondary" size="lg">Search</Button>
        </div>
      </section>

      {/* Get Started Card */}
      <section className="mx-auto max-w-3xl px-4 pb-12">
        <div className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
          <h2 className="text-center text-lg font-semibold">Ready to Get Started?</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Join Castglo to unlock full access to talent profiles and connect with
            industry professionals
          </p>

          <div className="mt-6 mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Link to="/join/talent">
              <Button variant="secondary" size="lg" className="w-full">Join as Talent</Button>
            </Link>
            <Link to="/join/casting_director">
              <Button variant="default" size="lg" className="w-full">Join as Casting Director</Button>
            </Link>
            <Link to="/join/industry_professional">
              <Button variant="outline" size="lg" className="w-full">Join as Industry Professional</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
