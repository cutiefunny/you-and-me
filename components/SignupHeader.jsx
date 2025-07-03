// components/SignupHeader.jsx
'use client';

import React from 'react';
import Image from 'next/image'; // next/image 컴포넌트 사용 (이미지 최적화)
import styles from './SignupHeader.module.css';

export default function SignupHeader() {
  return (
    <div className={styles.headerContainer}>
      <img
        src="/images/signup.jpg" // public 폴더 기준 경로
        alt="대화가 필요할 때"
        className={styles.headerImage}
      />
      <h1 className={styles.headerTitle}>대화가 필요할 때, 너랑 나</h1>
    </div>
  );
}