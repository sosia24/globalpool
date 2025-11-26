import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/services/walletContext";
import {LanguageManager} from "@/components/LanguageManager";
import { Analytics } from "@vercel/analytics/next"
import { translations } from "@/translations";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Global Pool",
  description: "New innovative multi-pool system",
  icons: {
    icon: "/Global-Pool.svg", // Caminho relativo à pasta /public
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageManager translations={translations}>
        <WalletProvider>
          <div className="w-full min-h-screen bg-black relative overflow-hidden">
            <div className="relative flex items-center justify-center min-h-screen bg-overlay z-0 py-[20px] w-full mx-auto">
              {children}
            </div>
          </div>
        </WalletProvider>
        </LanguageManager>
        <Analytics />
      </body>
    </html>
  );
}
