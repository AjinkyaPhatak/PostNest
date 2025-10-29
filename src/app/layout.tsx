import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PostNest",
  description: "A community posting app",
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <Navbar />

          <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <aside className="hidden md:block md:col-span-3">
                <Sidebar />
              </aside>

              <section className="md:col-span-6">{children}</section>

              <aside className="hidden md:block md:col-span-3">
                <RightSidebar />
              </aside>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
