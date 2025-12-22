import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web App Dev Relay - ビジュアルプログラミングエディタ",
  description: "Advent Calendar 2025 - Web App Dev Relay プロジェクト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
