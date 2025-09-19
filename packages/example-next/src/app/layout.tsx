import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portkey Provider Example - Next.js',
  description: 'Portkey Provider integration example with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
