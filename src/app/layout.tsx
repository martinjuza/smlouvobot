import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmlouvoBot - Fulldome Contract Generator",
  description: "Contract generator for Fulldome Film Society",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen font-sans">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">SmlouvoBot</span>
                <span className="text-sm text-gray-500">Fulldome Contract Generator</span>
              </a>
              <nav className="flex gap-4 items-center">
                <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
                  Contracts
                </a>
                <a href="/new" className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md">
                  + New Contract
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
