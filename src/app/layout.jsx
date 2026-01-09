import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Glyph — Preview",
  description: "Glyph homepage mock",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="app-header">
          <div className="brand">Glyph</div>
          <div className="toolbar">
            <button className="btn ghost">Import Glyph</button>
            <button className="btn ghost">Export Glyph</button>
            <button className="btn primary">Export PNG</button>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
