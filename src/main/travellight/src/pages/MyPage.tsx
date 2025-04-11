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
import { useTranslation } from 'react-i18next';

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
                      
                      <div>
                        <button className="detail-button">{t('viewDetails')}</button>
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
                {t('editInfoMessage')}
              </Typography>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default MyPage; 