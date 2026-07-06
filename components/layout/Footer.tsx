import Link from "next/link";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const neighborhoods = [
    { name: "Hayatabad", href: "/properties?location=Hayatabad" },
    { name: "DHA Peshawar", href: "/properties?location=DHA+Peshawar" },
    { name: "Regi Model Town", href: "/properties?location=Regi+Model+Town" },
    { name: "Warsak Road", href: "/properties?location=Warsak+Road" },
    { name: "University Town", href: "/properties?location=University+Town" },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Properties Listings", href: "/properties" },
    { name: "Add Property", href: "/properties/add" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <footer className="w-full bg-accent text-foreground border-t border-border mt-auto pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Peshawar <span className="text-primary">Property</span> Hub
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Peshawar&apos;s premier digital real estate portal. We connect buyers, renters, and agents to properties across DHA, Hayatabad, Regi Model Town, and the wider Khyber Pakhtunkhwa region.
            </p>
            
            {/* Social Media SVG Icons */}
            <div className="flex items-center gap-3 mt-2">
              {/* Facebook */}
              <a href="#" className="p-2.5 rounded-lg bg-card border border-border hover:text-primary transition-all duration-300 hover:scale-105" aria-label="Facebook">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="p-2.5 rounded-lg bg-card border border-border hover:text-primary transition-all duration-300 hover:scale-105" aria-label="Instagram">
                <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="#" className="p-2.5 rounded-lg bg-card border border-border hover:text-primary transition-all duration-300 hover:scale-105" aria-label="Twitter">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="p-2.5 rounded-lg bg-card border border-border hover:text-primary transition-all duration-300 hover:scale-105" aria-label="LinkedIn">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/80">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Locations Column */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground/80">
              Popular Localities
            </h3>
            <ul className="space-y-2.5">
              {neighborhoods.map((loc) => (
                <li key={loc.name}>
                  <Link
                    href={loc.href}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                  >
                    Properties in {loc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-1 text-foreground/80">
              Get In Touch
            </h3>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground leading-relaxed">
                Phase 5 Commercial Area, Hayatabad, Peshawar, KP, Pakistan
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <a href="tel:+92915551234" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                +92 (91) 555-1234
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              <a href="mailto:info@propertyhub.pk" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                info@propertyhub.pk
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} Peshawar Property Hub. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
