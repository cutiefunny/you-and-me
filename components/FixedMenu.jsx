// components/FixedMenu.jsx
'use client';

import React from 'react';
import Link from 'next/link'; // '너랑나' 타이틀을 홈으로 링크하기 위해 사용
import styles from './FixedMenu.module.css';
// import Image from 'next/image'; // 만약 아이콘을 이미지로 사용한다면

export default function FixedMenu() {
  const handleSettingsClick = () => {
    // TODO: 개인설정 아이콘 클릭 시 동작 구현 (예: 드롭다운 메뉴, 설정 페이지 이동 등)
    alert('개인설정 아이콘 클릭됨!');
  };

  return (
    <header className={styles.fixedMenuContainer}>
      <div className={styles.menuContentWrapper}>
        {/* 좌측: 타이틀 */}
        <Link href="/" legacyBehavior>
          <a className={styles.titleLink}>
            <h1 className={styles.titleText}>너랑나</h1>
            {/* 로고 이미지를 타이틀 옆이나 대신 사용하려면 여기에 추가 */}
            {/* <Image src="/images/logo-simple.png" alt="너랑나 로고" width={30} height={30} /> */}
          </a>
        </Link>

        {/* 우측: 개인설정 아이콘 */}
        <div className={styles.settingsIconWrapper}>
          <button 
            className={styles.settingsButton} 
            onClick={handleSettingsClick}
            aria-label="개인설정" // 접근성을 위한 레이블
          >
            {/* 임시 아이콘 (⚙️) - 실제 아이콘 이미지나 SVG 아이콘으로 교체하세요 */}
            <span role="img" aria-hidden="true" style={{ fontSize: '1.5rem' }}>⚙️</span>
            {/* 예시: 이미지 아이콘 사용 시
            <Image src="/icons/settings-icon.svg" alt="개인설정" width={24} height={24} />
            */}
          </button>
        </div>
      </div>
    </header>
  );
}