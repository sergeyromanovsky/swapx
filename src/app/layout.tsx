import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AppKitProvider } from "@/providers/AppkitProvider";
import { Header, Footer } from "@/components/layout";

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
          <Header />
          {children}
          <Footer />
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              classNames: {
                success: "!bg-emerald-950 !border-emerald-800 !text-emerald-100",
                error: "!bg-red-950 !border-red-800 !text-red-100",
              },
            }}
          />
        </AppKitProvider>
      </body>
    </html>
  );
}
