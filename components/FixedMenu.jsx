// components/FixedMenu.jsx
'use client'; // useRouter 등을 사용할 경우 또는 내부 상태 관리가 필요할 경우

import React from 'react';
import Link from 'next/link';
import styles from './FixedMenu.module.css';
// import Image from 'next/image'; // 아이콘 이미지 사용 시

// starBalloonCount prop 추가
export default function FixedMenu({ starBalloonCount }) {
  const handleSettingsClick = () => {
    alert('개인설정 아이콘 클릭됨!');
  };

  return (
    <header className={styles.fixedMenuContainer}>
      <div className={styles.menuContentWrapper}>
        {/* 좌측: 타이틀 (절대 위치로 중앙 정렬됨) */}
        <Link href="/" className={styles.titleLink}>
          <h1 className={styles.titleText}>너랑나 You&Me</h1>
        </Link>

        {/* 우측: 별풍선 개수 + 개인설정 아이콘 */}
        <div className={styles.rightSection}>
          <span className={styles.starBalloonCountText}>
            별풍선 {starBalloonCount !== undefined && starBalloonCount !== null ? starBalloonCount : 0}개
          </span>
          <div className={styles.settingsIconWrapper}>
            <button
              className={styles.settingsButton}
              onClick={handleSettingsClick}
              aria-label="개인설정"
            >
              <span role="img" aria-hidden="true" style={{ fontSize: '1.5rem' }}>⚙️</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}