import React, { useState, useEffect } from 'react';
import {
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import CouponModal from '../../components/CouponModal';
import { Coupon, getAllCoupons, deleteCoupon } from '../../services/couponService';

// 날짜 포맷 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const CouponMaster = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // 쿠폰 목록 로드
  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await getAllCoupons();
      setCoupons(response);
    } catch (error) {
      console.error('쿠폰 목록 로드 중 오류:', error);
      setAlertMessage({type: 'error', message: '쿠폰 목록을 불러오는데 실패했습니다.'});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // 쿠폰 추가/수정 모달 열기
  const handleOpenModal = (coupon?: Coupon) => {
    setEditingCoupon(coupon || null);
    setModalOpen(true);
  };

  // 쿠폰 삭제
  const handleDelete = async (couponId: number) => {
    if (!confirm('정말 이 쿠폰을 삭제하시겠습니까?')) return;

    try {
      await deleteCoupon(couponId);
      setAlertMessage({type: 'success', message: '쿠폰이 삭제되었습니다.'});
      loadCoupons();
    } catch (error: any) {
      console.error('쿠폰 삭제 중 오류:', error);
      setAlertMessage({type: 'error', message: error.message || '쿠폰 삭제에 실패했습니다.'});
    }

    setTimeout(() => setAlertMessage(null), 3000);
  };

  // 쿠폰 생성/수정 성공 핸들러
  const handleCouponSuccess = () => {
    setAlertMessage({type: 'success', message: editingCoupon ? '쿠폰이 수정되었습니다.' : '쿠폰이 생성되었습니다.'});
    loadCoupons();
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // 필터링된 쿠폰 목록
  const filteredCoupons = coupons.filter(coupon => {
    if (filterStatus === 'ACTIVE') return coupon.isActive;
    if (filterStatus === 'INACTIVE') return !coupon.isActive;
    return true;
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        backgroundColor: '#0f0f11',
        color: '#fafafa'
      }}>
        <CircularProgress size={60} />
        <div style={{ marginLeft: '10px', fontSize: '18px' }}>쿠폰 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#0f0f11',
      minHeight: '100vh',
      color: '#fafafa'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          margin: 0,
          color: '#fafafa'
        }}>
          쿠폰 관리
        </h1>
        <button
          onClick={() => handleOpenModal()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: '#fafafa',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AddIcon sx={{ fontSize: '18px' }} />
          새 쿠폰 등록
        </button>
      </div>

      {alertMessage && (
        <Alert
          severity={alertMessage.type}
          sx={{ mb: 2 }}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage.message}
        </Alert>
      )}

      {/* 필터 버튼 */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as typeof filterStatus)}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === status ? '#3b82f6' : '#1f1f23',
              color: '#fafafa',
              border: '1px solid #27272a',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: filterStatus === status ? 'bold' : 'normal'
            }}
          >
            {status === 'ALL' ? '전체' : status === 'ACTIVE' ? '활성' : '비활성'}
          </button>
        ))}
      </div>

      {/* 쿠폰 통계 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#1f1f23',
          border: '1px solid #27272a',
          borderRadius: '4px'
        }}>
          <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>총 쿠폰 수</div>
          <div style={{ color: '#fafafa', fontSize: '24px', fontWeight: 'bold' }}>{coupons.length}개</div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#1f1f23',
          border: '1px solid #27272a',
          borderRadius: '4px'
        }}>
          <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>활성 쿠폰</div>
          <div style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>
            {coupons.filter(c => c.isActive).length}개
          </div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#1f1f23',
          border: '1px solid #27272a',
          borderRadius: '4px'
        }}>
          <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>총 사용 횟수</div>
          <div style={{ color: '#fafafa', fontSize: '24px', fontWeight: 'bold' }}>
            {coupons.reduce((sum, c) => sum + c.usedCount, 0)}회
          </div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#1f1f23',
          border: '1px solid #27272a',
          borderRadius: '4px'
        }}>
          <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>사용률</div>
          <div style={{ color: '#fafafa', fontSize: '24px', fontWeight: 'bold' }}>
            {coupons.length > 0
              ? ((coupons.reduce((sum, c) => sum + c.usedCount, 0) /
                  coupons.reduce((sum, c) => sum + c.usageLimit, 0)) * 100).toFixed(1)
              : 0}%
          </div>
        </div>
      </div>

      {/* 쿠폰 목록 */}
      <div style={{
        backgroundColor: '#1f1f23',
        border: '1px solid #27272a',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        {filteredCoupons.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#a1a1aa'
          }}>
            등록된 쿠폰이 없습니다.
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
            color: '#fafafa'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#27272a' }}>
                <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>쿠폰 코드</th>
                <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>쿠폰명</th>
                <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>할인</th>
                <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>사용 현황</th>
                <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>유효 기간</th>
                <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>상태</th>
                <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'center', fontWeight: 'bold' }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      color: '#3b82f6',
                      fontWeight: 'bold'
                    }}>
                      {coupon.code}
                    </div>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {coupon.name}
                    </div>
                    {coupon.description && (
                      <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                        {coupon.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                    <div style={{ fontWeight: 'bold', color: '#10b981' }}>
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}%`
                        : `${coupon.discountValue.toLocaleString()}원`}
                    </div>
                    <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
                      최소 {coupon.minPurchaseAmount.toLocaleString()}원
                    </div>
                    {coupon.maxDiscountAmount && (
                      <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
                        최대 {coupon.maxDiscountAmount.toLocaleString()}원
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                    <div style={{ fontSize: '13px' }}>
                      {coupon.usedCount} / {coupon.usageLimit}
                    </div>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: '#3f3f46',
                      borderRadius: '2px',
                      marginTop: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(coupon.usedCount / coupon.usageLimit) * 100}%`,
                        height: '100%',
                        backgroundColor: '#3b82f6',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                    <div style={{ fontSize: '12px' }}>
                      {formatDate(coupon.startDate)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                      ~ {formatDate(coupon.endDate)}
                    </div>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: coupon.isActive ? '#27272a' : '#27272a',
                      color: coupon.isActive ? '#10b981' : '#a1a1aa',
                      border: `1px solid ${coupon.isActive ? '#10b981' : '#3f3f46'}`,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {coupon.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(coupon)}
                        sx={{
                          color: '#3b82f6',
                          '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' }
                        }}
                      >
                        <EditIcon sx={{ fontSize: '18px' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(coupon.id)}
                        sx={{
                          color: '#ef4444',
                          '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: '18px' }} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 쿠폰 추가/수정 모달 */}
      <CouponModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCoupon(null);
        }}
        onSuccess={handleCouponSuccess}
        editingCoupon={editingCoupon}
      />
    </div>
  );
};

export default CouponMaster;
