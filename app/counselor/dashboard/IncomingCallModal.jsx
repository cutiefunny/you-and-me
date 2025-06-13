'use client';

import React, { useEffect } from 'react';
import styles from './IncomingCallModal.module.css';

// 전화 수신 알림음 (선택 사항)
const useIncomingCallSound = (play) => {
  useEffect(() => {
    if (!play) return;
    // public 폴더에 ringtone.mp3 파일이 있다고 가정합니다.
    const audio = new Audio('/audio/ringtone.mp3');
    audio.loop = true;
    audio.play().catch(e => console.error("오디오 재생 실패:", e));

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [play]);
};

export default function IncomingCallModal({ callData, onAccept, onDecline }) {
  const { callerName = "알 수 없는 사용자" } = callData || {};
  
  // 모달이 열릴 때 알림음 재생
  useIncomingCallSound(!!callData);

  if (!callData) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.callerInfo}>
          <p className={styles.callingText}>전화가 왔습니다</p>
          <h2 className={styles.callerName}>{callerName}</h2>
        </div>
        <div className={styles.buttonGroup}>
          <button 
            className={`${styles.button} ${styles.declineButton}`} 
            onClick={() => onDecline(callData)}
          >
            거절
          </button>
          <button 
            className={`${styles.button} ${styles.acceptButton}`} 
            onClick={() => onAccept(callData)}
          >
            수락
          </button>
        </div>
      </div>
    </div>
  );
}