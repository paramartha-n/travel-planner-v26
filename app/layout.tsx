import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Para Travel AI - Your Smart Travel Planner',
  description: 'AI-powered travel itinerary planner that creates personalized travel experiences',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
        <Toaster />
      </body>
    </html>
  );
}