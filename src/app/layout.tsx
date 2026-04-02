import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  themeColor: "#f5f4ef",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Haklarım - Yapay Zeka Destekli Hukuki Analiz",
    template: "%s | Haklarım",
  },
  description:
    "Davanızın kazanma ihtimalini öğrenin. Emsal kararlarla karşılaştırın, bilinçli karar verin. Avukata gitmeden önce haklarınızı bilin.",
  keywords: ["hukuki analiz", "emsal karar", "dava analizi", "yapay zeka", "hukuk", "avukat", "dava kazanma", "türk hukuku"],
  authors: [{ name: "Haklarım" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Haklarım",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Haklarım - Haklı mısın? Davanı Yapay Zekaya Sor.",
    description: "Avukata gitmeden önce davanızın kazanma ihtimalini öğrenin. Emsal kararlarla karşılaştırın.",
    type: "website",
    locale: "tr_TR",
    siteName: "Haklarım",
  },
  twitter: {
    card: "summary_large_image",
    title: "Haklarım - Yapay Zeka Destekli Hukuki Analiz",
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
