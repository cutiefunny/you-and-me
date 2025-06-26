// /hooks/useSmsMessage.js
'use client';

import { useState } from 'react';

// 수신자 번호 (상담사 번호)를 환경 변수에서 가져옵니다.
// 이 변수는 .env.local 파일에 설정되어야 합니다. (예: NEXT_PUBLIC_RECEIVER_PHONE_NUMBER="010-XXXX-YYYY")
const RECEIVER_PHONE_NUMBER = process.env.NEXT_PUBLIC_RECEIVER_PHONE_NUMBER || "01081351379"; // 기본값 설정 (테스트용)

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
   * @param {string} params.documentId - Firebase Firestore에 저장된 문서 ID
   * @param {string} [params.surveyType = 'survey'] - 설문지 유형 (예: 'survey' 또는 'survey2'). `customMessage`가 없을 때 링크 생성에 사용됩니다.
   * @param {string} [params.message] - 직접 정의한 SMS 메시지 내용. 이 파라미터가 있으면 `scoresMap` 기반의 자동 생성 메시지보다 우선합니다.
   */
  const sendSmsMessage = async ({ name, phone, scoresMap, documentId, surveyType = 'survey', message: customMessage }) => {
    setLoading(true);
    setError(null);
    setData(null);

    if (!RECEIVER_PHONE_NUMBER) {
      setError("수신자 전화번호(NEXT_PUBLIC_RECEIVER_PHONE_NUMBER)가 설정되지 않았습니다.");
      setLoading(false);
      return null;
    }

    let messageContent;
    // 애플리케이션의 기본 URL을 가져옵니다.
    // window 객체가 없는 서버 사이드 렌더링 환경을 고려하여 기본 URL을 설정합니다.
    const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://you-and-me-three.vercel.app';
    
    // customMessage가 파라미터로 제공되면, 해당 메시지를 SMS 내용으로 사용합니다.
    // 이 경우, `scoresMap` 기반의 자동 메시지 생성 로직은 건너뛰어집니다.
    if (customMessage) {
      messageContent = customMessage;
    } else {
      // customMessage가 제공되지 않았을 경우, scoresMap과 surveyType에 따라 메시지를 자동으로 생성합니다.
      const sortedScores = Object.entries(scoresMap || {})
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, 5);
      const top5Categories = sortedScores.map(([cat, score]) => `${cat}: ${score}점`).join(', ');

      // surveyType에 따라 상세 페이지 링크의 경로를 동적으로 변경합니다.
      messageContent = 
        `[너랑나 상담 신청]\n` +
        `${appBaseUrl}/${surveyType}/${documentId}\n`
    }

    try {
      const response = await fetch('/api/send-sms-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: phone,          
          to: RECEIVER_PHONE_NUMBER,       
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
