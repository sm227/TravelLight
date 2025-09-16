import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Paper,
  Tab,
  Divider,
  Stack,
  TextField,
  Alert,
  Modal,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  IconButton,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import Navbar from '../components/Navbar';
import ReviewForm from '../components/reviews/ReviewForm';
import { styled } from '@mui/material/styles';
import './MyPage.css';
import { useAuth } from '../services/AuthContext';
import { getMyReservations } from '../services/reservationService';
import { ReservationDto } from '../types/reservation';
import { useTranslation } from 'react-i18next';
import { userService, PasswordChangeRequest, Partnership, partnershipService, DeliveryRequest, DeliveryResponse, reviewService } from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import axios from 'axios';

// Custom styled components
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  padding: '10px 20px',
  textTransform: 'none',
  fontWeight: 'bold',
}));

const ActiveButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: '#3F51B5',
  color: 'white',
  '&:hover': {
    backgroundColor: '#303F9F',
  },
}));

const InactiveButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: '#000',
  border: '1px solid #E0E0E0',
  '&:hover': {
    backgroundColor: '#F5F5F5',
  },
}));

const ModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const deliverySteps = ['배달 방식 선택', '배달 정보 입력', '정보 확인 및 신청'];

// 배달 상태 정보와 스텝 추가
const deliveryStatusSteps = [
  { status: 'PENDING', label: '배송접수' },
  { status: 'ACCEPTED', label: '배송준비' },
  { status: 'PICKED_UP', label: '배송중' },
  { status: 'DELIVERED', label: '배송완료' }
];

// CSS 스타일 추가
const DeliveryStatusContainer = styled('div')(({ theme }) => ({
  marginTop: '16px',
  padding: '16px',
  borderTop: '1px solid #e0e0e0',
  borderRadius: '0 0 8px 8px',
}));

const MyPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [myTrips, setMyTrips] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // 비밀번호 변경 관련 상태
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  // 배달 관련 상태
  const [isDeliveryView, setIsDeliveryView] = useState(false);
  const [deliveryType, setDeliveryType] = useState('');
  const [currentReservation, setCurrentReservation] = useState<ReservationDto | null>(null);
  const [customAddress, setCustomAddress] = useState('');
  const [deliveryStep, setDeliveryStep] = useState(0);
  
  // 제휴 매장 관련 상태
  const [partnerStores, setPartnerStores] = useState<Partnership[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partnership | null>(null);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);

  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Partnership[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 리뷰 관련 상태
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationDto | null>(null);
  const [reviewStatuses, setReviewStatuses] = useState<{[key: number]: boolean}>({});
  const [editingReview, setEditingReview] = useState<any>(null);

  // 배달 상태 정보 추가
  const [deliveries, setDeliveries] = useState<DeliveryResponse[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  // 예약 상태를 체크하고 업데이트하는 함수
  const checkAndUpdateReservationStatus = (reservations: ReservationDto[]): ReservationDto[] => {
    const now = new Date();
    return reservations.map(reservation => {
      const endDateTime = new Date(`${reservation.storageEndDate}T${reservation.storageEndTime}`);

      if (reservation.status === 'RESERVED' && now > endDateTime) {
        return {
          ...reservation,
          status: 'COMPLETED' as const
        };
      }
      return reservation;
    });
  };

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

  // 예약 목록 조회 시 각 예약에 대한 배달 정보와 리뷰 상태도 함께 조회
  useEffect(() => {
    const fetchReservationsWithDeliveries = async () => {
      if (user?.id) {
        try {
          const reservations = await getMyReservations(user.id);
          const updatedReservations = checkAndUpdateReservationStatus(reservations);
          // 최신 예약을 맨 위로 정렬 (ID 기준 내림차순 - 더 높은 ID가 최신)
          const sortedReservations = updatedReservations.sort((a, b) => b.id - a.id);
          setMyTrips(sortedReservations);

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
          console.error('예약 정보를 불러오는데 실패했습니다:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReservationsWithDeliveries();

    // 1분마다 상태를 체크하고 업데이트
    const interval = setInterval(() => {
      setMyTrips(prevTrips => checkAndUpdateReservationStatus(prevTrips));
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // 해당 예약에 대한 배달 정보 조회
  const getDeliveriesForReservation = (reservationId: number) => {
    return deliveries.filter(delivery => delivery.reservationId === reservationId);
  };

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return t('statusReserved');
      case 'COMPLETED':
        return t('statusCompleted');
      case 'CANCELLED':
        return t('statusCancelled');
      default:
        return status;
    }
  };
  
  const handleChangePassword = async () => {
    // 유효성 검사
    if (!currentPassword) {
      setPasswordError('현재 비밀번호를 입력해주세요');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('새 비밀번호를 입력해주세요');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다');
      return;
    }
    
    try {
      const passwordChangeRequest: PasswordChangeRequest = {
        currentPassword,
        newPassword
      };
      
      console.log('비밀번호 변경 요청 데이터:', passwordChangeRequest);
      console.log('사용자 ID:', user?.id);
      
      if (user?.id) {
        // 백그라운드에서 상태 초기화를 방지하기 위해 axios 직접 사용
        await userService.changePassword(user.id, passwordChangeRequest);
        
        // 성공 메시지 표시 및 입력 필드 초기화
        setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다');
        setPasswordError(null);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => {
          setPasswordSuccess(null);
        }, 3000);
      }
    } catch (error: unknown) {
      console.error('비밀번호 변경 중 오류:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response && 
        error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data ? 
        (error.response.data.message as string) : '비밀번호 변경 중 오류가 발생했습니다';
      setPasswordError(errorMessage);
    }
  };

  // 제휴 매장 목록 가져오기
  const fetchPartnerStores = async () => {
    try {
      setLoadingPartners(true);
      const response = await partnershipService.getAllPartnerships();
      // APPROVED 상태인 제휴점만 필터링
      const approvedPartners = response.data.filter(p => p.status === 'APPROVED');
      setPartnerStores(approvedPartners);
    } catch (error) {
      console.error('제휴 매장 정보를 불러오는데 실패했습니다:', error);
    } finally {
      setLoadingPartners(false);
    }
  };

  // 거리 및 가격 계산
  const calculatePrice = async () => {
    if (!currentReservation) return 0;
    
    try {
      let destinationLat = 0;
      let destinationLng = 0;
      
      // 선택된 제휴 매장의 위치 정보 사용
      if (deliveryType === 'partner' && selectedPartner) {
        destinationLat = selectedPartner.latitude;
        destinationLng = selectedPartner.longitude;
      }
      
      // 원래 매장의 위치 (보관했던 장소)
      const originLat = 37.5665; // 예시 위치 - 실제로는 DB에서 가져와야 함
      const originLng = 126.9780; // 예시 위치
      
      // 총 짐 개수 계산
      const totalLuggage = currentReservation.smallBags + currentReservation.mediumBags + currentReservation.largeBags;
      
      // 가격 계산 서비스 호출
      const price = await partnershipService.calculateDeliveryEstimate(
        originLat,
        originLng,
        destinationLat,
        destinationLng,
        totalLuggage
      );
      
      setEstimatedPrice(price);
      return price;
    } catch (error) {
      console.error('배달 가격 계산 오류:', error);
      return 0;
    }
  };

  const handleStartDelivery = (trip: ReservationDto) => {
    setCurrentReservation(trip);
    setIsDeliveryView(true);
    setDeliveryStep(0);
    setDeliveryType('');
    setSelectedPartner(null);
    setCustomAddress('');
    setEstimatedPrice(0);
  };

  const handleBackToMyPage = () => {
    setIsDeliveryView(false);
    setDeliveryStep(0);
    setDeliveryType('');
    setSelectedPartner(null);
    setCustomAddress('');
    setEstimatedPrice(0);
  };

  const handleDeliveryTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    setDeliveryType(value);
    
    // 제휴 매장 유형이 선택되었을 때만 매장 목록 로드
    if (value === 'partner') {
      fetchPartnerStores();
    }
  };
  
  const handlePartnerSelect = async (partner: Partnership) => {
    setSelectedPartner(partner);
    await calculatePrice();
  };
  
  const handleNextStep = async () => {
    if (deliveryStep === 0 && deliveryType) {
      setDeliveryStep(1);
      
      if (deliveryType === 'partner') {
        fetchPartnerStores();
      }
    } else if (deliveryStep === 1) {
      // 유효성 검사
      if (deliveryType === 'partner' && !selectedPartner) {
        alert('제휴 매장을 선택해주세요.');
        return;
      }
      
      if (deliveryType === 'custom' && !customAddress) {
        alert('배달 주소를 입력해주세요.');
        return;
      }
      
      // 가격 계산
      await calculatePrice();
      setDeliveryStep(2);
    }
  };
  
  const handlePrevStep = () => {
    if (deliveryStep > 0) {
      setDeliveryStep(deliveryStep - 1);
    } else {
      handleBackToMyPage();
    }
  };

  // 리뷰 작성 핸들러
  const handleWriteReview = async (reservation: ReservationDto) => {
    try {
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
        window.location.reload(); // 전체 상태 새로고침
        return;
      }

      // 리뷰 작성 가능 여부 확인 (이중 체크)
      const canWriteResponse = await reviewService.canWriteReview(reservation.id, user!.id);
      
      if (canWriteResponse.data) {
        setSelectedReservation(reservation);
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
      console.error('리뷰 작성 가능 여부 확인 실패:', error);
      
      // 상세한 오류 메시지 표시
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        // 로그인 페이지로 리다이렉트 또는 로그아웃 처리
        window.location.href = '/login';
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || '잘못된 요청입니다. 예약 정보를 확인해주세요.';
        alert(errorMessage);
      } else if (error.response?.status === 404) {
        alert('예약 정보를 찾을 수 없습니다.');
      } else {
        alert('리뷰 작성 준비 중 오류가 발생했습니다.');
      }
    }
  };

  const handleReviewSubmit = async (review: any) => {
    setReviewFormOpen(false);
    
    // 리뷰 상태 업데이트
    if (selectedReservation) {
      setReviewStatuses(prev => ({
        ...prev,
        [selectedReservation.id]: true
      }));
    }
    
    setSelectedReservation(null);
    setEditingReview(null); // 편집 상태 리셋
    
    const message = editingReview ? '리뷰가 성공적으로 수정되었습니다!' : '리뷰가 성공적으로 작성되었습니다!';
    alert(message);
  };

  // 리뷰 수정 핸들러
  const handleEditReview = async (reservation: ReservationDto) => {
    try {
      console.log('리뷰 조회 시작 - 예약 ID:', reservation.id);
      const response = await reviewService.getReviewByReservation(reservation.id);
      console.log('리뷰 조회 응답:', response);
      
      if (response.data) {
        setEditingReview(response.data);
        setSelectedReservation(reservation);
        setReviewFormOpen(true);
      } else {
        alert('수정할 리뷰가 없습니다.');
      }
    } catch (error: any) {
      console.error('리뷰 조회 실패:', error);
      console.error('응답 데이터:', error.response?.data);
      console.error('응답 상태:', error.response?.status);
      alert(`리뷰 정보를 불러오는 중 오류가 발생했습니다. (${error.response?.status})`);
    }
  };

  // 테스트용: 리뷰 삭제 핸들러
  const handleDeleteReview = async (reservation: ReservationDto) => {
    if (!confirm('이 예약의 리뷰를 삭제하시겠습니까? (테스트용)')) {
      return;
    }

    try {
      console.log('리뷰 삭제 시작 - 예약 ID:', reservation.id);
      const response = await reviewService.deleteReviewByReservation(reservation.id);
      console.log('리뷰 삭제 응답:', response);
      
      if (response.data === 'deleted') {
        alert('리뷰가 성공적으로 삭제되었습니다!');
        
        // 상태 업데이트
        setReviewStatuses(prev => ({
          ...prev,
          [reservation.id]: false
        }));
      } else {
        alert('삭제할 리뷰가 없습니다.');
      }
    } catch (error: any) {
      console.error('리뷰 삭제 실패:', error);
      console.error('응답 데이터:', error.response?.data);
      console.error('응답 상태:', error.response?.status);
      console.error('전체 응답:', error.response);
      alert(`리뷰 삭제 중 오류가 발생했습니다. (${error.response?.status}): ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeliverySubmit = async () => {
    if (!currentReservation || !user) return;
    
    try {
      const deliveryData = {
        userId: user.id,
        reservationId: currentReservation.id,
        pickupAddress: currentReservation.placeName,
        deliveryAddress: deliveryType === 'partner' && selectedPartner 
          ? selectedPartner.address 
          : customAddress,
        itemDescription: `소형 ${currentReservation.smallBags}개, 중형 ${currentReservation.mediumBags}개, 대형 ${currentReservation.largeBags}개`,
        weight: currentReservation.smallBags + currentReservation.mediumBags + currentReservation.largeBags
      };
      
      // 배달 요청 API 호출
      const response = await axios.post('/api/deliveries', deliveryData);
      
      // 성공 메시지 표시
      alert('배달 신청이 완료되었습니다.');
      
      // 마이페이지로 돌아가기
      handleBackToMyPage();
    } catch (error) {
      console.error('배달 신청 중 오류:', error);
      alert('배달 신청 중 오류가 발생했습니다.');
    }
  };

  // 검색 기능 구현
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await partnershipService.getAllPartnerships();
      const approvedPartners = response.data.filter(p => p.status === 'APPROVED');
      
      // 검색어로 필터링
      const filteredPartners = approvedPartners.filter(partner => 
        partner.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filteredPartners);
    } catch (error) {
      console.error('매장 검색 중 오류:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    if (event.target.value.trim() === '') {
      setSearchResults([]);
    }
  };

  // 배달 단계별 컨텐츠 렌더링
  const renderDeliveryContent = () => {
    switch (deliveryStep) {
      case 0:
        // 배달 유형 선택
        return (
          <div className="delivery-type-container">
            <Typography variant="h6" className="delivery-section-title">
              배달 방식 선택
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              짐을 어디로 배달할지 선택해주세요
            </Typography>
            
            <div className={`delivery-option-card ${deliveryType === 'partner' ? 'selected' : ''}`} 
                 onClick={() => setDeliveryType('partner')}>
              <div className="option-icon">
                <StorefrontIcon fontSize="large" />
              </div>
              <div className="option-content">
                <Typography variant="subtitle1" className="option-title">
                  트래블라이트 제휴 매장으로 배달
                </Typography>
                <Typography variant="body2" className="option-description">
                  전국 각지의 트래블라이트 제휴 매장으로 짐을 배달받을 수 있습니다.
                </Typography>
              </div>
              <Radio 
                checked={deliveryType === 'partner'} 
                onChange={handleDeliveryTypeChange} 
                value="partner" 
                name="delivery-type-radio"
              />
            </div>
            
            <div className={`delivery-option-card ${deliveryType === 'custom' ? 'selected' : ''}`} 
                 onClick={() => setDeliveryType('custom')}>
              <div className="option-icon">
                <LocationOnIcon fontSize="large" />
              </div>
              <div className="option-content">
                <Typography variant="subtitle1" className="option-title">
                  특정 주소로 배달
                </Typography>
                <Typography variant="body2" className="option-description">
                  집, 호텔, 회사 등 원하는 주소지로 짐을 배달받을 수 있습니다.
                </Typography>
              </div>
              <Radio 
                checked={deliveryType === 'custom'} 
                onChange={handleDeliveryTypeChange} 
                value="custom" 
                name="delivery-type-radio"
              />
            </div>
          </div>
        );
        
      case 1:
        // 제휴 매장 선택 또는 주소 입력
        return (
          <div className="delivery-details-container">
            <Typography variant="h6" className="delivery-section-title">
              {deliveryType === 'partner' ? '제휴 매장 선택' : '배달 주소 입력'}
            </Typography>
            
            {deliveryType === 'partner' ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  배달받을 제휴 매장을 검색하거나 선택해주세요
                </Typography>
                
                <div className="search-container" style={{ marginBottom: '20px' }}>
                  <TextField
                    fullWidth
                    label="매장명 또는 주소로 검색"
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                      endAdornment: (
                        <Button 
                          variant="contained" 
                          onClick={handleSearch}
                          disabled={isSearching}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          {isSearching ? <CircularProgress size={24} /> : '검색'}
                        </Button>
                      ),
                    }}
                  />
                </div>
                
                {loadingPartners ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : searchResults.length > 0 ? (
                  <div className="partner-store-list">
                    {searchResults.map((partner) => (
                      <div 
                        key={partner.id} 
                        className={`partner-store-item ${selectedPartner?.id === partner.id ? 'selected' : ''}`}
                        onClick={() => handlePartnerSelect(partner)}
                      >
                        <div className="store-name">{partner.businessName}</div>
                        <div className={`store-type store-type-${partner.businessType}`}>
                          {partner.businessType}
                        </div>
                        <div className="store-info">{partner.address}</div>
                        <div className="store-info">
                          {partner.is24Hours ? '24시간 영업' : '영업시간: 09:00-18:00'}
                        </div>
                        {selectedPartner?.id === partner.id && estimatedPrice > 0 && (
                          <div className="price-info">
                            <span className="price-label">예상 배달 가격:</span>
                            <span className="price-value">{estimatedPrice.toLocaleString()}원</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    검색 결과가 없습니다.
                  </Alert>
                ) : partnerStores.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    이용 가능한 제휴 매장이 없습니다.
                  </Alert>
                ) : (
                  <div className="partner-store-list">
                    {partnerStores.map((partner) => (
                      <div 
                        key={partner.id} 
                        className={`partner-store-item ${selectedPartner?.id === partner.id ? 'selected' : ''}`}
                        onClick={() => handlePartnerSelect(partner)}
                      >
                        <div className="store-name">{partner.businessName}</div>
                        <div className={`store-type store-type-${partner.businessType}`}>
                          {partner.businessType}
                        </div>
                        <div className="store-info">{partner.address}</div>
                        <div className="store-info">
                          {partner.is24Hours ? '24시간 영업' : '영업시간: 09:00-18:00'}
                        </div>
                        {selectedPartner?.id === partner.id && estimatedPrice > 0 && (
                          <div className="price-info">
                            <span className="price-label">예상 배달 가격:</span>
                            <span className="price-value">{estimatedPrice.toLocaleString()}원</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // 주소 입력 폼
              <div className="address-input-container">
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
                    color="primary" 
                    sx={{ mt: 1 }}
                    onClick={calculatePrice}
                  >
                    배달 가격 계산하기
                  </Button>
                )}
                {estimatedPrice > 0 && (
                  <div className="price-info-card">
                    <Typography variant="subtitle2">예상 배달 가격</Typography>
                    <Typography variant="h5" color="primary">{estimatedPrice.toLocaleString()}원</Typography>
                  </div>
                )}
              </div>
            )}
          </div>
        );
        
      case 2:
        // 정보 확인 및 신청
        return (
          <div className="delivery-confirmation-container">
            <Typography variant="h6" className="delivery-section-title">
              배달 신청 확인
            </Typography>
            
            <Paper elevation={0} className="delivery-summary">
              <div className="summary-title">배달 정보</div>
              <div className="summary-content">
                <div className="summary-item">
                  <span>배달 유형:</span>
                  <span>{deliveryType === 'partner' ? '제휴 매장으로 배달' : '특정 주소로 배달'}</span>
                </div>
                
                {deliveryType === 'partner' && selectedPartner && (
                  <div className="summary-item">
                    <span>배달 매장:</span>
                    <span>{selectedPartner.businessName}</span>
                  </div>
                )}
                
                {deliveryType === 'custom' && (
                  <div className="summary-item">
                    <span>배달 주소:</span>
                    <span>{customAddress}</span>
                  </div>
                )}
                
                <div className="summary-item">
                  <span>짐 정보:</span>
                  <span>
                    소형 {currentReservation?.smallBags}개, 
                    중형 {currentReservation?.mediumBags}개, 
                    대형 {currentReservation?.largeBags}개
                  </span>
                </div>
                
                <div className="summary-item">
                  <span>보관 위치:</span>
                  <span>{currentReservation?.placeName}</span>
                </div>
                
                <div className="summary-total">
                  <span>예상 배달 가격:</span>
                  <span>{estimatedPrice.toLocaleString()}원</span>
                </div>
              </div>
            </Paper>
            
            <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
              배달 접수 후 배달 예정 시간은 문자로 안내드립니다.
            </Alert>
          </div>
        );
        
      default:
        return null;
    }
  };

  // 배달 신청 화면 렌더링
  const renderDeliveryView = () => {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ mt: 8, mb: 5 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handlePrevStep} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              배달 서비스 신청
            </Typography>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={deliveryStep} alternativeLabel>
              {deliverySteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            {renderDeliveryContent()}
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={handlePrevStep}
            >
              {deliveryStep === 0 ? '취소' : '이전'}
            </Button>
            {deliveryStep === 2 ? (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleDeliverySubmit}
              >
                배달 신청하기
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleNextStep}
                disabled={(deliveryStep === 0 && !deliveryType) || 
                        (deliveryStep === 1 && ((deliveryType === 'partner' && !selectedPartner) || 
                                              (deliveryType === 'custom' && !customAddress)))}
              >
                다음
              </Button>
            )}
          </Box>
        </Container>
      </>
    );
  };

  // 배달 상태 스텝 렌더링
  const renderDeliveryStatusSteps = (delivery: DeliveryResponse) => {
    const activeStep = getDeliveryStatusIndex(delivery.status);
    
    return (
      <div className="delivery-status-container">
        <Typography variant="subtitle2" sx={{ mb: 1 }}>배달 진행 상태</Typography>
        <Stepper activeStep={activeStep} sx={{ width: '100%' }}>
          {deliveryStatusSteps.map((step, index) => (
            <Step key={step.status} completed={index <= activeStep}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
    );
  };

  // 기존 마이페이지 화면 렌더링
  const renderMyPageView = () => {
    return (
      <>
        <Navbar />
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <div className="mypage-container">
            <div className="mypage-header">
              <Typography variant="h4" className="mypage-title">
                {t('myPageTitle')}
              </Typography>
              <Typography variant="body1" className="mypage-description">
                {t('myPageDescription')}
              </Typography>
            </div>

            <div className="tab-buttons">
              <div
                  className={`tab-button ${activeTab === 0 ? 'active' : 'inactive'}`}
                  onClick={() => handleTabChange(0)}
                  style={{ marginRight: '8px' }}
              >
                {t('tripCheck')}
              </div>
              <div
                  className={`tab-button ${activeTab === 1 ? 'active' : 'inactive'}`}
                  onClick={() => handleTabChange(1)}
              >
                {t('editInfo')}
              </div>
            </div>

            {activeTab === 0 && (
                <>
                  <div className="filter-container">
                    <div style={{ marginBottom: '8px' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('dateRange')}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" color="text.secondary">
                        {t('recentMonths')}
                      </Typography>
                    </div>
                  </div>

                  {loading ? (
                      <div className="loading-container">
                        <Typography>{t('loading')}</Typography>
                      </div>
                  ) : myTrips.length === 0 ? (
                      <div className="empty-container">
                        <Typography>{t('noReservations')}</Typography>
                      </div>
                  ) : (
                      <div>
                        {myTrips.map((trip) => {
                          const tripDeliveries = getDeliveriesForReservation(trip.id);
                          const hasDelivery = tripDeliveries.length > 0;
                          
                          return (
                            <div className="trip-card" key={trip.id}>
                              <div className="trip-header">
                                <div className="trip-title">
                                  {trip.placeName}
                                </div>
                                <div className={`status-chip status-${trip.status.toLowerCase()}`}>
                                  {getStatusText(trip.status)}
                                </div>
                              </div>

                              <div className="trip-details">
                                <div className="trip-detail-item">
                                  {t('reservationNumber')}{trip.reservationNumber}
                                </div>
                                <div className="trip-detail-item">
                                  {t('storageStart')}{trip.storageDate} {trip.storageStartTime}
                                </div>
                                <div className="trip-detail-item">
                                  {t('storageEnd')}{trip.storageEndDate} {trip.storageEndTime}
                                </div>
                                <div className="trip-detail-item">
                                  {t('luggageCount')}{trip.smallBags}{t('pieces')}{t('mediumBags')}{trip.mediumBags}{t('pieces')}{t('largeBags')}{trip.largeBags}{t('pieces')}
                                </div>
                                <div className="trip-detail-item">
                                  {t('totalPrice')}{trip.totalPrice.toLocaleString()}{t('won')}
                                </div>
                              </div>

                              {hasDelivery ? (
                                <DeliveryStatusContainer>
                                  {tripDeliveries.map((delivery, index) => (
                                    <Box key={delivery.id} sx={{ mb: index < tripDeliveries.length - 1 ? 2 : 0 }}>
                                      {renderDeliveryStatusSteps(delivery)}
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                        배달 신청일: {new Date(delivery.requestedAt).toLocaleString()}
                                      </Typography>
                                    </Box>
                                  ))}
                                </DeliveryStatusContainer>
                              ) : (
                                <div className="button-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                  <button className="detail-button">{t('viewDetails')}</button>
                                  {trip.status === 'RESERVED' && (
                                    <a 
                                      href={`https://map.naver.com/p/directions/-1,,,,/-2,${encodeURIComponent(trip.placeAddress)},${encodeURIComponent(trip.placeName)},PLACE/car`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ textDecoration: 'none' }}
                                    >
                                      <button className="navigation-button" style={{
                                        backgroundColor: '#03C75A',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                      }}>
                                        네이버맵 길찾기
                                      </button>
                                    </a>
                                  )}
                                  <button 
                                    className="delivery-button" 
                                    onClick={() => handleStartDelivery(trip)}
                                    disabled={trip.status !== 'COMPLETED' && trip.status !== 'RESERVED'}
                                  >
                                    배달 신청하기
                                  </button>
                                  {trip.status === 'COMPLETED' && (
                                    reviewStatuses[trip.id] ? (
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                          className="review-completed-button"
                                          style={{
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '10px 20px',
                                            fontSize: '14px',
                                            cursor: 'default',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 4px rgba(76, 175, 80, 0.3)',
                                            opacity: 0.8
                                          }}
                                          disabled
                                        >
                                          ✅ 리뷰 완료
                                        </button>
                                        <button 
                                          className="review-edit-button"
                                          onClick={() => handleEditReview(trip)}
                                          style={{
                                            backgroundColor: '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '8px 12px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
                                            transition: 'all 0.2s ease'
                                          }}
                                          onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1976D2';
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = '#2196F3';
                                          }}
                                        >
                                          ✏️ 수정
                                        </button>
                                        <button 
                                          className="review-delete-button"
                                          onClick={() => handleDeleteReview(trip)}
                                          style={{
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '8px 12px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            boxShadow: '0 2px 4px rgba(244, 67, 54, 0.3)',
                                            transition: 'all 0.2s ease'
                                          }}
                                          onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#d32f2f';
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f44336';
                                          }}
                                        >
                                          🗑️ 삭제
                                        </button>
                                      </div>
                                    ) : (
                                      <button 
                                        className="review-button" 
                                        onClick={() => handleWriteReview(trip)}
                                        style={{
                                          backgroundColor: '#FF5722',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          padding: '10px 20px',
                                          fontSize: '14px',
                                          cursor: 'pointer',
                                          fontWeight: 'bold',
                                          marginLeft: '8px',
                                          boxShadow: '0 2px 4px rgba(255, 87, 34, 0.3)',
                                          transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.backgroundColor = '#E64A19';
                                          e.currentTarget.style.transform = 'translateY(-1px)';
                                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 87, 34, 0.4)';
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.backgroundColor = '#FF5722';
                                          e.currentTarget.style.transform = 'translateY(0)';
                                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 87, 34, 0.3)';
                                        }}
                                      >
                                        ⭐ 리뷰 작성하기
                                      </button>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                  )}
                </>
            )}

            {activeTab === 1 && (
                <div className="user-info-container">
                  <div className="user-info-section">
                    <Typography variant="h6" className="section-title">
                      내 정보
                    </Typography>
                    
                    <div className="info-field">
                      <Typography variant="body1" className="field-label">
                        이름
                      </Typography>
                      <Typography variant="body1" className="field-value">
                        {user?.name}
                      </Typography>
                    </div>
                    
                    <div className="info-field">
                      <Typography variant="body1" className="field-label">
                        이메일
                      </Typography>
                      <Typography variant="body1" className="field-value">
                        {user?.email}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="password-change-section">
                    <Typography variant="h6" className="section-title">
                      비밀번호 변경
                    </Typography>
                    
                    {passwordError && (
                      <Alert severity="error" className="password-alert">
                        {passwordError}
                      </Alert>
                    )}
                    
                    {passwordSuccess && (
                      <Alert severity="success" className="password-alert">
                        {passwordSuccess}
                      </Alert>
                    )}
                    
                    <div className="password-field">
                      <TextField
                        label="현재 비밀번호"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="password-field">
                      <TextField
                        label="새 비밀번호"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="password-field">
                      <TextField
                        label="비밀번호 확인"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="password-button-container">
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleChangePassword}
                        className="change-password-button"
                      >
                        비밀번호 변경하기
                      </Button>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </Container>

        {/* 리뷰 작성 폼 */}
        {selectedReservation && (
          <ReviewForm
            open={reviewFormOpen}
            onClose={() => {
              setReviewFormOpen(false);
              setSelectedReservation(null);
              setEditingReview(null);
            }}
            onSubmit={handleReviewSubmit}
            reservationId={selectedReservation.id}
            placeName={selectedReservation.placeName}
            placeAddress={selectedReservation.placeAddress}
            userId={user?.id}
            editingReview={editingReview}
          />
        )}
      </>
    );
  };

  return isDeliveryView ? renderDeliveryView() : renderMyPageView();
};

export default MyPage;