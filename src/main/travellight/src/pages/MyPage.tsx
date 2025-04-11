import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Paper, 
  Tab, 
  Divider,
  Stack
} from '@mui/material';
import Navbar from '../components/Navbar';
import { styled } from '@mui/material/styles';
import './MyPage.css';
import { useAuth } from '../services/AuthContext';
import { getMyReservations } from '../services/reservationService';
import { ReservationDto } from '../types/reservation';

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

  useEffect(() => {
    const fetchReservations = async () => {
      if (user?.id) {
        try {
          const reservations = await getMyReservations(user.id);
          setMyTrips(reservations);
        } catch (error) {
          console.error('예약 정보를 불러오는데 실패했습니다:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReservations();
  }, [user]);

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return '예약완료';
      case 'COMPLETED':
        return '이용완료';
      case 'CANCELLED':
        return '취소됨';
      default:
        return status;
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <div className="mypage-container">
          <div className="mypage-header">
            <Typography variant="h5" className="mypage-title">
              마이페이지
            </Typography>
            <Typography variant="body2" className="mypage-description">
              여행 내역 확인 및 회원 정보를 관리하세요.
            </Typography>
          </div>

          <div className="tab-buttons">
            <div 
              className={`tab-button ${activeTab === 0 ? 'active' : 'inactive'}`}
              onClick={() => handleTabChange(0)}
              style={{ marginRight: '8px' }}
            >
              여행 확인
            </div>
            <div 
              className={`tab-button ${activeTab === 1 ? 'active' : 'inactive'}`}
              onClick={() => handleTabChange(1)}
            >
              정보 수정
            </div>
          </div>
          
          {activeTab === 0 && (
            <>
              <div className="filter-container">
                <div style={{ marginBottom: '8px' }}>
                  <Typography variant="body2" color="text.secondary">
                    날짜 범위
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" color="text.secondary">
                    최근 3개월 ~ 서비스 유형 모든 유형 ~
                  </Typography>
                </div>
              </div>

              {loading ? (
                <div className="loading-container">
                  <Typography>로딩 중...</Typography>
                </div>
              ) : myTrips.length === 0 ? (
                <div className="empty-container">
                  <Typography>예약 내역이 없습니다.</Typography>
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
                          예약번호: {trip.reservationNumber}
                        </div>
                        <div className="trip-detail-item">
                          보관 시작: {trip.storageDate} {trip.storageStartTime}
                        </div>
                        <div className="trip-detail-item">
                          보관 종료: {trip.storageEndDate} {trip.storageEndTime}
                        </div>
                        <div className="trip-detail-item">
                          짐 개수: 소형 {trip.smallBags}개, 중형 {trip.mediumBags}개, 대형 {trip.largeBags}개
                        </div>
                        <div className="trip-detail-item">
                          총 금액: {trip.totalPrice.toLocaleString()}원
                        </div>
                      </div>
                      
                      <div>
                        <button className="detail-button">상세보기</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 1 && (
            <div className="trip-card">
              <Typography variant="body1">
                회원 정보 수정 기능은 준비 중입니다.
              </Typography>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default MyPage; 