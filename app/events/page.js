// app/events/page.js
'use client'; // useRouter, useState, useEffect 사용

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './EventsPage.module.css';

// Home 페이지에서 사용된 eventImages 데이터 (실제로는 props나 API를 통해 가져올 수 있습니다)
const eventImagesData = [
  { id: 'event1', src: '/images/event1.jpg', alt: '이벤트 배너 1', title: '새시즌 맞이 특별 할인!' },
  { id: 'event2', src: '/images/event2.jpg', alt: '이벤트 배너 2', title: '친구 추천 이벤트' },
  { id: 'event3', src: '/images/event3.jpg', alt: '이벤트 배너 3', title: '앱 리뷰 작성하고 쿠폰받자' }
];
// Home 페이지에서 eventImages가 단순 문자열 배열이었다면 아래와 같이 변환
// const eventImagesSimple = [
//   '/images/event1.jpg',
//   '/images/event2.jpg',
//   '/images/event3.jpg',
//   '/images/event4.jpg',
//   '/images/event5.jpg'
// ];
// const eventImagesData = eventImagesSimple.map((src, index) => ({
//   id: `event${index + 1}`,
//   src: src,
//   alt: `이벤트 이미지 ${index + 1}`,
//   title: `이벤트 ${index + 1} 제목` // 실제로는 더 의미있는 제목 필요
// }));


export default function EventsPage() {
  const router = useRouter();
  // 페이지 로딩, 데이터 상태 등은 필요에 따라 추가
  // const [events, setEvents] = useState([]);
  // useEffect(() => { setEvents(eventImagesData); }, []);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className={styles.pageContainer}>
      <main className={styles.contentArea}>
        <div className={styles.eventGrid}>
          {eventImagesData.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className={styles.eventCardLink}>
              <div className={styles.eventCard}>
                <div className={styles.eventImageWrapper}>
                  <Image
                    src={event.src}
                    alt={event.alt}
                    fill
                    style={{ objectFit: 'cover' }}
                    className={styles.eventImage}
                    sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 300px" // 예시 sizes
                  />
                </div>
                {/* 이미지 하단에 이벤트 제목 등을 표시할 수 있습니다. */}
                {/* <h3 className={styles.eventTitle}>{event.title}</h3> */}
              </div>
            </Link>
          ))}
          {eventImagesData.length === 0 && <p>진행 중인 이벤트가 없습니다.</p>}
        </div>
      </main>
    </div>
  );
}