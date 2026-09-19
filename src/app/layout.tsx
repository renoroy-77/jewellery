import type { Metadata, Viewport } from 'next';
import './globals.css';
import { constructMetadata } from '@/lib/seo';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/assets/hero_slide_1_mobile.webp" type="image/webp" media="(max-width: 768px)" />
        <link rel="preload" as="image" href="/assets/hero_slide_1.webp" type="image/webp" media="(min-width: 769px)" />
        <link rel="preload" as="image" href="/assets/hero_slide_2.webp" type="image/webp" />
        <link rel="preload" as="image" href="/assets/hero_slide_3.webp" type="image/webp" />
        <link rel="preload" as="image" href="/assets/brand_logo_gold.png" type="image/png" />
      </head>
      <body>
        <LanguageProvider>
          <CartProvider>
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
