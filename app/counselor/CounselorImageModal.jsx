// /app/counselor/CounselorImageModal.jsx (또는 /components/CounselorImageModal.jsx)
"use client";

import Image from 'next/image';
import styles from './CounselorImageModal.module.css'; // 경로 주의

export default function CounselorImageModal({ isOpen, onClose, mainImageSrc, additionalImages = [], counselorName }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}> {/* 오버레이 클릭 시 닫기 */}
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}> {/* 모달 내용 클릭 시 전파 방지 */}
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        
        <div className={styles.mainImageWrapper}>
          {mainImageSrc ? (
            <Image
              src={mainImageSrc}
              alt={`${counselorName || 'Counselor'} main image`}
              width={500} // 표시될 이미지의 적절한 최대 너비
              height={400} // 표시될 이미지의 적절한 최대 높이
              className={styles.mainImage}
              priority // 모달이 열릴 때 중요한 이미지이므로 priority 설정
            />
          ) : (
            <p>이미지를 불러올 수 없습니다.</p>
          )}
        </div>

        {additionalImages.length > 0 && (
          <div className={styles.additionalImagesContainer}>
            {additionalImages.map((imgSrc, index) => (
              <div key={index} className={styles.additionalImageWrapper}>
                <Image
                  src={imgSrc}
                  alt={`${counselorName || 'Counselor'} additional image ${index + 1}`}
                  width={100}
                  height={100}
                  className={styles.additionalImage}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}