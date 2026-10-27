import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatBotWidget from "@/components/ChatBotWidget";
import CookieBanner from "@/components/CookieBanner";
import { GoogleAnalytics } from '@next/third-parties/google';
import AnalyticsConsent from '@/components/AnalyticsConsent';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, STRUCTURED_DATA, TITLE_TEMPLATE, serializeJsonLd } from '@/lib/seo';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "YU'AM | Plataforma IoT & Biotecnología para Fotobiorreactores", template: TITLE_TEMPLATE },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Equipo MILAB / YU'AM", url: SITE_URL }],
  verification: {
    // Añadir solo el valor content entregado por cada panel; dejar vacío hasta disponer del código real.
    google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    other: process.env.BING_SITE_VERIFICATION?.trim() ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION.trim() } : undefined,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10001] focus:rounded-xl focus:bg-white focus:px-5 focus:py-3 focus:font-semibold focus:text-emerald-800 focus:shadow-lg">Saltar al contenido principal</a>
        <script id="yuam-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(STRUCTURED_DATA) }} />
        {children}<ChatBotWidget /><CookieBanner />
        {process.env.NEXT_PUBLIC_GA_ID && <AnalyticsConsent gaId={process.env.NEXT_PUBLIC_GA_ID}><GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} /></AnalyticsConsent>}
      </body>
    </html>
  );
}
