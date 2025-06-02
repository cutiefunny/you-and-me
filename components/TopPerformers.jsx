// components/TopPerformers.jsx
import React from 'react';
import styles from './TopPerformers.module.css'; // CSS 모듈

const TopPerformers = ({ performers }) => {
if (!performers || performers.length < 4) {
return <div>상위 4명의 데이터를 확인해주세요.</div>;
}

const topPerformer = performers.slice(0, 1)[0];
const restPerformers = performers.slice(1, 4);

return (
        <div className={styles.topPerformersContainer}>
            {/* 1등 표시 */}
            <div className={styles.topPerformerCard}>
                <img src={topPerformer.image} alt={topPerformer.name} className={styles.topPerformerImage} />
                <div className={styles.topPerformerInfo}>
                    <h3>{topPerformer.name}</h3>
                    <p>{topPerformer.description}</p>
                    {/* 추가 정보가 필요하다면 여기에 렌더링 */}
                </div>
            </div>
            {/* 2, 3, 4등 표시 */}
            <div className={styles.restPerformersContainer}>
                {restPerformers.map((performer, index) => (
                    <div key={index} className={styles.restPerformerCard}>
                        <img src={performer.image} alt={performer.name} className={styles.restPerformerImage} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopPerformers;