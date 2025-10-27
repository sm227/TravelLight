import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Rating,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTranslation } from 'react-i18next';

// 애니메이션 정의
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// 타입 정의
interface TestimonialData {
  id: number;
  name: string;
  rating: number;
  comment: string;
  photo?: string;
  location?: string;
  date?: string;
}

// 스타일 컴포넌트
const TestimonialCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 16,
  border: '1px solid #F1F5F9',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  background: '#FFFFFF',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: '0 8px 16px -3px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-4px)',
  },
}));

const NavigationButton = styled(IconButton)(() => ({
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  width: 48,
  height: 48,
  '&:hover': {
    background: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  '&:disabled': {
    opacity: 0.4,
    background: '#F8FAFC',
  },
}));

const IndicatorDot = styled(Box)<{ active?: boolean }>(({ theme, active }) => ({
  width: active ? 24 : 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: active ? theme.palette.primary.main : '#CBD5E1',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.main : '#94A3B8',
  },
}));

const Services: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // 상태 관리
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Mock 데이터
  const testimonials: TestimonialData[] = [
    {
      id: 1,
      name: '함*민',
      rating: 5,
      comment: '여행 중 짐 때문에 고생했는데 TravelLight 덕분에 정말 편하게 여행했어요! 직원분들도 친절하시고 보관 시설도 깨끗해서 안심하고 맡길 수 있었습니다.',
      location: '서울 강남구',
      date: '2025-10-15',
    },
    {
      id: 2,
      name: '김*훈',
      rating: 5,
      comment: '역 근처 편의점에서 짐을 맡겼는데 직원분이 정말 친절하셨어요. 제휴 매장이 많아서 찾기도 쉽고, 보관료도 합리적이었습니다!',
      location: '부산 해운대구',
      date: '2025-10-12',
    },
    {
      id: 3,
      name: 'Park n***',
      rating: 5,
      comment: 'Amazing service! I was able to explore Seoul without carrying heavy luggage. The staff was very helpful and the location was convenient.',
      location: 'Seoul, Korea',
      date: '2025-10-10',
    },
    {
      id: 4,
      name: '한*민',
      rating: 5,
      comment: '제주도 여행 중 호텔 체크아웃 후 짐배송 서비스 이용했는데 정말 편했어요. 공항에서 바로 찾을 수 있어서 시간도 절약되고 좋았습니다!',
      location: '제주시',
      date: '2025-10-08',
    },
    {
      id: 5,
      name: '김*훈',
      rating: 4,
      comment: '처음 이용해봤는데 생각보다 훨씬 편리하네요. 가격도 합리적이고 보험도 되어있어서 안심하고 맡겼습니다. 다음에도 꼭 이용할게요!',
      location: '인천 중구',
      date: '2025-10-05',
    },
    {
      id: 6,
      name: 'Sangwoo Y***',
      rating: 5,
      comment: '日本から来ましたが、本当に便利でした！ The app was easy to use and I could store my luggage safely. Highly recommend!',
      location: 'Tokyo, Japan',
      date: '2025-10-03',
    },
  ];

  // 한 번에 보여줄 카드 수 결정
  const getCardsPerView = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  const cardsPerView = getCardsPerView();
  const maxIndex = Math.max(0, testimonials.length - cardsPerView);

  // 다음 슬라이드
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  // 이전 슬라이드
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // 특정 슬라이드로 이동
  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  // 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000); // 5초마다 전환

    return () => clearInterval(interval);
  }, [isAutoPlay, handleNext]);

  // 자동 재생 토글
  const toggleAutoPlay = () => {
    setIsAutoPlay((prev) => !prev);
  };

  // 표시할 리뷰 가져오기
  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + cardsPerView
  );

  return (
    <Box
      id="testimonials"
      sx={{
        py: { xs: 8, md: 12 },
        background: '#F8FAFC',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 장식 */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: '300px',
          height: '300px',
          background:
            'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '5%',
          width: '250px',
          height: '250px',
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.04) 0%, rgba(59, 130, 246, 0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* 헤더 섹션 */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 6, md: 8 },
            animation: `${fadeIn} 0.8s ease-out`,
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#0F172A',
              mb: 2,
              letterSpacing: '-0.01em',
            }}
          >
            {t('customerTestimonials')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#64748B',
              maxWidth: '700px',
              mx: 'auto',
              fontSize: '1.1rem',
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            {t('customerTestimonialsDescription')}
          </Typography>
        </Box>

        {/* 캐러셀 컨트롤 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <NavigationButton onClick={handlePrev} disabled={currentIndex === 0}>
              <ArrowBackIosNewIcon sx={{ fontSize: 20 }} />
            </NavigationButton>
            <NavigationButton onClick={handleNext} disabled={currentIndex >= maxIndex}>
              <ArrowForwardIosIcon sx={{ fontSize: 20 }} />
            </NavigationButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* 인디케이터 */}
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <IndicatorDot
                  key={index}
                  active={currentIndex === index}
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </Box>

            {/* 자동 재생 버튼 */}
            <IconButton
              onClick={toggleAutoPlay}
              sx={{
                width: 40,
                height: 40,
                border: '1px solid #E2E8F0',
                background: isAutoPlay ? alpha(theme.palette.primary.main, 0.1) : '#FFFFFF',
              }}
            >
              {isAutoPlay ? (
                <PauseIcon sx={{ fontSize: 20 }} />
              ) : (
                <PlayArrowIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Box>
        </Box>

        {/* 리뷰 카드 그리드 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
            minHeight: '380px',
            animation: `${slideIn} 0.5s ease-out`,
          }}
        >
          {visibleTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id}>
              {/* 별점 */}
              <Box sx={{ mb: 2 }}>
                <Rating
                  value={testimonial.rating}
                  readOnly
                  sx={{
                    '& .MuiRating-icon': {
                      fontSize: '1.5rem',
                    },
                  }}
                />
              </Box>

              {/* 리뷰 내용 */}
              <Typography
                variant="body1"
                sx={{
                  color: '#475569',
                  lineHeight: 1.7,
                  fontSize: '0.95rem',
                  mb: 3,
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                "{testimonial.comment}"
              </Typography>

              {/* 사용자 정보 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                  }}
                >
                  {testimonial.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: '#1E293B',
                      fontSize: '1rem',
                    }}
                  >
                    {testimonial.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748B',
                      fontSize: '0.85rem',
                    }}
                  >
                    {testimonial.location}
                  </Typography>
                </Box>
              </Box>
            </TestimonialCard>
          ))}
        </Box>

        {/* 하단 설명 */}
        <Box
          sx={{
            textAlign: 'center',
            mt: 6,
            pt: 4,
            borderTop: '1px solid #E2E8F0',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#94A3B8',
              fontSize: '0.9rem',
            }}
          >
            {t('testimonialsFooter')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Services;
