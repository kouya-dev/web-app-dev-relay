import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapJS from "./components/BootstrapJS";

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
      <body>
        {children}
        <BootstrapJS />
      </body>
    </html>
  );
}
