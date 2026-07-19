import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
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
        return "/talent";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white">
      <div className="container flex h-14 items-center justify-between">
        <Logo />
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/news" className="text-sm text-black hover:text-primary transition-colors">
            News
          </Link>
          <Link to="/about" className="text-sm text-black hover:text-primary transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-sm text-black hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="default" size="sm" className="h-8 px-4 text-sm bg-primary hover:bg-primary/90 text-white" asChild>
              <Link to={getDashboardLink()}>Dashboard</Link>
            </Button>
          ) : (
            <>
            <Button variant="outline" size="sm" className="h-8 px-4 text-sm" asChild>
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button variant="default" size="sm" className="h-8 px-4 text-sm bg-primary hover:bg-primary/90 text-white" asChild>
                <Link to="/join">Join</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
