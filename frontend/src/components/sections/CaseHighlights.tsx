'use client';

import { useState, useEffect } from 'react';
import { useReveal } from '@/hooks/useReveal';
import Image from 'next/image';
import { Smartphone } from 'lucide-react';

const HIGHLIGHTS = [
  {
    title: 'Jessica Iskandar & Vincent Verhaag',
    subtitle: 'Fraud case experienced by Jessica Iskandar & Vincent Verhaag',
    details: 'Legal problem occurred when Jessica Iskandar worked with her partner to conduct a luxury car rental business in Bali. Over time, Jessica Iskandar realized that the proof of transfer of profit sharing and investment money given to her business partner did not match the facts that occurred.',
    imageUrl: '/case1.png',
  },
  {
    title: 'Kerispatih Band',
    subtitle: 'Copyright Issue between Kerispatih and Doadi Badai',
    details: 'Rolland E Potu, S.H, M.H. as Attorney for the Kerispatih Band, issued an open letter of clarification aimed at responding to Doadi\'s instagram post.',
    imageUrl: '/case2.png',
  },
  {
    title: 'Mujiono',
    subtitle: 'Mujiono Succeeded in Winning the Lawsuit & Case Object Executed',
    details: 'After decades fighting for His rights as the legal heir and entitled to the inherited property that has been left behind by his parents. In 2021, Mujiono as the plaintiff represented by his legal authority, Potu & Partners Law Office has won the "Gugatan Perbuatan Melawan Hukum" at the Sidoarjo District Court. On October 3, 2023, Rolland E Potu, S.H., M.H. succeeded in escorting Mujiono\'s client in carrying out the execution of case objects totalling 10,000 m2 in Terik Village, Krian, Sidoarjo.',
    imageUrl: '/case3.png',
  },
];

export default function CaseHighlightSection() {
  const { ref: headRef, visible: headV } = useReveal<HTMLDivElement>();
  const { ref: gridRef, visible: gridV } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled]         = useState(false);
  const [isIos, setIsIos]                 = useState(false);
  const [showIosHint, setShowIosHint]     = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(ios);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (isIos) { setShowIosHint(v => !v); return; }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  const showInstallBtn = !installed && (!!installPrompt || isIos);

  return (
    <section id="case-highlight" className="py-32 md:py-44 bg-black relative overflow-hidden">
      <div className="absolute right-0 top-0 section-number">VI</div>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div
          ref={headRef}
          className={`reveal ${headV ? 'visible' : ''} mb-16`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-gold opacity-60" />
            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold font-sans font-light">
              06 — Case Highlight
            </span>
          </div>
          <h2
            className="font-serif font-light text-text-primary leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            In the Public Eye: <span className="italic text-gold">High-Profile Representations.</span>
          </h2>
          <p className="font-sans text-text-secondary text-sm font-light mt-4 max-w-lg leading-relaxed">
            A selection of our work on notable cases that have captured public and media attention.
          </p>
        </div>

        {/* Cases Grid */}
        <div ref={gridRef} className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-6 px-6 md:block md:space-y-20 md:pb-0 md:mx-0 md:px-0">
          {HIGHLIGHTS.map((item, i) => (
            <div
              key={item.title}
              className={`reveal ${gridV ? 'visible' : ''} min-w-[85vw] md:min-w-0 snap-center grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center`}
              style={{ transitionDelay: gridV ? `${i * 100}ms` : '0ms' }}
            >
              <div className={`relative h-80 w-full group overflow-hidden border border-divider ${i % 2 !== 0 ? 'md:order-last' : ''}`}>
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-gold/20 transition-opacity duration-500 group-hover:opacity-0" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-light text-text-primary mb-2">{item.title}</h3>
                <p className="font-sans text-sm text-gold opacity-80 mb-4 italic">{item.subtitle}</p>
                <div className="gold-rule mb-4 w-16" />
                <p className="font-sans text-sm text-text-secondary font-light leading-relaxed">{item.details}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-20 border-t border-divider pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-xl font-light text-text-primary mb-2">
              Have a specific matter in mind?
            </h3>
            <p className="font-sans text-sm text-text-secondary font-light">
              Speak with one of our associates for a confidential consultation.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
              className="btn-gold px-10 w-full md:w-auto flex justify-center items-center"
            >
              <span>Begin a Conversation</span>
            </button>

            {showInstallBtn && (
              <div className="relative w-full md:w-auto">
                <button
                  onClick={handleInstall}
                  className="btn-gold px-10 flex items-center justify-center gap-2 w-full md:w-auto"
                >
                  <Smartphone size={14} />
                  <span>Install App</span>
                </button>

                {/* iOS tooltip */}
                {showIosHint && (
                  <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 bg-surface border border-gold-faint p-4 z-50 text-left">
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface border-l border-t border-gold-faint rotate-45" />
                    <p className="font-sans text-xs text-text-secondary leading-relaxed">
                      Tap the <span className="text-gold font-medium">Share</span> button in Safari, then select <span className="text-gold font-medium">"Add to Home Screen"</span> to install the app.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}