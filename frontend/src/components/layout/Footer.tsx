import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const SOCIALS = [
  { name: 'Facebook',  href: 'https://www.facebook.com/share/1AzBkbF7nX/?mibextid=wwXIfr',  icon: Facebook },
  { name: 'Instagram', href: 'https://www.instagram.com/potupartners?igsh=MTBhYzEyeHU5NnFqOA==', icon: Instagram },
  { name: 'Twitter',   href: 'https://x.com/potupartners?s=11&t=sw-0qLGvFCGtvd6erCLotQ',   icon: Twitter },
  { name: 'LinkedIn',  href: 'https://www.linkedin.com/in/potupartnerslawoffice?utm_source=share_via&utm_content=profile&utm_medium=member_ios',  icon: Linkedin },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-divider">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-divider">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <div className="font-serif text-2xl font-light tracking-widest text-text-primary" style={{ letterSpacing: '0.2em' }}>
                POTU
              </div>
              <div className="font-serif text-[0.6rem] tracking-[0.5em] text-gold font-light mt-0.5">
                PARTNERS
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed font-light">
              Top-tier legal counsel delivered with integrity, discretion, and uncompromising excellence.
            </p>
            <div className="mt-6 flex items-center gap-5">
              {SOCIALS.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-gold/70 hover:text-gold hover:filter-[drop-shadow(0_0_4px_rgba(212,175,55,0.7))] transition-all duration-300"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <h4 className="text-[0.65rem] tracking-[0.2em] uppercase text-gold font-medium mb-5">
              Practice Areas
            </h4>
            <ul className="space-y-3">
              {['Corporate Law', 'Litigation', 'Mergers & Acquisitions', 'Arbitration', 'Regulatory Affairs', 'Real Estate'].map(item => (
                <li key={item}>
                  <a href="#services" className="text-text-secondary text-sm hover:text-gold transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[0.65rem] tracking-[0.2em] uppercase text-gold font-medium mb-5">
              Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Vision',       href: '#vision' },
                { label: 'Our Mission',  href: '#mission' },
                { label: 'About Office', href: '#about' },
                { label: 'Our Partners', href: '#partners' },
              ].map(item => (
                <li key={item.href}>
                  <a href={item.href} className="text-text-secondary text-sm hover:text-gold transition-colors duration-200">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[0.65rem] tracking-[0.2em] uppercase text-gold font-medium mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <span className="text-text-secondary text-sm leading-relaxed">
                  Ruko Mall 9K Puncak CBD, Jl. Keramat<br />
                  Surabaya, Jawa Timur
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-gold flex-shrink-0" />
                <a href="tel:+6281216723060" className="text-text-secondary text-sm hover:text-gold transition-colors">
                  +62 (812) 1672-3060
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-gold flex-shrink-0" />
                <a href="mailto:potuandpartners@gmail.com" className="text-text-secondary text-sm hover:text-gold transition-colors">
                  potuandpartners@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-1 gap-y-1 text-text-muted text-xs tracking-wide">
            <span>© {year} PotuPartners. All rights reserved. | Powered by</span>
            <img src="/torch-logo.png" alt="Torch Logo" className="h-4 w-auto opacity-80" />
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-text-muted text-xs hover:text-gold transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-text-muted text-xs hover:text-gold transition-colors">
              Terms of Use
            </a>
            <a href="#" className="text-text-muted text-xs hover:text-gold transition-colors">
              Disclaimer
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}