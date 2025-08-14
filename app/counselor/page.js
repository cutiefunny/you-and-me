'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './CounselorPage.module.css';
import CounselorImageModal from './CounselorImageModal';
// ★★★ 1. 필요한 Firebase 모듈을 가져옵니다.
import { auth, db } from '@/lib/firebase/clientApp'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// 더미 데이터 (향후 Firestore에서 가져올 데이터)
const dummyCounselors = [
    { id: 'counselor_1', name: '김옥순', rating: 4.8, reviews: 120, image: '/images/girl (1).jpg',
      galleryImages: ['/images/girl (10).jpg', '/images/girl (11).jpg', '/images/girl (12).jpg'],
      sampleAudio: '/audio/olivia_sample.mp3' },
    { id: 'counselor_2', name: '박영자', rating: 4.7, reviews: 95, image: '/images/girl (2).jpg',
      galleryImages: ['/images/girl (13).jpg', '/images/girl (14).jpg', '/images/girl (15).jpg'],
      sampleAudio: '/audio/amanda_sample.mp3' },
    { id: 'counselor_3', name: '최영희', rating: 4.9, reviews: 210, image: '/images/girl (3).jpg',
      galleryImages: ['/images/girl (16).jpg', '/images/girl (17).jpg', '/images/girl (11).jpg'],
      sampleAudio: '/audio/natalie_sample.mp3' },
    { id: 'counselor_4', name: '김나나', rating: 4.8, reviews: 120, image: '/images/girl (5).jpg',
      galleryImages: ['/images/5women_gallery1.jpg', '/images/5women_gallery2.jpg', '/images/5women_gallery3.jpg'],
      sampleAudio: '/audio/olivia_sample.mp3' },
    { id: 'counselor_5', name: '이라라', rating: 4.7, reviews: 95, image: '/images/girl (6).jpg',
      galleryImages: ['/images/6women_gallery1.jpg', '/images/6women_gallery2.jpg', '/images/6women_gallery3.jpg'],
      sampleAudio: '/audio/amanda_sample.mp3' },
    { id: 'counselor_6', name: '최니니', rating: 4.9, reviews: 210, image: '/images/girl (7).jpg',
      galleryImages: ['/images/7women_gallery1.jpg', '/images/7women_gallery2.jpg', '/images/7women_gallery3.jpg'],
      sampleAudio: '/audio/natalie_sample.mp3' },
    { id: 'counselor_7', name: '정영숙', rating: 4.6, reviews: 150, image: '/images/girl (8).jpg',
      galleryImages: ['/images/4women_gallery1.jpg', '/images/4women_gallery2.jpg', '/images/4women_gallery3.jpg'],
      sampleAudio: '/audio/sophia_sample.mp3' },
];

const StarIcon = () => <span className={styles.starIcon}>★</span>;
const PlayIcon = () => <div className={styles.playIcon}></div>;

export default function CounselorPage() {
    const router = useRouter(); 
    const [counselors, setCounselors] = useState([]);
    const [selectedCounselorId, setSelectedCounselorId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ mainImageSrc: '', additionalImages: [], counselorName: '' });

    useEffect(() => {
        setLoading(true);
        // 실제 애플리케이션에서는 이 데이터를 Firestore에서 가져와야 합니다.
        setCounselors(dummyCounselors);
        setLoading(false);
    }, []);

    const handleCounselorSelect = (id) => {
        setSelectedCounselorId(prevId => (prevId === id ? null : id));
    };

    const handlePlaySample = (e, sampleAudioUrl) => {
        e.stopPropagation();
        alert(`Play sample: ${sampleAudioUrl}`);
    };

    // ★★★ 2. 채팅 시작 핸들러 함수를 비동기(async)로 변경하고 Firestore 저장 로직 추가 ★★★
    const handleStartChat = async () => {
        if (!selectedCounselorId) {
            alert("먼저 상담사를 선택해주세요.");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            alert("채팅을 시작하려면 로그인이 필요합니다.");
            // 필요하다면 로그인 페이지로 리디렉션
            // router.push('/login');
            return;
        }

        // 선택된 상담사의 전체 정보를 찾습니다.
        const selectedCounselor = counselors.find(c => c.id === selectedCounselorId);
        if (!selectedCounselor) {
            alert("상담사 정보를 찾을 수 없습니다. 다시 시도해주세요.");
            return;
        }

        // 사용자 ID와 상담사 ID를 정렬하여 고유한 채팅방 ID를 생성합니다.
        const userId = user.uid;
        const counselorId = selectedCounselorId;
        const chatId = [userId, counselorId].sort().join('_');

        try {
            // 'chats' 컬렉션에 대한 참조를 만듭니다.
            const chatRef = doc(db, 'chats', chatId);

            // Firestore에 저장할 데이터를 준비합니다.
            const chatData = {
                participantIds: [userId, counselorId],
                userId: userId,
                userName: user.displayName || user.email || '고객',
                userEmail: user.email,
                creatorId: counselorId,
                creatorName: selectedCounselor.name, // 요청하신 상담사 이름을 저장합니다.
                updatedAt: serverTimestamp(), // 최신 활동 시간을 기록합니다.
            };

            // setDoc에 { merge: true } 옵션을 사용하여 기존 문서를 덮어쓰지 않고 업데이트/생성합니다.
            await setDoc(chatRef, chatData, { merge: true });

            // 채팅방으로 이동합니다.
            router.push(`/chat/${chatId}`);

        } catch (error) {
            console.error("채팅방 생성 또는 업데이트 중 오류 발생:", error);
            alert("채팅을 시작하는 중에 문제가 발생했습니다. 다시 시도해주세요.");
        }
    };

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

            <button
                className={styles.callButton}
                onClick={handleStartChat}
                disabled={!selectedCounselorId}
            >
                채팅하기
            </button>

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