import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import AppLayout from "@/components/shared/AppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invoxa – Smart Billing & Invoicing Platform",
  description:
    "Invoxa helps you manage invoices, clients, and payments with ease. Secure, fast, and beautifully designed for modern teams.",
  keywords: [
    "invoice generator",
    "billing software",
    "invoicing app",
    "Razorpay billing",
    "Stripe integration",
    "client management",
    "SaaS invoicing",
    "freelancer billing",
    "small business billing",
    "Invoxa"
  ],
  authors: [{ name: "Sasanka Sekhar Kundu", url: "https://sasankawrites.com" }],
  creator: "SasankaWrites",
  themeColor: "#7E5CFF",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Invoxa – Smart Billing for Modern Teams",
    description:
      "Send invoices, collect payments, and manage clients — all in one place with Invoxa.",
    url: "https://invoxa.vercel.app",
    siteName: "Invoxa",
    images: [
      {
        url: "https://invoxa.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Invoxa UI Screenshot",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" />
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
