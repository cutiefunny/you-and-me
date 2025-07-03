// /app/ranking/page.jsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import styles from './RankingPage.module.css'; // RankingPage 전용 CSS Module 임포트

// 예시 데이터 (실제로는 API 또는 Firestore에서 가져와야 함)
const initialDummyData = [
  // Top 3
  { rank: 1, name: '김옥순', image: '/images/1women.jpg', country: '대한민국', stat: 'l28', isVerified: true, score: 15000 },
  { rank: 2, name: '박영자', image: '/images/2women.jpg', country: '대한민국', stat: 'l20', isVerified: true, score: 14500 },
  { rank: 3, name: '최영희', image: '/images/3women.jpg', country: '대한민국', stat: 'l21', isVerified: true, score: 14000 },
  // General List (4위부터)
  { rank: 4, name: '김나나', image: '/images/5women.jpg', stat: 'l25', isVerified: true, score: 13500 }, // 이미지 없음 예시
  { rank: 5, name: '이라라', image: '/images/6women.jpg', country: '대한민국', stat: 'l20', isVerified: true, score: 13000 },
  { rank: 6, name: '최니니', image: '/images/girl (7).jpg', country: '대한민국', stat: 'l23', isVerified: true, score: 12500 },
  { rank: 7, name: '정영숙', image: '/images/4women.jpg', country: '대한민국', stat: 'l34', isVerified: false, score: 12000 }, // 미인증 예시
];

// 필터 옵션 (예시)
const timeFilterOptions = ["월간랭킹", "주간랭킹", "일일랭킹"];
const genderFilterOptions = ["여자", "남자", "전체"];


// 파란색 체크 아이콘 (간단한 SVG 예시)
const VerifiedIcon = () => (
  <svg className={styles.verifiedIcon} viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);
// 위치 아이콘 (간단한 SVG 예시)
const LocationIcon = () => (
    <svg className={styles.locationIcon} viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
);


export default function RankingPage() {
  const [rankingList, setRankingList] = useState([]);
  const [topThree, setTopThree] = useState([]);
  const [otherRankers, setOtherRankers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedTimeFilter, setSelectedTimeFilter] = useState(timeFilterOptions[0]);
  const [selectedGenderFilter, setSelectedGenderFilter] = useState(genderFilterOptions[0]);

  const fetchRankingData = useCallback(() => {
    setLoading(true);
    setError('');
    // TODO: 실제 API 호출 또는 Firestore 연동 시 필터링 로직 구현
    // 예시: 현재는 더미 데이터를 필터 없이 사용하고, 1,2,3위와 나머지를 분리
    // 실제로는 selectedTimeFilter, selectedGenderFilter 값을 사용하여 데이터 필터링 필요
    
    setTimeout(() => { // API 호출 시뮬레이션
        const sortedData = [...initialDummyData].sort((a, b) => a.rank - b.rank);
        
        // 선택된 필터에 따라 더미 데이터 필터링 (예시)
        let filteredData = sortedData;
        if (selectedGenderFilter !== "전체") {
            // 실제 데이터에는 gender 필드가 있어야 함
            // filteredData = filteredData.filter(p => p.gender === selectedGenderFilter.toLowerCase());
        }
        // selectedTimeFilter에 따른 필터링 로직 추가 필요

        setTopThree(filteredData.slice(0, 3));
        setOtherRankers(filteredData.slice(3));
        setRankingList(filteredData); // 전체 목록도 필요하면 유지
        setLoading(false);
    }, 500);
  }, [selectedTimeFilter, selectedGenderFilter]);

  useEffect(() => {
    fetchRankingData();
  }, [fetchRankingData]);

  // Top 3 렌더링 순서 조정 (2위, 1위, 3위)
  const orderedTopThree = ((top3) => {
    if (top3.length < 3) return top3; // 데이터가 충분하지 않으면 그대로 반환
    const first = top3.find(p => p.rank === 1);
    const second = top3.find(p => p.rank === 2);
    const third = top3.find(p => p.rank === 3);
    return [second, first, third].filter(p => p !== undefined); // 없는 경우 제외
  })(topThree);


  if (loading) {
    return <div className={styles.pageContainer}><p className={styles.loadingText}>랭킹 정보를 불러오는 중...</p></div>;
  }
  if (error) {
    return <div className={styles.pageContainer}><p className={styles.errorText}>{error}</p></div>;
  }

  return (
    <div className={styles.pageContainer}>
      {/* 상단 필터 바 */}
      <div className={styles.filterBar}>
        <select 
          value={selectedTimeFilter} 
          onChange={(e) => setSelectedTimeFilter(e.target.value)}
          className={styles.filterDropdown}
        >
          {timeFilterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select 
          value={selectedGenderFilter} 
          onChange={(e) => setSelectedGenderFilter(e.target.value)}
          className={styles.filterDropdown}
        >
          {genderFilterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      {/* 명예의 전당 (Top 3) */}
      <div className={styles.hallOfFame}>
        <h2 className={styles.hofTitle}>명예의 전당</h2>
        <p className={styles.hofDescriptionSmall}>통화를 많이 하면 랭킹이 올라가요.</p>
        
        <div className={styles.topThreeContainer}>
          {orderedTopThree.map((person) => {
            if (!person) return null;
            let cardStyle = styles.rankerCard;
            let imageStyle = styles.profileImage;
            let rankDisplayStyle = styles.rankNumberDisplay;

            if (person.rank === 1) {
              cardStyle = styles.rankerCardTop1;
              imageStyle = styles.profileImageTop1;
              rankDisplayStyle = styles.rankNumberDisplayTop1;
            } else if (person.rank === 2) {
              imageStyle = styles.profileImageTop2;
              rankDisplayStyle = styles.rankNumberDisplayTop2;
            } else if (person.rank === 3) {
              imageStyle = styles.profileImageTop3;
              rankDisplayStyle = styles.rankNumberDisplayTop3;
            }

            return (
              <div key={person.rank} className={cardStyle}>
                <div className={styles.profileImageWrapper}>
                  {person.image ? (
                    <img src={person.image} alt={person.name} className={imageStyle} />
                  ) : (
                    <div className={person.rank === 1 ? styles.profileImageTop1 : styles.profileImage} style={{display: 'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#e0e0e0', fontSize: person.rank ===1 ? '40px' : '30px', color:'#757575'}}>?</div>
                  )}
                </div>
                <div className={styles.rankerName}>
                  {person.name}
                  {person.isVerified && <VerifiedIcon />}
                </div>
                <div className={rankDisplayStyle}>{person.rank}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 일반 랭킹 리스트 (4위 이하) */}
      {otherRankers.length > 0 && (
        <div className={styles.generalRankingList}>
          {otherRankers.map((person) => (
            <div key={person.rank} className={styles.generalRankerItem}>
              <div className={styles.generalRankNumber}>{person.rank}</div>
              {person.image ? (
                <img src={person.image} alt={person.name} className={styles.generalProfileImage} />
              ) : (
                <div className={styles.generalProfileImagePlaceholder}>?</div>
              )}
              <div className={styles.rankerName} style={{fontSize: '14px', marginTop: '8px'}}> {/* 일반 랭커 이름 크기 조정 */}
                {person.name}
                {person.isVerified && <VerifiedIcon />}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* TODO: 페이지네이션 (필요시) */}
    </div>
  );
}