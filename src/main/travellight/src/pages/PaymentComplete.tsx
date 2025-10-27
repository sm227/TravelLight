import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import axios from 'axios';

const PaymentComplete: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      // URL 파라미터에서 결제 결과 정보 추출
      const paymentId = searchParams.get('paymentId');
      const code = searchParams.get('code');
      const message = searchParams.get('message');

      console.log('=== 결제 완료 페이지 (모바일 리다이렉트) ===');
      console.log('Payment ID:', paymentId);
      console.log('Code:', code);
      console.log('Message:', message);

      // 결제 실패 처리
      if (code) {
        console.error('결제 실패:', code, message);
        setError(`결제 실패: ${message || '알 수 없는 오류'}`);
        setProcessing(false);
        setTimeout(() => {
          navigate('/map');
        }, 3000);
        return;
      }

      // 잘못된 접근
      if (!paymentId) {
        console.error('잘못된 접근: paymentId 없음');
        setError('잘못된 접근입니다.');
        setProcessing(false);
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

      // 결제 성공 - PC와 동일한 방식으로 처리
      try {
        console.log('=== 결제 검증 시작 ===');

        // 1. 결제 검증 및 완료 처리 (PC와 동일)
        const completeResponse = await axios.post('/api/payment/portone/complete', {
          paymentId: paymentId,
          payMethod: 'card', // 모바일에서는 대부분 카드 결제
        });

        console.log('결제 검증 결과:', completeResponse.data);

        if (completeResponse.data.status !== 'PAID') {
          throw new Error('결제가 완료되지 않았습니다.');
        }

        // 2. PortOne에서 결제 정보 조회하여 customData 추출
        console.log('=== 결제 정보 조회 시작 ===');
        const paymentInfoResponse = await axios.get(`/api/payment/portone/info/${paymentId}`);
        const paymentInfo = paymentInfoResponse.data;

        console.log('PortOne 결제 정보:', paymentInfo);

        // customData 추출 - PortOne API 응답 구조에 맞춰 접근
        let customData;
        if (paymentInfo.customData) {
          customData = paymentInfo.customData;
        } else {
          console.error('customData를 찾을 수 없음. paymentInfo 전체:', JSON.stringify(paymentInfo));
          throw new Error('예약 정보를 찾을 수 없습니다.');
        }

        let reservationData;
        if (typeof customData === 'string') {
          // customData가 문자열인 경우 파싱
          try {
            const parsed = JSON.parse(customData);
            reservationData = parsed.reservationData || parsed;
          } catch (e) {
            console.error('customData 문자열 파싱 실패:', e);
            throw new Error('예약 정보 파싱 실패');
          }
        } else if (customData.reservationData) {
          // customData가 객체이고 reservationData가 있는 경우
          reservationData = customData.reservationData;
        } else {
          // customData 자체가 reservationData인 경우
          reservationData = customData;
        }

        console.log('추출된 예약 데이터:', reservationData);

        if (!reservationData || !reservationData.userId) {
          throw new Error('유효하지 않은 예약 정보입니다.');
        }

        // 3. 날짜/시간 포맷팅 함수 (Map.tsx의 submitReservation과 동일)
        const formatDateForServer = (dateInput: any) => {
          if (!dateInput) return null;
          if (typeof dateInput === 'string') {
            return dateInput; // 이미 문자열 형식인 경우 그대로 반환
          }
          const year = dateInput.getFullYear();
          const month = String(dateInput.getMonth() + 1).padStart(2, '0');
          const day = String(dateInput.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const formatTimeForServer = (timeString: string) => {
          if (timeString && !timeString.includes(':00')) {
            return timeString + ':00';
          }
          return timeString;
        };

        // 4. 예약 저장 (PC와 동일)
        console.log('=== 예약 저장 시작 ===');
        console.log('원본 예약 데이터:', reservationData);

        // 날짜/시간 포맷팅 적용
        const formattedReservationData = {
          ...reservationData,
          userId: typeof reservationData.userId === 'string' ? parseInt(reservationData.userId, 10) : reservationData.userId,
          storageDate: formatDateForServer(reservationData.storageDate),
          storageEndDate: formatDateForServer(reservationData.storageEndDate || reservationData.storageDate),
          storageStartTime: formatTimeForServer(reservationData.storageStartTime),
          storageEndTime: formatTimeForServer(reservationData.storageEndTime),
          smallBags: reservationData.smallBags || 0,
          mediumBags: reservationData.mediumBags || 0,
          largeBags: reservationData.largeBags || 0,
          portonePaymentId: paymentId,
        };

        console.log('포맷팅된 예약 데이터:', formattedReservationData);

        const reservationResponse = await axios.post(
          '/api/reservations',
          formattedReservationData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000
          }
        );

        const savedReservation = reservationResponse.data;
        console.log('예약 저장 결과:', savedReservation);

        // 5. 쿠폰 사용 처리 (있는 경우)
        if (reservationData.couponCode) {
          try {
            console.log('=== 쿠폰 사용 처리 시작 ===');
            await axios.post(
              '/api/user-coupons/use',
              {
                userId: reservationData.userId,
                couponCode: reservationData.couponCode,
                purchaseAmount: reservationData.originalPrice,
                orderId: savedReservation.reservationNumber || savedReservation.data?.reservationNumber
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
              }
            );
            console.log('쿠폰 사용 처리 완료');
          } catch (couponError) {
            console.error('쿠폰 사용 처리 중 오류:', couponError);
          }
        }

        // 6. Payment 테이블에 저장
        const reservationNumber = savedReservation.reservationNumber || savedReservation.data?.reservationNumber;
        if (reservationNumber) {
          try {
            console.log('=== Payment 테이블 저장 시작 ===');
            await axios.post('/api/payment/save', {
              paymentId: paymentId,
              reservationNumber: reservationNumber,
            });
            console.log('Payment 테이블 저장 완료');
          } catch (paymentError) {
            console.error('Payment 저장 중 오류:', paymentError);
          }
        }

        console.log('=== 결제 및 예약 처리 완료 ===');
        setProcessing(false);

        // 성공 메시지 표시 후 지도 페이지로 이동
        alert('결제가 완료되었습니다!');
        navigate('/map', { state: { showReservations: true } });

      } catch (error: any) {
        console.error('결제 처리 중 오류:', error);
        console.error('오류 상세:', error.response?.data || error.message);
        setError(error.response?.data?.error || error.message || '결제 처리 중 오류가 발생했습니다.');
        setProcessing(false);
        setTimeout(() => {
          navigate('/map');
        }, 3000);
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {processing ? (
        <>
          <CircularProgress size={60} />
          <Typography variant="h5">결제 처리 중...</Typography>
          <Typography variant="body2" color="text.secondary">
            잠시만 기다려주세요.
          </Typography>
        </>
      ) : error ? (
        <>
          <Typography variant="h5" color="error">
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            잠시 후 지도 페이지로 이동합니다.
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h5" color="success.main">
            결제가 완료되었습니다!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            예약 내역을 확인하세요.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default PaymentComplete;