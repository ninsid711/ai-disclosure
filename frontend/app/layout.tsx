import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AI Disclosure System",
  description: "Blockchain-powered AI disclosure with IPFS and MetaMask.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full bg-slate-950 text-slate-100`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
