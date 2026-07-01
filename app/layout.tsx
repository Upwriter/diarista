import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { SITE } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChatProvider } from "@/components/ChatProvider";
import ChatWidgetDynamic from "@/components/ChatWidgetDynamic";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.nome} — Diaristas em São Paulo, no seu bairro`,
    template: `%s | ${SITE.nome}`,
  },
  description: SITE.descricao,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE.nome,
    url: SITE.url,
    title: `${SITE.nome} — Diaristas em São Paulo, no seu bairro`,
    description: SITE.descricao,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.nome,
    description: SITE.descricao,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">
        <ChatProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <ChatWidgetDynamic />
        </ChatProvider>
      </body>
    </html>
  );
}
