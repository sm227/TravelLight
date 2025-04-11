import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import axios from 'axios';
import api from '../../services/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EventStorage {
  id: number;
  submissionId: string;
  eventName: string;
  organizerName: string;
  email: string;
  phone: string;
  eventType: string;
  expectedAttendees: string;
  estimatedStorage: string;
  eventVenue: string;
  eventAddress: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  setupTime: string;
  additionalRequirements: string;
  agreeTerms: boolean;
  createdAt: string;
  status: string;
}

const statusColors = {
  '접수': 'info',
  '확인중': 'warning',
  '승인': 'success',
  '거절': 'error',
  '완료': 'default'
};

const AdminEventStorage = () => {
  const theme = useTheme();
  const [eventStorages, setEventStorages] = useState<EventStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEventStorage, setSelectedEventStorage] = useState<EventStorage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('전체');

  // 이벤트 보관 요청 목록 가져오기
  const fetchEventStorages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/EventStorage');
      if (response.data.success) {
        setEventStorages(response.data.data);
      } else {
        console.error('이벤트 보관 목록 조회 실패:', response.data.message);
      }
    } catch (error) {
      console.error('이벤트 보관 목록 조회 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventStorages();
  }, []);

  // 페이지 변경 핸들러
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // 페이지당 행 수 변경 핸들러
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 상세 정보 보기
  const handleViewDetails = (eventStorage: EventStorage) => {
    setSelectedEventStorage(eventStorage);
    setDetailOpen(true);
  };

  // 상태 업데이트 핸들러
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await api.put(`/admin/EventStorage/${id}/status`, { status: newStatus });
      if (response.data.success) {
        // 성공 시 상태 업데이트
        setEventStorages(prevState =>
          prevState.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
          )
        );
        // 모달 닫기
        setEditOpen(false);
      } else {
        console.error('상태 업데이트 실패:', response.data.message);
      }
    } catch (error) {
      console.error('상태 업데이트 중 오류 발생:', error);
    }
  };

  // 필터링된 이벤트 보관 요청
  const filteredEventStorages = eventStorages.filter(
    item => statusFilter === '전체' || item.status === statusFilter
  );

  return (
    <Box 
      className="admin-event-storage" 
      sx={{ 
        p: 3, 
        backgroundColor: 'rgba(18, 18, 18, 0.9)',
        minHeight: '100vh',
        color: 'white'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 3,
        alignItems: 'center' 
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.primary.light,
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            pl: 2
          }}
        >
          이벤트 짐보관 관리
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="상태"
            variant="outlined"
            sx={{ 
              minWidth: 120,
              '& .MuiOutlinedInput-root': {
                backgroundColor: alpha(theme.palette.background.paper, 0.1),
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.light,
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.grey[300]
              },
              '& .MuiSelect-select': {
                color: 'white'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.common.white, 0.2)
              }
            }}
          >
            <MenuItem value="전체">전체</MenuItem>
            <MenuItem value="접수">접수</MenuItem>
            <MenuItem value="확인중">확인중</MenuItem>
            <MenuItem value="승인">승인</MenuItem>
            <MenuItem value="거절">거절</MenuItem>
            <MenuItem value="완료">완료</MenuItem>
          </TextField>
          <Button
            startIcon={<RefreshIcon />}
            variant="contained"
            color="primary"
            onClick={fetchEventStorages}
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              textTransform: 'none'
            }}
          >
            새로고침
          </Button>
        </Box>
      </Box>

      <Paper 
        sx={{ 
          width: '100%', 
          mb: 2,
          background: 'rgba(33, 33, 33, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`
        }} 
        elevation={0}
      >
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="eventStorageTable">
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: alpha(theme.palette.primary.dark, 0.3),
                '& th': { 
                  color: theme.palette.grey[200],
                  fontWeight: 'bold',
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                }
              }}>
                <TableCell>신청번호</TableCell>
                <TableCell>이벤트명</TableCell>
                <TableCell>주최자</TableCell>
                <TableCell>이벤트 날짜</TableCell>
                <TableCell>예상 인원</TableCell>
                <TableCell>신청일</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, border: 'none' }}>
                    <CircularProgress size={40} color="primary" />
                  </TableCell>
                </TableRow>
              ) : filteredEventStorages.length > 0 ? (
                filteredEventStorages
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow 
                      key={row.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.action.hover, 0.1)
                        },
                        backgroundColor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.05),
                        cursor: 'pointer',
                        '& td': { 
                          color: theme.palette.common.white,
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }
                      }}
                      onClick={() => handleViewDetails(row)}
                    >
                      <TableCell>{row.submissionId}</TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>{row.eventName}</TableCell>
                      <TableCell>{row.organizerName}</TableCell>
                      <TableCell>
                        {row.eventDate ? format(new Date(row.eventDate), 'yyyy-MM-dd', { locale: ko }) : '-'}
                      </TableCell>
                      <TableCell>{row.expectedAttendees}</TableCell>
                      <TableCell>
                        {row.createdAt ? format(new Date(row.createdAt), 'yyyy-MM-dd', { locale: ko }) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={statusColors[row.status as keyof typeof statusColors] as any}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            '& .MuiChip-label': { px: 1.5 }
                          }}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="상세 정보">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(row);
                              }}
                              sx={{ 
                                color: theme.palette.primary.light,
                                '&:hover': { 
                                  backgroundColor: alpha(theme.palette.primary.main, 0.15)
                                }
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="상태 변경">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEventStorage(row);
                                setEditOpen(true);
                              }}
                              sx={{ 
                                color: theme.palette.warning.light,
                                '&:hover': { 
                                  backgroundColor: alpha(theme.palette.warning.main, 0.15)
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: theme.palette.grey[400], py: 5 }}>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredEventStorages.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행:"
          sx={{
            color: theme.palette.grey[300],
            '.MuiTablePagination-selectIcon': {
              color: theme.palette.grey[400]
            },
            '.MuiTablePagination-actions': {
              color: theme.palette.grey[400]
            }
          }}
        />
      </Paper>

      {/* 상세 정보 모달 */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(33, 33, 33, 0.95)',
            backgroundImage: 'linear-gradient(rgba(55, 65, 81, 0.1), rgba(17, 24, 39, 0.3))',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
            color: theme.palette.common.white,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.primary.dark, 0.4),
          color: theme.palette.common.white,
          py: 2
        }}>
          이벤트 짐보관 신청 상세 정보
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: alpha(theme.palette.divider, 0.1) }}>
          {selectedEventStorage && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="신청번호"
                  value={selectedEventStorage.submissionId}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="이벤트명"
                  value={selectedEventStorage.eventName}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="주최자"
                  value={selectedEventStorage.organizerName}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="이메일"
                  value={selectedEventStorage.email}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="전화번호"
                  value={selectedEventStorage.phone}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="이벤트 유형"
                  value={selectedEventStorage.eventType}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="예상 인원"
                  value={selectedEventStorage.expectedAttendees}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="예상 짐 보관량"
                  value={selectedEventStorage.estimatedStorage}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="이벤트 장소"
                  value={selectedEventStorage.eventVenue}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="이벤트 주소"
                  value={selectedEventStorage.eventAddress}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="이벤트 날짜"
                  value={selectedEventStorage.eventDate ? format(new Date(selectedEventStorage.eventDate), 'yyyy-MM-dd', { locale: ko }) : '-'}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="시작 시간"
                  value={selectedEventStorage.startTime || '-'}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="종료 시간"
                  value={selectedEventStorage.endTime || '-'}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="설치 시간"
                  value={selectedEventStorage.setupTime || '-'}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="추가 요청사항"
                  value={selectedEventStorage.additionalRequirements || '없음'}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={4}
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="신청일"
                  value={selectedEventStorage.createdAt ? format(new Date(selectedEventStorage.createdAt), 'yyyy-MM-dd', { locale: ko }) : '-'}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="상태"
                  value={selectedEventStorage.status}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputProps={{ 
                    readOnly: true,
                    sx: { color: theme.palette.common.white }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.1),
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.grey[300]
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.common.white, 0.2)
                    }
                  }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          px: 3, 
          py: 2
        }}>
          <Button 
            onClick={() => setDetailOpen(false)} 
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 상태 변경 모달 */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(33, 33, 33, 0.95)',
            backgroundImage: 'linear-gradient(rgba(55, 65, 81, 0.1), rgba(17, 24, 39, 0.3))',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
            color: theme.palette.common.white,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.warning.dark, 0.4),
          color: theme.palette.common.white,
          py: 2
        }}>
          상태 변경
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedEventStorage && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: theme.palette.grey[300] }}>
                신청번호: <span style={{ color: theme.palette.common.white, fontWeight: 'bold' }}>{selectedEventStorage.submissionId}</span>
              </Typography>
              <Typography variant="subtitle1" gutterBottom sx={{ color: theme.palette.grey[300] }}>
                이벤트명: <span style={{ color: theme.palette.common.white, fontWeight: 'bold' }}>{selectedEventStorage.eventName}</span>
              </Typography>
              <Typography variant="subtitle1" gutterBottom sx={{ color: theme.palette.grey[300] }}>
                현재 상태: 
                <Chip
                  label={selectedEventStorage.status}
                  color={statusColors[selectedEventStorage.status as keyof typeof statusColors] as any}
                  size="small"
                  sx={{ 
                    ml: 1,
                    fontWeight: 'bold',
                    borderRadius: '4px',
                  }}
                />
              </Typography>
              <TextField
                select
                label="새 상태"
                fullWidth
                margin="normal"
                defaultValue={selectedEventStorage.status}
                onChange={(e) => {
                  if (selectedEventStorage) {
                    handleStatusChange(selectedEventStorage.id, e.target.value);
                  }
                }}
                sx={{ 
                  mt: 4,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.1),
                    borderRadius: 1,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.light,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.grey[300]
                  },
                  '& .MuiSelect-select': {
                    color: 'white'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.common.white, 0.2)
                  }
                }}
              >
                <MenuItem value="접수">접수</MenuItem>
                <MenuItem value="확인중">확인중</MenuItem>
                <MenuItem value="승인">승인</MenuItem>
                <MenuItem value="거절">거절</MenuItem>
                <MenuItem value="완료">완료</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          px: 3, 
          py: 2
        }}>
          <Button 
            onClick={() => setEditOpen(false)} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              borderColor: theme.palette.grey[600],
              color: theme.palette.grey[300],
              '&:hover': {
                borderColor: theme.palette.grey[400],
                backgroundColor: alpha(theme.palette.common.white, 0.05)
              }
            }}
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEventStorage; 