'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, getAdditionalUserInfo } from 'firebase/auth';
import { app } from '../lib/firebase/clientApp'; 
import styles from './FixedMenu.module.css';

export default function FixedMenu({ starBalloonCount }) {
    const auth = getAuth(app);
    const router = useRouter();
    const [user, setUser] = useState(null);
    // 1. 클라이언트 렌더링 여부를 확인하는 상태 추가
    const [isClient, setIsClient] = useState(false);

    // 컴포넌트가 클라이언트에 마운트되면 isClient를 true로 설정
    useEffect(() => {
        setIsClient(true);
    }, []);

    // 사용자의 로그인 상태를 실시간으로 감지
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, [auth]);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const additionalUserInfo = getAdditionalUserInfo(result);

            if (additionalUserInfo?.isNewUser) {
                router.push('/signup');
            } else {
                console.log('기존 사용자가 로그인했습니다:', result.user);
            }
        } catch (error) {
            console.error("인증 오류:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                alert('로그인 팝업이 닫혔습니다. 다시 시도해주세요.');
            } else {
                alert('로그인 중 오류가 발생했습니다.');
            }
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('사용자가 로그아웃했습니다.');
            router.push('/');
        } catch (error) {
            console.error('로그아웃 오류:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    };

    const handleSettingsClick = () => {
        alert('개인설정 아이콘 클릭됨!');
    };

    return (
        <header className={styles.fixedMenuContainer}>
            <div className={styles.menuContentWrapper}>
                <Link href="/" className={styles.titleLink}>
                    <h1 className={styles.titleText}>너랑나 You&Me</h1>
                </Link>

                <div className={styles.rightSection}>
                    {/* 2. isClient가 true일 때만 로그인/로그아웃 UI를 렌더링 */}
                    {isClient && (
                        user ? (
                            // 로그인 상태
                            <>
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
                                 <button onClick={handleLogout} className={styles.loginButton}>
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            // 로그아웃 상태
                            <button onClick={handleGoogleLogin} className={styles.loginButton}>
                                로그인
                            </button>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}