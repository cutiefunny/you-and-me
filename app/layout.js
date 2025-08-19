// layout.js (또는 app/layout.js)

import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Novaire</title>
        <link href="https://fonts.googleapis.com/css2?family=Pretendard&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}

// metadata 정의는 그대로 서버 컴포넌트 컨텍스트에 유지
export const metadata = {
  applicationName: "Novaire",
  title: {
    default: "Novaire",
    template: "Novaire",
  },
  description: "AI 기반 크리에이터 네트워크, Novaire",
  keywords: ["Novaire", "You&Me", "대화", "커뮤니케이션", "전화", "메시지", "소통"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Novaire",
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Novaire",
    title: {
      default: "Novaire",
      template: "Novaire",
    },
    description: "AI 기반 크리에이터 네트워크, Novaire",
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFFFF",
};