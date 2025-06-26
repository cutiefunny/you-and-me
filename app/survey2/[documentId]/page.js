// app/survey2/[documentId]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
// Firebase db 인스턴스를 가져옵니다.
// 현재 위치(app/survey2/[documentId])에서 lib/firebase/clientApp까지의 상대 경로를 사용합니다.
import { db } from '../../../lib/firebase/clientApp'; 
import { doc, getDoc } from 'firebase/firestore';

export default function Survey2ResultPage() {
  const params = useParams();
  const documentId = params.documentId;
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const fetchSurveyData = async () => {
      try {
        // 'survey2' 컬렉션에서 문서를 가져옵니다.
        const docRef = doc(db, "survey2", documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSurveyData(docSnap.data());
        } else {
          setError("해당 ID의 설문 결과를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("Error fetching survey data:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [documentId]);

  if (loading) return <div>설문 결과를 불러오는 중입니다...</div>;
  if (error) return <div>오류: {error}</div>;
  if (!surveyData) return <div>설문 결과가 존재하지 않습니다.</div>;

  // rawScores에서 각 애착 유형별 점수를 가져와 배열로 변환하고 정렬합니다.
  const rawScores = surveyData.rawScores || {};
  const sortedRawScores = Object.entries(rawScores).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
      <h1 style={{ color: '#87CEEB', textAlign: 'center', marginBottom: '20px' }}>상담 신청 상세 보기 <br />(감정 애착 유형 테스트)</h1>
      <p><strong>이름:</strong> {surveyData.name}</p>
      <p><strong>전화번호:</strong> {surveyData.phone}</p>
      <p><strong>이메일:</strong> {surveyData.email}</p>
      <h2 style={{ color: '#87CEEB', marginTop: '30px', marginBottom: '15px', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>분석 결과:</h2>
      <p><strong>최종 애착 유형:</strong> {surveyData.result}</p>
      <h3 style={{ color: '#555', marginTop: '20px', marginBottom: '10px' }}>상세 점수:</h3>
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {sortedRawScores.map(([typeKey, score]) => (
          <li key={typeKey} style={{ marginBottom: '5px' }}>
            {/* key를 한글 유형 이름으로 변환 (필요시) */}
            <strong>{typeKey === 'avoidant' ? '회피형' : 
                      typeKey === 'anxious' ? '불안형' :
                      typeKey === 'disorganized' ? '혼란형' :
                      typeKey === 'secure' ? '안정형' : typeKey}</strong>: {score}점
          </li>
        ))}
      </ul>
      {/* 여기에 더 상세한 결과 표시 로직 추가 (예: 문항별 답변 내용) */}
    </div>
  );
}
