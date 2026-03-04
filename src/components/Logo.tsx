import { Link } from "react-router-dom";
import logo from "@/assets/castglo-logo.webp";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`block ${className}`}>
      <img src={logo} alt="Castglo" className="h-10 w-auto" />
    </Link>
  );
}
