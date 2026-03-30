import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "JusticeGuard - Yapay Zeka Destekli Hukuki Analiz",
  description:
    "Davanızın kazanma ihtimalini öğrenin. Emsal kararlarla karşılaştırın, bilinçli karar verin. Avukata gitmeden önce haklarınızı bilin.",
  keywords: ["hukuki analiz", "emsal karar", "dava analizi", "yapay zeka", "hukuk"],
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
