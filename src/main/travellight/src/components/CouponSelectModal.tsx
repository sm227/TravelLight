import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalOffer as CouponIcon
} from '@mui/icons-material';
import { UserCoupon, getAvailableUserCoupons } from '../services/couponService';
import { useTranslation } from 'react-i18next';

interface CouponSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelectCoupon: (coupon: UserCoupon) => void;
  userId: number;
  purchaseAmount: number;
}

const CouponSelectModal: React.FC<CouponSelectModalProps> = ({
  open,
  onClose,
  onSelectCoupon,
  userId,
  purchaseAmount
}) => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && userId) {
      loadCoupons();
    }
  }, [open, userId]);

  const loadCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const availableCoupons = await getAvailableUserCoupons(userId);

      // 최소 구매 금액 조건을 만족하는 쿠폰만 필터링
      const usableCoupons = availableCoupons.filter(
        coupon => purchaseAmount >= coupon.minPurchaseAmount
      );

      setCoupons(usableCoupons);
    } catch (err: any) {
      setError(err.message || t('couponLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCoupon = (coupon: UserCoupon) => {
    onSelectCoupon(coupon);
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

  const calculateDiscount = (coupon: UserCoupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      const discount = Math.floor((purchaseAmount * coupon.discountValue) / 100);
      return coupon.maxDiscountAmount
        ? Math.min(discount, coupon.maxDiscountAmount)
        : discount;
    } else {
      return coupon.discountValue;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        py: 2,
        px: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CouponIcon sx={{ color: '#3b82f6' }} />
          <span style={{ fontSize: '18px', fontWeight: 600 }}>{t('selectMyCoupons')}</span>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: '#64748b', '&:hover': { backgroundColor: '#f1f5f9' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{
        backgroundColor: '#ffffff',
        color: '#1e293b',
        py: 2,
        px: 3,
        minHeight: '200px',
        maxHeight: '500px',
        overflowY: 'auto',
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : coupons.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: '#64748b', fontSize: '14px' }}>
              {t('noAvailableCoupons')}
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '12px', mt: 1 }}>
              {t('noAvailableCouponsDescription')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {coupons.map((coupon) => {
              const discount = calculateDiscount(coupon);

              return (
                <Box
                  key={coupon.userCouponId}
                  onClick={() => handleSelectCoupon(coupon)}
                  sx={{
                    p: 2,
                    backgroundColor: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: '#eff6ff',
                      borderColor: '#3b82f6',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.1)'
                    }
                  }}
                >
                  {/* 쿠폰명과 할인 금액 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                      {coupon.name}
                    </Typography>
                    <Chip
                      label={t('couponDiscount', { amount: discount.toLocaleString() })}
                      size="small"
                      sx={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '13px',
                        height: '24px'
                      }}
                    />
                  </Box>

                  {/* 쿠폰 코드 */}
                  <Box sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    mb: 1.5,
                    backgroundColor: '#e0f2fe',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#0c4a6e',
                    letterSpacing: '1px'
                  }}>
                    {coupon.code}
                  </Box>

                  {/* 쿠폰 상세 정보 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '12px', color: '#64748b' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('discount')}</span>
                      <span style={{ color: '#1e293b', fontWeight: '500' }}>
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}%${coupon.maxDiscountAmount ? ` (${t('maxDiscount')} ${coupon.maxDiscountAmount.toLocaleString()}${t('won')})` : ''}`
                          : `${coupon.discountValue.toLocaleString()}${t('won')}`}
                      </span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('minPurchaseAmount')}</span>
                      <span style={{ color: '#1e293b', fontWeight: '500' }}>
                        {coupon.minPurchaseAmount.toLocaleString()}{t('won')}
                      </span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('validUntil')}</span>
                      <span style={{ color: '#1e293b', fontWeight: '500' }}>
                        {formatDate(coupon.endDate)} {t('until')}
                      </span>
                    </Box>
                  </Box>

                  {/* 설명 */}
                  {coupon.description && (
                    <Typography sx={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      mt: 1,
                      fontStyle: 'italic'
                    }}>
                      {coupon.description}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        p: 2,
        px: 3
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{
            borderColor: '#e2e8f0',
            color: '#64748b',
            fontSize: '14px',
            py: 1,
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: '#f8fafc'
            }
          }}
        >
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CouponSelectModal;
