'use client';

import { useReveal } from '@/hooks/useReveal';
import { Shield, Scale, Users } from 'lucide-react';

const COMMITMENTS = [
  {
    Icon:  Shield,
    title: 'Unwavering Ethics',
    body:  'We operate at the intersection of principle and practice. Every engagement is governed by a strict ethical code that ensures our clients receive counsel unclouded by conflict or compromise.',
    note:  'Zero tolerance for ethical deviation.',
  },
  {
    Icon:  Scale,
    title: 'Client-First Mandate',
    body:  'Your objectives define our strategy. We listen intently, advise candidly, and execute relentlessly — functioning not merely as attorneys, but as trusted partners invested in your outcomes.',
    note:  'Your success is our measure.',
  },
  {
    Icon:  Users,
    title: 'Institutional Excellence',
    body:  'Our partners bring decades of combined experience from the most demanding legal environments. This depth of expertise is brought to bear on every matter, regardless of scale.',
    note:  'Experience that commands respect.',
  },
];

export default function MissionSection() {
  const { ref: headRef, visible: headV } = useReveal<HTMLDivElement>();
  const { ref: cardsRef, visible: cardsV } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const { ref: stmtRef,  visible: stmtV  } = useReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section id="mission" className="py-32 md:py-44 bg-surface relative overflow-hidden">

      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(42,42,42,0.3) 80px, rgba(42,42,42,0.3) 81px)',
        }}
      />

      <div className="absolute right-0 top-0 section-number pointer-events-none">II</div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div
          ref={headRef}
          className={`reveal ${headV ? 'visible' : ''} mb-20`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-gold opacity-60" />
            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold font-sans font-light">
              02 — Mission &amp; Commitment
            </span>
          </div>
          <div className="max-w-2xl">
            <h2
              className="font-serif font-light text-text-primary leading-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              A practice built on principles that{' '}
              <span className="italic text-gold">endure.</span>
            </h2>
            <p className="font-sans text-text-secondary text-base font-light leading-relaxed">
              Our mission is not merely to win cases — it is to serve as the legal architects of our
              clients&apos; most important decisions, building outcomes that stand the test of time.
            </p>
          </div>
        </div>

        {/* 3 Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {COMMITMENTS.map((c, i) => (
            <div
              key={c.title}
              className={`reveal ${cardsV ? 'visible' : ''} group relative`}
              style={{ transitionDelay: cardsV ? `${i * 100}ms` : '0ms' }}
            >
              <div
                className="h-full p-8 border border-gold-faint bg-black transition-all duration-400 group-hover:border-gold-dim group-hover:shadow-card-hover"
                style={{ '--tw-border-opacity': 1 } as React.CSSProperties}
              >
                {/* Top accent line */}
                <div
                  className="h-px mb-8 transition-all duration-500"
                  style={{
                    background: 'linear-gradient(90deg, #C6A75E 0%, transparent 100%)',
                    width: '40%',
                  }}
                />

                {/* Icon */}
                <div className="mb-6 inline-flex p-3 border border-divider group-hover:border-gold-faint transition-colors duration-300">
                  <c.Icon size={20} className="text-gold" />
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl font-light text-text-primary mb-4 tracking-wide">
                  {c.title}
                </h3>

                {/* Body */}
                <p className="font-sans text-sm text-text-secondary font-light leading-relaxed mb-6">
                  {c.body}
                </p>

                {/* Bottom note */}
                <div className="mt-auto pt-4 border-t border-divider">
                  <p className="font-sans text-[0.7rem] tracking-[0.1em] text-gold opacity-70 font-light">
                    {c.note}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mission statement */}
        <div
          ref={stmtRef}
          className={`reveal ${stmtV ? 'visible' : ''}`}
        >
          <div className="border border-divider bg-black p-10 md:p-14 relative overflow-hidden">
            {/* Corner decoration */}
            <div
              className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at top right, rgba(198,167,94,0.08) 0%, transparent 70%)',
              }}
            />
            <p
              className="font-serif font-light text-text-primary leading-relaxed text-center"
              style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)' }}
            >
              &ldquo;We do not merely represent our clients&apos; interests —
              we protect their{' '}
              <span className="italic text-gold">futures</span>.&rdquo;
            </p>
            <div className="flex justify-center mt-6">
              <div className="h-px w-24 bg-gold opacity-30" />
            </div>
            <p className="text-center text-text-muted text-xs tracking-[0.2em] uppercase mt-4 font-sans">
              The Founding Partners
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
