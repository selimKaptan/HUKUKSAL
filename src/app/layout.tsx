import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "JusticeGuard - Yapay Zeka Destekli Hukuki Analiz",
    template: "%s | JusticeGuard",
  },
  description:
    "Davanızın kazanma ihtimalini öğrenin. Emsal kararlarla karşılaştırın, bilinçli karar verin. Avukata gitmeden önce haklarınızı bilin.",
  keywords: ["hukuki analiz", "emsal karar", "dava analizi", "yapay zeka", "hukuk", "avukat", "dava kazanma", "türk hukuku"],
  authors: [{ name: "JusticeGuard" }],
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
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
