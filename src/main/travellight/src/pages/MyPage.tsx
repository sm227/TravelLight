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
  Alert
} from '@mui/material';
import Navbar from '../components/Navbar';
import { styled } from '@mui/material/styles';
import './MyPage.css';
import { useAuth } from '../services/AuthContext';
import { getMyReservations } from '../services/reservationService';
import { ReservationDto } from '../types/reservation';
import { useTranslation } from 'react-i18next';
import { userService, PasswordChangeRequest } from '../services/api';

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

  useEffect(() => {
    const fetchReservations = async () => {
      if (user?.id) {
        try {
          const reservations = await getMyReservations(user.id);
          const updatedReservations = checkAndUpdateReservationStatus(reservations);
          setMyTrips(updatedReservations);
        } catch (error) {
          console.error('예약 정보를 불러오는데 실패했습니다:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReservations();

    // 1분마다 상태를 체크하고 업데이트
    const interval = setInterval(() => {
      setMyTrips(prevTrips => checkAndUpdateReservationStatus(prevTrips));
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

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

  return (
      <>
        <Navbar />
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <div className="mypage-container">
            <div className="mypage-header">
              <Typography variant="h5" className="mypage-title">
                {t('myPageTitle')}
              </Typography>
              <Typography variant="body2" className="mypage-description">
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
                        {myTrips.map((trip) => (
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

                              <div className="button-container" style={{ display: 'flex', gap: '10px' }}>
                                <button className="detail-button">{t('viewDetails')}</button>
                                <button className="delivery-button" style={{ 
                                  backgroundColor: '#4CAF50', 
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}>
                                  배달 신청하기
                          
                                </button>
                              </div>
                            </div>
                        ))}
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
      </>
  );
};

export default MyPage;