// layout.js (또는 app/layout.js)
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FixedMenu from "@/components/FixedMenu"; // FixedMenu 임포트 (경로 확인)

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "너랑 나",
  description: "너나스튜디오",
};

export default function RootLayout({ children }) {
  const menuHeight = '60px'; // FixedMenu의 높이와 일치해야 합니다.

  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <FixedMenu />
        <main style={{ paddingTop: menuHeight }}>
          {children}
        </main>
      </body>
    </html>
  );
}