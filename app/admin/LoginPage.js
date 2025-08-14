'use client';

import React, { useState } from 'react';
import styles from './AdminPage.module.css'; // 기존 스타일 재사용

export default function LoginPage({ onLoginSuccess }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // 하드코딩된 아이디와 비밀번호 확인
        if (id === 'admin' && password === '123456') {
            setError('');
            onLoginSuccess(); // 부모 컴포넌트로 로그인 성공 알림
        } else {
            setError('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginBox}>
                <h1 className={styles.title}>관리자 로그인</h1>
                <form onSubmit={handleLogin} className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="id">아이디</label>
                        <input
                            type="text"
                            id="id"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    <button type="submit" className={styles.loginButton}>로그인</button>
                </form>
            </div>
        </div>
    );
}