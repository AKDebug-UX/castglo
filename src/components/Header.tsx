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
      case "director":
        return "/director";
      case "professional":
        return "/professional";
      case "talent":
      default:
        return "/dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 items-center justify-between">
        <Logo />
        
        <nav className="hidden md:flex items-center gap-6">
           <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
             News
           </Link>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center">
          {user ? (
            <Button variant="default" size="sm" className="h-8 px-4 text-sm" asChild>
              <Link to={getDashboardLink()}>Dashboard</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="h-8 px-4 text-sm" asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
