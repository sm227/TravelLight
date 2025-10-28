import { useEffect, useState, useCallback, useRef } from "react";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../MapButton.css";
import "../NaverMarker.css"; // 새로 만든 CSS 파일 추가
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Stack,
  Chip,
  IconButton,
  Menu,
  Divider,
  Typography,
  Modal,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { ko } from "date-fns/locale";
import { useAuth } from "../services/AuthContext";
import axios from "axios";
import { useTranslation } from "react-i18next";
import PortOne from "@portone/browser-sdk/v2";
import { useLocation, useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsIcon from "@mui/icons-material/Directions";
import PhoneIcon from "@mui/icons-material/Phone";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LuggageIcon from "@mui/icons-material/Luggage";
import SecurityIcon from "@mui/icons-material/Security";
import ShieldIcon from "@mui/icons-material/Shield";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StorefrontIcon from '@mui/icons-material/Storefront';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import TranslateIcon from "@mui/icons-material/Translate";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LanguageIcon from "@mui/icons-material/Language";
import MenuIcon from "@mui/icons-material/Menu";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getMyReservations, cancelReservation, cancelPayment } from '../services/reservationService';
import { ReservationDto } from '../types/reservation';
import ReviewsList from '../components/reviews/ReviewsList';
import ReviewForm from '../components/reviews/ReviewForm';
import { reviewService, Partnership, partnershipService, DeliveryRequest, DeliveryResponse } from '../services/api';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CouponSelectModal from '../components/CouponSelectModal';
import { UserCoupon } from '../services/couponService';

declare global {
  interface Window {
    naver: any;
    KAKAO_REST_API_KEY?: string;
  }
}

interface NaverLatLng {
  lat(): number;
  lng(): number;
}

interface NaverMap {
  setCenter(position: any): void;
  panTo(position: any): void;
  getCenter(): NaverLatLng;
  setZoom(level: number): void;
  getZoom(): number; // getZoom 메서드 추가
}

// 비즈니스 시간 타입 정의
interface BusinessHourDto {
  enabled: boolean;
  open: string;
  close: string;
}

// 배달 관련 상수
const deliverySteps = ['배달 방식 선택', '배달 정보 입력', '정보 확인 및 신청'];

// 배달 상태 정보와 스텝 추가
const deliveryStatusSteps = [
  { status: 'PENDING', label: '배송접수' },
  { status: 'ACCEPTED', label: '배송준비' },
  { status: 'PICKED_UP', label: '배송중' },
  { status: 'DELIVERED', label: '배송완료' }
];

//영문 지도 변환
const Map = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();

  const mapRef = useRef<HTMLDivElement>(null);
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isMapMoved, setIsMapMoved] = useState(false);
  const [mapInstance, setMapInstance] = useState<NaverMap | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 사이드바는 항상 열려있음
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [partnershipMarkers, setPartnershipMarkers] = useState<any[]>([]);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationStep, setReservationStep] = useState<'bag-selection' | 'datetime-selection'>('bag-selection'); // 예약 단계 상태 추가
  const [bagSizes, setBagSizes] = useState({
    small: 0,
    medium: 0,
    large: 0,
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // 쿠폰 관련 상태
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isCouponApplying, setIsCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // 검색 결과 영역 표시 여부 결정
  const shouldShowResultArea = () => {
    return selectedPlace !== null || searchResults.length > 0 || isReservationOpen || isPaymentOpen || isPaymentComplete || showReservations || selectedReservation;
  };

  // 포트원 결제 관련 상태
  const [portonePaymentId, setPortonePaymentId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "portone" | "paypal">(
    "portone"
  ); // 기본값을 포트원으로 설정
  const [storageDuration, setStorageDuration] = useState("day");

  // 초기 날짜와 시간 설정 함수 (30분 단위)
  const getInitialDateTime = () => {
    const now = new Date();
    const todayDate = now.toISOString().split('T')[0]; // YYYY-MM-DD 형식

    // 현재 시간 + 1시간을 시작 시간으로, 30분 단위로 반올림
    const startTime = new Date(now.getTime() + 60 * 60 * 1000);
    const startMinutes = startTime.getMinutes();
    const roundedStartMinutes = startMinutes < 30 ? 0 : 30;
    startTime.setMinutes(roundedStartMinutes);
    startTime.setSeconds(0);

    const startHour = startTime.getHours().toString().padStart(2, '0');
    const startMinute = roundedStartMinutes.toString().padStart(2, '0');
    const startTimeStr = `${startHour}:${startMinute}`;

    // 시작 시간 + 1시간을 종료 시간으로 (30분 단위 유지)
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const endHour = endTime.getHours().toString().padStart(2, '0');
    const endMinute = endTime.getMinutes().toString().padStart(2, '0');
    const endTimeStr = `${endHour}:${endMinute}`;

    return {
      date: todayDate,
      startTime: startTimeStr,
      endTime: endTimeStr
    };
  };

  const initialDateTime = getInitialDateTime();
  const [storageDate, setStorageDate] = useState(initialDateTime.date);
  const [storageStartTime, setStorageStartTime] = useState(initialDateTime.startTime);
  const [storageEndTime, setStorageEndTime] = useState(initialDateTime.endTime);
  // 시간 유효성 상태 추가
  const [isTimeValid, setIsTimeValid] = useState(true);
  // 종료 날짜 상태 추가
  const [storageEndDate, setStorageEndDate] = useState("");

  // 리뷰 탭 상태
  const [selectedTab, setSelectedTab] = useState<'info' | 'reviews'>('info');

  // 예약 관련 상태
  const [reservationError, setReservationError] = useState("");
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [submittedReservation, setSubmittedReservation] = useState<{
    id?: number;
    userId?: number;
    userEmail?: string;
    userName?: string;
    placeName?: string;
    placeAddress?: string;
    reservationNumber?: string;
    storageDate?: string;
    storageEndDate?: string | null;
    storageStartTime?: string;
    storageEndTime?: string;
    smallBags?: number;
    mediumBags?: number;
    largeBags?: number;
    totalPrice?: number;
    storageType?: string;
    status?: string;
  } | null>(null);

  // 제휴점 데이터 상태 추가
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [partnershipOverlays, setPartnershipOverlays] = useState<any[]>([]);
  const [realTimeCapacity, setRealTimeCapacity] = useState<{
    small: number;
    medium: number;
    large: number;
  }>({ small: 0, medium: 0, large: 0 });

  // 예약 목록 관련 상태
  const [showReservations, setShowReservations] = useState(false);
  const [myReservations, setMyReservations] = useState<ReservationDto[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationDto | null>(null);


  // 보관 상태 관련 상태
  const [storageStatuses, setStorageStatuses] = useState<{[key: string]: any}>({});
  
  // 예약 취소 관련 상태
  const [cancellingReservation, setCancellingReservation] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string>('');
  const [cancelSuccess, setCancelSuccess] = useState<string>('');

  // 쿠폰 성공 메시지 상태
  const [couponSuccess, setCouponSuccess] = useState<string>('');

  // 리뷰 관련 상태
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [selectedReservationForReview, setSelectedReservationForReview] = useState<ReservationDto | null>(null);
  const [reviewStatuses, setReviewStatuses] = useState<{[key: number]: boolean}>({});
  const [reviewStats, setReviewStats] = useState<{averageRating: number, totalReviews: number}>({
    averageRating: 0,
    totalReviews: 0
  });
  const [editingReview, setEditingReview] = useState<any>(null);

  // 배달 관련 상태
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState('');
  const [currentReservationForDelivery, setCurrentReservationForDelivery] = useState<ReservationDto | null>(null);
  const [customAddress, setCustomAddress] = useState('');
  const [deliveryStep, setDeliveryStep] = useState(0);
  
  // 제휴 매장 관련 상태
  const [partnerStores, setPartnerStores] = useState<Partnership[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partnership | null>(null);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);

  // 검색 관련 상태
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [partnerSearchResults, setPartnerSearchResults] = useState<Partnership[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 배달 상태 정보 추가
  const [deliveries, setDeliveries] = useState<DeliveryResponse[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  // 사용자 메뉴 및 언어 메뉴 상태
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langMenuAnchorEl, setLangMenuAnchorEl] = useState<null | HTMLElement>(null);

  // 메뉴 처리 함수들
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchorEl(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangMenuAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    localStorage.setItem('preferredLanguage', lng);
    handleLangMenuClose();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // 보관 상태 렌더링 함수
  const renderStorageStatus = (reservation: ReservationDto) => {
    const storageStatus = storageStatuses[reservation.reservationNumber];

    if (!storageStatus) {
      return null; // 로딩 중이거나 보관 정보가 없음
    }

    if (!storageStatus.hasStorage) {
      return (
        <Box sx={{
          px: 1.5,
          py: 1,
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e9ecef'
        }}>
          <Typography variant="body2" color="textSecondary">
            {t('visitStoreForStorage')}
          </Typography>
        </Box>
      );
    }

    const status = storageStatus.status;
    const checkInTime = storageStatus.checkInTime;
    const storageCode = storageStatus.storageCode;

    if (status === 'STORED') {
      return (
        <Box sx={{
          px: 1.5,
          py: 1,
          backgroundColor: '#e8f5e8',
          borderTop: '1px solid #c8e6c9'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                {t('storingLuggage')}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t('checkedIn')}: {new Date(checkInTime).toLocaleString('ko-KR')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<QrCodeIcon />}
                label="QR Code"
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<PhotoCameraIcon />}
                label={t('photo')}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#666' }}>
            {t('checkOutCode')}: {storageCode}
          </Typography>
        </Box>
      );
    }

    if (status === 'RETRIEVED') {
      return (
        <Box sx={{
          px: 1.5,
          py: 1,
          backgroundColor: '#f3e5f5',
          borderTop: '1px solid #ce93d8'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
            <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
            {t('utilizationComplete')}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {t('checkOut')}: {storageStatus.checkOutTime ? new Date(storageStatus.checkOutTime).toLocaleString('ko-KR') : t('processed')}
          </Typography>
        </Box>
      );
    }

    return null;
  };

  // 보관 상태 조회 함수
  const fetchStorageStatus = async (reservationNumber: string) => {
    try {
      const response = await axios.get(`/api/reservations/${reservationNumber}/storage-status`);
      if (response.data?.success && response.data?.data) {
        setStorageStatuses(prev => ({
          ...prev,
          [reservationNumber]: response.data.data
        }));
      }
    } catch (error) {
      console.error('보관 상태 조회 실패:', error);
      // 실패해도 에러를 표시하지 않고 조용히 처리
    }
  };

  // 예약 목록 관련 함수들
  const fetchMyReservations = async () => {
    if (!user?.id) return;
    
    setLoadingReservations(true);
    try {
      const reservations = await getMyReservations(user.id);
      // 예약 상태를 체크하고 업데이트 (백엔드 API 호출)
      const updatedReservations = await checkAndUpdateReservationStatus(reservations);
      // 최신 예약을 맨 위로 정렬 (ID 기준 내림차순 - 더 높은 ID가 최신)
      const sortedReservations = updatedReservations.sort((a, b) => b.id - a.id);
      setMyReservations(sortedReservations);

      // 각 예약의 보관 상태 조회
      sortedReservations.forEach(reservation => {
        if (reservation.reservationNumber) {
          fetchStorageStatus(reservation.reservationNumber);
        }
      });

      // 각 예약에 대한 배달 정보 조회
      const deliveryPromises = updatedReservations.map(reservation => 
        fetchDeliveryStatus(reservation.id)
      );
      
      const deliveryResults = await Promise.all(deliveryPromises);
      setDeliveries(deliveryResults.flat());

      // 각 예약의 리뷰 상태 확인
      const reviewPromises = updatedReservations.map(async (reservation) => {
        const hasReview = await checkReviewStatus(reservation.id);
        return { reservationId: reservation.id, hasReview };
      });
      
      const reviewResults = await Promise.all(reviewPromises);
      const reviewStatusMap = reviewResults.reduce((acc, { reservationId, hasReview }) => {
        acc[reservationId] = hasReview;
        return acc;
      }, {} as {[key: number]: boolean});
      
      setReviewStatuses(reviewStatusMap);
    } catch (error) {
      console.error('예약 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setLoadingReservations(false);
    }
  };

  const checkAndUpdateReservationStatus = async (reservations: ReservationDto[]): Promise<ReservationDto[]> => {
    const now = new Date();
    const updatedReservations = [];
    
    for (const reservation of reservations) {
      const endDateTime = new Date(`${reservation.storageEndDate}T${reservation.storageEndTime}`);

      if (reservation.status === 'RESERVED' && now > endDateTime) {
        try {
          // 백엔드 API 호출하여 예약 상태를 COMPLETED로 업데이트
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/reservations/${reservation.reservationNumber}/complete`,
            {},
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
          
          if (response.status === 200) {
            console.log(`예약 완료 처리 성공: ${reservation.reservationNumber}`);
            updatedReservations.push({
              ...reservation,
              status: 'COMPLETED' as const
            });
            
            // 매장 용량 정보 실시간 업데이트
            if (selectedPlace && 
                selectedPlace.place_name === reservation.placeName && 
                selectedPlace.address_name === reservation.placeAddress) {
              const updatedCapacity = await fetchRealTimeCapacity(
                reservation.placeName,
                reservation.placeAddress
              );
              setRealTimeCapacity({
                small: updatedCapacity.smallBags || 0,
                medium: updatedCapacity.mediumBags || 0,
                large: updatedCapacity.largeBags || 0,
              });
              console.log(`매장 용량 정보 업데이트 완료: ${reservation.placeName}`);
            }
          } else {
            console.error(`예약 완료 처리 실패: ${reservation.reservationNumber}`);
            updatedReservations.push(reservation);
          }
        } catch (error) {
          console.error(`예약 완료 처리 API 호출 실패: ${reservation.reservationNumber}`, error);
          // API 호출 실패 시에도 프론트엔드 상태는 업데이트
          updatedReservations.push({
            ...reservation,
            status: 'COMPLETED' as const
          });
        }
      } else {
        updatedReservations.push(reservation);
      }
    }
    
    return updatedReservations;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return t('reserved');
      case 'COMPLETED':
        return t('completed');
      case 'CANCELLED':
        return t('cancelled');
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeForReservation = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM 형식으로 변환
  };

  // 네이버맵 길찾기 함수
  const openNaverMap = (reservation: ReservationDto) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const placeName = reservation.placeName;
    const placeAddress = reservation.placeAddress;
    
    // 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          
          if (isMobile) {
            // 모바일에서는 네이버맵 앱을 실행 (출발지: 현재위치, 도착지: 매장)
            const naverMapUrl = `nmap://route/car?slat=${currentLat}&slng=${currentLng}&sname=${t('currentLocationForNavigation')}&dlat=${reservation.placeLatitude}&dlng=${reservation.placeLongitude}&dname=${encodeURIComponent(placeName)}&appname=TravelLight`;
            
            // 네이버맵 앱이 설치되어 있으면 실행, 없으면 웹으로 이동
            const timeout = setTimeout(() => {
              // 앱 실행 실패시 웹 페이지로 이동 (모바일도 간단한 검색)
              const searchQuery = encodeURIComponent(`${placeName} ${placeAddress}`);
              const naverMobileWebUrl = `https://map.naver.com/p/search/${searchQuery}`;
              window.open(naverMobileWebUrl, '_blank');
            }, 1000);
            
            // 앱이 성공적으로 실행되면 timeout 취소
            const beforeUnload = () => {
              clearTimeout(timeout);
            };
            
            window.addEventListener('beforeunload', beforeUnload);
            window.location.href = naverMapUrl;
            
            // 3초 후 이벤트 리스너 제거
            setTimeout(() => {
              window.removeEventListener('beforeunload', beforeUnload);
            }, 3000);
            
          } else {
            // PC에서는 네이버맵 웹 페이지로 이동 (간단한 주소 검색)
            const searchQuery = encodeURIComponent(`${placeName} ${placeAddress}`);
            const naverWebUrl = `https://map.naver.com/p/search/${searchQuery}`;
            window.open(naverWebUrl, '_blank');
          }
        },
        (error) => {
          console.error('현재 위치를 가져올 수 없습니다:', error);
          // 위치 정보를 가져올 수 없는 경우 기존 방식으로 동작 (도착지만 설정)
          if (isMobile) {
            const naverMapUrl = `nmap://route/car?dlat=${reservation.placeLatitude}&dlng=${reservation.placeLongitude}&dname=${encodeURIComponent(placeName)}&appname=TravelLight`;
            
            const timeout = setTimeout(() => {
              window.open(`https://map.naver.com/p/directions/-1,,,,/-2,${encodeURIComponent(placeAddress)},${encodeURIComponent(placeName)},PLACE/car`, '_blank');
            }, 1000);
            
            const beforeUnload = () => {
              clearTimeout(timeout);
            };
            
            window.addEventListener('beforeunload', beforeUnload);
            window.location.href = naverMapUrl;
            
            setTimeout(() => {
              window.removeEventListener('beforeunload', beforeUnload);
            }, 3000);
            
          } else {
            // 위치 정보를 가져올 수 없는 경우 PC웹용 (간단한 주소 검색)
            const searchQuery = encodeURIComponent(`${placeName} ${placeAddress}`);
            const naverWebUrl = `https://map.naver.com/p/search/${searchQuery}`;
            window.open(naverWebUrl, '_blank');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      console.error('브라우저에서 위치 정보를 지원하지 않습니다.');
      // Geolocation을 지원하지 않는 경우 기존 방식으로 동작
      if (isMobile) {
        const naverMapUrl = `nmap://route/car?dlat=${reservation.placeLatitude}&dlng=${reservation.placeLongitude}&dname=${encodeURIComponent(placeName)}&appname=TravelLight`;
        
        const timeout = setTimeout(() => {
          // 앱 실행 실패시 모바일 웹으로 이동 (간단한 검색)
          const searchQuery = encodeURIComponent(`${placeName} ${placeAddress}`);
          const naverMobileWebUrl = `https://map.naver.com/p/search/${searchQuery}`;
          window.open(naverMobileWebUrl, '_blank');
        }, 1000);
        
        const beforeUnload = () => {
          clearTimeout(timeout);
        };
        
        window.addEventListener('beforeunload', beforeUnload);
        window.location.href = naverMapUrl;
        
        setTimeout(() => {
          window.removeEventListener('beforeunload', beforeUnload);
        }, 3000);
        
      } else {
        // Geolocation을 지원하지 않는 경우 PC웹용 (간단한 주소 검색)
        const searchQuery = encodeURIComponent(`${placeName} ${placeAddress}`);
        const naverWebUrl = `https://map.naver.com/p/search/${searchQuery}`;
        window.open(naverWebUrl, '_blank');
      }
    }
  };

  const handleReservationsClick = () => {
    setShowReservations(true);
    setSelectedPlace(null);
    setSelectedReservation(null);
    setSearchResults([]);
    setIsReservationOpen(false);
    setIsPaymentOpen(false);
    setIsPaymentComplete(false);
    fetchMyReservations();
  };

  const handleBackToSearch = () => {
    setShowReservations(false);
    setSelectedReservation(null);
  };

  // 예약 취소 처리 함수
  const handleCancelReservation = async (reservation: ReservationDto) => {
    if (!window.confirm(t('confirmCancelReservation'))) {
      return;
    }

    const reservationNumber = reservation.reservationNumber;
    if (!reservationNumber) {
      setCancelError(t('reservationNumberNotFound'));
      return;
    }

    setCancellingReservation(reservationNumber);
    setCancelError('');
    setCancelSuccess('');

    try {
      // 1. 먼저 예약 취소
      await cancelReservation(reservationNumber);
      
      // 2. 포트원 결제 취소 (paymentId가 있는 경우)
      if (reservation.paymentId) {
        try {
          await cancelPayment(reservation.paymentId, 'Customer requested cancellation');
        } catch (paymentError) {
          console.error('결제 취소 실패:', paymentError);
          // 예약은 취소되었지만 결제 취소가 실패한 경우
          setCancelError(t('paymentCancellationFailed'));
        }
      }

      setCancelSuccess(t('reservationCancelledSuccessfully'));

      // 예약 목록 새로고침
      await fetchMyReservations();

      // 상세보기에서 목록으로 돌아가기
      if (selectedReservation) {
        setSelectedReservation(null);
      }

      // 성공 메시지 3초 후 자동 제거
      setTimeout(() => {
        setCancelSuccess('');
      }, 3000);

    } catch (error: any) {
      console.error('예약 취소 실패:', error);
      setCancelError(error.message || t('reservationCancellationFailed'));
    } finally {
      setCancellingReservation(null);
    }
  };

  // ========== 리뷰 관련 함수들 ==========
  
  // 예약의 리뷰 상태 확인 함수
  const checkReviewStatus = async (reservationId: number) => {
    try {
      const response = await reviewService.getReviewStatus(reservationId);
      return response.data.hasReview;
    } catch (error) {
      console.error('리뷰 상태 확인 실패:', error);
      return false;
    }
  };

  // 리뷰 작성 핸들러
  const handleWriteReview = async (reservation: ReservationDto) => {
    try {
      // 사용자 인증 확인
      if (!user?.id) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 예약 상태 먼저 확인
      if (reservation.status !== 'COMPLETED') {
        alert('완료된 예약에만 리뷰를 작성할 수 있습니다.');
        return;
      }

      // 먼저 최신 리뷰 상태 확인 (실시간 체크)
      console.log('리뷰 상태 재확인 중...');
      const hasReview = await checkReviewStatus(reservation.id);
      
      // 상태 업데이트
      setReviewStatuses(prev => ({
        ...prev,
        [reservation.id]: hasReview
      }));

      if (hasReview) {
        alert('이미 리뷰를 작성한 예약입니다. 페이지를 새로고침하겠습니다.');
        await fetchMyReservations(); // 예약 목록 새로고침
        return;
      }

      // 리뷰 작성 가능 여부 확인 (이중 체크)
      const canWriteResponse = await reviewService.canWriteReview(reservation.id, user.id);
      
      if (canWriteResponse.data) {
        setSelectedReservationForReview(reservation);
        setReviewFormOpen(true);
      } else {
        alert('이미 리뷰를 작성했거나 리뷰 작성이 불가능한 예약입니다.');
        // 상태 강제 업데이트
        setReviewStatuses(prev => ({
          ...prev,
          [reservation.id]: true
        }));
      }
    } catch (error: any) {
      console.error('리뷰 작성 중 오류:', error);
      alert('리뷰 작성 중 오류가 발생했습니다.');
    }
  };

  // 리뷰 수정 핸들러
  const handleEditReview = async (reservation: ReservationDto) => {
    try {
      const response = await reviewService.getReviewByReservation(reservation.id);
      setEditingReview(response.data);
      setSelectedReservationForReview(reservation);
      setReviewFormOpen(true);
    } catch (error) {
      console.error('리뷰 조회 실패:', error);
      alert('리뷰 정보를 불러오는데 실패했습니다.');
    }
  };

  // 리뷰 삭제 핸들러
  const handleDeleteReview = async (reservation: ReservationDto) => {
    if (!window.confirm('리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await reviewService.getReviewByReservation(reservation.id);
      await reviewService.deleteReview(response.data.id);
      
      // 상태 업데이트
      setReviewStatuses(prev => ({
        ...prev,
        [reservation.id]: false
      }));
      
      alert('리뷰가 삭제되었습니다.');
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      alert('리뷰 삭제에 실패했습니다.');
    }
  };

  // 리뷰 제출 핸들러
  const handleReviewSubmit = async (reviewData: any) => {
    try {
      if (!user?.id || !selectedReservationForReview) {
        alert('로그인이 필요하거나 잘못된 요청입니다.');
        return;
      }

      if (editingReview) {
        // 수정
        await reviewService.updateReview(selectedReservationForReview.id, reviewData, user.id);
        alert('리뷰가 수정되었습니다.');
      } else {
        // 새 리뷰 작성
        await reviewService.createReview(reviewData, user.id);
        alert('리뷰가 작성되었습니다.');
        
        // 상태 업데이트
        setReviewStatuses(prev => ({
          ...prev,
          [selectedReservationForReview.id]: true
        }));
      }
      
      setReviewFormOpen(false);
      setSelectedReservationForReview(null);
      setEditingReview(null);
    } catch (error) {
      console.error('리뷰 처리 실패:', error);
      alert('리뷰 처리 중 오류가 발생했습니다.');
    }
  };

  // ========== 배달 관련 함수들 ==========

  // 배달 상태 정보 조회
  const fetchDeliveryStatus = async (reservationId: number) => {
    try {
      setLoadingDeliveries(true);
      const response = await axios.get(`/api/deliveries/reservation/${reservationId}`);
      return response.data.data;
    } catch (error) {
      console.error('배달 정보를 불러오는데 실패했습니다:', error);
      return [];
    } finally {
      setLoadingDeliveries(false);
    }
  };

  // 배달 상태 스텝 인덱스 계산
  const getDeliveryStatusIndex = (status: string) => {
    const index = deliveryStatusSteps.findIndex(step => step.status === status);
    return index >= 0 ? index : 0;
  };

  // 예약의 배달 정보 조회
  const getDeliveriesForReservation = (reservationId: number) => {
    return deliveries.filter(delivery => delivery.reservationId === reservationId);
  };

  // 배달 신청 시작
  const handleStartDelivery = (reservation: ReservationDto) => {
    setCurrentReservationForDelivery(reservation);
    setDeliveryStep(0);
    setDeliveryType('');
    setCustomAddress('');
    setSelectedPartner(null);
    setEstimatedPrice(0);
    setPartnerSearchQuery('');
    setPartnerSearchResults([]);
    setIsDeliveryModalOpen(true);
  };

  // 배달 모달 닫기
  const handleCloseDeliveryModal = () => {
    setIsDeliveryModalOpen(false);
    setCurrentReservationForDelivery(null);
    setDeliveryStep(0);
    setDeliveryType('');
    setCustomAddress('');
    setSelectedPartner(null);
    setEstimatedPrice(0);
    setPartnerSearchQuery('');
    setPartnerSearchResults([]);
  };

  // 배달 유형 변경
  const handleDeliveryTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryType(event.target.value);
  };

  // 다음 단계
  const handleNextStep = () => {
    setDeliveryStep(prev => prev + 1);
  };

  // 이전 단계
  const handlePrevStep = () => {
    if (deliveryStep === 0) {
      handleCloseDeliveryModal();
    } else {
      setDeliveryStep(prev => prev - 1);
    }
  };

  // 제휴 매장 선택
  const handlePartnerSelect = (partner: Partnership) => {
    setSelectedPartner(partner);
    calculatePartnerPrice(partner);
  };

  // 제휴 매장 배달 가격 계산
  const calculatePartnerPrice = (partner: Partnership) => {
    // 간단한 가격 계산 로직 (실제로는 더 복잡한 로직 필요)
    const basePrice = 3000;
    const distance = Math.random() * 10; // 실제로는 거리 계산 필요
    const calculatedPrice = basePrice + (distance * 500);
    setEstimatedPrice(Math.round(calculatedPrice));
  };

  // 일반 주소 배달 가격 계산
  const calculatePrice = () => {
    if (!customAddress.trim()) return;
    
    // 간단한 가격 계산 로직
    const basePrice = 5000;
    const calculatedPrice = basePrice + Math.random() * 3000;
    setEstimatedPrice(Math.round(calculatedPrice));
  };

  // 배달 신청 제출
  const handleDeliverySubmit = async () => {
    if (!currentReservationForDelivery || !user) return;
    
    try {
      const deliveryData = {
        userId: user.id,
        reservationId: currentReservationForDelivery.id,
        pickupAddress: currentReservationForDelivery.placeName,
        deliveryAddress: deliveryType === 'partner' && selectedPartner 
          ? selectedPartner.address 
          : customAddress,
        itemDescription: `소형 ${currentReservationForDelivery.smallBags}개, 중형 ${currentReservationForDelivery.mediumBags}개, 대형 ${currentReservationForDelivery.largeBags}개`,
        weight: currentReservationForDelivery.smallBags + currentReservationForDelivery.mediumBags + currentReservationForDelivery.largeBags
      };
      
      // 배달 요청 API 호출
      const response = await axios.post('/api/deliveries', deliveryData);
      
      // 성공 메시지 표시
      alert('배달 신청이 완료되었습니다.');
      
      // 모달 닫기
      handleCloseDeliveryModal();
      
      // 예약 목록 새로고침
      await fetchMyReservations();
    } catch (error) {
      console.error('배달 신청 중 오류:', error);
      alert('배달 신청 중 오류가 발생했습니다.');
    }
  };

  // 검색 기능 구현
  const handleSearch = async () => {
    if (!partnerSearchQuery.trim()) {
      setPartnerSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await partnershipService.getAllPartnerships();
      const approvedPartners = response.data.filter(p => p.status === 'APPROVED');
      
      // 검색어로 필터링
      const filteredPartners = approvedPartners.filter(partner => 
        partner.businessName.toLowerCase().includes(partnerSearchQuery.toLowerCase()) ||
        partner.address.toLowerCase().includes(partnerSearchQuery.toLowerCase())
      );
      
      setPartnerSearchResults(filteredPartners);
    } catch (error) {
      console.error('매장 검색 중 오류:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPartnerSearchQuery(event.target.value);
  };

  // 공통 스크롤바 스타일 정의
  const scrollbarStyle = {
    "&::-webkit-scrollbar": {
      width: "4px", // 더 얇게 조정
      backgroundColor: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0, 0, 0, 0.08)", // 더 연한 색상
      borderRadius: "10px", // 더 둥글게
      transition: "background-color 0.2s ease", // 부드러운 색상 전환
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.12)", // hover 시 약간 진하게
      },
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
      margin: "4px 0", // 상하 여백 추가
    },
    // Firefox 스크롤바 스타일
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(0, 0, 0, 0.08) transparent",
    // 스크롤 동작을 부드럽게
    scrollBehavior: "smooth",
  };

  // 시간 선택 범위 정의 (30분 간격)
  const timeOptions = [
    "00:00",
    "00:30",
    "01:00",
    "01:30",
    "02:00",
    "02:30",
    "03:00",
    "03:30",
    "04:00",
    "04:30",
    "05:00",
    "05:30",
    "06:00",
    "06:30",
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
    "23:30",
  ];

  // 현재 시간 이후의 시간 옵션만 필터링하는 함수
  const getAvailableStartTimeOptions = (selectedDate: string) => {
    if (!selectedDate) return timeOptions;
    
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);
    
    // 선택한 날짜가 오늘이 아니면 모든 시간 옵션 반환
    if (selectedDateObj.toDateString() !== today.toDateString()) {
      return timeOptions;
    }
    
    // 오늘 날짜인 경우, 현재 시간 이후의 시간만 반환
    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();
    
    // 현재 시간을 30분 단위로 반올림하여 다음 가능한 시간 계산
    const roundedMinutes = Math.ceil(currentMinutes / 30) * 30;
    const adjustedHours = roundedMinutes === 60 ? currentHours + 1 : currentHours;
    const adjustedMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
    
    const currentTimeString = `${adjustedHours.toString().padStart(2, "0")}:${adjustedMinutes.toString().padStart(2, "0")}`;
    
    return timeOptions.filter(time => time >= currentTimeString);
  };

  // Hero 컴포넌트에서 전달받은 상태 확인
  const {
    searchQuery = "",
    searchResults: initialSearchResults = [],
    initialPosition,
    searchType,
    showReservations: initialShowReservations = false,
  } = (location.state as any) || {};

  // 컴포넌트 마운트 시 제휴점 데이터 먼저 로드 (지도 초기화와 별개)
  // iOS Safari에서 안정적인 마커 표시를 위해 제거 - 지도 초기화 후에만 fetch
  // useEffect(() => {
  //   const fetchPartnershipsData = async () => {
  //     try {
  //       const response = await axios.get("/api/partnership", {
  //         timeout: 60000,
  //       });
  //       if (response.data && response.data.success) {
  //         const partnershipData = response.data.data.filter(
  //           (partnership: Partnership) => partnership.status === "APPROVED"
  //         );
  //         setPartnerships(partnershipData);
  //         console.log('제휴점 데이터 먼저 로드 완료:', partnershipData.length);
  //       }
  //     } catch (error) {
  //       console.error("제휴점 데이터 사전 로드 중 오류:", error);
  //     }
  //   };

  //   fetchPartnershipsData();
  // }, []);

  // 선택된 장소의 리뷰 통계 가져오기
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (selectedPlace && selectedPlace.place_name && selectedPlace.address_name) {
        try {
          const response = await reviewService.getPlaceReviewSummary(
            selectedPlace.place_name,
            selectedPlace.address_name
          );
          setReviewStats({
            averageRating: response.data.averageRating || 0,
            totalReviews: response.data.totalReviews || 0
          });
        } catch (error) {
          console.error('리뷰 통계 조회 실패:', error);
          setReviewStats({ averageRating: 0, totalReviews: 0 });
        }
      } else {
        setReviewStats({ averageRating: 0, totalReviews: 0 });
      }
    };

    fetchReviewStats();
  }, [selectedPlace]);

  // Navbar에서 예약 목록 요청 처리
  useEffect(() => {
    if (initialShowReservations && isAuthenticated) {
      console.log('Navbar에서 예약 목록 화면 요청됨');
      setShowReservations(true);
      setSelectedPlace(null);
      setSelectedReservation(null);
      setSearchResults([]);
      setIsReservationOpen(false);
      setIsPaymentOpen(false);
      setIsPaymentComplete(false);
      fetchMyReservations();
      
      // location.state 정리
      if (location.state) {
        window.history.replaceState({}, document.title);
      }
    }
  }, [initialShowReservations, isAuthenticated]);

  // 메인페이지에서 전달받은 검색어 처리
  useEffect(() => {
    if (
      location.state?.searchKeyword &&
      location.state?.shouldSearch &&
      mapInstance
    ) {
      const keyword = location.state.searchKeyword;
      setSearchKeyword(keyword);

      console.log(`메인페이지에서 검색어 전달받음: "${keyword}"`);

      // 지연 시간을 줄여서 더 빠르게 검색 실행
      setTimeout(() => {
        performSearch(keyword);
      }, 300); // 1000ms에서 300ms로 단축
    }
  }, [location.state, mapInstance]);

  // 컴포넌트 마운트 시 검색어와 검색 결과 설정
  useEffect(() => {
    if (searchQuery) {
      setSearchKeyword(searchQuery);

      // 지역명 검색인 경우 바로 검색 실행
      if (searchType === "location") {
        console.log("지역명 검색 모드로 실행:", searchQuery);
        // 약간 지연을 주어 컴포넌트가 완전히 마운트된 후 검색 실행
        setTimeout(() => {
          if (mapInstance) {
            performSearch(searchQuery);
          } else {
            // 지도 인스턴스가 아직 초기화되지 않은 경우, 더 큰 지연 후 재시도
            console.log("지도 인스턴스 대기 중... 1초 후 재시도");
            setTimeout(() => performSearch(searchQuery), 1000);
          }
        }, 500);
      }
    }

    if (initialSearchResults && initialSearchResults.length > 0) {
      // 검색 결과를 place 형식으로 변환
      const convertedResults = initialSearchResults.map((p: any) => ({
        place_name: p.businessName,
        address_name: p.address,
        phone: p.phone,
        category_group_code: getCategoryCodeFromBusinessType(p.businessType),
        x: p.longitude.toString(),
        y: p.latitude.toString(),
        opening_hours: p.is24Hours
          ? t('open24Hours')
          : formatBusinessHours(p.businessHours),
      }));

      // 시간에 따른 필터링
      const timeFilteredPlaces = filterPlacesByTime(
        convertedResults,
        startTime,
        endTime
      );
      setSearchResults(timeFilteredPlaces);
    }
  }, [
    searchQuery,
    initialSearchResults,
    startTime,
    endTime,
    searchType,
    mapInstance,
  ]);

  // 초기 위치 설정 - Hero 컴포넌트에서 받은 위치 정보가 있으면 사용
  useEffect(() => {
    if (initialPosition && mapInstance) {
      console.log("Hero에서 전달받은 초기 위치 정보:", initialPosition);
      const { latitude, longitude } = initialPosition;

      if (!latitude || !longitude) {
        console.error("유효하지 않은 좌표 정보:", initialPosition);
        return;
      }

      try {
        const moveLatLng = new window.naver.maps.LatLng(latitude, longitude);
        console.log("이동할 좌표:", latitude, longitude);

        // 부드러운 이동 처리
        const currentZoom = mapInstance.getZoom();
        console.log("현재 줌 레벨:", currentZoom);

        // 위치 이동
        console.log("지도 중심 이동 시도");
        mapInstance.setCenter(moveLatLng);
        console.log("지도 중심 이동 완료");

        // 애니메이션 효과 (줌 아웃 후 줌 인)
        setTimeout(() => {
          try {
            console.log("줌 아웃 시도");
            mapInstance.setZoom(currentZoom - 1);
            console.log("줌 아웃 완료");

            setTimeout(() => {
              try {
                console.log("줌 인 시도");
                mapInstance.setZoom(currentZoom);
                console.log("줌 인 완료");
              } catch (error) {
                console.error("줌 인 중 오류:", error);
              }
            }, 250);
          } catch (error) {
            console.error("줌 아웃 중 오류:", error);
          }
        }, 50);
      } catch (error) {
        console.error("초기 위치 설정 중 오류:", error);
      }
    }
  }, [initialPosition, mapInstance]);

  useEffect(() => {
    const container = document.getElementById("map") as HTMLElement;

    // 마커 관련 스타일 추가
    const addMapStyles = () => {
      // 기존 스타일 요소가 있으면 제거
      const existingStyle = document.getElementById("travellight-map-styles");
      if (existingStyle) {
        existingStyle.remove();
      }

      // 새 스타일 요소 생성
      const styleElement = document.createElement("style");
      styleElement.id = "travellight-map-styles";
      styleElement.textContent = `
                @keyframes pulse {
                    0% {
                        transform: scale(0.8);
                        opacity: 0.8;
                    }
                    70% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                
                .luggage-marker {
                    transition: transform 0.2s ease-out !important;
                }
                
                .luggage-marker:hover {
                    transform: translateY(-6px) !important;
                }
                
                .info-window {
                    background-color: white;
                    border-radius: 16px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                    overflow: hidden;
                    min-width: 220px;
                    max-width: 300px;
                    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
                }
                
                .info-window .title {
                    background-color: #2E7DF1;
                    color: white;
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                }
                
                .info-window .store-name {
                    font-weight: 600;
                    font-size: 15px;
                    letter-spacing: -0.3px;
                }
                
                .info-window .close {
                    cursor: pointer;
                    font-size: 20px;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                    line-height: 1;
                }
                
                .info-window .close:hover {
                    opacity: 1;
                }
                
                .info-window .body {
                    padding: 14px 16px;
                }
                
                .info-window .badge {
                    display: inline-block;
                    background-color: #f0f5ff;
                    color: #2E7DF1;
                    font-size: 12px;
                    font-weight: 500;
                    padding: 3px 8px;
                    border-radius: 12px;
                    margin-bottom: 8px;
                }
                
                .info-window .address {
                    font-size: 13px;
                    line-height: 1.4;
                    color: #333;
                    margin-bottom: 6px;
                    word-break: keep-all;
                }
                
                .info-window .phone, .info-window .hours {
                    font-size: 12px;
                    color: #666;
                    display: flex;
                    align-items: center;
                    margin-top: 4px;
                }
                
                .info-window .hours::before {
                    content: '';
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='%23666'%3E%3Cpath d='M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,6a1,1,0,0,0-1,1v5a1,1,0,0,0,.5.87l4,2.5a1,1,0,0,0,1.37-.37,1,1,0,0,0-.37-1.37l-3.5-2.18V7A1,1,0,0,0,12,6Z'/%3E%3C/svg%3E");
                    background-size: cover;
                    margin-right: 6px;
                }
                
                .info-window .phone::before {
                    content: '';
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='%23666'%3E%3Cpath d='M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,6a1,1,0,0,0-1,1v5a1,1,0,0,0,.5.87l4,2.5a1,1,0,0,0,1.37-.37,1,1,0,0,0-.37-1.37l-3.5-2.18V7A1,1,0,0,0,12,6Z'/%3E%3C/svg%3E");
                    background-size: cover;
                    margin-right: 6px;
                }
            `;

      document.head.appendChild(styleElement);
    };

    // 네이버 지도 객체가 로드됐는지 확인
    const waitForNaverMaps = () => {
      if (window.naver && window.naver.maps) {
        initializeMap();
      } else {
        setTimeout(waitForNaverMaps, 100);
      }
    };

    // 지도 초기화 함수
    const initializeMap = () => {
      // 기존에 생성된 지도 인스턴스가 있으면 정리
      if (mapInstance) {
        console.log("기존 지도 인스턴스 제거");

        // 모든 마커 및 오버레이 제거
        partnershipOverlays.forEach((marker) => {
          marker.setMap(null);
        });

        // 필요하다면 추가적인 리소스 정리

        // 지도 요소 초기화를 위해 innerHTML 비우기
        if (document.getElementById("map")) {
          document.getElementById("map")!.innerHTML = "";
        }
      }

      // 스타일 적용
      addMapStyles();

      const options = {
        center: new window.naver.maps.LatLng(37.555946, 126.972317),
        zoom: 15,
        zoomControl: false,
        disableKineticPan: false,
        zoomAnimation: true,
        zoomDuration: 300,
        pinchZoom: true,
        swipeToZoom: true,
        minZoom: 6,
        maxZoom: 21,
        scaleControl: false,
        logoControl: true,
        mapDataControl: false,
        mapTypeControl: false,
        mapTypeId: window.naver.maps.MapTypeId.NORMAL,
        backgroundColor: "#f8f9fa",
        baseTileOpacity: 1,
        disableDoubleClickZoom: false,
        disableDoubleTapZoom: false,
        draggable: true,
        tileTransition: true,
        stylesVisible: true,
        logoControlOptions: {
          position: window.naver.maps.Position.BOTTOM_RIGHT,
        },
      };

      const map = new window.naver.maps.Map(container, options);

      window.naver.maps.Event.once(map, "init_stylemap", () => {
        console.log("지도 로드 완료, 추가 설정 적용");

        try {
          map.setMapTypeId(window.naver.maps.MapTypeId.NORMAL);

          map.setOptions({
            scaleControl: false,
            mapTypeControl: false,
            logoControl: true,
            mapDataControl: false,
          });

          var labelLayer = new window.naver.maps.LabelLayer();
          labelLayer.setMap(null);

          try {
            if (map.getPOIOptions) {
              map.setPOIOptions({
                density: 0.3,
                minZoom: 12,
                maxZoom: 21,
              });
            }

            if (window.naver.maps.LabelLayer) {
              const customLabelOptions = {
                zIndex: 2,
                visibleLayers: ["BACKGROUND_DETAIL", "POI_KOREAN"],
              };

              const customLabelLayer = new window.naver.maps.LabelLayer(
                customLabelOptions
              );
              customLabelLayer.setMap(map);
            }
          } catch (styleError: any) {
            console.error("POI/라벨 레이어 설정 오류:", styleError);
          }

          map.setOptions({
            mapTypeControl: false,
            mapDataControl: false,
            scaleControl: false,
            logoControl: true,
            minZoom: 6,
            maxZoom: 21,
            tileTransition: true,
            logoControlOptions: {
              position: window.naver.maps.Position.BOTTOM_RIGHT,
            },
          });

        } catch (e) {
          console.error("지도 스타일 설정 오류:", e);
        }
      });

      setMapInstance(map);
      let currentInfoWindow: any = null;
      let selectedMarker: any = null;
      let isPartnershipsFetching = false; // 중복 fetch 방지

      function displayUserMarker(locPosition: any) {
        const marker = new window.naver.maps.Marker({
          position: locPosition,
          map: map,
          icon: {
            content: `
                            <div class="user-marker-container" style="position: relative; width: 28px; height: 28px;">
                                <div class="user-marker-pulse" style="
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    width: 28px;
                                    height: 28px;
                                    border-radius: 50%;
                                    background-color: rgba(255, 90, 90, 0.2);
                                    animation: pulse 1.5s infinite;
                                "></div>
                                <div class="user-marker" style="
                                    position: absolute;
                                    top: 6px;
                                    left: 6px;
                                    width: 16px;
                                    height: 16px;
                                    background-color: #FF5A5A;
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                    border: 1.5px solid white;
                                    box-sizing: border-box;
                                    z-index: 1;
                                ">
                                    <div style="
                                        width: 4px;
                                        height: 4px;
                                        background-color: white;
                                        border-radius: 50%;
                                    "></div>
                                </div>
                            </div>
                        `,
            anchor: new window.naver.maps.Point(14, 14),
          },
        });

        return marker;
      }

      // 제휴점 마커 제거 함수
      function clearPartnershipMarkers() {
        // 기존 마커 제거
        partnershipOverlays.forEach((marker) => {
          marker.setMap(null);
        });
        setPartnershipOverlays([]);

        // 현재 정보 창도 제거
        if (currentInfoWindow) {
          currentInfoWindow.close();
          currentInfoWindow = null;
        }

        // 선택된 마커 초기화
        selectedMarker = null;
      }

      // 제휴점 데이터 가져오는 함수
      const fetchPartnerships = async () => {
        // 중복 fetch 방지
        if (isPartnershipsFetching) {
          console.log("이미 제휴점 데이터를 가져오는 중입니다");
          return;
        }

        try {
          isPartnershipsFetching = true;


          // API 호출 시 catch 블록 추가 및 오류 로깅 개선
          const response = await axios.get("/api/partnership", {
            timeout: 60000,
          });
          if (response.data && response.data.success) {
            const partnershipData = response.data.data.filter(
              (partnership: Partnership) => partnership.status === "APPROVED"
            );
            console.log('제휴점 데이터 로드 완료:', partnershipData.length);
            setPartnerships(partnershipData);

            // 기존 마커 제거
            clearPartnershipMarkers();

            // 새 제휴점 마커 생성
            const newOverlays: any[] = [];
            partnershipData.forEach((partnership: Partnership) => {
              const marker = displayPartnershipMarker(partnership, map);
              if (marker) {
                newOverlays.push(marker);
              }
            });
            setPartnershipOverlays(newOverlays);
            console.log('마커 생성 완료:', newOverlays.length);
          } else {
            console.error(
              "제휴점 데이터 가져오기 실패:",
              response.data?.message || "응답 데이터 없음"
            );
          }
        } catch (error: any) {
          console.error("제휴점 데이터 요청 중 오류:", error);
          // API 서버가 실행 중이지 않은 경우 임시 처리
          // 실제 환경에서는 이 부분을 제거하고 적절한 에러 UI 표시 필요
          if (process.env.NODE_ENV === "development") {
            console.log("개발 환경에서 API 호출 실패, 임시 데이터 사용");
          }
        } finally {
          isPartnershipsFetching = false;
        }
      };

      // 제휴점 마커 표시 함수
      function displayPartnershipMarker(partnership: Partnership, map: any) {
        try {
          const markerPosition = new window.naver.maps.LatLng(
            partnership.latitude,
            partnership.longitude
          );

          // 통일된 메인 색상 설정 (TravelLight 브랜드 컬러)
          const primaryColor = "#2E7DF1"; // 앱 메인 컬러
          const secondaryColor = "#FFFFFF"; // 아이콘 내부 색상

          // 세련된 캐리어 아이콘 HTML 생성
          const markerContent = `
                        <div class="luggage-marker-container" style="position: relative; width: 28px; height: 28px;">
                            <div class="luggage-marker" style="
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 28px;
                                height: 28px;
                                background-color: ${primaryColor};
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                border: 1.5px solid white;
                                box-sizing: border-box;
                                transform-origin: center bottom;
                                transform: translateY(-2px);
                                transition: transform 0.2s ease-out;
                            ">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="${secondaryColor}">
                                    <path d="M17,6V5A3,3,0,0,0,14,2H10A3,3,0,0,0,7,5V6H4A2,2,0,0,0,2,8V20a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2ZM10,4h4a1,1,0,0,1,1,1V6H9V5A1,1,0,0,1,10,4ZM20,20H4V8H20Zm-2-9H6a1,1,0,0,0,0,2H18a1,1,0,0,0,0-2Z"/>
                                </svg>
                            </div>
                            <div class="luggage-marker-shadow" style="
                                position: absolute;
                                bottom: -2px;
                                left: 7px;
                                width: 14px;
                                height: 3px;
                                background-color: rgba(0,0,0,0.2);
                                border-radius: 50%;
                                filter: blur(1px);
                            "></div>
                        </div>
                    `;

          // 마커 생성
          const marker = new window.naver.maps.Marker({
            position: markerPosition,
            map: map,
            icon: {
              content: markerContent,
              anchor: new window.naver.maps.Point(14, 28), // 앵커 포인트를 아이콘 하단 중앙으로 조정
            },
            title: partnership.businessName,
          });

          // 마커에 hover 효과 추가
          const markerElement = marker.getElement();
          if (markerElement) {
            markerElement.addEventListener("mouseover", function () {
              const luggage = markerElement.querySelector(".luggage-marker");
              if (luggage) {
                luggage.style.transform = "translateY(-6px)";
              }
            });

            markerElement.addEventListener("mouseout", function () {
              const luggage = markerElement.querySelector(".luggage-marker");
              if (luggage) {
                luggage.style.transform = "translateY(-2px)";
              }
            });
          }

          // 매장명 처리 - 길이 제한
          let placeName = partnership.businessName;
          if (placeName.length > 20) {
            placeName = placeName.substring(0, 19) + "...";
          }

          // 영업시간 정보 가져오기
          let hours = partnership.is24Hours
            ? t('open24Hours')
            : partnership.businessHours
            ? formatBusinessHours(partnership.businessHours)
            : t('noOperatingHours');

          // 실시간 보관 가능한 개수를 가져오는 함수
          const createInfoWindowContent = async () => {
            let availableCapacity = {
              smallBags: 0,
              mediumBags: 0,
              largeBags: 0,
            };

            try {
              availableCapacity = await fetchRealTimeCapacity(
                partnership.businessName,
                partnership.address
              );
            } catch (error) {
              console.error("실시간 용량 조회 실패:", error);
              // 실패 시 최대 용량으로 대체
              availableCapacity = {
                smallBags: partnership.smallBagsAvailable || 0,
                mediumBags: partnership.mediumBagsAvailable || 0,
                largeBags: partnership.largeBagsAvailable || 0,
              };
            }

            return `
                            <div style="
                                background-color: white;
                                border-radius: 16px;
                                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                                overflow: hidden;
                                min-width: 220px;
                                max-width: 300px;
                                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
                            ">
                                <div style="
                                    background-color: #2E7DF1;
                                    color: white;
                                    padding: 12px 16px;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                ">
                                    <span style="
                                        font-weight: 600;
                                        font-size: 15px;
                                        letter-spacing: -0.3px;
                                    ">${partnership.businessName}</span>
                                </div>
                                <div style="padding: 14px 16px;">
                                    <div style="
                                        display: inline-block;
                                        background-color: #f0f5ff;
                                        color: #2E7DF1;
                                        font-size: 12px;
                                        font-weight: 500;
                                        padding: 3px 8px;
                                        border-radius: 12px;
                                        margin-bottom: 8px;
                                    ">${partnership.businessType}</div>
                                    <div style="
                                        font-size: 13px;
                                        line-height: 1.4;
                                        color: #333;
                                        margin-bottom: 6px;
                                        word-break: keep-all;
                                    ">${partnership.address}</div>
                                    
                                    <!-- 현재 보관 가능한 짐 개수 정보 -->
                                    <div style="
                                        background-color: #f8f9fa;
                                        border-radius: 8px;
                                        padding: 8px;
                                        margin: 8px 0;
                                        border-left: 3px solid #2E7DF1;
                                    ">
                                        <div style="
                                            font-size: 12px;
                                            font-weight: 600;
                                            color: #2E7DF1;
                                            margin-bottom: 4px;
                                        ">현재 보관 가능한 짐</div>
                                        <div style="
                                            display: flex;
                                            gap: 8px;
                                            font-size: 11px;
                                            color: #666;
                                        ">
                                            <span style="color: ${
                                              availableCapacity.smallBags > 0
                                                ? "#28a745"
                                                : "#dc3545"
                                            };">
                                                ${t('small')}: ${
                                                  availableCapacity.smallBags
                                                }${t('pieces')}
                                            </span>
                                            <span style="color: ${
                                              availableCapacity.mediumBags > 0
                                                ? "#28a745"
                                                : "#dc3545"
                                            };">
                                                ${t('medium')}: ${
                                                  availableCapacity.mediumBags
                                                }${t('pieces')}
                                            </span>
                                            <span style="color: ${
                                              availableCapacity.largeBags > 0
                                                ? "#28a745"
                                                : "#dc3545"
                                            };">
                                                ${t('large')}: ${
                                                  availableCapacity.largeBags
                                                }${t('pieces')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style="
                                        font-size: 12px;
                                        color: #666;
                                        display: flex;
                                        align-items: center;
                                        margin-top: 6px;
                                    ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="#666" style="margin-right: 6px;">
                                            <path d="M19.44,13c-.22,0-.45-.07-.67-.12a9.44,9.44,0,0,1-1.31-.39,2,2,0,0,0-2.48,1l-.22.45a12.18,12.18,0,0,1-2.66-2,12.18,12.18,0,0,1-2-2.66L10.52,9a2,2,0,0,0,1-2.48,10.33,10.33,0,0,1-.39-1.31c-.05-.22-.09-.45-.12-.68a3,3,0,0,0-3-2.49h-3a3,3,0,0,0-3,3.41A19,19,0,0,0,18.53,21.91l.38,0a3,3,0,0,0,2-.76,3,3,0,0,0,1-2.25v-3A3,3,0,0,0,19.44,13Z"/>
                                        </svg>
                                        ${
                                          partnership.phone ||
                                          t('noPhoneInfo')
                                        }
                                    </div>
                                    <div style="
                                        font-size: 12px;
                                        color: #666;
                                        display: flex;
                                        align-items: center;
                                        margin-top: 6px;
                                    ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="#666" style="margin-right: 6px;">
                                            <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,6a1,1,0,0,0-1,1v5a1,1,0,0,0,.5.87l4,2.5a1,1,0,0,0,1.37-.37,1,1,0,0,0-.37-1.37l-3.5-2.18V7A1,1,0,0,0,12,6Z"/>
                                        </svg>
                                        ${hours}
                                    </div>
                                </div>
                            </div>
                        `;
          };

          // 정보 창 생성 (비동기로 내용 생성)
          let infoWindow: any = null;

          // 마커 클릭 이벤트
          window.naver.maps.Event.addListener(marker, "click", async () => {
            // 현재 열린 정보창이 있으면 닫기
            if (currentInfoWindow) {
              currentInfoWindow.close();
            }

            // 로딩 중 표시할 임시 내용
            const loadingContent = `
                            <div style="
                                background-color: white;
                                border-radius: 16px;
                                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                                overflow: hidden;
                                min-width: 220px;
                                max-width: 300px;
                                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
                                padding: 20px;
                                text-align: center;
                            ">
                                <div style="color: #666; font-size: 14px;">
                                    보관 가능한 개수를 확인 중...
                                </div>
                            </div>
                        `;

            // 임시 정보창 생성 및 표시
            infoWindow = new window.naver.maps.InfoWindow({
              content: loadingContent,
              maxWidth: 300,
              backgroundColor: "transparent",
              borderColor: "transparent",
              disableAnchor: true,
            });

            infoWindow.open(map, marker);
            currentInfoWindow = infoWindow;

            // 선택된 마커 저장
            selectedMarker = marker;

            // 선택된 장소 데이터 설정
            const placeData = {
              place_name: partnership.businessName,
              address_name: partnership.address,
              phone: partnership.phone,
              category_group_code: getCategoryCodeFromBusinessType(
                partnership.businessType
              ),
              x: partnership.longitude.toString(),
              y: partnership.latitude.toString(),
              opening_hours: partnership.is24Hours
                ? t('open24Hours')
                : formatBusinessHours(partnership.businessHours),
              // Partnership 추가 데이터
              storePictures: partnership.storePictures || [],
              amenities: partnership.amenities || [],
              insuranceAvailable: partnership.insuranceAvailable || false,
              smallBagsAvailable: partnership.smallBagsAvailable,
              mediumBagsAvailable: partnership.mediumBagsAvailable,
              largeBagsAvailable: partnership.largeBagsAvailable,
            };

            setSelectedPlace(placeData);
            setShowReservations(false); // 예약목록 숨기기
            // 사이드바가 닫혀있으면 열기
            setIsSidebarOpen(true);

            // 실제 내용으로 업데이트
            try {
              const actualContent = await createInfoWindowContent();
              if (currentInfoWindow === infoWindow) {
                // 여전히 같은 정보창이 열려있는지 확인
                infoWindow.setContent(actualContent);
              }
            } catch (error) {
              console.error("정보창 내용 생성 실패:", error);
              if (currentInfoWindow === infoWindow) {
                infoWindow.setContent(`
                                    <div style="
                                        background-color: white;
                                        border-radius: 16px;
                                        padding: 20px;
                                        text-align: center;
                                        color: #dc3545;
                                        font-size: 14px;
                                    ">
                                        정보를 불러올 수 없습니다.
                                    </div>
                                `);
              }
            }
          });

          // 닫기 버튼 클릭 이벤트 (정보창 내부의 X 버튼)
          // window.naver.maps.Event.addListener(infoWindow, 'domready', () => {
          //     setTimeout(() => {
          //         const closeButton = document.querySelector('span[style*="cursor: pointer"][style*="font-size: 22px"]');
          //         if (closeButton) {
          //             closeButton.addEventListener('click', () => {
          //                 infoWindow.close();
          //                 currentInfoWindow = null;
          //             });
          //         }
          //     }, 100); // 작은 지연 시간 추가
          // });

          return marker;
        } catch (error) {
          console.error("제휴점 마커 표시 중 오류:", error);
          return null;
        }
      }

      // 비즈니스 타입에 따른 카테고리 코드 반환
      function getCategoryCodeFromBusinessType(businessType: string): string {
        switch (businessType) {
          case "카페":
          case t('cafe'):
            return "CE7";
          case "편의점":
          case t('convenienceStore'):
            return "CS2";
          case "숙박":
          case t('accommodation'):
            return "AD5";
          case "식당":
          case t('restaurant'):
            return "FD6";
          default:
            return "ETC";
        }
      }

      // 영업 시간 포맷팅 함수 (문자열 반환)
      function formatBusinessHours(
        businessHours: Record<string, BusinessHourDto | string>
      ): string {
        if (!businessHours || Object.keys(businessHours).length === 0) {
          return t('noOperatingHours');
        }

        const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        const dayNames = {
          'MONDAY': t('monday'),
          'TUESDAY': t('tuesday'),
          'WEDNESDAY': t('wednesday'),
          'THURSDAY': t('thursday'),
          'FRIDAY': t('friday'),
          'SATURDAY': t('saturday'),
          'SUNDAY': t('sunday')
        };

        // 두 가지 데이터 형태 모두 처리
        const enabledDays = dayOrder.filter(day => {
          const dayData = businessHours[day];
          if (!dayData) return false;
          
          // 문자열 형태인 경우 (예: "09:00-18:00")
          if (typeof dayData === 'string') {
            return dayData.trim() !== '' && dayData !== t('closed_keyword');
          }
          
          // 객체 형태인 경우 (예: { enabled: true, open: "09:00", close: "18:00" })
          if (typeof dayData === 'object') {
            return dayData.enabled === true;
          }
          
          return false;
        });

        if (enabledDays.length === 0) {
          return t('closed');
        }

        // 연속된 요일과 같은 시간을 그룹화
        const groups: { days: string[], time: string }[] = [];
        let currentGroup: string[] = [];
        let currentTime = '';

        enabledDays.forEach(day => {
          const dayData = businessHours[day];
          let dayTime = '';
          
          // 문자열 형태인 경우
          if (typeof dayData === 'string') {
            dayTime = dayData.replace('-', ' - ');
          }
          // 객체 형태인 경우
          else if (typeof dayData === 'object') {
            dayTime = `${dayData.open} - ${dayData.close}`;
          }
          
          if (currentTime === dayTime) {
            currentGroup.push(dayNames[day as keyof typeof dayNames]);
          } else {
            if (currentGroup.length > 0) {
              groups.push({ days: [...currentGroup], time: currentTime });
            }
            currentGroup = [dayNames[day as keyof typeof dayNames]];
            currentTime = dayTime;
          }
        });

        if (currentGroup.length > 0) {
          groups.push({ days: currentGroup, time: currentTime });
        }

        // 그룹화된 결과를 문자열로 변환
        const result = groups.map(group => {
          if (group.days.length > 2) {
            return `${group.days[0]}~${group.days[group.days.length - 1]} ${group.time}`;
          } else {
            return `${group.days.join(',')} ${group.time}`;
          }
        }).join('\n');

        return result;
      }

      // 영업 시간 포맷팅 함수 (배열 반환 - React에서 세로 표시용)
      function formatBusinessHoursArray(
        businessHours: Record<string, BusinessHourDto | string>
      ): string[] {
        if (!businessHours || Object.keys(businessHours).length === 0) {
          return [t('noOperatingHours')];
        }

        const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        const dayNames = {
          'MONDAY': t('monday'),
          'TUESDAY': t('tuesday'),
          'WEDNESDAY': t('wednesday'),
          'THURSDAY': t('thursday'),
          'FRIDAY': t('friday'),
          'SATURDAY': t('saturday'),
          'SUNDAY': t('sunday')
        };

        // 두 가지 데이터 형태 모두 처리
        const enabledDays = dayOrder.filter(day => {
          const dayData = businessHours[day];
          if (!dayData) return false;
          
          // 문자열 형태인 경우 (예: "09:00-18:00")
          if (typeof dayData === 'string') {
            return dayData.trim() !== '' && dayData !== t('closed_keyword');
          }
          
          // 객체 형태인 경우 (예: { enabled: true, open: "09:00", close: "18:00" })
          if (typeof dayData === 'object') {
            return dayData.enabled === true;
          }
          
          return false;
        });

        if (enabledDays.length === 0) {
          return [t('closed')];
        }

        // 연속된 요일과 같은 시간을 그룹화
        const groups: { days: string[], time: string }[] = [];
        let currentGroup: string[] = [];
        let currentTime = '';

        enabledDays.forEach(day => {
          const dayData = businessHours[day];
          let dayTime = '';
          
          // 문자열 형태인 경우
          if (typeof dayData === 'string') {
            dayTime = dayData.replace('-', ' - ');
          }
          // 객체 형태인 경우
          else if (typeof dayData === 'object') {
            dayTime = `${dayData.open} - ${dayData.close}`;
          }
          
          if (currentTime === dayTime) {
            currentGroup.push(dayNames[day as keyof typeof dayNames]);
          } else {
            if (currentGroup.length > 0) {
              groups.push({ days: [...currentGroup], time: currentTime });
            }
            currentGroup = [dayNames[day as keyof typeof dayNames]];
            currentTime = dayTime;
          }
        });

        if (currentGroup.length > 0) {
          groups.push({ days: currentGroup, time: currentTime });
        }

        // 그룹화된 결과를 배열로 반환
        return groups.map(group => {
          if (group.days.length > 2) {
            return `${group.days[0]}~${group.days[group.days.length - 1]} ${group.time}`;
          } else {
            return `${group.days.join(',')} ${group.time}`;
          }
        });
      }

      // 지도 드래그 이벤트
      window.naver.maps.Event.addListener(map, "dragend", () => {
        // 결제 완료 상태에서는 새 마커를 불러오지 않음
        if (isPaymentComplete) return;

        setIsMapMoved(true);
      });

      // 지도 클릭 이벤트
      window.naver.maps.Event.addListener(map, "click", () => {
        // 결제 완료 상태에서는 반응하지 않음
        if (isPaymentComplete) return;

        // 선택된 장소 초기화
        setSelectedPlace(null);
        setSelectedReservation(null);

        // 현재 정보창 닫기
        if (currentInfoWindow) {
          currentInfoWindow.close();
          currentInfoWindow = null;
        }
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const locPosition = new window.naver.maps.LatLng(lat, lng);
            setUserPosition({ lat, lng });

            // 사용자 마커 생성
            displayUserMarker(locPosition);

            // 메인페이지에서 검색어나 초기 위치가 전달된 경우에는 사용자 위치로 이동하지 않음
            const hasSearchFromMain =
              location.state?.searchKeyword || location.state?.initialPosition;

            if (!hasSearchFromMain) {
              // 위치로 부드럽게 이동
              // 1단계: 먼저 기본 줌 레벨로 설정
              map.setZoom(15);

              // 약간의 딜레이 후 중앙으로 이동
              setTimeout(() => {
                map.setCenter(locPosition);
                setIsMapMoved(false);
              }, 100);
            }

            // 제휴점 데이터 가져오기
            fetchPartnerships();
          },
          () => {
            // 제휴점 데이터 가져오기
            fetchPartnerships();
          }
        );
      } else {
        // 제휴점 데이터 가져오기
        fetchPartnerships();
      }

      // 컴포넌트 언마운트 시 정리
      return () => {
        // 모든 마커와 오버레이 제거
        clearPartnershipMarkers();
      };
    };

    // 네이버 지도 API 로드 확인
    waitForNaverMaps();

    // 언어 변경 이벤트 리스너 등록
    const handleMapLanguageChange = () => {
      console.log("언어 변경 감지, 지도 다시 로드");
      // 약간의 지연을 주어 naver 객체가 완전히 교체된 후 지도를 초기화
      setTimeout(waitForNaverMaps, 500);
    };

    window.addEventListener("naverMapLanguageChanged", handleMapLanguageChange);

    // 클린업 함수
    return () => {
      window.removeEventListener(
        "naverMapLanguageChanged",
        handleMapLanguageChange
      );
      if (mapInstance) {
        // 필요한 클린업 로직
        partnershipOverlays.forEach((marker) => {
          marker.setMap(null);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 컴포넌트 마운트 시에만 실행 (새로고침 시에도 지도와 마커가 로드됨)

  // 현재 위치로 돌아가는 함수를 useCallback으로 메모이제이션
  const returnToMyLocation = useCallback(() => {
    if (userPosition && mapInstance) {
      const naverLatLng = new window.naver.maps.LatLng(
        userPosition.lat,
        userPosition.lng
      );
      // 애니메이션 효과를 위해 panTo 사용
      mapInstance.panTo(naverLatLng);
      setIsMapMoved(false);
    }
  }, [userPosition, mapInstance]);

  // 초기 시작 시간 설정 함수
  const getInitialStartTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // 현재 시간이 9시 이전이면 9:00 반환
    if (hours < 9) return "09:00";

    // 현재 시간이 18시 이후면 18:00 반환
    if (hours >= 18) return "18:00";

    // 현재 시간을 30분 단위로 반올림
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    const adjustedHours = roundedMinutes === 60 ? hours + 1 : hours;
    const adjustedMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;

    return `${adjustedHours.toString().padStart(2, "0")}:${adjustedMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  // 영업 시간 체크 함수 수정
  const isOpenDuringTime = (place: any, startTime: string, endTime: string) => {
    // 제휴점의 경우 비즈니스 타입에 따라 영업시간 확인
    if (place.category_group_code === "CS2") {
      // 편의점
      // 24시간 영업 편의점으로 가정
      return true;
    } else if (place.category_group_code === "CE7") {
      // 카페
      const [startHour] = startTime.split(":").map(Number);
      const [endHour] = endTime.split(":").map(Number);
      // 카페 기본 영업시간 08:00-22:00
      return startHour >= 8 && endHour <= 22;
    } else if (place.category_group_code === "FD6") {
      // 식당
      const [startHour] = startTime.split(":").map(Number);
      const [endHour] = endTime.split(":").map(Number);
      // 식당 기본 영업시간 11:00-22:00
      return startHour >= 11 && endHour <= 22;
    } else if (place.category_group_code === "AD5") {
      // 숙박
      // 숙박 시설은 24시간 영업으로 가정
      return true;
    }

    // 기본 영업시간 09:00-18:00
    const [startHour] = startTime.split(":").map(Number);
    const [endHour] = endTime.split(":").map(Number);
    return startHour >= 9 && endHour <= 18;
  };

  // 검색 결과 필터링 함수
  const filterPlacesByTime = (
    places: any[],
    startTime: string,
    endTime: string
  ) => {
    return places.filter((place) =>
      isOpenDuringTime(place, startTime, endTime)
    );
  };

  // 개선된 검색 함수 - 카카오 API 추가로 건물, 지하철역, 장소명 모두 검색 가능
  const performSearch = async (keyword: string) => {
    if (!keyword.trim()) return;

    try {
      // 1. 카카오 키워드 검색 API 호출
      const kakaoResults = await searchWithKakaoAPI(keyword);

      // 2. 네이버 Geocoding API로 주소 검색 (기존 유지)
      if (window.naver?.maps?.Service) {
        window.naver.maps.Service.geocode(
          {
            query: keyword,
          },
          (status: any, response: any) => {
            if (status === window.naver.maps.Service.Status.OK) {
              const results = response.v2.addresses;
              if (results.length > 0) {
                const firstResult = results[0];

                // 좌표 타입 변환 확실히 하기
                const lat = parseFloat(firstResult.y);
                const lng = parseFloat(firstResult.x);

                // 유효한 좌표인지 확인
                if (!isNaN(lat) && !isNaN(lng)) {
                  const moveLatLng = new window.naver.maps.LatLng(lat, lng);

                  // 지도 이동 및 줌 조정
                  if (mapInstance) {
                    const currentZoom = mapInstance.getZoom();
                    const targetZoom = Math.max(16, currentZoom); // 최소 줌 레벨을 16으로 상향 조정

                    // 지도 중심 이동
                    mapInstance.setCenter(moveLatLng);

                    // 줌 레벨 조정 (이동 완료 후)
                    setTimeout(() => {
                      mapInstance.setZoom(targetZoom); // 조건 없이 목표 줌 레벨로 설정
                    }, 300); // 지도 이동 완료를 위한 시간 단축

                    console.log(
                      `네이버 Geocoding 결과로 이동: ${
                        firstResult.roadAddress || firstResult.jibunAddress
                      } (${lat}, ${lng}) - 줌 레벨: ${targetZoom}`
                    );
                  }
                } else {
                  console.error(
                    "네이버 Geocoding 유효하지 않은 좌표:",
                    firstResult.x,
                    firstResult.y
                  );
                }
              }
            }
          }
        );
      }

      // 3. 제휴점 필터링
      const filteredPartnerships = partnerships.filter((p) => {
        const searchLower = keyword.toLowerCase();
        return (
          p.businessName.toLowerCase().includes(searchLower) ||
          p.address.toLowerCase().includes(searchLower)
        );
      });

      const convertedPartnerships = filteredPartnerships.map((p) => ({
        place_name: p.businessName,
        address_name: p.address,
        phone: p.phone,
        category_group_code: getCategoryCodeFromBusinessType(p.businessType),
        x: p.longitude.toString(),
        y: p.latitude.toString(),
        opening_hours: p.is24Hours
          ? t('open24Hours')
          : formatBusinessHours(p.businessHours),
      }));

      // 4. 제휴점만 검색 결과로 사용 (카카오 API 결과는 지도 이동 참고용으로만 사용)
      const allResults = convertedPartnerships; // 제휴점만 사용

      // 4.5. 검색 결과 우선순위 정렬 (정확도 순) - 제휴점 기준으로 정렬
      const sortedResults = allResults.sort((a, b) => {
        const keywordLower = keyword.toLowerCase();
        const aNameLower = a.place_name.toLowerCase();
        const bNameLower = b.place_name.toLowerCase();

        // 1순위: 정확히 일치하는 이름
        if (aNameLower === keywordLower && bNameLower !== keywordLower)
          return -1;
        if (bNameLower === keywordLower && aNameLower !== keywordLower)
          return 1;

        // 2순위: 이름이 검색어로 시작하는 경우
        if (
          aNameLower.startsWith(keywordLower) &&
          !bNameLower.startsWith(keywordLower)
        )
          return -1;
        if (
          bNameLower.startsWith(keywordLower) &&
          !aNameLower.startsWith(keywordLower)
        )
          return 1;

        // 3순위: 이름에 검색어가 포함된 경우
        if (
          aNameLower.includes(keywordLower) &&
          !bNameLower.includes(keywordLower)
        )
          return -1;
        if (
          bNameLower.includes(keywordLower) &&
          !aNameLower.includes(keywordLower)
        )
          return 1;

        // 4순위: 비즈니스 타입별 우선순위 (카페 > 편의점 > 숙박 > 식당)
        const categoryPriority = {
          CE7: 1, // 카페
          CS2: 2, // 편의점
          AD5: 3, // 숙박
          FD6: 4, // 식당
          ETC: 5, // 기타
        };

        const aPriority =
          categoryPriority[
            a.category_group_code as keyof typeof categoryPriority
          ] || 5;
        const bPriority =
          categoryPriority[
            b.category_group_code as keyof typeof categoryPriority
          ] || 5;

        return aPriority - bPriority;
      });

      // 5. 시간에 따른 필터링
      const timeFilteredPlaces = filterPlacesByTime(
        sortedResults,
        startTime,
        endTime
      );
      setSearchResults(timeFilteredPlaces);

      // 6. 검색 결과가 있으면 첫 번째 결과로 자동 이동하지만 선택하지는 않음
      if (timeFilteredPlaces.length > 0) {
        const firstPlace = timeFilteredPlaces[0];

        // 지도를 첫 번째 결과 위치로 이동
        if (mapInstance && firstPlace.x && firstPlace.y) {
          // 좌표 타입 변환 확실히 하기
          const lat = parseFloat(firstPlace.y);
          const lng = parseFloat(firstPlace.x);

          // 유효한 좌표인지 확인
          if (!isNaN(lat) && !isNaN(lng)) {
            const moveLatLng = new window.naver.maps.LatLng(lat, lng);

            // 현재 줌 레벨 저장
            const currentZoom = mapInstance.getZoom();
            const targetZoom = Math.max(16, currentZoom); // 최소 줌 레벨을 16으로 상향 조정

            // 지도 이동 완료 후 줌 조정
            const moveToLocation = () => {
              // 1단계: 지도 중심 이동
              mapInstance.setCenter(moveLatLng);

              // 2단계: 줌 레벨 조정 (이동 완료 후)
              setTimeout(() => {
                mapInstance.setZoom(targetZoom); // 조건 없이 목표 줌 레벨로 설정
              }, 300); // 지도 이동 완료를 위한 시간 단축
            };

            // 즉시 이동 (지연 시간 제거)
            moveToLocation();

            console.log(
              `제휴점으로 지도 이동: ${firstPlace.place_name} (${lat}, ${lng}) - 줌 레벨: ${targetZoom}`
            );
          } else {
            console.error("유효하지 않은 좌표:", firstPlace.x, firstPlace.y);
          }
        }

        // 첫 번째 결과를 자동으로 선택하지 않고 목록 표시
        setSelectedPlace(null);

        console.log(
          `"${keyword}" 검색 완료: ${timeFilteredPlaces.length}개 제휴점 목록 표시`
        );
      } else {
        // 제휴점 검색 결과가 없는 경우, 카카오 API 결과로 지도만 이동
        if (kakaoResults.length > 0) {
          const firstKakaoPlace = kakaoResults[0];
          if (mapInstance && firstKakaoPlace.x && firstKakaoPlace.y) {
            const lat = parseFloat(firstKakaoPlace.y);
            const lng = parseFloat(firstKakaoPlace.x);

            if (!isNaN(lat) && !isNaN(lng)) {
              const moveLatLng = new window.naver.maps.LatLng(lat, lng);
              mapInstance.setCenter(moveLatLng);
              mapInstance.setZoom(16);
              console.log(
                `제휴점 없음 - 카카오 검색 결과로 지도만 이동: ${firstKakaoPlace.place_name}`
              );
            }
          }
        }

        setSelectedPlace(null);
        console.log(`"${keyword}" 검색 결과: 제휴점 없음`);
      }
    } catch (error) {
      console.error("검색 중 오류 발생:", error);

      // 카카오 API 실패 시 제휴점만 검색
      const filteredPartnerships = partnerships.filter((p) => {
        const searchLower = keyword.toLowerCase();
        return (
          p.businessName.toLowerCase().includes(searchLower) ||
          p.address.toLowerCase().includes(searchLower)
        );
      });

      const convertedPartnerships = filteredPartnerships.map((p) => ({
        place_name: p.businessName,
        address_name: p.address,
        phone: p.phone,
        category_group_code: getCategoryCodeFromBusinessType(p.businessType),
        x: p.longitude.toString(),
        y: p.latitude.toString(),
        opening_hours: p.is24Hours
          ? t('open24Hours')
          : formatBusinessHours(p.businessHours),
      }));

      const timeFilteredPlaces = filterPlacesByTime(
        convertedPartnerships,
        startTime,
        endTime
      );
      setSearchResults(timeFilteredPlaces);

      // 제휴점 검색 결과가 있으면 첫 번째 결과로 이동
      if (timeFilteredPlaces.length > 0) {
        const firstPlace = timeFilteredPlaces[0];

        if (mapInstance && firstPlace.x && firstPlace.y) {
          // 좌표 타입 변환 확실히 하기
          const lat = parseFloat(firstPlace.y);
          const lng = parseFloat(firstPlace.x);

          // 유효한 좌표인지 확인
          if (!isNaN(lat) && !isNaN(lng)) {
            const moveLatLng = new window.naver.maps.LatLng(lat, lng);

            // 지도 이동 및 줌 조정
            const currentZoom = mapInstance.getZoom();
            const targetZoom = Math.max(16, currentZoom); // 최소 줌 레벨을 16으로 상향 조정

            // 지도 중심 이동
            mapInstance.setCenter(moveLatLng);

            // 줌 레벨 조정 (이동 완료 후)
            setTimeout(() => {
              mapInstance.setZoom(targetZoom); // 조건 없이 목표 줌 레벨로 설정
            }, 300); // 지도 이동 완료를 위한 시간 단축

            console.log(
              `제휴점 검색 결과로 이동: ${firstPlace.place_name} (${lat}, ${lng}) - 줌 레벨: ${targetZoom}`
            );
          } else {
            console.error(
              "제휴점 유효하지 않은 좌표:",
              firstPlace.x,
              firstPlace.y
            );
          }
        }

        setSelectedPlace(null);
        console.log(
          `"${keyword}" 제휴점 검색 완료: ${timeFilteredPlaces.length}개 제휴점 목록 표시`
        );
      } else {
        setSelectedPlace(null);
        console.log(`"${keyword}" 검색 결과: 제휴점 없음`);
      }
    }
  };

  // 카카오 API를 사용한 검색 함수
  const searchWithKakaoAPI = async (keyword: string) => {
    // 전역 변수에서 카카오 API 키 가져오기
    const apiKey = window.KAKAO_REST_API_KEY;

    if (!apiKey || apiKey === "your_kakao_rest_api_key_here") {
      console.warn(
        "카카오 API 키가 설정되지 않았습니다. App.tsx에서 KAKAO_REST_API_KEY를 실제 키로 교체해주세요."
      );
      return [];
    }

    try {
      // 키워드로 장소 검색 - 직접 API 호출
      const keywordResponse = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
          keyword
        )}&size=15`,
        {
          headers: {
            Authorization: `KakaoAK ${apiKey}`,
          },
        }
      );

      if (!keywordResponse.ok) {
        throw new Error("카카오 키워드 검색 API 호출 실패");
      }

      const keywordData = await keywordResponse.json();
      const keywordResults = keywordData.documents || [];

      // 카테고리별 추가 검색 (지하철역, 건물 등)
      const categorySearches = [];

      // 지하철역 검색
      if (
        keyword.includes("역") ||
        keyword.includes("지하철") ||
        keyword.includes("subway")
      ) {
        categorySearches.push(
          fetch(
            `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=SW8&query=${encodeURIComponent(
              keyword
            )}&radius=20000`,
            {
              headers: {
                Authorization: `KakaoAK ${apiKey}`,
              },
            }
          )
        );
      }

      // 관광명소/건물 검색
      if (
        keyword.includes("빌딩") ||
        keyword.includes("타워") ||
        keyword.includes("센터") ||
        keyword.includes("몰") ||
        keyword.includes("플라자")
      ) {
        categorySearches.push(
          fetch(
            `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=AT4&query=${encodeURIComponent(
              keyword
            )}&radius=20000`,
            {
              headers: {
                Authorization: `KakaoAK ${apiKey}`,
              },
            }
          )
        );
      }

      // 카페 검색
      if (
        keyword.includes("카페") ||
        keyword.includes("커피") ||
        keyword.includes("스타벅스") ||
        keyword.includes("이디야")
      ) {
        categorySearches.push(
          fetch(
            `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=CE7&query=${encodeURIComponent(
              keyword
            )}&radius=20000`,
            {
              headers: {
                Authorization: `KakaoAK ${apiKey}`,
              },
            }
          )
        );
      }

      // 편의점 검색
      if (
        keyword.includes("편의점") ||
        keyword.includes("GS25") ||
        keyword.includes("CU") ||
        keyword.includes("세븐일레븐")
      ) {
        categorySearches.push(
          fetch(
            `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=CS2&query=${encodeURIComponent(
              keyword
            )}&radius=20000`,
            {
              headers: {
                Authorization: `KakaoAK ${apiKey}`,
              },
            }
          )
        );
      }

      // 모든 카테고리 검색 결과 수집
      const categoryResults = await Promise.all(categorySearches);
      const allCategoryData = [];

      for (const response of categoryResults) {
        if (response.ok) {
          const data = await response.json();
          allCategoryData.push(...(data.documents || []));
        }
      }

      // 모든 카카오 검색 결과 합치기
      const allKakaoResults = [...keywordResults, ...allCategoryData];

      // 중복 제거 (place_name과 address_name 기준)
      const uniqueResults = allKakaoResults.filter(
        (place, index, self) =>
          index ===
          self.findIndex(
            (p) =>
              p.place_name === place.place_name &&
              p.address_name === place.address_name
          )
      );

      // 결과를 우리 형식으로 변환
      return uniqueResults.map((place) => ({
        place_name: place.place_name,
        address_name: place.address_name,
        phone: place.phone || "",
        category_group_code:
          place.category_group_code ||
          getCategoryFromKeyword(keyword, place.category_name),
        x: place.x,
        y: place.y,
        opening_hours: t('noOperatingHours'),
        place_url: place.place_url || "",
      }));
    } catch (error) {
      console.error("카카오 API 검색 오류:", error);
      return [];
    }
  };

  // 키워드와 카테고리에 따른 카테고리 코드 반환
  const getCategoryFromKeyword = (keyword: string, category: string) => {
    const keywordLower = keyword.toLowerCase();

    // 지하철역 검색
    if (
      keywordLower.includes("역") ||
      keywordLower.includes("지하철") ||
      keywordLower.includes("subway")
    ) {
      return "SW8"; // 지하철역
    }

    // 건물/랜드마크 검색
    if (
      keywordLower.includes("빌딩") ||
      keywordLower.includes("타워") ||
      keywordLower.includes("센터") ||
      keywordLower.includes("몰") ||
      keywordLower.includes("플라자")
    ) {
      return "AT4"; // 관광명소/건물
    }

    // 카테고리 기반 분류
    if (category) {
      if (category.includes("카페") || category.includes("커피")) return "CE7";
      if (category.includes("편의점")) return "CS2";
      if (category.includes("숙박") || category.includes("호텔")) return "AD5";
      if (category.includes("음식") || category.includes("식당")) return "FD6";
    }

    return "ETC";
  };

  // searchPlaces 함수 수정 - performSearch 사용
  const searchPlaces = () => {
    if (!searchKeyword.trim()) return;
    performSearch(searchKeyword);
  };

  // 거리 계산 함수 추가 (위도/경도 좌표 간의 거리를 km 단위로 계산)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // 지구 반경 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 제휴점 내에서만 검색하는 함수 분리
  const searchPartnerships = () => {
    // 매장명/주소로 제휴점 검색
    const filteredPartnerships = partnerships.filter((p) => {
      // 검색어와 비즈니스 이름 또는 주소가 부분적으로 일치하는지 확인 (대소문자 무시)
      return (
        p.businessName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.address.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    });

    // 매장명 또는 주소로 매장을 찾은 경우
    if (filteredPartnerships.length > 0) {
      // 첫 번째 매칭된 매장으로 지도 이동
      const firstMatch = filteredPartnerships[0];
      const moveLatLng = new window.naver.maps.LatLng(
        firstMatch.latitude,
        firstMatch.longitude
      );

      // 부드러운 이동 처리
      if (mapInstance) {
        // 현재 줌 레벨 저장
        const currentZoom = mapInstance.getZoom();

        // 1단계: 먼저 위치 이동
        mapInstance.setCenter(moveLatLng);

        // 2단계: 이동 후 애니메이션 효과 (줌 아웃 후 줌 인)
        setTimeout(() => {
          // 줌 아웃
          mapInstance.setZoom(currentZoom - 1);

          // 잠시 후 다시 원래 줌으로
          setTimeout(() => {
            mapInstance.setZoom(currentZoom);
          }, 250);
        }, 50);
      }

      // partnerships를 place 형식으로 변환하여 검색 결과에 추가
      const convertedPlaces = filteredPartnerships.map((p) => ({
        place_name: p.businessName,
        address_name: p.address,
        phone: p.phone,
        category_group_code: getCategoryCodeFromBusinessType(p.businessType),
        x: p.longitude.toString(),
        y: p.latitude.toString(),
        opening_hours: p.is24Hours
          ? t('open24Hours')
          : formatBusinessHours(p.businessHours),
      }));

      // 시간에 따른 필터링
      const timeFilteredPlaces = filterPlacesByTime(
        convertedPlaces,
        startTime,
        endTime
      );
      setSearchResults(timeFilteredPlaces);
      setSelectedPlace(null);
    } else {
      alert(t('noSearchResults'));
    }
  };

  // 비즈니스 타입에 따른 카테고리 코드 반환 함수
  const getCategoryCodeFromBusinessType = (businessType: string): string => {
    switch (businessType) {
      case "카페":
      case t('cafe'):
        return "CE7";
      case "편의점":
      case t('convenienceStore'):
        return "CS2";
      case "숙박":
      case t('accommodation'):
        return "AD5";
      case "식당":
      case t('restaurant'):
        return "FD6";
      default:
        return "ETC";
    }
  };

  // 영업 시간 포맷팅 함수 (문자열 반환)
  const formatBusinessHours = (
    businessHours: Record<string, BusinessHourDto | string> | undefined
  ): string => {
    if (!businessHours || Object.keys(businessHours).length === 0) {
      return t('noOperatingHours');
    }

    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const dayNames = {
      'MONDAY': '월',
      'TUESDAY': '화',
      'WEDNESDAY': '수',
      'THURSDAY': '목',
      'FRIDAY': '금',
      'SATURDAY': '토',
      'SUNDAY': '일'
    };

    // 두 가지 데이터 형태 모두 처리
    const enabledDays = dayOrder.filter(day => {
      const dayData = businessHours[day];
      if (!dayData) return false;
      
      // 문자열 형태인 경우 (예: "09:00-18:00")
      if (typeof dayData === 'string') {
        return dayData.trim() !== '' && dayData !== '휴무';
      }
      
      // 객체 형태인 경우 (예: { enabled: true, open: "09:00", close: "18:00" })
      if (typeof dayData === 'object') {
        return dayData.enabled === true;
      }
      
      return false;
    });

    if (enabledDays.length === 0) {
      return t('closed');
    }

    // 연속된 요일과 같은 시간을 그룹화
    const groups: { days: string[], time: string }[] = [];
    let currentGroup: string[] = [];
    let currentTime = '';

    enabledDays.forEach(day => {
      const dayData = businessHours[day];
      let dayTime = '';
      
      // 문자열 형태인 경우
      if (typeof dayData === 'string') {
        dayTime = dayData.replace('-', ' - ');
      }
      // 객체 형태인 경우
      else if (typeof dayData === 'object') {
        dayTime = `${dayData.open} - ${dayData.close}`;
      }
      
      if (currentTime === dayTime) {
        currentGroup.push(dayNames[day as keyof typeof dayNames]);
      } else {
        if (currentGroup.length > 0) {
          groups.push({ days: [...currentGroup], time: currentTime });
        }
        currentGroup = [dayNames[day as keyof typeof dayNames]];
        currentTime = dayTime;
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ days: currentGroup, time: currentTime });
    }

    // 그룹화된 결과를 문자열로 변환
    const result = groups.map(group => {
      if (group.days.length > 2) {
        return `${group.days[0]}~${group.days[group.days.length - 1]} ${group.time}`;
      } else {
        return `${group.days.join(',')} ${group.time}`;
      }
    }).join('\n');

    return result;
  };

  // 영업 시간 포맷팅 함수 (배열 반환 - React에서 세로 표시용)
  const formatBusinessHoursArray = (
    businessHours: Record<string, BusinessHourDto | string> | undefined
  ): string[] => {
    if (!businessHours || Object.keys(businessHours).length === 0) {
      return [t('noOperatingHours')];
    }

    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const dayNames = {
      'MONDAY': '월',
      'TUESDAY': '화',
      'WEDNESDAY': '수',
      'THURSDAY': '목',
      'FRIDAY': '금',
      'SATURDAY': '토',
      'SUNDAY': '일'
    };

    // 두 가지 데이터 형태 모두 처리
    const enabledDays = dayOrder.filter(day => {
      const dayData = businessHours[day];
      if (!dayData) return false;
      
      // 문자열 형태인 경우 (예: "09:00-18:00")
      if (typeof dayData === 'string') {
        return dayData.trim() !== '' && dayData !== '휴무';
      }
      
      // 객체 형태인 경우 (예: { enabled: true, open: "09:00", close: "18:00" })
      if (typeof dayData === 'object') {
        return dayData.enabled === true;
      }
      
      return false;
    });

    if (enabledDays.length === 0) {
      return [t('closed')];
    }

    // 연속된 요일과 같은 시간을 그룹화
    const groups: { days: string[], time: string }[] = [];
    let currentGroup: string[] = [];
    let currentTime = '';

    enabledDays.forEach(day => {
      const dayData = businessHours[day];
      let dayTime = '';
      
      // 문자열 형태인 경우
      if (typeof dayData === 'string') {
        dayTime = dayData.replace('-', ' - ');
      }
      // 객체 형태인 경우
      else if (typeof dayData === 'object') {
        dayTime = `${dayData.open} - ${dayData.close}`;
      }
      
      if (currentTime === dayTime) {
        currentGroup.push(dayNames[day as keyof typeof dayNames]);
      } else {
        if (currentGroup.length > 0) {
          groups.push({ days: [...currentGroup], time: currentTime });
        }
        currentGroup = [dayNames[day as keyof typeof dayNames]];
        currentTime = dayTime;
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ days: currentGroup, time: currentTime });
    }

    // 그룹화된 결과를 배열로 반환
    return groups.map(group => {
      if (group.days.length > 2) {
        return `${group.days[0]}~${group.days[group.days.length - 1]} ${group.time}`;
      } else {
        return `${group.days.join(',')} ${group.time}`;
      }
    });
  };

  // 시간 옵션 생성 함수
  const generateTimeOptions = (
    start: string,
    end: string,
    interval: number = 30
  ) => {
    const times: string[] = [];
    let current = new Date(`2024-01-01 ${start}`);
    const endTime = new Date(`2024-01-01 ${end}`);

    while (current <= endTime) {
      const timeString = current.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      times.push(timeString);
      current = new Date(current.getTime() + interval * 60000);
    }

    return times;
  };

  // 종료 시간 옵션 생성 함수
  const getEndTimeOptions = (selectedStartTime: string) => {
    const [hours, minutes] = selectedStartTime.split(":");
    const startDate = new Date();
    startDate.setHours(parseInt(hours), parseInt(minutes));
    const nextTime = new Date(startDate.getTime() + 30 * 60000);
    const nextTimeString = nextTime.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return generateTimeOptions(nextTimeString, "24:00");
  };

  // 보관 시간 텍스트 계산 함수 수정
  const calculateStorageTimeText = () => {
    if (!storageDate || !storageStartTime || !storageEndTime) {
      return t("selectDateAndTime");
    }

    // 날짜 포맷팅
    const formatDate = (date: string) => {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${month}${t("month")} ${day}${t("day")}`;
    };

    // 시간 포맷팅
    const formatTime = (time: string) => {
      if (!time) return "";
      const [hours, minutes] = time.split(":");
      return `${hours}:${minutes}`;
    };

    if (storageDuration === "day") {
      return `${formatDate(storageDate)} ${formatTime(
        storageStartTime
      )} ~ ${formatTime(storageEndTime)}`;
    } else {
      if (!storageEndDate) {
        return t("selectAllDateAndTime");
      }
      return `${formatDate(storageDate)} ${formatTime(
        storageStartTime
      )} ~ ${formatDate(storageEndDate)} ${formatTime(storageEndTime)}`;
    }
  };

  // 가방 가격 계산 함수 수정
  const calculateTotalPrice = (bags: {
    small: number;
    medium: number;
    large: number;
  }) => {
    // 기본 하루 가격
    const basePrice =
      bags.small * 3000 + bags.medium * 5000 + bags.large * 8000;

    // 가방을 선택하지 않은 경우
    if (basePrice === 0) {
      return 0;
    }

    // 당일 보관이면 기본 가격 그대로 반환
    if (storageDuration === "day") {
      return basePrice;
    }

    // 기간 보관일 경우 날짜 차이 계산
    if (!storageDate || !storageEndDate) {
      return basePrice; // 날짜가 선택되지 않은 경우 기본 가격
    }

    try {
      // 날짜 비교를 위해 날짜 객체 생성
      const startDate = new Date(storageDate);
      const endDate = new Date(storageEndDate);

      // 유효한 날짜인지 확인
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log("날짜 변환 오류");
        return basePrice;
      }

      // 날짜 차이 계산 (밀리초 → 일)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 최소 1일 이상으로 계산
      const days = Math.max(1, diffDays);

      console.log(
        `보관 일수: ${days}일, 기본 가격: ${basePrice}원, 총 가격: ${
          basePrice * days
        }원`
      );

      return basePrice * days;
    } catch (error) {
      console.error("날짜 계산 오류:", error);
      return basePrice;
    }
  };

  // useEffect로 가격 갱신 감시
  useEffect(() => {
    if (bagSizes.small > 0 || bagSizes.medium > 0 || bagSizes.large > 0) {
      const price = calculateTotalPrice(bagSizes);
      setTotalPrice(price);
    }
  }, [bagSizes, storageDuration, storageDate, storageEndDate]);

  // 운영 시간 추출 함수
  const getPlaceOperatingHours = (place: any) => {
    // 먼저 실제 파트너십 데이터에서 영업시간 확인
    if (place && partnerships.length > 0) {
      const partnership = partnerships.find(
        (p) =>
          p.businessName === place.place_name &&
          p.address === place.address_name
      );

      if (partnership) {
        // 24시간 영업인 경우
        if (partnership.is24Hours) {
          return {
            start: "00:00",
            end: "23:59",
          };
        }

        // 영업시간이 설정되어 있는 경우
        if (
          partnership.businessHours &&
          Object.keys(partnership.businessHours).length > 0
        ) {
          // 현재 요일 또는 첫 번째 영업일의 시간 사용
          const today = new Date().getDay(); // 0: 일요일, 1: 월요일, ...
          const dayNames = [
            "SUNDAY",
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
          ];
          const todayName = dayNames[today];

          // 오늘의 영업시간이 있으면 사용
          const todayHours = partnership.businessHours[todayName];
          if (todayHours) {
            // 문자열 형태인 경우 (예: "09:00-18:00")
            if (typeof todayHours === 'string' && todayHours.trim() !== '' && todayHours !== '휴무') {
              const [start, end] = todayHours.split('-').map(time => time.trim());
              return { start, end };
            }
            // 객체 형태인 경우 (예: { enabled: true, open: "09:00", close: "18:00" })
            else if (typeof todayHours === 'object' && todayHours.enabled) {
              return {
                start: todayHours.open,
                end: todayHours.close,
              };
            }
          }

          // 오늘 영업하지 않으면 첫 번째 영업일의 시간 사용
          for (const dayName of dayNames) {
            const dayHours = partnership.businessHours[dayName];
            if (dayHours) {
              // 문자열 형태인 경우
              if (typeof dayHours === 'string' && dayHours.trim() !== '' && dayHours !== '휴무') {
                const [start, end] = dayHours.split('-').map(time => time.trim());
                return { start, end };
              }
              // 객체 형태인 경우
              else if (typeof dayHours === 'object' && dayHours.enabled) {
                return {
                  start: dayHours.open,
                  end: dayHours.close,
                };
              }
            }
          }
        }
      }
    }

    // 파트너십 데이터가 없는 경우 기존 로직 사용 (카테고리 기반)
    if (place.category_group_code === "BK9") {
      return {
        start: "09:00",
        end: "16:00",
      };
    } else if (place.category_group_code === "CS2") {
      if (
        place.place_name.includes("GS25") ||
        place.place_name.includes("CU") ||
        place.place_name.includes("세븐일레븐")
      ) {
        return {
          start: "00:00",
          end: "23:59",
        };
      } else {
        return {
          start: "09:00",
          end: "22:00",
        };
      }
    }

    // 기본값
    return {
      start: "09:00",
      end: "18:00",
    };
  };

  // 선택된 날짜가 휴무인지 확인하는 함수
  const isClosedOnDate = (dateStr: string) => {
    if (!selectedPlace || !partnerships.length || !dateStr) {
      return false;
    }

    const partnership = partnerships.find(
      (p) =>
        p.businessName === selectedPlace.place_name &&
        p.address === selectedPlace.address_name
    );

    if (!partnership || partnership.is24Hours) {
      return false; // 24시간 영업이면 휴무일 없음
    }

    if (
      !partnership.businessHours ||
      Object.keys(partnership.businessHours).length === 0
    ) {
      return false; // 영업시간 정보가 없으면 휴무일 아님
    }

    // 선택된 날짜의 요일 확인 - 시간대 문제 해결을 위해 로컬 날짜로 파싱
    const [year, month, day] = dateStr.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day); // month는 0부터 시작하므로 -1
    const dayOfWeek = selectedDate.getDay(); // 0: 일요일, 1: 월요일, ...
    const dayNames = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const dayName = dayNames[dayOfWeek];

    // 디버깅을 위한 로그
    console.log("날짜 체크:", {
      dateStr,
      selectedDate: selectedDate.toDateString(),
      dayOfWeek,
      dayName,
      businessHours: partnership.businessHours,
      dayHours: partnership.businessHours[dayName],
      isEnabled: partnership.businessHours[dayName]?.enabled,
    });

    const dayHours = partnership.businessHours[dayName];

    // businessHours가 문자열 형태인지 객체 형태인지 확인
    if (typeof dayHours === "string") {
      // 문자열 형태면 영업시간이 설정되어 있으므로 영업일
      return false;
    } else if (typeof dayHours === "object" && dayHours !== null) {
      // 객체 형태면 enabled 속성 확인
      return !dayHours.enabled;
    } else {
      // dayHours가 없으면 휴무일
      return true;
    }
  };

  // 현재 시간 기준으로 영업중인지 확인하는 함수
  const isCurrentlyOpen = (place: any) => {
    if (!place) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // 현재 시간을 분 단위로 변환
    const today = now.getDay(); // 0: 일요일, 1: 월요일, ...
    
    // 파트너십 데이터에서 영업시간 확인
    if (partnerships.length > 0) {
      const partnership = partnerships.find(
        (p) =>
          p.businessName === place.place_name &&
          p.address === place.address_name
      );

      if (partnership) {
        // 24시간 영업인 경우
        if (partnership.is24Hours) {
          return true;
        }

        // 영업시간이 설정되어 있는 경우
        if (partnership.businessHours && Object.keys(partnership.businessHours).length > 0) {
          const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
          const todayName = dayNames[today];
          const todayHours = partnership.businessHours[todayName];

          if (todayHours) {
            let startTime = "";
            let endTime = "";

            // 문자열 형태인 경우 (예: "09:00-18:00")
            if (typeof todayHours === 'string' && todayHours.trim() !== '' && todayHours !== '휴무') {
              [startTime, endTime] = todayHours.split('-').map(time => time.trim());
            }
            // 객체 형태인 경우 (예: { enabled: true, open: "09:00", close: "18:00" })
            else if (typeof todayHours === 'object' && todayHours.enabled) {
              startTime = todayHours.open;
              endTime = todayHours.close;
            } else {
              return false; // 오늘은 휴무
            }

            if (startTime && endTime) {
              const [startHour, startMin] = startTime.split(":").map(Number);
              const [endHour, endMin] = endTime.split(":").map(Number);
              const startMinutes = startHour * 60 + startMin;
              const endMinutes = endHour * 60 + endMin;

              return currentTime >= startMinutes && currentTime <= endMinutes;
            }
          } else {
            return false; // 오늘은 휴무
          }
        }
      }
    }

    // 파트너십 데이터가 없는 경우 기본 영업시간으로 판단
    const operatingHours = getPlaceOperatingHours(place);
    if (operatingHours) {
      const [startHour, startMin] = operatingHours.start.split(":").map(Number);
      const [endHour, endMin] = operatingHours.end.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      return currentTime >= startMinutes && currentTime <= endMinutes;
    }

    return false;
  };

  // 시간대 유효성 검사 함수
  const validateStorageTime = () => {
    if (!selectedPlace || !storageStartTime || !storageEndTime) {
      setIsTimeValid(false);
      return false;
    }

    // 휴무일 체크
    if (isClosedOnDate(storageDate)) {
      setIsTimeValid(false);
      return false;
    }

    // 기간 보관의 경우 종료일도 체크
    if (
      storageDuration === "period" &&
      storageEndDate &&
      isClosedOnDate(storageEndDate)
    ) {
      setIsTimeValid(false);
      return false;
    }

    const operatingHours = getPlaceOperatingHours(selectedPlace);

    // 시간 문자열을 분 단위로 변환
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startInMinutes = timeToMinutes(storageStartTime);
    const endInMinutes = timeToMinutes(storageEndTime);
    const operationStartInMinutes = timeToMinutes(operatingHours.start);
    const operationEndInMinutes = timeToMinutes(operatingHours.end);

    // 시작 및 종료 시간이 운영시간 내에 있는지 검사
    const isValid =
      startInMinutes >= operationStartInMinutes &&
      endInMinutes <= operationEndInMinutes &&
      startInMinutes < endInMinutes;

    setIsTimeValid(isValid);
    return isValid;
  };

  // 시간 변경 시 유효성 검증
  useEffect(() => {
    if (selectedPlace && storageStartTime && storageEndTime) {
      validateStorageTime();
    }
  }, [
    selectedPlace,
    storageStartTime,
    storageEndTime,
    storageDate,
    storageEndDate,
    partnerships,
  ]);

  // 날짜 포맷 함수
  const formatReservationDate = (dateStr: string) => {
    if (!dateStr) return "";

    try {
      const [year, month, day] = dateStr.split("-");

      // Modified: Display same start/end date for same-day reservation
      if (storageDuration === "day") {
        return `${year}${t("year")} ${month}${t("month")} ${day}${t("day")}`;
      } else {
        const [endYear, endMonth, endDay] = storageEndDate ? storageEndDate.split("-") : ["", "", ""];
        
        if (!storageEndDate)
          return `${year}${t("year")} ${month}${t("month")} ${day}${t(
            "day"
          )}`;

        return `${year}${t("year")} ${month}${t("month")} ${day}${t(
          "day"
        )} ~ ${endYear}${t("year")} ${endMonth}${t("month")} ${endDay}${t(
          "day"
        )}`;
      }
    } catch (e) {
      return dateStr;
    }
  };

  // 시간 포맷 함수
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";

    try {
      const [hours, minutes] = timeStr.split(":");
      return `${hours}:${minutes}`;
    } catch (e) {
      return timeStr;
    }
  };

  // 가방 요약 문자열 생성 함수
  const getBagSummary = () => {
    const bagsArray = [];

    if (bagSizes.small > 0) {
      bagsArray.push(`${t("smallBag")} ${bagSizes.small}${t("pieces")}`);
    }

    if (bagSizes.medium > 0) {
      bagsArray.push(`${t("mediumBag")} ${bagSizes.medium}${t("pieces")}`);
    }

    if (bagSizes.large > 0) {
      bagsArray.push(`${t("largeBag")} ${bagSizes.large}${t("pieces")}`);
    }

    return bagsArray.join(", ") || t("none");
  };

  // 예약 번호 생성 함수
  const generateReservationNumber = () => {
    const timestamp = Date.now().toString();
    return `TL${timestamp.slice(-8)}`;
  };

  // 포트원 결제 ID 생성 함수
  const generatePortonePaymentId = () => {
    return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, "0"))
      .join("");
  };

  // 결제 폼 유효성 검사 함수
  const isPaymentFormValid = () => {
    if (!selectedPlace) {
      setReservationError(t('selectPlease'));
      return false;
    }

    if (!storageDate) {
      setReservationError(t('selectStorageDate'));
      return false;
    }

    if (!storageStartTime) {
      setReservationError(t('selectStorageStartTime'));
      return false;
    }

    if (!storageEndTime) {
      setReservationError(t('selectStorageEndTime'));
      return false;
    }

    if (storageDuration === "period" && !storageEndDate) {
      setReservationError(t('selectStorageEndDate'));
      return false;
    }

    if (bagSizes.small === 0 && bagSizes.medium === 0 && bagSizes.large === 0) {
      setReservationError(t('selectAtLeastOneBag'));
      return false;
    }

    if (totalPrice <= 0) {
      setReservationError(t('invalidPaymentAmount'));
      return false;
    }

    if (!user) {
      setReservationError(t('loginRequired'));
      return false;
    }

    return true;
  };

  // 쿠폰 모달 열기
  const handleOpenCouponModal = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    setIsCouponModalOpen(true);
  };

  // 쿠폰 선택 시 처리
  const handleSelectCoupon = async (coupon: UserCoupon) => {
    if (!user) {
      setCouponError("로그인이 필요합니다.");
      return;
    }

    setIsCouponApplying(true);
    setCouponError("");

    try {
      // 쿠폰 검증 API 호출
      const response = await axios.post(
        '/api/user-coupons/validate',
        {
          userId: user.id,
          couponCode: coupon.code,
          purchaseAmount: totalPrice
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (response.data.success) {
        const couponData = response.data.data;
        setCouponCode(coupon.code);
        setAppliedCoupon(couponData);
        setCouponDiscount(couponData.discountAmount);
        setCouponError("");
        setCouponSuccess(`쿠폰이 적용되었습니다! ${couponData.discountAmount.toLocaleString()}원 할인`);
      }
    } catch (error: any) {
      console.error("쿠폰 검증 오류:", error);
      const errorMessage = error.response?.data?.message || "쿠폰 적용에 실패했습니다.";
      setCouponError(errorMessage);
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setIsCouponApplying(false);
    }
  };

  // 쿠폰 적용 취소 함수
  const removeCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError("");
  };

  // 예약 정보를 서버로 전송하는 함수
  const submitReservation = async (paymentId?: string) => {
    if (!isAuthenticated || !user) {
      console.error(t("loginRequired"));
      setReservationError(t("loginRequiredMessage"));
      return false;
    }

    // 보관 가능한 개수 검증 (실시간 용량 기반)
    if (
      bagSizes.small > realTimeCapacity.small ||
      bagSizes.medium > realTimeCapacity.medium ||
      bagSizes.large > realTimeCapacity.large
    ) {
      setReservationError(
        "선택한 짐의 개수가 매장의 보관 가능한 개수를 초과했습니다."
      );
      return false;
    }

    try {
      const reservationNumber = generateReservationNumber();

      // 사용자 정보 확인
      console.log("현재 로그인된 사용자 정보:", user);

      // 필수 데이터 검증
      if (!selectedPlace) {
        setReservationError(t('noSelectedPlace'));
        return false;
      }

      if (!storageDate || !storageStartTime || !storageEndTime) {
        setReservationError(t('selectDateAndTimeAll'));
        return false;
      }

      // 날짜 형식 변환 (yyyy-MM-dd)
      const formatDateForServer = (dateString: string) => {
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
          }
          return date.toISOString().split("T")[0]; // yyyy-MM-dd 형식으로 변환
        } catch (error) {
          console.error("날짜 형식 변환 오류:", dateString, error);
          return dateString; // 원본 반환
        }
      };

      // 시간 형식 변환 (HH:mm:ss)
      const formatTimeForServer = (timeString: string) => {
        // 이미 HH:mm 형식이면 :00 초를 추가
        if (timeString && !timeString.includes(":00")) {
          return timeString + ":00";
        }
        return timeString;
      };

      // 쿠폰 할인을 적용한 최종 결제 금액 계산
      const finalPrice = totalPrice - couponDiscount;

      // 예약 데이터 구성
      const reservationData = {
        userId: typeof user.id === "string" ? parseInt(user.id, 10) : user.id,
        userEmail: user.email || "",
        userName: user.name || "",
        placeName: selectedPlace.place_name || "",
        placeAddress: selectedPlace.address_name || "",
        reservationNumber: reservationNumber,
        storageDate: formatDateForServer(storageDate),
        storageEndDate:
          storageDuration === "period" && storageEndDate
            ? formatDateForServer(storageEndDate)
            : formatDateForServer(storageDate),
        storageStartTime: formatTimeForServer(storageStartTime),
        storageEndTime: formatTimeForServer(storageEndTime),
        smallBags: bagSizes.small || 0,
        mediumBags: bagSizes.medium || 0,
        largeBags: bagSizes.large || 0,
        totalPrice: finalPrice || 0,
        storageType: storageDuration || "daily",
        status: "RESERVED",
        paymentId: paymentId || portonePaymentId,
        couponCode: appliedCoupon ? couponCode.trim().toUpperCase() : null,
        couponName: appliedCoupon ? appliedCoupon.couponName : null,
        couponDiscount: appliedCoupon ? couponDiscount : null,
        originalPrice: appliedCoupon ? totalPrice : null,
      };

      // 데이터 검증 로그
      console.log("=== 예약 데이터 검증 ===");
      console.log(
        "userId:",
        reservationData.userId,
        typeof reservationData.userId
      );
      console.log("userEmail:", reservationData.userEmail);
      console.log("userName:", reservationData.userName);
      console.log("placeName:", reservationData.placeName);
      console.log("placeAddress:", reservationData.placeAddress);
      console.log("storageDate:", reservationData.storageDate);
      console.log("storageEndDate:", reservationData.storageEndDate);
      console.log("storageStartTime:", reservationData.storageStartTime);
      console.log("storageEndTime:", reservationData.storageEndTime);
      console.log("totalPrice:", reservationData.totalPrice);
      console.log("=========================");

      console.log("예약 데이터 전송:", reservationData);

      // 상대 경로로 변경하여 배포 환경에서도 동작하도록 수정
      const response = await axios.post(
        "/api/reservations",
        reservationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10초 타임아웃
        }
      );

      console.log("예약 저장 성공:", response.data);
      setSubmittedReservation(response.data);
      setReservationSuccess(true);
      return response.data;
    } catch (error) {
      console.error("=== 예약 저장 중 오류 발생 ===");
      console.error("Error while saving reservation:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("=== 서버 응답 오류 상세 정보 ===");
          console.error("Status:", error.response.status);
          console.error("Status Text:", error.response.statusText);
          console.error("Response Data:", error.response.data);
          console.error("Response Headers:", error.response.headers);
          console.error("Request URL:", error.config?.url);
          console.error("Request Method:", error.config?.method);
          console.error("Request Data:", error.config?.data);
          console.error("================================");

          // 서버에서 반환한 구체적인 오류 메시지 표시
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            JSON.stringify(error.response.data);
          setReservationError(
            `예약 저장 실패 (${error.response.status}): ${errorMessage}`
          );
        } else if (error.request) {
          console.error("=== 네트워크 오류 상세 정보 ===");
          console.error("Request:", error.request);
          console.error("Code:", error.code);
          console.error("Message:", error.message);
          console.error("Config:", error.config);
          console.error("===============================");
          setReservationError(
            "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요."
          );
        } else {
          console.error("=== 기타 Axios 오류 ===");
          console.error("Message:", error.message);
          console.error("Config:", error.config);
          console.error("====================");
          setReservationError(`예약 저장 중 오류: ${error.message}`);
        }
      } else {
        console.error("=== 일반 오류 ===");
        console.error("Error:", error);
        console.error("Type:", typeof error);
        console.error("Message:", error instanceof Error ? error.message : String(error));
        console.error("================");
        setReservationError(
          error instanceof Error ? error.message : "예약 저장 중 알 수 없는 오류가 발생했습니다."
        );
      }

      return false;
    }
  };

  // 선택된 매장의 보관 가능한 개수 정보를 가져오는 함수
  const getSelectedStoreCapacity = () => {
    if (!selectedPlace || !partnerships.length) {
      return { small: 0, medium: 0, large: 0 };
    }

    // 선택된 장소가 제휴점인지 확인
    const partnership = partnerships.find(
      (p) =>
        p.businessName === selectedPlace.place_name &&
        p.address === selectedPlace.address_name
    );

    if (partnership) {
      return {
        small: partnership.smallBagsAvailable || 0,
        medium: partnership.mediumBagsAvailable || 0,
        large: partnership.largeBagsAvailable || 0,
      };
    }

    return { small: 0, medium: 0, large: 0 };
  };

  // 실시간 보관 가능한 용량 조회 함수
  const fetchRealTimeCapacity = async (
    businessName: string,
    address: string
  ) => {
    try {
      const response = await axios.get("/api/partnership/available-capacity", {
        params: {
          businessName: businessName,
          address: address,
        },
      });

      if (response.data && response.data.success) {
        return response.data.data.availableCapacity;
      }
    } catch (error) {
      console.error("실시간 용량 조회 중 오류:", error);
    }

    return { smallBags: 0, mediumBags: 0, largeBags: 0 };
  };

  // 실시간 용량을 기반으로 보관 가능한 개수 정보를 가져오는 함수
  const getRealTimeStoreCapacity = async () => {
    if (!selectedPlace) {
      return { small: 0, medium: 0, large: 0 };
    }

    const capacity = await fetchRealTimeCapacity(
      selectedPlace.place_name,
      selectedPlace.address_name
    );
    return {
      small: capacity.smallBags || 0,
      medium: capacity.mediumBags || 0,
      large: capacity.largeBags || 0,
    };
  };

  // 보관 가능한 개수를 초과했는지 확인하는 함수 (실시간 용량 기반)
  const isCapacityExceeded = async (
    bagType: "small" | "medium" | "large",
    increment: number = 0
  ) => {
    const capacity = await getRealTimeStoreCapacity();
    const currentCount = bagSizes[bagType] + increment;
    return currentCount > capacity[bagType];
  };

  // 보관 가능한 개수 정보를 표시하는 함수 (실시간 용량 기반)
  const getCapacityText = async (bagType: "small" | "medium" | "large") => {
    const capacity = await getRealTimeStoreCapacity();
    const available = capacity[bagType] - bagSizes[bagType];
    return available > 0 ? `(${available}${t('storageAvailable')})` : `(${t('storageUnavailable')})`;
  };

  // 선택된 매장이 변경될 때 실시간 용량 업데이트
  useEffect(() => {
    const updateRealTimeCapacity = async () => {
      if (selectedPlace) {
        const capacity = await fetchRealTimeCapacity(
          selectedPlace.place_name,
          selectedPlace.address_name
        );
        setRealTimeCapacity({
          small: capacity.smallBags || 0,
          medium: capacity.mediumBags || 0,
          large: capacity.largeBags || 0,
        });
      } else {
        setRealTimeCapacity({ small: 0, medium: 0, large: 0 });
      }
    };

    updateRealTimeCapacity();
  }, [selectedPlace]);

  // 보관 가능한 개수를 초과했는지 확인하는 함수 (동기적)
  const isCapacityExceededSync = (
    bagType: "small" | "medium" | "large",
    increment: number = 0
  ) => {
    const currentCount = bagSizes[bagType] + increment;
    return currentCount > realTimeCapacity[bagType];
  };

  // 보관 가능한 개수 정보를 표시하는 함수 (동기적)
  const getCapacityTextSync = (bagType: "small" | "medium" | "large") => {
    const available = realTimeCapacity[bagType] - bagSizes[bagType];
    return available > 0 ? `(${available}${t('storageAvailable')})` : `(${t('storageUnavailable')})`;
  };

  // 장소 검색 함수 추가 (랜드마크, 지하철역 등을 검색하기 위함)
  const searchPlacesByKeyword = (keyword: string) => {
    console.log("장소 검색 시도:", keyword);

    if (!window.naver || !window.naver.maps || !window.naver.maps.Service) {
      console.error("네이버 지도 서비스가 초기화되지 않았습니다.");
      alert("지도 서비스가 준비되지 않았습니다. 페이지를 새로고침해주세요.");
      return;
    }

    const placesSearchOptions = {
      query: keyword,
      displayCount: 1, // 첫 번째 결과만 필요
    };

    // 네이버 지도 장소 검색 API 사용
    try {
      // Places는 생성자가 아니라 네임스페이스이므로 직접 search 메서드 호출
      window.naver.maps.Service.Places.search(
        placesSearchOptions,
        (status: any, response: any) => {
          console.log("장소 검색 API 응답:", status);
          console.log("장소 검색 응답 데이터:", response);

          if (status === window.naver.maps.Service.Status.OK) {
            if (
              response &&
              response.v1 &&
              response.v1.items &&
              response.v1.items.length > 0
            ) {
              const firstPlace = response.v1.items[0];
              console.log("검색된 장소:", firstPlace);

              if (firstPlace.mapx && firstPlace.mapy) {
                // 네이버 지도 API의 좌표체계 변환 필요
                // UTM-K 좌표를 WGS84 좌표로 변환
                const utmk = new window.naver.maps.Point(
                  firstPlace.mapx,
                  firstPlace.mapy
                );
                const latLng = window.naver.maps.TransCoord.utmkToLatLng(utmk);

                console.log("변환된 좌표:", latLng.lat(), latLng.lng());
                moveToLocation(latLng.lat(), latLng.lng());
                searchNearbyPartnerships(
                  latLng.lat(),
                  latLng.lng(),
                  firstPlace.address || ""
                );
              } else {
                console.error("장소 좌표 정보 없음:", firstPlace);
                alert(
                  "검색 결과에 위치 정보가 없습니다. 다른 검색어를 시도해보세요."
                );
              }
            } else {
              console.error("장소 검색 결과 없음");
              alert("검색 결과가 없습니다. 다른 검색어를 시도해보세요.");
            }
          } else {
            console.error("장소 검색 실패:", status);
            alert("검색 결과가 없습니다. 다른 검색어를 시도해보세요.");
          }
        }
      );
    } catch (error) {
      console.error("장소 검색 중 오류 발생:", error);
      alert("검색 중 오류가 발생했습니다. 다른 검색어를 시도해보세요.");
    }
  };

  // 지도 이동 함수 분리
  const moveToLocation = (lat: number, lng: number) => {
    if (!mapInstance) {
      console.error("지도 인스턴스가 없습니다.");
      return;
    }

    try {
      const moveLatLng = new window.naver.maps.LatLng(lat, lng);
      console.log("이동할 좌표:", lat, lng);

      // 부드러운 이동 처리
      const currentZoom = mapInstance.getZoom();
      console.log("현재 줌 레벨:", currentZoom);

      // 1단계: 먼저 위치 이동
      console.log("지도 중심 이동 시도");
      mapInstance.setCenter(moveLatLng);
      console.log("지도 중심 이동 완료");

      // 2단계: 이동 후 애니메이션 효과 (줌 아웃 후 줌 인)
      setTimeout(() => {
        try {
          // 줌 아웃
          console.log("줌 아웃 시도");
          mapInstance.setZoom(currentZoom - 1);
          console.log("줌 아웃 완료");

          // 잠시 후 다시 원래 줌으로
          setTimeout(() => {
            try {
              console.log("줌 인 시도");
              mapInstance.setZoom(currentZoom);
              console.log("줌 인 완료");
            } catch (error) {
              console.error("줌 인 중 오류:", error);
            }
          }, 250);
        } catch (error) {
          console.error("줌 아웃 중 오류:", error);
        }
      }, 50);
    } catch (error) {
      console.error("지도 이동 중 오류:", error);
    }
  };

  // 근처 제휴점 검색 함수 분리
  const searchNearbyPartnerships = (
    lat: number,
    lng: number,
    address: string
  ) => {
    // 검색 결과를 partnerships에서 필터링 (주소 기반으로만)
    const nearbyPartnerships = partnerships.filter((p) => {
      // 주소의 일부가 검색 결과와 일치하는지 확인
      const addressMatch = address
        ? p.address.includes(address) || address.includes(p.address)
        : false;

      // 검색 지역 근처 5km 이내의 매장 포함
      const distanceMatch =
        calculateDistance(lat, lng, p.latitude, p.longitude) < 5;

      return addressMatch || distanceMatch;
    });

    console.log("근처 제휴점 검색 결과:", nearbyPartnerships.length);

    // partnerships를 place 형식으로 변환하여 검색 결과에 추가
    const convertedPlaces = nearbyPartnerships.map((p) => ({
      place_name: p.businessName,
      address_name: p.address,
      phone: p.phone,
      category_group_code: getCategoryCodeFromBusinessType(p.businessType),
      x: p.longitude.toString(),
      y: p.latitude.toString(),
      opening_hours: p.is24Hours
            ? t('open24Hours')
        : formatBusinessHours(p.businessHours),
    }));

    // 시간에 따른 필터링
    const timeFilteredPlaces = filterPlacesByTime(
      convertedPlaces,
      startTime,
      endTime
    );
    setSearchResults(timeFilteredPlaces);
    setSelectedPlace(null);

    // 검색 결과가 없어도 지도는 이동
    if (timeFilteredPlaces.length === 0) {
      console.log("검색된 지역 근처에 제휴 매장이 없습니다.");
    }
  };

  // 포트원 결제 완료 처리 함수
  const completePayment = async () => {
    // 결제 정보 유효성 검사
    if (!isPaymentFormValid()) {
      return;
    }

    if (!selectedPlace || totalPrice <= 0) {
      setReservationError("결제 정보가 올바르지 않습니다.");
      return;
    }

    try {
      setIsProcessingPayment(true);

      const paymentId = generatePortonePaymentId();

      console.log("=== 포트원 결제 시작 ===");
      console.log("결제 ID:", paymentId);
      console.log("결제 금액:", totalPrice);
      console.log("========================");

      // 결제 수단에 따른 설정
      let payMethodConfig: any = {};
      let payMethodType: string = "CARD";
      let channelKey: string = "channel-key-1841d885-af90-429d-a2d7-d0e6698bb23a"; // KG 이니시스 채널
      let currency: string = "KRW";
      let windowType: any = {
        pc: "IFRAME",
        mobile: "REDIRECTION"
      };
      
      if (paymentMethod === "paypal") {
        // PayPal은 직접 결제 방식 사용
        payMethodType = "PAYPAL";
        payMethodConfig = {}; // PayPal 직접 결제는 추가 설정 불필요
        // 실제 PayPal 채널 키
        channelKey = "channel-key-4ac60642-8459-4dc7-9c88-0b674246cd2b";
        // PayPal은 USD 통화만 지원
        currency = "USD";
        // PayPal은 POPUP 방식 사용
        windowType = {
          pc: "POPUP",
          mobile: "REDIRECTION"
        };
      }

      console.log("=== 결제 설정 ===");
      console.log("결제 수단:", paymentMethod);
      console.log("PayMethod 타입:", payMethodType);
      console.log("채널 키:", channelKey);
      console.log("PayMethod Config:", payMethodConfig);
      console.log("================");

      // 쿠폰 할인을 적용한 최종 결제 금액 계산
      const finalPaymentAmount = totalPrice - couponDiscount;

      console.log("=== 금액 계산 ===");
      console.log("원래 금액 (totalPrice):", totalPrice);
      console.log("쿠폰 할인 (couponDiscount):", couponDiscount);
      console.log("최종 결제 금액 (finalPaymentAmount):", finalPaymentAmount);

      // PayPal용 금액 계산 (USD)
      let paymentAmount = finalPaymentAmount;
      if (paymentMethod === "paypal") {
        // 원화를 달러로 환산 (1달러 = 1300원으로 계산)
        const usdAmount = Math.ceil(finalPaymentAmount / 13);
        console.log("PayPal USD 환산 금액:", usdAmount, "센트");
        console.log("PayPal USD 금액:", (usdAmount / 100).toFixed(2), "달러");
        paymentAmount = usdAmount; // 센트 단위
      }
      console.log("PortOne에 전달할 금액:", paymentAmount);
      console.log("================");

      // 모바일 결제를 위한 예약 번호 미리 생성
      const reservationNumber = generateReservationNumber();
      console.log("생성된 예약 번호:", reservationNumber);

      // 포트원 결제 요청
      const payment = await PortOne.requestPayment({
        storeId: "store-ef16a71d-87cc-4e73-a6b8-448a8b07840d", // 환경변수 또는 기본값
        channelKey,
        paymentId,
        orderName: `${selectedPlace.place_name} 짐보관 서비스${appliedCoupon ? ' (쿠폰 할인 적용)' : ''}`,
        totalAmount: paymentAmount,
        currency: currency as any,
        payMethod: payMethodType as any,
        ...payMethodConfig,
        windowType,
        redirectUrl: `${window.location.origin}/payment-complete`,
        customer: {
          fullName: user?.name || t('customer'),
          email: user?.email || "",
        },
        customData: {
          reservationData: {
            userId: user?.id,
            userEmail: user?.email || "",
            userName: user?.name || "",
            placeName: selectedPlace.place_name,
            placeAddress: selectedPlace.address_name,
            reservationNumber: reservationNumber,
            storageDate: storageDate,
            storageEndDate:
              storageDuration === "period" ? storageEndDate : storageDate,
            storageStartTime: storageStartTime,
            storageEndTime: storageEndTime,
            smallBags: bagSizes.small,
            mediumBags: bagSizes.medium,
            largeBags: bagSizes.large,
            totalPrice: finalPaymentAmount,
            originalPrice: totalPrice,
            couponCode: appliedCoupon ? couponCode.trim().toUpperCase() : null,
            couponName: appliedCoupon ? appliedCoupon.couponName : null,
            couponDiscount: couponDiscount,
            storageType: storageDuration,
            status: "RESERVED",
          },
        } as any, // 타입 오류 임시 해결
      });

      console.log("=== 포트원 결제 응답 ===");
      console.log("결제 결과:", payment);
      console.log("========================");

      if (payment.code !== undefined) {
        // 결제 실패 또는 사용자 취소
        console.error("결제 실패:", payment.code, payment.message);

        // 결제 취소 로그를 백엔드에 전송
        try {
          await fetch("/api/admin/activity-logs/payment-cancel", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user?.id,
              reason: payment.message || "사용자가 결제 창을 닫음",
              paymentMethod: paymentMethod === "paypal" ? "paypal" : "card",
              amount: (totalPrice - couponDiscount).toString(),
            }),
          });
        } catch (error) {
          console.error("결제 취소 로그 전송 실패:", error);
        }

        setReservationError(`결제 실패: ${payment.message}`);
        setIsProcessingPayment(false);
        return;
      }

      console.log("=== 결제 성공, 검증 시작 ===");
      
      // 결제 성공 시 paymentId 상태에 저장
      setPortonePaymentId(payment.paymentId);
      console.log("PaymentId 상태 저장:", payment.paymentId);

      // 결제 성공 시 백엔드에 결제 완료 요청
      const completeResponse = await fetch("/api/payment/portone/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: payment.paymentId,
          payMethod: paymentMethod === "paypal" ? "paypal" : "card",
        }),
      });

      if (completeResponse.ok) {
        const paymentComplete = await completeResponse.json();
        console.log("결제 검증 결과:", paymentComplete);

        if (paymentComplete.status === "PAID") {
          console.log("=== 결제 검증 성공, 예약 저장 시작 ===");

          // 결제 검증 성공 후에만 예약 정보 저장
          console.log("=== 예약 정보 저장 시작 ===");
          const reservationData = await submitReservation(payment.paymentId);
          console.log("예약 저장 결과:", reservationData);
          if (reservationData) {
            console.log("=== 예약 저장 성공, 결제 정보 업데이트 시작 ===");

            // 쿠폰이 적용된 경우 실제로 사용 처리
            if (appliedCoupon && couponCode) {
              try {
                console.log("=== 쿠폰 사용 처리 시작 ===");
                const couponUseResponse = await axios.post(
                  '/api/user-coupons/use',
                  {
                    userId: user.id,
                    couponCode: couponCode.trim().toUpperCase(),
                    purchaseAmount: totalPrice,
                    orderId: reservationData.reservationNumber
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                  }
                );

                if (couponUseResponse.data.success) {
                  console.log("쿠폰 사용 처리 완료:", couponUseResponse.data);
                } else {
                  console.error("쿠폰 사용 처리 실패:", couponUseResponse.data);
                }
              } catch (couponError) {
                console.error("쿠폰 사용 처리 중 오류:", couponError);
                // 쿠폰 사용 실패해도 결제는 이미 완료되었으므로 계속 진행
              }
            }

            // 예약 저장 성공 후 Payment 테이블에 저장
            if (reservationData.reservationNumber && payment.paymentId) {
              try {
                console.log("Payment 테이블 저장 요청:", {
                  reservationNumber: reservationData.reservationNumber,
                  paymentId: payment.paymentId
                });

                const savePaymentResponse = await fetch(`/api/payment/save`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    paymentId: payment.paymentId,
                    reservationNumber: reservationData.reservationNumber
                  }),
                });

                if (savePaymentResponse.ok) {
                  const saveResult = await savePaymentResponse.json();
                  console.log("Payment 테이블 저장 성공:", saveResult);
                } else {
                  const errorText = await savePaymentResponse.text();
                  console.error("Payment 테이블 저장 실패:", errorText);
                }
              } catch (saveError) {
                console.error("Payment 테이블 저장 중 오류:", saveError);
              }

              // Reservation 테이블에도 상세 결제 정보 업데이트 (기존 필드 유지하려면)
              try {
                const finalPaymentAmount = totalPrice - couponDiscount;

                console.log("Reservation 상세 결제 정보 업데이트 요청:", {
                  reservationNumber: reservationData.reservationNumber,
                  paymentId: payment.paymentId,
                  paymentMethod: paymentMethod === "paypal" ? "paypal" : "card",
                  paymentAmount: finalPaymentAmount,
                  paymentStatus: paymentComplete.paymentStatus || "PAID",
                  paymentProvider: paymentComplete.paymentProvider,
                  cardCompany: paymentComplete.cardCompany,
                  cardType: paymentComplete.cardType
                });

                const updateResponse = await fetch(`/api/reservations/${reservationData.reservationNumber}/detailed-payment-info`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    paymentId: payment.paymentId,
                    paymentMethod: paymentMethod === "paypal" ? "paypal" : "card",
                    paymentAmount: finalPaymentAmount,
                    paymentStatus: paymentComplete.paymentStatus || "PAID",
                    paymentProvider: paymentComplete.paymentProvider,
                    cardCompany: paymentComplete.cardCompany,
                    cardType: paymentComplete.cardType
                  }),
                });

                if (updateResponse.ok) {
                  const updateResult = await updateResponse.json();
                  console.log("Reservation 상세 결제 정보 업데이트 성공:", updateResult);
                } else {
                  const errorText = await updateResponse.text();
                  console.error("Reservation 상세 결제 정보 업데이트 실패:", errorText);
                }
              } catch (updateError) {
                console.error("Reservation 상세 결제 정보 업데이트 중 오류:", updateError);
              }
            }

            setIsPaymentComplete(true);
            setIsPaymentOpen(false);

            // 예약 완료 후 제휴점 데이터 새로고침하여 보관 용량 업데이트
            try {
              const response = await axios.get("/api/partnership", {
                timeout: 60000,
              });
              if (response.data && response.data.success) {
                const partnershipData = response.data.data.filter(
                  (partnership: Partnership) =>
                    partnership.status === "APPROVED"
                );
                setPartnerships(partnershipData);

                // 현재 선택된 장소의 업데이트된 정보로 교체
                if (selectedPlace) {
                  const updatedPartnership = partnershipData.find(
                    (p: Partnership) =>
                      p.businessName === selectedPlace.place_name &&
                      p.address === selectedPlace.address_name
                  );
                  if (updatedPartnership) {
                    const updatedPlace = {
                      ...selectedPlace,
                      smallBagsAvailable: updatedPartnership.smallBagsAvailable,
                      mediumBagsAvailable:
                        updatedPartnership.mediumBagsAvailable,
                      largeBagsAvailable: updatedPartnership.largeBagsAvailable,
                    };
                    setSelectedPlace(updatedPlace);
                  }
                }
              }
            } catch (error) {
              console.error("제휴점 데이터 새로고침 중 오류:", error);
            }

            setSearchResults([]);
          } else {
            setReservationError("예약 저장에 실패했습니다.");
          }
        } else {
          setReservationError("결제 검증에 실패했습니다.");
        }
      } else {
        const errorText = await completeResponse.text();
        setReservationError(`결제 완료 처리 실패: ${errorText}`);
      }
    } catch (error) {
      console.error("포트원 결제 처리 중 오류:", error);

      // 결제 오류 로그를 백엔드에 전송
      try {
        await fetch("/api/admin/activity-logs/payment-cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.id,
            reason: `결제 처리 중 오류 발생: ${error}`,
            paymentMethod: paymentMethod === "paypal" ? "paypal" : "card",
            amount: totalPrice.toString(),
          }),
        });
      } catch (logError) {
        console.error("결제 오류 로그 전송 실패:", logError);
      }

      setReservationError("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      {/* 지도 전체 영역 */}
      <div
        id="map"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      {/* 내 위치로 돌아가기 버튼 */}
      {isMapMoved && (
        <div
          className="map-button-container"
          style={{
            position: "fixed",
            zIndex: 10,
          }}
        >
          <button className="map-button" onClick={returnToMyLocation}>
            <LocationOnIcon className="map-button-icon" />
          </button>
        </div>
      )}

      {/* 사이드바 - 검색 영역은 항상 표시, 결과 영역만 조건부 표시 */}
      <Box
        sx={{
          position: "fixed",
          backgroundColor: "white",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          transition: "height 0.2s ease-out", // 높이 변화에 대한 부드러운 애니메이션

          // 데스크톱
          "@media (min-width: 768px)": {
            top: "calc(16px + var(--safe-area-inset-top))",
            left: "calc(16px + var(--safe-area-inset-left))",
            width: "400px",
            maxHeight: (selectedPlace || isReservationOpen)
              ? ["calc(100vh - 32px - var(--safe-area-inset-top) - var(--safe-area-inset-bottom))", "calc(100dvh - 32px - var(--safe-area-inset-top) - var(--safe-area-inset-bottom))"]
              : ["calc(90vh - 16px - var(--safe-area-inset-top))", "calc(90dvh - 16px - var(--safe-area-inset-top))"],
          },

          // 모바일
          "@media (max-width: 767px)": {
            left: "var(--safe-area-inset-left)",
            right: "var(--safe-area-inset-right)",
            width: "calc(100% - var(--safe-area-inset-left) - var(--safe-area-inset-right))",
            ...(selectedPlace || isReservationOpen ? {
              // 매장 정보/예약 열렸을 때: 상단 safe area 아래에서 시작하고 하단까지
              top: "var(--safe-area-inset-top)",
              bottom: 0,
              height: "auto",
              maxHeight: "none",
            } : {
              // 검색창만 표시: 하단에서 올라옴
              bottom: "var(--safe-area-inset-bottom)",
              maxHeight: "calc(75vh - var(--safe-area-inset-bottom))",
            }),
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          },
        }}
      >
        {/* 헤더 섹션 - 항상 표시 */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: "primary.main",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
          }}
        >
          {/* 로고 및 브랜드 */}
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1,
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8
              }
            }}
            onClick={() => navigate('/')}
          >
            <LuggageIcon sx={{ color: "white", fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "white",
                fontSize: "20px"
              }}
            >
              Travelight
            </Typography>
          </Box>

          {/* 오른쪽 메뉴들 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* 예약 목록 버튼 */}
            {isAuthenticated && (
              <IconButton
                onClick={handleReservationsClick}
                size="small"
                sx={{ 
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" }
                }}
              >
                <BookmarkIcon fontSize="small" />
              </IconButton>
            )}
            
            {/* 언어 선택 버튼 */}
            <IconButton
              onClick={handleLangMenuOpen}
              size="small"
              sx={{ 
                color: "white",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" }
              }}
            >
              <TranslateIcon fontSize="small" />
            </IconButton>

            {/* 사용자 메뉴 버튼 */}
            {isAuthenticated ? (
              <Button
                onClick={handleProfileMenuOpen}
                endIcon={<ArrowDropDownIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: "medium",
                  color: "white",
                  minWidth: "auto",
                  padding: "4px 8px",
                  fontSize: "14px",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" }
                }}
              >
                {user?.name}님
              </Button>
            ) : (
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ 
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" }
                }}
              >
                <AccountCircleIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* 검색 영역 - 매장 선택 시나 예약 목록 화면, 예약 상세보기에서 숨김 */}
        {!selectedPlace && !showReservations && !selectedReservation && (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: shouldShowResultArea() ? "1px solid rgba(0, 0, 0, 0.06)" : "none",
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              borderRadius: shouldShowResultArea() ? "0" : "0 0 16px 16px", // 결과 영역이 없으면 하단 모서리 둥글게
              transition: "all 0.2s ease-out", // 부드러운 전환
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder={t("whereToGo")}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isPaymentComplete) searchPlaces();
                }}
                disabled={isPaymentComplete}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "#f8f9fa",
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover": {
                      backgroundColor: "#f0f2f5",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#f0f2f5",
                      "& fieldset": {
                        border: "none",
                      },
                    },
                    "&.Mui-disabled": {
                      opacity: 0.5,
                      backgroundColor: "#f0f0f0",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: "6px 10px",
                    fontSize: "13px",
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={searchPlaces}
                disableRipple
                disabled={isPaymentComplete}
                size="small"
                sx={{
                  minWidth: "50px",
                  height: "36px",
                  borderRadius: "10px",
                  boxShadow: "none",
                  padding: "0 10px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  "&:hover": {
                    boxShadow: "none",
                    backgroundColor: (theme) => theme.palette.primary.dark,
                  },
                  "&:focus": {
                    outline: "none",
                  },
                  "&.Mui-disabled": {
                    opacity: 0.5,
                    backgroundColor: "#e0e0e0",
                    color: "#9e9e9e",
                  },
                }}
              >
                {t("search")}
              </Button>
            </Box>

            {/* 시간 선택 영역 */}
            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
              <FormControl sx={{ flex: 1 }} size="small">
                <InputLabel id="start-time-label" sx={{ fontSize: "13px" }}>{t("start")}</InputLabel>
                <Select
                  labelId="start-time-label"
                  value={startTime}
                  label={t("start")}
                  size="small"
                  onChange={(e) => {
                    const newStartTime = e.target.value;
                    setStartTime(newStartTime);
                    const endOptions = getEndTimeOptions(newStartTime);
                    setEndTime(endOptions[0]);
                    if (searchResults.length > 0) {
                      searchPlaces();
                    }
                  }}
                  sx={{
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "#f8f9fa",
                    fontSize: "13px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&:hover": {
                      backgroundColor: "#f0f2f5",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#f0f2f5",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                    "& .MuiSelect-select": {
                      padding: "8px 12px",
                      paddingRight: "32px !important",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        mt: 1,
                        borderRadius: "16px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                        ...scrollbarStyle,
                        "& .MuiMenuItem-root": {
                          minHeight: "40px",
                          "&:hover": {
                            backgroundColor: "#f8f9fa",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "#f0f2f5",
                            "&:hover": {
                              backgroundColor: "#e9ecef",
                            },
                          },
                        },
                        "& .MuiList-root": {
                          padding: "8px",
                          "& .MuiMenuItem-root": {
                            borderRadius: "8px",
                            margin: "2px 0",
                          },
                        },
                      },
                    },
                  }}
                >
                  {generateTimeOptions("00:00", "23:30").map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1 }} size="small">
                <InputLabel id="end-time-label" sx={{ fontSize: "13px" }}>{t("end")}</InputLabel>
                <Select
                  labelId="end-time-label"
                  value={endTime}
                  label={t("end")}
                  size="small"
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    if (searchResults.length > 0) {
                      searchPlaces();
                    }
                  }}
                  sx={{
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "#f8f9fa",
                    fontSize: "13px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&:hover": {
                      backgroundColor: "#f0f2f5",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#f0f2f5",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                    "& .MuiSelect-select": {
                      padding: "8px 12px",
                      paddingRight: "32px !important",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        mt: 1,
                        borderRadius: "16px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                        ...scrollbarStyle,
                        "& .MuiMenuItem-root": {
                          minHeight: "40px",
                          "&:hover": {
                            backgroundColor: "#f8f9fa",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "#f0f2f5",
                            "&:hover": {
                              backgroundColor: "#e9ecef",
                            },
                          },
                        },
                        "& .MuiList-root": {
                          padding: "8px",
                          "& .MuiMenuItem-root": {
                            borderRadius: "8px",
                            margin: "2px 0",
                          },
                        },
                      },
                    },
                  }}
                >
                  {getEndTimeOptions(startTime).map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {/* 결과 영역 - 항상 렌더링하되 자연스러운 펼치기/접기 */}
        <Box
          sx={{
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            // 선택된 매장이나 예약 화면이 있으면 버튼 공간을 고려한 높이, 없으면 조건부 높이
            maxHeight: (selectedPlace || isReservationOpen)
              ? "calc(100vh - 200px)" // 하단 버튼 공간 확보
              : shouldShowResultArea() ? "calc(90vh - 200px)" : "0px",
            opacity: shouldShowResultArea() ? 1 : 0,
            borderRadius: (selectedPlace || isReservationOpen)
              ? "0" // 하단에 버튼이 있을 때 모서리는 둥글지 않게
              : shouldShowResultArea() ? "0 0 24px 24px" : "0", // 검색 결과만 있을 때 하단 모서리 둥글게
            "@media (max-width: 767px)": {
              maxHeight: (selectedPlace || isReservationOpen)
                ? "calc(98vh - 120px)" // 하단 버튼 공간 확보
                : shouldShowResultArea() ? "calc(75vh - 150px)" : "0px",
            },
          }}
        >
          <Box
            sx={{
              overflow: "auto",
              p: isReservationOpen || isPaymentOpen || isPaymentComplete ? 0 : 3,
              ...scrollbarStyle,
              height: "100%",
              // 명시적인 최대 높이 설정
              "@media (min-width: 768px)": {
                maxHeight: (selectedPlace || isReservationOpen)
                  ? ["calc(100vh - 200px)", "calc(100dvh - 200px)"] // 하단 버튼 공간 확보
                  : ["calc(90vh - 200px)", "calc(90dvh - 200px)"], // 검색 영역을 고려한 높이 조정
              },
              "@media (max-width: 767px)": {
                maxHeight: (selectedPlace || isReservationOpen)
                  ? ["calc(98vh - 120px)", "calc(98dvh - 120px)"] // 하단 버튼 공간 확보
                  : ["calc(75vh - 150px)", "calc(75dvh - 150px)"], // 검색 영역을 고려한 높이 조정
                // 하단 safe area를 위한 패딩 추가 (iOS 홈 인디케이터 영역)
                pb: (selectedPlace || isReservationOpen)
                  ? "calc(24px + var(--safe-area-inset-bottom))"
                  : 3,
              },
            }}
          >
          {selectedReservation ? (
            // 선택된 예약의 상세 정보 - 영수증 스타일
            <Box sx={{ px: 1, py: 0 }}>
              {/* 헤더 */}
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 3,
                pb: 1,
                borderBottom: "1px solid #f0f0f0"
              }}>
                <IconButton
                  onClick={() => setSelectedReservation(null)}
                  size="small"
                  sx={{
                    p: 0.5,
                    color: "#666",
                    "&:hover": { backgroundColor: "#f5f5f5" }
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                  예약 상세 정보
                </Typography>
              </Box>

              {/* 영수증 스타일의 상세 정보 */}
              <Box sx={{
                backgroundColor: "#fafafa",
                borderRadius: "8px",
                overflow: "hidden",
                border: "2px solid #e0e0e0"
              }}>
                {/* 티켓 상단 - 헤더 */}
                <Box sx={{
                  px: 1.5,
                  py: 1,
                  borderBottom: "1px solid #ddd",
                  backgroundColor: "#f5f5f5"
                }}>
                  {/* 예약번호와 상태 */}
                  <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1
                  }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: "#333",
                        fontSize: "14px",
                        fontFamily: "monospace",
                        letterSpacing: "1px"
                      }}
                    >
                      TRAVEL LIGHT
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: "#666",
                      fontWeight: 500,
                      fontSize: '11px',
                      px: 1,
                      py: 0.5,
                      backgroundColor: "#eee",
                      borderRadius: "4px",
                      border: "1px solid #ddd"
                    }}>
                      {getStatusText(selectedReservation.status)}
                    </Typography>
                  </Box>

                  {/* 예약번호 */}
                  <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}>
                    <Typography variant="caption" sx={{
                      color: "#888",
                      fontSize: "9px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase"
                    }}>
                      NO.
                    </Typography>
                    <Typography variant="body2" sx={{
                      fontWeight: 700,
                      color: "#333",
                      fontFamily: "monospace",
                      fontSize: "13px"
                    }}>
                      {selectedReservation.reservationNumber}
                    </Typography>
                  </Box>
                </Box>

                {/* 티켓 본문 */}
                <Box sx={{ px: 1.5, py: 1 }}>
                  {/* 매장 정보 */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      color: "#333",
                      fontSize: "14px"
                    }}>
                      {selectedReservation.placeName}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: "#666",
                      fontSize: "12px"
                    }}>
                      {selectedReservation.placeAddress}
                    </Typography>
                  </Box>

                  {/* 예약 세부 정보 */}
                  <Box sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1,
                    mb: 1.5,
                    py: 0.5,
                    px: 1,
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    border: "1px solid #ddd"
                  }}>
                    <Box>
                      <Typography variant="caption" sx={{
                        color: "#777",
                        display: "block",
                        fontSize: "9px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        mb: 0.5
                      }}>
                        날짜
                      </Typography>
                      <Typography variant="body2" sx={{
                        fontWeight: 600,
                        color: "#333",
                        fontSize: "12px"
                      }}>
                        {formatDate(selectedReservation.storageDate)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{
                        color: "#777",
                        display: "block",
                        fontSize: "9px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        mb: 0.5
                      }}>
                        시간
                      </Typography>
                      <Typography variant="body2" sx={{
                        fontWeight: 600,
                        color: "#333",
                        fontSize: "12px"
                      }}>
                        {formatTimeForReservation(selectedReservation.storageStartTime)} - {formatTimeForReservation(selectedReservation.storageEndTime)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 가방 정보 - 영수증 스타일 */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{
                      color: "#777",
                      fontSize: "9px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      mb: 0.5,
                      display: "block"
                    }}>
                      품목
                    </Typography>
                    <Box sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5
                    }}>
                      {selectedReservation.smallBags > 0 && (
                        <Box sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography variant="body2" sx={{
                              color: "#555",
                              fontSize: "11px"
                            }}>
                              • {t('small')} 가방
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{
                            fontWeight: 600,
                            color: "#333",
                            fontSize: "11px"
                          }}>
                            {selectedReservation.smallBags}개
                          </Typography>
                        </Box>
                      )}
                      {selectedReservation.mediumBags > 0 && (
                        <Box sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography variant="body2" sx={{
                              color: "#555",
                              fontSize: "11px"
                            }}>
                              • 중형 가방
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{
                            fontWeight: 600,
                            color: "#333",
                            fontSize: "11px"
                          }}>
                            {selectedReservation.mediumBags}개
                          </Typography>
                        </Box>
                      )}
                      {selectedReservation.largeBags > 0 && (
                        <Box sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography variant="body2" sx={{
                              color: "#555",
                              fontSize: "11px"
                            }}>
                              • 대형 가방
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{
                            fontWeight: 600,
                            color: "#333",
                            fontSize: "11px"
                          }}>
                            {selectedReservation.largeBags}개
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* 쿠폰 정보 */}
                  {selectedReservation.couponCode && (
                    <>
                      {selectedReservation.originalPrice && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{
                            color: "#777",
                            fontSize: "9px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            mb: 0.5,
                            display: "block"
                          }}>
                            원가
                          </Typography>
                          <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <Typography variant="body2" sx={{
                              color: "#555",
                              fontSize: "11px"
                            }}>
                              쿠폰 적용 전
                            </Typography>
                            <Typography variant="body2" sx={{
                              fontWeight: 600,
                              color: "#333",
                              fontSize: "11px"
                            }}>
                              {selectedReservation.originalPrice.toLocaleString()}원
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{
                          color: "#777",
                          fontSize: "9px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          mb: 0.5,
                          display: "block"
                        }}>
                          쿠폰 할인
                        </Typography>
                        <Box sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <Typography variant="body2" sx={{
                            color: "#555",
                            fontSize: "11px"
                          }}>
                            {selectedReservation.couponName || selectedReservation.couponCode}
                          </Typography>
                          <Typography variant="body2" sx={{
                            fontWeight: 600,
                            color: "#333",
                            fontSize: "11px"
                          }}>
                            -{selectedReservation.couponDiscount?.toLocaleString()}원
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* 총 금액 */}
                  <Box sx={{
                    pt: 1,
                    borderTop: "1px dashed #ccc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <Typography variant="body2" sx={{
                      color: "#555",
                      fontWeight: 600,
                      fontSize: "12px"
                    }}>
                      합계
                    </Typography>
                    <Typography variant="h6" sx={{
                      fontWeight: 700,
                      color: "#333",
                      fontSize: "16px",
                      fontFamily: "monospace"
                    }}>
                      {selectedReservation.totalPrice.toLocaleString()}{t('won')}
                    </Typography>
                  </Box>

                  {/* 보관 상태 표시 */}
                  {renderStorageStatus(selectedReservation)}

                  {/* 예약 중인 경우 버튼들 추가 */}
                  {selectedReservation.status === 'RESERVED' && (
                    <Box sx={{
                      pt: 1.5,
                      borderTop: "1px solid #e0e0e0",
                      mt: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}>
                      {/* 예약 취소 버튼 */}
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleCancelReservation(selectedReservation)}
                        disabled={cancellingReservation === selectedReservation.reservationNumber}
                        sx={{
                          borderColor: '#f44336',
                          color: '#f44336',
                          fontWeight: 600,
                          fontSize: '12px',
                          py: 1,
                          borderRadius: '6px',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.04)',
                            borderColor: '#d32f2f'
                          },
                          '&:disabled': {
                            borderColor: '#ccc',
                            color: '#999'
                          }
                        }}
                      >
                        {cancellingReservation === selectedReservation.reservationNumber ? '취소 중...' : '예약 취소'}
                      </Button>

                      {/* 네이버맵 길찾기 버튼 */}
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => openNaverMap(selectedReservation)}
                        sx={{
                          backgroundColor: '#03C75A',
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '14px',
                          py: 1,
                          borderRadius: '6px',
                          '&:hover': {
                            backgroundColor: '#02a74a'
                          }
                        }}
                      >
                        네이버맵 길찾기
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ) : showReservations ? (
            // 예약 목록 화면
            <Box sx={{ px: 1, py: 0 }}>
              {/* 헤더 */}
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 3,
                pb: 1,
                borderBottom: "1px solid #f0f0f0"
              }}>
                <IconButton
                  onClick={handleBackToSearch}
                  size="small"
                  sx={{
                    p: 0.5,
                    color: "#666",
                    "&:hover": { backgroundColor: "#f5f5f5" }
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
                  내 예약 목록
                </Typography>
              </Box>

              {/* 예약 목록 */}
              {loadingReservations ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    예약 목록을 불러오는 중...
                  </Typography>
                </Box>
              ) : myReservations.length === 0 ? (
                <Box sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 6,
                  textAlign: "center"
                }}>
                  <BookmarkIcon sx={{ fontSize: 48, color: "#e0e0e0", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
                    예약 내역이 없습니다
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#999" }}>
                    새로운 보관소를 예약해보세요
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {myReservations.map((reservation) => (
                    <Box
                      key={reservation.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedReservation(reservation);
                      }}
                      sx={{
                        p: 2,
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#1976d2",
                          boxShadow: "0 2px 8px rgba(25, 118, 210, 0.1)"
                        }
                      }}
                    >
                      {/* 헤더 */}
                      <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1.5
                      }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="h6" sx={{
                              fontWeight: 600,
                              fontSize: "16px",
                              color: "#333"
                            }}>
                              {reservation.placeName}
                            </Typography>
                            {reservation.status === 'RESERVED' && (
                              <Button
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openNaverMap(reservation);
                                }}
                                sx={{
                                  backgroundColor: '#f5f5f5',
                                  color: '#666',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  px: 1,
                                  py: 0.3,
                                  minWidth: 'auto',
                                  borderRadius: '4px',
                                  border: '1px solid #e0e0e0',
                                  '&:hover': {
                                    backgroundColor: '#e8e8e8',
                                    borderColor: '#d0d0d0'
                                  }
                                }}
                              >
                                길찾기
                              </Button>
                            )}
                          </Box>
                          <Typography variant="body2" sx={{
                            color: "#666",
                            fontSize: "13px",
                            mb: 1
                          }}>
                            {reservation.reservationNumber}
                          </Typography>

                          {/* 보관 상태 태그 */}
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {storageStatuses[reservation.reservationNumber] && (
                              <>
                                {storageStatuses[reservation.reservationNumber].hasStorage ? (
                                  <Chip
                                    icon={storageStatuses[reservation.reservationNumber].status === 'STORED' ?
                                          <CheckCircleIcon sx={{ fontSize: 13 }} /> :
                                          <QrCodeIcon sx={{ fontSize: 13 }} />}
                                    label={storageStatuses[reservation.reservationNumber].status === 'STORED' ?
                                           '보관 중' : '이용 완료'}
                                    size="small"
                                    sx={{
                                      backgroundColor: storageStatuses[reservation.reservationNumber].status === 'STORED' ?
                                                      '#f5f5f5' : '#fafafa',
                                      border: '1px solid #e0e0e0',
                                      color: '#666',
                                      fontSize: '11px',
                                      height: '24px',
                                      fontWeight: 500
                                    }}
                                  />
                                ) : (
                                  <Chip
                                    label={t('waitingForStoreVisit')}
                                    size="small"
                                    sx={{
                                      backgroundColor: '#f5f5f5',
                                      border: '1px solid #e0e0e0',
                                      color: '#666',
                                      fontSize: '11px',
                                      height: '24px',
                                      fontWeight: 500
                                    }}
                                  />
                                )}
                              </>
                            )}
                          </Box>
                        </Box>
                        <Chip
                          label={getStatusText(reservation.status)}
                          size="small"
                          sx={{
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #e0e0e0',
                            color: '#666',
                            fontWeight: 500,
                            fontSize: '11px',
                            height: '24px'
                          }}
                        />
                      </Box>

                      {/* 날짜와 시간 */}
                      <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: "#666" }} />
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            {formatDate(reservation.storageDate)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: "#999" }}>
                          {formatTimeForReservation(reservation.storageStartTime)} - {formatTimeForReservation(reservation.storageEndTime)}
                        </Typography>
                      </Box>

                      {/* 가방 요약 */}
                      <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <LuggageIcon sx={{ fontSize: 16, color: "#666" }} />
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            {[
                              reservation.smallBags > 0 && `${t('small')} ${reservation.smallBags}${t('pieces')}`,
                              reservation.mediumBags > 0 && `${t('medium')} ${reservation.mediumBags}${t('pieces')}`,
                              reservation.largeBags > 0 && `${t('large')} ${reservation.largeBags}${t('pieces')}`
                            ].filter(Boolean).join(', ')}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{
                          fontWeight: 600,
                          color: "#333"
                        }}>
                          {reservation.totalPrice.toLocaleString()}{t('won')}
                        </Typography>
                      </Box>

                      {/* 액션 버튼들 */}
                      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                        {/* 배달 정보 표시 */}
                        {(() => {
                          const tripDeliveries = getDeliveriesForReservation(reservation.id);
                          const hasDelivery = tripDeliveries.length > 0;
                          
                          return (
                            <>
                              {hasDelivery && (
                                <Box sx={{ 
                                  padding: 2, 
                                  borderTop: '1px solid #e0e0e0',
                                  backgroundColor: '#f8f9fa',
                                  borderRadius: '8px',
                                  mb: 1
                                }}>
                                  {tripDeliveries.map((delivery, index) => (
                                    <Box key={delivery.id} sx={{ mb: index < tripDeliveries.length - 1 ? 2 : 0 }}>
                                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2' }}>
                                        배달 진행 상태
                                      </Typography>
                                      <Stepper 
                                        activeStep={getDeliveryStatusIndex(delivery.status)} 
                                        orientation="horizontal"
                                        alternativeLabel
                                        sx={{ 
                                          width: '100%',
                                          '& .MuiStep-root': {
                                            padding: 0
                                          },
                                          '& .MuiStepLabel-root': {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center'
                                          },
                                          '& .MuiStepLabel-label': {
                                            fontSize: '10px',
                                            fontWeight: 500,
                                            whiteSpace: 'nowrap',
                                            marginTop: '4px',
                                            textAlign: 'center'
                                          },
                                          '& .MuiStepIcon-root': {
                                            fontSize: '16px'
                                          },
                                          '& .MuiStepConnector-root': {
                                            top: '8px'
                                          }
                                        }}
                                      >
                                        {deliveryStatusSteps.map((step, stepIndex) => (
                                          <Step key={step.status} completed={stepIndex <= getDeliveryStatusIndex(delivery.status)}>
                                            <StepLabel>{step.label}</StepLabel>
                                          </Step>
                                        ))}
                                      </Stepper>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                        배달 신청일: {new Date(delivery.requestedAt).toLocaleString()}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                              
                              {/* 액션 버튼들 - 배달 여부와 관계없이 항상 표시 */}
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {/* 배달 신청 버튼 - 배달이 없는 경우에만 표시 */}
                                {!hasDelivery && (
                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartDelivery(reservation);
                                    }}
                                    disabled={reservation.status !== 'COMPLETED' && reservation.status !== 'RESERVED'}
                                    sx={{
                                      borderColor: '#1976d2',
                                      color: '#1976d2',
                                      fontWeight: 500,
                                      fontSize: '14px',
                                      py: 0.9,
                                      borderRadius: '6px',
                                      '&:hover': {
                                        backgroundColor: '#e3f2fd'
                                      }
                                    }}
                                  >
                                    배달 신청하기
                                  </Button>
                                )}

                                {/* 리뷰 관련 버튼들 - 배달 여부와 관계없이 COMPLETED 상태에서 항상 표시 */}
                                {reservation.status === 'COMPLETED' && (
                                  <>
                                    {reviewStatuses[reservation.id] ? (
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                          variant="contained"
                                          disabled
                                          sx={{
                                            flex: 1,
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            fontSize: '14px',
                                            py: 0.9,
                                            fontWeight: 500,
                                            borderRadius: '6px',
                                            '&.Mui-disabled': {
                                              color: 'white',
                                              opacity: 0.8
                                            }
                                          }}
                                        >
                                          리뷰 작성 완료
                                        </Button>
                                        <Button
                                          variant="outlined"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditReview(reservation);
                                          }}
                                          sx={{
                                            borderColor: '#1976d2',
                                            color: '#1976d2',
                                            fontSize: '14px',
                                            minWidth: '50px',
                                            px: 1.5,
                                            py: 0.9,
                                            fontWeight: 500,
                                            borderRadius: '6px',
                                            '&:hover': {
                                              backgroundColor: '#e3f2fd'
                                            }
                                          }}
                                        >
                                          수정
                                        </Button>
                                        <Button
                                          variant="outlined"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteReview(reservation);
                                          }}
                                          sx={{
                                            borderColor: '#d32f2f',
                                            color: '#d32f2f',
                                            fontSize: '14px',
                                            minWidth: '50px',
                                            px: 1.5,
                                            py: 0.9,
                                            fontWeight: 500,
                                            borderRadius: '6px',
                                            '&:hover': {
                                              backgroundColor: '#ffebee'
                                            }
                                          }}
                                        >
                                          삭제
                                        </Button>
                                      </Box>
                                    ) : (
                                      <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleWriteReview(reservation);
                                        }}
                                        sx={{
                                          backgroundColor: '#FF6B35',
                                          color: 'white',
                                          fontWeight: 500,
                                          fontSize: '14px',
                                          py: 0.9,
                                          borderRadius: '6px',
                                          '&:hover': {
                                            backgroundColor: '#E64A19'
                                          }
                                        }}
                                      >
                                        리뷰 작성하기
                                      </Button>
                                    )}
                                  </>
                                )}
                              </Box>
                            </>
                          );
                        })()}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ) : selectedPlace ? (
            // 선택된 장소 상세 정보 - Bounce 스타일
            <>
              {!isReservationOpen ? (
                <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  {/* 헤더 */}
                  <Box
                    sx={{
                      px: 0,
                      pb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #f0f0f0"
                    }}
                  >
                    {/* 왼쪽: 뒤로가기 + 매장 타입 */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Button
                        onClick={() => setSelectedPlace(null)}
                        sx={{
                          minWidth: "auto",
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          color: "#666",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        <ChevronLeftIcon />
                      </Button>
                      
                      <Chip
                        icon={<StorefrontIcon sx={{ fontSize: 14 }} />}
                        label={selectedPlace.business_type || t('storageLocation')}
                        size="small"
                        sx={{ 
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          fontWeight: 500,
                          fontSize: "11px",
                          height: "24px",
                          "& .MuiChip-icon": { color: "#1976d2" }
                        }}
                      />
                    </Box>

                    {/* 오른쪽: 액션 버튼들 */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Button
                        sx={{
                          minWidth: "auto",
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          color: "#666",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: selectedPlace.place_name,
                              text: `${selectedPlace.place_name} - 짐보관 서비스`,
                              url: window.location.href
                            });
                          }
                        }}
                      >
                        <ShareIcon sx={{ fontSize: 18 }} />
                      </Button>
                      
                      <Button
                        sx={{
                          minWidth: "auto",
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          color: "#666",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                      </Button>
                      
                      <Button
                        sx={{
                          minWidth: "auto",
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          color: "#666",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        <MoreVertIcon sx={{ fontSize: 18 }} />
                      </Button>
                    </Box>
                  </Box>

                  {/* 매장 정보 */}
                  <Box sx={{ flex: 1 }}>
                    {/* 매장 사진 배너 */}
                    {selectedPlace.storePictures && selectedPlace.storePictures.length > 0 && (
                      <Box sx={{ 
                        position: 'relative',
                        width: '100%',
                        height: '200px',
                        overflow: 'hidden',
                        mb: 2
                      }}>
                        <Box
                          component="img"
                          src={selectedPlace.storePictures[0]}
                          alt={selectedPlace.place_name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        {selectedPlace.storePictures.length > 1 && (
                          <Box sx={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            +{selectedPlace.storePictures.length - 1}
                          </Box>
                        )}
                      </Box>
                    )}

                    <Box sx={{ px: 1, py: 2 }}>
                      {/* 헤더 */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700, 
                          color: "#1a1a1a",
                          mb: 1,
                          lineHeight: 1.2
                        }}>
                          {selectedPlace.place_name}
                        </Typography>
                      
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                        {reviewStats.totalReviews > 0 && (
                          <>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <StarIcon sx={{ color: "#ffc107", fontSize: 16 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {reviewStats.averageRating.toFixed(1)}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#666" }}>
                                ({reviewStats.totalReviews})
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: "#666" }}>•</Typography>
                          </>
                        )}
                        <Typography variant="body2" sx={{ 
                          color: isCurrentlyOpen(selectedPlace) ? "#4caf50" : "#f44336", 
                          fontWeight: 600 
                        }}>
                          {isCurrentlyOpen(selectedPlace) ? t('operating') : t('closed')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666" }}>•</Typography>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          {t('walkMinutes')}
                        </Typography>
                      </Box>

                      <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                        {selectedPlace.address_name}
                      </Typography>
                    </Box>

                    {/* 가격 정보 */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        fontSize: "16px"
                      }}>
                        {t('availableStorage')}
                      </Typography>
                      
                      <Box sx={{ 
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        overflow: "hidden"
                      }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1.5, borderBottom: "1px solid #f0f0f0" }}>
                          <Typography variant="body2" sx={{ color: "#333" }}>{t('small')}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>₩3,000</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1.5, borderBottom: "1px solid #f0f0f0" }}>
                          <Typography variant="body2" sx={{ color: "#333" }}>{t('medium')}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>₩5,000</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1.5 }}>
                          <Typography variant="body2" sx={{ color: "#333" }}>{t('large')}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>₩8,000</Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="caption" sx={{ 
                        color: "#888", 
                        mt: 0.5, 
                        display: "block",
                        fontSize: "11px"
                      }}>
                        {t('dailyRate')}
                      </Typography>
                    </Box>

                    {/* 편의시설 */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        mb: 1.5,
                        fontSize: "16px"
                      }}>
                        {t('facilities')}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {selectedPlace.amenities && selectedPlace.amenities.length > 0 ? (
                          selectedPlace.amenities.map((amenity: string, index: number) => (
                            <Chip
                              key={index}
                              icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                              label={amenity}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: "#e0e0e0",
                                backgroundColor: "white"
                              }}
                            />
                          ))
                        ) : (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                            label={t('basicFacilities') || '기본 보관 서비스'}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: "#e0e0e0",
                              backgroundColor: "white"
                            }}
                          />
                        )}
                        {selectedPlace.insuranceAvailable && (
                          <Chip
                            icon={<ShieldIcon sx={{ fontSize: 16 }} />}
                            label={t('damageInsurance')}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: "#10b981",
                              backgroundColor: "#f0fdf4",
                              color: "#10b981"
                            }}
                          />
                        )}
                        {selectedPlace.phone && (
                          <Chip
                            icon={<PhoneIcon sx={{ fontSize: 16 }} />}
                            label={t('phoneAvailable')}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: "#e0e0e0",
                              backgroundColor: "white"
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    </Box>

                    {/* 탭 네비게이션 */}
                    <Box sx={{ px: 1, mb: 2 }}>
                      <Box sx={{ 
                        display: "flex", 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        mb: 2
                      }}>
                        <Button
                          onClick={() => setSelectedTab('info')}
                          sx={{
                            flex: 1,
                            py: 1,
                            px: 2,
                            borderRadius: 0,
                            color: selectedTab === 'info' ? 'primary.main' : 'text.secondary',
                            borderBottom: selectedTab === 'info' ? 2 : 0,
                            borderColor: selectedTab === 'info' ? 'primary.main' : 'transparent',
                            fontWeight: selectedTab === 'info' ? 600 : 400,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          {t('storeInfo')}
                        </Button>
                        <Button
                          onClick={() => setSelectedTab('reviews')}
                          sx={{
                            flex: 1,
                            py: 1,
                            px: 2,
                            borderRadius: 0,
                            color: selectedTab === 'reviews' ? 'primary.main' : 'text.secondary',
                            borderBottom: selectedTab === 'reviews' ? 2 : 0,
                            borderColor: selectedTab === 'reviews' ? 'primary.main' : 'transparent',
                            fontWeight: selectedTab === 'reviews' ? 600 : 400,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          {t('reviews')}
                        </Button>
                      </Box>

                      {/* 매장 정보 탭 */}
                      {selectedTab === 'info' && (
                        <Box>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                              <AccessTimeIcon sx={{ color: "#666", fontSize: 18, mt: 0.2 }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                  {t('operatingHours')}
                                </Typography>
                                <Box>
                                  {(() => {
                                    // 영업시간 배열 생성
                                    let hoursArray: string[] = [];
                                    
                                    if (selectedPlace.opening_hours) {
                                      // 제휴점인 경우 businessHours에서 배열로 가져오기
                                      const partnership = partnerships.find(p => 
                                        p.businessName === selectedPlace.place_name &&
                                        p.address === selectedPlace.address_name
                                      );
                                      
                                      if (partnership && partnership.businessHours) {
                                        hoursArray = formatBusinessHoursArray(partnership.businessHours);
                                      } else {
                                        hoursArray = [selectedPlace.opening_hours];
                                      }
                                    } else {
                                      // 기본값
                                      hoursArray = selectedPlace.category_group_code === "BK9"
                                        ? [t('weekdaysHours')]
                                        : [t('dailyHours')];
                                    }
                                    
                                    return hoursArray.map((hour, index) => (
                                      <Typography 
                                        key={index} 
                                        variant="body2" 
                                        sx={{ color: "#666", lineHeight: 1.4 }}
                                      >
                                        {hour}
                                      </Typography>
                                    ));
                                  })()}
                                </Box>
                              </Box>
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                              <LocationOnIcon sx={{ color: "#666", fontSize: 18, mt: 0.2 }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                  {t('location')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#666" }}>
                                  {selectedPlace.address_name}
                                </Typography>
                              </Box>
                            </Box>

                            {selectedPlace.phone && (
                              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                <PhoneIcon sx={{ color: "#666", fontSize: 18, mt: 0.2 }} />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                    {t('contact')}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: "#666" }}>
                                    {selectedPlace.phone}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Box>

                          {/* 안전 보장 */}
                          <Box sx={{
                            backgroundColor: "#e8f5e8",
                            borderRadius: "8px",
                            p: 2,
                            mt: 2
                          }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 18 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: "#2e7d32" }}>
                                {t('safetyGuarantee')}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: "#388e3c", fontSize: "13px" }}>
                              {t('safetyGuaranteeDescription')}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* 리뷰 탭 */}
                      {selectedTab === 'reviews' && (
                        <Box>
                          <ReviewsList
                            placeName={selectedPlace.place_name}
                            placeAddress={selectedPlace.address_name}
                            currentUserId={user?.id}
                            canWriteReview={false}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ) : isPaymentOpen ? (
                <Box
                  sx={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    p: 3,
                    transition: "all 0.2s ease",
                    position: "relative", // position relative 추가
                  }}
                >
                  {/* 결제 중 오버레이 추가 */}
                  {isProcessingPayment && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.98)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        borderRadius: "20px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                                                {/* 깔끔한 로딩 애니메이션 */}
                        <Box
                          sx={{
                            position: "relative",
                            width: "64px",
                            height: "64px",
                            mb: 2,
                          }}
                        >
                          {/* 단순한 회전 링 */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              border: "3px solid rgba(26, 115, 232, 0.1)",
                              borderTopColor: "#1a73e8",
                              borderRadius: "50%",
                              animation: "simpleRotate 1.5s linear infinite",
                            }}
                          />
                          
                          {/* 중앙 신용카드 아이콘 */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "32px",
                              height: "32px",
                              backgroundColor: "#1a73e8",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="white"
                            >
                              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                            </svg>
                          </Box>
                        </Box>

                        {/* 텍스트 메시지 */}
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#1a73e8",
                            fontSize: "18px",
                            textAlign: "center",
                            mb: 2,
                          }}
                        >
                          {t('processingPayment')}
                        </Typography>

                        {/* 보안 메시지 */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: "#666",
                            fontSize: "14px",
                          }}
                        >
                          <Box
                            sx={{
                              width: "16px",
                              height: "16px",
                              backgroundColor: "#4caf50",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
                            </svg>
                          </Box>
                          {t('paymentSecurityMessage')}
                        </Box>

                        {/* 애니메이션 키프레임 정의 */}
                        <Box
                          sx={{
                            "@keyframes simpleRotate": {
                              "0%": { transform: "rotate(0deg)" },
                              "100%": { transform: "rotate(360deg)" },
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {t("cardPayment")}
                    </Typography>
                    <Button
                      sx={{
                        minWidth: "auto",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        p: 0,
                        "&:focus": {
                          outline: "none",
                        },
                        "&.Mui-focusVisible": {
                          outline: "none",
                        },
                      }}
                      onClick={() => setIsPaymentOpen(false)}
                    >
                      ×
                    </Button>
                  </Box>

                  <Typography sx={{ fontWeight: 500, mb: 1 }}>
                    {selectedPlace.place_name}
                  </Typography>
                  <Typography
                    sx={{ color: "text.secondary", mb: 3, fontSize: "14px" }}
                  >
                    {t("paymentAmount")}
                    {appliedCoupon ? (
                      <>
                        <span style={{ textDecoration: "line-through", marginRight: "8px", color: "#999" }}>
                          {totalPrice.toLocaleString()}
                        </span>
                        <span style={{ fontWeight: 600, color: "#1a73e8" }}>
                          {(totalPrice - couponDiscount).toLocaleString()}
                        </span>
                      </>
                    ) : (
                      totalPrice.toLocaleString()
                    )}
                    {t("won")}
                  </Typography>

                  {/* 포트원 결제 안내 */}
                  <Box
                    sx={{
                      backgroundColor: "#f0f5ff",
                      p: 3,
                      borderRadius: "16px",
                      mb: 3,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "#1a73e8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px auto",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                      </svg>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#1a73e8",
                        mb: 1,
                        fontSize: "16px",
                      }}
                    >
                      {t('confirmReservationDetails')}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#666",
                        fontSize: "14px",
                        lineHeight: 1.5,
                      }}
                    >
                      {t('paymentMethodsSupported')}
                    </Typography>
                  </Box>

                  {/* 결제 수단 선택 */}
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "12px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 500,
                        mb: 2,
                        color: "#333",
                      }}
                    >
                      {t('selectPaymentMethod')}
                    </Typography>
                    
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        variant={paymentMethod === "card" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setPaymentMethod("card")}
                        sx={{
                          minHeight: "40px",
                          fontSize: "13px",
                          borderRadius: "8px",
                        }}
                      >
                        💳 {t('card')}
                      </Button>
                      
                      <Button
                        variant={paymentMethod === "paypal" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setPaymentMethod("paypal")}
                        sx={{
                          minHeight: "40px",
                          fontSize: "13px",
                          borderRadius: "8px",
                          backgroundColor: paymentMethod === "paypal" ? "#0070ba" : "transparent",
                          borderColor: paymentMethod === "paypal" ? "#0070ba" : "#0070ba",
                          color: paymentMethod === "paypal" ? "white" : "#0070ba",
                          "&:hover": {
                            backgroundColor: paymentMethod === "paypal" ? "#005ea6" : "rgba(0, 112, 186, 0.1)",
                          }
                        }}
                      >
                        💙 PayPal
                      </Button>
                    </Box>
                  </Box>

                  {/* 결제 정보 요약 */}
                  <Box
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.03)",
                      p: 2.5,
                      borderRadius: "12px",
                      mb: 3,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 500,
                        mb: 2,
                        color: "#333",
                      }}
                    >
                      {t('confirmReservationContent')}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "13px", color: "text.secondary" }}
                      >
                        {t('storageLocation')}
                      </Typography>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                        {selectedPlace.place_name}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "13px", color: "text.secondary" }}
                      >
                        {t('storageDuration')}
                      </Typography>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                        {calculateStorageTimeText()}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "13px", color: "text.secondary" }}
                      >
                        {t('storedItems')}
                      </Typography>
                      <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                        {getBagSummary()}
                      </Typography>
                    </Box>

                    {/* 쿠폰 정보 */}
                    {appliedCoupon && (
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            sx={{ fontSize: "13px", color: "text.secondary" }}
                          >
                            원가
                          </Typography>
                          <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                            {totalPrice.toLocaleString()}{t('won')}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography
                            sx={{ fontSize: "13px", color: "text.secondary" }}
                          >
                            쿠폰 할인 ({appliedCoupon.couponName || couponCode})
                          </Typography>
                          <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                            -{couponDiscount.toLocaleString()}{t('won')}
                          </Typography>
                        </Box>
                      </>
                    )}

                    <Box
                      sx={{
                        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                        pt: 1.5,
                        mt: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                        {t('totalPaymentAmount')}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#1a73e8",
                        }}
                      >
                        {appliedCoupon ? (totalPrice - couponDiscount).toLocaleString() : totalPrice.toLocaleString()}{t('won')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 포트원 결제 버튼 */}
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      p: 1.5,
                      backgroundColor: "#1a73e8",
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: "#1565c0",
                      },
                      "&:focus": {
                        outline: "none",
                      },
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                    disabled={isProcessingPayment || totalPrice <= 0}
                    onClick={completePayment}
                  >
                    {isProcessingPayment ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 2,
                          position: "relative",
                        }}
                      >
                        {/* 신용카드 회전 아이콘 */}
                        <Box
                          sx={{
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            animation: "cardRotate 2s ease-in-out infinite",
                            "@keyframes cardRotate": {
                              "0%": { transform: "rotateY(0deg)" },
                              "50%": { transform: "rotateY(180deg)" },
                              "100%": { transform: "rotateY(360deg)" },
                            },
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="rgba(255, 255, 255, 0.9)"
                          >
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                          </svg>
                        </Box>
                        
                        <Typography sx={{ fontWeight: 600, fontSize: "16px" }}>
                          {t('processingPaymentSecurely')}
                        </Typography>
                        
                        {/* 점진적 점들 */}
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.4,
                            ml: 0.5,
                          }}
                        >
                          {[0, 1, 2].map((index) => (
                            <Box
                              key={index}
                              sx={{
                                width: "4px",
                                height: "4px",
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                borderRadius: "50%",
                                animation: "dotWave 1.8s ease-in-out infinite",
                                animationDelay: `${index * 0.3}s`,
                                "@keyframes dotWave": {
                                  "0%, 60%, 100%": {
                                    transform: "scale(0.7)",
                                    opacity: 0.5,
                                  },
                                  "30%": {
                                    transform: "scale(1.2)",
                                    opacity: 1,
                                  },
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                        </svg>
                        <Typography sx={{ fontWeight: 500, fontSize: "16px" }}>
                          {t('payWithAmount', { amount: `${appliedCoupon ? (totalPrice - couponDiscount).toLocaleString() : totalPrice.toLocaleString()}${t('won')}` })}
                        </Typography>
                      </Box>
                    )}


                  </Button>
                </Box>
              ) : isPaymentComplete ? (
                // 결제 완료 화면
                <Box
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "20px",
                    p: 4,
                    transition: "all 0.2s ease",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "#e6f4ea",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 24px auto",
                    }}
                  >
                    {/* 체크 아이콘 */}
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                        fill="#34A853"
                      />
                    </svg>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {t("paymentComplete")}
                  </Typography>

                  <Typography
                    sx={{ color: "text.secondary", mb: 3, fontSize: "15px" }}
                  >
                    {selectedPlace.place_name}
                    {t("hasBeenCompleted")}
                    {t("reservationSuccess")}
                  </Typography>

                  <Box
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.03)",
                      p: 2,
                      borderRadius: "12px",
                      mb: 3,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    {/* 예약 날짜 추가 */}
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        sx={{ fontSize: "14px", color: "text.secondary" }}
                      >
                        {t("reservationDate")}
                      </Typography>
                      <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                        {formatReservationDate(storageDate)}
                      </Typography>
                    </Box>

                    {/* 예약 시간 추가 */}
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        sx={{ fontSize: "14px", color: "text.secondary" }}
                      >
                        {t("reservationTime")}
                      </Typography>
                      <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                        {formatTime(storageStartTime)} ~{" "}
                        {formatTime(storageEndTime)}
                      </Typography>
                    </Box>

                    {/* 가방 크기 및 개수 정보 추가 */}
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        sx={{ fontSize: "14px", color: "text.secondary" }}
                      >
                        {t("storedItems")}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 500,
                          textAlign: "right",
                        }}
                      >
                        {getBagSummary()}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        sx={{ fontSize: "14px", color: "text.secondary" }}
                      >
                        {t("paymentAmount")}
                      </Typography>
                      <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                        {totalPrice.toLocaleString()}
                        {t("won")}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        sx={{ fontSize: "14px", color: "text.secondary" }}
                      >
                        {t("storageLocation")}
                      </Typography>
                      <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                        {selectedPlace.place_name}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        sx={{ fontSize: "14px", color: "text.secondary" }}
                      >
                        {t("address")}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 500,
                          maxWidth: "60%",
                          textAlign: "right",
                        }}
                      >
                        {selectedPlace.address_name}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 예약 번호 추가 */}
                  <Box
                    sx={{
                      backgroundColor: "#f5f8ff",
                      p: 2.5,
                      borderRadius: "12px",
                      mb: 3,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: "13px", color: "#1a73e8", mb: 1 }}
                    >
                      {t("reservationNumber")}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "20px",
                        fontWeight: 600,
                        letterSpacing: "1px",
                      }}
                    >
                      {submittedReservation
                        ? submittedReservation.reservationNumber
                        : generateReservationNumber()}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: "#1a73e8",
                        fontWeight: 500,
                      }}
                    >
                      {t("reservationEmailSent")}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      p: 1.5,
                      mt: 3,
                      backgroundColor: "#1a73e8",
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: "#1565c0",
                      },
                      "&:focus": {
                        outline: "none",
                      },
                    }}
                    onClick={() => {
                      // 모든 상태 초기화하고 메인 화면으로
                      setIsPaymentComplete(false);
                      setIsReservationOpen(false);
                      setSelectedPlace(null);
                      setBagSizes({
                        small: 0,
                        medium: 0,
                        large: 0,
                      });
                      setTotalPrice(0);
                      // 검색 결과도 초기화
                      setSearchResults([]);
                      setSearchKeyword("");
                    }}
                  >
                    {t("confirm")}
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    p: 3,
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* 헤더 - 탭 네비게이션 포함 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {reservationStep === 'bag-selection' ? t('bagSelectionTitle') : t('dateTimeSelection')}
                    </Typography>
                    <Button
                      sx={{
                        minWidth: "auto",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        p: 0,
                        "&:focus": {
                          outline: "none",
                        },
                        "&.Mui-focusVisible": {
                          outline: "none",
                        },
                      }}
                      onClick={() => {
                        setIsReservationOpen(false);
                        setReservationStep('bag-selection'); // 단계 초기화
                      }}
                    >
                      ×
                    </Button>
                  </Box>

                  {/* 단계 표시 인디케이터 */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Box sx={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: reservationStep === 'bag-selection' ? "#1976d2" : "#4caf50",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {reservationStep === 'bag-selection' ? '1' : '✓'}
                      </Box>
                      <Typography sx={{ 
                        fontSize: "13px", 
                        fontWeight: reservationStep === 'bag-selection' ? 600 : 400,
                        color: reservationStep === 'bag-selection' ? "#1976d2" : "#4caf50"
                      }}>
                        {t('bagSelectionTitle')}
                      </Typography>
                      
                      <Box sx={{ width: "20px", height: "2px", backgroundColor: reservationStep === 'datetime-selection' ? "#4caf50" : "#e0e0e0", mx: 1 }} />
                      
                      <Box sx={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: reservationStep === 'datetime-selection' ? "#1976d2" : "#e0e0e0",
                        color: reservationStep === 'datetime-selection' ? "white" : "#999",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        2
                      </Box>
                      <Typography sx={{ 
                        fontSize: "13px", 
                        fontWeight: reservationStep === 'datetime-selection' ? 600 : 400,
                        color: reservationStep === 'datetime-selection' ? "#1976d2" : "#999"
                      }}>
                         {t('dateTimeTitle')}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography sx={{ fontWeight: 500, mb: 1 }}>
                    {selectedPlace.place_name}
                  </Typography>
                  <Typography
                    sx={{ color: "text.secondary", mb: 3, fontSize: "14px" }}
                  >
                    {selectedPlace.address_name}
                  </Typography>

                  {/* 가방 선택 탭 */}
                  {reservationStep === 'bag-selection' && (
                    <>
                      <Typography sx={{ fontWeight: 500, mb: 2 }}>
                        {t("selectLuggage")}
                      </Typography>

                  {/* {t('small')} 가방 */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                      pb: 2,
                      borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 500 }}>
                        {t("smallBag")}
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: "13px" }}
                      >
                        {t("smallBagDesc")}
                      </Typography>
                      <Typography
                        sx={{ color: "primary.main", fontWeight: 500, mt: 0.5 }}
                      >
                        3,000{t("dayPerPrice")}
                      </Typography>
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "12px",
                          mt: 0.5,
                        }}
                      >
                        {getCapacityTextSync("small")}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Button
                        sx={{
                          minWidth: "36px",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#f0f2f5",
                          color: "text.primary",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "#e4e6e9",
                          },
                          "&:focus": {
                            outline: "none",
                          },
                        }}
                        onClick={() => {
                          if (bagSizes.small > 0) {
                            const newBagSizes = {
                              ...bagSizes,
                              small: bagSizes.small - 1,
                            };
                            setBagSizes(newBagSizes);
                            setTotalPrice(calculateTotalPrice(newBagSizes));
                          }
                        }}
                      >
                        -
                      </Button>
                      <Typography
                        sx={{
                          mx: 2,
                          minWidth: "24px",
                          textAlign: "center",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
                        {bagSizes.small}
                      </Typography>
                      <Button
                        disabled={isCapacityExceededSync("small", 1)}
                        sx={{
                          minWidth: "36px",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: isCapacityExceededSync("small", 1)
                            ? "#e0e0e0"
                            : "#f0f2f5",
                          color: isCapacityExceededSync("small", 1)
                            ? "#999"
                            : "text.primary",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: isCapacityExceededSync("small", 1)
                              ? "#e0e0e0"
                              : "#e4e6e9",
                          },
                          "&:focus": {
                            outline: "none",
                          },
                          "&.Mui-disabled": {
                            backgroundColor: "#e0e0e0",
                            color: "#999",
                          },
                        }}
                        onClick={() => {
                          if (!isCapacityExceededSync("small", 1)) {
                            const newBagSizes = {
                              ...bagSizes,
                              small: bagSizes.small + 1,
                            };
                            setBagSizes(newBagSizes);
                            setTotalPrice(calculateTotalPrice(newBagSizes));
                          }
                        }}
                      >
                        +
                      </Button>
                    </Box>
                  </Box>

                  {/* 중형 가방 */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                      pb: 2,
                      borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 500 }}>
                        {t("mediumBag")}
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: "13px" }}
                      >
                        {t("mediumBagDesc")}
                      </Typography>
                      <Typography
                        sx={{ color: "primary.main", fontWeight: 500, mt: 0.5 }}
                      >
                        5,000{t("dayPerPrice")}
                      </Typography>
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "12px",
                          mt: 0.5,
                        }}
                      >
                        {getCapacityTextSync("medium")}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Button
                        sx={{
                          minWidth: "36px",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#f0f2f5",
                          color: "text.primary",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "#e4e6e9",
                          },
                          "&:focus": {
                            outline: "none",
                          },
                        }}
                        onClick={() => {
                          if (bagSizes.medium > 0) {
                            const newBagSizes = {
                              ...bagSizes,
                              medium: bagSizes.medium - 1,
                            };
                            setBagSizes(newBagSizes);
                            setTotalPrice(calculateTotalPrice(newBagSizes));
                          }
                        }}
                      >
                        -
                      </Button>
                      <Typography
                        sx={{
                          mx: 2,
                          minWidth: "24px",
                          textAlign: "center",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
                        {bagSizes.medium}
                      </Typography>
                      <Button
                        disabled={isCapacityExceededSync("medium", 1)}
                        sx={{
                          minWidth: "36px",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: isCapacityExceededSync("medium", 1)
                            ? "#e0e0e0"
                            : "#f0f2f5",
                          color: isCapacityExceededSync("medium", 1)
                            ? "#999"
                            : "text.primary",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: isCapacityExceededSync("medium", 1)
                              ? "#e0e0e0"
                              : "#e4e6e9",
                          },
                          "&:focus": {
                            outline: "none",
                          },
                          "&.Mui-disabled": {
                            backgroundColor: "#e0e0e0",
                            color: "#999",
                          },
                        }}
                        onClick={() => {
                          if (!isCapacityExceededSync("medium", 1)) {
                            const newBagSizes = {
                              ...bagSizes,
                              medium: bagSizes.medium + 1,
                            };
                            setBagSizes(newBagSizes);
                            setTotalPrice(calculateTotalPrice(newBagSizes));
                          }
                        }}
                      >
                        +
                      </Button>
                    </Box>
                  </Box>

                  {/* 대형 가방 */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      pb: 2,
                      borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 500 }}>
                        {t("largeBag")}
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: "13px" }}
                      >
                        {t("largeBagDesc")}
                      </Typography>
                      <Typography
                        sx={{ color: "primary.main", fontWeight: 500, mt: 0.5 }}
                      >
                        8,000{t("dayPerPrice")}
                      </Typography>
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "12px",
                          mt: 0.5,
                        }}
                      >
                        {getCapacityTextSync("large")}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Button
                        sx={{
                          minWidth: "36px",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#f0f2f5",
                          color: "text.primary",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "#e4e6e9",
                          },
                          "&:focus": {
                            outline: "none",
                          },
                        }}
                        onClick={() => {
                          if (bagSizes.large > 0) {
                            const newBagSizes = {
                              ...bagSizes,
                              large: bagSizes.large - 1,
                            };
                            setBagSizes(newBagSizes);
                            setTotalPrice(calculateTotalPrice(newBagSizes));
                          }
                        }}
                      >
                        -
                      </Button>
                      <Typography
                        sx={{
                          mx: 2,
                          minWidth: "24px",
                          textAlign: "center",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
                        {bagSizes.large}
                      </Typography>
                      <Button
                        disabled={isCapacityExceededSync("large", 1)}
                        sx={{
                          minWidth: "36px",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: isCapacityExceededSync("large", 1)
                            ? "#e0e0e0"
                            : "#f0f2f5",
                          color: isCapacityExceededSync("large", 1)
                            ? "#999"
                            : "text.primary",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: isCapacityExceededSync("large", 1)
                              ? "#e0e0e0"
                              : "#e4e6e9",
                          },
                          "&:focus": {
                            outline: "none",
                          },
                          "&.Mui-disabled": {
                            backgroundColor: "#e0e0e0",
                            color: "#999",
                          },
                        }}
                        onClick={() => {
                          if (!isCapacityExceededSync("large", 1)) {
                            const newBagSizes = {
                              ...bagSizes,
                              large: bagSizes.large + 1,
                            };
                            setBagSizes(newBagSizes);
                            setTotalPrice(calculateTotalPrice(newBagSizes));
                          }
                        }}
                      >
                        +
                      </Button>
                    </Box>
                  </Box>

                  {/* 선택된 가방 요약 표시 */}
                  {(bagSizes.small > 0 || bagSizes.medium > 0 || bagSizes.large > 0) && (
                    <Box sx={{
                      mt: 3,
                      p: 2,
                      backgroundColor: "#f8f9fa",
                      borderRadius: "12px",
                      border: "1px solid #e9ecef"
                    }}>
                      <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "14px" }}>
                        {t('selectedBags')}
                      </Typography>
                      <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
                        {getBagSummary()}
                      </Typography>
                      <Typography sx={{ 
                        fontSize: "16px", 
                        fontWeight: 600, 
                        color: "#1976d2", 
                        mt: 1 
                      }}>
                        {t('estimatedPrice')}: {totalPrice.toLocaleString()}{t('won')}
                      </Typography>
                    </Box>
                  )}
                    </>
                  )}

                  {/* 날짜 및 시간 선택 탭 */}
                  {reservationStep === 'datetime-selection' && (
                    <>
                      <Typography sx={{ fontWeight: 500, mb: 2 }}>
                        {t('selectDateAndTime')}
                      </Typography>

                      {/* 선택된 가방 요약 - 상단에 표시 */}
                      <Box sx={{
                        mb: 3,
                        p: 2,
                        backgroundColor: "#f8f9fa",
                        borderRadius: "12px",
                        border: "1px solid #e9ecef"
                      }}>
                        <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "14px" }}>
                          {t('selectedBags')}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
                          {getBagSummary()}
                        </Typography>
                      </Box>

                      {/* 보관 기간 설정 섹션 추가 */}
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        mb: 3,
                        backgroundColor: "#f5f8ff",
                        borderRadius: "16px",
                        p: 0.5,
                      }}
                    >
                      <Button
                        variant={
                          storageDuration === "day" ? "contained" : "text"
                        }
                        sx={{
                          flex: 1,
                          py: 1.2,
                          borderRadius: "12px",
                          backgroundColor:
                            storageDuration === "day"
                              ? "#1a73e8"
                              : "transparent",
                          color: storageDuration === "day" ? "white" : "#666",
                          boxShadow: "none",
                          "&:hover": {
                            backgroundColor:
                              storageDuration === "day"
                                ? "#1565c0"
                                : "rgba(0, 0, 0, 0.04)",
                            boxShadow: "none",
                          },
                          "&:focus": { outline: "none" },
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => setStorageDuration("day")}
                      >
                        {t("daySameDay")}
                      </Button>
                      <Button
                        variant={
                          storageDuration === "period" ? "contained" : "text"
                        }
                        sx={{
                          flex: 1,
                          py: 1.2,
                          borderRadius: "12px",
                          backgroundColor:
                            storageDuration === "period"
                              ? "#1a73e8"
                              : "transparent",
                          color:
                            storageDuration === "period" ? "white" : "#666",
                          boxShadow: "none",
                          "&:hover": {
                            backgroundColor:
                              storageDuration === "period"
                                ? "#1565c0"
                                : "rgba(0, 0, 0, 0.04)",
                            boxShadow: "none",
                          },
                          "&:focus": { outline: "none" },
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => setStorageDuration("period")}
                      >
                        {t("periodStorage")}
                      </Button>
                    </Box>

                    {/* 날짜 선택 */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          mb: 1.5,
                          color: "text.secondary",
                          fontWeight: 500,
                        }}
                      >
                        {storageDuration === "day"
                          ? t("storageDate")
                          : t("storageStartDate")}
                      </Typography>
                      <TextField
                        fullWidth
                        type="date"
                        value={storageDate}
                        onChange={(e) => setStorageDate(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "white",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: isClosedOnDate(storageDate)
                                ? "#e53935"
                                : "transparent",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: isClosedOnDate(storageDate)
                                ? "#e53935"
                                : "#1a73e8",
                              borderWidth: "1px",
                            },
                          },
                          "& .MuiInputBase-input": {
                            padding: "14px 16px",
                            color: isClosedOnDate(storageDate)
                              ? "#e53935"
                              : "#333",
                            "&::-webkit-calendar-picker-indicator": {
                              filter: "invert(0.5)",
                              cursor: "pointer",
                            },
                          },
                        }}
                        inputProps={{
                          min: new Date().toISOString().split("T")[0], // Only allow dates after today
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      {/* 휴무일 경고 메시지 */}
                      {storageDate && isClosedOnDate(storageDate) && (
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#e53935",
                            mt: 1,
                            pl: 1,
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="#e53935"
                          >
                            <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                          </svg>
                          {t('selectedDateClosed')}
                        </Typography>
                      )}
                    </Box>

                    {/* 기간 보관일 경우 종료 날짜도 표시 */}
                    {storageDuration === "period" && (
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            mb: 1.5,
                            color: "text.secondary",
                            fontWeight: 500,
                          }}
                        >
                          {t("storageEndDate")}
                        </Typography>
                        <TextField
                          fullWidth
                          type="date"
                          value={storageEndDate}
                          onChange={(e) => setStorageEndDate(e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              backgroundColor: "white",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: isClosedOnDate(storageEndDate)
                                  ? "#e53935"
                                  : "transparent",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: isClosedOnDate(storageEndDate)
                                    ? "#e53935"
                                    : "#1a73e8",
                                  borderWidth: "1px",
                                },
                            },
                            "& .MuiInputBase-input": {
                              padding: "14px 16px",
                              color: isClosedOnDate(storageEndDate)
                                ? "#e53935"
                                : "#333",
                              "&::-webkit-calendar-picker-indicator": {
                                filter: "invert(0.5)",
                                cursor: "pointer",
                              },
                            },
                          }}
                          inputProps={{
                            min: new Date().toISOString().split("T")[0], // Only allow dates after today
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                        {/* 종료일 휴무일 경고 메시지 */}
                        {storageEndDate && isClosedOnDate(storageEndDate) && (
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "#e53935",
                              mt: 1,
                              pl: 1,
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="#e53935"
                            >
                              <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
                            </svg>
                            {t('selectedEndDateClosed')}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* 시간 선택 - 버튼 기반 UI로 변경 */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          mb: 1.5,
                          color: "text.secondary",
                          fontWeight: 500,
                        }}
                      >
                        {t("storageTime")}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        {/* 시작 시간 선택 */}
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              mb: 1,
                              color: "#1a73e8",
                              fontWeight: 500,
                            }}
                          >
                            {t("startTime")}
                          </Typography>

                          <Box
                            sx={{
                              maxHeight: "180px",
                              overflowY: "auto",
                              pr: 1,
                              "&::-webkit-scrollbar": {
                                width: "4px",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "rgba(0, 0, 0, 0.2)",
                                borderRadius: "4px",
                              },
                            }}
                          >
                            {getAvailableStartTimeOptions(storageDate).map((time) => (
                              <Button
                                key={`start-${time}`}
                                variant={
                                  storageStartTime === time
                                    ? "contained"
                                    : "text"
                                }
                                fullWidth
                                sx={{
                                  justifyContent: "flex-start",
                                  py: 1,
                                  mb: 0.5,
                                  borderRadius: "8px",
                                  backgroundColor:
                                    storageStartTime === time
                                      ? "#1a73e8"
                                      : "transparent",
                                  color:
                                    storageStartTime === time
                                      ? "white"
                                      : "text.secondary",
                                  "&:hover": {
                                    backgroundColor:
                                      storageStartTime === time
                                        ? "#1565c0"
                                        : "rgba(0, 0, 0, 0.04)",
                                  },
                                  textTransform: "none",
                                  fontWeight:
                                    storageStartTime === time ? 500 : 400,
                                  fontSize: "14px",
                                  "&:focus": {
                                    outline: "none",
                                  },
                                  "&.Mui-focusVisible": {
                                    outline: "none",
                                  },
                                }}
                                onClick={() => {
                                  setStorageStartTime(time);
                                  // 시작 시간 이후의 옵션만 종료 시간으로 선택 가능하도록
                                  if (
                                    storageEndTime &&
                                    time >= storageEndTime
                                  ) {
                                    // 시작 시간보다 최소 30분 후를 종료 시간으로 설정
                                    const timeIndex = getAvailableStartTimeOptions(storageDate).indexOf(time);
                                    if (timeIndex < getAvailableStartTimeOptions(storageDate).length - 1) {
                                      setStorageEndTime(
                                        getAvailableStartTimeOptions(storageDate)[timeIndex + 1]
                                      );
                                    }
                                  }
                                }}
                              >
                                {time}
                              </Button>
                            ))}
                          </Box>
                        </Box>

                        {/* 종료 시간 선택 */}
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              fontSize: "13px",
                              mb: 1,
                              color: "#1a73e8",
                              fontWeight: 500,
                            }}
                          >
                            {t("endTime")}
                          </Typography>

                          <Box
                            sx={{
                              maxHeight: "180px",
                              overflowY: "auto",
                              pr: 1,
                              "&::-webkit-scrollbar": {
                                width: "4px",
                              },
                              "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "rgba(0, 0, 0, 0.2)",
                                borderRadius: "4px",
                              },
                            }}
                          >
                            {timeOptions
                              .filter(
                                (time) =>
                                  !storageStartTime || time > storageStartTime
                              ) // 시작 시간 이후 시간만 표시
                              .map((time) => (
                                <Button
                                  key={`end-${time}`}
                                  variant={
                                    storageEndTime === time
                                      ? "contained"
                                      : "text"
                                  }
                                  fullWidth
                                  sx={{
                                    justifyContent: "flex-start",
                                    py: 1,
                                    mb: 0.5,
                                    borderRadius: "8px",
                                    backgroundColor:
                                      storageEndTime === time
                                        ? "#1a73e8"
                                        : "transparent",
                                    color:
                                      storageEndTime === time
                                        ? "white"
                                        : "text.secondary",
                                    "&:hover": {
                                      backgroundColor:
                                        storageEndTime === time
                                          ? "#1565c0"
                                          : "rgba(0, 0, 0, 0.04)",
                                    },
                                    textTransform: "none",
                                    fontWeight:
                                      storageEndTime === time ? 500 : 400,
                                    fontSize: "14px",
                                    "&:focus": {
                                      outline: "none",
                                    },
                                    "&.Mui-focusVisible": {
                                      outline: "none",
                                    },
                                  }}
                                  onClick={() => setStorageEndTime(time)}
                                >
                                  {time}
                                </Button>
                              ))}
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* 시간 선택 가이드 - 선택된 장소의 운영 시간 표시 */}
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: isTimeValid ? "text.secondary" : "#e53935",
                        mb: 2,
                        pl: 1,
                        fontWeight: isTimeValid ? "normal" : 500,
                      }}
                    >
                      {selectedPlace
                        ? t('operatingHoursFormat', { start: getPlaceOperatingHours(selectedPlace).start, end: getPlaceOperatingHours(selectedPlace).end })
                        : t("operatingHoursDefault")}
                      {!isTimeValid &&
                        (isClosedOnDate(storageDate) ||
                        (storageDuration === "period" &&
                          isClosedOnDate(storageEndDate))
                          ? t('closedOnSelectedDateWarning')
                          : t("operatingHoursWarning"))}
                    </Typography>
                  </Box>

                  {/* 총 보관 시간 표시 */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 2.5,
                      borderRadius: "16px",
                      backgroundColor: "rgba(26, 115, 232, 0.05)",
                      border: "1px solid rgba(26, 115, 232, 0.1)",
                      mb: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(26, 115, 232, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                          fill="#1a73e8"
                        />
                        <path
                          d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                          fill="#1a73e8"
                        />
                      </svg>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          color: "#1a73e8",
                          fontWeight: 500,
                          lineHeight: 1.5,
                        }}
                      >
                        {calculateStorageTimeText()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 총 금액 */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      backgroundColor: "rgba(26, 115, 232, 0.08)",
                      p: 2,
                      borderRadius: "12px",
                    }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>
                      {t("totalAmount")}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#1a73e8",
                        fontSize: "18px",
                      }}
                    >
                      {totalPrice.toLocaleString()}
                      {t("won")}
                    </Typography>
                  </Box>

                  {/* 쿠폰 적용 */}
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontWeight: 500, mb: 1.5, fontSize: "14px" }}>
                      쿠폰
                    </Typography>

                    {appliedCoupon ? (
                      // 쿠폰 적용됨
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "#e8f5e9",
                          borderRadius: "12px",
                          border: "1px solid #4caf50",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography sx={{ fontWeight: 600, color: "#2e7d32", fontSize: "14px" }}>
                            ✓ {appliedCoupon.couponName}
                          </Typography>
                          <Button
                            size="small"
                            onClick={removeCoupon}
                            sx={{
                              color: "#666",
                              fontSize: "12px",
                              textDecoration: "underline",
                              "&:hover": { backgroundColor: "transparent" }
                            }}
                          >
                            취소
                          </Button>
                        </Box>
                        <Typography sx={{ fontSize: "13px", color: "#2e7d32" }}>
                          - {couponDiscount.toLocaleString()}원 할인
                        </Typography>
                      </Box>
                    ) : (
                      // 쿠폰 선택 버튼
                      <>
                        <Button
                          variant="outlined"
                          onClick={handleOpenCouponModal}
                          fullWidth
                          startIcon={<LocalOfferIcon />}
                          sx={{
                            py: 1.5,
                            borderRadius: "8px",
                            borderColor: "#1a73e8",
                            color: "#1a73e8",
                            fontSize: "14px",
                            fontWeight: 500,
                            "&:hover": {
                              borderColor: "#1565c0",
                              backgroundColor: "rgba(26, 115, 232, 0.04)"
                            }
                          }}
                        >
                          보유 쿠폰 선택하기
                        </Button>
                        {couponError && (
                          <Typography sx={{ fontSize: "12px", color: "#d32f2f", mt: 1 }}>
                            {couponError}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>

                  {/* 최종 결제 금액 (쿠폰 적용 시) */}
                  {appliedCoupon && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                        backgroundColor: "#1a73e8",
                        p: 2,
                        borderRadius: "12px",
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, color: "white" }}>
                        최종 결제 금액
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "white",
                          fontSize: "20px",
                        }}
                      >
                        {(totalPrice - couponDiscount).toLocaleString()}
                        {t("won")}
                      </Typography>
                    </Box>
                  )}
                    </>
                  )}
                </Box>
              )}
            </>
          ) : (
            // 검색 결과 목록
            <List
              sx={{
                "& .MuiListItem-root": {
                  borderRadius: "16px",
                  mb: 1.5,
                  backgroundColor: "#f8f9fa",
                  transition: "all 0.2s ease-out",
                  "&:hover": {
                    backgroundColor: "#f0f2f5",
                    transform: "translateY(-1px)", // 더 미묘한 호버 효과
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  },
                },
                // 마지막 아이템 아래 여백 추가
                "& .MuiListItem-root:last-child": {
                  mb: 3,
                },
              }}
            >
              {searchResults.map((place, index) => (
                <ListItem
                  key={index}
                  onClick={() => {
                    // 이미 결제가 완료된 상태라면 다른 장소를 선택하지 못하도록 함
                    if (isPaymentComplete) {
                      return;
                    }

                    // Partnership 데이터 찾기
                    const partnership = partnerships.find(p => 
                      p.businessName === place.place_name &&
                      p.address === place.address_name
                    );

                    // Partnership 추가 데이터 포함
                    const enrichedPlace = {
                      ...place,
                      storePictures: partnership?.storePictures || [],
                      amenities: partnership?.amenities || [],
                      insuranceAvailable: partnership?.insuranceAvailable || false,
                      smallBagsAvailable: partnership?.smallBagsAvailable,
                      mediumBagsAvailable: partnership?.mediumBagsAvailable,
                      largeBagsAvailable: partnership?.largeBagsAvailable,
                    };

                    setSelectedPlace(enrichedPlace);
                    setShowReservations(false); // 예약목록 숨기기
                    const moveLatLng = new window.naver.maps.LatLng(
                      place.y,
                      place.x
                    );
                    mapInstance?.setCenter(moveLatLng);
                  }}
                  sx={{
                    p: 2,
                    cursor: isPaymentComplete ? "default" : "pointer",
                    opacity: isPaymentComplete ? 0.5 : 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                        {place.place_name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ color: "text.secondary" }}>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{
                            color:
                              place.category_group_code === "BK9"
                                ? "primary.main"
                                : "success.main",
                            fontWeight: 500,
                            mr: 1,
                          }}
                        >
                          {place.category_group_code === "BK9"
                            ? "[은행]"
                            : "[편의점]"}
                        </Typography>
                        {place.address_name}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          </Box>
        </Box>

        {/* 하단 고정 버튼 영역 */}
        {selectedPlace && !isReservationOpen && !isPaymentOpen && !isPaymentComplete && (
          <Box
            sx={{
              p: 3,
              borderTop: "1px solid rgba(0, 0, 0, 0.06)",
              backgroundColor: "white",
              borderRadius: "0 0 24px 24px",
            }}
          >
            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{
                height: "52px",
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 600,
                backgroundColor: "#1976d2",
                color: "white",
                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.3)",
                "&:hover": {
                  backgroundColor: "#1565c0",
                  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                },
              }}
              onClick={() => {
                if (isAuthenticated) {
                  setIsReservationOpen(true);
                  setReservationStep('bag-selection'); // 단계 초기화
                  // 초기화
                  setBagSizes({
                    small: 0,
                    medium: 0,
                    large: 0,
                  });
                  setTotalPrice(0);
                } else {
                  navigate('/login');
                }
              }}
            >
              {isAuthenticated ? t('makeReservation') : t('loginToReserve')}
            </Button>
          </Box>
        )}

        {isReservationOpen && !isPaymentOpen && !isPaymentComplete && (
          <Box
            sx={{
              p: 3,
              borderTop: "1px solid rgba(0, 0, 0, 0.06)",
              backgroundColor: "white",
              borderRadius: "0 0 24px 24px",
              display: "flex",
              gap: 2
            }}
          >
            {/* 뒤로가기 버튼 - 날짜/시간 선택 탭에서만 표시 */}
            {reservationStep === 'datetime-selection' && (
              <Button
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  color: "#1976d2",
                  borderColor: "#1976d2",
                  borderRadius: "12px",
                  p: 1.5,
                  minWidth: "100px",
                  "&:hover": { 
                    backgroundColor: "#f5f5f5",
                    borderColor: "#1565c0"
                  },
                  "&:focus": {
                    outline: "none",
                  },
                  transition: "all 0.2s ease",
                }}
                onClick={() => setReservationStep('bag-selection')}
              >
                {t('previous')}
              </Button>
            )}

            <Button
              variant="contained"
              fullWidth
              disabled={
                reservationStep === 'bag-selection' 
                  ? (bagSizes.small === 0 && bagSizes.medium === 0 && bagSizes.large === 0)
                  : (!storageDate ||
                     !storageStartTime ||
                     !storageEndTime ||
                     (storageDuration === "period" && !storageEndDate) ||
                     !selectedPlace ||
                     !isTimeValid ||
                     isClosedOnDate(storageDate) ||
                     (storageDuration === "period" &&
                       storageEndDate &&
                       isClosedOnDate(storageEndDate)))
              }
              sx={{
                backgroundColor: "#1a73e8",
                color: "white",
                borderRadius: "12px",
                p: 1.5,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#1565c0" },
                "&:disabled": {
                  backgroundColor: "rgba(0, 0, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)",
                },
                "&:focus": {
                  outline: "none",
                  backgroundColor: "#0d47a1",
                },
                transition: "background-color 0.2s ease",
              }}
              onClick={() => {
                if (reservationStep === 'bag-selection') {
                  // 가방 선택 단계에서는 다음 단계로
                  setReservationStep('datetime-selection');
                } else {
                  // 날짜/시간 선택 단계에서는 결제로
                  if (
                    totalPrice > 0 &&
                    isTimeValid &&
                    storageDate &&
                    storageStartTime &&
                    storageEndTime &&
                    (storageDuration !== "period" || storageEndDate) &&
                    !isClosedOnDate(storageDate) &&
                    !(
                      storageDuration === "period" &&
                      storageEndDate &&
                      isClosedOnDate(storageEndDate)
                    )
                  ) {
                    if (!isAuthenticated) {
                      setReservationError(t("loginRequiredMessage"));
                    } else {
                      setIsPaymentOpen(true);
                    }
                  }
                }
              }}
            >
              {reservationStep === 'bag-selection'
                ? (bagSizes.small === 0 && bagSizes.medium === 0 && bagSizes.large === 0)
                  ? t('selectBagsPlease')
                  : t('nextStep')
                : !isAuthenticated
                  ? t("loginRequired")
                  : isClosedOnDate(storageDate) ||
                    (storageDuration === "period" &&
                      storageEndDate &&
                      isClosedOnDate(storageEndDate))
                  ? t('closedOnSelectedDate')
                  : !isTimeValid
                  ? t("setWithinOperatingHours")
                  : !storageDate ||
                    !storageStartTime ||
                    !storageEndTime ||
                    (storageDuration === "period" && !storageEndDate)
                  ? t("selectAllDateAndTime")
                  : appliedCoupon
                    ? `${(totalPrice - couponDiscount).toLocaleString()}${t("won")} ${t("pay")}`
                    : `${totalPrice.toLocaleString()}${t("won")} ${t("pay")}`}
            </Button>
          </Box>
        )}
      </Box>



      {/* 에러 메시지 스낵바 */}
      <Snackbar
        open={!!reservationError}
        autoHideDuration={6000}
        onClose={() => setReservationError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setReservationError("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {reservationError}
        </Alert>
      </Snackbar>

      {/* 예약 취소 에러 메시지 스낵바 */}
      <Snackbar
        open={!!cancelError}
        autoHideDuration={6000}
        onClose={() => setCancelError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setCancelError("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {cancelError}
        </Alert>
      </Snackbar>

      {/* 예약 취소 성공 메시지 스낵바 */}
      <Snackbar
        open={!!cancelSuccess}
        autoHideDuration={3000}
        onClose={() => setCancelSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setCancelSuccess("")}
          severity="success"
          sx={{ width: "100%" }}
        >
          {cancelSuccess}
        </Alert>
      </Snackbar>

      {/* 쿠폰 적용 성공 메시지 스낵바 */}
      <Snackbar
        open={!!couponSuccess}
        autoHideDuration={3000}
        onClose={() => setCouponSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setCouponSuccess("")}
          severity="success"
          sx={{ width: "100%" }}
        >
          {couponSuccess}
        </Alert>
      </Snackbar>

      {!selectedPlace &&
        !isReservationOpen &&
        !isPaymentOpen &&
        !isPaymentComplete &&
        searchResults.length > 0 && (
          <Box sx={{ pb: 2 }}> {/* 하단 여백 추가 */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {t("searchResultTitle", { count: searchResults.length })}
            </Typography>
            <Stack spacing={2}>
              {searchResults.map((place, index) => (
                <Box
                  key={index}
                  onClick={() => {
                    // Partnership 데이터 찾기
                    const partnership = partnerships.find(p => 
                      p.businessName === place.place_name &&
                      p.address === place.address_name
                    );

                    // Partnership 추가 데이터 포함
                    const enrichedPlace = {
                      ...place,
                      storePictures: partnership?.storePictures || [],
                      amenities: partnership?.amenities || [],
                      insuranceAvailable: partnership?.insuranceAvailable || false,
                      smallBagsAvailable: partnership?.smallBagsAvailable,
                      mediumBagsAvailable: partnership?.mediumBagsAvailable,
                      largeBagsAvailable: partnership?.largeBagsAvailable,
                    };

                    setSelectedPlace(enrichedPlace);
                    setShowReservations(false); // 예약목록 숨기기
                  }}
                  sx={{
                    borderRadius: "12px",
                    backgroundColor: "white",
                    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.2s",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                      transform: "translateY(-2px)",
                    },
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {place.place_name}
                  </Typography>
                  {place.business_type && (
                    <Typography
                      sx={{
                        borderRadius: "10px",
                        padding: "2px 6px",
                        display: "inline-block",
                        fontSize: "12px",
                        mb: 1,
                        mt: 0.5,
                      }}
                      className={`business-type-${place.business_type}`}
                    >
                      {place.business_type}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {place.address_name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "primary.main", mt: 1 }}
                  >
                    {place.phone || t("noPhoneNumber")}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {(() => {
                      // 영업시간 배열 생성
                      let hoursArray: string[] = [];
                      
                      if (place.opening_hours) {
                        // 제휴점인 경우 businessHours에서 배열로 가져오기
                        const partnership = partnerships.find(p => 
                          p.businessName === place.place_name &&
                          p.address === place.address_name
                        );
                        
                        if (partnership && partnership.businessHours) {
                          hoursArray = formatBusinessHoursArray(partnership.businessHours);
                        } else {
                          hoursArray = [place.opening_hours];
                        }
                      } else {
                        // 기본값
                        hoursArray = place.category_group_code === "BK9"
                          ? [t("bankHours")]
                          : place.category_group_code === "CS2"
                          ? [t("storeHours")]
                          : [t("noOpeningHours")];
                      }
                      
                      return hoursArray.map((hour, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          sx={{
                            color: hour.includes(t('open24Hours'))
                              ? "success.main"
                              : "text.secondary",
                            lineHeight: 1.4,
                          }}
                        >
                          {hour}
                        </Typography>
                      ));
                    })()}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

      {/* 사용자 메뉴 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f3f4f6',
            minWidth: '160px',
            marginTop: '8px',
          },
          '& .MuiMenuItem-root': {
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#1a1a1a',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            '&:hover': {
              backgroundColor: '#f9fafb',
              color: '#2563eb',
            },
            '&:first-of-type': {
              marginTop: '4px',
            },
            '&:last-of-type': {
              marginBottom: '4px',
            },
            '& .MuiSvgIcon-root': {
              fontSize: '18px',
            },
          },
          '& .MuiDivider-root': {
            margin: '6px 0',
            borderColor: '#f3f4f6',
          },
        }}
      >
        {isAuthenticated ? (
          [
            <MenuItem key="profile" onClick={() => { handleMenuClose(); navigate('/profile'); }}>
              <PersonIcon />
              내 프로필
            </MenuItem>,
            <MenuItem key="settings" onClick={() => { handleMenuClose(); navigate('/settings'); }}>
              <SettingsIcon />
              설정
            </MenuItem>,
            <Divider key="divider" />,
            <MenuItem 
              key="logout" 
              onClick={() => { 
                handleMenuClose(); 
                logout();
                navigate('/');
              }}
              sx={{
                color: '#dc2626 !important',
                '&:hover': {
                  backgroundColor: '#fee2e2 !important',
                  color: '#dc2626 !important',
                },
              }}
            >
              <LogoutIcon />
              로그아웃
            </MenuItem>
          ]
        ) : (
          [
            <MenuItem key="login" onClick={() => { handleMenuClose(); navigate('/login'); }}>
              <LoginIcon />
              로그인
            </MenuItem>,
            <MenuItem key="register" onClick={() => { handleMenuClose(); navigate('/register'); }}>
              <PersonAddIcon />
              회원가입
            </MenuItem>
          ]
        )}
      </Menu>

      {/* 언어 선택 메뉴 */}
      <Menu
        anchorEl={langMenuAnchorEl}
        open={Boolean(langMenuAnchorEl)}
        onClose={handleLangMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f3f4f6',
            minWidth: '160px',
            marginTop: '8px',
          },
          '& .MuiMenuItem-root': {
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#1a1a1a',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            '&:hover': {
              backgroundColor: '#f9fafb',
              color: '#2563eb',
            },
            '&:first-of-type': {
              marginTop: '4px',
            },
            '&:last-of-type': {
              marginBottom: '4px',
            },
            '& .MuiSvgIcon-root': {
              fontSize: '18px',
            },
          },
        }}
      >
        <MenuItem onClick={() => changeLanguage('ko')}>
          <LanguageIcon />
          한국어
        </MenuItem>
        <MenuItem onClick={() => changeLanguage('en')}>
          <LanguageIcon />
          English
        </MenuItem>
      </Menu>

      {/* 배달 신청 모달 */}
      <Modal
        open={isDeliveryModalOpen}
        onClose={handleCloseDeliveryModal}
        aria-labelledby="delivery-modal-title"
        aria-describedby="delivery-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '500px' },
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 3
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            배달 서비스 신청
          </Typography>

          {/* 스텝 인디케이터 */}
          <Stepper 
            activeStep={deliveryStep} 
            alternativeLabel 
            sx={{ 
              mb: 3,
              '& .MuiStep-root': {
                padding: 0
              },
              '& .MuiStepLabel-root': {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              },
              '& .MuiStepLabel-label': {
                fontSize: '12px',
                fontWeight: 500,
                textAlign: 'center',
                marginTop: '4px'
              },
              '& .MuiStepIcon-root': {
                fontSize: '18px'
              },
              '& .MuiStepConnector-root': {
                top: '9px'
              }
            }}
          >
            {deliverySteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* 스텝별 컨텐츠 */}
          {deliveryStep === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                짐을 어디로 배달할지 선택해주세요
              </Typography>

              <FormControl component="fieldset">
                <RadioGroup
                  value={deliveryType}
                  onChange={handleDeliveryTypeChange}
                >
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      border: deliveryType === 'partner' ? 2 : 1,
                      borderColor: deliveryType === 'partner' ? 'primary.main' : 'grey.300'
                    }}
                  >
                    <FormControlLabel
                      value="partner"
                      control={<Radio />}
                      label={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StorefrontIcon color="primary" />
                            <Typography variant="subtitle1">
                              트래블라이트 제휴 매장으로 배달
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            전국 각지의 트래블라이트 제휴 매장으로 짐을 배달받을 수 있습니다.
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>

                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      border: deliveryType === 'custom' ? 2 : 1,
                      borderColor: deliveryType === 'custom' ? 'primary.main' : 'grey.300'
                    }}
                  >
                    <FormControlLabel
                      value="custom"
                      control={<Radio />}
                      label={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOnIcon color="primary" />
                            <Typography variant="subtitle1">
                              특정 주소로 배달
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            집, 호텔, 회사 등 원하는 주소지로 짐을 배달받을 수 있습니다.
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {deliveryStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {deliveryType === 'partner' ? '제휴 매장 선택' : '배달 주소 입력'}
              </Typography>

              {deliveryType === 'partner' ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    배달받을 제휴 매장을 검색하거나 선택해주세요
                  </Typography>

                  <TextField
                    fullWidth
                    label="매장명 또는 주소로 검색"
                    variant="outlined"
                    size="small"
                    value={partnerSearchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        height: "40px",
                        borderRadius: "8px",
                      },
                      '& .MuiInputBase-input': {
                        fontSize: "14px",
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: "14px",
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <Button 
                          variant="contained" 
                          onClick={handleSearch}
                          disabled={isSearching}
                          size="small"
                          sx={{ 
                            ml: 1,
                            minWidth: "65px",
                            height: "32px",
                            fontSize: "12px"
                          }}
                        >
                          {isSearching ? <CircularProgress size={10} /> : '검색'}
                        </Button>
                      ),
                    }}
                  />

                  {isSearching ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : partnerSearchResults.length > 0 ? (
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {partnerSearchResults.map((partner) => (
                        <Paper
                          key={partner.id}
                          variant="outlined"
                          sx={{
                            p: 2,
                            mb: 1,
                            cursor: 'pointer',
                            border: selectedPartner?.id === partner.id ? 2 : 1,
                            borderColor: selectedPartner?.id === partner.id ? 'primary.main' : 'grey.300'
                          }}
                          onClick={() => handlePartnerSelect(partner)}
                        >
                          <Typography variant="subtitle1">{partner.businessName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {partner.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {partner.is24Hours ? '24시간 영업' : '영업시간: 09:00-18:00'}
                          </Typography>
                          {selectedPartner?.id === partner.id && estimatedPrice > 0 && (
                            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                              예상 배달 가격: {estimatedPrice.toLocaleString()}원
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  ) : partnerSearchQuery ? (
                    <Alert severity="info">검색 결과가 없습니다.</Alert>
                  ) : null}
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    정확한 주소를 입력해주세요
                  </Typography>
                  <TextField
                    fullWidth
                    label="배달 주소"
                    variant="outlined"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  {customAddress && (
                    <Button 
                      variant="outlined" 
                      onClick={calculatePrice}
                      sx={{ mb: 2 }}
                    >
                      배달 가격 계산하기
                    </Button>
                  )}
                  {estimatedPrice > 0 && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2">예상 배달 가격</Typography>
                      <Typography variant="h5" color="primary">
                        {estimatedPrice.toLocaleString()}원
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
            </Box>
          )}

          {deliveryStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                배달 신청 확인
              </Typography>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>배달 정보</Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">배달 유형:</Typography>
                    <Typography variant="body2">
                      {deliveryType === 'partner' ? '제휴 매장으로 배달' : '특정 주소로 배달'}
                    </Typography>
                  </Box>

                  {deliveryType === 'partner' && selectedPartner && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">배달 매장:</Typography>
                      <Typography variant="body2">{selectedPartner.businessName}</Typography>
                    </Box>
                  )}

                  {deliveryType === 'custom' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">배달 주소:</Typography>
                      <Typography variant="body2">{customAddress}</Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">짐 정보:</Typography>
                    <Typography variant="body2">
                      소형 {currentReservationForDelivery?.smallBags}개, 
                      중형 {currentReservationForDelivery?.mediumBags}개, 
                      대형 {currentReservationForDelivery?.largeBags}개
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">보관 위치:</Typography>
                    <Typography variant="body2">{currentReservationForDelivery?.placeName}</Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">예상 배달 가격:</Typography>
                    <Typography variant="subtitle2" color="primary">
                      {estimatedPrice.toLocaleString()}원
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Alert severity="info" sx={{ mt: 2 }}>
                배달 접수 후 배달 예정 시간은 문자로 안내드립니다.
              </Alert>
            </Box>
          )}

          {/* 액션 버튼들 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant="outlined" onClick={handlePrevStep}>
              {deliveryStep === 0 ? '취소' : '이전'}
            </Button>
            
            {deliveryStep === 2 ? (
              <Button 
                variant="contained" 
                onClick={handleDeliverySubmit}
              >
                배달 신청하기
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleNextStep}
                disabled={
                  (deliveryStep === 0 && !deliveryType) || 
                  (deliveryStep === 1 && (
                    (deliveryType === 'partner' && !selectedPartner) || 
                    (deliveryType === 'custom' && !customAddress)
                  ))
                }
              >
                다음
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

      {/* 리뷰 작성 폼 */}
      {selectedReservationForReview && (
        <ReviewForm
          open={reviewFormOpen}
          onClose={() => {
            setReviewFormOpen(false);
            setSelectedReservationForReview(null);
            setEditingReview(null);
          }}
          onSubmit={handleReviewSubmit}
          reservationId={selectedReservationForReview.id}
          placeName={selectedReservationForReview.placeName}
          placeAddress={selectedReservationForReview.placeAddress}
          userId={user?.id}
          editingReview={editingReview}
        />
      )}

      {/* 쿠폰 선택 모달 */}
      {user && (
        <CouponSelectModal
          open={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)}
          onSelectCoupon={handleSelectCoupon}
          userId={user.id}
          purchaseAmount={totalPrice}
        />
      )}
    </>
  );
};

export default Map;
