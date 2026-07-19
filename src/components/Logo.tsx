import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`block ${className}`}>
      <img src="/castglo-logo.png" alt="Castglo" className="h-8 w-auto object-contain" />
    </Link>
  );
}
