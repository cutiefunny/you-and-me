// /app/survey/page.js
"use client";

import React, { useState, useEffect, useRef } from 'react'; // useRef 임포트
import styles from './SurveyPage.module.css'; // CSS 모듈 임포트
import Image from 'next/image'; // next/image 사용을 위해 임포트
import { db } from '@/lib/firebase/clientApp'; // Firebase db 인스턴스 임포트
// [수정] Firestore 쿼리 및 업데이트를 위한 모듈 임포트
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'; 
import useSmsMessage from '@/hooks/useSmsMessage'; // useSmsMessage 훅 임포트

const categories = [
  "도미넌트", "서브", "스팽키", "헌터", "리틀", "브랫", "탑", "바텀",
  "브렛 테이머", "마조히스트", "사디스트", "디그레이더", "리거", "페트", "오너", "대디/마미",
  "서브미시브", "보스", "프레이", "바닐라"
];

const partners = {
  "도미넌트": { text: "모임에서 만난 리버스 스위치 타입", image: "/images/survey_dominant_partner.jpeg" },
  "서브": { text: "학교에서 만난 바닐라 타입", image: "/images/survey_sub_partner.jpeg" },
  "스팽키": { text: "클럽에서 만난 페티시형 상대", image: "/images/survey_spanky_partner.jpeg" },
  "헌터": { text: "게임에서 만난 탐색가형 타입", image: "/images/girl (7).jpg" },
  "리틀": { text: "오래된 친구 타입", "image": "/images/survey_little_partner.jpeg" },
  "브랫": { text: "SNS에서 만난 도발적인 상대", image: "/images/survey_brat_partner.jpeg" },
  "바닐라": { text: "조용한 도서관에서 만난 순수한 상대", image: "/images/survey_hunter_partner.jpeg" }
};

const generateQuestions = () => {
  const qList = [];
  for (let i = 1; i <= 49; i++) {
    const cat = categories[i % categories.length];
    qList.push({ id: `q${i - 1}`, text: `${i}. 나는 ${cat} 성향의 욕망을 느낀 적이 있다.`, cat });
  }
  return qList;
};

export default function SurveyPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [scoresMap, setScoresMap] = useState({});
  const [topType, setTopType] = useState(null);
  const [showConsultForm, setShowConsultForm] = useState(false);

  // 상담 신청 폼 필드 상태
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // 이름 입력 필드에 포커스를 주기 위한 useRef
  const nameInputRef = useRef(null); 

  // useSmsMessage 훅 사용
  const { sendSmsMessage, loading: smsLoading, error: smsError } = useSmsMessage();

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  // showConsultForm이 true가 되고 nameInputRef가 존재할 때 포커스 설정
  useEffect(() => {
    if (showConsultForm && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showConsultForm]); // showConsultForm 상태가 변경될 때마다 이펙트 실행

  const handleChange = (e) => {
    setAnswers({
      ...answers,
      [e.target.name]: parseInt(e.target.value),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (Object.keys(answers).length !== questions.length) {
      alert("모든 질문에 답변해주세요!");
      return;
    }

    const scores = {};
    questions.forEach((q) => {
      const val = answers[q.id];
      if (!scores[q.cat]) scores[q.cat] = 0;
      scores[q.cat] += val;
    });

    setScoresMap(scores); // 계산된 scores 맵 저장

    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const calculatedResults = Object.entries(scores).map(([cat, val]) => ({
      cat,
      percent: ((val / total) * 100).toFixed(2),
    }));

    calculatedResults.sort((a, b) => b.percent - a.percent); // 높은 순으로 정렬

    setResults(calculatedResults);

    const highestScoringType = calculatedResults[0]?.cat;
    setTopType(highestScoringType);

    // 결과 보기 후 맨 아래로 스크롤
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 100);
  };

  const handleConsultSubmit = async () => {
    if (!name || !phone || !email) {
      alert("이름, 연락처, 이메일을 모두 입력해주세요.");
      return;
    }

    if (Object.keys(scoresMap).length === 0) {
      alert("테스트 결과를 먼저 확인해주세요.");
      return;
    }

    try {
      // 1. Firebase Firestore에 데이터 저장 또는 업데이트
      const surveyCollectionRef = collection(db, "survey");
      // name과 phone이 일치하는 문서가 있는지 쿼리
      const q = query(surveyCollectionRef, where("name", "==", name), where("phone", "==", phone));
      const querySnapshot = await getDocs(q);

      let finalDocId = null; // 최종적으로 저장될/업데이트될 문서의 ID

      const dataToSave = {
        name: name,
        phone: phone,
        email: email,
        result: scoresMap, // scoresMap (테스트 결과) 저장
        timestamp: serverTimestamp() // 제출 시간 기록
      };

      if (!querySnapshot.empty) {
        // 이미 존재하는 문서가 있다면 해당 문서 업데이트
        const docIdToUpdate = querySnapshot.docs[0].id;
        const docRef = doc(db, "survey", docIdToUpdate);
        await updateDoc(docRef, dataToSave);
        finalDocId = docIdToUpdate; // 기존 문서 ID 사용
        console.log("Document updated with ID: ", docIdToUpdate);
      } else {
        // 새 문서 추가
        const docRef = await addDoc(surveyCollectionRef, dataToSave);
        finalDocId = docRef.id; // 새로 생성된 문서 ID 사용
        console.log("Document written with ID: ", docRef.id);
      }
      
      // 2. SMS 발송
      // 이름, 전화번호, scoresMap, 그리고 문서 ID를 포함하여 SMS 발송 훅 호출
      const smsResult = await sendSmsMessage({ name, phone, scoresMap, documentId: finalDocId });

      if (smsResult && smsResult.success) {
        alert("상담 신청 및 SMS 발송이 완료되었습니다. 상담사가 곧 연락드릴게요 💕");
      } else {
        // SMS 발송은 실패했어도 상담 신청(Firestore 저장)은 성공했을 수 있으므로 별도 메시지
        alert(`상담 신청은 완료되었으나, SMS 발송에 실패했습니다: ${smsError || '알 수 없는 오류'}.`);
        console.error("SMS 발송 실패:", smsError);
      }

      // 폼 초기화 및 숨기기
      setName('');
      setPhone('');
      setEmail('');
      setShowConsultForm(false);
    } catch (error) {
      console.error("Firestore에 데이터 추가/업데이트 중 오류 발생:", error);
      alert("상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 모든 질문에 랜덤으로 답변을 채우는 함수
  const fillRandomAnswers = () => {
    const newAnswers = {};
    questions.forEach((q) => {
      newAnswers[q.id] = Math.floor(Math.random() * 5) + 1; // 1부터 5까지 랜덤 값
    });
    setAnswers(newAnswers);
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title} onClick={fillRandomAnswers}>성적 취향 테스트</h1> {/* 클릭 이벤트로 변경 */}
      <form id="testForm" onSubmit={handleSubmit}>
        <div id="questionContainer">
          {questions.map((q, index) => (
            <div key={q.id} className={styles.question}>
              <p>{q.text}</p>
              <div className={styles.scale}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <label key={i}>
                    <input
                      type="radio"
                      name={q.id}
                      value={i}
                      onChange={handleChange}
                      checked={answers[q.id] === i}
                      required
                    />{' '}
                    {i}
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
          <h2 className={styles.resultTitle}>테스트 결과</h2>
          {results.map((res) => (
            <div key={res.cat} className={styles.resultEntry}>
              <strong>{res.cat}</strong>: {res.percent}%<br />
              <div className={styles.bar} style={{ width: `${res.percent}%` }}></div>
            </div>
          ))}

          {topType && (
            <div className={styles.partnerRecommendation}>
              <h3 className={styles.partnerTitle}>추천 섹스 파트너 유형</h3>
              <p className={styles.partnerText}>
                {partners[topType]?.text || "어딘가에서 운명처럼 만날 상대"}
              </p>
              {partners[topType]?.image && (
                <div className={styles.partnerImageWrapper}>
                  <Image
                    src={partners[topType].image}
                    alt={`${topType} 추천 파트너 이미지`}
                    width={300}
                    height={200}
                    layout="responsive"
                    className={styles.partnerImage}
                  />
                </div>
              )}
            </div>
          )}
          
          <button 
            id="consultButton" 
            className={styles.consultButton}
            onClick={() => setShowConsultForm(true)} // onClick 시 폼 표시
          >
            예쁜 상담사에게 상담받기 →
          </button>
        </div>
      )}

      {showConsultForm && (
        <div id="consultForm" className={styles.consultForm}>
          <h2 className={styles.consultFormTitle}>상담사 예약 신청</h2>
          <p className={styles.consultFormDescription}>설레는 예쁜 목소리로 상담사가 무료로 잠깐 전화드리겠습니다. 아래 양식을 작성해 주세요.</p>
          <input 
            type="text" 
            placeholder="이름" 
            className={styles.inputField} 
            value={name}
            onChange={(e) => setName(e.target.value)}
            ref={nameInputRef} // 이름 입력 필드에 ref 연결
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
          {smsError && <p style={{ color: 'red', marginTop: '10px' }}>SMS 발송 중 오류: {smsError}</p>}
        </div>
      )}
    </div>
  );
}
