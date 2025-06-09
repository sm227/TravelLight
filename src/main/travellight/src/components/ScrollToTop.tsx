import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 페이지 변경 시 스크롤을 맨 위로 이동
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 즉시 이동 (애니메이션 없음)
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop; 