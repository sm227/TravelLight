import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const HamburgerButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['position', 'customStyles'].includes(prop),
})<{ position?: string; customStyles?: any }>`
  /* 기본 버튼 스타일 */
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  z-index: 1001;
  transition: background-color 0.2s ease;
  
  /* 위치 설정 */
  ${props => props.position === 'fixed' ? `
    position: fixed;
    top: 20px;
    left: 20px;
  ` : `
    position: relative;
  `}
  
  /* 반응형 */
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    padding: 6px;
    gap: 3px;
    ${props => props.position === 'fixed' ? `
      top: 15px;
      left: 15px;
    ` : ''}
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    padding: 4px;
    gap: 2px;
    ${props => props.position === 'fixed' ? `
      top: 12px;
      left: 12px;
    ` : ''}
  }
  
  /* 호버 효과 */
  &:hover {
    background-color: ${props => props.customStyles?.hoverColor || 'rgba(0, 0, 0, 0.05)'};
  }
  
  /* 포커스 효과 */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.customStyles?.focusColor || 'rgba(0, 123, 255, 0.3)'};
  }
`;

// 🎯 햄버거 라인 컴포넌트 (재사용 가능)
const HamburgerLine = styled.span.withConfig({
  shouldForwardProp: (prop) => !['isOpen', 'isInitialized', 'hasBeenToggled', 'customStyles'].includes(prop),
})<{ isOpen: boolean; isInitialized: boolean; hasBeenToggled: boolean; customStyles?: any }>`
  display: block;
  width: 20px;
  height: 2px;
  background-color: ${props => props.customStyles?.lineColor || '#333'};
  transition: all 0.3s ease;
  transform-origin: center;
  
  @media (max-width: 768px) {
    width: 18px;
    height: 2px;
  }
  
  @media (max-width: 480px) {
    width: 16px;
    height: 1.5px;
  }
  
  /* 🎯 첫 번째 줄 애니메이션 (위 → 중앙 + 45도 회전) */
  &:nth-child(1) {
    animation: ${props => {
      if (!props.isInitialized || !props.hasBeenToggled) return 'none';
      return props.isOpen ? 'hamburger-to-x-top 0.75s forwards' : 'hamburger-from-x-top 0.75s forwards';
    }};
    transform: ${props => !props.isInitialized && props.isOpen ? 'translateY(6px) rotate(45deg)' : 'none'};
    
    @media (max-width: 480px) {
      transform: ${props => !props.isInitialized && props.isOpen ? 'translateY(4px) rotate(45deg)' : 'none'};
    }
  }
  
  /* 🎯 두 번째 줄 (중앙) - 페이드 아웃 */
  &:nth-child(2) {
    opacity: ${props => props.isOpen ? 0 : 1};
    transition: opacity 0.25s ${props => props.isOpen ? '0s' : '0.25s'};
  }
  
  /* 🎯 세 번째 줄 애니메이션 (아래 → 중앙 + -45도 회전) */
  &:nth-child(3) {
    animation: ${props => {
      if (!props.isInitialized || !props.hasBeenToggled) return 'none';
      return props.isOpen ? 'hamburger-to-x-bottom 0.75s forwards' : 'hamburger-from-x-bottom 0.75s forwards';
    }};
    transform: ${props => !props.isInitialized && props.isOpen ? 'translateY(-6px) rotate(-45deg)' : 'none'};
    
    @media (max-width: 480px) {
      transform: ${props => !props.isInitialized && props.isOpen ? 'translateY(-4px) rotate(-45deg)' : 'none'};
    }
  }
  
  /* 🚀 키프레임 애니메이션 정의 */
  @keyframes hamburger-to-x-top {
    0% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(6px) rotate(0); }
    100% { transform: translateY(6px) rotate(45deg); }
  }
  
  @keyframes hamburger-from-x-top {
    0% { transform: translateY(6px) rotate(45deg); }
    50% { transform: translateY(6px) rotate(0); }
    100% { transform: translateY(0) rotate(0); }
  }
  
  @keyframes hamburger-to-x-bottom {
    0% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(-6px) rotate(0); }
    100% { transform: translateY(-6px) rotate(-45deg); }
  }
  
  @keyframes hamburger-from-x-bottom {
    0% { transform: translateY(-6px) rotate(-45deg); }
    50% { transform: translateY(-6px) rotate(0); }
    100% { transform: translateY(0) rotate(0); }
  }
`;

// =============================================
// 🎨 오버레이 메뉴 스타일 & 애니메이션  
// =============================================

const OverlayContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen', 'customStyles'].includes(prop),
})<{ isOpen: boolean; customStyles?: any }>`
  /* 풀스크린 오버레이 */
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: ${props => props.customStyles?.zIndex || 9999};
  display: flex;
  flex-direction: row;
  
  /* 초기 상태 */
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
  
  /* 트랜지션 */
  transition: opacity 0.4s ease, visibility 0.4s ease;
`;

const OverlayBackground = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen', 'customStyles'].includes(prop),
})<{ isOpen: boolean; customStyles?: any }>`
  flex: 1;
  height: 100vh;
  background: ${props => props.customStyles?.backgroundColor || 'rgba(0, 0, 0, 0.10)'};
  backdrop-filter: ${props => props.isOpen ? 'blur(8px)' : 'blur(0px)'};
  cursor: ${props => props.isOpen ? 'pointer' : 'default'};
  transition: backdrop-filter 0.4s ease, background-color 0.4s ease;
`;

const MenuPanel = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen', 'slideDirection', 'customStyles'].includes(prop),
})<{ isOpen: boolean; slideDirection?: string; customStyles?: any }>`
  /* 기본 패널 스타일 */
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background: ${props => props.customStyles?.panelBackground || 'rgba(255,255,255,1)'};
  box-shadow: ${props => props.customStyles?.boxShadow || '-2px 0 16px rgba(0,0,0,0.08)'};
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  padding: ${props => props.customStyles?.padding || '48px 40px'};
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  
  /* 🎯 슬라이드 애니메이션 */
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.4s cubic-bezier(.77,0,.18,1), opacity 0.3s;
  opacity: ${props => props.isOpen ? 1 : 0};
  
  /* 반응형 */
  @media (max-width: 768px) {
    width: 350px;
    padding: 30px;
  }
  
  @media (max-width: 480px) {
    width: 280px;
    padding: 20px;
  }
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

// ❌ 오버레이 내부 X 버튼 (햄버거와 같은 애니메이션)
const CloseButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['customStyles'].includes(prop),
})<{ customStyles?: any }>`
  position: absolute;
  top: ${props => props.customStyles?.closeButtonTop || '15px'};
  right: ${props => props.customStyles?.closeButtonRight || '15px'};
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  transition: background-color 0.2s ease;
  z-index: 1;
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    padding: 6px;
    gap: 3px;
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    padding: 4px;
    gap: 2px;
  }
  
  &:hover {
    background-color: ${props => props.customStyles?.closeButtonHover || 'rgba(0, 0, 0, 0.05)'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.customStyles?.focusColor || 'rgba(0, 123, 255, 0.3)'};
  }
`;

// 🎯 오버레이 내부 X 버튼용 라인 (햄버거와 동일한 애니메이션)
const CloseButtonLine = styled.span.withConfig({
  shouldForwardProp: (prop) => !['isOpen', 'isInitialized', 'hasBeenToggled', 'customStyles'].includes(prop),
})<{ isOpen: boolean; isInitialized: boolean; hasBeenToggled: boolean; customStyles?: any }>`
  display: block;
  width: 20px;
  height: 2px;
  background-color: ${props => props.customStyles?.lineColor || '#666'};
  transition: all 0.3s ease;
  transform-origin: center;
  
  @media (max-width: 768px) {
    width: 18px;
    height: 2px;
  }
  
  @media (max-width: 480px) {
    width: 16px;
    height: 1.5px;
  }
  
  /* 🎯 X 버튼은 항상 X 모양 (isOpen이 true일 때의 상태) */
  &:nth-child(1) {
    animation: ${props => {
      if (!props.isInitialized || !props.hasBeenToggled) return 'none';
      return props.isOpen ? 'close-to-hamburger-top 0.75s forwards' : 'close-from-hamburger-top 0.75s forwards';
    }};
    transform: ${props => !props.isInitialized && !props.isOpen ? 'translateY(6px) rotate(45deg)' : props.isOpen ? 'translateY(0) rotate(0)' : 'translateY(6px) rotate(45deg)'};
    
    @media (max-width: 480px) {
      transform: ${props => !props.isInitialized && !props.isOpen ? 'translateY(4px) rotate(45deg)' : props.isOpen ? 'translateY(0) rotate(0)' : 'translateY(4px) rotate(45deg)'};
    }
  }
  
  &:nth-child(2) {
    opacity: ${props => props.isOpen ? 1 : 0};
    transition: opacity 0.25s ${props => props.isOpen ? '0.25s' : '0s'};
  }
  
  &:nth-child(3) {
    animation: ${props => {
      if (!props.isInitialized || !props.hasBeenToggled) return 'none';
      return props.isOpen ? 'close-to-hamburger-bottom 0.75s forwards' : 'close-from-hamburger-bottom 0.75s forwards';
    }};
    transform: ${props => !props.isInitialized && !props.isOpen ? 'translateY(-6px) rotate(-45deg)' : props.isOpen ? 'translateY(0) rotate(0)' : 'translateY(-6px) rotate(-45deg)'};
    
    @media (max-width: 480px) {
      transform: ${props => !props.isInitialized && !props.isOpen ? 'translateY(-4px) rotate(-45deg)' : props.isOpen ? 'translateY(0) rotate(0)' : 'translateY(-4px) rotate(-45deg)'};
    }
  }
  
  /* X → 햄버거 애니메이션 */
  @keyframes close-to-hamburger-top {
    0% { transform: translateY(6px) rotate(45deg); }
    50% { transform: translateY(6px) rotate(0); }
    100% { transform: translateY(0) rotate(0); }
  }
  
  @keyframes close-from-hamburger-top {
    0% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(6px) rotate(0); }
    100% { transform: translateY(6px) rotate(45deg); }
  }
  
  @keyframes close-to-hamburger-bottom {
    0% { transform: translateY(-6px) rotate(-45deg); }
    50% { transform: translateY(-6px) rotate(0); }
    100% { transform: translateY(0) rotate(0); }
  }
  
  @keyframes close-from-hamburger-bottom {
    0% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(-6px) rotate(0); }
    100% { transform: translateY(-6px) rotate(-45deg); }
  }
`;

const MenuContent = styled.div`
  margin-top: 20px;
  width: 100%;
  max-width: 400px;
  text-align: left;
  display: flex;
  flex-direction: column;
`;

const MenuTitle = styled.h2.withConfig({
  shouldForwardProp: (prop) => !['isOpen', 'customStyles'].includes(prop),
})<{ isOpen: boolean; customStyles?: any }>`
  font-size: ${props => props.customStyles?.titleSize || '28px'};
  font-weight: ${props => props.customStyles?.titleWeight || '700'};
  color: ${props => props.customStyles?.titleColor || '#1a1a1a'};
  margin: 0 0 30px 0;
  text-align: ${props => props.customStyles?.titleAlign || 'left'};
  
  /* 🎯 타이틀 등장 애니메이션 */
  opacity: ${props => props.isOpen ? 1 : 0};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(20px)'};
  transition: opacity 0.4s 0.1s ease, transform 0.4s 0.1s ease;
  
  @media (max-width: 768px) {
    font-size: ${props => props.customStyles?.mobileTitleSize || '24px'};
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: ${props => props.customStyles?.mobileTitleSize || '20px'};
    margin-bottom: 15px;
  }
`;

const MenuItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen', 'delay', 'customStyles', 'itemType'].includes(prop),
})<{ isOpen: boolean; delay: number; customStyles?: any; itemType?: 'main' | 'sub' | 'spacer' }>`
  /* 기본 스타일 - 타입에 따라 다르게 적용 */
  font-size: ${props => props.itemType === 'sub' ? (props.customStyles?.subItemSize || '18px') : (props.itemType === 'spacer' ? '0' : (props.customStyles?.itemSize || '26px'))};
  font-weight: ${props => props.itemType === 'sub' ? (props.customStyles?.subItemWeight || 400) : (props.itemType === 'spacer' ? '0' : (props.customStyles?.itemWeight || 600))};
  color: ${props => props.customStyles?.itemColor || '#2c3e50'};
  margin: ${props => {
    if (props.itemType === 'sub') {
      return props.customStyles?.subItemMargin || '18px 0 18px 20px';
    } else if (props.itemType === 'spacer') {
      return '0';
    }
    return props.customStyles?.margin || '24px 0';
  }};
  cursor: pointer;
  position: relative;
  width: fit-content;
  line-height: 1.4;
  letter-spacing: ${props => props.itemType === 'sub' ? '0.3px' : '0.5px'};
  
  /* 🎯 순차 등장 애니메이션 */
  opacity: ${props => props.isOpen ? 1 : 0};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(30px)'};
  transition: opacity 0.4s ${props => props.delay}s ease, 
              transform 0.4s ${props => props.delay}s ease,
              color 0.3s ease;
  
  /* 호버 효과 */
  &:hover {
    color: ${props => props.customStyles?.itemHoverColor || '#3498db'};
    transform: ${props => props.isOpen ? 'translateY(-2px)' : 'translateY(30px)'};
  }
  
  /* 언더라인 애니메이션 */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: ${props => props.customStyles?.underlineHeight || '2px'};
    background: ${props => props.customStyles?.underlineColor || '#3498db'};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
  
  /* 서브 메뉴에 작은 점 표시 */
  ${props => props.itemType === 'sub' && `
    &::before {
      content: '•';
      position: absolute;
      left: -15px;
      color: #3498db;
      font-size: 16px;
      opacity: 0.7;
    }
  `}
  
  @media (max-width: 768px) {
    font-size: ${props => props.itemType === 'sub' ? '16px' : (props.itemType === 'spacer' ? '0' : '22px')};
    margin: ${props => {
      if (props.itemType === 'sub') {
        return '16px 0 16px 18px';
      } else if (props.itemType === 'spacer') {
        return '0';
      }
      return '20px 0';
    }};
  }
  
  @media (max-width: 480px) {
    font-size: ${props => props.itemType === 'sub' ? '14px' : (props.itemType === 'spacer' ? '0' : '18px')};
    margin: ${props => {
      if (props.itemType === 'sub') {
        return '14px 0 14px 16px';
      } else if (props.itemType === 'spacer') {
        return '0';
      }
      return '18px 0';
    }};
  }
`;

const SpacerDiv = styled.div`
  height: 24px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 40px;
    height: 1px;
    background: linear-gradient(to right, #3498db, transparent);
    opacity: 0.3;
  }
`;

// =============================================
// 🚀 메인 컴포넌트
// =============================================

interface MenuItemType {
  id?: string;
  key?: string;
  label?: string;
  text?: string;
  name?: string;
  title?: string;
  onClick?: () => void;
  href?: string;
  type?: 'main' | 'sub' | 'spacer'; // 메인 메뉴, 서브 메뉴, 공간 구분자
}

interface CompleteHamburgerOverlayMenuProps {
  // 필수 props
  menuItems?: MenuItemType[];
  
  // 기본 설정
  title?: string;
  slideDirection?: string;
  buttonPosition?: string;
  showCloseButton?: boolean;
  
  // 이벤트 핸들러
  onMenuItemClick?: (item: MenuItemType, index: number) => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  
  // 스타일 커스터마이징
  customStyles?: any;
  
  // 추가 props
  className?: string;
  id?: string;
  ariaLabel?: string;
}

const CompleteHamburgerOverlayMenu: React.FC<CompleteHamburgerOverlayMenuProps> = ({
  // 필수 props
  menuItems = [],
  
  // 기본 설정
  title = "Menu",
  slideDirection = "right",
  buttonPosition = "relative",
  showCloseButton = true,
  
  // 이벤트 핸들러
  onMenuItemClick = () => {},
  onMenuOpen = () => {},
  onMenuClose = () => {},
  
  // 스타일 커스터마이징
  customStyles = {},
  
  // 추가 props
  className = "",
  id = "",
  ariaLabel = "Menu"
}) => {
  // 🎯 상태 관리
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasBeenToggled, setHasBeenToggled] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // 🎯 컴포넌트 마운트 후 애니메이션 활성화
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 🎯 스크롤 제어
  useEffect(() => {
    if (isOpen) {
      // 현재 스크롤 위치 저장
      setScrollPosition(window.pageYOffset);
      
      // body 스크롤 차단
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.pageYOffset}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // 스크롤 위치 복원
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollPosition);
    }
    
    // 컴포넌트 언마운트 시 복원
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen, scrollPosition]);

  // 🎯 이벤트 핸들러
  const handleToggle = () => {
    setHasBeenToggled(true);
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState) {
      onMenuOpen();
    } else {
      onMenuClose();
    }
  };

  const handleClose = () => {
    setHasBeenToggled(true);
    setIsOpen(false);
    onMenuClose();
  };

  const handleMenuItemClick = (item: MenuItemType, index: number) => {
    handleClose();
    setTimeout(() => {
      onMenuItemClick(item, index);
    }, 150); // 메뉴 닫기 애니메이션 후 실행
  };

  const handleBackgroundClick = () => {
    handleClose();
  };

  // 🎯 키보드 이벤트
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* 🍔 햄버거 버튼 */}
      <HamburgerButton
        onClick={handleToggle}
        position={buttonPosition}
        customStyles={customStyles.button}
        className={className}
        id={id}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <HamburgerLine 
          isOpen={isOpen}
          isInitialized={isInitialized}
          hasBeenToggled={hasBeenToggled}
          customStyles={customStyles.button}
        />
        <HamburgerLine 
          isOpen={isOpen}
          isInitialized={isInitialized}
          hasBeenToggled={hasBeenToggled}
          customStyles={customStyles.button}
        />
        <HamburgerLine 
          isOpen={isOpen}
          isInitialized={isInitialized}
          hasBeenToggled={hasBeenToggled}
          customStyles={customStyles.button}
        />
      </HamburgerButton>

      {/* 🎨 오버레이 메뉴 */}
      <OverlayContainer 
        isOpen={isOpen}
        customStyles={customStyles.overlay}
        aria-hidden={!isOpen}
      >
        <OverlayBackground 
          isOpen={isOpen}
          customStyles={customStyles.overlay}
          onClick={handleBackgroundClick}
        />
        
        <MenuPanel
          isOpen={isOpen}
          slideDirection={slideDirection}
          customStyles={customStyles.panel}
          role="dialog"
          aria-labelledby="menu-title"
        >
          {/* ❌ 오버레이 내부 X 버튼 (햄버거와 같은 애니메이션) */}
          {showCloseButton && (
            <CloseButton
              onClick={handleClose}
              customStyles={customStyles.closeButton}
              aria-label="Close menu"
            >
              <CloseButtonLine 
                isOpen={!isOpen} // X 버튼은 반대 로직 (메뉴 열림=X, 메뉴 닫힘=햄버거)
                isInitialized={isInitialized}
                hasBeenToggled={hasBeenToggled}
                customStyles={customStyles.closeButton}
              />
              <CloseButtonLine 
                isOpen={!isOpen}
                isInitialized={isInitialized}
                hasBeenToggled={hasBeenToggled}
                customStyles={customStyles.closeButton}
              />
              <CloseButtonLine 
                isOpen={!isOpen}
                isInitialized={isInitialized}
                hasBeenToggled={hasBeenToggled}
                customStyles={customStyles.closeButton}
              />
            </CloseButton>
          )}
          
          <MenuContent>
            {/* 📝 메뉴 제목 */}
            {title && (
              <MenuTitle
                id="menu-title"
                isOpen={isOpen}
                customStyles={customStyles.title}
              >
                {title}
              </MenuTitle>
            )}
            
            {/* 📋 메뉴 아이템들 */}
            {menuItems.map((item, index) => (
              item.type === 'spacer' ? (
                <SpacerDiv key={item.key || `spacer-${index}`} />
              ) : (
                <MenuItem
                  key={item.id || item.key || index}
                  isOpen={isOpen}
                  delay={0.2 + index * 0.05} // 순차 등장
                  customStyles={customStyles.menuItem}
                  itemType={item.type || 'main'} // 타입 전달
                  onClick={() => handleMenuItemClick(item, index)}
                  role="menuitem"
                  tabIndex={isOpen ? 0 : -1}
                >
                  {item.label || item.text || item.name || item.title}
                </MenuItem>
              )
            ))}
          </MenuContent>
        </MenuPanel>
      </OverlayContainer>
    </>
  );
};

export default CompleteHamburgerOverlayMenu; 