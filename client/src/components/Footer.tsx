import { Link } from "react-router-dom";
import { Logo } from "./Logo";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  support: [
    { label: "Contact", href: "/contact" },
    { label: "Help Centre", href: "/help" },
    { label: "FAQ", href: "/faq" },
  ],
  resources: [
    { label: "Glo Hub", href: "/hub" },
    { label: "Glo Chat", href: "/chat" },
    { label: "Audition Guides", href: "/guides" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#F1FBFB]">
      <div className="container py-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Connecting talent with opportunity in the entertainment industry.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-center text-xs text-muted-foreground">
            © 2026 Castglo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
