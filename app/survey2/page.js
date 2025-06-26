// app/survey2/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './Survey2Page.module.css'; // 새 CSS 모듈 임포트

// Next.js Image 컴포넌트 대신 일반 img 태그를 사용 (미리보기 환경 호환성 위함)
// import Image from 'next/image'; // 주석 해제하여 사용하거나, 계속 img 태그 사용

// Firebase 및 SMS 훅 임포트 활성화 및 경로 조정
import { db } from '../../lib/firebase/clientApp'; // Firebase 클라이언트 앱 경로
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import useSmsMessage from '../../hooks/useSmsMessage'; // useSmsMessage 훅 경로

const questionsData = [
  {
    id: 'q1',
    text: '1. 연인이 나에게 서운하다고 말할 때 나는…',
    options: [
      { text: '바로 사과하며 감정을 나눈다', score: { secure: 1 } },
      { text: '잠깐 침묵하며 상황을 본다', score: { anxious: 1 } },
      { text: '방어적으로 변하거나 말을 피한다', score: { avoidant: 1 } },
      { text: '내 감정을 먼저 말하고 싶어진다', score: { disorganized: 1 } },
    ],
  },
  {
    id: 'q2',
    text: '2. 상대가 바쁘다고 할 때 나는…',
    options: [
      { text: '이해하지만 약간의 서운함이 남는다', score: { secure: 1 } },
      { text: '괜히 눈치 보이고 외로워진다', score: { anxious: 1 } },
      { text: '나도 무심해지려 한다', score: { avoidant: 1 } },
      { text: '“내가 필요 없는 건가”라는 생각이 든다', score: { anxious: 1 } },
    ],
  },
  {
    id: 'q3',
    text: '3. 연애 중 ‘자유로운 시간’이 생기면 나는…',
    options: [
      { text: '서로 공간이 있어야 한다고 생각한다', score: { secure: 1 } },
      { text: '상대가 나를 덜 좋아하는 것 같아 불안해진다', score: { anxious: 1 } },
      { text: '내가 버려지는 건 아닐까 걱정한다', score: { anxious: 1 } },
      { text: '마음이 편해지고 나를 챙기게 된다', score: { avoidant: 1 } },
    ],
  },
  {
    id: 'q4',
    text: '4. 상대가 감정 표현을 잘 안 할 때 나는…',
    options: [
      { text: '답답해도 기다려보려 한다', score: { secure: 1 } },
      { text: '더 애정을 확인하고 싶어진다', score: { anxious: 1 } },
      { text: '화나거나 불신하게 된다', score: { avoidant: 1 } },
      { text: '“내가 먼저 참는 게 익숙하다”고 느낀다', score: { disorganized: 1 } },
    ],
  },
  {
    id: 'q5',
    text: '5. 연애 중 나의 감정 표현 방식은?',
    options: [
      { text: '솔직하게 말한다', score: { secure: 1 } },
      { text: '참았다다가 한 번에 터뜨린다', score: { disorganized: 1 } },
      { text: '말하는 게 무섭고 피하고 싶다', score: { avoidant: 1 } },
      { text: '눈치 보며 조심스럽게 표현한다', score: { anxious: 1 } },
    ],
  },
  {
    id: 'q6',
    text: '6. 헤어지고 나면 나는 보통…',
    options: [
      { text: '힘들지만 감정을 정리하며 돌아본다', score: { secure: 1 } },
      { text: '다시 연락 올까 봐 마음이 들떠 있다', score: { anxious: 1 } },
      { text: '상처를 감추고 아무 일 없는 척한다', score: { avoidant: 1 } },
      { text: '상대가 날 잊을까 봐 더 매달린다', score: { anxious: 1 } },
    ],
  },
  {
    id: 'q7',
    text: '7. 사랑받고 있다는 느낌이 드는 순간은?',
    options: [
      { text: '감정을 진심으로 들어줄 때', score: { secure: 1 } },
      { text: '사소한 부분까지 챙겨줄 때', score: { anxious: 1 } },
      { text: '연락이 꾸준할 때', score: { avoidant: 1 } },
      { text: '내가 힘들다고 말했을 때 바로 반응해줄 때', score: { anxious: 1 } },
    ],
  },
  {
    id: 'q8',
    text: '8. 마음을 닫는 이유는 주로…',
    options: [
      { text: '내 감정을 몰라줄 때', score: { secure: 1 } },
      { text: '반복되는 갈등이 생길 때', score: { disorganized: 1 } },
      { text: '내 감정을 표현해도 무시당할 때', score: { avoidant: 1 } },
      { text: '거절당할까 봐 말조차 안 하게 될 때', score: { anxious: 1 } },
    ],
  },
  {
    id: 'q9',
    text: '9. 사랑이 깊어질수록 나는…',
    options: [
      { text: '더 많이 주고 싶어진다', score: { secure: 1 } },
      { text: '뭔가 불안한 기분이 든다', score: { anxious: 1 } },
      { text: '나만 좋아하는 것 같아 무력해진다', score: { anxious: 1 } },
      { text: '오히려 감정을 감추게 된다', score: { avoidant: 1 } },
    ],
  },
  {
    id: 'q10',
    text: '10. “사랑은 편안한 거야”라는 말에 대해 내 생각은?',
    options: [
      { text: '맞는 말이다', score: { secure: 1 } },
      { text: '그건 영화 속 이야기 같다', score: { disorganized: 1 } },
      { text: '나는 늘 불안해서 편했던 적이 없다', score: { anxious: 1 } },
      { text: '편하면 금방 끝날까 봐 오히려 불안하다', score: { anxious: 1 } },
    ],
  },
];

// 추천 제품 정보 (이미지 사용)
const productRecommendations = {
  secure: [
    { name: "진정 시트 마스크", image: "/images/mask.jpeg", description: "평온한 당신을 위한 진정 마스크." },
    { name: "아로마 오일 세트", image: "/images/aroma.jpeg", description: "관계를 더욱 풍요롭게." },
  ],
  anxious: [
    { name: "안심 릴렉스 티", image: "/images/tea.jpeg", description: "불안한 마음을 다독이는 따뜻한 차." },
    { name: "긍정 확언 카드", image: "/images/card.jpeg", description: "자존감을 높이는 긍정 메시지." },
  ],
  avoidant: [
    { name: "개인 공간 향수", image: "/images/perfume.jpeg", description: "나만의 시간을 위한 아늑한 향." },
    { name: "독립성 강화 워크북", image: "/images/workbook.jpeg", description: "자유를 존중하는 관계를 위한 가이드." },
  ],
  disorganized: [
    { name: "감정 일기장", image: "/images/book.jpeg", description: "복잡한 감정을 정리하는 도구." },
    { name: "경계 설정 가이드북", image: "/images/book.jpeg", description: "건강한 관계를 위한 실용 지침서." },
  ],
};

export default function Survey2Page() {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [topType, setTopType] = useState(null);
  const [showConsultForm, setShowConsultForm] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const nameInputRef = useRef(null);
  const { sendSmsMessage, loading: smsLoading, error: smsError } = useSmsMessage();

  useEffect(() => {
    if (showConsultForm && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showConsultForm]);

  const handleChange = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex, // 선택된 옵션의 인덱스를 저장
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(answers).length !== questionsData.length) {
      alert("모든 질문에 답변해주세요!");
      return;
    }

    let avoidant = 0;
    let anxious = 0;
    let disorganized = 0;
    let secure = 0;

    questionsData.forEach((question) => {
      const selectedOptionIndex = answers[question.id];
      const selectedOption = question.options[selectedOptionIndex];

      if (selectedOption && selectedOption.score) {
        if (selectedOption.score.avoidant) avoidant += selectedOption.score.avoidant;
        if (selectedOption.score.anxious) anxious += selectedOption.score.anxious;
        if (selectedOption.score.disorganized) disorganized += selectedOption.score.disorganized;
        if (selectedOption.score.secure) secure += selectedOption.score.secure;
      }
    });

    const scores = [
      { type: "회피형 애착", key: "avoidant", value: avoidant },
      { type: "불안형 애착", key: "anxious", value: anxious },
      { type: "혼란형 애착", key: "disorganized", value: disorganized },
      { type: "안정형 애착", key: "secure", value: secure },
    ];

    scores.sort((a, b) => b.value - a.value);
    const topResult = scores[0];

    const descriptions = {
      "회피형 애착": "감정을 숨기고 거리를 두는 편이에요. 누군가가 다가올수록 본능적으로 벽을 치는 당신은, 관계보다 독립성이 더 편할지도 몰라요.",
      "불안형 애착": "사랑을 받을수록 불안해지는 마음. 버려질까, 사랑을 잃을까 하는 두려움이 크고, 작은 말에도 크게 상처받는 예민한 감정의 소유자예요.",
      "혼란형 애착": "마음을 표현하고 싶으면서도, 동시에 밀쳐내는 복잡한 감정이 섞여 있어요. 자기 감정에 확신이 없고, 반복되는 연애 패턴에 자주 지쳐요.",
      "안정형 애착": "감정 조절이 잘 되는 편이고, 갈등도 건강하게 풀 수 있어요. 하지만 때때로 타인의 감정을 지나치게 배려해 자신을 잊을 때도 있어요."
    };

    setResults({
      type: topResult.type,
      description: descriptions[topResult.type],
      key: topResult.key, // 제품 추천을 위한 키
      calculatedScores: { avoidant, anxious, disorganized, secure } // 계산된 실제 점수 저장
    });
    setTopType(topResult.key); // for product recommendations

    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 100);
  };

  const handleConsultSubmit = async () => {
    if (!name || !phone || !email) {
      alert("이름, 연락처, 이메일을 모두 입력해주세요.");
      return;
    }

    if (!results) {
      alert("테스트 결과를 먼저 확인해주세요.");
      return;
    }

    try {
      // Firebase Firestore에 데이터 저장 또는 업데이트
      const surveyCollectionRef = collection(db, "survey2"); // 'survey2' 컬렉션 사용
      // name과 phone이 일치하는 문서가 있는지 쿼리
      const q = query(surveyCollectionRef, where("name", "==", name), where("phone", "==", phone));
      const querySnapshot = await getDocs(q);

      let finalDocId = null; // 최종적으로 저장될/업데이트될 문서의 ID

      const dataToSave = {
        name: name,
        phone: phone,
        email: email,
        result: results.type, // 최종 유형만 저장
        rawScores: results.calculatedScores, // 계산된 실제 점수 저장
        timestamp: serverTimestamp() // 제출 시간 기록
      };

      if (!querySnapshot.empty) {
        // 이미 존재하는 문서가 있다면 해당 문서 업데이트
        const docIdToUpdate = querySnapshot.docs[0].id;
        const docRef = doc(db, "survey2", docIdToUpdate);
        await updateDoc(docRef, dataToSave);
        finalDocId = docIdToUpdate; // 기존 문서 ID 사용
        console.log("Document updated with ID: ", docIdToUpdate);
      } else {
        // 새 문서 추가
        const docRef = await addDoc(surveyCollectionRef, dataToSave);
        finalDocId = docRef.id; // 새로 생성된 문서 ID 사용
        console.log("Document written with ID: ", docRef.id);
      }
      
      // SMS 발송 - 상세 페이지 링크 포함
      // Vercel 배포 URL 또는 개발 환경 URL을 사용해야 합니다.
      const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://you-and-me-three.vercel.app'; // 기본 배포 URL
      const detailPageLink = `${appBaseUrl}/survey2/${finalDocId}`;

      const smsMessageContent = 
        `[감정 애착 유형 테스트 결과]\n` +
        `이름: ${name}\n` +
        `연락처: ${phone}\n` +
        `결과 유형: ${results.type}\n` +
        `상세 보기: ${detailPageLink}\n\n` +
        `상담을 요청했습니다.`;

      const smsResult = await sendSmsMessage({
        name,
        phone,
        //message: smsMessageContent, // 이미 상세 메시지를 구성했으므로 customMessage로 전달
        documentId: finalDocId,
        surveyType: 'survey2', // <-- 이 부분을 추가합니다.
      });

      if (smsResult && smsResult.success) {
        alert("상담 신청 및 SMS 발송이 완료되었습니다. 상담사가 곧 연락드릴게요 💕");
      } else {
        alert(`상담 신청은 완료되었으나, SMS 발송에 실패했습니다: ${smsError || '알 수 없는 오류'}.`);
        console.error("SMS 발송 실패:", smsError);
      }

      // 폼 초기화 및 숨기기
      setName('');
      setPhone('');
      setEmail('');
      setShowConsultForm(false);
    } catch (error) {
      console.error("상담 신청 중 오류 발생:", error);
      alert("상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const fillRandomAnswers = () => {
    const newAnswers = {};
    questionsData.forEach((q) => {
      newAnswers[q.id] = Math.floor(Math.random() * q.options.length); // 0부터 옵션 개수-1까지 랜덤 인덱스
    });
    setAnswers(newAnswers);
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title} onClick={fillRandomAnswers}>감정 애착 유형 테스트</h1>
      <p className={styles.themeText}>“나는 왜 사랑받아도 불안할까?”</p>

      <form id="attachmentTestForm" onSubmit={handleSubmit}>
        <div id="questionContainer">
          {questionsData.map((q) => (
            <div key={q.id} className={styles.question}>
              <p>{q.text}</p>
              <div className={styles.options}>
                {q.options.map((option, index) => (
                  <label key={index} className={styles.optionLabel}>
                    <input
                      type="radio"
                      name={q.id}
                      value={index}
                      onChange={() => handleChange(q.id, index)}
                      checked={answers[q.id] === index}
                      required
                    />
                    {option.text}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button type="submit" className={styles.submitButton}>결과 보기</button>
      </form>

      {results && (
        <div id="resultArea" className={styles.resultArea}>
          <h2 className={styles.resultTitle}>당신의 감정 애착 유형은?</h2>
          {/* 유형별 동적 클래스 적용 */}
          <p className={`${styles.resultType} ${styles[results.key]}`}>� {results.type}</p>
          <p className={styles.resultDescription}>💬 {results.description}</p>

          <div className={styles.productRecommendation}>
            <h3 className={styles.productTitle}>✨ 추천 제품 키트</h3>
            <div className={styles.productCardContainer}>
              {(productRecommendations[results.key] || []).map((product, index) => (
                <div key={index} className={styles.productCard}>
                  {/* next/image 대신 일반 img 태그 사용 */}
                  <img
                    src={product.image}
                    alt={product.name}
                    width={100}
                    height={100}
                    className={styles.productImage}
                  />
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productDescription}>{product.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            id="consultButton" 
            className={styles.consultButton}
            onClick={() => setShowConsultForm(true)}
          >
            5분 무료 상담 예약하기 →
          </button>
        </div>
      )}

      {showConsultForm && (
        <div id="consultForm" className={styles.consultForm}>
          <h2 className={styles.consultFormTitle}>5분 무료 상담 예약</h2>
          <p className={styles.consultFormDescription}>상담사가 곧 연락드리겠습니다. 아래 양식을 작성해 주세요.</p>
          <input 
            type="text" 
            placeholder="이름" 
            className={styles.inputField} 
            value={name}
            onChange={(e) => setName(e.target.value)}
            ref={nameInputRef}
          />
          <input 
            type="text" 
            placeholder="연락처" 
            className={styles.inputField}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="이메일" 
            className={styles.inputField}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button id="submitConsult" className={styles.submitConsultButton} onClick={handleConsultSubmit} disabled={smsLoading}>
            {smsLoading ? '제출 중...' : '제출'}
          </button>
          {smsError && <p className={styles.errorText}>SMS 발송 중 오류: {smsError}</p>}
        </div>
      )}
    </div>
  );
}
