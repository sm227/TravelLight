import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  InputAdornment,
  Alert
} from '@mui/material';
import { Coupon, CreateCouponRequest, createCoupon, updateCoupon } from '../services/couponService';

interface CouponModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCoupon?: Coupon | null;
}

const CouponModal: React.FC<CouponModalProps> = ({ open, onClose, onSuccess, editingCoupon }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true,
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 편집 모드일 때 데이터 채우기
  useEffect(() => {
    if (editingCoupon) {
      setFormData({
        code: editingCoupon.code,
        name: editingCoupon.name,
        discountType: editingCoupon.discountType,
        discountValue: editingCoupon.discountValue.toString(),
        minPurchaseAmount: editingCoupon.minPurchaseAmount.toString(),
        maxDiscountAmount: editingCoupon.maxDiscountAmount?.toString() || '',
        startDate: editingCoupon.startDate.slice(0, 16), // YYYY-MM-DDTHH:mm 형식
        endDate: editingCoupon.endDate.slice(0, 16),
        usageLimit: editingCoupon.usageLimit.toString(),
        isActive: editingCoupon.isActive,
        description: editingCoupon.description || ''
      });
    } else {
      // 새로 생성할 때는 기본값 설정
      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30일 후

      setFormData({
        code: '',
        name: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minPurchaseAmount: '0',
        maxDiscountAmount: '',
        startDate: now.toISOString().slice(0, 16),
        endDate: endDate.toISOString().slice(0, 16),
        usageLimit: '',
        isActive: true,
        description: ''
      });
    }
    setErrors({});
    setSubmitError('');
  }, [editingCoupon, open]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editingCoupon && !formData.code.trim()) {
      newErrors.code = '쿠폰 코드는 필수입니다.';
    }
    if (!formData.name.trim()) {
      newErrors.name = '쿠폰명은 필수입니다.';
    }
    if (!formData.discountValue || parseInt(formData.discountValue) <= 0) {
      newErrors.discountValue = '할인 값은 1 이상이어야 합니다.';
    }
    if (formData.discountType === 'PERCENTAGE' && parseInt(formData.discountValue) > 100) {
      newErrors.discountValue = '할인율은 100%를 초과할 수 없습니다.';
    }
    if (formData.minPurchaseAmount && parseInt(formData.minPurchaseAmount) < 0) {
      newErrors.minPurchaseAmount = '최소 구매 금액은 0 이상이어야 합니다.';
    }
    if (!formData.startDate) {
      newErrors.startDate = '시작 날짜는 필수입니다.';
    }
    if (!formData.endDate) {
      newErrors.endDate = '종료 날짜는 필수입니다.';
    }
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = '종료 날짜는 시작 날짜보다 이후여야 합니다.';
    }
    if (!formData.usageLimit || parseInt(formData.usageLimit) <= 0) {
      newErrors.usageLimit = '사용 제한 수량은 1 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (editingCoupon) {
        // 수정
        await updateCoupon(editingCoupon.id, {
          name: formData.name,
          discountType: formData.discountType,
          discountValue: parseInt(formData.discountValue),
          minPurchaseAmount: parseInt(formData.minPurchaseAmount),
          maxDiscountAmount: formData.maxDiscountAmount ? parseInt(formData.maxDiscountAmount) : undefined,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          usageLimit: parseInt(formData.usageLimit),
          isActive: formData.isActive,
          description: formData.description || undefined
        });
      } else {
        // 생성
        const request: CreateCouponRequest = {
          code: formData.code,
          name: formData.name,
          discountType: formData.discountType,
          discountValue: parseInt(formData.discountValue),
          minPurchaseAmount: parseInt(formData.minPurchaseAmount),
          maxDiscountAmount: formData.maxDiscountAmount ? parseInt(formData.maxDiscountAmount) : undefined,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          usageLimit: parseInt(formData.usageLimit),
          description: formData.description || undefined
        };
        await createCoupon(request);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || '쿠폰 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#1f1f23', color: '#fafafa', borderBottom: '1px solid #27272a' }}>
        {editingCoupon ? '쿠폰 수정' : '새 쿠폰 등록'}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: '#0f0f11', color: '#fafafa', pt: 3 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 쿠폰 코드 (생성시만) */}
          {!editingCoupon && (
            <TextField
              label="쿠폰 코드"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              error={!!errors.code}
              helperText={errors.code || '영문 대문자와 숫자만 사용 (예: SUMMER2024)'}
              required
              fullWidth
              sx={{
                '& .MuiInputBase-root': { color: '#fafafa', backgroundColor: '#1f1f23' },
                '& .MuiInputLabel-root': { color: '#a1a1aa' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#27272a' },
                  '&:hover fieldset': { borderColor: '#3f3f46' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                }
              }}
            />
          )}

          {/* 쿠폰명 */}
          <TextField
            label="쿠폰명"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
            fullWidth
            sx={{
              '& .MuiInputBase-root': { color: '#fafafa', backgroundColor: '#1f1f23' },
              '& .MuiInputLabel-root': { color: '#a1a1aa' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#27272a' },
                '&:hover fieldset': { borderColor: '#3f3f46' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />

          {/* 할인 타입 */}
          <FormControl fullWidth error={!!errors.discountType}>
            <InputLabel sx={{ color: '#a1a1aa' }}>할인 타입</InputLabel>
            <Select
              value={formData.discountType}
              onChange={(e) => handleChange('discountType', e.target.value)}
              label="할인 타입"
              sx={{
                color: '#fafafa',
                backgroundColor: '#1f1f23',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#27272a' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3f3f46' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' }
              }}
            >
              <MenuItem value="PERCENTAGE">퍼센트 할인 (%)</MenuItem>
              <MenuItem value="FIXED_AMOUNT">고정 금액 할인 (원)</MenuItem>
            </Select>
            {errors.discountType && <FormHelperText>{errors.discountType}</FormHelperText>}
          </FormControl>

          {/* 할인 값 */}
          <TextField
            label="할인 값"
            type="number"
            value={formData.discountValue}
            onChange={(e) => handleChange('discountValue', e.target.value)}
            error={!!errors.discountValue}
            helperText={errors.discountValue}
            required
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ color: '#a1a1aa' }}>
                  {formData.discountType === 'PERCENTAGE' ? '%' : '원'}
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': { color: '#fafafa', backgroundColor: '#1f1f23' },
              '& .MuiInputLabel-root': { color: '#a1a1aa' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#27272a' },
                '&:hover fieldset': { borderColor: '#3f3f46' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />

          {/* 최소 구매 금액 */}
          <TextField
            label="최소 구매 금액"
            type="number"
            value={formData.minPurchaseAmount}
            onChange={(e) => handleChange('minPurchaseAmount', e.target.value)}
            error={!!errors.minPurchaseAmount}
            helperText={errors.minPurchaseAmount}
            required
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end" sx={{ color: '#a1a1aa' }}>원</InputAdornment>
            }}
            sx={{
              '& .MuiInputBase-root': { color: '#fafafa', backgroundColor: '#1f1f23' },
              '& .MuiInputLabel-root': { color: '#a1a1aa' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#27272a' },
                '&:hover fieldset': { borderColor: '#3f3f46' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />

          {/* 최대 할인 금액 (선택) */}
          {formData.discountType === 'PERCENTAGE' && (
            <TextField
              label="최대 할인 금액 (선택)"
              type="number"
              value={formData.maxDiscountAmount}
              onChange={(e) => handleChange('maxDiscountAmount', e.target.value)}
              error={!!errors.maxDiscountAmount}
              helperText={errors.maxDiscountAmount || '퍼센트 할인의 최대 금액을 제한합니다'}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end" sx={{ color: '#a1a1aa' }}>원</InputAdornment>
              }}
              sx={{
                '& .MuiInputBase-root': { color: '#fafafa', backgroundColor: '#1f1f23' },
                '& .MuiInputLabel-root': { color: '#a1a1aa' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#27272a' },
                  '&:hover fieldset': { borderColor: '#3f3f46' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                }
              }}
            />
          )}

          {/* 시작 날짜 */}
          <TextField
            label="시작 날짜"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            error={!!errors.startDate}
            helperText={errors.startDate}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputBase-root': { color: '#fafafa', backgroundColor: '#1f1f23' },
              '& .MuiInputLabel-root': { color: '#a1a1aa' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#27272a' },
                '&:hover fieldset': { borderColor: '#3f3f46' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />

          {/* 종료 날짜 */}
          <TextField
            label="종료 날짜"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            error={!!errors.endDate}
            helperText={errors.endDate}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputBase-root': { color: '#fafafa', backgroundColor: '#1f1f23' },
              '& .MuiInputLabel-root': { color: '#a1a1aa' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#27272a' },
                '&:hover fieldset': { borderColor: '#3f3f46' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />

          {/* 사용 제한 수량 (선착순 인원) */}
          <TextField
            label="사용 제한 수량 (선착순 인원)"
            type="number"
            value={formData.usageLimit}
            onChange={(e) => handleChange('usageLimit', e.target.value)}
            error={!!errors.usageLimit}
            helperText={errors.usageLimit || '선착순으로 쿠폰을 받을 수 있는 최대 인원 수'}
            required
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end" sx={{ color: '#a1a1aa' }}>명</InputAdornment>
            }}
            sx={{
              '& .MuiInputBase-root': { color: '#fafafa', backgroundColor: '#1f1f23' },
              '& .MuiInputLabel-root': { color: '#a1a1aa' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#27272a' },
                '&:hover fieldset': { borderColor: '#3f3f46' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />

          {/* 설명 */}
          <TextField
            label="설명 (선택)"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            multiline
            rows={3}
            sx={{
              '& .MuiInputBase-root': { color: '#fafafa', backgroundColor: '#1f1f23' },
              '& .MuiInputLabel-root': { color: '#a1a1aa' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#27272a' },
                '&:hover fieldset': { borderColor: '#3f3f46' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />

          {/* 활성 상태 (수정시만) */}
          {editingCoupon && (
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#a1a1aa' }}>활성 상태</InputLabel>
              <Select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => handleChange('isActive', e.target.value === 'true')}
                label="활성 상태"
                sx={{
                  color: '#fafafa',
                  backgroundColor: '#1f1f23',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#27272a' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3f3f46' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' }
                }}
              >
                <MenuItem value="true">활성</MenuItem>
                <MenuItem value="false">비활성</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: '#1f1f23', borderTop: '1px solid #27272a', p: 2 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            color: '#a1a1aa',
            '&:hover': { backgroundColor: '#27272a' }
          }}
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="contained"
          sx={{
            backgroundColor: '#3b82f6',
            color: '#fafafa',
            '&:hover': { backgroundColor: '#2563eb' },
            '&:disabled': { backgroundColor: '#27272a', color: '#52525b' }
          }}
        >
          {isSubmitting ? '저장 중...' : (editingCoupon ? '수정' : '생성')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CouponModal;
