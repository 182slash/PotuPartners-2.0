import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'PotuPartners | Exelence Without Compromise',
    template: '%s | PotuPartners',
  },
  description:
    'PotuPartners is a Top-tier law firm committed to delivering exceptional legal counsel with integrity, discretion, and uncompromising excellence.',
  keywords: [
    'law firm', 'legal services', 'attorneys', 'partners', 'corporate law',
    'litigation', 'legal counsel', 'PotuPartners',
  ],
  authors: [{ name: 'PotuPartners' }],
  creator: 'PotuPartners',
  publisher: 'PotuPartners',
  metadataBase: new URL('https://potupartners.site'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://potupartners.site',
    siteName: 'PotuPartners',
    title: 'PotuPartners | Top-tier Law Firm',
    description:
      'Top-tier legal counsel delivered with integrity, discretion, and uncompromising excellence.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PotuPartners Law Firm',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PotuPartners | Top-tier Law Firm',
    description: 'Top-tier legal counsel delivered with integrity and excellence.',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PotuPartners',
  },
  applicationName: 'PotuPartners',
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className="bg-black text-text-primary font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#141414',
              color: '#D9D9D9',
              border: '1px solid #2A2A2A',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#C6A75E', secondary: '#000000' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#000000' },
            },
          }}
        />
      </body>
    </html>
  );
}
