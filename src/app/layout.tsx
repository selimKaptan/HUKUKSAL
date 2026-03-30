import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "JusticeGuard - Yapay Zeka Destekli Hukuki Analiz",
    template: "%s | JusticeGuard",
  },
  description:
    "Davanızın kazanma ihtimalini öğrenin. Emsal kararlarla karşılaştırın, bilinçli karar verin. Avukata gitmeden önce haklarınızı bilin.",
  keywords: ["hukuki analiz", "emsal karar", "dava analizi", "yapay zeka", "hukuk", "avukat", "dava kazanma", "türk hukuku"],
  authors: [{ name: "JusticeGuard" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JusticeGuard",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "JusticeGuard - Haklı mısın? Davanı Yapay Zekaya Sor.",
    description: "Avukata gitmeden önce davanızın kazanma ihtimalini öğrenin. Emsal kararlarla karşılaştırın.",
    type: "website",
    locale: "tr_TR",
    siteName: "JusticeGuard",
  },
  twitter: {
    card: "summary_large_image",
    title: "JusticeGuard - Yapay Zeka Destekli Hukuki Analiz",
    description: "Davanızın kazanma ihtimalini öğrenin. Emsal kararlarla karşılaştırın.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
