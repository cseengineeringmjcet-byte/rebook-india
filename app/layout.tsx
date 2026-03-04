import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import SearchOverlay from '@/components/SearchOverlay';
import MobileMenu from '@/components/MobileMenu';
import WaFloat from '@/components/WaFloat';
import { Toaster } from 'sonner';
import AuthInit from '@/components/AuthInit';
import FirebaseDataLoader from '@/components/FirebaseDataLoader';
import { getAdminBooks, getAdminVendors } from '@/lib/firebase/admin';

export const metadata: Metadata = {
  title: 'Rebook India | Hyderabad\'s Trusted Second-Hand Book Marketplace',
  description: 'Connect Hyderabad students with trusted second-hand book vendors. 50% off MRP on every book.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const books = await getAdminBooks();
  const vendors = await getAdminVendors();

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <AuthInit />
        <FirebaseDataLoader books={books} vendors={vendors}>
          <Navbar />
          <SearchOverlay />
          <CartSidebar />
          <MobileMenu />

          <main className="flex-1 mt-16">{children}</main>

          <Footer />
          <WaFloat />
          <Toaster position="bottom-right" className="md:bottom-right bottom-center md:mb-0 mb-4 px-4" />
        </FirebaseDataLoader>
      </body>
    </html>
  );
}
