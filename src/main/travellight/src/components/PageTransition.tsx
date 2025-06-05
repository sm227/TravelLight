import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { 
  FlightTakeoff, 
  Luggage, 
  Security, 
  CheckCircle,
  LocationOn 
} from '@mui/icons-material';

// 페이지 전환 애니메이션 (CodePen 스타일 참고) - 속도 증가
const animateTransition = keyframes`
  0% {
    transform: scale(1, 1);
  }
  10% {
    transform: scale(1, 0.002);
  }
  35% {
    transform: scale(0.2, 0.002);
    opacity: 1;
  }
  50% {
    transform: scale(0.2, 0.002);
    opacity: 0;
  }
  85% {
    transform: scale(1, 0.002);
    opacity: 1;
  }
  100% {
    transform: scale(1, 1);
  }
`;

// 텍스트 페이드인 애니메이션 - 속도 증가
const fadeInText = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 아이콘 플로팅 애니메이션 - 속도 증가
const floatIcon = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(3deg);
  }
`;

// 전환 애니메이션 컨테이너
const TransitionContainer = styled(Box)<{ animate: boolean }>(({ theme, animate }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  opacity: 1,
  ...(animate && {
    animation: `${animateTransition} 2s ease`, // 3s → 2s로 단축
  }),
}));

// 메시지 텍스트 스타일
const MessageText = styled(Typography)<{ show: boolean }>(({ show }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: '2rem',
  letterSpacing: '0.1em',
  opacity: show ? 1 : 0,
  animation: show ? `${fadeInText} 0.8s ease 0.3s forwards` : 'none', // 1s → 0.8s, delay 0.5s → 0.3s
  animationFillMode: 'both',
  textShadow: '0 4px 20px rgba(0,0,0,0.3)',
  
  '@media (max-width: 768px)': {
    fontSize: '2rem',
  },
  
  '@media (max-width: 480px)': {
    fontSize: '1.5rem',
  },
}));

// 서브 메시지 스타일
const SubMessageText = styled(Typography)<{ show: boolean }>(({ show }) => ({
  fontSize: '1.2rem',
  fontWeight: 400,
  textAlign: 'center',
  marginBottom: '3rem',
  opacity: show ? 1 : 0,
  animation: show ? `${fadeInText} 0.8s ease 0.6s forwards` : 'none', // 1s → 0.8s, delay 1s → 0.6s
  animationFillMode: 'both',
  color: '#f0fff4',
  
  '@media (max-width: 768px)': {
    fontSize: '1rem',
  },
  
  '@media (max-width: 480px)': {
    fontSize: '0.9rem',
  },
}));

// 아이콘 스타일 - Material-UI 아이콘용
const TravelIcon = styled(Box)<{ show: boolean; delay: number }>(({ show, delay }) => ({
  fontSize: '4rem',
  opacity: show ? 1 : 0,
  animation: show ? `${fadeInText} 0.6s ease ${delay}s forwards, ${floatIcon} 2s ease-in-out infinite ${delay + 0.6}s` : 'none', // 애니메이션 속도 증가
  animationFillMode: 'both',
  filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
  '& .MuiSvgIcon-root': {
    fontSize: '4rem',
    color: 'white',
    
    '@media (max-width: 768px)': {
      fontSize: '3rem',
    },
    
    '@media (max-width: 480px)': {
      fontSize: '2.5rem',
    },
  },
  
  '@media (max-width: 768px)': {
    fontSize: '3rem',
  },
  
  '@media (max-width: 480px)': {
    fontSize: '2.5rem',
  },
}));

const IconsContainer = styled(Box)({
  display: 'flex',
  gap: '2rem',
  marginBottom: '2rem',
  
  '@media (max-width: 480px)': {
    gap: '1rem',
  },
});

interface PageTransitionProps {
  show: boolean;
  onComplete: () => void;
}

const PageTransition: React.FC<PageTransitionProps> = ({ show, onComplete }) => {
  const [showContent, setShowContent] = React.useState(false);
  const [animateContainer, setAnimateContainer] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      setAnimateContainer(true);
      
      // 콘텐츠 표시 타이밍
      const contentTimer = setTimeout(() => {
        setShowContent(true);
      }, 100);

      // 전체 애니메이션 완료 후 콜백 호출 - 시간 단축
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 3000); // 4초 → 3초로 단축

      return () => {
        clearTimeout(contentTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <TransitionContainer animate={animateContainer}>
      <IconsContainer>
        <TravelIcon show={showContent} delay={0.2}>
          <FlightTakeoff />
        </TravelIcon>
        <TravelIcon show={showContent} delay={0.3}>
          <Luggage />
        </TravelIcon>
        <TravelIcon show={showContent} delay={0.4}>
          <Security />
        </TravelIcon>
      </IconsContainer>
      
      <MessageText show={showContent}>
        Have a Good Trip!
      </MessageText>
      
      <SubMessageText show={showContent}>
        TravelLight와 함께 안전한 여행을 시작하세요
      </SubMessageText>
      
      <TravelIcon show={showContent} delay={0.8}>
        <CheckCircle />
      </TravelIcon>
    </TransitionContainer>
  );
};

export default PageTransition; 