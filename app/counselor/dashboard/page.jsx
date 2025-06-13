// /app/counselor/dashboard/page.jsx (수정)
'use client';

import { useState, useEffect } from 'react';
//import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/clientApp';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import IncomingCallModal from './IncomingCallModal';

export default function CounselorDashboard() {
  // const { user } = useAuth();
  const user = { uid: '1', role: 'counselor' }; // 테스트용 목업 데이터
  
  const [incomingCall, setIncomingCall] = useState(null);

  // 상담사의 통화 상태 관리를 위한 state
  const [isCalling, setIsCalling] = useState(false);
  const [agoraClient, setAgoraClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);

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
        if (change.type === 'added' && !incomingCall) {
          const callData = change.doc.data();
          const callId = change.doc.id;
          console.log('새로운 통화 요청 도착!', callData);
          setIncomingCall({ ...callData, callId });
        }
      });
    });

    return () => unsubscribe();
  }, [user, incomingCall]);

  // Agora 채널 참여 로직
  const joinAgoraChannel = async (callData) => {
    const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
    const counselorUid = Math.floor(Math.random() * 100000);

    const tokenRes = await fetch('/api/agora-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName: callData.channelName, uid: counselorUid }),
    });
    const { token: counselorToken } = await tokenRes.json();

    if (!counselorToken) {
      throw new Error("상담사 토큰을 발급받지 못했습니다.");
    }
    
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    setAgoraClient(client);

    client.on('user-published', async (remoteUser, mediaType) => {
      await client.subscribe(remoteUser, mediaType);
      if (mediaType === 'audio') {
        remoteUser.audioTrack.play();
      }
    });

    // [수정] 상대방(사용자)이 나갔을 때, 통화 종료 처리
    client.on('user-unpublished', (remoteUser) => {
        console.log('상대방(사용자)이 통화를 종료했습니다.');
        handleHangUp();
    });
    
    await client.join(
      process.env.NEXT_PUBLIC_AGORA_APP_ID, 
      callData.channelName, 
      counselorToken, 
      counselorUid
    );

    const track = await AgoraRTC.createMicrophoneAudioTrack();
    setLocalAudioTrack(track);
    await client.publish(track);

    setIsCalling(true);
    setCurrentCallId(callData.callId);
  };

  // 통화 수락 핸들러
  const handleAcceptCall = async (callData) => {
    console.log("통화 수락:", callData.callId);
    try {
      const callDocRef = doc(db, 'calls', callData.callId);
      await updateDoc(callDocRef, { status: 'accepted' });
      await joinAgoraChannel(callData);
    } catch (error) {
       console.error("통화 수락 처리 중 오류:", error);
       alert("통화 연결에 실패했습니다.");
    } finally {
       setIncomingCall(null);
    }
  };

  // 통화 거절 핸들러
  const handleDeclineCall = async (callData) => {
    console.log("통화 거절:", callData.callId);
    try {
      const callDocRef = doc(db, 'calls', callData.callId);
      await updateDoc(callDocRef, { status: 'declined' });
    } catch (error) {
      console.error("통화 거절 처리 중 오류 발생:", error);
    } finally {
      setIncomingCall(null);
    }
  };

  // [수정] 통화 종료 핸들러 로직 보강
  const handleHangUp = async () => {
    // 이미 통화 종료 로직이 실행 중이면 중복 실행 방지
    if (!isCalling) return;

    console.log("통화 종료 로직을 실행합니다.");
    try {
        // 1. 로컬 오디오/비디오 트랙 정리
        if (localAudioTrack) {
          localAudioTrack.stop();
          localAudioTrack.close();
        }
        // 2. Agora 채널 나가기
        if (agoraClient) {
          await agoraClient.leave();
        }
        // 3. Firestore 통화 상태 업데이트
        if(currentCallId) {
            const callDocRef = doc(db, 'calls', currentCallId);
            // 통화 상태를 'completed'로 변경하여 통화가 완료되었음을 기록
            await updateDoc(callDocRef, { status: 'completed' });
        }
    } catch (error) {
        console.error("통화 종료 처리 중 오류:", error);
    } finally {
        // 4. 모든 로컬 상태 초기화
        setLocalAudioTrack(null);
        setAgoraClient(null);
        setIsCalling(false);
        setCurrentCallId(null);
        alert("통화가 종료되었습니다.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>상담사 대시보드</h1>
      
      {isCalling ? (
        <div>
          <p style={{ color: 'green', fontWeight: 'bold' }}>통화 중...</p>
          <button onClick={handleHangUp} style={{backgroundColor: 'red', color: 'white', padding: '10px 20px'}}>
            통화 종료
          </button>
        </div>
      ) : (
        <p>이곳에서 통화 요청을 대기합니다.</p>
      )}
      
      <IncomingCallModal 
        callData={incomingCall}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />
    </div>
  );
}
