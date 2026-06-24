'use client';

import { useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { Linkedin, X } from 'lucide-react';
import { getInitials } from '@/lib/utils';

const PARTNERS = [
  // ── Founding & Managing Partner ──────────────────────────────────────────
  {
    id: '1',
    fullName:    'Rolland E. Potu, S.H., M.H.',
    title:       'Founding & Managing Partner',
    specialty:   'Corporate Litigation · Arbitration',
    avatarUrl:   '/rolland.png',
    bio:         'Rolland is the founder of Potu and Partners Law Office. He was graduated from Faculty of Law Wijaya Kusuma University Surabaya and finished his Master Degree at Airlangga University Surabaya. His specialization is a Private Law, Civil and Criminal Litigation, Property Law, Corporate Law and Capital Market.',
    linkedinUrl: 'https://www.linkedin.com/in/rolland-potu-s-h-m-h-7b2bb1306?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
  },
  // ── Co-Managing Partners ─────────────────────────────────────────────────
  {
    id: '2',
    fullName:    'Gesang Taufikurochman, S.H.',
    title:       'Co-Managing Partner',
    specialty:   'Mergers & Acquisitions · Regulatory',
    avatarUrl:   '/gesang.jpg',
    bio:         'Gesang is a Co-Managing Partner in Potu and Partners Law Office. He got a bachelor degree of law in Faculty Of Law Wijaya Kusuma University, Surabaya.',
    linkedinUrl: 'https://www.linkedin.com/in/gesang-taufikurochman-s-h-9b8b95280?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
  },
  {
    id: '3',
    fullName:    'Miswar Tomagola, S.H.',
    title:       'Co-Managing Partner',
    specialty:   'Constitutional Law · Civil Rights',
    avatarUrl:   '/miswar.jpg',
    bio:         'Miswar is a Co-Managing Partner in Potu and Partners Law Office. He got a Bachelor Degree of Law in Faculty of Law State Islamic University of Abdul Muthalib Sangadji, Ambon.',
    linkedinUrl: '#',
  },
  // ── Co-Lawyers ───────────────────────────────────────────────────────────
  {
    id: '4',
    fullName:    'Adrian Cakhalino, S.H.',
    title:       'Co-Lawyer',
    specialty:   'Real Estate · Restructuring',
    avatarUrl:   '/adrian.png',
    bio:         'Adrian is a Co-Lawyer at Potu and Partners Law Office. He earned his Bachelor of Law from the Faculty of Law at the University of Surabaya.',
    linkedinUrl: 'https://www.linkedin.com/in/adrian-cakhalino-s-h-732a521b8?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
  },
  {
    id: '11',
    fullName:    'Vanessa Handayani, S.H.',
    title:       'Co-Lawyer',
    specialty:   'Civil Law · Dispute Resolution',
    avatarUrl:   '/vanessa.jpg',
    bio:         'Vanessa is a Co-Lawyer at Potu and Partners Law Office. She earned her Bachelor of Law degree from the Faculty of Law at the University of Surabaya.',
    linkedinUrl: 'https://www.linkedin.com/in/vanessa-handayani-19a092315?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
  },
  // ── Public Relation ──────────────────────────────────────────────────────
  {
    id: '5',
    fullName:    'Albert R. Potu, S.E.',
    title:       'Public Relation',
    specialty:   'Public Relations · Communications',
    avatarUrl:   '/albert.png',
    bio:         'Albert is a Public Relation who graduated from the Faculty of Economy, Wijaya Kusuma University.',
    linkedinUrl: '#',
  },
  // ── Senior Paralegal ─────────────────────────────────────────────────────
  {
    id: '6',
    fullName:    'Marchellina Shagyna, S.H.',
    title:       'Senior Paralegal',
    specialty:   'Legal Research · Litigation Support',
    avatarUrl:   '/marchellina.jpg',
    bio:         'Marchellina is a Senior Paralegal who graduated from the Faculty of Law, Brawijaya University.',
    linkedinUrl: 'https://www.linkedin.com/in/marchellinasa?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
  },
  // ── Paralegals ───────────────────────────────────────────────────────────
  {
    id: '7',
    fullName:    'Mario Febrianto Sukoto, S.H.',
    title:       'Paralegal',
    specialty:   'Drafting · Case Management',
    avatarUrl:   '/mario.jpg',
    bio:         'Mario is a Paralegal who graduated from the Faculty Of Law Airlangga University Surabaya.',
    linkedinUrl: 'https://www.linkedin.com/in/mariofebrianto?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
  },
  {
    id: '8',
    fullName:    'Alifia Nur Safitri, S.H.',
    title:       'Paralegal',
    specialty:   'Regulatory Filings · Documentation',
    avatarUrl:   '/alifia.jpg',
    bio:         'Alifia is a Paralegal who graduated from the Faculty of Law, Surabaya States University.',
    linkedinUrl: '#',
  },
  {
    id: '9',
    fullName:    'Immanuel Hendra, S.H.',
    title:       'Paralegal',
    specialty:   'Due Diligence · Contract Review',
    avatarUrl:   '/immanuel.jpg',
    bio:         'Immanuel is a Paralegal who graduated from the Faculty of Law, University of Surabaya.',
    linkedinUrl: 'https://www.linkedin.com/in/immanuel-hendra-s-h-0350ab288?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
  },
  {
    id: '10',
    fullName:    'Dimas Aqil Azizi, S.H.',
    title:       'Paralegal',
    specialty:   'Court Procedures · Compliance',
    avatarUrl:   '/dimas.png',
    bio:         'Dimas is a Paralegal who graduated from the Faculty of Law, Brawijaya University.',
    linkedinUrl: 'https://www.linkedin.com/in/dimasaqilazizi?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
  },
];

export default function PartnersSection() {
  const { ref: headRef, visible: headV } = useReveal<HTMLDivElement>();
  const { ref: gridRef, visible: gridV } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = PARTNERS.find(p => p.id === activeId);

  return (
    <section id="partners" className="py-32 md:py-44 bg-black relative overflow-hidden">

      <div className="absolute right-0 top-0 section-number">IV</div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div
          ref={headRef}
          className={`reveal ${headV ? 'visible' : ''} mb-16`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-gold opacity-60" />
            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold font-sans font-light">
              04 — Our Partners
            </span>
          </div>
          <h2
            className="font-serif font-light text-text-primary leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Counsel you can{' '}
            <span className="italic text-gold">count on.</span>
          </h2>
          <p className="font-sans text-text-secondary text-sm font-light mt-4 max-w-lg leading-relaxed">
            Our partners are practitioners of the highest order. Hover to learn more.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {PARTNERS.map((p, i) => (
            <div
              key={p.id}
              className={`reveal ${gridV ? 'visible' : ''} partner-card group relative border border-divider bg-surface-2 cursor-pointer overflow-hidden transition-all duration-300 hover:border-gold-dim hover:shadow-card-hover`}
              style={{ transitionDelay: gridV ? `${i * 80}ms` : '0ms' }}
              onClick={() => setActiveId(p.id)}
            >
              {/* Avatar */}
              <div className="relative h-56 bg-surface-3 overflow-hidden">
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.fullName}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative">
                      <div
                        className="w-20 h-20 border border-gold opacity-20 flex items-center justify-center"
                        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center font-serif text-2xl font-light text-gold opacity-50 select-none">
                        {getInitials(p.fullName)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Hover overlay with bio */}
                <div className="bio-overlay absolute inset-0 bg-black/90 p-6 flex flex-col justify-end">
                  <p className="font-sans text-xs text-text-secondary font-light leading-relaxed">
                    {p.bio}
                  </p>
                  {p.linkedinUrl && (
                    <a
                      href={p.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-gold text-xs hover:text-gold-light transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      <Linkedin size={12} />
                      <span className="tracking-[0.1em] font-sans">LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-serif text-base font-light text-text-primary mb-1 leading-snug">
                  {p.fullName}
                </h3>
                <p className="font-sans text-[0.65rem] tracking-[0.05em] text-gold opacity-70 mb-2">
                  {p.title}
                </p>
                <p className="font-sans text-[0.65rem] text-text-muted">
                  {p.specialty}
                </p>
              </div>

              {/* Bottom gold accent line */}
              <div
                className="h-px w-0 group-hover:w-full bg-gold transition-all duration-500"
                style={{ background: 'linear-gradient(90deg, #C6A75E, #D4AF37)' }}
              />
            </div>
          ))}
        </div>

      </div>

      {/* Full Bio Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveId(null)}
        >
          <div
            className="relative bg-surface border border-divider max-w-lg w-full p-8 md:p-12"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-text-muted hover:text-gold transition-colors"
              onClick={() => setActiveId(null)}
            >
              <X size={18} />
            </button>

            <div className="mb-6 flex items-start gap-5">
              {active.avatarUrl ? (
                <img
                  src={active.avatarUrl}
                  alt={active.fullName}
                  className="w-16 h-16 object-cover object-top flex-shrink-0 border border-divider"
                />
              ) : (
                <div className="w-14 h-14 border border-divider flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-xl font-light text-gold select-none">
                    {getInitials(active.fullName)}
                  </span>
                </div>
              )}
              <div>
                <h2 className="font-serif text-2xl font-light text-text-primary mb-1">
                  {active.fullName}
                </h2>
                <p className="font-sans text-[0.7rem] tracking-[0.1em] text-gold opacity-70 mb-1">
                  {active.title}
                </p>
                <p className="font-sans text-[0.7rem] text-text-muted">
                  {active.specialty}
                </p>
              </div>
            </div>

            <div className="gold-rule mb-6" />

            <p className="font-sans text-sm text-text-secondary font-light leading-relaxed mb-6">
              {active.bio}
            </p>

            {active.linkedinUrl && (
              <a
                href={active.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold text-xs hover:text-gold-light transition-colors"
              >
                <Linkedin size={14} />
                <span className="tracking-[0.1em] font-sans">View LinkedIn Profile</span>
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}