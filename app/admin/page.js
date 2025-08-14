'use client';

import React, { useState, useEffect } from 'react';
import AdminPage from './AdminPage';
import LoginPage from './LoginPage';
import styles from './AdminPage.module.css'; // 스타일 import

export default function AdminProtectedPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true); // 페이지 로딩 상태 추가

    // 컴포넌트가 마운트될 때 세션 스토리지에서 로그인 상태를 확인
    useEffect(() => {
        const loggedInStatus = sessionStorage.getItem('isAdminLoggedIn');
        if (loggedInStatus === 'true') {
            setIsLoggedIn(true);
        }
        setLoading(false); // 확인 완료 후 로딩 상태 변경
    }, []);

    const handleLoginSuccess = () => {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        setIsLoggedIn(false);
        // 페이지를 새로고침하여 완전히 초기화할 수도 있습니다.
        // window.location.reload(); 
    };

    // 로딩 중일 때 로딩 메시지 표시
    if (loading) {
        return <div className={styles.loadingWrapper}>페이지를 불러오는 중입니다...</div>;
    }

    // 로그인 상태에 따라 적절한 컴포넌트를 렌더링
    return (
        <div>
            {isLoggedIn ? (
                <AdminPage onLogout={handleLogout} />
            ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
}