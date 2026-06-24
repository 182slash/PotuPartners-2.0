'use client';

import { useReveal } from '@/hooks/useReveal';

export default function VisionSection() {
  const { ref: titleRef,  visible: titleV  } = useReveal<HTMLDivElement>();
  const { ref: quoteRef,  visible: quoteV  } = useReveal<HTMLDivElement>({ threshold: 0.2 });
  const { ref: pillarsRef, visible: pillarsV } = useReveal<HTMLDivElement>({ threshold: 0.1 });

  const pillars = [
    { number: '01', label: 'Integrity',   detail: 'Every mandate, every counsel, bound by absolute ethical standards.' },
    { number: '02', label: 'Precision',   detail: 'Meticulous legal analysis that leaves no stone unturned.' },
    { number: '03', label: 'Discretion',  detail: 'Your matters handled with the highest level of confidentiality.' },
  ];

  return (
    <section id="vision" className="py-32 md:py-44 bg-black relative overflow-hidden">

      {/* Decorative large number */}
      <div className="absolute right-0 top-0 section-number pointer-events-none">I</div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Label */}
        <div
          ref={titleRef}
          className={`reveal ${titleV ? 'visible' : ''} mb-16`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-gold opacity-60" />
            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold font-sans font-light">
              01 — Vision
            </span>
          </div>
        </div>

        {/* Main quote block */}
        <div
          ref={quoteRef}
          className={`reveal ${quoteV ? 'visible' : ''} mb-24`}
        >
          {/* Opening quotation mark */}
          <div
            className="font-serif text-[8rem] leading-none text-gold opacity-15 mb-[-2rem] select-none"
            aria-hidden="true"
          >
            &ldquo;
          </div>

          <blockquote className="relative">
            <p
              className="font-serif font-light text-text-primary leading-tight"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', letterSpacing: '-0.01em' }}
            >
              To be the most trusted voice in the{' '}
              <em className="not-italic text-gold-gradient">
                most consequential
              </em>{' '}
              legal matters of our time — delivering clarity where others see complexity.
            </p>
          </blockquote>
        </div>

        {/* Gold rule */}
        <div className="gold-rule mb-24" />

        {/* Pillars */}
        <div
          ref={pillarsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-divider"
        >
          {pillars.map((p, i) => (
            <div
              key={p.number}
              className={`reveal ${pillarsV ? 'visible' : ''} px-0 md:px-10 first:pl-0 last:pr-0 py-8 md:py-0`}
              style={{ transitionDelay: pillarsV ? `${i * 120}ms` : '0ms' }}
            >
              <div className="font-serif text-4xl font-light text-gold opacity-40 mb-4 select-none">
                {p.number}
              </div>
              <h3 className="font-serif text-2xl font-light text-text-primary mb-3 tracking-wide">
                {p.label}
              </h3>
              <p className="font-sans text-sm text-text-secondary font-light leading-relaxed">
                {p.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
