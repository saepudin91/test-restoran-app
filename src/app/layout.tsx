// src/app/layout.tsx (Final Update)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Script from "next/script"; // Import Next/Script

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Restoran App MVP",
  description: "Aplikasi restoran Next.js dengan AI Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Tambahkan Midtrans Snap Script di <head> */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js" // URL Sandbox
          data-client-key={process.env.MIDTRANS_CLIENT_KEY} // Ambil dari .env.local
          strategy="beforeInteractive" // Muat sebelum interaksi
        />
      </head>
      <body className={inter.className}>
        <CartProvider>
          {/* Header/Navbar bisa diletakkan di sini */}
          <main>
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}