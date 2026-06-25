'use client';

import { useEffect, useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import Image from 'next/image';
import { X, Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  body: string[];
  author: string;
  role: string;
  date: string;
  image: string;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    title:   'Dugaan Korupsi Chromebook: Menelusuri Jejak Anggaran dan Pertanggungjawaban',
    excerpt: 'Skandal dugaan korupsi dalam pengadaan perangkat teknologi pendidikan telah menjadi sorotan publik di Indonesia. Proyek pengadaan Chromebook yang menelan anggaran Rp 9,9 triliun sepanjang 2019–2023 menuai berbagai kritik dan kecurigaan.',
    body: [
      'Skandal dugaan korupsi dalam pengadaan perangkat teknologi pendidikan telah menjadi sorotan publik di Indonesia. Proyek pengadaan Chromebook yang menelan anggaran Rp 9,9 triliun sepanjang 2019–2023 menuai berbagai kritik dan kecurigaan, terutama terkait transparansi proses lelang dan kesesuaian spesifikasi perangkat dengan kebutuhan riil di lapangan.',
      'Dari perspektif hukum, persoalan ini tidak hanya menyangkut aspek pidana korupsi sebagaimana diatur dalam UU No. 31 Tahun 1999 sebagaimana diubah dengan UU No. 20 Tahun 2001, tetapi juga menyentuh tata kelola pengadaan barang dan jasa pemerintah berdasarkan Peraturan Presiden No. 12 Tahun 2021. Indikasi penggelembungan harga (mark-up), kongkalikong dalam proses tender, serta lemahnya pengawasan pertanggungjawaban anggaran menjadi titik krusial yang perlu ditelusuri oleh aparat penegak hukum.',
      'Prinsip akuntabilitas dan transparansi dalam pengelolaan keuangan negara, sebagaimana diamanatkan UU No. 17 Tahun 2003 tentang Keuangan Negara, menuntut setiap rupiah anggaran publik dapat dipertanggungjawabkan secara terbuka. Ketika proyek strategis nasional seperti digitalisasi pendidikan justru diwarnai dugaan penyimpangan, kepercayaan publik terhadap tata kelola pemerintahan turut tergerus.',
      'Penegakan hukum yang tegas dan independen menjadi kunci untuk memastikan bahwa anggaran pendidikan benar-benar digunakan demi kepentingan generasi muda, bukan demi kepentingan segelintir pihak. Proses hukum yang berjalan transparan juga akan menjadi preseden penting bagi pengelolaan proyek-proyek pengadaan teknologi pendidikan di masa mendatang.',
    ],
    author:  'Immanuel Hendra, S.H.',
    role:    'Paralegal Potu and Partners Law Office',
    date:    '18 Mei 2026',
    image:   '/Article/Article01.png',
  },
  {
    id: 2,
    title:   'Prinsip Business Judgement Rule dalam Korporasi',
    excerpt: 'Prinsip Business Judgement Rule memberikan perlindungan hukum bagi Direksi Perseroan atas keputusan bisnis yang diambil dengan iktikad baik dan kehati-hatian, meskipun keputusan tersebut pada akhirnya menimbulkan kerugian bagi perusahaan.',
    body: [
      'Prinsip Business Judgement Rule memberikan perlindungan hukum bagi Direksi Perseroan atas keputusan bisnis yang diambil dengan iktikad baik dan kehati-hatian, meskipun keputusan tersebut pada akhirnya menimbulkan kerugian bagi perusahaan. Prinsip ini diakui dalam Pasal 97 ayat (5) UU No. 40 Tahun 2007 tentang Perseroan Terbatas, yang menegaskan bahwa Direksi tidak dapat dimintai pertanggungjawaban pribadi atas kerugian perseroan apabila dapat membuktikan kerugian tersebut bukan karena kesalahan atau kelalaiannya.',
      'Secara doktrinal, Business Judgement Rule lahir dari pemahaman bahwa dunia bisnis senantiasa diwarnai ketidakpastian. Direksi yang dibebani tanggung jawab atas setiap keputusan yang berujung kerugian — tanpa memperhatikan proses pengambilan keputusan itu sendiri — akan kehilangan keberanian untuk mengambil langkah strategis yang sebenarnya diperlukan demi pertumbuhan perusahaan.',
      'Untuk dapat berlindung di bawah prinsip ini, Direksi harus memenuhi beberapa syarat kumulatif: keputusan diambil dengan iktikad baik (good faith), penuh tanggung jawab (fully informed), tanpa kepentingan pribadi yang bertentangan dengan kepentingan perseroan (no conflict of interest), dan sesuai dengan maksud serta tujuan perseroan. Pembuktian atas terpenuhinya unsur-unsur tersebut menjadi kunci dalam setiap sengketa yang melibatkan tanggung jawab Direksi.',
      'Dalam praktiknya, penerapan Business Judgement Rule kerap menjadi medan pertarungan argumentasi hukum antara pemegang saham yang merasa dirugikan dan Direksi yang membela keputusan bisnisnya. Pendampingan hukum yang cermat sejak proses pengambilan keputusan korporasi menjadi langkah preventif terbaik untuk meminimalkan risiko gugatan di kemudian hari.',
    ],
    author:  'Nabila Purnamasasi, S.H.',
    role:    'Paralegal Potu and Partners Law Office',
    date:    '20 Mei 2026',
    image:   '/Article/Article02.png',
  },
  {
    id: 3,
    title:   'Implementasi Bursa Karbon dan Strategi Hilirisasi Nikel dalam Perspektif POJK No. 14 Tahun 2023',
    excerpt: 'Pemerintah Indonesia tengah mendorong pertumbuhan ekonomi berbasis sumber daya alam melalui program hilirisasi nikel. Di sisi lain, OJK melalui POJK No. 14 Tahun 2023 mengatur perdagangan karbon sebagai strategi pengurangan emisi dan penguatan sektor keuangan.',
    body: [
      'Pemerintah Indonesia tengah mendorong pertumbuhan ekonomi berbasis sumber daya alam melalui program hilirisasi nikel sebagai bagian dari strategi besar menjadikan Indonesia pemain utama dalam rantai pasok kendaraan listrik global. Di sisi lain, Otoritas Jasa Keuangan melalui Peraturan OJK No. 14 Tahun 2023 mengatur perdagangan karbon melalui bursa karbon sebagai strategi pengurangan emisi dan penguatan sektor keuangan berkelanjutan.',
      'Persinggungan antara kedua kebijakan ini menjadi menarik untuk dicermati. Industri hilirisasi nikel, khususnya smelter, dikenal sebagai salah satu penyumbang emisi karbon yang signifikan. Kewajiban pelaku usaha untuk berpartisipasi dalam mekanisme bursa karbon — baik melalui perdagangan emisi (cap and trade) maupun mekanisme offset — menjadi instrumen hukum yang memaksa pelaku industri ekstraktif untuk turut bertanggung jawab atas dampak lingkungan dari aktivitasnya.',
      'POJK No. 14 Tahun 2023 mengatur secara rinci mengenai penyelenggaraan perdagangan melalui bursa karbon, termasuk persyaratan penyelenggara bursa, mekanisme perdagangan unit karbon, serta pengawasan terhadap potensi praktik curang seperti greenwashing. Bagi pelaku usaha hilirisasi nikel, kepatuhan terhadap kerangka regulasi ini bukan sekadar kewajiban administratif, melainkan bagian dari mitigasi risiko hukum dan reputasi di tengah meningkatnya tekanan global terhadap praktik ESG (Environmental, Social, and Governance).',
      'Sinergi antara kebijakan hilirisasi dan kebijakan dekarbonisasi menuntut harmonisasi regulasi lintas sektor — antara Kementerian ESDM, Kementerian Lingkungan Hidup, dan OJK — agar pertumbuhan ekonomi berbasis sumber daya alam tidak mengorbankan komitmen Indonesia terhadap pengurangan emisi sebagaimana tercantum dalam Nationally Determined Contribution (NDC).',
    ],
    author:  'Emilia Lailatul Fitria, S.H.',
    role:    'Paralegal Potu and Partners Law Office',
    date:    '22 Mei 2026',
    image:   '/Article/Article03.png',
  },
  {
    id: 4,
    title:   'Ketidakpastian Hukum Covernote Notaris dalam Aktivitas Kredit Perbankan',
    excerpt: 'Covernote notaris kerap menjadi pegangan bank dalam pencairan kredit sebelum terbitnya sertipikat hak tanggungan. Namun ketiadaan dasar hukum yang tegas dalam UU Jabatan Notaris menimbulkan risiko hukum yang signifikan bagi kreditur.',
    body: [
      'Covernote notaris kerap menjadi pegangan bank dalam pencairan kredit sebelum terbitnya sertipikat hak tanggungan. Dalam praktik perbankan, covernote berfungsi sebagai surat keterangan sementara dari notaris yang menyatakan bahwa proses pengikatan jaminan — seperti pembuatan Akta Pemberian Hak Tanggungan (APHT) — sedang dalam proses penyelesaian di kantor pertanahan.',
      'Namun, ketiadaan dasar hukum yang tegas dalam UU No. 2 Tahun 2014 tentang Perubahan atas UU Jabatan Notaris menimbulkan risiko hukum yang signifikan bagi kreditur. Covernote pada dasarnya bukan merupakan produk hukum yang diatur secara eksplisit, melainkan kebiasaan (custom) yang berkembang dalam praktik perbankan dan kenotariatan, sehingga kekuatan hukumnya kerap diperdebatkan ketika terjadi sengketa.',
      'Risiko terbesar muncul ketika proses pendaftaran hak tanggungan ke Kantor Pertanahan mengalami kendala atau bahkan gagal terbit, sementara bank telah mencairkan kredit berdasarkan covernote tersebut. Dalam situasi demikian, posisi bank sebagai kreditur menjadi rentan karena belum memiliki hak preferen atas objek jaminan sebagaimana dimaksud dalam UU No. 4 Tahun 1996 tentang Hak Tanggungan.',
      'Untuk memitigasi risiko tersebut, bank perlu memperkuat klausul perjanjian kredit yang mengatur konsekuensi hukum apabila proses pengikatan jaminan tidak selesai sesuai jangka waktu covernote, serta melakukan uji tuntas (due diligence) yang memadai terhadap notaris rekanan. Penguatan kerangka hukum mengenai covernote, baik melalui regulasi OJK maupun pedoman organisasi notaris, juga menjadi langkah penting untuk menutup ketidakpastian hukum yang selama ini membayangi praktik kredit perbankan.',
    ],
    author:  'Reni Putri Anggraeni, S.H.',
    role:    'Paralegal Potu and Partners Law Office',
    date:    '25 Mei 2026',
    image:   '/Article/Article04.png',
  },
  {
    id: 5,
    title:   'Prinsip-Prinsip Good Corporate Governance (GCG) dalam Perseroan',
    excerpt: 'Good Corporate Governance (GCG) menjadi pilar penting bagi keberlanjutan perusahaan. Pedoman KNKG menetapkan lima prinsip utama: transparansi, akuntabilitas, responsibilitas, kemandirian, dan kewajaran.',
    body: [
      'Good Corporate Governance (GCG) menjadi pilar penting bagi keberlanjutan perusahaan di tengah persaingan usaha yang semakin kompleks. Pedoman Umum Good Corporate Governance Indonesia yang disusun oleh Komite Nasional Kebijakan Governance (KNKG) menetapkan lima prinsip utama: transparansi, akuntabilitas, responsibilitas, kemandirian, dan kewajaran (fairness).',
      'Transparansi menuntut perusahaan menyediakan informasi yang material dan relevan secara akurat dan tepat waktu kepada seluruh pemangku kepentingan. Akuntabilitas mensyaratkan kejelasan fungsi, struktur, sistem, dan pertanggungjawaban organ perusahaan agar pengelolaan berjalan efektif. Sementara responsibilitas menegaskan kesesuaian pengelolaan perusahaan dengan peraturan perundang-undangan dan prinsip korporasi yang sehat.',
      'Prinsip kemandirian mewajibkan perusahaan dikelola secara independen tanpa intervensi yang tidak sesuai dengan peraturan dan dari pihak manapun yang bertentangan dengan kepentingan perusahaan. Adapun kewajaran menuntut perlakuan yang setara dan adil dalam memenuhi hak-hak pemangku kepentingan berdasarkan perjanjian dan peraturan yang berlaku.',
      'Implementasi GCG yang konsisten bukan sekadar pemenuhan kewajiban regulasi, melainkan investasi jangka panjang bagi kepercayaan investor, mitigasi risiko hukum, serta keberlangsungan reputasi perusahaan. Perusahaan yang mengabaikan prinsip-prinsip ini cenderung lebih rentan terhadap sengketa internal, gugatan derivatif dari pemegang saham minoritas, hingga sanksi dari otoritas pengawas pasar modal.',
    ],
    author:  'Muhammad Azri Arrizki, S.H.',
    role:    'Paralegal Potu and Partners Law Office',
    date:    '26 Mei 2026',
    image:   '/Article/Article05.png',
  },
  {
    id: 6,
    title:   'Tanggung Jawab Maskapai Penerbangan dalam Perlindungan Penumpang Pesawat',
    excerpt: 'Dalam perspektif hukum transportasi udara, perlindungan terhadap penumpang pesawat merupakan tanggung jawab utama maskapai. UU No. 1 Tahun 2009 dan Konvensi Montreal 1999 menjadi landasan hukum utama perlindungan penumpang domestik maupun internasional.',
    body: [
      'Dalam perspektif hukum transportasi udara, perlindungan terhadap penumpang pesawat merupakan tanggung jawab utama maskapai penerbangan sebagai badan usaha angkutan udara. UU No. 1 Tahun 2009 tentang Penerbangan dan Konvensi Montreal 1999 menjadi landasan hukum utama perlindungan penumpang, baik untuk penerbangan domestik maupun internasional.',
      'Prinsip tanggung jawab yang dianut adalah presumption of liability, di mana maskapai dianggap bertanggung jawab atas kerugian yang dialami penumpang — baik berupa keterlambatan, kehilangan atau kerusakan bagasi, hingga kecelakaan yang menimbulkan luka atau kematian — kecuali maskapai dapat membuktikan bahwa kerugian tersebut bukan disebabkan oleh kelalaiannya.',
      'Peraturan Menteri Perhubungan No. PM 77 Tahun 2011 lebih lanjut mengatur besaran kompensasi yang wajib diberikan maskapai kepada penumpang atas keterlambatan, pembatalan penerbangan, maupun denied boarding akibat kelebihan kapasitas (overbooking). Ketentuan ini memberikan kepastian hukum bagi penumpang dalam menuntut hak-haknya tanpa harus melalui proses litigasi yang panjang.',
      'Bagi maskapai, kepatuhan terhadap kerangka regulasi ini bukan sekadar mitigasi risiko hukum, melainkan bagian dari komitmen terhadap keselamatan dan kenyamanan penumpang sebagai inti dari layanan transportasi udara. Penegakan hak penumpang yang konsisten, didukung oleh kesadaran hukum yang memadai dari kedua belah pihak, akan memperkuat kepercayaan publik terhadap industri penerbangan nasional.',
    ],
    author:  'Adrian Cakhalino, S.H.',
    role:    'Partner Potu and Partners Law Office',
    date:    '29 Mei 2026',
    image:   '/Article/Article06.png',
  },
];

export default function ArticleSection() {
  const { ref: headRef, visible: headV } = useReveal<HTMLDivElement>();
  const { ref: gridRef, visible: gridV } = useReveal<HTMLDivElement>({ threshold: 0.05 });
  const { ref: deskGridRef, visible: deskGridV } = useReveal<HTMLDivElement>({ threshold: 0.05 });

  const [activeId, setActiveId] = useState<number | null>(null);
  const active = ARTICLES.find(a => a.id === activeId) ?? null;

  // Mobile carousel index (single-card view, < sm breakpoint)
  const [slide, setSlide] = useState(0);
  const prevSlide = () => setSlide(i => (i - 1 + ARTICLES.length) % ARTICLES.length);
  const nextSlide = () => setSlide(i => (i + 1) % ARTICLES.length);
  const current = ARTICLES[slide];

  // Lock body scroll while the article modal is open
  useEffect(() => {
    if (active) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [active]);

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

        {/* Mobile carousel — single card, < sm */}
        <div
          ref={gridRef}
          className={`reveal ${gridV ? 'visible' : ''} sm:hidden`}
        >
          <button
            key={current.id}
            onClick={() => setActiveId(current.id)}
            className="group text-left w-full border border-divider bg-surface-2 overflow-hidden transition-all duration-300 hover:border-gold-dim flex flex-col"
          >
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden bg-surface-3">
              <Image
                src={current.image}
                alt={current.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 border border-gold-faint text-gold font-sans text-[0.65rem] tracking-[0.15em] uppercase">
                {current.date}
              </span>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col">
              <h3 className="font-serif font-light text-text-primary leading-snug text-base mb-2 group-hover:text-gold transition-colors duration-300">
                {current.title}
              </h3>

              <div className="gold-rule w-8 mb-3" />

              <p className="font-sans text-sm text-text-secondary font-light leading-relaxed mb-4 line-clamp-3">
                {current.excerpt}
              </p>

              <div className="pt-3 border-t border-divider flex items-center justify-between gap-3">
                <p className="font-sans text-[0.7rem] text-text-muted font-light leading-snug">
                  {current.author}
                  {current.role && <span className="block text-gold opacity-50 text-[0.65rem] mt-0.5">{current.role}</span>}
                </p>
                <span className="inline-flex items-center justify-center w-7 h-7 border border-divider text-text-muted group-hover:border-gold group-hover:text-gold transition-colors duration-300 flex-shrink-0">
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </button>

          {/* Controls: prev / dots / next */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevSlide}
              className="w-9 h-9 border border-divider hover:border-gold flex items-center justify-center text-text-muted hover:text-gold transition-colors flex-shrink-0"
              aria-label="Previous article"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2">
              {ARTICLES.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setSlide(i)}
                  aria-label={`Go to article ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === slide ? 'w-6 bg-gold' : 'w-1.5 bg-divider'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-9 h-9 border border-divider hover:border-gold flex items-center justify-center text-text-muted hover:text-gold transition-colors flex-shrink-0"
              aria-label="Next article"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <p className="text-center font-sans text-xs text-text-muted mt-4">
            {slide + 1} / {ARTICLES.length}
          </p>
        </div>

        {/* Article grid — sm and up */}
        <div
          ref={deskGridRef}
          className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {ARTICLES.map((a, i) => (
            <button
              key={a.id}
              onClick={() => setActiveId(a.id)}
              className={`reveal ${deskGridV ? 'visible' : ''} group text-left border border-divider bg-surface-2 overflow-hidden transition-all duration-300 hover:border-gold-dim hover:shadow-card-hover flex flex-col`}
              style={{ transitionDelay: deskGridV ? `${i * 80}ms` : '0ms' }}
            >
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden bg-surface-3">
                <Image
                  src={a.image}
                  alt={a.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3 text-gold opacity-70">
                  <Calendar size={11} />
                  <span className="font-sans text-[0.65rem] tracking-[0.18em] uppercase">
                    {a.date}
                  </span>
                </div>

                <h3 className="font-serif font-light text-text-primary leading-snug text-lg mb-3 group-hover:text-gold transition-colors duration-300">
                  {a.title}
                </h3>

                <div className="gold-rule w-0 group-hover:w-12 opacity-0 group-hover:opacity-70 transition-all duration-500 mb-3" />

                <p className="font-sans text-sm text-text-secondary font-light leading-relaxed mb-5 line-clamp-3">
                  {a.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-divider flex items-center justify-between">
                  <p className="font-sans text-[0.7rem] text-text-muted font-light leading-snug">
                    {a.author}
                    {a.role && <span className="block text-gold opacity-50 text-[0.65rem] mt-0.5">{a.role}</span>}
                  </p>
                  <span className="inline-flex items-center justify-center w-8 h-8 border border-divider text-text-muted group-hover:border-gold group-hover:text-gold transition-colors duration-300 flex-shrink-0">
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>

      {/* Full Article Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-sm"
          onClick={() => setActiveId(null)}
        >
          <div
            className="relative bg-surface border border-divider max-w-2xl w-full max-h-[88vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-black/60 border border-divider text-text-muted hover:text-gold hover:border-gold transition-colors"
              onClick={() => setActiveId(null)}
              aria-label="Close article"
            >
              <X size={16} />
            </button>

            {/* Cover image */}
            <div className="relative h-56 md:h-72 w-full overflow-hidden bg-surface-3 flex-shrink-0">
              <Image
                src={active.image}
                alt={active.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-black/20 to-black/40" />
            </div>

            <div className="p-8 md:p-12">
              <div className="flex items-center gap-2 mb-5 text-gold opacity-80">
                <Calendar size={12} />
                <span className="font-sans text-[0.7rem] tracking-[0.2em] uppercase">
                  {active.date}
                </span>
              </div>

              <h2 className="font-serif text-2xl md:text-3xl font-light text-text-primary leading-snug mb-6">
                {active.title}
              </h2>

              <div className="gold-rule w-16 mb-6" />

              <div className="space-y-4 mb-8">
                {active.body.map((para, idx) => (
                  <p
                    key={idx}
                    className="font-sans text-sm text-text-secondary font-light leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>

              <div className="pt-6 border-t border-divider">
                <p className="font-sans text-sm text-text-primary font-light">
                  {active.author}
                </p>
                {active.role && (
                  <p className="font-sans text-xs text-gold opacity-70 mt-0.5">
                    {active.role}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}