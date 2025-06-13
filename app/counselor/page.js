// /app/counselor/page.jsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './CounselorPage.module.css';
import CounselorImageModal from './CounselorImageModal'; // 모달 컴포넌트 임포트 (경로 확인)

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
  const [isCalling, setIsCalling] = useState(false); // 현재 통화 중인지 여부
  const [agoraClient, setAgoraClient] = useState(null); // Agora 클라이언트 객체
  const [localAudioTrack, setLocalAudioTrack] = useState(null); // 내 마이크 오디오

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

  const handleCall = async () => {
    if (!selectedCounselorId) {
      alert("먼저 상담사를 선택해주세요.");
      return;
    }
    
    setIsCalling(true); // UI를 '통화 중' 상태로 변경

    try {

      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

      const selected = counselors.find(c => c.id === selectedCounselorId);
      const channelName = `call_${Date.now()}`; // 고유한 채널 이름 생성
      const uid = Math.floor(Math.random() * 100000); // 임시 사용자 ID

      // 1. 우리 서버로부터 토큰 발급받기
      const tokenRes = await fetch('/api/agora-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid }),
      });
      const { token } = await tokenRes.json();

      // 2. Agora 클라이언트 생성 및 초기화
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setAgoraClient(client);

      // 3. 원격 사용자 오디오 수신 처리
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          user.audioTrack.play(); // 상대방 오디오 재생
        }
      });
      client.on('user-unpublished', user => { /* 상대방이 나갔을 때 처리 */ });

      // 4. 채널에 참여 (Join)
      await client.join(process.env.NEXT_PUBLIC_AGORA_APP_ID, channelName, token, uid);

      // 5. 내 마이크 오디오 트랙 생성 및 발행 (Publish)
      const track = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(track);
      await client.publish(track);

      alert(`${selected.name}님과 통화를 시작합니다...`);

    } catch (error) {
      console.error("Agora call failed:", error);
      alert("통화 연결에 실패했습니다.");
      setIsCalling(false); // 실패 시 상태 원복
    }
};

const handleHangUp = async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (agoraClient) {
      await agoraClient.leave();
    }
    setLocalAudioTrack(null);
    setAgoraClient(null);
    setIsCalling(false);
    alert("통화가 종료되었습니다.");
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