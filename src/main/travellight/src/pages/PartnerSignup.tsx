import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Select,
  InputLabel,
  Checkbox,
  FormGroup,
  Divider,
  useTheme,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';

// Daum 주소 검색 결과 타입 정의
interface DaumPostcodeData {
  address: string;
  zonecode: string;
  bname?: string;
  buildingName?: string;
}

declare global {
  interface Window {
    daum: any; // any 타입으로 정의하여 타입 충돌 방지
    naver: any; // 네이버 지도 API를 위한 타입 정의
    naverMapLoaded?: boolean; // 네이버 맵 로드 상태 플래그
  }
}

const steps = ['기본 정보', '매장 정보', '추가 정보', '운영 정보'];

interface BusinessHourDto {
  enabled: boolean;
  open: string;
  close: string;
}

interface StorageCapacityDto {
  small: number;
  medium: number;
  large: number;
}

interface PartnerSignupData {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  detailAddress: string;
  zipCode: string;
  businessType: string;
  storageCapacity: StorageCapacityDto;
  is24Hours: boolean;
  businessHours: Record<string, BusinessHourDto>;
  agreeTerms: boolean;
  latitude: number;
  longitude: number;
  // 새로운 필드들
  storePictures: string[];
  amenities: string[];
  insuranceAvailable: boolean;
  businessRegistrationUrl: string;
  bankBookUrl: string;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
}

const defaultBusinessHours: Record<string, BusinessHourDto> = {
  MONDAY: { enabled: true, open: '09:00', close: '18:00' },
  TUESDAY: { enabled: true, open: '09:00', close: '18:00' },
  WEDNESDAY: { enabled: true, open: '09:00', close: '18:00' },
  THURSDAY: { enabled: true, open: '09:00', close: '18:00' },
  FRIDAY: { enabled: true, open: '09:00', close: '18:00' },
  SATURDAY: { enabled: true, open: '10:00', close: '17:00' },
  SUNDAY: { enabled: false, open: '10:00', close: '17:00' },
};

const businessTypes = [
  '카페',
  '편의점',
  '서점',
  '호텔/숙박',
  '가게/상점',
  '식당',
  '기타'
];

const availableAmenities = [
  'WiFi',
  'CCTV',
  '에어컨',
  '화장실',
  '주차장',
  '휠체어 접근',
  '24시간 출입',
  '냉장보관',
  '충전기'
];

const PartnerSignup: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<PartnerSignupData>({
    businessName: '',
    ownerName: user?.name || '',
    phone: '',
    email: user?.email || '',
    address: '',
    detailAddress: '',
    zipCode: '',
    businessType: '',
    storageCapacity: {
      small: 5,
      medium: 3,
      large: 2
    },
    is24Hours: false,
    businessHours: defaultBusinessHours,
    agreeTerms: false,
    latitude: 0,
    longitude: 0,
    // 새로운 필드 초기값
    storePictures: [],
    amenities: [],
    insuranceAvailable: false,
    businessRegistrationUrl: '',
    bankBookUrl: '',
    accountNumber: '',
    bankName: '',
    accountHolder: user?.name || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  

  // 네이버 지도 API 초기화 - 지오코더 사용
  useEffect(() => {
    // 전역 naverMapLoaded 플래그를 확인하는 함수
    const checkNaverMapLoaded = () => {
      return window.naverMapLoaded === true && window.naver && window.naver.maps && window.naver.maps.Service;
    };

    const waitForNaverMaps = () => {
      if (checkNaverMapLoaded()) {
        console.log('네이버 지도 API 로드 완료');
        clearInterval(checkInterval);
      }
    };

    // 정기적으로 로드 상태 확인 (간격: 500ms)
    const checkInterval = setInterval(waitForNaverMaps, 500);

    // 10초로 시간 초과 처리
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!checkNaverMapLoaded()) {
        console.error('네이버 지도 API 로드 시간 초과');
      }
    }, 10000);

    // 언어 변경 이벤트 리스너 등록
    const handleMapLanguageChange = () => {
      console.log("언어 변경 감지, 네이버 지도 API 다시 확인");

      // 기존 인터벌 클리어
      clearInterval(checkInterval);

      // 새로운 인터벌 시작
      const newCheckInterval = setInterval(() => {
        if (checkNaverMapLoaded()) {
          console.log('(언어 변경 후) 네이버 지도 API 로드 완료');
          clearInterval(newCheckInterval);
        }
      }, 500);

      // 10초 후 시간 초과 처리
      setTimeout(() => {
        clearInterval(newCheckInterval);
        if (!checkNaverMapLoaded()) {
          console.error('(언어 변경 후) 네이버 지도 API 로드 시간 초과');
        }
      }, 10000);
    };

    window.addEventListener('naverMapLanguageChanged', handleMapLanguageChange);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('naverMapLanguageChanged', handleMapLanguageChange);
    };
  }, []);

  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/partner-signup' } });
    return null;
  }


  // 지오코딩 함수 (네이버맵 API 사용)
  const getCoordinates = (address: string) => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      // API 호출 횟수 관리
      let attempts = 0;
      const maxAttempts = 15;

      // 네이버맵 API 로드 확인
      const checkAndExecute = () => {
        attempts++;

        // 네이버 지도 API 및 지오코딩 서비스 가용성 확인
        if (window.naver?.maps?.Service?.geocode) {
          console.log('네이버 맵 API 로드 확인, 좌표 변환 시도');

          try {
            // 주소 -> 좌표 변환 (geocode 서비스 사용)
            window.naver.maps.Service.geocode({
              query: address
            }, function(status: any, response: any) {
              // 응답 상태 확인
              if (status === window.naver.maps.Service.Status.OK) {
                // 주소 데이터 확인
                if (response?.v2?.addresses && response.v2.addresses.length > 0) {
                  const result = response.v2.addresses[0];
                  console.log('좌표 변환 결과:', result);

                  // 검색된 주소를 바탕으로 한 좌표 추출
                  const coords = {
                    lat: parseFloat(result.y),
                    lng: parseFloat(result.x)
                  };

                  // 좌표 유효성 검사
                  if (isNaN(coords.lat) || isNaN(coords.lng)) {
                    console.error('변환된 좌표가 숫자가 아닙니다:', result);
                    reject(new Error('유효하지 않은 좌표입니다.'));
                  } else {
                    console.log('최종 변환 좌표:', coords);
                    resolve(coords);
                  }
                } else {
                  console.error('주소 변환 결과가 없습니다.');
                  reject(new Error('주소를 좌표로 변환할 수 없습니다.'));
                }
              } else {
                console.error('주소 변환 실패:', status);
                reject(new Error('주소를 좌표로 변환할 수 없습니다.'));
              }
            });
          } catch (error) {
            console.error('좌표 변환 과정에서 오류 발생:', error);
            reject(new Error('좌표 변환 처리 중 오류가 발생했습니다.'));
          }
        } else {
          console.log(`네이버 맵 API 로드 대기 중... (시도: ${attempts}/${maxAttempts})`);
          if (attempts < maxAttempts) {
            // 대기 시간 증가 (지수 백오프)
            setTimeout(checkAndExecute, 500 * Math.min(attempts, 3));
          } else {
            console.error('네이버 맵 API 로드 실패');
            reject(new Error('네이버 맵 API가 로드되지 않았습니다.'));
          }
        }
      };
      checkAndExecute();
    });
  };

  // Daum 우편번호 검색 팝업 열기
  const openPostcodeSearch = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: async function(data: DaumPostcodeData) {
          // 선택한 주소 데이터 활용
          let fullAddress = data.address;
          let extraAddress = '';

          // 법정동명이 있을 경우 추가
          if (data.bname) {
            extraAddress += data.bname;
          }
          // 건물명이 있을 경우 추가
          if (data.buildingName) {
            extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
          }

          // extraAddress가 있으면 괄호와 함께 추가
          if (extraAddress !== '') {
            fullAddress += ` (${extraAddress})`;
          }

          console.log('검색된 주소:', fullAddress);

          // 주소 및 우편번호 설정 (먼저 좌표는 초기화)
          setFormData({
            ...formData,
            zipCode: data.zonecode,
            address: fullAddress,
            latitude: 0,
            longitude: 0
          });

          try {
            // 좌표 변환 시도 전에 네이버 맵 로드 상태 확인
            if (window.naver && window.naver.maps && window.naver.maps.Service) {
              // 좌표 변환
              console.log('좌표 변환 시작...');
              const coords = await getCoordinates(fullAddress);
              console.log('좌표 변환 성공:', coords);

              setFormData(prev => ({
                ...prev,
                latitude: coords.lat,
                longitude: coords.lng
              }));

              console.log(`주소 좌표 변환 완료 및 저장: 위도 ${coords.lat}, 경도 ${coords.lng}`);
            } else {
              console.warn('네이버 지도 API가 로드되지 않아 좌표 변환을 진행할 수 없습니다.');
              setError('지도 서비스가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
            }
          } catch (error) {
            console.error('좌표 변환 오류:', error);
            setError('주소를 좌표로 변환하는 중 오류가 발생했습니다. 다시 시도해 주세요.');
          }
        }
      }).open();
    } else {
      alert('주소 검색 서비스를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.');
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        // 다음 단계로 이동 시 스크롤을 맨 위로
        window.scrollTo(0, 0);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    // 이전 단계로 이동 시 스크롤을 맨 위로
    window.scrollTo(0, 0);
  };

  const validateCurrentStep = () => {
    setError('');

    if (activeStep === 0) {
      if (!formData.businessName.trim()) {
        setError('상호명을 입력해주세요.');
        return false;
      }
      if (!formData.ownerName.trim()) {
        setError('대표자명을 입력해주세요.');
        return false;
      }
      if (!formData.phone.trim()) {
        setError('연락처를 입력해주세요.');
        return false;
      }
      if (!formData.email.trim()) {
        setError('이메일을 입력해주세요.');
        return false;
      }
      return true;
    }

    if (activeStep === 1) {
      if (!formData.address.trim()) {
        setError('주소를 입력해주세요.');
        return false;
      }
      if (!formData.businessType) {
        setError('업종을 선택해주세요.');
        return false;
      }

      const { small, medium, large } = formData.storageCapacity;
      if (small <= 0 && medium <= 0 && large <= 0) {
        setError('최소 한 가지 이상의 짐 보관 용량을 1개 이상 입력해주세요.');
        return false;
      }

      if (formData.latitude === 0 || formData.longitude === 0) {
        setError('주소 좌표 변환이 필요합니다. 주소 검색을 다시 진행해주세요.');
        return false;
      }

      return true;
    }

    if (activeStep === 2) {
      if (!formData.accountNumber.trim() || !formData.bankName.trim() || !formData.accountHolder.trim()) {
        setError('계좌 정보를 모두 입력해주세요.');
        return false;
      }
      return true;
    }

    if (activeStep === 3) {
      if (!formData.agreeTerms) {
        setError('이용약관에 동의해주세요.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      console.log('전송 전 좌표 확인:', {
        latitude: formData.latitude,
        longitude: formData.longitude
      });

      // 스토리지 크기 정보를 spaceSize 형식으로 변환
      const determineSpaceSize = () => {
        const { small, medium, large } = formData.storageCapacity;
        if (large > 0) return 'large';
        if (medium > 0) return 'medium';
        return 'small';
      };

      // 비즈니스 시간을 Partnership 엔티티에 맞는 포맷으로 변환
      const formatBusinessHours = () => {
        const result: Record<string, any> = {};
        
        if (formData.is24Hours) {
          // 24시간 영업인 경우
          const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
          days.forEach(day => {
            result[day] = {
              enabled: true,
              open: "00:00",
              close: "24:00"
            };
          });
        } else {
          // 요일별 시간이 다른 경우
          Object.entries(formData.businessHours).forEach(([day, hours]) => {
            result[day] = {
              enabled: hours.enabled,
              open: hours.open,
              close: hours.close
            };
          });
        }
        
        return result;
      };

      // API 요청 데이터 준비
      const requestData = {
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address + (formData.detailAddress ? ` ${formData.detailAddress}` : ''),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        businessType: formData.businessType,
        spaceSize: determineSpaceSize(),
        additionalInfo: `소형 캐리어: ${formData.storageCapacity.small}개, 중형 캐리어: ${formData.storageCapacity.medium}개, 대형 캐리어: ${formData.storageCapacity.large}개`,
        agreeTerms: formData.agreeTerms,
        is24Hours: formData.is24Hours,
        businessHours: formatBusinessHours(),
        smallBagsAvailable: formData.storageCapacity.small,
        mediumBagsAvailable: formData.storageCapacity.medium,
        largeBagsAvailable: formData.storageCapacity.large,
        // 새로운 필드들 추가
        storePictures: formData.storePictures,
        amenities: formData.amenities,
        insuranceAvailable: formData.insuranceAvailable,
        businessRegistrationUrl: formData.businessRegistrationUrl,
        bankBookUrl: formData.bankBookUrl,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        accountHolder: formData.accountHolder
      };

      console.log('서버로 전송할 데이터:', requestData);

      // 실제 API 호출
      const response = await fetch('/api/partnership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '서버 오류가 발생했습니다');
      }

      const data = await response.json();
      console.log('서버 응답:', data);
      
      setSuccess(true);
      setLoading(false);

    } catch (err) {
      console.error('파트너 신청 오류:', err);
      setError('파트너 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 전화번호 자동 포맷팅
    if (name === 'phone') {
      const phoneNumber = value.replace(/[^0-9]/g, '');
      let formattedPhone = phoneNumber;
      
      if (phoneNumber.length <= 3) {
        formattedPhone = phoneNumber;
      } else if (phoneNumber.length <= 7) {
        formattedPhone = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3);
      } else if (phoneNumber.length <= 11) {
        formattedPhone = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3, 7) + '-' + phoneNumber.slice(7);
      } else {
        formattedPhone = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3, 7) + '-' + phoneNumber.slice(7, 11);
      }
      
      setFormData({ ...formData, [name]: formattedPhone });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleStorageCapacityChange = (type: 'small' | 'medium' | 'large', value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      storageCapacity: {
        ...prev.storageCapacity,
        [type]: numValue
      }
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });

    // 24시간 영업 선택 시 시간 전체 활성화
    if (name === 'is24Hours' && checked) {
      const updatedBusinessHours: Record<string, BusinessHourDto> = {};
      Object.keys(formData.businessHours).forEach(day => {
        updatedBusinessHours[day] = {
          ...formData.businessHours[day],
          enabled: true,
          open: '00:00',
          close: '24:00'
        };
      });
      setFormData(prev => ({
        ...prev,
        businessHours: updatedBusinessHours
      }));
    } else if (name === 'is24Hours' && !checked) {
      // 24시간 영업 해제 시 기본값으로 복원
      setFormData(prev => ({
        ...prev,
        businessHours: defaultBusinessHours
      }));
    }
  };

  const handleBusinessHourChange = (day: string, field: 'enabled' | 'open' | 'close', value: any) => {
    const updatedBusinessHours = {
      ...formData.businessHours,
      [day]: {
        ...formData.businessHours[day],
        [field]: value
      }
    };
    setFormData(prev => ({
      ...prev,
      businessHours: updatedBusinessHours
    }));
  };

  const getDayName = (day: string) => {
    const dayNames: Record<string, string> = {
      MONDAY: '월요일',
      TUESDAY: '화요일',
      WEDNESDAY: '수요일',
      THURSDAY: '목요일',
      FRIDAY: '금요일',
      SATURDAY: '토요일',
      SUNDAY: '일요일'
    };
    return dayNames[day] || day;
  };

  // 이미지 파일 업로드 핸들러 (Base64로 변환)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 파일은 5MB 이하로 업로드해주세요.');
      return;
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      if (fieldName === 'storePictures') {
        setFormData(prev => ({
          ...prev,
          storePictures: [...prev.storePictures, base64String]
        }));
      } else if (fieldName === 'businessRegistrationUrl') {
        setFormData(prev => ({ ...prev, businessRegistrationUrl: base64String }));
      } else if (fieldName === 'bankBookUrl') {
        setFormData(prev => ({ ...prev, bankBookUrl: base64String }));
      }
      
      setUploadingImage(false);
      setError('');
    };
    
    reader.onerror = () => {
      setError('이미지 업로드 중 오류가 발생했습니다.');
      setUploadingImage(false);
    };
    
    reader.readAsDataURL(file);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mb: 1, 
                fontWeight: 600, 
                color: '#1a1a1a',
                fontSize: '1.25rem'
              }}
            >
              기본 정보를 입력해주세요
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 4, 
                color: '#718096'
              }}
            >
              사업자 및 담당자 정보를 정확하게 입력해주세요
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="상호명"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#cbd5e0'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a5568',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="대표자명"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#cbd5e0'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a5568',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="연락처"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  variant="outlined"
                  placeholder="010-0000-0000"
                  helperText="숫자만 입력하시면 자동으로 형식이 적용됩니다"
                  inputProps={{ maxLength: 13 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#cbd5e0'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a5568',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="이메일"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#cbd5e0'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a5568',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mb: 1, 
                fontWeight: 600, 
                color: '#1a1a1a',
                fontSize: '1.25rem'
              }}
            >
              매장 정보를 입력해주세요
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 4, 
                color: '#718096'
              }}
            >
              고객이 찾아올 매장의 위치와 업종을 알려주세요
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="우편번호"
                  name="zipCode"
                  value={formData.zipCode}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#f7fafc'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  onClick={openPostcodeSearch}
                  fullWidth
                  sx={{ 
                    height: '56px',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderColor: '#cbd5e0',
                    color: '#4a5568',
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: '#a0aec0',
                      bgcolor: '#f7fafc',
                      borderWidth: 2
                    }
                  }}
                >
                  주소 검색
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="주소"
                  name="address"
                  value={formData.address}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#f7fafc'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="상세주소"
                  name="detailAddress"
                  value={formData.detailAddress}
                  onChange={handleInputChange}
                  variant="outlined"
                  placeholder="상세주소를 입력해주세요"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#cbd5e0'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a5568',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="businessType-label">업종</InputLabel>
                  <Select
                    labelId="businessType-label"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleSelectChange}
                    label="업종"
                    sx={{
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e0'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4a5568',
                        borderWidth: 2
                      }
                    }}
                  >
                    {businessTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ mb: 0.5, color: '#1a1a1a' }}>
                    짐 보관 가능 개수 설정 <Typography component="span" sx={{ color: '#e53e3e' }}>*</Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: '#718096' }}>
                    각 크기별로 보관 가능한 최대 개수를 입력해주세요
                  </Typography>
                  <Box sx={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: 3, 
                    p: 3, 
                    bgcolor: '#f7fafc' 
                  }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="소형 (가방/백팩)"
                          type="number"
                          value={formData.storageCapacity.small}
                          onChange={(e) => handleStorageCapacityChange('small', e.target.value)}
                          variant="outlined"
                          inputProps={{ min: 0 }}
                          helperText="20L 이하"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: '#ffffff',
                              '&:hover fieldset': {
                                borderColor: '#cbd5e0'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#4a5568',
                                borderWidth: 2
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="중형 (캐리어)"
                          type="number"
                          value={formData.storageCapacity.medium}
                          onChange={(e) => handleStorageCapacityChange('medium', e.target.value)}
                          variant="outlined"
                          inputProps={{ min: 0 }}
                          helperText="20-60L"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: '#ffffff',
                              '&:hover fieldset': {
                                borderColor: '#cbd5e0'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#4a5568',
                                borderWidth: 2
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="대형 (대형 캐리어)"
                          type="number"
                          value={formData.storageCapacity.large}
                          onChange={(e) => handleStorageCapacityChange('large', e.target.value)}
                          variant="outlined"
                          inputProps={{ min: 0 }}
                          helperText="60L 이상"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: '#ffffff',
                              '&:hover fieldset': {
                                borderColor: '#cbd5e0'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#4a5568',
                                borderWidth: 2
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mb: 1, 
                fontWeight: 600, 
                color: '#1a1a1a',
                fontSize: '1.25rem'
              }}
            >
              추가 정보를 입력해주세요
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 4, 
                color: '#718096'
              }}
            >
              매장 사진, 편의시설, 필수 서류 및 정산 계좌를 등록해주세요
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ mb: 0.5, color: '#1a1a1a' }}>
                    매장 사진 <Typography component="span" variant="caption" sx={{ color: '#718096', fontWeight: 400 }}>(선택사항)</Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: '#718096' }}>
                    고객에게 매장을 소개할 사진을 업로드하거나 URL을 입력하세요
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 3, 
                    flexWrap: 'wrap',
                    p: 3,
                    border: '2px dashed #cbd5e0',
                    borderRadius: 3,
                    bgcolor: '#f7fafc',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#a0aec0',
                      bgcolor: '#edf2f7'
                    }
                  }}>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={uploadingImage}
                      sx={{ 
                        minWidth: 150,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#cbd5e0',
                        color: '#4a5568',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: '#a0aec0',
                          bgcolor: 'transparent',
                          borderWidth: 2
                        }
                      }}
                    >
                      {uploadingImage ? '업로드 중...' : '파일 선택'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'storePictures')}
                      />
                    </Button>
                    
                    <TextField
                      sx={{ 
                        flex: 1, 
                        minWidth: 300,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#ffffff',
                          '&:hover fieldset': {
                            borderColor: '#cbd5e0'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4a5568',
                            borderWidth: 2
                          }
                        }
                      }}
                      label="또는 URL 입력 후 엔터"
                      variant="outlined"
                      size="small"
                      placeholder="https://example.com/image.jpg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              storePictures: [...prev.storePictures, input.value.trim()]
                            }));
                            input.value = '';
                          }
                          e.preventDefault();
                        }
                      }}
                    />
                  </Box>
                  
                  {formData.storePictures.length > 0 && (
                    <Box>
                      <Typography variant="body2" fontWeight="600" sx={{ mb: 2, color: '#4a5568' }}>
                        업로드된 사진 ({formData.storePictures.length}장)
                      </Typography>
                      <Grid container spacing={2}>
                        {formData.storePictures.map((url, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Box sx={{ 
                              position: 'relative', 
                              border: '1px solid #e2e8f0',
                              borderRadius: 3,
                              overflow: 'hidden',
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                transform: 'translateY(-2px)'
                              }
                            }}>
                              {url.startsWith('data:image') ? (
                                <Box sx={{ 
                                  width: '100%', 
                                  height: 180, 
                                  backgroundImage: `url(${url})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                }} />
                              ) : (
                                <Box sx={{ 
                                  p: 2, 
                                  height: 180, 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  bgcolor: '#f7fafc'
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    wordBreak: 'break-all',
                                    fontSize: '0.75rem',
                                    color: '#718096'
                                  }}>
                                    {url.substring(0, 60)}...
                                  </Typography>
                                </Box>
                              )}
                              <Box sx={{ 
                                p: 1.5, 
                                bgcolor: '#ffffff', 
                                borderTop: '1px solid #e2e8f0' 
                              }}>
                                <Button 
                                  fullWidth
                                  size="small"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      storePictures: prev.storePictures.filter((_, i) => i !== index)
                                    }));
                                  }}
                                  sx={{
                                    color: '#e53e3e',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': {
                                      bgcolor: '#fff5f5'
                                    }
                                  }}
                                >
                                  삭제
                                </Button>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ mb: 0.5, color: '#1a1a1a' }}>
                    매장 편의시설
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: '#718096' }}>
                    매장에서 제공하는 편의시설을 모두 선택해주세요
                  </Typography>
                  <Box sx={{ 
                    p: 3,
                    border: '1px solid #e2e8f0',
                    borderRadius: 3,
                    bgcolor: '#f7fafc'
                  }}>
                    <FormGroup row>
                      {availableAmenities.map((amenity) => (
                        <FormControlLabel
                          key={amenity}
                          sx={{ 
                            minWidth: '140px', 
                            mb: 1,
                            '& .MuiCheckbox-root': {
                              color: '#cbd5e0',
                              '&.Mui-checked': {
                                color: '#4a5568'
                              }
                            },
                            '& .MuiTypography-root': {
                              color: '#2d3748',
                              fontWeight: 500
                            }
                          }}
                          control={
                            <Checkbox
                              checked={formData.amenities.includes(amenity)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    amenities: [...prev.amenities, amenity]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    amenities: prev.amenities.filter(a => a !== amenity)
                                  }));
                                }
                              }}
                            />
                          }
                          label={amenity}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  p: 3,
                  border: '1px solid #e2e8f0',
                  borderRadius: 3,
                  bgcolor: '#f7fafc'
                }}>
                  <FormControlLabel
                    sx={{
                      alignItems: 'flex-start',
                      '& .MuiCheckbox-root': {
                        color: '#cbd5e0',
                        '&.Mui-checked': {
                          color: '#4a5568'
                        }
                      }
                    }}
                    control={
                      <Checkbox
                        checked={formData.insuranceAvailable}
                        onChange={(e) => setFormData({...formData, insuranceAvailable: e.target.checked})}
                      />
                    }
                    label={
                      <Box>
                        <Typography fontWeight="600" sx={{ color: '#1a1a1a' }}>
                          보험 가입 여부
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#718096', mt: 0.5 }}>
                          고객 소지품에 대한 보험 가입 시 신뢰도가 높아집니다
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />
                <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 1, mt: 3, color: '#1a1a1a', fontSize: '1.15rem' }}>
                  필수 서류
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#718096' }}>
                  사업자등록증 또는 신분증, 통장 사본을 업로드해주세요
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ color: '#1a1a1a' }}>
                    사업자등록증 또는 신분증 <Typography component="span" sx={{ color: '#e53e3e' }}>*</Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: '#718096' }}>
                    개인 사업자는 사업자등록증, 개인은 신분증 사진을 업로드해주세요
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    alignItems: 'center', 
                    flexWrap: 'wrap',
                    p: 3,
                    border: '2px solid',
                    borderColor: formData.businessRegistrationUrl ? '#48bb78' : '#e2e8f0',
                    borderRadius: 3,
                    bgcolor: formData.businessRegistrationUrl ? '#f0fff4' : '#f7fafc',
                    transition: 'all 0.2s'
                  }}>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={uploadingImage}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#cbd5e0',
                        color: '#4a5568',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: '#a0aec0',
                          bgcolor: 'transparent',
                          borderWidth: 2
                        }
                      }}
                    >
                      {uploadingImage ? '업로드 중...' : '파일 선택'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'businessRegistrationUrl')}
                      />
                    </Button>
                    
                    <TextField
                      sx={{ 
                        flex: 1, 
                        minWidth: 300,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#ffffff',
                          '&:hover fieldset': {
                            borderColor: '#cbd5e0'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4a5568',
                            borderWidth: 2
                          }
                        }
                      }}
                      label="또는 URL 입력"
                      name="businessRegistrationUrl"
                      value={formData.businessRegistrationUrl && !formData.businessRegistrationUrl.startsWith('data:image') ? formData.businessRegistrationUrl : ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                      placeholder="https://example.com/business-registration.jpg"
                    />
                    
                    {formData.businessRegistrationUrl && (
                      <Typography variant="body2" sx={{ color: '#48bb78', fontWeight: 600 }}>
                        ✓ 업로드 완료
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ color: '#1a1a1a' }}>
                    통장 사본 <Typography component="span" sx={{ color: '#e53e3e' }}>*</Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: '#718096' }}>
                    정산 계좌 확인을 위한 통장 사본을 업로드해주세요
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    alignItems: 'center', 
                    flexWrap: 'wrap',
                    p: 3,
                    border: '2px solid',
                    borderColor: formData.bankBookUrl ? '#48bb78' : '#e2e8f0',
                    borderRadius: 3,
                    bgcolor: formData.bankBookUrl ? '#f0fff4' : '#f7fafc',
                    transition: 'all 0.2s'
                  }}>
                    <Button
                      variant="outlined"
                      component="label"
                      disabled={uploadingImage}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#cbd5e0',
                        color: '#4a5568',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: '#a0aec0',
                          bgcolor: 'transparent',
                          borderWidth: 2
                        }
                      }}
                    >
                      {uploadingImage ? '업로드 중...' : '파일 선택'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'bankBookUrl')}
                      />
                    </Button>
                    
                    <TextField
                      sx={{ 
                        flex: 1, 
                        minWidth: 300,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#ffffff',
                          '&:hover fieldset': {
                            borderColor: '#cbd5e0'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4a5568',
                            borderWidth: 2
                          }
                        }
                      }}
                      label="또는 URL 입력"
                      name="bankBookUrl"
                      value={formData.bankBookUrl && !formData.bankBookUrl.startsWith('data:image') ? formData.bankBookUrl : ''}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                      placeholder="https://example.com/bankbook.jpg"
                    />
                    
                    {formData.bankBookUrl && (
                      <Typography variant="body2" sx={{ color: '#48bb78', fontWeight: 600 }}>
                        ✓ 업로드 완료
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />
                <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 1, mt: 3, color: '#1a1a1a', fontSize: '1.15rem' }}>
                  정산 계좌 정보 <Typography component="span" sx={{ color: '#e53e3e' }}>*</Typography>
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#718096' }}>
                  매월 말 수익이 입금될 계좌 정보를 입력해주세요
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  p: 3,
                  border: '1px solid #e2e8f0',
                  borderRadius: 3,
                  bgcolor: '#f7fafc'
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        required
                        fullWidth
                        label="은행명"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="예: 국민은행"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: '#ffffff',
                            '&:hover fieldset': {
                              borderColor: '#cbd5e0'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#4a5568',
                              borderWidth: 2
                            }
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        required
                        fullWidth
                        label="계좌번호"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="000000-00-000000"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: '#ffffff',
                            '&:hover fieldset': {
                              borderColor: '#cbd5e0'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#4a5568',
                              borderWidth: 2
                            }
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        required
                        fullWidth
                        label="예금주"
                        name="accountHolder"
                        value={formData.accountHolder}
                        onChange={handleInputChange}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: '#ffffff',
                            '&:hover fieldset': {
                              borderColor: '#cbd5e0'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#4a5568',
                              borderWidth: 2
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mb: 1, 
                fontWeight: 600, 
                color: '#1a1a1a',
                fontSize: '1.25rem'
              }}
            >
              운영 정보를 입력해주세요
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 4, 
                color: '#718096'
              }}
            >
              매장 운영 시간과 이용약관을 확인해주세요
            </Typography>

            <Box sx={{ 
              p: 3,
              mb: 3,
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              bgcolor: '#f7fafc'
            }}>
              <FormControlLabel
                sx={{
                  '& .MuiCheckbox-root': {
                    color: '#cbd5e0',
                    '&.Mui-checked': {
                      color: '#4a5568'
                    }
                  },
                  '& .MuiTypography-root': {
                    color: '#2d3748',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }
                }}
                control={
                  <Checkbox
                    checked={formData.is24Hours}
                    onChange={handleCheckboxChange}
                    name="is24Hours"
                  />
                }
                label="24시간 영업"
              />
            </Box>

            {!formData.is24Hours && (
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <Box sx={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 3, 
                  p: 3, 
                  mb: 3, 
                  bgcolor: '#f7fafc' 
                }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ mb: 3, color: '#1a1a1a' }}>
                    영업시간 설정
                  </Typography>

                  {Object.keys(formData.businessHours).map((day) => (
                    <Box key={day} sx={{ mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <FormControlLabel
                            sx={{
                              '& .MuiCheckbox-root': {
                                color: '#cbd5e0',
                                '&.Mui-checked': {
                                  color: '#4a5568'
                                }
                              },
                              '& .MuiTypography-root': {
                                color: '#2d3748',
                                fontWeight: 500
                              }
                            }}
                            control={
                              <Checkbox
                                checked={formData.businessHours[day].enabled}
                                onChange={(e) => handleBusinessHourChange(day, 'enabled', e.target.checked)}
                              />
                            }
                            label={getDayName(day)}
                          />
                        </Grid>

                        {formData.businessHours[day].enabled && (
                          <>
                            <Grid item xs={6} sm={4.5}>
                              <TimePicker
                                label="오픈 시간"
                                value={new Date(`2022-01-01T${formData.businessHours[day].open}`)}
                                onChange={(newValue) => {
                                  if (newValue) {
                                    const hours = newValue.getHours().toString().padStart(2, '0');
                                    const minutes = newValue.getMinutes().toString().padStart(2, '0');
                                    handleBusinessHourChange(day, 'open', `${hours}:${minutes}`);
                                  }
                                }}
                                sx={{ 
                                  width: '100%',
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: '#ffffff',
                                    '&:hover fieldset': {
                                      borderColor: '#cbd5e0'
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#4a5568',
                                      borderWidth: 2
                                    }
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item xs={6} sm={4.5}>
                              <TimePicker
                                label="마감 시간"
                                value={new Date(`2022-01-01T${formData.businessHours[day].close}`)}
                                onChange={(newValue) => {
                                  if (newValue) {
                                    const hours = newValue.getHours().toString().padStart(2, '0');
                                    const minutes = newValue.getMinutes().toString().padStart(2, '0');
                                    handleBusinessHourChange(day, 'close', `${hours}:${minutes}`);
                                  }
                                }}
                                sx={{ 
                                  width: '100%',
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: '#ffffff',
                                    '&:hover fieldset': {
                                      borderColor: '#cbd5e0'
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#4a5568',
                                      borderWidth: 2
                                    }
                                  }
                                }}
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>

                      {day !== 'SUNDAY' && <Divider sx={{ mt: 2, borderColor: '#e2e8f0' }} />}
                    </Box>
                  ))}
                </Box>
              </LocalizationProvider>
            )}

            <Box sx={{ 
              mt: 4, 
              p: 3, 
              border: '1px solid #e2e8f0', 
              borderRadius: 3, 
              bgcolor: '#f7fafc' 
            }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ mb: 2, color: '#1a1a1a' }}>
                파트너 이용약관 <Typography component="span" sx={{ color: '#e53e3e' }}>*</Typography>
              </Typography>
              <Box sx={{
                height: 200,
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                p: 3,
                borderRadius: 2,
                bgcolor: '#ffffff',
                fontSize: '0.875rem',
                mb: 3,
                lineHeight: 1.8,
                color: '#4a5568'
              }}>
                트래블라이트 파트너 서비스 이용약관입니다. 본 약관은 트래블라이트와 파트너 사이의 권리와 의무를 규정합니다.
                <br /><br />
                1. 서비스 제공: 트래블라이트는 파트너에게 짐 보관 서비스 중개 플랫폼을 제공합니다.
                <br />
                2. 수수료: 트래블라이트는 예약당 일정 수수료를 청구합니다.
                <br />
                3. 책임: 파트너는 서비스 품질 유지에 책임이 있습니다.
                <br />
                4. 정산: 정산은 월 1회 진행됩니다.
                <br /><br />
                본 약관에 동의함으로써 파트너는 위 사항을 준수할 것을 약속합니다.
              </Box>
              <FormControlLabel
                sx={{
                  '& .MuiCheckbox-root': {
                    color: '#cbd5e0',
                    '&.Mui-checked': {
                      color: '#4a5568'
                    }
                  },
                  '& .MuiTypography-root': {
                    color: '#2d3748',
                    fontWeight: 600
                  }
                }}
                control={
                  <Checkbox
                    checked={formData.agreeTerms}
                    onChange={handleCheckboxChange}
                    name="agreeTerms"
                    required
                  />
                }
                label="이용약관에 동의합니다"
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: '#fafafa'
      }}>
        <Navbar />
        <Container component="main" maxWidth="sm" sx={{ mb: 6, mt: { xs: 6, md: 10 }, flexGrow: 1 }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 4, md: 6 }, 
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              textAlign: 'center',
              py: 2
            }}>
              {/* 성공 아이콘 */}
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#f0fff4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}>
                <Typography sx={{ fontSize: '3rem' }}>✓</Typography>
              </Box>

              <Typography 
                variant="h4" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: '#1a1a1a',
                  mb: 2,
                  fontSize: { xs: '1.75rem', md: '2rem' }
                }}
              >
                신청이 완료되었습니다
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mt: 1, 
                  mb: 2,
                  color: '#4a5568',
                  lineHeight: 1.8,
                  fontSize: '1rem'
                }}
              >
                파트너 가입 신청이 접수되었습니다.<br />
                관리자 검토 후 승인이 완료되면 이메일로 알려드리겠습니다.
              </Typography>
              
              <Box sx={{ 
                mt: 3, 
                p: 3,
                width: '100%',
                bgcolor: '#f7fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#2d3748',
                    fontWeight: 600,
                    lineHeight: 1.6
                  }}
                >
                  💡 승인이 완료될 때까지<br />
                  파트너 매장 관리자 페이지에서<br />
                  승인 대기 상태를 확인하실 수 있습니다.
                </Typography>
              </Box>

              <Button
                onClick={() => navigate('/partner-dashboard')}
                size="large"
                sx={{
                  mt: 4,
                  px: 5,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  bgcolor: '#2d3748',
                  color: '#ffffff',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    bgcolor: '#1a202c',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                매장 관리자 페이지로 이동
              </Button>
            </Box>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: '#fafafa'
    }}>
      <Navbar />
      <Container component="main" maxWidth="md" sx={{ mb: 6, mt: { xs: 4, md: 6 }, flexGrow: 1 }}>
        {/* 헤더 섹션 */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            component="h1" 
            variant="h3" 
            sx={{ 
              mb: 1.5,
              fontWeight: 700,
              color: '#1a1a1a',
              fontSize: { xs: '1.75rem', md: '2.5rem' }
            }}
          >
            파트너 가입 신청
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666',
              fontSize: '1rem',
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            간단한 정보 입력으로 트래블라이트 파트너로 시작하세요
          </Typography>
        </Box>

        {/* 스테퍼 */}
        <Box sx={{ mb: 5 }}>
          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              '& .MuiStepLabel-root .Mui-completed': {
                color: '#4a5568',
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: '#2d3748',
              },
              '& .MuiStepLabel-label': {
                fontSize: '0.875rem',
                fontWeight: 500
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* 콘텐츠 카드 */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  alignItems: 'center'
                }
              }}
            >
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          {/* 네비게이션 버튼 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 5,
            pt: 4,
            borderTop: '1px solid #e2e8f0'
          }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                color: activeStep === 0 ? '#cbd5e0' : '#4a5568',
                border: '2px solid',
                borderColor: activeStep === 0 ? '#e2e8f0' : '#cbd5e0',
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: activeStep === 0 ? 'transparent' : '#f7fafc',
                  borderColor: activeStep === 0 ? '#e2e8f0' : '#a0aec0'
                }
              }}
            >
              이전
            </Button>
            <Button
              onClick={handleNext}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                bgcolor: '#2d3748',
                color: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  bgcolor: '#1a202c',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                },
                '&:disabled': {
                  bgcolor: '#cbd5e0',
                  color: '#fff'
                }
              }}
            >
              {activeStep === steps.length - 1 ? '제출하기' : '다음'}
            </Button>
          </Box>
        </Paper>

        {/* 진행 상태 표시 */}
        <Box sx={{ 
          mt: 3, 
          textAlign: 'center',
          color: '#718096',
          fontSize: '0.875rem'
        }}>
          {activeStep + 1} / {steps.length} 단계
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default PartnerSignup;