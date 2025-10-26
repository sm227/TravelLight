import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

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

      console.log('=== 결제 완료 페이지 ===');
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

      // 결제 성공 - 백엔드에서 결제 검증 및 예약 완료 처리
      try {
        console.log('=== 결제 검증 시작 ===');

        // 1. 결제 검증 요청
        const completeResponse = await fetch('/api/payment/portone/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: paymentId,
            payMethod: searchParams.get('payMethod') || 'card',
          }),
        });

        if (!completeResponse.ok) {
          const errorText = await completeResponse.text();
          throw new Error(`결제 검증 실패: ${errorText}`);
        }

        const paymentComplete = await completeResponse.json();
        console.log('결제 검증 결과:', paymentComplete);

        if (paymentComplete.status !== 'PAID') {
          throw new Error('결제가 완료되지 않았습니다.');
        }

        // 2. 백엔드에서 결제 정보 상세 조회하여 customData 추출
        const paymentInfoResponse = await fetch(`/api/payment/portone/info/${paymentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!paymentInfoResponse.ok) {
          throw new Error('결제 정보 조회 실패');
        }

        const paymentInfo = await paymentInfoResponse.json();
        console.log('결제 정보 상세:', paymentInfo);

        let reservationData;
        try {
          if (!paymentInfo.customData || !paymentInfo.customData.reservationData) {
            throw new Error('예약 정보를 찾을 수 없습니다.');
          }
          reservationData = paymentInfo.customData.reservationData;
          console.log('예약 데이터:', reservationData);
        } catch (e) {
          console.error('customData 파싱 오류:', e);
          throw new Error('예약 정보 파싱에 실패했습니다.');
        }

        // 3. 예약 저장
        console.log('=== 예약 저장 시작 ===');
        const reservationResponse = await fetch('/api/reservation/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            ...reservationData,
            portonePaymentId: paymentId,
          }),
        });

        if (!reservationResponse.ok) {
          const errorText = await reservationResponse.text();
          throw new Error(`예약 저장 실패: ${errorText}`);
        }

        const savedReservation = await reservationResponse.json();
        console.log('예약 저장 결과:', savedReservation);

        // 4. 쿠폰 사용 처리 (쿠폰이 적용된 경우)
        if (reservationData.couponCode) {
          try {
            console.log('=== 쿠폰 사용 처리 시작 ===');
            await fetch('/api/user-coupons/use', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              },
              body: JSON.stringify({
                userId: reservationData.userId,
                couponCode: reservationData.couponCode,
                purchaseAmount: reservationData.originalPrice,
                orderId: savedReservation.reservationNumber || savedReservation.data?.reservationNumber
              }),
            });
            console.log('쿠폰 사용 처리 완료');
          } catch (couponError) {
            console.error('쿠폰 사용 처리 중 오류:', couponError);
            // 쿠폰 사용 실패해도 결제는 완료되었으므로 계속 진행
          }
        }

        // 5. Payment 테이블에 저장
        const reservationNumber = savedReservation.reservationNumber || savedReservation.data?.reservationNumber;
        if (reservationNumber) {
          try {
            console.log('=== Payment 테이블 저장 시작 ===');
            await fetch('/api/payment/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentId: paymentId,
                reservationNumber: reservationNumber,
              }),
            });
            console.log('Payment 테이블 저장 완료');
          } catch (paymentError) {
            console.error('Payment 저장 중 오류:', paymentError);
            // Payment 저장 실패해도 예약은 완료되었으므로 계속 진행
          }
        }

        console.log('=== 결제 및 예약 처리 완료 ===');
        setProcessing(false);

        // 성공 메시지 표시 후 지도 페이지로 이동
        alert('결제가 완료되었습니다!');
        navigate('/map', { state: { showReservations: true } });

      } catch (error) {
        console.error('결제 처리 중 오류:', error);
        setError(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
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