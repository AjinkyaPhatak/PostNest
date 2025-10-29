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
        <div className="min-h-screen bg-gray-100">
          <Navbar />

          <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <aside className="hidden lg:block lg:col-span-2">
                <Sidebar />
              </aside>

              <section className="lg:col-span-7 md:col-span-12">
                {children}
              </section>

              <aside className="hidden lg:block lg:col-span-3">
                <RightSidebar />
              </aside>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
