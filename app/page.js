// app/page.jsx (또는 Home 컴포넌트가 있는 파일)
'use client';

import Image from "next/image"; // Image 컴포넌트는 현재 사용되지 않지만, 필요시 유지
import styles from "./page.module.css"; // 해당 경로에 page.module.css 파일이 있다고 가정
import TopPerformers from "@/components/TopPerformers";
import ImageSlider from "@/components/ImageSlider";
import PersonList from "@/components/PersonList";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleEventSectionClick = () => {
    router.push('/events');
  };

  // Ranking 페이지로 이동하는 핸들러 추가
  const handleRankingSectionClick = () => {
    router.push('/ranking');
  };

  // counselor 페이지로 이동하는 핸들러 추가
  const handleCounselorSectionClick = () => {
    router.push('/counselor');
  };

  const eventImages = [
    '/images/event1.jpg',
    '/images/event2.jpg',
    '/images/event3.jpg'
  ];

  const topFour = [
    {
      name: '김옥순',
      image: '/images/girl (1).jpg',
      description: '솔직한 대화를 원하신다면',
    },
    {
      name: '박영자',
      image: '/images/girl (2).jpg',
    },
    {
      name: '최영희',
      image: '/images/girl (3).jpg',
    },
    {
      name: '정영숙',
      image: '/images/girl (4).jpg',
    }
  ];

  const persons = [
    {
      name: '김나나',
      image: '/images/girl (5).jpg',
    },
    {
      name: '이라라',
      image: '/images/girl (6).jpg',
    },
    {
      name: '최니니',
      image: '/images/girl (7).jpg',
    },
    {
      name: '정영숙', // topFour에도 있는 분이네요, 데이터 확인 필요
      image: '/images/girl (8).jpg',
    }
  ];
  
  return (
    <div className={styles.page}>
      <div style={{ width: '100%', cursor: 'pointer' }} onClick={handleEventSectionClick}>
        <ImageSlider images={eventImages} sliderHeight="150px" autoPlayDefault={true} />
      </div>
      {/* TopPerformers 컴포넌트를 div로 감싸고 onClick 핸들러 추가 */}
      
      <div onClick={handleRankingSectionClick} style={{ cursor: 'pointer' }}>
        <TopPerformers performers={topFour} />
      </div>
      <div onClick={handleCounselorSectionClick} style={{ cursor: 'pointer' }}>
        <PersonList people={persons} />
      </div>
    </div>
  );
}