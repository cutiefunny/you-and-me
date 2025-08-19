'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase/clientApp';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import SignupHeader from '@/components/SignupHeader';
import styles from './SignupPage.module.css';
import Image from 'next/image';

export default function SignupClientPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const [userRole, setUserRole] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (role === 'creator' || role === 'user') {
            setUserRole(role);
        } else {
            console.warn("Invalid or missing role, redirecting to home.");
            router.push('/');
        }
    }, [role, router]);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: name
            });

            const collectionName = userRole === 'creator' ? 'creators' : 'users';
            await setDoc(doc(db, collectionName, user.uid), {
                name: name,
                email: email,
                gender: gender,
                phone: phone,
                role: userRole,
                createdAt: serverTimestamp()
            });

            alert('회원가입이 완료되었습니다.');
            router.push('/');

        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('이미 사용 중인 이메일입니다.');
            } else if (err.code === 'auth/weak-password') {
                setError('비밀번호는 6자 이상이어야 합니다.');
            } else {
                setError('회원가입 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!userRole) {
        return <div className={styles.loading}>역할을 확인하는 중...</div>;
    }

    return (
        <div className={styles.container}>
            <SignupHeader />
            <main className={styles.main}>
                <div className={styles.imageContainer}>
                    <Image
                        src="/images/signup.jpg"
                        alt="Signup background image"
                        layout="fill"
                        objectFit="cover"
                        priority
                    />
                    <div className={styles.overlay}></div>
                </div>
                <div className={styles.formContainer}>
                    <h1 className={styles.title}>
                        {userRole === 'creator' ? '크리에이터 회원가입' : '일반 회원가입'}
                    </h1>
                    <form onSubmit={handleSignup} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일"
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호"
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="비밀번호 확인"
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="이름"
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                required
                                className={styles.select}
                            >
                                <option value="">성별 선택</option>
                                <option value="male">남성</option>
                                <option value="female">여성</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="전화번호"
                                required
                                className={styles.input}
                            />
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? '가입 중...' : '회원가입'}
                        </button>
                        {error && <p className={styles.error}>{error}</p>}
                    </form>
                </div>
            </main>
        </div>
    );
}