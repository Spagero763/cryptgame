import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import { PrivyProviderWrapper } from '@/context/PrivyProviderWrapper';

export const metadata: Metadata = {
  title: 'VersaGames',
  description: 'A collection of games with AI opponents and multiplayer modes.',
};

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('dark', fontInter.variable)}>
      <body className="font-body antialiased">
        <PrivyProviderWrapper>
          <div className="relative flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 animate-fade-in-up">{children}</main>
          </div>
          <Toaster />
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}
