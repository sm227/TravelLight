import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  IconButton,
  Box,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  LocalOffer as CouponIcon
} from '@mui/icons-material';
import { Coupon, getNotificationCoupons, hasUsedWelcomeCoupon } from '../services/couponService';
import axios from 'axios';

interface CouponNotificationPopupProps {
  userId: number | null;
  open: boolean;
  onClose: () => void;
}

const CouponNotificationPopup: React.FC<CouponNotificationPopupProps> = ({ userId, open, onClose }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [issuingCoupon, setIssuingCoupon] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (open && userId) {
      loadCoupons();
    }
  }, [open, userId]);

  const loadCoupons = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const notificationCoupons = await getNotificationCoupons(userId);

      // 웰컴 쿠폰 사용 여부도 확인
      const welcomeUsed = await hasUsedWelcomeCoupon(userId);

      // 웰컴 쿠폰을 사용하지 않았으면 알림에 포함
      const filteredCoupons = welcomeUsed
        ? notificationCoupons.filter(c => c.code !== 'WELCOME20')
        : notificationCoupons;

      setCoupons(filteredCoupons);
    } catch (error) {
      console.error('쿠폰 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleIssueCoupon = async (couponCode: string, couponId: number) => {
    if (!userId) return;

    try {
      setIssuingCoupon(couponId);
      const response = await axios.post(
        '/api/user-coupons/issue',
        {
          userId: userId,
          couponCode: couponCode
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSnackbarMessage('쿠폰이 발급되었습니다! 이제 사용하실 수 있습니다.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        // 발급된 쿠폰을 목록에서 제거
        setCoupons(prev => prev.filter(c => c.id !== couponId));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '쿠폰 발급에 실패했습니다.';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIssuingCoupon(null);
    }
  };

  const handleClose = () => {
    if (dontShowToday) {
      const today = new Date().toDateString();
      localStorage.setItem('couponPopupDontShowToday', 'true');
      localStorage.setItem('couponPopupDontShowDate', today);
    }
    setDontShowToday(false); // 체크박스 상태 초기화
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getRemainingCount = (coupon: Coupon) => {
    return coupon.usageLimit - coupon.usedCount;
  };

  if (!open || coupons.length === 0) {
    return null;
  }

  return (
    <>
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#ffffff',
          color: '#000000',
          border: '1px solid #e2e8f0',
          borderRadius: '12px'
        }
      }}
    >
      <DialogTitle sx={{
        backgroundColor: '#ffffff',
        color: '#1e293b',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        px: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '15px', fontWeight: 600 }}>
          🎉 사용 가능한 쿠폰
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: '#64748b', '&:hover': { backgroundColor: '#f1f5f9' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{
        backgroundColor: '#ffffff',
        color: '#1e293b',
        py: 2,
        px: 2,
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f5f9'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#cbd5e1',
          borderRadius: '3px',
          '&:hover': {
            backgroundColor: '#94a3b8'
          }
        }
      }}>
        {coupons.map((coupon, index) => (
          <Box
            key={coupon.id}
            sx={{
              mb: index < coupons.length - 1 ? 1.5 : 0,
              p: 1.5,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}
          >
            {/* 쿠폰명과 할인 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                {coupon.name}
              </span>
              <Chip
                label={coupon.discountType === 'PERCENTAGE'
                  ? `${coupon.discountValue}%`
                  : `${coupon.discountValue.toLocaleString()}원`}
                size="small"
                sx={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '11px',
                  height: '20px'
                }}
              />
            </Box>

            {/* 쿠폰 코드와 받기 버튼 */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  backgroundColor: '#e0f2fe',
                  borderRadius: '4px'
                }}
              >
                <Box sx={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#0c4a6e',
                  letterSpacing: '1px'
                }}>
                  {coupon.code}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleCopyCode(coupon.code)}
                  sx={{
                    color: copiedCode === coupon.code ? '#10b981' : '#3b82f6',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)'
                    }
                  }}
                >
                  <CopyIcon sx={{ fontSize: '16px' }} />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleIssueCoupon(coupon.code, coupon.id)}
                disabled={issuingCoupon === coupon.id}
                sx={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  px: 2,
                  minWidth: '60px',
                  '&:hover': {
                    backgroundColor: '#059669'
                  },
                  '&:disabled': {
                    backgroundColor: '#9ca3af'
                  }
                }}
              >
                {issuingCoupon === coupon.id ? '발급중...' : '받기'}
              </Button>
            </Box>

            {/* 쿠폰 정보 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, fontSize: '11px', color: '#64748b' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>최소 구매</span>
                <span style={{ color: '#1e293b', fontWeight: '500' }}>{coupon.minPurchaseAmount.toLocaleString()}원</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>기간</span>
                <span style={{ color: '#1e293b', fontWeight: '500' }}>
                  {formatDate(coupon.endDate)}까지
                </span>
              </Box>
            </Box>
          </Box>
        ))}
      </DialogContent>

      <DialogActions sx={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0.5
      }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              size="small"
              sx={{
                color: '#94a3b8',
                '&.Mui-checked': {
                  color: '#3b82f6'
                }
              }}
            />
          }
          label="오늘 하루 보지 않기"
          sx={{
            color: '#64748b',
            m: 0,
            '& .MuiFormControlLabel-label': {
              fontSize: '12px'
            }
          }}
        />
        <Button
          onClick={handleClose}
          variant="contained"
          fullWidth
          size="small"
          sx={{
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontSize: '13px',
            py: 0.75,
            '&:hover': { backgroundColor: '#2563eb' }
          }}
        >
          확인
        </Button>
      </DialogActions>
    </Dialog>

    <Snackbar
      open={snackbarOpen}
      autoHideDuration={3000}
      onClose={() => setSnackbarOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setSnackbarOpen(false)}
        severity={snackbarSeverity}
        sx={{ width: '100%' }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
    </>
  );
};

export default CouponNotificationPopup;
