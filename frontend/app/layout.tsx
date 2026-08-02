import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pakistan Coastal Hazard Monitoring Portal',
  description: 'Real-time coastal hazard monitoring using Google Earth Engine and GIS',
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
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}