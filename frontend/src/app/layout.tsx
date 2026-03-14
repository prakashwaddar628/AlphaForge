import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AlphaForge | AI Stock Intelligence",
  description: "Production-grade AI-powered Stock Market Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">α</div>
                <h1 className="text-xl font-bold tracking-tight">AlphaForge</h1>
              </div>
              <nav className="flex gap-6 text-sm font-medium text-slate-400">
                <a href="/" className="hover:text-blue-400 transition-colors">Dashboard</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Portfolio</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Sentiment</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Economics</a>
              </nav>
              <div className="flex items-center gap-4">
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 font-medium">Market Open</span>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"></div>
              </div>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-900 py-6 text-center text-slate-500 text-xs">
            © 2026 AlphaForge Intelligence Systems. For research purposes only.
          </footer>
        </div>
      </body>
    </html>
  );
}
