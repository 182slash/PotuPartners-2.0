'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_LINKS = [
  { label: 'Vision',      href: '#vision' },
  { label: 'Mission',     href: '#mission' },
  { label: 'Our Office',  href: '#about' },
  { label: 'Partners',    href: '#partners' },
  { label: 'Services',    href: '#services' },
  { label: 'Highlights',  href: '#case-highlight' },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [activeSection, setActive]  = useState('');

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);

    // Determine active section via IntersectionObserver-like logic
    const sections = NAV_LINKS.map(l => l.href.replace('#', ''));
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) {
          setActive(sections[i]);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      const navH = 80;
      const top  = el.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const openChat = () => {
    // Dispatch custom event that ChatButton listens to
    window.dispatchEvent(new CustomEvent('open-chat'));
  };

  return (
    <>
      <nav
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-black/95 backdrop-blur-md border-b border-divider'
            : 'bg-transparent'
        )}
        style={{ height: 'var(--nav-height)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="PotuPartners Home"
          >
            {/* PNG Logo Icon - replace 'logo.png' with your actual filename */}
            <img 
              src="/logo.png" 
              alt="Potu Partners Logo" 
              className="h-10 w-auto" 
            />
            {/* Text Logo - hidden on mobile */}
            <div className="hidden md:flex flex-col leading-none">
              <span
                className="font-serif text-xl font-light tracking-widest text-text-primary group-hover:text-gold transition-colors duration-300"
                style={{ letterSpacing: '0.2em' }}
              >
                POTU
              </span>
              <span
                className="font-serif text-[0.55rem] tracking-[0.45em] text-gold font-light"
              >
                PARTNERS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => {
              const id = link.href.replace('#', '');
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={clsx(
                    'nav-link',
                    activeSection === id && 'text-gold after:w-full'
                  )}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-4">
            <button
              onClick={openChat}
              className="btn-gold hidden md:flex text-xs"
            >
              <span>Chat With Us</span>
            </button>

            <button
              className="md:hidden p-2 text-text-secondary hover:text-gold transition-colors"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/98 backdrop-blur-xl flex flex-col pt-24 px-8 pb-8 transition-all duration-500 md:hidden',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Gold decorative line */}
        <div className="gold-rule mb-10" />

        <nav className="flex flex-col gap-7 flex-1">
          {NAV_LINKS.map((link, i) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-left font-serif text-3xl font-light text-text-secondary hover:text-gold transition-colors duration-300"
              style={{ transitionDelay: menuOpen ? `${i * 50}ms` : '0ms' }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="gold-rule mb-8" />
          <button
            onClick={() => { setMenuOpen(false); openChat(); }}
            className="btn-gold w-full justify-center"
          >
            <span>Chat With Us</span>
          </button>
        </div>
      </div>
    </>
  );
}
