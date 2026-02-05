import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-0 ${className}`}>
      <span className="text-2xl font-bold text-primary">CAST</span>
      <span className="text-2xl font-bold logo-gradient">GLO</span>
    </Link>
  );
}
