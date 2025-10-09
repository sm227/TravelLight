import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  PersonAdd,
  Refresh
} from '@mui/icons-material';
import { adminUserService, AdminUserResponse } from '../../services/api';

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

const AdminUsers = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // 검색 시 첫 페이지로 초기화
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 사용자 목록 로드
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminUserService.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setAlertMessage({type: 'error', message: '사용자 목록을 불러오는데 실패했습니다.'});
      }
    } catch (error) {
      console.error('사용자 목록 로드 중 오류:', error);
      setAlertMessage({type: 'error', message: '사용자 목록을 불러오는데 실패했습니다.'});
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = () => {
    setSearchTerm('');
    setPage(0);
    loadUsers();
    setAlertMessage({type: 'success', message: '사용자 목록이 새로고침되었습니다.'});
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete !== null) {
      try {
        setDeleting(true);
        const response = await adminUserService.deleteUser(userToDelete);
        if (response.success) {
          setUsers(users.filter(user => user.id !== userToDelete));
          setAlertMessage({type: 'success', message: '사용자가 삭제되었습니다.'});
        } else {
          setAlertMessage({type: 'error', message: '사용자 삭제에 실패했습니다.'});
        }
      } catch (error: any) {
        console.error('사용자 삭제 중 오류:', error);
        let errorMessage = '사용자 삭제에 실패했습니다.';
        
        if (error.response?.status === 403) {
          errorMessage = '사용자 삭제 권한이 없습니다.';
        } else if (error.response?.status === 404) {
          errorMessage = '삭제하려는 사용자를 찾을 수 없습니다.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        setAlertMessage({type: 'error', message: errorMessage});
      } finally {
        setDeleting(false);
        setTimeout(() => setAlertMessage(null), 3000);
      }
    }
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  // 사용자 상세 정보 핸들러
  const handleUserClick = (user: AdminUserResponse) => {
    navigate(`/admin/users/${user.id}`);
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0f0f11',
      minHeight: '100vh'
    }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#fafafa'
      }}>
        사용자 관리
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
        padding: '20px', 
        marginBottom: '20px',
        backgroundColor: '#1f1f23',
        border: '1px solid #27272a',
        borderRadius: '4px'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <input
            type="text"
            placeholder="이름 또는 이메일로 검색"
            value={searchTerm}
            onChange={handleSearch}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #3f3f46',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#27272a',
              color: '#fafafa'
            }}
          />
          
          
        </div>

        <p style={{ 
          margin: '0 0 10px 0',
          color: '#a1a1aa',
          fontSize: '14px'
        }}>
          
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: '#1f1f23'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#27272a' }}>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  border: '1px solid #27272a',
                  fontWeight: 'bold',
                  color: '#fafafa'
                }}>ID</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  border: '1px solid #27272a',
                  fontWeight: 'bold',
                  color: '#fafafa'
                }}>이름</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  border: '1px solid #27272a',
                  fontWeight: 'bold',
                  color: '#fafafa'
                }}>이메일</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  border: '1px solid #27272a',
                  fontWeight: 'bold',
                  color: '#fafafa'
                }}>역할</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  border: '1px solid #27272a',
                  fontWeight: 'bold',
                  color: '#fafafa'
                }}>상태</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  border: '1px solid #27272a',
                  fontWeight: 'bold',
                  color: '#fafafa'
                }}>가입일</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  border: '1px solid #27272a',
                  fontWeight: 'bold',
                  color: '#fafafa'
                }}>수정일</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'center', 
                  border: '1px solid #27272a',
                  fontWeight: 'bold',
                  color: '#fafafa'
                }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ 
                    padding: '40px', 
                    textAlign: 'center',
                    border: '1px solid #27272a',
                    color: '#fafafa'
                  }}>
                    <CircularProgress size={40} />
                    <div style={{ marginTop: '10px' }}>로딩 중...</div>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <tr 
                        key={user.id} 
                        onClick={() => handleUserClick(user)}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: '#1f1f23'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#1f1f23';
                        }}
                      >
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #27272a',
                          color: '#fafafa'
                        }}>{user.id}</td>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #27272a',
                          color: '#fafafa'
                        }}>{user.name}</td>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #27272a',
                          color: '#fafafa'
                        }}>{user.email}</td>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #27272a'
                        }}>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: user.role === 'ADMIN' ? '#3b82f6' : '#6c757d',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #27272a'
                        }}>
                          <span style={{
                            padding: '4px 8px',
                            color: user.status === '활성' ? '#10b981' : '#ef4444',
                            border: `1px solid ${user.status === '활성' ? '#10b981' : '#ef4444'}`,
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: 'transparent'
                          }}>
                            {user.status}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #27272a',
                          color: '#fafafa'
                        }}>{formatDate(user.createdAt)}</td>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #27272a',
                          color: '#fafafa'
                        }}>{formatDateTime(user.updatedAt)}</td>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #27272a',
                          textAlign: 'center'
                        }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: 편집 기능 구현
                            }}
                            style={{
                              padding: '4px 8px',
                              marginRight: '4px',
                              backgroundColor: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            편집
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(user.id);
                            }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                  ))}
                  {!loading && filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ 
                        padding: '40px', 
                        textAlign: 'center',
                        border: '1px solid #27272a',
                        color: '#fafafa'
                      }}>
                        {searchTerm ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ 
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0'
        }}>
          <div style={{ fontSize: '14px', color: '#a1a1aa' }}>
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredUsers.length)} / 전체 ${filteredUsers.length}`}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              value={rowsPerPage} 
              onChange={handleChangeRowsPerPage}
              style={{
                padding: '4px 8px',
                border: '1px solid #3f3f46',
                borderRadius: '4px',
                backgroundColor: '#27272a',
                color: '#fafafa'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <button 
              onClick={(e) => handleChangePage(e, Math.max(0, page - 1))}
              disabled={page === 0}
              style={{
                padding: '4px 8px',
                backgroundColor: page === 0 ? '#27272a' : '#3b82f6',
                color: page === 0 ? '#71717a' : 'white',
                border: '1px solid #3f3f46',
                borderRadius: '4px',
                cursor: page === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              이전
            </button>
            <button 
              onClick={(e) => handleChangePage(e, Math.min(Math.ceil(filteredUsers.length / rowsPerPage) - 1, page + 1))}
              disabled={page >= Math.ceil(filteredUsers.length / rowsPerPage) - 1}
              style={{
                padding: '4px 8px',
                backgroundColor: page >= Math.ceil(filteredUsers.length / rowsPerPage) - 1 ? '#27272a' : '#3b82f6',
                color: page >= Math.ceil(filteredUsers.length / rowsPerPage) - 1 ? '#71717a' : 'white',
                border: '1px solid #3f3f46',
                borderRadius: '4px',
                cursor: page >= Math.ceil(filteredUsers.length / rowsPerPage) - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {openDeleteDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1f1f23',
            padding: '20px',
            borderRadius: '4px',
            minWidth: '400px',
            maxWidth: '500px',
            border: '1px solid #27272a'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#fafafa' }}>사용자 삭제</h3>
            <div style={{ marginBottom: '20px', color: '#a1a1aa' }}>
              {userToDelete && users.find(u => u.id === userToDelete) && (
                <>
                  <strong>{users.find(u => u.id === userToDelete)?.name}</strong> 사용자를 정말로 삭제하시겠습니까?
                  <br />
                  <div style={{ marginTop: '10px', color: '#dc3545', fontSize: '14px' }}>
                    이 작업은 되돌릴 수 없습니다.
                  </div>
                </>
              )}
              {(!userToDelete || !users.find(u => u.id === userToDelete)) && (
                '정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleDeleteCancel} 
                disabled={deleting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1
                }}
              >
                취소
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                disabled={deleting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {deleting && <CircularProgress size={16} style={{ color: 'white' }} />}
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers; 