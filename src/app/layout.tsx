import type { Metadata } from "next";
import ClientProviders from '@/components/providers/ClientProviders';
// import { primaryFont } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ksheera - The Future of Dairy, Today.",
  description: "The Future of Dairy, Today. Manage your milk delivery business with ease - track clients, deliveries, billing, and buffalo care",
  manifest: "/manifest.json",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-rubik font-sans antialiased bg-cream"
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
