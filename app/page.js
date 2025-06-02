'use client';

import Image from "next/image";
import styles from "./page.module.css";
import TopPerformers from "@/components/TopPerformers";
import ImageSlider from "@/components/ImageSlider";
import PersonList from "@/components/PersonList";
import { useRouter } from 'next/navigation'; // next/link 대신 useRouter 사용 권장

const eventImages = [ /* ... */ ];
const topFour = [ /* ... */ ];

export default function Home() {
  const router = useRouter(); // 클라이언트 컴포넌트이므로 useRouter 사용 가능

  const handleEventSectionClick = () => {
    // window.location.href 대신 router.push 사용 권장 (SPA 동작 유지)
    router.push('/events');
  };


const eventImages = [
    '/images/event1.jpg',
    '/images/event2.jpg',
    '/images/event3.jpg'
  ];

  const topFour = [
      {
      name: '김옥순',
      image: '/images/1women.jpg', // 실제 이미지 경로
      description: '솔직한 대화를 원하신다면',
      // 추가 정보
      },
      {
      name: '박영자',
      image: '/images/2women.jpg',
      },
      {
      name: '최영희',
      image: '/images/3women.jpg',
      },
      {
      name: '정영숙',
      image: '/images/4women.jpg',
      }
  ];

  const persons = [
    {
      name: '김나나',
      image: '/images/5women.jpg',
    },
    {
      name: '이라라',
      image: '/images/6women.jpg',
    },
    {
      name: '최영희',
      image: '/images/3women.jpg',
    },
    {
      name: '정영숙',
      image: '/images/4women.jpg',
    }
  ];
  
return (
    <div className={styles.page}>
      <div style={{ width: '100%'}} onClick={handleEventSectionClick}> {/* 수정된 핸들러 사용 */}
        <ImageSlider images={eventImages} sliderHeight="150px" autoPlayDefault={true} />
      </div>
      <TopPerformers performers={topFour} />
      <PersonList people={persons} />
    </div>
  );
}