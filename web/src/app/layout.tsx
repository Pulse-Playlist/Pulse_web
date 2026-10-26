import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PULSE — BPM Database Inspector & Running Playlist Builder',
  description: 'Precision BPM & Running Cadence database with high-precision Web Audio lookahead metronome and playlist curator.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
