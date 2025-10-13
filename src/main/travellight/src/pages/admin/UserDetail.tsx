import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  CircularProgress
} from '@mui/material';
import { adminUserService, AdminUserResponse, claimService, ClaimResponse, activityLogService, ActivityLogDto, paymentService, type PaymentDto } from '../../services/api';
import { getMyReservations } from '../../services/reservationService';
import { ReservationDto } from '../../types/reservation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// 역할 표시 함수
const getRoleDisplayName = (role: string) => {
  const roleMap: { [key: string]: string } = {
    'ADMIN': '관리자',
    'USER': '일반사용자',
    'PARTNER': '파트너 사용자',
    'WAIT': '승인대기중'
  };
  return roleMap[role] || role;
};

// 날짜 포맷 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 날짜시간 포맷 함수
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const UserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<AdminUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<AdminUserResponse>>({});
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [claimAssignee, setClaimAssignee] = useState('');
  const [claimText, setClaimText] = useState('');
  const [claims, setClaims] = useState<ClaimResponse[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [customerStats, setCustomerStats] = useState({
    totalPurchaseAmount: 0,
    totalReservations: 0,
    returnVisits: 0,
    lastUsedDate: null as string | null
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLogDto[]>([]);
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(false);
  const [activityLogFilter, setActivityLogFilter] = useState<string>('ALL');
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // 사용자 정보 로드
  const loadUser = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      // TODO: 개별 사용자 조회 API가 있다면 사용, 없으면 전체 목록에서 찾기
      const response = await adminUserService.getAllUsers();
      if (response.success) {
        const foundUser = response.data.find(u => u.id === parseInt(userId));
        if (foundUser) {
          setUser(foundUser);
          setEditData(foundUser);
        } else {
          setAlertMessage({type: 'error', message: '사용자를 찾을 수 없습니다.'});
        }
      }
    } catch (error) {
      console.error('사용자 정보 로드 중 오류:', error);
      setAlertMessage({type: 'error', message: '사용자 정보를 불러오는데 실패했습니다.'});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  // 클레임내역 탭이 활성화될 때 클레임 목록 로드
  useEffect(() => {
    if (tabValue === 4) {
      loadClaims();
    }
  }, [tabValue, userId]);

  // 예약분석 탭이 활성화될 때 예약 목록 로드
  useEffect(() => {
    if (tabValue === 1) {
      loadReservations();
    }
  }, [tabValue, userId]);

  // 결제분석 탭이 활성화될 때 결제 목록 로드
  useEffect(() => {
    if (tabValue === 2) {
      loadPayments();
    }
  }, [tabValue, userId]);

  // 활동로그 탭이 활성화될 때 로그 목록 로드
  useEffect(() => {
    if (tabValue === 5) {
      loadActivityLogs();
    }
  }, [tabValue, userId, activityLogFilter]);

  // 사용자 정보가 로드되면 고객 통계 계산
  useEffect(() => {
    if (user) {
      calculateCustomerStats();
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // 취소
      setEditData(user || {});
    }
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    // TODO: 사용자 정보 업데이트 API 호출
    console.log('저장할 데이터:', editData);
    setEditMode(false);
    setAlertMessage({type: 'success', message: '사용자 정보가 업데이트되었습니다.'});
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleInputChange = (field: keyof AdminUserResponse, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 클레임 목록 로드
  const loadClaims = async () => {
    if (!userId) return;
    
    try {
      setLoadingClaims(true);
      const response = await claimService.getClaimsByUserId(parseInt(userId));
      if (response.success) {
        setClaims(response.data);
      }
    } catch (error) {
      console.error('클레임 목록 로드 중 오류:', error);
    } finally {
      setLoadingClaims(false);
    }
  };

  // 예약 목록 로드
  const loadReservations = async () => {
    if (!userId) return;

    try {
      setLoadingReservations(true);
      const reservationData = await getMyReservations(parseInt(userId));
      setReservations(reservationData);
    } catch (error) {
      console.error('예약 목록 로드 중 오류:', error);
    } finally {
      setLoadingReservations(false);
    }
  };

  // 결제 목록 로드
  const loadPayments = async () => {
    if (!userId) {
      console.log('userId가 없습니다');
      return;
    }

    try {
      console.log('결제 목록 로드 시작 - userId:', userId);
      setLoadingPayments(true);
      const response = await paymentService.getPaymentsByUserId(parseInt(userId));
      console.log('결제 API 응답:', response);
      if (response.success) {
        console.log('결제 데이터:', response.data);
        setPayments(response.data);
      } else {
        console.log('API 응답 실패:', response);
      }
    } catch (error) {
      console.error('결제 목록 로드 중 오류:', error);
      setAlertMessage({type: 'error', message: '결제 목록을 불러오는데 실패했습니다.'});
    } finally {
      setLoadingPayments(false);
    }
  };

  // 활동 로그 목록 로드
  const loadActivityLogs = async () => {
    if (!userId) return;

    try {
      setLoadingActivityLogs(true);
      const params: any = {
        userId: parseInt(userId),
        days: 30,
        page: 0,
        size: 100
      };

      // 필터 적용
      if (activityLogFilter !== 'ALL') {
        params.actionCategory = activityLogFilter;
      }

      const response = await activityLogService.getActivityLogs(params);
      if (response.success) {
        setActivityLogs(response.data);
      }
    } catch (error) {
      console.error('활동 로그 로드 중 오류:', error);
    } finally {
      setLoadingActivityLogs(false);
    }
  };

  // 고객 통계 계산
  const calculateCustomerStats = async () => {
    if (!userId) return;
    
    try {
      const reservationData = await getMyReservations(parseInt(userId));
      
      // 총 구매 금액 계산
      const totalPurchaseAmount = reservationData.reduce((sum, reservation) => {
        return sum + reservation.totalPrice;
      }, 0);
      
      // 총 예약 횟수
      const totalReservations = reservationData.length;
      
      // 재방문 횟수 계산 (같은 매장을 여러 번 이용한 경우)
      const placeVisits = new Map<string, number>();
      reservationData.forEach(reservation => {
        const placeKey = `${reservation.placeName}-${reservation.placeAddress}`;
        placeVisits.set(placeKey, (placeVisits.get(placeKey) || 0) + 1);
      });
      
      const returnVisits = Array.from(placeVisits.values())
        .filter(count => count > 1)
        .reduce((sum, count) => sum + (count - 1), 0);
      
      // 최근 이용일 계산 (가장 최신 결제일 - created_at 기준)
      const paidReservations = reservationData
        .filter(r => r.paymentId && r.paymentId.trim() !== '' && r.createdAt) // 결제가 완료되고 createdAt이 있는 예약만
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
      
      const lastUsedDate = paidReservations.length > 0 
        ? paidReservations[0].createdAt 
        : null;
      
      setCustomerStats({
        totalPurchaseAmount,
        totalReservations,
        returnVisits,
        lastUsedDate
      });
    } catch (error) {
      console.error('고객 통계 계산 중 오류:', error);
    }
  };

  const handleClaimSubmit = async () => {
    if (!claimAssignee || !claimText.trim()) {
      setAlertMessage({type: 'error', message: '담당자와 클레임 내용을 모두 입력해주세요.'});
      return;
    }
    
    if (!userId) {
      setAlertMessage({type: 'error', message: '사용자 정보를 찾을 수 없습니다.'});
      return;
    }
    
    try {
      const response = await claimService.createClaim({
        userId: parseInt(userId),
        assignee: claimAssignee,
        content: claimText
      });
      
      if (response.success) {
        setAlertMessage({type: 'success', message: '클레임이 저장되었습니다.'});
        setClaimAssignee('');
        setClaimText('');
        // 클레임 목록 새로고침
        loadClaims();
      } else {
        setAlertMessage({type: 'error', message: '클레임 저장에 실패했습니다.'});
      }
    } catch (error) {
      console.error('클레임 저장 중 오류:', error);
      setAlertMessage({type: 'error', message: '클레임 저장 중 오류가 발생했습니다.'});
    }
    
    setTimeout(() => setAlertMessage(null), 3000);
  };

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
        <div style={{ marginLeft: '10px', fontSize: '18px' }}>사용자 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        padding: '20px',
        backgroundColor: '#0f0f11',
        minHeight: '100vh'
      }}>
        <Alert severity="error">사용자를 찾을 수 없습니다.</Alert>
        <button 
          onClick={() => navigate('/admin/users')}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← 사용자 목록으로 돌아가기
        </button>
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
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#fafafa'
      }}>
        사용자 상세 정보
      </h1>

      {alertMessage && (
        <Alert 
          severity={alertMessage.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage.message}
        </Alert>
      )}

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '20px',
        gap: '10px'
      }}>
        <button 
          onClick={() => navigate('/admin/users')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1f1f23',
            color: '#fafafa',
            border: '1px solid #27272a',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← 목록으로 돌아가기
        </button>
      </div>

      {/* 사용자 기본 정보 헤더 */}
      <div style={{ 
        padding: '20px', 
        marginBottom: '20px',
        backgroundColor: '#1f1f23',
        border: '1px solid #27272a',
        borderRadius: '4px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '15px' 
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#fafafa',
            border: '1px solid #3f3f46',
            borderRadius: '4px'
          }}>
            {user.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              color: '#fafafa'
            }}>
              {user.name}
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginBottom: '8px' 
            }}>
              <span style={{
                padding: '4px 8px',
                backgroundColor: '#27272a',
                color: '#fafafa',
                border: '1px solid #3f3f46',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {getRoleDisplayName(user.role)}
              </span>
              <span style={{
                padding: '4px 8px',
                color: '#fafafa',
                border: '1px solid #3f3f46',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor: '#27272a'
              }}>
                {user.status}
              </span>
            </div>
            <div style={{ 
              color: '#a1a1aa',
              fontSize: '14px'
            }}>
              이메일: {user.email} | 가입일: {formatDate(user.createdAt)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {editMode ? (
              <>
                <button 
                  onClick={handleSave}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1f1f23',
                    color: '#fafafa',
                    border: '1px solid #27272a',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  저장
                </button>
                <button 
                  onClick={handleEditToggle}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1f1f23',
                    color: '#fafafa',
                    border: '1px solid #27272a',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  취소
                </button>
              </>
            ) : (
              <button 
                onClick={handleEditToggle}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1f1f23',
                  color: '#fafafa',
                  border: '1px solid #27272a',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                편집
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{ 
        borderRadius: '4px',
        backgroundColor: '#1f1f23',
        border: '1px solid #27272a'
      }}>
        <div style={{ 
          borderBottom: '1px solid #27272a',
          display: 'flex'
        }}>
          {['고객정보', '예약분석', '결제내역', '결제분석', '마케팅', '클레임내역', '활동로그'].map((label, index) => (
            <button
              key={index}
              onClick={() => setTabValue(index)}
              style={{
                padding: '12px 16px',
                backgroundColor: tabValue === index ? '#27272a' : '#1f1f23',
                color: '#fafafa',
                border: '1px solid #27272a',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: tabValue === index ? 'bold' : 'normal'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 고객정보 탭 */}
        <TabPanel value={tabValue} index={0}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div style={{ 
                height: '100%',
                backgroundColor: '#1f1f23',
                border: '1px solid #27272a',
                borderRadius: '4px',
                padding: '20px'
              }}>
                <h3 style={{ 
                  marginBottom: '15px',
                  color: '#fafafa',
                  fontSize: '16px',
                  margin: '0 0 15px 0',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #27272a',
                  paddingBottom: '10px'
                }}>
                  기본 정보
                </h3>
                
                <div>
                  <div style={{ marginBottom: '15px', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '5px' }}>이름</div>
                    {editMode ? (
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          backgroundColor: '#27272a',
                          color: '#fafafa',
                          border: '1px solid #3f3f46',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      <div style={{ color: '#fafafa', fontSize: '16px' }}>{user.name}</div>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '15px', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '5px' }}>이메일</div>
                    {editMode ? (
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          backgroundColor: '#27272a',
                          color: '#fafafa',
                          border: '1px solid #3f3f46',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      <div style={{ color: '#fafafa', fontSize: '16px' }}>{user.email}</div>
                    )}
                  </div>

                  <div style={{ marginBottom: '15px', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '5px' }}>고객 ID</div>
                    <div style={{ color: '#fafafa', fontSize: '16px' }}>{`USER-${String(user.id).padStart(6, '0')}`}</div>
                  </div>

                  <div style={{ marginBottom: '15px', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '5px' }}>가입일</div>
                    <div style={{ color: '#fafafa', fontSize: '16px' }}>{formatDate(user.createdAt)}</div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '5px' }}>고객 등급</div>
                    <div style={{ color: '#fafafa', fontSize: '16px' }}>{user.role === 'PARTNER' ? 'VIP 고객' : '일반 고객'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flex: '1', minWidth: '300px' }}>
              <div style={{ 
                height: '100%',
                backgroundColor: '#1f1f23',
                border: '1px solid #27272a',
                borderRadius: '4px',
                padding: '20px'
              }}>
                <h3 style={{ 
                  marginBottom: '15px',
                  color: '#fafafa',
                  fontSize: '16px',
                  margin: '0 0 15px 0',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #27272a',
                  paddingBottom: '10px'
                }}>
                  고객 가치
                </h3>
                
                <div>
                  <div style={{ marginBottom: '15px', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '5px' }}>총 구매 금액</div>
                    <div style={{ color: '#fafafa', fontSize: '16px' }}>
                      {customerStats.totalPurchaseAmount.toLocaleString()}원
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '5px' }}>총 예약 횟수</div>
                    <div style={{ color: '#fafafa', fontSize: '16px' }}>
                      {customerStats.totalReservations}회
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '5px' }}>재방문 횟수</div>
                    <div style={{ color: '#fafafa', fontSize: '16px' }}>
                      {customerStats.returnVisits}회
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px', borderBottom: '1px solid #27272a', paddingBottom: '10px' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '5px' }}>최근 이용일</div>
                    <div style={{ color: '#fafafa', fontSize: '16px' }}>
                      {customerStats.lastUsedDate ? formatDate(customerStats.lastUsedDate) : '이용 내역 없음'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '5px' }}>고객 활성도</div>
                    <div style={{ color: '#fafafa', fontSize: '16px' }}>
                      {customerStats.totalReservations > 0 ? '활성 고객' : '신규 고객'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* 예약분석 탭 */}
        <TabPanel value={tabValue} index={1}>
          <div style={{ 
            backgroundColor: '#1f1f23',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '20px'
          }}>
            <h3 style={{ 
              marginBottom: '15px',
              color: '#fafafa',
              fontSize: '16px',
              margin: '0 0 15px 0',
              fontWeight: 'bold',
              borderBottom: '1px solid #27272a',
              paddingBottom: '10px'
            }}>
              예약 분석
            </h3>
            
            {loadingReservations ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                color: '#a1a1aa',
                fontSize: '14px'
              }}>
                <CircularProgress size={20} />
                예약 내역을 불러오는 중...
              </div>
            ) : reservations.length === 0 ? (
              <div style={{ color: '#a1a1aa', fontSize: '14px' }}>
                예약 내역이 없습니다.
              </div>
            ) : (
              <div>
                {/* 예약 통계 */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    padding: '15px',
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '5px' }}>총 예약 횟수</div>
                    <div style={{ color: '#fafafa', fontSize: '18px', fontWeight: 'bold' }}>{reservations.length}회</div>
                  </div>
                  <div style={{ 
                    padding: '15px',
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '5px' }}>총 결제 금액</div>
                    <div style={{ color: '#fafafa', fontSize: '18px', fontWeight: 'bold' }}>
                      {reservations.reduce((sum, r) => sum + r.totalPrice, 0).toLocaleString()}원
                    </div>
                  </div>
                  <div style={{ 
                    padding: '15px',
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '5px' }}>완료된 예약</div>
                    <div style={{ color: '#fafafa', fontSize: '18px', fontWeight: 'bold' }}>
                      {reservations.filter(r => r.status === 'COMPLETED').length}회
                    </div>
                  </div>
                  <div style={{ 
                    padding: '15px',
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '5px' }}>취소된 예약</div>
                    <div style={{ color: '#fafafa', fontSize: '18px', fontWeight: 'bold' }}>
                      {reservations.filter(r => r.status === 'CANCELLED').length}회
                    </div>
                  </div>
                </div>

                {/* 예약 내역 테이블 */}
                <div style={{ 
                  backgroundColor: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '14px',
                    color: '#fafafa'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1f1f23' }}>
                        <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>예약번호</th>
                        <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>매장명</th>
                        <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>보관 기간</th>
                        <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>가방 수량</th>
                        <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>결제 금액</th>
                        <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>상태</th>
                        <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>예약일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((reservation) => (
                        <tr key={reservation.id}>
                          <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                            <div style={{ 
                              fontFamily: 'monospace', 
                              fontSize: '12px',
                              color: '#3b82f6'
                            }}>
                              {reservation.reservationNumber}
                            </div>
                          </td>
                          <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                              {reservation.placeName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                              {reservation.placeAddress}
                            </div>
                          </td>
                          <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                            <div style={{ fontSize: '12px' }}>
                              {formatDate(reservation.storageDate)} ~ {formatDate(reservation.storageEndDate)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                              {reservation.storageStartTime} ~ {reservation.storageEndTime}
                            </div>
                          </td>
                          <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                            <div style={{ fontSize: '12px' }}>
                              소: {reservation.smallBags}개
                            </div>
                            <div style={{ fontSize: '12px' }}>
                              중: {reservation.mediumBags}개
                            </div>
                            <div style={{ fontSize: '12px' }}>
                              대: {reservation.largeBags}개
                            </div>
                          </td>
                          <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                            <div style={{ fontWeight: 'bold' }}>
                              {reservation.totalPrice.toLocaleString()}원
                            </div>
                            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                              {reservation.storageType === 'day' ? '일일 보관' : '기간 보관'}
                            </div>
                          </td>
                          <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                            <span style={{
                              padding: '4px 8px',
                              backgroundColor: reservation.status === 'COMPLETED' ? '#27272a' : 
                                              reservation.status === 'CANCELLED' ? '#27272a' : '#27272a',
                              color: reservation.status === 'COMPLETED' ? '#8c8' : 
                                     reservation.status === 'CANCELLED' ? '#f87171' : '#fafafa',
                              border: `1px solid ${reservation.status === 'COMPLETED' ? '#8c8' : 
                                               reservation.status === 'CANCELLED' ? '#f87171' : '#3f3f46'}`,
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              {reservation.status === 'RESERVED' ? '예약됨' : 
                               reservation.status === 'COMPLETED' ? '완료' : '취소됨'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                            <div style={{ fontSize: '12px' }}>
                              {formatDateTime(reservation.storageDate)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </TabPanel>

        {/* 결제분석 탭 */}
        <TabPanel value={tabValue} index={2}>
          <div style={{
            backgroundColor: '#1f1f23',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '20px'
          }}>
            <h3 style={{
              marginBottom: '15px',
              color: '#fafafa',
              fontSize: '16px',
              margin: '0 0 15px 0',
              fontWeight: 'bold',
              borderBottom: '1px solid #27272a',
              paddingBottom: '10px'
            }}>
              결제 내역
            </h3>

            {loadingPayments ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#a1a1aa',
                fontSize: '14px'
              }}>
                <CircularProgress size={20} />
                결제 내역을 불러오는 중...
              </div>
            ) : payments.length === 0 ? (
              <div style={{ color: '#a1a1aa', fontSize: '14px' }}>
                결제 내역이 없습니다.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    style={{
                      padding: '20px',
                      backgroundColor: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '4px'
                    }}
                  >
                    {/* 결제 상태 및 금액 */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '15px',
                      paddingBottom: '15px',
                      borderBottom: '1px solid #3f3f46'
                    }}>
                      <div>
                        <div style={{
                          color: '#fafafa',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          marginBottom: '8px'
                        }}>
                          {(payment.paymentAmount || 0).toLocaleString()}원
                        </div>
                        <div style={{
                          color: '#a1a1aa',
                          fontSize: '12px'
                        }}>
                          {payment.paymentTime ? formatDateTime(payment.paymentTime) : '-'}
                        </div>
                      </div>
                      <span style={{
                        padding: '6px 12px',
                        backgroundColor: '#1f1f23',
                        color: payment.paymentStatus === 'PAID' ? '#10b981' :
                               payment.paymentStatus === 'CANCELLED' ? '#f87171' :
                               payment.paymentStatus === 'REFUNDED' ? '#f59e0b' :
                               payment.paymentStatus === 'FAILED' ? '#ef4444' : '#fafafa',
                        border: `1px solid ${payment.paymentStatus === 'PAID' ? '#10b981' :
                                         payment.paymentStatus === 'CANCELLED' ? '#f87171' :
                                         payment.paymentStatus === 'REFUNDED' ? '#f59e0b' :
                                         payment.paymentStatus === 'FAILED' ? '#ef4444' : '#3f3f46'}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {payment.paymentStatus}
                      </span>
                    </div>

                    {/* 결제 정보 그리드 */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '12px'
                    }}>
                      {/* 결제 ID */}
                      <div>
                        <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                          결제 ID
                        </div>
                        <div style={{
                          color: '#3b82f6',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          wordBreak: 'break-all'
                        }}>
                          {payment.paymentId}
                        </div>
                      </div>

                      {/* 결제 수단 */}
                      <div>
                        <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                          결제 수단
                        </div>
                        <div style={{ color: '#fafafa', fontSize: '13px' }}>
                          {payment.paymentMethod === 'card' ? '카드' :
                           payment.paymentMethod === 'easypay' ? '간편결제' :
                           payment.paymentMethod || '-'}
                        </div>
                      </div>

                      {/* 카드사 */}
                      {payment.cardCompany && (
                        <div>
                          <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                            카드사
                          </div>
                          <div style={{ color: '#fafafa', fontSize: '13px' }}>
                            {payment.cardCompany}
                          </div>
                        </div>
                      )}

                      {/* 카드 타입 */}
                      {payment.cardType && (
                        <div>
                          <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                            카드 타입
                          </div>
                          <div style={{ color: '#fafafa', fontSize: '13px' }}>
                            {payment.cardType}
                          </div>
                        </div>
                      )}

                      {/* 카드 번호 */}
                      {payment.cardNumber && (
                        <div>
                          <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                            카드 번호
                          </div>
                          <div style={{
                            color: '#a1a1aa',
                            fontSize: '12px',
                            fontFamily: 'monospace'
                          }}>
                            {payment.cardNumber}
                          </div>
                        </div>
                      )}

                      {/* 카드명 */}
                      {payment.cardName && (
                        <div>
                          <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                            카드명
                          </div>
                          <div style={{ color: '#fafafa', fontSize: '13px' }}>
                            {payment.cardName}
                          </div>
                        </div>
                      )}

                      {/* 할부 정보 */}
                      {payment.installmentMonth !== undefined && payment.installmentMonth !== null && (
                        <div>
                          <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                            할부
                          </div>
                          <div style={{ color: '#fafafa', fontSize: '13px' }}>
                            {payment.installmentMonth === 0 ? '일시불' : `${payment.installmentMonth}개월`}
                            {payment.isInterestFree && (
                              <span style={{
                                marginLeft: '6px',
                                color: '#10b981',
                                fontSize: '11px'
                              }}>
                                (무이자)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 승인번호 */}
                      {payment.approvalNumber && (
                        <div>
                          <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                            승인번호
                          </div>
                          <div style={{
                            color: '#fafafa',
                            fontSize: '12px',
                            fontFamily: 'monospace'
                          }}>
                            {payment.approvalNumber}
                          </div>
                        </div>
                      )}

                      {/* PG사 */}
                      {payment.paymentProvider && (
                        <div>
                          <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                            PG사
                          </div>
                          <div style={{ color: '#fafafa', fontSize: '13px' }}>
                            {payment.paymentProvider}
                            {payment.channelName && (
                              <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
                                {payment.channelName}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 간편결제 */}
                      {payment.easyPayProvider && (
                        <div>
                          <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                            간편결제
                          </div>
                          <div style={{ color: '#fafafa', fontSize: '13px' }}>
                            {payment.easyPayProvider}
                          </div>
                        </div>
                      )}

                      {/* 거래 ID */}
                      {payment.transactionId && (
                        <div>
                          <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>
                            거래 ID
                          </div>
                          <div style={{
                            color: '#a1a1aa',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all'
                          }}>
                            {payment.transactionId}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 취소/환불 정보 */}
                    {(payment.cancelReason || payment.refundAmount) && (
                      <div style={{
                        marginTop: '15px',
                        paddingTop: '15px',
                        borderTop: '1px solid #3f3f46'
                      }}>
                        {payment.refundAmount && (
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: '#a1a1aa', fontSize: '12px' }}>환불 금액: </span>
                            <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 'bold' }}>
                              {payment.refundAmount.toLocaleString()}원
                            </span>
                          </div>
                        )}
                        {payment.cancelReason && (
                          <div>
                            <span style={{ color: '#a1a1aa', fontSize: '12px' }}>취소/환불 사유: </span>
                            <span style={{ color: '#fafafa', fontSize: '12px' }}>
                              {payment.cancelReason}
                            </span>
                          </div>
                        )}
                        {payment.cancelledAt && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ color: '#a1a1aa', fontSize: '11px' }}>
                              취소일시: {formatDateTime(payment.cancelledAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        {/* 결제분석 탭 */}
        <TabPanel value={tabValue} index={3}>
          <div style={{
            backgroundColor: '#1f1f23',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '20px'
          }}>
            <h3 style={{
              marginBottom: '15px',
              color: '#fafafa',
              fontSize: '16px',
              margin: '0 0 15px 0',
              fontWeight: 'bold',
              borderBottom: '1px solid #27272a',
              paddingBottom: '10px'
            }}>
              결제 분석
            </h3>

            {loadingPayments ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#a1a1aa',
                fontSize: '14px'
              }}>
                <CircularProgress size={20} />
                결제 분석 데이터를 불러오는 중...
              </div>
            ) : payments.length === 0 ? (
              <div style={{ color: '#a1a1aa', fontSize: '14px' }}>
                결제 내역이 없어 분석을 수행할 수 없습니다.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 기본 통계 */}
                <div>
                  <h4 style={{
                    color: '#fafafa',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                  }}>
                    기본 통계
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    {(() => {
                      const totalAmount = payments.reduce((sum, p) => sum + (p.paymentAmount || 0), 0);
                      const paidPayments = payments.filter(p => p.paymentStatus === 'PAID');
                      const paymentCount = paidPayments.length;
                      const averageAmount = paymentCount > 0 ? Math.round(totalAmount / paymentCount) : 0;

                      // 결제 빈도 계산
                      let paymentFrequency = '-';
                      if (paidPayments.length >= 2) {
                        const sortedPayments = [...paidPayments]
                          .filter(p => p.paymentTime)
                          .sort((a, b) => new Date(a.paymentTime!).getTime() - new Date(b.paymentTime!).getTime());

                        if (sortedPayments.length >= 2) {
                          const firstPayment = new Date(sortedPayments[0].paymentTime!);
                          const lastPayment = new Date(sortedPayments[sortedPayments.length - 1].paymentTime!);
                          const daysDiff = Math.ceil((lastPayment.getTime() - firstPayment.getTime()) / (1000 * 60 * 60 * 24));

                          if (daysDiff > 0) {
                            const frequency = daysDiff / sortedPayments.length;
                            paymentFrequency = frequency < 7 ? `${Math.round(frequency)}일마다` :
                                              frequency < 30 ? `${Math.round(frequency / 7)}주마다` :
                                              `${Math.round(frequency / 30)}개월마다`;
                          }
                        }
                      } else if (paidPayments.length === 1) {
                        paymentFrequency = '첫 결제';
                      }

                      return (
                        <>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>총 결제 금액</div>
                            <div style={{ color: '#fafafa', fontSize: '20px', fontWeight: 'bold' }}>
                              {totalAmount.toLocaleString()}원
                            </div>
                          </div>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>평균 결제 금액</div>
                            <div style={{ color: '#fafafa', fontSize: '20px', fontWeight: 'bold' }}>
                              {averageAmount.toLocaleString()}원
                            </div>
                          </div>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>결제 건수</div>
                            <div style={{ color: '#fafafa', fontSize: '20px', fontWeight: 'bold' }}>
                              {paymentCount}건
                            </div>
                          </div>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>결제 빈도</div>
                            <div style={{ color: '#fafafa', fontSize: '20px', fontWeight: 'bold' }}>
                              {paymentFrequency}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 결제 방법별 분포 */}
                <div>
                  <h4 style={{
                    color: '#fafafa',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                  }}>
                    결제 방법별 분포
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px'
                  }}>
                    {(() => {
                      const methodCounts = payments.reduce((acc, p) => {
                        const method = p.paymentMethod || '기타';
                        acc[method] = (acc[method] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);

                      const total = payments.length;

                      return Object.entries(methodCounts).map(([method, count]) => {
                        const percentage = ((count / total) * 100).toFixed(1);
                        return (
                          <div key={method} style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '8px' }}>
                              {method === 'card' ? '카드' : method === 'easypay' ? '간편결제' : method}
                            </div>
                            <div style={{ color: '#fafafa', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                              {count}회
                            </div>
                            <div style={{ color: '#10b981', fontSize: '12px' }}>
                              {percentage}%
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* 결제 패턴 분석 */}
                <div>
                  <h4 style={{
                    color: '#fafafa',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                  }}>
                    결제 패턴 분석
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '12px'
                  }}>
                    {/* 결제 시간대 분포 */}
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '4px'
                    }}>
                      <div style={{ color: '#fafafa', fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>
                        결제 시간대 분포
                      </div>
                      {(() => {
                        const hourCounts = payments
                          .filter(p => p.paymentTime)
                          .reduce((acc, p) => {
                            const hour = new Date(p.paymentTime!).getHours();
                            const timeSlot = hour < 6 ? '새벽(00-06시)' :
                                           hour < 12 ? '오전(06-12시)' :
                                           hour < 18 ? '오후(12-18시)' : '저녁(18-24시)';
                            acc[timeSlot] = (acc[timeSlot] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);

                        return Object.entries(hourCounts).map(([timeSlot, count]) => (
                          <div key={timeSlot} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: '1px solid #3f3f46'
                          }}>
                            <span style={{ color: '#a1a1aa', fontSize: '12px' }}>{timeSlot}</span>
                            <span style={{ color: '#fafafa', fontSize: '12px', fontWeight: 'bold' }}>{count}회</span>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* 월별 결제 트렌드 */}
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '4px'
                    }}>
                      <div style={{ color: '#fafafa', fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>
                        월별 결제 트렌드
                      </div>
                      {(() => {
                        const monthCounts = payments
                          .filter(p => p.paymentTime)
                          .reduce((acc, p) => {
                            const date = new Date(p.paymentTime!);
                            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                            acc[month] = (acc[month] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);

                        return Object.entries(monthCounts)
                          .sort((a, b) => b[0].localeCompare(a[0]))
                          .slice(0, 6)
                          .map(([month, count]) => (
                            <div key={month} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '8px 0',
                              borderBottom: '1px solid #3f3f46'
                            }}>
                              <span style={{ color: '#a1a1aa', fontSize: '12px' }}>{month}</span>
                              <span style={{ color: '#fafafa', fontSize: '12px', fontWeight: 'bold' }}>{count}회</span>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* 결제 상태 분석 */}
                <div>
                  <h4 style={{
                    color: '#fafafa',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                  }}>
                    결제 상태 분석
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    {(() => {
                      const statusCounts = payments.reduce((acc, p) => {
                        acc[p.paymentStatus] = (acc[p.paymentStatus] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);

                      const total = payments.length;
                      const successCount = statusCounts['PAID'] || 0;
                      const failedCount = statusCounts['FAILED'] || 0;
                      const cancelledCount = statusCounts['CANCELLED'] || 0;
                      const refundedCount = statusCounts['REFUNDED'] || 0;

                      const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : '0';
                      const refundRate = successCount > 0 ? ((refundedCount / successCount) * 100).toFixed(1) : '0';

                      return (
                        <>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #10b981',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>성공</div>
                            <div style={{ color: '#10b981', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                              {successCount}건
                            </div>
                            <div style={{ color: '#10b981', fontSize: '11px' }}>
                              성공률 {successRate}%
                            </div>
                          </div>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #ef4444',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>실패</div>
                            <div style={{ color: '#ef4444', fontSize: '18px', fontWeight: 'bold' }}>
                              {failedCount}건
                            </div>
                          </div>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #f87171',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>취소</div>
                            <div style={{ color: '#f87171', fontSize: '18px', fontWeight: 'bold' }}>
                              {cancelledCount}건
                            </div>
                          </div>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #f59e0b',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>환불</div>
                            <div style={{ color: '#f59e0b', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                              {refundedCount}건
                            </div>
                            <div style={{ color: '#f59e0b', fontSize: '11px' }}>
                              환불률 {refundRate}%
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 고객 결제 특성 */}
                <div>
                  <h4 style={{
                    color: '#fafafa',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                  }}>
                    고객 결제 특성
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}>
                    {(() => {
                      const paidPayments = payments.filter(p => p.paymentStatus === 'PAID');
                      const totalAmount = paidPayments.reduce((sum, p) => sum + (p.paymentAmount || 0), 0);
                      const avgAmount = paidPayments.length > 0 ? Math.round(totalAmount / paidPayments.length) : 0;

                      // 재결제율 계산
                      const repeatRate = paidPayments.length > 1 ?
                        (((paidPayments.length - 1) / paidPayments.length) * 100).toFixed(1) : '0';

                      // 결제 증가율 계산 (최근 3개월 vs 이전 3개월)
                      const now = new Date();
                      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

                      const recentPayments = paidPayments.filter(p =>
                        p.paymentTime && new Date(p.paymentTime) >= threeMonthsAgo
                      );
                      const previousPayments = paidPayments.filter(p =>
                        p.paymentTime && new Date(p.paymentTime) >= sixMonthsAgo && new Date(p.paymentTime) < threeMonthsAgo
                      );

                      const recentAmount = recentPayments.reduce((sum, p) => sum + (p.paymentAmount || 0), 0);
                      const previousAmount = previousPayments.reduce((sum, p) => sum + (p.paymentAmount || 0), 0);

                      const growthRate = previousAmount > 0 ?
                        (((recentAmount - previousAmount) / previousAmount) * 100).toFixed(1) : '0';

                      // 충성도 점수 (0-100)
                      const loyaltyScore = Math.min(100, Math.round(
                        (paidPayments.length * 10) + // 결제 횟수
                        (parseFloat(repeatRate) * 0.5) + // 재결제율
                        (parseFloat(growthRate) > 0 ? Math.min(20, parseFloat(growthRate)) : 0) // 증가율
                      ));

                      return (
                        <>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>고객 등급별 평균</div>
                            <div style={{ color: '#fafafa', fontSize: '18px', fontWeight: 'bold' }}>
                              {avgAmount.toLocaleString()}원
                            </div>
                          </div>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>재결제율</div>
                            <div style={{ color: '#10b981', fontSize: '18px', fontWeight: 'bold' }}>
                              {repeatRate}%
                            </div>
                          </div>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #3f3f46',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>결제 증가율</div>
                            <div style={{
                              color: parseFloat(growthRate) >= 0 ? '#10b981' : '#ef4444',
                              fontSize: '18px',
                              fontWeight: 'bold'
                            }}>
                              {parseFloat(growthRate) >= 0 ? '+' : ''}{growthRate}%
                            </div>
                          </div>
                          <div style={{
                            padding: '16px',
                            backgroundColor: '#27272a',
                            border: '1px solid #8b5cf6',
                            borderRadius: '4px'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}>충성도 점수</div>
                            <div style={{ color: '#8b5cf6', fontSize: '18px', fontWeight: 'bold' }}>
                              {loyaltyScore}/100
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 비즈니스 인사이트 */}
                <div>
                  <h4 style={{
                    color: '#fafafa',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                  }}>
                    비즈니스 인사이트
                  </h4>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '4px'
                  }}>
                    {(() => {
                      const paidPayments = payments.filter(p => p.paymentStatus === 'PAID');

                      if (paidPayments.length === 0) {
                        return <div style={{ color: '#a1a1aa', fontSize: '13px' }}>분석할 데이터가 충분하지 않습니다.</div>;
                      }

                      // 최고/최저 결제 금액
                      const amounts = paidPayments.map(p => p.paymentAmount || 0);
                      const maxAmount = Math.max(...amounts);
                      const minAmount = Math.min(...amounts);

                      // 결제 증가 추세
                      const sortedPayments = [...paidPayments]
                        .filter(p => p.paymentTime)
                        .sort((a, b) => new Date(a.paymentTime!).getTime() - new Date(b.paymentTime!).getTime());

                      let trend = '안정적';
                      if (sortedPayments.length >= 3) {
                        const firstHalf = sortedPayments.slice(0, Math.floor(sortedPayments.length / 2));
                        const secondHalf = sortedPayments.slice(Math.floor(sortedPayments.length / 2));

                        const firstAvg = firstHalf.reduce((sum, p) => sum + (p.paymentAmount || 0), 0) / firstHalf.length;
                        const secondAvg = secondHalf.reduce((sum, p) => sum + (p.paymentAmount || 0), 0) / secondHalf.length;

                        if (secondAvg > firstAvg * 1.2) trend = '급증';
                        else if (secondAvg > firstAvg * 1.05) trend = '증가';
                        else if (secondAvg < firstAvg * 0.8) trend = '감소';
                      }

                      // 계절성 패턴
                      const monthlyAmounts = paidPayments.reduce((acc, p) => {
                        if (p.paymentTime) {
                          const month = new Date(p.paymentTime).getMonth();
                          acc[month] = (acc[month] || 0) + (p.paymentAmount || 0);
                        }
                        return acc;
                      }, {} as Record<number, number>);

                      const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
                      const peakMonth = Object.entries(monthlyAmounts).length > 0 ?
                        monthNames[parseInt(Object.entries(monthlyAmounts).sort((a, b) => b[1] - a[1])[0][0])] : '-';

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#1f1f23',
                            borderRadius: '4px',
                            borderLeft: '3px solid #3b82f6'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>결제 금액 범위</div>
                            <div style={{ color: '#fafafa', fontSize: '13px' }}>
                              최저: {minAmount.toLocaleString()}원 ~ 최고: {maxAmount.toLocaleString()}원
                            </div>
                          </div>
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#1f1f23',
                            borderRadius: '4px',
                            borderLeft: '3px solid #10b981'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>결제 추세</div>
                            <div style={{ color: '#fafafa', fontSize: '13px' }}>
                              {trend} 패턴 (최근 vs 과거 비교)
                            </div>
                          </div>
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#1f1f23',
                            borderRadius: '4px',
                            borderLeft: '3px solid #f59e0b'
                          }}>
                            <div style={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}>계절성 패턴</div>
                            <div style={{ color: '#fafafa', fontSize: '13px' }}>
                              {peakMonth !== '-' ? `피크 시즌: ${peakMonth}` : '데이터 수집 중'}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabPanel>

        {/* 마케팅 탭 */}
        <TabPanel value={tabValue} index={4}>
          <div style={{ 
            backgroundColor: '#1f1f23',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '20px'
          }}>
            <h3 style={{ 
              marginBottom: '15px',
              color: '#fafafa',
              fontSize: '16px',
              margin: '0 0 15px 0',
              fontWeight: 'bold',
              borderBottom: '1px solid #27272a',
              paddingBottom: '10px'
            }}>
              마케팅 계획
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px',
                color: '#fafafa',
                backgroundColor: '#1f1f23'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#27272a' }}>
                    <th style={{ padding: '12px', border: '1px solid #27272a', textAlign: 'left', fontWeight: 'bold' }}>단계</th>
                    <th style={{ padding: '12px', border: '1px solid #27272a', textAlign: 'left', fontWeight: 'bold' }}>행동</th>
                    <th style={{ padding: '12px', border: '1px solid #27272a', textAlign: 'left', fontWeight: 'bold' }}>시기</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid #27272a' }}>01</td>
                    <td style={{ padding: '12px', border: '1px solid #27272a' }}>환영 이메일</td>
                    <td style={{ padding: '12px', border: '1px solid #27272a' }}>24시간 후</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid #27272a' }}>02</td>
                    <td style={{ padding: '12px', border: '1px solid #27272a' }}>할인 쿠폰</td>
                    <td style={{ padding: '12px', border: '1px solid #27272a' }}>3일 후</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid #27272a' }}>03</td>
                    <td style={{ padding: '12px', border: '1px solid #27272a' }}>서비스 추천</td>
                    <td style={{ padding: '12px', border: '1px solid #27272a' }}>1주일 후</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ 
              padding: '15px', 
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '4px'
            }}>
              <div style={{ color: '#fafafa', marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>참고사항:</div>
              <div style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.4' }}>
                - 신규 고객 우선 첫 경험 제공<br/>
                - 명확한 혜택 소통 필요<br/>
                - 개인화된 서비스 추천<br/>
                - 브랜드 인지도 향상을 위한 정기 연락
              </div>
            </div>
          </div>
        </TabPanel>

        {/* 클레임내역 탭 */}
        <TabPanel value={tabValue} index={5}>
          <div style={{ 
            backgroundColor: '#1f1f23',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '20px'
          }}>
            <h3 style={{ 
              marginBottom: '15px',
              color: '#fafafa',
              fontSize: '16px',
              margin: '0 0 15px 0',
              fontWeight: 'bold',
              borderBottom: '1px solid #27272a',
              paddingBottom: '10px'
            }}>
              클레임 내역
            </h3>
            
            {/* 클레임 작성 폼 */}
            <div style={{ 
              marginBottom: '30px',
              padding: '20px',
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '4px'
            }}>
              <h4 style={{ 
                margin: '0 0 15px 0',
                color: '#fafafa',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                새 클레임 작성
              </h4>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block',
                  marginBottom: '5px',
                  color: '#a1a1aa',
                  fontSize: '14px'
                }}>
                  담당자
                </label>
                <input
                  type="text"
                  value={claimAssignee}
                  onChange={(e) => setClaimAssignee(e.target.value)}
                  placeholder="담당자 이름을 입력하세요"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#1f1f23',
                    color: '#fafafa',
                    border: '1px solid #3f3f46',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block',
                  marginBottom: '5px',
                  color: '#a1a1aa',
                  fontSize: '14px'
                }}>
                  클레임 내용
                </label>
                <textarea
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder="클레임 내용을 입력하세요..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1f1f23',
                    color: '#fafafa',
                    border: '1px solid #3f3f46',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              
              <button
                onClick={handleClaimSubmit}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1f1f23',
                  color: '#fafafa',
                  border: '1px solid #27272a',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                클레임 저장
              </button>
            </div>

            {/* 기존 클레임 내역 */}
            <div>
              <h4 style={{ 
                margin: '0 0 15px 0',
                color: '#fafafa',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                기존 클레임 내역
              </h4>
              
              {loadingClaims ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  color: '#a1a1aa',
                  fontSize: '14px'
                }}>
                  <CircularProgress size={20} />
                  클레임 목록을 불러오는 중...
                </div>
              ) : claims.length === 0 ? (
                <div style={{ color: '#a1a1aa', fontSize: '14px' }}>
                  등록된 클레임이 없습니다.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {claims.map((claim) => (
                    <div 
                      key={claim.id}
                      style={{
                        padding: '15px',
                        backgroundColor: '#27272a',
                        border: '1px solid #3f3f46',
                        borderRadius: '4px'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <div style={{ 
                            color: '#fafafa', 
                            fontSize: '14px', 
                            fontWeight: 'bold',
                            marginBottom: '5px'
                          }}>
                            담당자: {claim.assignee}
                          </div>
                          <div style={{ 
                            color: '#a1a1aa', 
                            fontSize: '12px'
                          }}>
                            {formatDateTime(claim.createdAt)}
                          </div>
                        </div>
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: claim.status === 'RESOLVED' ? '#27272a' : '#27272a',
                          color: claim.status === 'RESOLVED' ? '#8c8' : '#fafafa',
                          border: `1px solid ${claim.status === 'RESOLVED' ? '#8c8' : '#3f3f46'}`,
                          borderRadius: '4px',
                          fontSize: '10px'
                        }}>
                          {claim.status === 'RESOLVED' ? '해결됨' : '진행중'}
                        </span>
                      </div>
                      <div style={{ 
                        color: '#fafafa', 
                        fontSize: '14px',
                        lineHeight: '1.4',
                        marginBottom: '10px'
                      }}>
                        {claim.content}
                      </div>
                      {claim.resolution && (
                        <div style={{
                          padding: '10px',
                          backgroundColor: '#1f1f23',
                          border: '1px solid #3f3f46',
                          borderRadius: '4px',
                          marginTop: '10px'
                        }}>
                          <div style={{ 
                            color: '#8c8', 
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            marginBottom: '5px'
                          }}>
                            해결 내용:
                          </div>
                          <div style={{ 
                            color: '#fafafa', 
                            fontSize: '13px',
                            lineHeight: '1.4'
                          }}>
                            {claim.resolution}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabPanel>

        {/* 활동로그 */}
        <TabPanel value={tabValue} index={6}>
          <div style={{
            backgroundColor: '#1f1f23',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              borderBottom: '1px solid #27272a',
              paddingBottom: '10px'
            }}>
              <h3 style={{
                margin: 0,
                color: '#fafafa',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                활동 로그 (최근 30일)
              </h3>

              {/* 필터 버튼 */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {['ALL', 'LOGIN', 'RESERVATION', 'PAYMENT', 'ERROR'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActivityLogFilter(filter)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: activityLogFilter === filter ? '#3b82f6' : '#27272a',
                      color: '#fafafa',
                      border: '1px solid #3f3f46',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: activityLogFilter === filter ? 'bold' : 'normal'
                    }}
                  >
                    {filter === 'ALL' ? '전체' :
                     filter === 'LOGIN' ? '로그인' :
                     filter === 'RESERVATION' ? '예약' :
                     filter === 'PAYMENT' ? '결제' : '에러'}
                  </button>
                ))}
              </div>
            </div>

            {loadingActivityLogs ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#a1a1aa',
                fontSize: '14px'
              }}>
                <CircularProgress size={20} />
                활동 로그를 불러오는 중...
              </div>
            ) : activityLogs.length === 0 ? (
              <div style={{ color: '#a1a1aa', fontSize: '14px' }}>
                활동 로그가 없습니다.
              </div>
            ) : (
              <div style={{
                backgroundColor: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                  color: '#fafafa'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1f1f23' }}>
                      <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>시간</th>
                      <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>카테고리</th>
                      <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>액션</th>
                      <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>상세</th>
                      <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>IP 주소</th>
                      <th style={{ padding: '12px', border: '1px solid #3f3f46', textAlign: 'left', fontWeight: 'bold' }}>레벨</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log, index) => (
                      <tr key={index}>
                        <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                          <div style={{ fontSize: '12px' }}>
                            {formatDateTime(log.timestamp)}
                          </div>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: '#1f1f23',
                            color: log.actionCategory === 'LOGIN' ? '#3b82f6' :
                                   log.actionCategory === 'RESERVATION' ? '#8b5cf6' :
                                   log.actionCategory === 'PAYMENT' ? '#10b981' :
                                   log.actionCategory === 'ERROR' ? '#ef4444' : '#fafafa',
                            border: `1px solid ${log.actionCategory === 'LOGIN' ? '#3b82f6' :
                                                  log.actionCategory === 'RESERVATION' ? '#8b5cf6' :
                                                  log.actionCategory === 'PAYMENT' ? '#10b981' :
                                                  log.actionCategory === 'ERROR' ? '#ef4444' : '#3f3f46'}`,
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {log.actionCategory}
                          </span>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                          <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                            {log.action}
                          </div>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                          <div style={{ fontSize: '12px' }}>
                            {log.message}
                          </div>
                          {log.details && (
                            <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px' }}>
                              {log.details}
                            </div>
                          )}
                          {log.errorType && (
                            <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>
                              에러: {log.errorType}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#a1a1aa' }}>
                            {log.clientIp}
                          </div>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #3f3f46' }}>
                          <span style={{
                            padding: '2px 6px',
                            backgroundColor: log.level === 'ERROR' ? '#27272a' : '#27272a',
                            color: log.level === 'ERROR' ? '#ef4444' :
                                   log.level === 'WARN' ? '#f59e0b' : '#10b981',
                            border: `1px solid ${log.level === 'ERROR' ? '#ef4444' :
                                                  log.level === 'WARN' ? '#f59e0b' : '#10b981'}`,
                            borderRadius: '4px',
                            fontSize: '10px'
                          }}>
                            {log.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabPanel>
      </div>
    </div>
  );
};

export default UserDetail;
