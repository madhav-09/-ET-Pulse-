import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ET Pulse — AI-Native News Intelligence",
  description:
    "Personalized business news intelligence. Deep briefings, story arc tracking, and multi-language support powered by AI.",
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
    >
      {children}
    </Link>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0b0a10]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <span className="text-xl font-bold tracking-tight">
                <span className="gradient-text">ET</span>
                <span className="text-white"> Pulse</span>
              </span>
              <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-400/20">
                AI
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/feed">My Feed</NavLink>
              <NavLink href="/briefing">Briefing</NavLink>
              <NavLink href="/story">Story Arc</NavLink>
            </div>

            <SearchBar />
          </div>
        </nav>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/[0.06] py-6 text-center">
          <p className="text-xs text-white/30">ET Pulse · AI-Native News Intelligence Engine</p>
        </footer>
      </body>
    </html>
  );
}
