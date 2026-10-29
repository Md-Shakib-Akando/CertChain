import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Source_Serif_4, Noto_Sans_Bengali } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bangla",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CertChain — Pundra University Credential Registry",
    template: "%s · CertChain",
  },
  description:
    "Issue, hold and verify Pundra University academic certificates. Every credential is fingerprinted with SHA-256 and anchored on Ethereum so anyone can confirm it in seconds.",
};

export const viewport: Viewport = {
  themeColor: "#0e1622",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${sourceSerif.variable} ${notoSansBengali.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
