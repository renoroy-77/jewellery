import type { Metadata, Viewport } from 'next';
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
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
