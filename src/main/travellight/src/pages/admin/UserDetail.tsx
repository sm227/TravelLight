import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  CircularProgress
} from '@mui/material';
import { adminUserService, AdminUserResponse, claimService, ClaimResponse } from '../../services/api';
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
          {['고객정보', '예약분석', '결제분석', '마케팅', '클레임내역'].map((label, index) => (
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
              결제 분석
            </h3>
            <div style={{ color: '#a1a1aa', fontSize: '14px' }}>
              결제 내역이 없습니다.
            </div>
          </div>
        </TabPanel>

        {/* 마케팅 탭 */}
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
      </div>
    </div>
  );
};

export default UserDetail;
