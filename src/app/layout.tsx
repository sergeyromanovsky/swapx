import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppKitProvider } from "@/providers/AppkitProvider";
import { AppStateProvider } from "@/providers/AppStateProvider";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SwapX | Decentralized Token Swap",
  description: "Swap tokens instantly with the best rates across DEXs",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <AppKitProvider>
          <AppStateProvider>
            <Header />
            {children}
            <Footer />
          </AppStateProvider>
        </AppKitProvider>
      </body>
    </html>
  );
}
