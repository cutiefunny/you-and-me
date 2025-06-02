// components/ImageSlider.jsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import styles from './ImageSlider.module.css';

const defaultProps = {
  images: [],
  // sliderHeight: '300px', // 이 prop 대신 aspectRatio 사용 또는 유지
  aspectRatio: '400 / 250', // 기본 종횡비 설정 (가로 / 세로)
  autoPlayDefault: true,
  autoPlayDelay: 3000,
  showNavigation: true,
  showPagination: true,
  loop: true,
  effect: 'slide',
};

export default function ImageSlider(props) {
  const {
    images,
    // sliderHeight, // aspectRatio를 사용하므로 주석 처리 또는 선택적 prop으로 변경
    aspectRatio, // 새로운 prop
    autoPlayDefault,
    autoPlayDelay,
    showNavigation,
    showPagination,
    loop,
    effect,
  } = { ...defaultProps, ...props };

  const processedImages = images.map((img, index) =>
    typeof img === 'string' ? { src: img, alt: `Slide ${index + 1}` } : img
  );

  const validImages = processedImages.filter(
    (image) => image && image.src && typeof image.src === 'string' && image.src.trim() !== ''
  );

  // aspectRatio prop을 CSS 변수로 전달하거나 직접 스타일에 적용
  const sliderStyle = {
    // height: sliderHeight, // aspectRatio 사용 시 height는 자동으로 조절됨
    aspectRatio: aspectRatio, // CSS aspect-ratio 속성 사용
  };

  if (!validImages || validImages.length === 0) {
    return <div style={{ ...sliderStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>이미지가 없습니다.</div>;
  }

  return (
    // sliderStyle을 swiperContainer에 적용
    <div className={styles.swiperContainer} style={sliderStyle}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={showNavigation}
        pagination={showPagination ? { clickable: true } : false}
        loop={loop && validImages.length > 1}
        autoplay={
          autoPlayDefault && validImages.length > 1
            ? { delay: autoPlayDelay, disableOnInteraction: false }
            : false
        }
        effect={effect}
        className={styles.mySwiper}
      >
        {validImages.map((image, index) => (
          <SwiperSlide key={image.id || index} className={styles.swiperSlide}>
            {image.link ? (
              <a href={image.link} target="_blank" rel="noopener noreferrer" className={styles.slideLink}>
                <Image
                  src={image.src}
                  alt={image.alt || `Slide ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }} // 또는 'contain'
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 33vw"
                  priority={index < 2}
                />
              </a>
            ) : (
              <Image
                src={image.src}
                alt={image.alt || `Slide ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }} // 또는 'contain'
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 33vw"
                priority={index < 2}
              />
            )}
            {image.caption && <div className={styles.caption}>{image.caption}</div>}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}