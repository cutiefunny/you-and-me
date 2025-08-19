'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase/clientApp';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import useSmsMessage from '@/hooks/useSmsMessage'; // useSmsMessage 훅 import
import styles from './HomePage.module.css';

export default function HomePage() {
  // 폼 입력 데이터를 관리하기 위한 state
  const [formData, setFormData] = useState({
    type: '',
    sns: '',
    phone: '',
    company: '',
    name: '',
    message: '',
    email: '',
  });

  // useSmsMessage 훅 사용
  const { sendSmsMessage, loading: isSmsLoading, error: smsError } = useSmsMessage();

  // 입력 필드 변경 시 state 업데이트
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // 폼 제출 시 실행될 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    // 간단한 유효성 검사
    if (!formData.type || !formData.name || !formData.phone || !formData.email || !formData.message) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      // 'contacts' 컬렉션에 데이터 추가하고 결과(docRef)를 받음
      const docRef = await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: serverTimestamp(), // 서버 시간 기준 생성 시간 기록
      });
      
      // SMS로 전송할 메시지 내용 구성
      const smsContent = 
        `[Novaire 문의]\n` +
        `이름: ${formData.name}\n` +
        `연락처: ${formData.phone}\n` +
        `구분: ${formData.type}\n` +
        `업체명: ${formData.company || 'N/A'}\n`;

      // SMS 메시지 발송
      await sendSmsMessage({
        name: formData.name,
        phone: formData.phone,
        documentId: docRef.id, // Firestore에 저장된 문서 ID
        message: smsContent,   // 직접 구성한 메시지 내용
      });

      alert('문의가 성공적으로 접수되었습니다.');
      // 폼 초기화
      setFormData({
        type: '',
        sns: '',
        phone: '',
        company: '',
        name: '',
        message: '',
        email: '',
      });

    } catch (error) {
      console.error("Error adding document or sending SMS: ", error);
      alert('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.logo}>Novaire</h1>
          <nav className={styles.nav}>
            <a href="#services" className={styles.navLink}>서비스</a>
            <a href="#clients" className={styles.navLink}>파트너</a>
            <a href="#contact" className={styles.navLink}>문의</a>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h2 className={styles.heroTitle}>AI 기반 크리에이터 네트워크</h2>
          <p className={styles.heroSubtitle}>
            팬과 크리에이터가 소통하고 성장하는, 새로운 차원의 AI 플랫폼
          </p>
          <a href="#contact" className={styles.btnGradient}>
            지금 문의하기
          </a>
        </section>

        {/* Services Section */}
        <section id="services" className={styles.services}>
          <div className={styles.sectionContainer}>
            <p className={styles.servicesIntro}>WHAT WE DO</p>
            <h3 className={styles.sectionTitle}>Our Services</h3>
            <p className={styles.sectionDescription}>
              혁신적인 아이디어를 실현시켜 새로운 가치를 창출하며, 고객과 함께 생각하며 움직입니다.
            </p>
            <div className={styles.servicesGrid}>
              <div className={styles.serviceCard}>
                <h4 className={styles.cardTitle}>인플루언서 육성 및 진출</h4>
                <p className={styles.cardDescription}>
                  크리에이터들의 개성과 목표를 분석하고, 인플루언서 및 해외 진출 크리에이터로 성장할 수 있도록 맞춤형 로드맵과 실행을 제공합니다.
                </p>
              </div>
              <div className={styles.serviceCard}>
                <h4 className={styles.cardTitle}>콘텐츠 마케팅</h4>
                <p className={styles.cardDescription}>
                  여러분의 비즈니스에 맞는 가치 있는 콘텐츠·타겟·다양한 콘텐츠 형식·전략을 구성하여 브랜딩에 최적화된 콘텐츠를 제작·제공합니다.
                </p>
              </div>
              <div className={styles.serviceCard}>
                <h4 className={styles.cardTitle}>컨설팅</h4>
                <p className={styles.cardDescription}>
                  비즈니스 성과 향상을 위해 조직·프로세스·전략을 평가·개선하고, 데이터 기반 비즈니스 분석 등 다양한 영역에서 컨설팅을 제공합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* YouTube Section */}
        <section className={styles.youtubeSection}>
          <div className={styles.youtubeContainer}>
            <h3 className={styles.youtubeTitle}>포트폴리오 영상</h3>
            <p className={styles.youtubeDescription}>노베어의 작업 무드를 영상으로 확인하세요</p>
            <div className={styles.videoWrap}>
              <iframe
                src="https://www.youtube.com/embed/-Pj1aobJyTc?si=BFlyJQzxow3jnVX7"
                title="Novaire Portfolio"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        {/* Clients Section */}
        <section id="clients" className={styles.clientsSection}>
          <div className={styles.clientsContainer}>
            <h3 className={styles.sectionTitle}>함께하는 브랜드</h3>
            <div className={styles.clientsGrid}>
              <div className={styles.clientItem}>요식업</div>
              <div className={styles.clientItem}>뷰티 브랜드</div>
              <div className={styles.clientItem}>성형외과</div>
              <div className={styles.clientItem}>가구 브랜드</div>
              <div className={styles.clientItem}>패션 브랜드</div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={styles.contactSection}>
          <div className={styles.contactContainer}>
            <h3 className={`${styles.sectionTitle} ${styles.contactTitle}`}>문의하기</h3>
            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div>
                <label className={styles.formLabel}>구분</label>
                <select name="type" className={styles.formInput} required value={formData.type} onChange={handleChange}>
                  <option value="" disabled>선택해주세요</option>
                  <option value="기업">기업</option>
                  <option value="1인 고객">1인 고객</option>
                  <option value="크리에이터 지원">크리에이터 지원</option>
                </select>
              </div>
              <div className={styles.formGrid}>
                <input name="sns" type="text" placeholder="SNS 채널 아이디" className={styles.formInput} value={formData.sns} onChange={handleChange} />
                <input name="phone" type="text" placeholder="연락처 (예: 010-0000-0000)" className={styles.formInput} required value={formData.phone} onChange={handleChange} />
              </div>
              <div className={styles.formGrid}>
                <input name="company" type="text" placeholder="업체명" className={styles.formInput} value={formData.company} onChange={handleChange} />
                <input name="name" type="text" placeholder="이름" className={styles.formInput} required value={formData.name} onChange={handleChange} />
              </div>
              <textarea name="message" rows="5" placeholder="상담 내용" className={styles.formInput} required value={formData.message} onChange={handleChange}></textarea>
              <input name="email" type="email" placeholder="이메일" className={styles.formInput} required value={formData.email} onChange={handleChange} />
              <button type="submit" className={styles.btnGradient} disabled={isSmsLoading}>
                {isSmsLoading ? '전송 중...' : '보내기'}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2025 Novaire. All rights reserved.</p>
      </footer>
    </div>
  );
}