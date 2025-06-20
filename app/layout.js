// layout.js (또는 app/layout.js)

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // 전역 스타일 파일
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper"; // 새로 만든 클라이언트 컴포넌트 임포트

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// metadata 정의는 그대로 서버 컴포넌트 컨텍스트에 유지
export const metadata = {
  applicationName: "너랑 나",
  title: {
    default: "너랑 나",
    template: "너랑 나",
  },
  description: "대화가 필요한 순간, 너랑 나",
  keywords: ["너랑 나", "You&Me", "대화", "커뮤니케이션", "전화", "메시지", "소통"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "너랑 나",
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "너랑 나",
    title: {
      default: "너랑 나",
      template: "너랑 나",
    },
    description: "대화가 필요한 순간, 너랑 나",
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} siteLayout`}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}