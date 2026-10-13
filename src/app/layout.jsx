import { Figtree, Geist_Mono } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: "variable",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Glyph — Fast, Snappy Code Screenshots",
  description: "Create beautiful, highly customizable code screenshots in seconds. Auto language detection, crisp PNG export, themes, and instant presets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
