import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
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
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          }}
        />
      </body>
    </html>
  );
}
