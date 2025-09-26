import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentComplete: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // URL 파라미터에서 결제 결과 정보 추출
    const paymentId = searchParams.get('paymentId');
    const code = searchParams.get('code');
    const message = searchParams.get('message');
    
    console.log('=== 결제 완료 페이지 ===');
    console.log('Payment ID:', paymentId);
    console.log('Code:', code);
    console.log('Message:', message);
    
    // 결제 성공/실패에 따른 처리
    if (code) {
      // 결제 실패
      alert(`결제 실패: ${message || '알 수 없는 오류'}`);
      navigate('/map'); // 지도 페이지로 돌아가기
    } else if (paymentId) {
      // 결제 성공 - 백엔드에서 결제 검증 후 예약 완료 처리
      alert('결제가 완료되었습니다!');
      navigate('/map', { state: { showReservations: true } }); // 예약 조회로 이동
    } else {
      // 잘못된 접근
      alert('잘못된 접근입니다.');
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h2>결제 처리 중...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
};

export default PaymentComplete;