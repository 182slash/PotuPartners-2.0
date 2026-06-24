'use client';

import { useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { Scale, Briefcase, Building2, Globe2, FileText, Shield } from 'lucide-react';

const SERVICES = [
  {
    Icon:        Scale,
    title:       'Corporate Litigation',
    description: 'Strategic representation in high-stakes commercial disputes. We navigate complex litigation from inception through appeal with precision and tenacity.',
    areas:       ['Shareholder disputes', 'Contract claims', 'Director liability', 'Injunctive relief'],
  },
  {
    Icon:        Briefcase,
    title:       'Mergers & Acquisitions',
    description: 'End-to-end advisory on corporate transactions, from structuring through regulatory clearance. We protect your interests at every stage of the deal lifecycle.',
    areas:       ['Due diligence', 'Regulatory filings', 'SPA negotiation', 'Post-merger integration'],
  },
  {
    Icon:        Globe2,
    title:       'International Arbitration',
    description: 'Experienced advocates in ICC, LCIA, and ad hoc arbitration proceedings. We represent both claimants and respondents in complex international disputes.',
    areas:       ['Commercial arbitration', 'Investment treaty', 'Enforcement proceedings', 'Emergency relief'],
  },
  {
    Icon:        Shield,
    title:       'Regulatory Affairs',
    description: 'Comprehensive counsel on licensing, compliance, and regulatory investigations. We engage proactively with regulatory bodies to protect your operating authority.',
    areas:       ['License applications', 'Enforcement defense', 'Compliance programs', 'Policy advocacy'],
  },
  {
    Icon:        Building2,
    title:       'Real Estate & Construction',
    description: 'Full-service legal support for commercial real estate transactions and construction disputes. From acquisition through development to disposition.',
    areas:       ['Acquisition & disposal', 'Development finance', 'Lease negotiations', 'Construction disputes'],
  },
  {
    Icon:        FileText,
    title:       'Constitutional & Administrative',
    description: 'Principled advocacy in constitutional challenges and judicial review proceedings. We defend fundamental rights and ensure public bodies act lawfully.',
    areas:       ['Constitutional challenges', 'Judicial review', 'Civil rights', 'Public interest litigation'],
  },
];

export default function ServicesSection() {
  const { ref: headRef, visible: headV } = useReveal<HTMLDivElement>();
  const { ref: gridRef, visible: gridV } = useReveal<HTMLDivElement>({ threshold: 0.05 });

  return (
    <section id="services" className="py-32 md:py-44 bg-surface relative overflow-hidden">

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#C6A75E 1px, transparent 1px),
            linear-gradient(90deg, #C6A75E 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="absolute right-0 top-0 section-number">V</div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div
          ref={headRef}
          className={`reveal ${headV ? 'visible' : ''} mb-16`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-gold opacity-60" />
            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold font-sans font-light">
              05 — Our Services
            </span>
          </div>
          <h2
            className="font-serif font-light text-text-primary leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Practice areas built for{' '}
            <span className="italic text-gold">complex mandates.</span>
          </h2>
        </div>

        {/* Service grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              className={`reveal ${gridV ? 'visible' : ''} group border border-divider bg-black p-8 hover:border-gold-dim hover:shadow-card-hover transition-all duration-400 cursor-default`}
              style={{ transitionDelay: gridV ? `${i * 70}ms` : '0ms' }}
            >
              {/* Icon */}
              <div className="mb-6 flex items-start justify-between">
                <div className="p-3 border border-divider group-hover:border-gold-faint transition-colors duration-300">
                  <s.Icon size={18} className="text-gold" />
                </div>
                <div
                  className="h-px w-0 group-hover:w-12 transition-all duration-500 self-center"
                  style={{ background: 'linear-gradient(90deg, transparent, #C6A75E)' }}
                />
              </div>

              {/* Title */}
              <h3 className="font-serif text-lg font-light text-text-primary mb-3 leading-snug tracking-wide">
                {s.title}
              </h3>

              {/* Description */}
              <p className="font-sans text-sm text-text-secondary font-light leading-relaxed mb-6">
                {s.description}
              </p>

              {/* Areas */}
              <div className="space-y-2 border-t border-divider pt-5">
                {s.areas.map(area => (
                  <div key={area} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gold opacity-50 flex-shrink-0" />
                    <span className="font-sans text-xs text-text-muted">
                      {area}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
