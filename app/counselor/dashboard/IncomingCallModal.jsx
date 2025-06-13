// /app/counselor/dashboard/IncomingCallModal.jsx (수정)
'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './IncomingCallModal.module.css';

export default function IncomingCallModal({ callData, onAccept, onDecline }) {
  const { callerName = "알 수 없는 사용자" } = callData || {};
  
  // [추가] 오디오 객체와 재생 상태를 관리
  const audioRef = useRef(null);
  const [isRingtonePlaying, setIsRingtonePlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // [수정] 오디오 객체 초기화
  useEffect(() => {
    // public 폴더에 ringtone.mp3 파일이 있다고 가정
    audioRef.current = new Audio('/audio/ringtone.mp3');
    audioRef.current.loop = true;
  }, []);
  
  // 사용자가 모달을 클릭(탭)하면 벨소리 재생을 시도
  const handleInteractionAndPlay = () => {
    if (!userInteracted) {
      setUserInteracted(true); // 한 번만 실행되도록
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(_ => {
          // 자동재생 성공
          setIsRingtonePlaying(true);
        }).catch(error => {
          // 자동재생 실패 (예: 브라우저 설정으로 막힌 경우)
          console.error("오디오 재생 실패:", error);
          // 이 경우엔 소리 없이 모달만 표시됨
        });
      }
    }
  };

  // 컴포넌트가 사라질 때 오디오 정리
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!callData) {
    return null;
  }
  
  // [수정] 수락/거절 시 벨소리 중지
  const handleAccept = () => {
    if (audioRef.current) audioRef.current.pause();
    onAccept(callData);
  };

  const handleDecline = () => {
    if (audioRef.current) audioRef.current.pause();
    onDecline(callData);
  };

  return (
    // [수정] 오버레이 클릭 시 상호작용 및 재생 핸들러 호출
    <div className={styles.overlay} onClick={handleInteractionAndPlay}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.callerInfo}>
          {/* [수정] 상호작용 전/후 다른 텍스트 표시 */}
          <p className={styles.callingText}>
            {userInteracted ? '전화가 왔습니다' : '전화 수신 중 (화면을 탭하세요)'}
          </p>
          <h2 className={styles.callerName}>{callerName}</h2>
        </div>
        <div className={styles.buttonGroup}>
          <button 
            className={`${styles.button} ${styles.declineButton}`} 
            onClick={handleDecline}
          >
            거절
          </button>
          <button 
            className={`${styles.button} ${styles.acceptButton}`} 
            onClick={handleAccept}
          >
            수락
          </button>
        </div>
      </div>
    </div>
  );
}