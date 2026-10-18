import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PUB CertChain — University Certificate Verification",
  description: "A clean, trustworthy certificate-verification experience for students, university staff, and the public.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansBengali.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-[#0B2545] font-sans">
        {children}
      </body>
    </html>
  );
}
