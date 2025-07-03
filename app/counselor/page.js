// /app/counselor/page.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import styles from './CounselorPage.module.css';
import CounselorImageModal from './CounselorImageModal';
import { db, auth } from '@/lib/firebase/clientApp';
import { doc, setDoc, collection, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';

// 더미 데이터 (위에서 galleryImages가 추가된 버전으로 사용)
const dummyCounselors = [
  { id: '1', name: '김옥순', rating: 4.8, reviews: 120, image: '/images/girl (1).jpg',
    galleryImages: ['/images/girl (10).jpg', '/images/girl (11).jpg', '/images/girl (12).jpg'],
    sampleAudio: '/audio/olivia_sample.mp3' },
  { id: '2', name: '박영자', rating: 4.7, reviews: 95, image: '/images/girl (2).jpg',
    galleryImages: ['/images/girl (13).jpg', '/images/girl (14).jpg', '/images/girl (15).jpg'],
    sampleAudio: '/audio/amanda_sample.mp3' },
  { id: '3', name: '최영희', rating: 4.9, reviews: 210, image: '/images/girl (3).jpg',
    galleryImages: ['/images/girl (16).jpg', '/images/girl (17).jpg', '/images/girl (11).jpg'],
    sampleAudio: '/audio/natalie_sample.mp3' },
  { id: '4', name: '김나나', rating: 4.8, reviews: 120, image: '/images/girl (5).jpg',
    galleryImages: ['/images/5women_gallery1.jpg', '/images/5women_gallery2.jpg', '/images/5women_gallery3.jpg'],
    sampleAudio: '/audio/olivia_sample.mp3' },
  { id: '5', name: '이라라', rating: 4.7, reviews: 95, image: '/images/girl (6).jpg',
    galleryImages: ['/images/6women_gallery1.jpg', '/images/6women_gallery2.jpg', '/images/6women_gallery3.jpg'],
    sampleAudio: '/audio/amanda_sample.mp3' },
  { id: '6', name: '최니니', rating: 4.9, reviews: 210, image: '/images/girl (7).jpg',
    galleryImages: ['/images/7women_gallery1.jpg', '/images/7women_gallery2.jpg', '/images/7women_gallery3.jpg'],
    sampleAudio: '/audio/natalie_sample.mp3' },
  { id: '7', name: '정영숙', rating: 4.6, reviews: 150, image: '/images/girl (8).jpg',
    galleryImages: ['/images/4women_gallery1.jpg', '/images/4women_gallery2.jpg', '/images/4women_gallery3.jpg'],
    sampleAudio: '/audio/sophia_sample.mp3' },
];
const StarIcon = () => <span className={styles.starIcon}>★</span>;
const PlayIcon = () => <div className={styles.playIcon}></div>;

export default function CounselorPage() {
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselorId, setSelectedCounselorId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isCalling, setIsCalling] = useState(false);
  const [agoraClient, setAgoraClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ mainImageSrc: '', additionalImages: [], counselorName: '' });

  useEffect(() => {
    setLoading(true);
    setCounselors(dummyCounselors);
    setLoading(false);
  }, []);

  // 통화 상태 실시간 감지
  useEffect(() => {
    if (!currentCallId) return;

    const callDocRef = doc(db, 'calls', currentCallId);
    
    const unsubscribe = onSnapshot(callDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const callData = docSnap.data();
        const status = callData.status;

        console.log('통화 상태 변경 감지:', status);
        
        // [수정] 상담사가 전화를 거절했거나, 통화를 완료(종료)한 경우
        if (status === 'declined' || status === 'completed' || status === 'failed') {
          // alert를 제거하고 handleHangUp에 메시지를 전달하여 호출
          handleHangUp("상대방에 의해 통화가 종료되었습니다.");
        }
      }
    });

    return () => unsubscribe();

  }, [currentCallId]); // isCalling 의존성 제거


  const handleCounselorSelect = (id) => { 
    setSelectedCounselorId(prevId => (prevId === id ? null : id));
  };
  const handlePlaySample = (e, sampleAudioUrl) => { 
    e.stopPropagation();
    alert(`Play sample: ${sampleAudioUrl}`);
  };

  const handleCall = async () => {
    if (!selectedCounselorId) {
        alert("먼저 상담사를 선택해주세요.");
        return;
    }
    
    setIsCalling(true);
    let callDocId = '';

    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

      const selected = dummyCounselors.find(c => c.id === selectedCounselorId);
      const channelName = `call_${selected.id}_${Date.now()}`;
      const uid = Math.floor(Math.random() * 100000);

      const tokenRes = await fetch('/api/agora-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid }),
      });
      const { token } = await tokenRes.json();

      const callDocRef = doc(collection(db, "calls"));
      callDocId = callDocRef.id;
      setCurrentCallId(callDocId);

      await setDoc(callDocRef, {
          callerId: "test_user_id",
          counselorId: selected.id,       
          channelName: channelName,
          agoraToken: token,              
          status: 'ringing',              
          createdAt: serverTimestamp(),
      });
      
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setAgoraClient(client);

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      });
      
      // [수정] Agora 이벤트에서는 콘솔 로그만 남기고 handleHangUp을 호출하여 로직을 일원화
      client.on('user-unpublished', (user) => {
        console.log('상담사가 통화를 종료했습니다. (Agora 이벤트)');
        handleHangUp("상대방과의 연결이 끊어졌습니다.");
      });

      await client.join(process.env.NEXT_PUBLIC_AGORA_APP_ID, channelName, token, uid);
      
      const track = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(track);
      await client.publish(track);

      alert(`${selected.name}님과 통화를 시작합니다...`);

    } catch (error) {
      console.error("Agora call failed:", error);
      alert("통화 연결에 실패했습니다.");
      if (callDocId) {
        await updateDoc(doc(db, 'calls', callDocId), { status: 'failed' });
      }
      setIsCalling(false); // 실패 시 isCalling 상태를 false로 되돌림
    }
  };

  // [수정] 통화 종료 로직 통합 및 중복 호출 방지
  const handleHangUp = useCallback(async (reason) => {
    // isCalling 상태를 직접 참조하는 대신, 함수 호출 시점의 상태를 확인합니다.
    // 이렇게 하면 여러 비동기 이벤트에서 상태가 늦게 업데이트되어도 중복 실행되는 것을 방지합니다.
    if (agoraClient?.connectionState !== 'CONNECTED' && !localAudioTrack) {
        // 이미 연결이 끊겼거나 정리된 상태이면 아무것도 하지 않음
        return;
    }

    const alertMessage = reason || "통화가 종료되었습니다.";
    
    console.log("통화 종료 로직을 실행합니다. 이유:", reason || "사용자 요청");
    
    try {
        if (localAudioTrack) {
          localAudioTrack.stop();
          localAudioTrack.close();
        }
        if (agoraClient) {
          await agoraClient.leave();
        }
        if (currentCallId) {
            const callDocRef = doc(db, 'calls', currentCallId);
            await updateDoc(callDocRef, { status: 'completed' });
        }
    } catch (error) {
        console.error("통화 종료 처리 중 오류:", error);
    } finally {
        setLocalAudioTrack(null);
        setAgoraClient(null);
        setIsCalling(false);
        setCurrentCallId(null);
        alert(alertMessage);
    }
  }, [agoraClient, localAudioTrack, currentCallId]); // 필요한 의존성 추가

  const openImageModal = (counselor) => { 
    setModalContent({
        mainImageSrc: counselor.image || '/images/default_profile.png',
        additionalImages: counselor.galleryImages || [],
        counselorName: counselor.name
    });
    setIsModalOpen(true);
  };
  const closeImageModal = () => { setIsModalOpen(false); };

  if (loading) { return <div className={styles.pageContainer}><p style={{textAlign: 'center', marginTop: '50px'}}>상담사 목록을 불러오는 중...</p></div>; }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.counselorList}>
        {counselors.map((counselor) => (
          <div
            key={counselor.id}
            className={selectedCounselorId === counselor.id ? styles.counselorItemSelected : styles.counselorItem}
            onClick={() => handleCounselorSelect(counselor.id)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleCounselorSelect(counselor.id)}
          >
            <div onClick={(e) => { e.stopPropagation(); openImageModal(counselor); }} style={{cursor: 'pointer'}}>
              <Image
                src={counselor.image || '/images/default_profile.png'}
                alt={`${counselor.name} profile`}
                width={60}
                height={60}
                className={styles.profileImage}
              />
            </div>
            <div className={styles.infoContainer}>
              <div className={styles.name}>{counselor.name}</div>
              <div className={styles.ratingContainer}>
                <StarIcon /> {counselor.rating.toFixed(1)}
                <span className={styles.reviews}>({counselor.reviews})</span>
              </div>
            </div>
            <div className={styles.sampleButtonContainer} onClick={(e) => handlePlaySample(e, counselor.sampleAudio)}>
              <div className={styles.playIconWrapper}>
                <PlayIcon />
              </div>
              <span className={styles.sampleText}>Sample</span>
            </div>
          </div>
        ))}
      </div>

      {isCalling ? (
      <button 
        className={`${styles.callButton} ${styles.hangUpButton}`} 
        onClick={() => handleHangUp()} // 명시적으로 인자 없이 호출
      >
        통화 종료
      </button>
      ) : (
      <button 
        className={styles.callButton} 
        onClick={handleCall}
        disabled={!selectedCounselorId}
      >
        통화하기
      </button>
      )}

      <CounselorImageModal
        isOpen={isModalOpen}
        onClose={closeImageModal}
        mainImageSrc={modalContent.mainImageSrc}
        additionalImages={modalContent.additionalImages}
        counselorName={modalContent.counselorName}
      />
    </div>
  );
}
