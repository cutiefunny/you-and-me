// /app/counselor/dashboard/page.jsx (수정)
'use client';

import { useState, useEffect } from 'react';
//import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/clientApp';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import IncomingCallModal from './IncomingCallModal'; // 방금 만든 모달 임포트

export default function CounselorDashboard() {
  // const { user } = useAuth();
  const user = { uid: 'counselor123', role: 'counselor' }; // 테스트용 목업 데이터
  
  // [추가] 수신 전화 정보를 담을 상태
  const [incomingCall, setIncomingCall] = useState(null);

  // Firestore 실시간 리스너 설정
  useEffect(() => {
    if (!user || user.role !== 'counselor') return;

    const callsQuery = query(
      collection(db, 'calls'),
      where('counselorId', '==', user.uid),
      where('status', '==', 'ringing')
    );

    const unsubscribe = onSnapshot(callsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const callData = change.doc.data();
          const callId = change.doc.id;
          console.log('새로운 통화 요청 도착!', callData);
          
          // [수정] 첫 번째로 감지된 통화 요청을 상태에 저장하여 모달을 띄움
          // 한 번에 하나의 전화만 처리한다고 가정
          if (!incomingCall) {
            setIncomingCall({ ...callData, callId });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user, incomingCall]); // incomingCall을 의존성에 추가하여 중복 모달 방지

  // [추가] 통화 수락 핸들러
  const handleAcceptCall = (callData) => {
    console.log("통화 수락:", callData.callId);
    // TODO: 
    // 1. Firestore의 call 문서 상태를 'accepted'로 변경
    //    const callDocRef = doc(db, 'calls', callData.callId);
    //    await updateDoc(callDocRef, { status: 'accepted' });
    //
    // 2. Agora 채널에 참여하는 로직 실행 (사용자 페이지의 handleCall과 유사)
    //    joinAgoraChannel(callData.channelName, callData.agoraToken);
    
    // 모달 닫기
    setIncomingCall(null);
  };

  // [추가] 통화 거절 핸들러
  const handleDeclineCall = async (callData) => {
    console.log("통화 거절:", callData.callId);
    try {
      // Firestore의 call 문서 상태를 'declined'로 변경
      const callDocRef = doc(db, 'calls', callData.callId);
      await updateDoc(callDocRef, { status: 'declined' });
    } catch (error) {
      console.error("통화 거절 처리 중 오류 발생:", error);
    }
    // 모달 닫기
    setIncomingCall(null);
  };


  return (
    <div>
      <h1>상담사 대시보드</h1>
      <p>이곳에서 통화 요청을 대기합니다.</p>
      
      {/* 통화 수신 모달 렌더링 */}
      <IncomingCallModal 
        callData={incomingCall}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />
    </div>
  );
}
