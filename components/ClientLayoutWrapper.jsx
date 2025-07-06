// components/ClientLayoutWrapper.jsx
'use client'; // 이 파일은 클라이언트 컴포넌트입니다.

import React, { Suspense } from 'react'; // Suspense 임포트
import { usePathname } from 'next/navigation';
import FixedMenu from "@/components/FixedMenu";
import Footer from "@/components/Footer";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();

  // /survey 경로일 경우 헤더와 푸터를 숨깁니다.
  const hideHeaderAndFooter = pathname === '/survey' || pathname.startsWith('/survey2') || pathname.startsWith('/admin');
  // /signup 경로일 경우 헤더와 푸터를 숨기지 않지만, Suspense로 감쌉니다.
  const isSignupPage = pathname === '/signup';

  return (
    <>
      {!hideHeaderAndFooter && <FixedMenu starBalloonCount={123} />}
      <main className="mainContent" style={hideHeaderAndFooter ? { paddingTop: 0 } : {}}>
        {/* /signup 페이지일 경우 children을 Suspense로 감싸서 useSearchParams 오류를 해결 */}
        {isSignupPage ? (
          <Suspense fallback={<p>페이지를 불러오는 중입니다...</p>}>
            {children}
          </Suspense>
        ) : (
          // 다른 페이지들은 그대로 렌더링
          children
        )}
      </main>
      {!hideHeaderAndFooter && <Footer />}
    </>
  );
}