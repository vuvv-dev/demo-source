import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AppleStore - Cửa hàng Apple chính hãng',
  description: 'Mua sắm sản phẩm Apple chính hãng: iPhone, iPad, Mac, AirPods, Apple Watch',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'inherit' } }} />
        </Providers>
      </body>
    </html>
  );
}