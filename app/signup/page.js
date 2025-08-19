import React, { Suspense } from 'react';
import SignupClientPage from './SignupClientPage';
import styles from './SignupPage.module.css';

// Suspense의 fallback으로 보여줄 로딩 컴포넌트
function LoadingFallback() {
    return <div className={styles.loading}>페이지를 불러오는 중...</div>;
}

export default function SignupPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SignupClientPage />
        </Suspense>
    );
}