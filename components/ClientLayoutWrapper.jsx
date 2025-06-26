// components/ClientLayoutWrapper.jsx
'use client'; // 이 파일은 클라이언트 컴포넌트입니다.

import React from 'react';
import { usePathname } from 'next/navigation';
import FixedMenu from "@/components/FixedMenu";
import Footer from "@/components/Footer";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();

  // /survey 경로일 경우 헤더와 푸터를 숨깁니다.
  const hideHeaderAndFooter = pathname === '/survey' || pathname.startsWith('/survey2'); 

  return (
    <>
      {!hideHeaderAndFooter && <FixedMenu starBalloonCount={123} />}
      <main className="mainContent" style={hideHeaderAndFooter ? { paddingTop: 0 } : {}}>
        {children}
      </main>
      {!hideHeaderAndFooter && <Footer />}
    </>
  );
}