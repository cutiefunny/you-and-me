// /hooks/useSmsMessage.js
'use client';

import { useState } from 'react';

// 수신자 번호 (상담사 번호)를 환경 변수에서 가져옵니다.
// 이 변수는 .env.local 파일에 설정되어야 합니다. (예: NEXT_PUBLIC_RECEIVER_PHONE_NUMBER="010-XXXX-YYYY")
const RECEIVER_PHONE_NUMBER = "";

export default function useSmsMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * 상담 신청 정보를 포함한 SMS 메시지를 고정된 수신자(상담사)에게 발송합니다.
   * @param {object} params
   * @param {string} params.name - 신청자 이름
   * @param {string} params.phone - 신청자 전화번호 ('-' 포함 또는 미포함)
   * @param {object} params.scoresMap - 설문조사 결과의 성향별 점수 맵 (예: { "도미넌트": 150, "서브": 120, ... })
   */
  const sendSmsMessage = async ({ name, phone, scoresMap, documentId }) => {
    setLoading(true);
    setError(null);
    setData(null);

    if (!RECEIVER_PHONE_NUMBER) {
      setError("수신자 전화번호(NEXT_PUBLIC_RECEIVER_PHONE_NUMBER)가 설정되지 않았습니다.");
      setLoading(false);
      return null;
    }

    // scoresMap에서 상위 5개 항목을 추출하여 메시지 생성
    const sortedScores = Object.entries(scoresMap || {}) // scoresMap이 없을 경우 대비
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, 5);

    const top5Categories = sortedScores.map(([cat, score]) => `${cat}: ${score}점`).join(', ');

    // SMS 메시지 내용 구성
    const messageContent = 
      `[너랑나 상담 신청]\n` +
      `신청자: ${name} (${phone})\n` +
      `https://you-and-me-three.vercel.app/survey/${documentId}\n`;

    try {
      const response = await fetch('/api/send-sms-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // 'from'은 신청자의 전화번호로, API 라우트에서 메시지 내용에 포함됩니다.
          from: phone,          
          // 'to'는 상담사의 고정된 번호로, SMS 발송의 실제 수신인이 됩니다.
          to: RECEIVER_PHONE_NUMBER,       
          // NCP SENS로 보낼 최종 메시지 내용
          message: messageContent,           
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '메시지 발송에 실패했습니다.');
      }
      
      setData(result);
      return result;

    } catch (err) {
      setError(err.message);
      console.error("SMS 메시지 발송 실패:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendSmsMessage, loading, error, data };
}