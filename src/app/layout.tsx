import type { Metadata, Viewport } from 'next';
import { Inter, Cinzel, Cormorant_Garamond, Playfair_Display } from 'next/font/google';
import './globals.css';
import { constructMetadata } from '@/lib/seo';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { ConfirmProvider } from '@/context/ConfirmContext';
import GlobalToaster from '@/components/GlobalToaster';
import QueryProvider from '@/providers/QueryProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-playfair',
});

export const viewport: Viewport = {
  themeColor: '#05160f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cinzel.variable} ${cormorant.variable} ${playfair.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Preload critical LCP Hero images for both Mobile and Desktop */}
        <link
          rel="preload"
          as="image"
          href="/assets/hero_slide_1_mobile.webp"
          media="(max-width: 768px)"
          fetchPriority="high"
          type="image/webp"
        />
        <link
          rel="preload"
          as="image"
          href="/assets/hero_slide_1.webp"
          media="(min-width: 769px)"
          fetchPriority="high"
          type="image/webp"
        />
      </head>
      <body>
        <QueryProvider>
          <LanguageProvider>
            <CartProvider>
              <ConfirmProvider>
                <Header />
                <main id="main-content">{children}</main>
                <Footer />
                <CartDrawer />
                <GlobalToaster />
              </ConfirmProvider>
            </CartProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

