import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chess-Bot | Adaptive Chess AI & Mistake Coach",
  description: "Play against an adaptive, human-like chess bot and learn from your blunders with post-game coaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
