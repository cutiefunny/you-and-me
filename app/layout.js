// layout.js (또는 app/layout.js)
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // 전역 스타일 파일
import FixedMenu from "@/components/FixedMenu"; // 가정: 이미 FixedMenu가 있음
import Footer from "@/components/Footer";     // Footer 임포트

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
  //const menuHeight = '60px'; // FixedMenu의 높이

  return (
    <html lang="ko">
      {/* body에 직접 flex 스타일을 적용하거나, 아래처럼 wrapper div를 사용할 수 있습니다. */}
      {/* Next.js App Router에서는 body에 직접 클래스를 추가하는 것이 더 일반적입니다. */}
      <body className={`${geistSans.variable} ${geistMono.variable} siteLayout`}> {/* 새 클래스 추가 */}
        <div className="siteContentWrapper"> {/* 헤더와 메인 컨텐츠를 묶는 wrapper */}
          <FixedMenu starBalloonCount={123} /> {/* 예시 prop, 실제 값으로 대체 */}
          <main className="mainContent">
            {children}
          </main>
        </div>
        <Footer /> {/* Footer를 siteContentWrapper 바깥, siteLayout의 자식으로 배치 */}
      </body>
    </html>
  );
}