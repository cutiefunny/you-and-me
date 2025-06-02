// app/events/view/[eventId]/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '../EventsPage.module.css'; // 목록 페이지 스타일 일부 재활용 가능
import Image from 'next/image';

// Home 페이지에서 사용된 eventImages 데이터 또는 상세 정보를 포함하는 데이터
const eventImagesData = [
  { id: 'event1', src: '/images/event1.jpg', alt: '이벤트 배너 1', title: '새시즌 맞이 특별 할인!', description: '이벤트 1의 상세 내용입니다. 다양한 혜택을 확인하세요.' },
  { id: 'event2', src: '/images/event2.jpg', alt: '이벤트 배너 2', title: '친구 추천 이벤트', description: '친구를 추천하면 모두에게 선물을 드립니다.' },
    { id: 'event3', src: '/images/event3.jpg', alt: '이벤트 배너 3', title: '앱 리뷰 작성하고 쿠폰받자', description: '앱 리뷰를 남기고 쿠폰을 받아가세요!' },
];

async function getEventDetailsById(id) {
  // 실제로는 API 호출 또는 DB 조회
  await new Promise(resolve => setTimeout(resolve, 100));
  return eventImagesData.find(event => event.id === id);
}

export default function EventViewPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params ? params.eventId : null;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      const fetchEvent = async () => {
        setLoading(true);
        const eventData = await getEventDetailsById(eventId);
        setEvent(eventData);
        setLoading(false);
      };
      fetchEvent();
    } else {
      setLoading(false);
    }
  }, [eventId]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <main className={styles.contentArea} style={{textAlign: 'center', paddingTop: '40px'}}>
            이벤트 정보를 불러오는 중입니다...
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.contentArea}>
        <div className={styles.eventDetailView}>
          <div className={styles.detailImageWrapper}>
            <Image 
                src={event.src} 
                alt={event.alt} 
                fill
                style={{ objectFit: 'contain' }} // 또는 'cover'
                sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          <h1 className={styles.detailTitle}>{event.title}</h1>
          <p className={styles.detailDescription}>{event.description || "상세 내용이 준비 중입니다."}</p>
          {/* 여기에 더 많은 상세 내용 (기간, 참여 방법 등) 추가 */}
        </div>
      </main>
    </div>
  );
}