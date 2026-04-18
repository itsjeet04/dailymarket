import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stock Dashboard",
  description: "Real-time stock analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-950 text-white min-h-screen`}>
        {/* navbar */}
        <nav className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-green-400">
            StockDash
          </Link>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/compare" className="hover:text-white transition">Compare</Link>
            <Link href="/watchlist" className="hover:text-white transition">Watchlist</Link>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-8 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}