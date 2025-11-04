import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  Divider,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  TextField,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Box as MuiBox
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import LuggageIcon from '@mui/icons-material/Luggage';
import Navbar from '../components/Navbar';
import { useAuth } from '../services/AuthContext';
import { useTranslation } from 'react-i18next';
import api, { ApiResponse } from '../services/api';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { partnershipService } from '../services/api';
import StorageCheckIn from '../components/storage/StorageCheckIn';
import StorageCheckOut from '../components/storage/StorageCheckOut';
import StorageStatusDashboard from '../components/storage/StorageStatusDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
      <div
          role="tabpanel"
          hidden={value !== index}
          id={`partner-tabpanel-${index}`}
          aria-labelledby={`partner-tab-${index}`}
          {...other}
          style={{ padding: '24px 0' }}
      >
        {value === index && <Box>{children}</Box>}
      </div>
  );
}

interface Store {
  id: number;
  name: string;
  address: string;
  businessHours: Record<string, string>;
  is24Hours: boolean;
  capacity: string;
  status: string;
  smallBagsAvailable?: number;
  mediumBagsAvailable?: number;
  largeBagsAvailable?: number;
}

interface StorageUsage {
  maxCapacity: {
    smallBags: number;
    mediumBags: number;
    largeBags: number;
  };
  currentUsage: {
    smallBags: number;
    mediumBags: number;
    largeBags: number;
  };
  availableCapacity: {
    smallBags: number;
    mediumBags: number;
    largeBags: number;
  };
}

interface BusinessHourDto {
  enabled: boolean;
  open: string;
  close: string;
}

const PartnerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, isAuthenticated, isPartner, isWaiting, refreshUserData } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [storeList, setStoreList] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);

  // 예약 상태별 카운트를 추적하는 상태 변수들 추가
  const [reservedCount, setReservedCount] = useState(0);
  const [inUseCount, setInUseCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Add BusinessHourDto interface
  interface BusinessHourDto {
    enabled: boolean;
    open: string;
    close: string;
  }

  // Default business hours template (match the one in PartnerSignup)
  const defaultBusinessHours: Record<string, BusinessHourDto> = {
    MONDAY: { enabled: true, open: '09:00', close: '18:00' },
    TUESDAY: { enabled: true, open: '09:00', close: '18:00' },
    WEDNESDAY: { enabled: true, open: '09:00', close: '18:00' },
    THURSDAY: { enabled: true, open: '09:00', close: '18:00' },
    FRIDAY: { enabled: true, open: '09:00', close: '18:00' },
    SATURDAY: { enabled: true, open: '10:00', close: '17:00' },
    SUNDAY: { enabled: false, open: '10:00', close: '17:00' },
  };

  // 영업시간을 안전하게 파싱하는 헬퍼 함수 추가
  const parseBusinessHours = (storeHour: any, day: string): BusinessHourDto => {
    // 기본값 설정
    const defaultHour = defaultBusinessHours[day];

    // null 또는 undefined인 경우 기본값 반환
    if (storeHour === null || storeHour === undefined) {
      return {
        enabled: false,  // 기본값을 false로 변경
        open: defaultHour.open,
        close: defaultHour.close
      };
    }

    // 문자열 형태 처리 (예: "09:00-18:00")
    if (typeof storeHour === 'string') {
      const [open, close] = storeHour.split('-');
      return {
        enabled: !!open && !!close,  // 시간이 있으면 true, 없으면 false
        open: open?.trim() || defaultHour.open,
        close: close?.trim() || defaultHour.close
      };
    }

    // 객체 형태 처리
    if (typeof storeHour === 'object') {
      return {
        // 명시적으로 enabled가 설정되지 않았다면 false로 처리
        enabled: storeHour.enabled !== undefined ? storeHour.enabled : false,
        open: storeHour.open || defaultHour.open,
        close: storeHour.close || defaultHour.close
      };
    }

    // 그 외의 경우 기본값 반환
    return {
      enabled: false,  // 기본값을 false로 변경
      open: defaultHour.open,
      close: defaultHour.close
    };
  };

  const [editBusinessHours, setEditBusinessHours] = useState<Record<string, BusinessHourDto>>(() => {
    // 선택된 매장의 영업시간 가져오기
    const storeHours = selectedStore?.businessHours;
    
    // 매장 영업시간이 없으면 기본값 사용
    if (!storeHours) {
      return defaultBusinessHours;
    }

    // 각 요일별로 영업시간 파싱
    return Object.keys(defaultBusinessHours).reduce((acc, day) => {
      acc[day] = parseBusinessHours(storeHours[day], day);
      return acc;
    }, {} as Record<string, BusinessHourDto>);
  });

  const [is24HoursEdit, setIs24HoursEdit] = useState(selectedStore?.is24Hours || false);
  const [savingBusinessHours, setSavingBusinessHours] = useState(false);

  const [editStorage, setEditStorage] = useState({
    small: selectedStore?.smallBagsAvailable ?? 0,
    medium: selectedStore?.mediumBagsAvailable ?? 0,
    large: selectedStore?.largeBagsAvailable ?? 0,
  });
  const [saving, setSaving] = useState(false);

  // 영업시간 저장 관련 상태 추가
  const [businessHoursSaveDialog, setBusinessHoursSaveDialog] = useState({
    open: false,
    success: true,
    message: ''
  });

  useEffect(() => {
    // 인증 및 권한 확인
    if (!isAuthenticated) {
      // navigate('/login', { state: { from: '/partner-dashboard' } });
    } else {
      // 데이터 로딩 시뮬레이션
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  const handleRefreshUserData = async () => {
    try {
      setCheckingStatus(true);
      await refreshUserData();
    } catch (error) {
      setError('사용자 정보를 업데이트하는 중 오류가 발생했습니다.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStoreChange = (event: SelectChangeEvent<number>) => {
    const store = storeList.find(s => s.id === event.target.value);
    if (store) {
      setSelectedStore(store);
    }
  };

  const handleAddStore = () => {
    navigate('/partner-signup');
  };

  // 파트너의 매장 목록을 API로부터 가져옵니다.
  const fetchStores = async () => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/partnership');
      const data = response.data.data;
      const userStores = data.filter((p: any) => p.email === user?.email && p.status === 'APPROVED');
      const mappedStores = userStores.map((p: any) => ({
        id: p.id,
        name: p.businessName,
        address: p.address,
        businessHours: p.businessHours,
        is24Hours: p.is24Hours,
        capacity: p.spaceSize,
        status: p.status === 'APPROVED' ? '영업 중' : p.status === 'PENDING' ? '승인 대기 중' : '거절됨',
        smallBagsAvailable: p.smallBagsAvailable,
        mediumBagsAvailable: p.mediumBagsAvailable,
        largeBagsAvailable: p.largeBagsAvailable,
      }));
      setStoreList(mappedStores);
      
      // 현재 선택된 매장이 있다면 업데이트된 정보로 교체
      if (selectedStore) {
        const updatedSelectedStore = mappedStores.find(store => store.id === selectedStore.id);
        if (updatedSelectedStore) {
          setSelectedStore(updatedSelectedStore);
        }
      } else if (mappedStores.length > 0) {
        setSelectedStore(mappedStores[0]);
      }
    } catch (e) {
      setError('매장 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (user && user.email) {
      fetchStores();
    }
  }, [user]);

  // 선택된 매장의 예약 목록을 API로부터 가져옵니다.
  useEffect(() => {
    const fetchReservations = async () => {
      if (!selectedStore) return;
      try {
        const result = await api.get<any[]>(`/reservations/store/${encodeURIComponent(selectedStore.name)}`);
        const data: any[] = result.data;

        // 현재 시간에 따라 예약 상태 업데이트
        const now = new Date();
        const updatedData = updateReservationStatuses(data, now);

        const mapped = updatedData.map(r => {
          const items = [
            r.smallBags ? `소형 ${r.smallBags}` : null,
            r.mediumBags ? `중형 ${r.mediumBags}` : null,
            r.largeBags ? `대형 ${r.largeBags}` : null
          ].filter(Boolean).join(', ');

          // 표시용 상태 텍스트
          const displayStatus = r.displayStatus || (r.status === 'RESERVED' ? '예약 완료' : r.status === 'COMPLETED' ? '이용 완료' : r.status);

          return {
            id: r.id,
            userId: r.userId || r.user?.id, // 사용자 ID 추가
            customerName: r.userName,
            date: r.storageDate,
            startTime: r.storageStartTime,
            endTime: r.storageEndTime,
            items,
            total: `${r.totalPrice.toLocaleString()}원`,
            status: displayStatus,
            rawStatus: r.status, // 원본 상태값 추가로 저장
            reservationNumber: r.reservationNumber || `R-${r.id}` // 예약 번호 추가
          };
        });
        setReservations(mapped);

        // 예약 상태별 카운트 계산
        const { reserved, inUse, completed } = calculateReservationCounts(mapped);
        setReservedCount(reserved);
        setInUseCount(inUse);
        setCompletedCount(completed);

      } catch (e) {
        console.error("예약 정보 로딩 중 오류:", e); // 더 자세한 오류 정보
        setError('예약 정보를 불러오는 중 오류가 발생했습니다.');
      }
    };
    fetchReservations();

    // 추가: 1분마다 예약 정보 새로고침
    const refreshInterval = setInterval(fetchReservations, 60000);
    return () => clearInterval(refreshInterval);
  }, [selectedStore]);

  // 백엔드 예약 데이터에 시간 기반 상태 추가
  const updateReservationStatuses = (reservations: any[], now: Date) => {
    return reservations.map(reservation => {
      const updatedReservation = { ...reservation };

      // 날짜와 시간 파싱
      if (reservation.storageDate && reservation.storageStartTime && reservation.storageEndTime) {
        // 시간 파싱
        const parseTime = (timeStr: string) => {
          const parts = timeStr.split(':');
          if (parts.length >= 2) {
            return {
              hours: parseInt(parts[0], 10),
              minutes: parseInt(parts[1], 10)
            };
          }
          return { hours: 0, minutes: 0 };
        };

        // 날짜 파싱
        const parseDate = (dateStr: string) => {
          try {
            return new Date(dateStr);
          } catch (e) {
            console.error("날짜 파싱 오류:", e);
            return new Date();
          }
        };

        const storageDate = parseDate(reservation.storageDate);
        const startTime = parseTime(reservation.storageStartTime);
        const endTime = parseTime(reservation.storageEndTime);

        // 시작 및 종료 일시 생성
        const startDateTime = new Date(storageDate);
        startDateTime.setHours(startTime.hours, startTime.minutes, 0);

        const endDateTime = new Date(storageDate);
        endDateTime.setHours(endTime.hours, endTime.minutes, 0);

        // 오늘인지 확인
        const isToday =
            storageDate.getDate() === now.getDate() &&
            storageDate.getMonth() === now.getMonth() &&
            storageDate.getFullYear() === now.getFullYear();

        // 상태 업데이트
        if (reservation.status === 'RESERVED') {
          if (now < startDateTime) {
            updatedReservation.displayStatus = '예약 완료';
          } else if (now >= startDateTime && now < endDateTime) {
            updatedReservation.displayStatus = '이용 중';
          } else if (now >= endDateTime) {
            updatedReservation.displayStatus = '이용 완료';

            // 선택적으로 백엔드 API 호출하여 상태 업데이트 가능
            // 여기서는 표시용 상태만 변경
          }
        } else if (reservation.status === 'COMPLETED') {
          updatedReservation.displayStatus = '이용 완료';
        }
      }

      return updatedReservation;
    });
  };

  // 예약 상태에 따라 카운트를 계산하는 함수 개선
  const calculateReservationCounts = (reservations: any[]) => {
    const now = new Date();
    let reserved = 0;
    let inUse = 0;
    let completed = 0;

    console.log("상태 계산 시작:", now.toLocaleTimeString(), "총 예약수:", reservations.length); // 디버깅용 로그

    // 오늘 날짜인지 확인하는 함수
    const isToday = (dateStr: string) => {
      if (!dateStr) return false;

      const today = new Date();
      const date = new Date(dateStr);
      return date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();
    };

    reservations.forEach(res => {
      // 오늘 날짜의 예약만 필터링
      if (!isToday(res.date)) return;

      console.log(`예약 ID: ${res.id}, 상태: ${res.status}, 시작: ${res.startTime}, 종료: ${res.endTime}`);

      // 표시 상태에 따라 카운트
      if (res.status === '예약 완료') {
        reserved++;
        console.log(`  => 예약 완료 카운트 증가 (ID: ${res.id})`);
      } else if (res.status === '이용 중') {
        inUse++;
        console.log(`  => 이용 중 카운트 증가 (ID: ${res.id})`);
      } else if (res.status === '이용 완료') {
        completed++;
        console.log(`  => 금일 완료 카운트 증가 (ID: ${res.id})`);
      }
    });

    console.log(`계산 결과 - 예약 완료: ${reserved}, 이용 중: ${inUse}, 금일 완료: ${completed}`);
    return { reserved, inUse, completed };
  };

  // 주기적으로 예약 상태 업데이트 (1분마다)
  useEffect(() => {
    if (!reservations.length) return;

    const intervalId = setInterval(() => {
      const { reserved, inUse, completed } = calculateReservationCounts(reservations);
      setReservedCount(reserved);
      setInUseCount(inUse);
      setCompletedCount(completed);
    }, 60000); // 1분마다 업데이트

    // 초기 실행
    const { reserved, inUse, completed } = calculateReservationCounts(reservations);
    setReservedCount(reserved);
    setInUseCount(inUse);
    setCompletedCount(completed);

    return () => clearInterval(intervalId);
  }, [reservations]);

  // 예약관리탭 고객 상세보기 버튼 관련
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ name: string; email: string; reservationNumber: string } | null>(null);

  const handleOpenUserDetail = async (reservationId: number) => {
    try {
      // 이미 로드된 예약 정보에서 해당 예약 찾기
      const reservation = reservations.find(res => res.id === reservationId);

      if (!reservation) {
        throw new Error('예약 정보를 찾을 수 없습니다.');
      }

      // API에서 사용자 정보 가져오기
      const response = await api.get<ApiResponse<any>>(`/users/${reservation.userId || reservation.id}`);
      const userData = response.data.data;

      // 상태 업데이트
      setSelectedUser({
        name: userData.name || reservation.customerName,
        email: userData.email || '',
        reservationNumber: reservation.reservationNumber || `R-${reservationId}` // 예약 번호
      });
      setOpenDialog(true);
    } catch (e) {
      console.error("정보를 불러오는 중 오류 발생:", e);
      setError('사용자 정보를 불러올 수 없습니다.');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    if (selectedStore) {
      setEditStorage({
        small: selectedStore.smallBagsAvailable ?? 0,
        medium: selectedStore.mediumBagsAvailable ?? 0,
        large: selectedStore.largeBagsAvailable ?? 0,
      });
    }
  }, [selectedStore]);

  const handleEditStorageChange = (type, value) => {
    setEditStorage(prev => ({ ...prev, [type]: Number(value) }));
  };

  const handleSaveStorage = async () => {
    if (!selectedStore?.id) {
      alert('매장 정보를 찾을 수 없습니다.');
      return;
    }

    setSaving(true);
    try {
      // partnershipService 사용
      await partnershipService.updateStorageCapacity(selectedStore.id, {
        smallBagsAvailable: editStorage.small,
        mediumBagsAvailable: editStorage.medium,
        largeBagsAvailable: editStorage.large,
      });
      
      alert('보관 용량이 저장되었습니다.');
      
      // 매장 정보 새로고침
      await fetchStores();
      
      // 현재 사용량도 새로고침
      if (selectedStore?.id) {
        await fetchStorageUsage(selectedStore.id);
      }
    } catch (error) {
      console.error('Storage save error:', error);
      if (error.response?.status === 403) {
        alert('권한이 없습니다. 로그인 상태를 확인해주세요.');
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } finally {
      setSaving(false);
    }
  };

  // 현재 사용량 조회 함수 추가
  const fetchStorageUsage = async (storeId: number) => {
    try {
      const response = await api.get<ApiResponse<StorageUsage>>(`/partnership/${storeId}/current-usage`);
      if (response.data && response.data.success) {
        setStorageUsage(response.data.data);
      }
    } catch (error) {
      console.error('현재 사용량 조회 중 오류:', error);
    }
  };

  // 선택된 매장이 변경될 때 사용량 조회
  useEffect(() => {
    if (selectedStore?.id) {
      fetchStorageUsage(selectedStore.id);
    }
  }, [selectedStore]);

  // Update business hours state when store changes
  useEffect(() => {
    if (selectedStore) {
      const newBusinessHours = selectedStore.businessHours || defaultBusinessHours;
      
      // Ensure the new business hours match the expected structure
      const validatedBusinessHours = Object.keys(defaultBusinessHours).reduce((acc, day) => {
        acc[day] = parseBusinessHours(newBusinessHours[day], day);
        return acc;
      }, {} as Record<string, BusinessHourDto>);

      setEditBusinessHours(validatedBusinessHours);
      setIs24HoursEdit(selectedStore.is24Hours || false);
    }
  }, [selectedStore]);

  // Helper function to get day name
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

  // Handle 24-hour toggle
  const handleIs24HoursToggle = (checked: boolean) => {
    setIs24HoursEdit(checked);

    if (checked) {
      // Set all days to 24 hours
      const updatedBusinessHours: Record<string, BusinessHourDto> = {};
      Object.keys(editBusinessHours).forEach(day => {
        updatedBusinessHours[day] = {
          ...editBusinessHours[day],
          enabled: true,
          open: '00:00',
          close: '24:00'
        };
      });
      setEditBusinessHours(updatedBusinessHours);
    } else {
      // Restore to default hours
      setEditBusinessHours(defaultBusinessHours);
    }
  };

  // Handle business hours change
  const handleBusinessHourChange = (day: string, field: 'enabled' | 'open' | 'close', value: any) => {
    const updatedBusinessHours = {
      ...editBusinessHours,
      [day]: {
        ...editBusinessHours[day],
        [field]: field === 'enabled' ? value : 
                 field === 'open' && !editBusinessHours[day].enabled ? editBusinessHours[day].open :
                 field === 'close' && !editBusinessHours[day].enabled ? editBusinessHours[day].close :
                 value
      }
    };

    // 체크박스 해제 시 시간을 기본값으로 초기화
    if (field === 'enabled' && !value) {
      updatedBusinessHours[day] = {
        enabled: false,
        open: defaultBusinessHours[day].open,
        close: defaultBusinessHours[day].close
      };
    }

    setEditBusinessHours(updatedBusinessHours);
  };

  // Save business hours
  const handleSaveBusinessHours = async () => {
    if (!selectedStore?.id) {
      alert('매장 정보를 찾을 수 없습니다.');
      return;
    }

    setSavingBusinessHours(true);
    try {
      // 디버깅을 위해 데이터 콘솔 출력
      console.log('Store ID:', selectedStore.id);
      console.log('Business Hours:', editBusinessHours);
      console.log('Is 24 Hours:', is24HoursEdit);

      // 24시간 영업이 아닌 경우, 실제 enabled 상태 반영
      const processedBusinessHours = is24HoursEdit 
        ? Object.keys(editBusinessHours).reduce((acc, day) => {
            acc[day] = {
              enabled: true,
              open: '00:00',
              close: '24:00'
            };
            return acc;
          }, {})
        : Object.keys(editBusinessHours).reduce((acc, day) => {
            // 각 요일의 실제 enabled 상태 반영
            acc[day] = {
              enabled: editBusinessHours[day].enabled,
              open: editBusinessHours[day].enabled ? editBusinessHours[day].open : defaultBusinessHours[day].open,
              close: editBusinessHours[day].enabled ? editBusinessHours[day].close : defaultBusinessHours[day].close
            };
            return acc;
          }, {});

      // Use the new API method to update business hours
      await partnershipService.updateBusinessHours(
        selectedStore.id, 
        processedBusinessHours, 
        is24HoursEdit
      );
      
      // 성공 다이얼로그 표시
      setBusinessHoursSaveDialog({
        open: true,
        success: true,
        message: '영업시간이 성공적으로 저장되었습니다.'
      });
      
      // Refresh store list to get updated information
      await fetchStores();
    } catch (error) {
      console.error('Business hours save error:', error);
      console.error('Error response:', error.response?.data);
      
      // 실패 다이얼로그 표시
      const errorMessage = error.response?.status === 403 
        ? '권한이 없습니다. 로그인 상태를 확인해주세요.' 
        : '저장 중 오류가 발생했습니다.';
      
      setBusinessHoursSaveDialog({
        open: true,
        success: false,
        message: errorMessage
      });
    } finally {
      setSavingBusinessHours(false);
    }
  };

  // 다이얼로그 닫기 핸들러
  const handleCloseBusinessHoursSaveDialog = () => {
    setBusinessHoursSaveDialog(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Container sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Container>
        </Box>
    );
  }

  // 승인 대기 중인 경우 (승인된 매장이 없고 WAIT 상태인 경우만)
  // 승인된 매장이 있으면 추가 신청 중이더라도 기존 매장 관리 가능
  if (storeList.length === 0 && (isWaiting || !isPartner)) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Container component="main" maxWidth="md" sx={{ mb: 4, mt: 8, flexGrow: 1 }}>
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: 3 }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4
              }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  승인 대기 중
                </Typography>
                <Typography variant="body1" align="center" sx={{ mt: 2, mb: 4 }}>
                  현재 파트너 신청이 관리자 승인 대기 중입니다.
                  승인이 완료되면 매장 관리 기능을 사용하실 수 있습니다.
                  승인 과정은 일반적으로 1-3일이 소요됩니다.
                  {checkingStatus && (
                      <Box component="span" fontStyle="italic" sx={{ display: 'block', mt: 2, fontSize: '0.9rem', color: 'text.secondary' }}>
                        승인 상태를 확인 중입니다...
                      </Box>
                  )}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                      variant="outlined"
                      onClick={() => navigate('/partner')}
                      size="large"
                  >
                    파트너 메인 페이지로 돌아가기
                  </Button>
                  <Button
                      variant="contained"
                      onClick={handleRefreshUserData}
                      size="large"
                      disabled={checkingStatus}
                  >
                    상태 새로고침
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>
    );
  }

  return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />

        {/* 헤더 배너 */}
        <Paper
            elevation={0}
            sx={{
              background: '#2E7DF1',
              color: 'white',
              py: 4,
              px: 3,
              borderRadius: 0
            }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
                  안녕하세요, 소중한 파트너님! 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 'normal' }}>
                  오늘도 여행객들의 소중한 짐을 안전하게 보관해주셔서 감사합니다
                </Typography>
              </Box>
              <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleAddStore}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
              >
                새 매장 등록하기
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl sx={{ minWidth: 300, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }}>
                <Select
                    value={selectedStore?.id}
                    onChange={handleStoreChange}
                    sx={{
                      color: 'white',
                      '.MuiSelect-icon': { color: 'white' },
                      '&:before': { borderColor: 'white' },
                      '&:after': { borderColor: 'white' }
                    }}
                >
                  {storeList.map((store) => (
                      <MenuItem key={store.id} value={store.id}>
                        {store.name}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Chip
                  label={selectedStore?.status}
                  color="primary"
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                  }}
              />
            </Box>
          </Container>
        </Paper>

        <Container maxWidth="lg" sx={{ flexGrow: 1, mb: 4, mt: 2 }}>
          {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
                value={tabValue}
                onChange={handleChangeTab}
                aria-label="partner dashboard tabs"
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : undefined}
                centered={!isMobile}
            >
              <Tab icon={<StoreIcon />} label="매장 현황" />
              <Tab icon={<EventNoteIcon />} label="예약 관리" />
              <Tab icon={<LuggageIcon />} label="짐 보관 관리" />
              <Tab icon={<SettingsIcon />} label="설정" />
              <Tab icon={<ReceiptIcon />} label="정산 내역" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                매장 현황
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                        매장 정보
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* 상호명 */}
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500, fontSize: '0.75rem' }}>
                            상호명
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {selectedStore?.name || '-'}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 0.5 }} />

                        {/* 주소 */}
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500, fontSize: '0.75rem' }}>
                            매장 주소
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.5, color: 'text.primary' }}>
                            {selectedStore?.address || '-'}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 0.5 }} />

                        {/* 영업시간 */}
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500, fontSize: '0.75rem' }}>
                            영업시간
                          </Typography>
                          {selectedStore?.is24Hours ? (
                            <Box sx={{ 
                              display: 'inline-flex', 
                              px: 1.5, 
                              py: 0.5, 
                              backgroundColor: 'success.main', 
                              color: 'white', 
                              borderRadius: 0.5,
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}>
                              24시간 영업
                            </Box>
                          ) : (
                            <Box>
                              {selectedStore?.businessHours ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                  {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                                    const hours = selectedStore.businessHours[day];
                                    if (!hours) return null;
                                    const formattedDay = day === 'MONDAY' ? '월' :
                                        day === 'TUESDAY' ? '화' :
                                            day === 'WEDNESDAY' ? '수' :
                                                day === 'THURSDAY' ? '목' :
                                                    day === 'FRIDAY' ? '금' :
                                                        day === 'SATURDAY' ? '토' :
                                                            day === 'SUNDAY' ? '일' : day;
                                    return (
                                        <Box 
                                          key={day}
                                          sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                          }}
                                        >
                                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                                            {formattedDay}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                            {hours}
                                          </Typography>
                                        </Box>
                                    );
                                  }).filter(Boolean)}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                  영업 시간이 설정되지 않았습니다.
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        보관 용량 현황
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      
                      {/* 소형 가방 */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            소형 가방
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {storageUsage ? storageUsage.currentUsage.smallBags : 0} / {selectedStore?.smallBagsAvailable ?? 0}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            selectedStore?.smallBagsAvailable 
                              ? ((storageUsage?.currentUsage.smallBags ?? 0) / selectedStore.smallBagsAvailable) * 100 
                              : 0
                          }
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: 
                                selectedStore?.smallBagsAvailable 
                                  ? ((storageUsage?.currentUsage.smallBags ?? 0) / selectedStore.smallBagsAvailable) > 0.8 
                                    ? '#f44336' // 빨간색 (80% 이상)
                                    : ((storageUsage?.currentUsage.smallBags ?? 0) / selectedStore.smallBagsAvailable) > 0.6 
                                      ? '#ff9800' // 주황색 (60-80%)
                                      : '#4caf50' // 초록색 (60% 이하)
                                  : '#4caf50'
                            }
                          }}
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                          사용 가능: {storageUsage?.availableCapacity.smallBags ?? (selectedStore?.smallBagsAvailable ?? 0)}개
                        </Typography>
                      </Box>

                      {/* 중형 가방 */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            중형 가방
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {storageUsage ? storageUsage.currentUsage.mediumBags : 0} / {selectedStore?.mediumBagsAvailable ?? 0}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            selectedStore?.mediumBagsAvailable 
                              ? ((storageUsage?.currentUsage.mediumBags ?? 0) / selectedStore.mediumBagsAvailable) * 100 
                              : 0
                          }
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: 
                                selectedStore?.mediumBagsAvailable 
                                  ? ((storageUsage?.currentUsage.mediumBags ?? 0) / selectedStore.mediumBagsAvailable) > 0.8 
                                    ? '#f44336' // 빨간색 (80% 이상)
                                    : ((storageUsage?.currentUsage.mediumBags ?? 0) / selectedStore.mediumBagsAvailable) > 0.6 
                                      ? '#ff9800' // 주황색 (60-80%)
                                      : '#4caf50' // 초록색 (60% 이하)
                                  : '#4caf50'
                            }
                          }}
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                          사용 가능: {storageUsage?.availableCapacity.mediumBags ?? (selectedStore?.mediumBagsAvailable ?? 0)}개
                        </Typography>
                      </Box>

                      {/* 대형 가방 */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            대형 가방
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {storageUsage ? storageUsage.currentUsage.largeBags : 0} / {selectedStore?.largeBagsAvailable ?? 0}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            selectedStore?.largeBagsAvailable 
                              ? ((storageUsage?.currentUsage.largeBags ?? 0) / selectedStore.largeBagsAvailable) * 100 
                              : 0
                          }
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: 
                                selectedStore?.largeBagsAvailable 
                                  ? ((storageUsage?.currentUsage.largeBags ?? 0) / selectedStore.largeBagsAvailable) > 0.8 
                                    ? '#f44336' // 빨간색 (80% 이상)
                                    : ((storageUsage?.currentUsage.largeBags ?? 0) / selectedStore.largeBagsAvailable) > 0.6 
                                      ? '#ff9800' // 주황색 (60-80%)
                                      : '#4caf50' // 초록색 (60% 이하)
                                  : '#4caf50'
                            }
                          }}
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                          사용 가능: {storageUsage?.availableCapacity.largeBags ?? (selectedStore?.largeBagsAvailable ?? 0)}개
                        </Typography>
                      </Box>

                      {/* 전체 사용률 요약 */}
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          전체 사용률
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{
                          color: (() => {
                            const totalMax = (selectedStore?.smallBagsAvailable ?? 0) + 
                                           (selectedStore?.mediumBagsAvailable ?? 0) + 
                                           (selectedStore?.largeBagsAvailable ?? 0);
                            const totalUsed = (storageUsage?.currentUsage.smallBags ?? 0) + 
                                            (storageUsage?.currentUsage.mediumBags ?? 0) + 
                                            (storageUsage?.currentUsage.largeBags ?? 0);
                            const usageRate = totalMax > 0 ? totalUsed / totalMax : 0;
                            
                            return usageRate > 0.8 ? '#f44336' : usageRate > 0.6 ? '#ff9800' : '#4caf50';
                          })()
                        }}>
                          {(() => {
                            const totalMax = (selectedStore?.smallBagsAvailable ?? 0) + 
                                           (selectedStore?.mediumBagsAvailable ?? 0) + 
                                           (selectedStore?.largeBagsAvailable ?? 0);
                            const totalUsed = (storageUsage?.currentUsage.smallBags ?? 0) + 
                                            (storageUsage?.currentUsage.mediumBags ?? 0) + 
                                            (storageUsage?.currentUsage.largeBags ?? 0);
                            const usageRate = totalMax > 0 ? (totalUsed / totalMax * 100).toFixed(1) : '0.0';
                            
                            return `${usageRate}%`;
                          })()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        오늘의 예약 현황
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">{reservedCount}</Typography>
                          <Typography variant="body2" color="textSecondary">예약 완료</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">{inUseCount}</Typography>
                          <Typography variant="body2" color="textSecondary">이용 중</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">{completedCount}</Typography>
                          <Typography variant="body2" color="textSecondary">금일 완료</Typography>
                        </Box>
                      </Box>
                      <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setTabValue(1)}
                      >
                        예약 관리로 이동
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        이번 달 수익 현황
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">{reservations.length}</Typography>
                          <Typography variant="body2" color="textSecondary">총 예약 수</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {reservations.reduce((sum, reservation) => {
                              const priceStr = reservation.total.replace(/[^0-9]/g, '');
                              return sum + (parseInt(priceStr) || 0);
                            }, 0).toLocaleString()}원
                          </Typography>
                          <Typography variant="body2" color="textSecondary">총 매출</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {Math.floor(reservations.reduce((sum, reservation) => {
                              const priceStr = reservation.total.replace(/[^0-9]/g, '');
                              return sum + (parseInt(priceStr) || 0);
                            }, 0) * 0.9).toLocaleString()}원
                          </Typography>
                          <Typography variant="body2" color="textSecondary">정산 예정액</Typography>
                        </Box>
                      </Box>
                      <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setTabValue(4)}
                      >
                        정산 내역으로 이동
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                예약 관리
              </Typography>
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        <TableCell>예약번호</TableCell>
                        <TableCell>고객명</TableCell>
                        <TableCell>날짜</TableCell>
                        <TableCell>시간</TableCell>
                        <TableCell>보관 물품</TableCell>
                        <TableCell>금액</TableCell>
                        <TableCell>상태</TableCell>
                        <TableCell>관리</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reservations.map((row) => (
                          <TableRow hover key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.customerName}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{`${row.startTime} - ${row.endTime}`}</TableCell>
                            <TableCell>{row.items}</TableCell>
                            <TableCell>{row.total}</TableCell>
                            <TableCell>
                              <Chip
                                  label={row.status}
                                  color={row.status === '예약 완료' ? 'primary' : 'success'}
                                  size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                  size="small"
                                  onClick={() => handleOpenUserDetail(row.id)}
                              >
                                상세보기
                              </Button>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* 짐 보관 관리 탭 */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                짐 보관 관리
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                고객의 짐 입고 및 출고를 처리하고 현재 보관 현황을 확인할 수 있습니다.
              </Typography>

              {selectedStore ? (
                <Grid container spacing={3}>
                  {/* 입고 처리 */}
                  <Grid item xs={12} md={6}>
                    <StorageCheckIn
                      onCheckInComplete={(result) => {
                        console.log('입고 완료:', result);
                        // 필요시 추가 처리
                      }}
                    />
                  </Grid>

                  {/* 출고 처리 */}
                  <Grid item xs={12} md={6}>
                    <StorageCheckOut
                      onCheckOutComplete={(result) => {
                        console.log('출고 완료:', result);
                        // 필요시 추가 처리
                      }}
                    />
                  </Grid>

                  {/* 보관 현황 대시보드 */}
                  <Grid item xs={12}>
                    <StorageStatusDashboard
                      storeName={selectedStore.name}
                      storeAddress={selectedStore.address}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">
                  짐 보관 관리를 위해 먼저 매장을 선택해주세요.
                </Alert>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                매장 설정
              </Typography>
              
              {/* 보관 용량 설정 */}
              <Typography variant="h6" sx={{ mb: 2 }}>보관 용량 설정</Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={4}>
                  <TextField
                    label="소형"
                    type="number"
                    value={editStorage.small}
                    onChange={e => handleEditStorageChange('small', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="중형"
                    type="number"
                    value={editStorage.medium}
                    onChange={e => handleEditStorageChange('medium', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="대형"
                    type="number"
                    value={editStorage.large}
                    onChange={e => handleEditStorageChange('large', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveStorage} 
                    disabled={saving}
                  >
                    보관 용량 저장
                  </Button>
                </Grid>
              </Grid>

              {/* 영업시간 설정 */}
              <Typography variant="h6" sx={{ mb: 2 }}>영업시간 설정</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={is24HoursEdit}
                        onChange={(e) => handleIs24HoursToggle(e.target.checked)}
                      />
                    }
                    label="24시간 영업"
                  />
                </Grid>
              </Grid>

              {!is24HoursEdit && (
                <Grid container spacing={2}>
                  {Object.keys(editBusinessHours).map((day) => (
                    <Grid item xs={12} key={day}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        mb: 2,
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: !editBusinessHours[day].enabled ? 'rgba(0,0,0,0.05)' : 'inherit'
                      }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={editBusinessHours[day].enabled}
                              onChange={(e) => handleBusinessHourChange(day, 'enabled', e.target.checked)}
                            />
                          }
                          label={getDayName(day)}
                          sx={{ minWidth: 100 }}
                        />
                        
                        {editBusinessHours[day].enabled && (
                          <>
                            <TextField
                              label="오픈 시간"
                              type="time"
                              value={editBusinessHours[day].open}
                              onChange={(e) => handleBusinessHourChange(day, 'open', e.target.value)}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                step: 300, // 5 min
                              }}
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              label="마감 시간"
                              type="time"
                              value={editBusinessHours[day].close}
                              onChange={(e) => handleBusinessHourChange(day, 'close', e.target.value)}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                step: 300, // 5 min
                              }}
                              sx={{ flex: 1 }}
                            />
                          </>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              <Button 
                variant="contained" 
                onClick={handleSaveBusinessHours} 
                disabled={savingBusinessHours}
                sx={{ mt: 2 }}
              >
                영업시간 저장
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                정산 내역
              </Typography>
              <Typography variant="body1" paragraph>
                정산 내역 기능은 개발 중입니다. 곧 제공될 예정입니다.
              </Typography>
            </Box>
          </TabPanel>
        </Container>

        <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="user-detail-dialog-title"
        >
          <DialogTitle id="user-detail-dialog-title">고객 상세 정보</DialogTitle>
          <DialogContent>
            {selectedUser && (
                <Box sx={{ py: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">이름</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{selectedUser.name}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">이메일</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{selectedUser.email}</Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">예약 번호</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{selectedUser.reservationNumber}</Typography>
                    </Grid>
                  </Grid>
                </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">닫기</Button>
          </DialogActions>
        </Dialog>

        <Dialog
            open={businessHoursSaveDialog.open}
            onClose={handleCloseBusinessHoursSaveDialog}
            aria-labelledby="business-hours-save-dialog-title"
        >
          <DialogTitle id="business-hours-save-dialog-title">
            {businessHoursSaveDialog.success ? '저장 성공' : '저장 실패'}
          </DialogTitle>
          <DialogContent>
            <Typography 
              variant="body1" 
              color={businessHoursSaveDialog.success ? 'success.main' : 'error.main'}
            >
              {businessHoursSaveDialog.message}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBusinessHoursSaveDialog} color="primary">
              확인
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default PartnerDashboard; 