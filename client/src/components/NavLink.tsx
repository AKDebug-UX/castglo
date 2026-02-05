"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, pendingClassName, href, ...props }, ref) => {
    const pathname = usePathname();
    // React Router NavLink matches inclusive by default. 
    // We'll implementation a simple check: exact match or startsWith for sub-routes if typically needed.
    // But usually for main nav, we want exact highlighting or strict subset.
    // Let's go with: active if pathname starts with href (and href is not just /) or exact match for /

    const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
