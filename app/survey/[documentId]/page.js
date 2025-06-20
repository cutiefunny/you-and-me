// 예시: app/survey/[documentId]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';

export default function SurveyResultPage() {
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
        const docRef = doc(db, "survey", documentId);
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

  return (
    <div>
      <h1>설문 결과 상세 보기</h1>
      <p><strong>이름:</strong> {surveyData.name}</p>
      <p><strong>전화번호:</strong> {surveyData.phone}</p>
      <p><strong>이메일:</strong> {surveyData.email}</p>
      <h2>성향 점수:</h2>
      <ul>
        {Object.entries(surveyData.result).map(([category, score]) => (
          <li key={category}>{category}: {score}점</li>
        ))}
      </ul>
      {/* 여기에 더 상세한 결과 표시 로직 추가 */}
    </div>
  );
}