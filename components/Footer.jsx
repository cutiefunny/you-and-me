// components/Footer.js
import styles from './Footer.module.css'; // CSS 모듈 경로 확인

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} 너랑나 YOU&ME (예시). All rights reserved.</p>
      <p>본 사이트는 실제 서비스가 아닌 프로토타입으로 제작되었습니다.</p>
    </footer>
  );
}