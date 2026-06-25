'use client';

import { useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    title:   'Dugaan Korupsi Chromebook: Menelusuri Jejak Anggaran dan Pertanggungjawaban',
    excerpt: 'Skandal dugaan korupsi dalam pengadaan perangkat teknologi pendidikan telah menjadi sorotan publik di Indonesia. Proyek pengadaan Chromebook yang menelan anggaran Rp 9,9 triliun sepanjang 2019–2023 menuai berbagai kritik dan kecurigaan.',
    author:  'Immanuel Hendra, S.H.',
    role:    'Paralegal Potu and Partners Law Office',
    date:    '18 Mei 2026',
    image:   '/article/Article01.png',
  },
  {
    id: 2,
    title:   'Prinsip Business Judgement Rule dalam Korporasi',
    excerpt: 'Prinsip Business Judgement Rule memberikan perlindungan hukum bagi Direksi Perseroan atas keputusan bisnis yang diambil dengan iktikad baik dan kehati-hatian, meskipun keputusan tersebut pada akhirnya menimbulkan kerugian bagi perusahaan.',
    author:  'Nabila Purnamasasi, S.H.',
    role:    '',
    date:    '20 Mei 2026',
    image:   '/article/Article02.png',
  },
  {
    id: 3,
    title:   'Implementasi Bursa Karbon dan Strategi Hilirisasi Nikel dalam Perspektif POJK No. 14 Tahun 2023',
    excerpt: 'Pemerintah Indonesia tengah mendorong pertumbuhan ekonomi berbasis sumber daya alam melalui program hilirisasi nikel. Di sisi lain, OJK melalui POJK No. 14 Tahun 2023 mengatur perdagangan karbon sebagai strategi pengurangan emisi dan penguatan sektor keuangan.',
    author:  'Emilia Lailatul Fitria, S.H.',
    role:    '',
    date:    '22 Mei 2026',
    image:   '/article/Article03.png',
  },
  {
    id: 4,
    title:   'Ketidakpastian Hukum Covernote Notaris dalam Aktivitas Kredit Perbankan',
    excerpt: 'Covernote notaris kerap menjadi pegangan bank dalam pencairan kredit sebelum terbitnya sertipikat hak tanggungan. Namun ketiadaan dasar hukum yang tegas dalam UU Jabatan Notaris menimbulkan risiko hukum yang signifikan bagi kreditur.',
    author:  'Reni Putri Anggraeni, S.H.',
    role:    '',
    date:    '25 Mei 2026',
    image:   '/article/Article04.png',
  },
  {
    id: 5,
    title:   'Prinsip-Prinsip Good Corporate Governance (GCG) dalam Perseroan',
    excerpt: 'Good Corporate Governance (GCG) menjadi pilar penting bagi keberlanjutan perusahaan. Pedoman KNKG menetapkan lima prinsip utama: transparansi, akuntabilitas, responsibilitas, kemandirian, dan kewajaran.',
    author:  'Muhammad Azri Arrizki, S.H.',
    role:    '',
    date:    '26 Mei 2026',
    image:   '/article/Article05.png',
  },
  {
    id: 6,
    title:   'Tanggung Jawab Maskapai Penerbangan dalam Perlindungan Penumpang Pesawat',
    excerpt: 'Dalam perspektif hukum transportasi udara, perlindungan terhadap penumpang pesawat merupakan tanggung jawab utama maskapai. UU No. 1 Tahun 2009 dan Konvensi Montreal 1999 menjadi landasan hukum utama perlindungan penumpang domestik maupun internasional.',
    author:  'Adrian Cakhalino, S.H.',
    role:    'Partner Potu and Partners Law Office',
    date:    '29 Mei 2026',
    image:   '/article/Article06.png',
  },
];

export default function ArticleSection() {
  const { ref: headRef, visible: headV } = useReveal<HTMLDivElement>();
  const { ref: gridRef, visible: gridV } = useReveal<HTMLDivElement>({ threshold: 0.05 });

  const [active, setActive] = useState(0);

  const prev = () => setActive(i => (i - 1 + ARTICLES.length) % ARTICLES.length);
  const next = () => setActive(i => (i + 1) % ARTICLES.length);

  const featured = ARTICLES[active];

  return (
    <section id="article" className="py-32 md:py-44 bg-black relative overflow-hidden">
      <div className="absolute right-0 top-0 section-number">VIII</div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div
          ref={headRef}
          className={`reveal ${headV ? 'visible' : ''} mb-16`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-gold opacity-60" />
            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold font-sans font-light">
              08 — Article
            </span>
          </div>
          <h2
            className="font-serif font-light text-text-primary leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Perspektif Hukum dari <span className="italic text-gold">Para Rekan Kami.</span>
          </h2>
          <p className="font-sans text-text-secondary text-sm font-light mt-4 max-w-xl leading-relaxed">
            Artikel hukum singkat yang membahas dinamika aturan positif dan perspektif praktis, ditulis oleh rekan dan paralegal Potu &amp; Partners Law Office.
          </p>
        </div>

        {/* Featured article */}
        <div
          ref={gridRef}
          className={`reveal ${gridV ? 'visible' : ''}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-12">

            {/* Image */}
            <div className="relative h-72 md:h-96 w-full overflow-hidden border border-divider group">
              <Image
                key={featured.id}
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-gold/10" />
            </div>

            {/* Content */}
            <div className="space-y-4">
              <p className="font-sans text-[0.65rem] tracking-[0.2em] uppercase text-gold opacity-70">
                {featured.date}
              </p>
              <h3
                className="font-serif font-light text-text-primary leading-snug"
                style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}
              >
                {featured.title}
              </h3>
              <div className="gold-rule w-12" />
              <p className="font-sans text-sm text-text-secondary font-light leading-relaxed">
                {featured.excerpt}
              </p>
              <p className="font-sans text-xs text-text-muted font-light">
                {featured.author}
                {featured.role && (
                  <span className="text-gold opacity-60"> — {featured.role}</span>
                )}
              </p>
            </div>
          </div>

          {/* Controls + thumbnails */}
          <div className="flex items-center justify-between border-t border-divider pt-8">

            {/* Counter */}
            <span className="font-sans text-xs text-text-muted">
              {active + 1} / {ARTICLES.length}
            </span>

            {/* Thumbnail strip — desktop */}
            <div className="hidden md:flex items-center gap-3">
              {ARTICLES.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setActive(i)}
                  className={`relative w-14 h-10 overflow-hidden border transition-all duration-300 ${
                    i === active ? 'border-gold' : 'border-divider opacity-50 hover:opacity-80'
                  }`}
                >
                  <Image src={a.image} alt={a.title} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                className="w-9 h-9 border border-divider hover:border-gold flex items-center justify-center text-text-muted hover:text-gold transition-colors"
                aria-label="Previous article"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                className="w-9 h-9 border border-divider hover:border-gold flex items-center justify-center text-text-muted hover:text-gold transition-colors"
                aria-label="Next article"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}