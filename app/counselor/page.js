// /app/counselor/page.jsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './CounselorPage.module.css';
import CounselorImageModal from './CounselorImageModal';
import { db, auth } from '@/lib/firebase/clientApp';
import { doc, setDoc, collection, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore'; // updateDoc, onSnapshot 추가


// 더미 데이터 (위에서 galleryImages가 추가된 버전으로 사용)
const dummyCounselors = [
  { id: '1', name: '김옥순', rating: 4.8, reviews: 120, image: '/images/1women.jpg',
    galleryImages: ['/images/1-1.jpg', '/images/1-2.jpg', '/images/1-3.jpg'],
    sampleAudio: '/audio/olivia_sample.mp3' },
  { id: '2', name: '박영자', rating: 4.7, reviews: 95, image: '/images/2women.jpg',
    galleryImages: ['/images/2women_gallery1.jpg', '/images/2women_gallery2.jpg', '/images/2women_gallery3.jpg'],
    sampleAudio: '/audio/amanda_sample.mp3' },
  { id: '3', name: '최영희', rating: 4.9, reviews: 210, image: '/images/3women.jpg',
    galleryImages: ['/images/3women_gallery1.jpg', '/images/3women_gallery2.jpg', '/images/3women_gallery3.jpg'],
    sampleAudio: '/audio/natalie_sample.mp3' },
  { id: '4', name: '김나나', rating: 4.8, reviews: 120, image: '/images/5women.jpg',
    galleryImages: ['/images/5women_gallery1.jpg', '/images/5women_gallery2.jpg', '/images/5women_gallery3.jpg'],
    sampleAudio: '/audio/olivia_sample.mp3' },
  { id: '5', name: '이라라', rating: 4.7, reviews: 95, image: '/images/6women.jpg',
    galleryImages: ['/images/6women_gallery1.jpg', '/images/6women_gallery2.jpg', '/images/6women_gallery3.jpg'],
    sampleAudio: '/audio/amanda_sample.mp3' },
  { id: '6', name: '최니니', rating: 4.9, reviews: 210, image: '/images/7women.jpg',
    galleryImages: ['/images/7women_gallery1.jpg', '/images/7women_gallery2.jpg', '/images/7women_gallery3.jpg'],
    sampleAudio: '/audio/natalie_sample.mp3' },
  { id: '7', name: '정영숙', rating: 4.6, reviews: 150, image: '/images/4women.jpg',
    galleryImages: ['/images/4women_gallery1.jpg', '/images/4women_gallery2.jpg', '/images/4women_gallery3.jpg'],
    sampleAudio: '/audio/sophia_sample.mp3' },
];


const StarIcon = () => <span className={styles.starIcon}>★</span>;
const PlayIcon = () => <div className={styles.playIcon}></div>;

export default function CounselorPage() {
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselorId, setSelectedCounselorId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // [추가] 통화 관련 상태
  const [isCalling, setIsCalling] = useState(false);
  const [agoraClient, setAgoraClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null); // [추가] 현재 통화 문서 ID 저장

  // 모달 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ mainImageSrc: '', additionalImages: [], counselorName: '' });

  useEffect(() => {
    setLoading(true);
    setCounselors(dummyCounselors);
    setLoading(false);
  }, []);

  const handleCounselorSelect = (id) => {
    setSelectedCounselorId(prevId => (prevId === id ? null : id));
  };

  const handlePlaySample = (e, sampleAudioUrl) => {
    e.stopPropagation();
    alert(`Play sample: ${sampleAudioUrl}`);
    // TODO: 실제 오디오 재생 로직 구현
  };

  // ==================== [추가] 통화 상태 실시간 감지 ====================
  useEffect(() => {
    // currentCallId가 있을 때만 (즉, 통화가 시작되었을 때만) 리스너를 설정합니다.
    if (!currentCallId) return;

    const callDocRef = doc(db, 'calls', currentCallId);
    
    // onSnapshot을 사용하여 해당 문서의 변경사항을 실시간으로 감지합니다.
    const unsubscribe = onSnapshot(callDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const callData = docSnap.data();
        const status = callData.status;

        console.log('통화 상태 변경 감지:', status);

        // 상담사가 전화를 거절했거나, 통화를 완료(종료)한 경우
        if (status === 'declined' || status === 'completed' || status === 'failed') {
          // 이미 통화 종료 로직이 실행 중이 아니라면 실행
          if (isCalling) {
            alert("상대방에 의해 통화가 종료되었습니다.");
            handleHangUp();
          }
        }
      }
    });

    // 컴포넌트가 언마운트되거나 currentCallId가 변경될 때 리스너를 정리합니다.
    return () => unsubscribe();

  }, [currentCallId, isCalling]); // isCalling을 의존성에 추가하여 중복 호출 방지
  // =====================================================================


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
      
      client.on('user-unpublished', (user) => {
        console.log('상담사가 통화를 종료했습니다.');
        handleHangUp();
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
      setIsCalling(false);
    }
  };

const handleHangUp = async () => {
    if (!isCalling && !agoraClient) return;

    console.log("통화 종료 로직을 실행합니다.");
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
        alert("통화가 종료되었습니다.");
    }
  };

  // 이미지 클릭 시 모달 열기 핸들러
  const openImageModal = (counselor) => {
    setModalContent({
      mainImageSrc: counselor.image || '/images/default_profile.png',
      additionalImages: counselor.galleryImages || [],
      counselorName: counselor.name
    });
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
  };


  if (loading) {
    return <div className={styles.pageContainer}><p style={{textAlign: 'center', marginTop: '50px'}}>상담사 목록을 불러오는 중...</p></div>;
  }

  return (
    <div className={styles.pageContainer}>
      {/* <h1 className={styles.title}>상담사를 선택하세요</h1> */}

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
            {/* 이미지 클릭 시 모달 열도록 수정 */}
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
        onClick={handleHangUp}
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

      {/* 모달 컴포넌트 렌더링 */}
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