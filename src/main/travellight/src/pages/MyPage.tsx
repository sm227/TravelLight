import React, { useState } from 'react';
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

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  // Sample travel data
  const myTrips = [
    {
      id: 'TCKR-2023-09-15-001',
      origin: '서울역',
      destination: '유인보관',
      departureDate: '2023-09-15 10:30',
      arrivalDate: '2023-09-18 17:00',
      luggage: '캐리어 2개, 백팩 1개',
      status: '이용완료'
    }
  ];

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

              <div>
                {myTrips.map((trip) => (
                  <div className="trip-card" key={trip.id}>
                    <div className="trip-header">
                      <div className="trip-title">
                        {trip.origin} → {trip.destination}
                      </div>
                      <div className="status-chip status-completed">
                        {trip.status}
                      </div>
                    </div>
                    
                    <div className="trip-details">
                      <div className="trip-detail-item">
                        예약번호: {trip.id}
                      </div>
                      <div className="trip-detail-item">
                        출발 날짜: {trip.departureDate}
                      </div>
                      <div className="trip-detail-item">
                        도착 날짜: {trip.arrivalDate}
                      </div>
                      <div className="trip-detail-item">
                        짐 개수: {trip.luggage}
                      </div>
                    </div>
                    
                    <div>
                      <button className="detail-button">상세보기</button>
                    </div>
                  </div>
                ))}
              </div>
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