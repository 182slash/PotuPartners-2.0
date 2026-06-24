'use client';

import { useReveal } from '@/hooks/useReveal';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const STATS = [
  { value: '10+', label: 'Years of Practice' },
  { value: '400+', label: 'Cases Won' },
  { value: '4',   label: 'Senior Partners' },
  { value: '6',    label: 'Practice Areas' },
];

const SOCIALS = [
  { name: 'Facebook',  href: 'https://www.facebook.com/share/1AzBkbF7nX/?mibextid=wwXIfr',  icon: Facebook },
  { name: 'Instagram', href: 'https://www.instagram.com/potupartners?igsh=MTBhYzEyeHU5NnFqOA==', icon: Instagram },
  { name: 'Twitter',   href: 'https://x.com/potupartners?s=11&t=sw-0qLGvFCGtvd6erCLotQ',   icon: Twitter },
  { name: 'LinkedIn',  href: 'https://www.linkedin.com/in/potupartnerslawoffice?utm_source=share_via&utm_content=profile&utm_medium=member_ios',  icon: Linkedin },
];

export default function AboutSection() {
  const { ref: headRef, visible: headV } = useReveal<HTMLDivElement>();
  const { ref: bodyRef, visible: bodyV } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const { ref: statsRef, visible: statsV } = useReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section id="about" className="py-32 md:py-44 bg-black relative overflow-hidden">

      <div className="absolute right-0 top-0 section-number">III</div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div
          ref={headRef}
          className={`reveal ${headV ? 'visible' : ''} mb-16`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-gold opacity-60" />
            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold font-sans font-light">
              03 — About Our Office
            </span>
          </div>
          <h2
            className="font-serif font-light text-text-primary leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Where tradition meets{' '}
            <span className="italic text-gold">modern practice.</span>
          </h2>
        </div>

        {/* Main content grid */}
        <div
          ref={bodyRef}
          className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 mb-24"
        >
          {/* Text column — 3 cols */}
          <div className={`reveal ${bodyV ? 'visible' : ''} lg:col-span-3 space-y-6`}>
            <p className="font-sans text-text-secondary text-base font-light leading-relaxed">
              Founded in the tradition of rigorous legal excellence, PotuPartners has grown into
              a Top-tier institution serving clients across complex commercial, corporate, and
              constitutional matters. Our practice is defined not by volume, but by the calibre of
              counsel we bring to every engagement.
            </p>
            <p className="font-sans text-text-secondary text-base font-light leading-relaxed">
              Our offices are designed as a reflection of our practice: precise, considered,
              and uncompromising in quality. Every aspect of the environment — from our
              secure consultation suites to our extensive legal research library — is
              purpose-built to support the highest-stakes legal work.
            </p>
            <p className="font-sans text-text-secondary text-base font-light leading-relaxed">
              We operate on a strict mandate of client confidentiality. Matters handled within
              our walls remain within our walls. This commitment to discretion is not merely
              policy — it is the foundation on which trusted relationships are built.
            </p>

            {/* CTA text link */}
            <div className="pt-4">
              <a href="#partners" className="inline-flex items-center gap-3 group">
                <span className="text-gold text-sm tracking-[0.1em] font-sans">
                  Meet Our Partners
                </span>
                <div className="h-px w-8 bg-gold transition-all duration-300 group-hover:w-14" />
              </a>
            </div>
          </div>

          {/* Image / visual column — 2 cols */}
          <div className={`reveal-right ${bodyV ? 'visible' : ''} lg:col-span-2 flex flex-col h-full`}>
            {/* Placeholder for office imagery */}
            <div
              className="relative h-80 lg:flex-1 min-h-64 border border-divider overflow-hidden group"
            >
              <iframe
                src="https://maps.google.com/maps?q=Potu+%26+Partners+Law+Office+Surabaya&t=m&z=15&output=embed&iwloc=near"
                title="Potu Partners Office Location"
                className="absolute inset-0 w-full h-full transition-opacity duration-500 opacity-60 group-hover:opacity-80"
                style={{
                  border: 0,
                  filter: 'grayscale(100%) invert(100%) sepia(100%) saturate(150%) contrast(1.1) brightness(0.9)',
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Hover reveal */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <a
                  href="https://maps.app.goo.gl/bu4Kxfyus72ACyqW6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-xs text-text-secondary font-light hover:text-gold transition-colors"
                >
                  Ruko Mall 9K Puncak CBD. Surabaya
                </a>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              {SOCIALS.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-gold/70 hover:text-gold hover:filter-[drop-shadow(0_0_4px_rgba(212,175,55,0.7))] transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-divider"
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`reveal ${statsV ? 'visible' : ''} p-8 md:p-10 text-center border-r border-b md:border-b-0 border-divider last:border-r-0 even:border-r-0 md:even:border-r relative overflow-hidden group hover:bg-surface-2 transition-colors duration-300`}
              style={{ transitionDelay: statsV ? `${i * 80}ms` : '0ms' }}
            >
              <div className="font-serif font-light text-gold mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                {s.value}
              </div>
              <div className="font-sans text-[0.65rem] tracking-[0.2em] uppercase text-text-muted font-light">
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
