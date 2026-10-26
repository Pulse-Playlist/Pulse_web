import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PULSE — 러닝 케이던스 플레이리스트 빌더',
  description: '내 발걸음 템포(BPM)에 딱 맞는 30곡 러닝 플레이리스트',
  icons: {
    icon: '/logos/logo-green.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-[#F0F2F5] dark:bg-[#070709] text-zinc-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
