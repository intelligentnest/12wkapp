import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

// Fonts are self-hosted: no requests to third-party font services at build or run time.
const fraunces = localFont({
  src: "../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2",
  variable: "--font-fraunces",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "My 12-Week Transformation", template: "%s · My 12-Week Transformation" },
  description: "A private, calm space for five pillars of daily practice.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#f7f4ee", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-CA" className={`${GeistSans.variable} ${fraunces.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
