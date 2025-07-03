// app/signup/page.js
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // useSearchParams 임포트
import { db, auth } from '../../lib/firebase/clientApp'; // Firebase Auth 임포트
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile // 사용자 프로필 업데이트를 위해 추가
} from 'firebase/auth'; // Firebase Auth 함수 임포트
import { collection, doc, setDoc } from 'firebase/firestore'; // addDoc 대신 setDoc 사용 (UID를 문서 ID로)
import useSmsMessage from '../../hooks/useSmsMessage'; // SMS 훅 임포트
import SignupHeader from '../../components/SignupHeader';

import styles from './SignupPage.module.css'; 

export default function SignupPage() {
  const searchParams = useSearchParams(); // URL 쿼리 파라미터 사용
  const recommenderId = searchParams.get('id'); // 'id' 쿼리 파라미터 값 가져오기

  // 초기 가입 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 가입 후 상담 폼 상태
  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultEmail, setConsultEmail] = useState(''); // 상담 폼에 이메일 자동 채우기 위함

  // UI 및 로딩/메시지 상태
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConsultForm, setShowConsultForm] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null); // Firebase Auth User 객체 저장

  const emailInputRef = useRef(null); // 초기 폼의 이메일 입력 필드에 포커스
  const consultNameInputRef = useRef(null); // 상담 폼의 이름 입력 필드에 포커스

  useEffect(() => {
    // 초기 가입 폼 로드 시 이메일 필드에 포커스
    if (!showConsultForm && emailInputRef.current) {
      emailInputRef.current.focus();
    }
    // 상담 폼 로드 시 이름 필드에 포커스
    if (showConsultForm && consultNameInputRef.current) {
      consultNameInputRef.current.focus();
    }
  }, [showConsultForm]); // showConsultForm 상태 변경 시마다 이펙트 실행

  // Firestore에 사용자 정보 저장/업데이트 함수
  const upsertUserData = async (uid, data) => {
    try {
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, data, { merge: true }); // merge: true로 기존 필드 유지 및 새 필드 추가/업데이트
      console.log("User data upserted to Firestore for UID:", uid);
    } catch (error) {
      console.error("Firestore에 사용자 정보 저장/업데이트 중 오류:", error);
      throw new Error('사용자 정보 저장 중 오류가 발생했습니다.');
    }
  };

  // SMS 발송 훅
  const { sendSmsMessage, loading: smsLoading, error: smsError } = useSmsMessage();

  // 이메일/비밀번호 가입 핸들러
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setMessage(''); 
    setIsSuccess(false);

    if (!email || !password || !confirmPassword) {
      setMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      setMessage('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore에 UID와 이메일 및 추천인 ID(있을 경우) 먼저 저장
      const userDataToSave = { email: user.email };
      if (recommenderId) {
        userDataToSave.recommender = recommenderId;
      }
      await upsertUserData(user.uid, userDataToSave);

      setCurrentUserData(user); // 현재 로그인한 유저 데이터 저장
      setConsultEmail(user.email); // 상담 폼에 이메일 자동 채우기
      setConsultName(''); // 이메일 가입 시 이름은 비워둠 (상담 폼에서 입력)
      setShowConsultForm(true); // 상담 폼 표시

      setMessage('이메일로 회원가입이 완료되었습니다! 5분 무료 상담을 신청해주세요 💕');
      setIsSuccess(true);
      
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error("이메일/비밀번호 가입 중 오류:", error);
      let errorMessage = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일 주소입니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 주소입니다.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다. 6자 이상으로 설정해주세요.';
      }
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Google 간편 가입 핸들러
  const handleGoogleSignup = async () => {
    setMessage('');
    setIsSuccess(false);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Google 계정 정보 (UID, 이메일, 이름)와 추천인 ID(있을 경우)를 Firestore에 저장
      const userDataToSave = { 
        email: user.email, 
        name: user.displayName || null 
      };
      if (recommenderId) {
        userDataToSave.recommender = recommenderId;
      }
      await upsertUserData(user.uid, userDataToSave);

      setCurrentUserData(user); // 현재 로그인한 유저 데이터 저장
      setConsultName(user.displayName || ''); // Google 이름 자동 채우기
      setConsultEmail(user.email); // 상담 폼에 이메일 자동 채우기
      setShowConsultForm(true); // 상담 폼 표시

      setMessage('Google 계정으로 간편 가입이 완료되었습니다! 5분 무료 상담을 신청해주세요 💕');
      setIsSuccess(true);
      
      setEmail(''); // 초기 폼 상태 초기화
      setPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error("Google 가입 중 오류:", error);
      let errorMessage = 'Google 가입 중 오류가 발생했습니다. 다시 시도해주세요.';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google 로그인 팝업이 닫혔습니다.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = '이미 다른 Google 로그인 요청이 진행 중입니다.';
      } else if (error.code === 'auth/credential-already-in-use') {
        errorMessage = '이미 해당 이메일로 가입된 계정이 있습니다.';
      }
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // 5분 무료 상담 폼 제출 핸들러
  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!consultName || !consultPhone) {
      setMessage('상담을 위해 이름과 연락처를 모두 입력해주세요.');
      return;
    }

    if (!currentUserData) {
      setMessage('먼저 회원 가입을 완료해주세요.');
      return;
    }

    setLoading(true);
    try {
      // Firebase Auth 프로필에 이름 업데이트 (Google 로그인 사용자의 경우 displayName이 이미 있을 수 있음)
      if (currentUserData.displayName !== consultName) {
        await updateProfile(currentUserData, {
          displayName: consultName,
        });
      }

      // Firestore 사용자 문서에 이름과 전화번호 업데이트
      await upsertUserData(currentUserData.uid, { 
        name: consultName, 
        phone: consultPhone 
      });

      // SMS 발송 (상담사에게 알림)
      let smsMessageContent = 
        `[너랑나 5분 무료 상담 요청]\n` +
        `신청자: ${consultName}\n` +
        `연락처: ${consultPhone}\n`;

      if (recommenderId) {
        smsMessageContent += `추천인ID: ${recommenderId}\n`; // 추천인 ID 추가
      };
      const smsResult = await sendSmsMessage({     
        phone: process.env.NEXT_PUBLIC_RECEIVER_PHONE_NUMBER, // 수신자 번호 (환경 변수)
        message: smsMessageContent,           
      });

      if (smsResult && smsResult.success) {
        setMessage("5분 무료 상담 신청 및 SMS 발송이 완료되었습니다. 상담사가 곧 연락드릴게요 💕");
        setIsSuccess(true);
      } else {
        setMessage(`5분 무료 상담 신청은 완료되었으나, SMS 발송에 실패했습니다: ${smsError || '알 수 없는 오류'}.`);
        setIsSuccess(false);
        console.error("SMS 발송 실패:", smsError);
      }
      
      // 폼 초기화 (선택 사항)
      // setConsultName('');
      // setConsultPhone('');

    } catch (error) {
      console.error("상담 신청 중 오류 발생:", error);
      setMessage('상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <SignupHeader />
      {/* <h1 className={styles.title}>회원 가입</h1> */}
      <p className={styles.description}>서비스 이용을 위해 가입해주세요.</p>

      {message && ( // 메시지는 항상 상단에 표시
        <p className={isSuccess ? styles.successMessage : styles.errorMessage}>
          {message}
        </p>
      )}

      {!showConsultForm ? (
        <>
          {/* 이메일/비밀번호 가입 폼 */}
          <form onSubmit={handleEmailSignup} className={styles.signupForm}>
            <input 
              type="email" 
              placeholder="이메일" 
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              ref={emailInputRef}
              disabled={loading}
              required
            />
            <input 
              type="password" 
              placeholder="비밀번호 (6자 이상)" 
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <input 
              type="password" 
              placeholder="비밀번호 확인" 
              className={styles.inputField}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
            
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? '가입 중...' : '이메일로 가입하기'}
            </button>
          </form>

          {/* 또는 구분선 */}
          <div className={styles.divider}>
            <span>또는</span>
          </div>

          {/* Google 간편 가입 버튼 */}
          <button 
            className={styles.googleSignupButton} 
            onClick={handleGoogleSignup} 
            disabled={loading}
          >
            <img src="/images/google-icon.png" alt="Google icon" className={styles.googleIcon} />
            Google로 간편 가입하기
          </button>
        </>
      ) : (
        // 가입 완료 후 상담 폼
        <div className={styles.consultFormContainer}>
          <h2 className={styles.consultFormTitle}>5분 무료 상담 예약</h2>
          <p className={styles.consultFormDescription}>
            회원 가입이 완료되었습니다! 지금 5분 무료 상담을 신청하고 상담사와 연결해보세요.
          </p>
          <form onSubmit={handleConsultSubmit} className={styles.signupForm}> {/* signupForm 스타일 재활용 */}
            <input 
              type="text" 
              placeholder="이름" 
              className={styles.inputField} 
              value={consultName}
              onChange={(e) => setConsultName(e.target.value)}
              ref={consultNameInputRef}
              disabled={loading}
              required
            />
            <input 
              type="text" 
              placeholder="연락처 (예: 010-1234-5678)" 
              className={styles.inputField}
              value={consultPhone}
              onChange={(e) => setConsultPhone(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? '상담 신청 중...' : '상담 예약하기'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}