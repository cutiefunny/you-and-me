import Image from "next/image";
import styles from "./page.module.css";
import TopPerformers from "@/components/TopPerformers";

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

export default function Home() {
  return (
    <div className={styles.page}>
      <TopPerformers performers={topFour} />
    </div>
  );
}
