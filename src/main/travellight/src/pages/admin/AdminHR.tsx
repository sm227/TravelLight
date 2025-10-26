import React, { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  Refresh,
  Work,
  People,
  TrendingUp,
  Assignment,
  PersonAdd,
  Visibility
} from '@mui/icons-material';

interface JobApplication {
  id: number;
  positionTitle: string;
  department: string;
  applicantName: string;
  email: string;
  phone: string;
  coverLetter: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TalentPool {
  id: number;
  name: string;
  email: string;
  phone: string;
  field: string;
  experience: string;
  introduction: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface HrStats {
  totalApplications: number;
  pendingApplications: number;
  underReviewApplications: number;
  totalTalentPool: number;
  activeTalentPool: number;
}

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
      id={`hr-tabpanel-${index}`}
      aria-labelledby={`hr-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// ERP 색상 정의 (AdminDashboard와 동일)
const COLORS = {
  backgroundDark: '#0f0f11',
  backgroundLight: '#18181b',
  backgroundCard: '#1f1f23',
  backgroundSurface: '#27272a',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  borderPrimary: '#27272a',
  borderSecondary: '#3f3f46',
  accentPrimary: '#3b82f6',
  accentSecondary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  backgroundHover: 'rgba(255, 255, 255, 0.05)',
};

const AdminHR = () => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [talentPool, setTalentPool] = useState<TalentPool[]>([]);
  const [hrStats, setHrStats] = useState<HrStats>({
    totalApplications: 0,
    pendingApplications: 0,
    underReviewApplications: 0,
    totalTalentPool: 0,
    activeTalentPool: 0
  });
  
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<TalentPool | null>(null);
  const [openApplicationDialog, setOpenApplicationDialog] = useState(false);
  const [openTalentDialog, setOpenTalentDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'application' | 'talent', id: number} | null>(null);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    fetchHrData();
  }, []);

  const fetchHrData = async () => {
    try {
      const [applicationsRes, talentPoolRes, statsRes] = await Promise.all([
        fetch('/api/hr/admin/applications'),
        fetch('/api/hr/admin/talent-pool'), 
        fetch('/api/hr/admin/stats')
      ]);

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        if (applicationsData.success) {
          setJobApplications(applicationsData.data.content || []);
        }
      }

      if (talentPoolRes.ok) {
        const talentPoolData = await talentPoolRes.json();
        if (talentPoolData.success) {
          setTalentPool(talentPoolData.data.content || []);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setHrStats(statsData.data);
        }
      }
    } catch (error) {
      console.error('HR 데이터 로드 실패:', error);
      
      // 에러 발생 시 샘플 데이터로 대체
      setJobApplications([
        {
          id: 1,
          positionTitle: "경영관리 팀원",
          department: "Business",
          applicantName: "김지연",
          email: "jiyeon@example.com",
          phone: "010-1234-5678",
          coverLetter: "안녕하세요. 경영관리 분야에서 성장하고 싶은 김지연입니다. 스타트업의 경영 전반에 참여하여 사업 발전에 기여하고 싶습니다...",
          status: "PENDING",
          createdAt: "2023-07-15 10:30:00",
          updatedAt: "2023-07-15 10:30:00"
        },
        {
          id: 2,
          positionTitle: "디자인 팀원",
          department: "Design",
          applicantName: "박창호",
          email: "changho@example.com",
          phone: "010-9876-5432",
          coverLetter: "UI/UX 디자인에 관심이 많은 박창호입니다...",
          status: "UNDER_REVIEW",
          createdAt: "2023-07-14 14:20:00",
          updatedAt: "2023-07-15 09:15:00"
        }
      ]);
      
      setTalentPool([
        {
          id: 1,
          name: "이민수",
          email: "minsu@example.com",
          phone: "010-5555-1234",
          field: "개발",
          experience: "React, Node.js 3년 경험",
          introduction: "풀스택 개발자로 성장하고 싶습니다...",
          status: "ACTIVE",
          createdAt: "2023-07-13 16:45:00",
          updatedAt: "2023-07-13 16:45:00"
        }
      ]);
      
      setHrStats({
        totalApplications: 2,
        pendingApplications: 1,
        underReviewApplications: 1,
        totalTalentPool: 1,
        activeTalentPool: 1
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
    setSearchTerm('');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'UNDER_REVIEW': return 'info';
      case 'INTERVIEW': return 'primary';
      case 'HIRED': return 'success';
      case 'REJECTED': return 'error';
      case 'ACTIVE': return 'success';
      case 'CONTACTED': return 'info';
      case 'ARCHIVED': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return '검토대기';
      case 'UNDER_REVIEW': return '검토중';
      case 'INTERVIEW': return '면접예정';
      case 'HIRED': return '채용완료';
      case 'REJECTED': return '불합격';
      case 'ACTIVE': return '활성';
      case 'CONTACTED': return '연락완료';
      case 'ARCHIVED': return '보관';
      default: return status;
    }
  };

  const handleStatusUpdate = async (type: 'application' | 'talent', id: number, newStatus: string) => {
    try {
      const endpoint = type === 'application' 
        ? `/api/hr/admin/applications/${id}/status`
        : `/api/hr/admin/talent-pool/${id}/status`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        if (type === 'application') {
          setJobApplications(prev => prev.map(app => 
            app.id === id ? {...app, status: newStatus, updatedAt: new Date().toISOString()} : app
          ));
        } else {
          setTalentPool(prev => prev.map(talent => 
            talent.id === id ? {...talent, status: newStatus, updatedAt: new Date().toISOString()} : talent
          ));
        }
        
        setAlertMessage({type: 'success', message: '상태가 성공적으로 변경되었습니다.'});
        setTimeout(() => setAlertMessage(null), 3000);
      } else {
        throw new Error('API 호출 실패');
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      setAlertMessage({type: 'error', message: '상태 변경에 실패했습니다.'});
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  const handleDeleteClick = (type: 'application' | 'talent', id: number) => {
    setItemToDelete({type, id});
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      const endpoint = itemToDelete.type === 'application' 
        ? `/api/hr/admin/applications/${itemToDelete.id}`
        : `/api/hr/admin/talent-pool/${itemToDelete.id}`;
      
      const response = await fetch(endpoint, { method: 'DELETE' });
      
      if (response.ok) {
        if (itemToDelete.type === 'application') {
          setJobApplications(prev => prev.filter(app => app.id !== itemToDelete.id));
        } else {
          setTalentPool(prev => prev.filter(talent => talent.id !== itemToDelete.id));
        }
        
        setAlertMessage({type: 'success', message: '성공적으로 삭제되었습니다.'});
        setTimeout(() => setAlertMessage(null), 3000);
      } else {
        throw new Error('API 호출 실패');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      setAlertMessage({type: 'error', message: '삭제에 실패했습니다.'});
      setTimeout(() => setAlertMessage(null), 3000);
    }
    
    setOpenDeleteDialog(false);
    setItemToDelete(null);
  };

  const filteredApplications = jobApplications.filter(app => 
    app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.positionTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTalentPool = talentPool.filter(talent => 
    talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    talent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    talent.field.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ 
      bgcolor: COLORS.backgroundDark, 
      width: '100%',
      minHeight: '100vh',
      p: 2.5
    }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{
        color: COLORS.textPrimary,
        mb: 3
      }}>
        HR 관리
      </Typography>

      {alertMessage && (
        <Alert 
          severity={alertMessage.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage.message}
        </Alert>
      )}

      {/* HR 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: COLORS.backgroundCard, border: `1px solid ${COLORS.borderPrimary}` }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: COLORS.accentPrimary, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.textPrimary }}>
                {hrStats.totalApplications}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                총 지원서
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: COLORS.backgroundCard, border: `1px solid ${COLORS.borderPrimary}` }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Work sx={{ fontSize: 40, color: COLORS.warning, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.textPrimary }}>
                {hrStats.pendingApplications}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                검토대기
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: COLORS.backgroundCard, border: `1px solid ${COLORS.borderPrimary}` }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: COLORS.success, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.textPrimary }}>
                {hrStats.underReviewApplications}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                검토중
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: COLORS.backgroundCard, border: `1px solid ${COLORS.borderPrimary}` }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: COLORS.accentSecondary, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.textPrimary }}>
                {hrStats.totalTalentPool}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                총 인재풀
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: COLORS.backgroundCard, border: `1px solid ${COLORS.borderPrimary}` }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonAdd sx={{ fontSize: 40, color: COLORS.info, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.textPrimary }}>
                {hrStats.activeTalentPool}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                활성 인재풀
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ 
        borderRadius: 1, 
        bgcolor: COLORS.backgroundCard, 
        border: `1px solid ${COLORS.borderPrimary}` 
      }} elevation={0}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: COLORS.borderPrimary,
            '& .MuiTab-root': {
              color: COLORS.textSecondary,
              '&.Mui-selected': {
                color: COLORS.accentPrimary
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: COLORS.accentPrimary
            }
          }}
        >
          <Tab label="채용 지원서" />
          <Tab label="인재풀" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              placeholder="지원자명, 이메일, 포지션으로 검색"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={handleSearch}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: COLORS.textPrimary,
                  '& fieldset': {
                    borderColor: COLORS.borderSecondary,
                  },
                  '&:hover fieldset': {
                    borderColor: COLORS.accentPrimary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.accentPrimary,
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: COLORS.textMuted,
                  opacity: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: COLORS.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton onClick={fetchHrData} color="primary">
              <Refresh />
            </IconButton>
          </Stack>

          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="지원서 테이블">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>ID</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>포지션</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>부서</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>지원자명</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>이메일</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>연락처</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>상태</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>지원일</TableCell>
                  <TableCell align="center" sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((application) => (
                    <TableRow key={application.id} hover sx={{ '&:hover': { bgcolor: COLORS.backgroundHover } }}>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{application.id}</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{application.positionTitle}</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{application.department}</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{application.applicantName}</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{application.email}</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{application.phone}</TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={application.status}
                            onChange={(e) => handleStatusUpdate('application', application.id, e.target.value)}
                            sx={{
                              color: COLORS.textPrimary,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: COLORS.borderSecondary
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: COLORS.accentPrimary
                              },
                              '& .MuiSelect-icon': {
                                color: COLORS.textSecondary
                              }
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: COLORS.backgroundSurface,
                                  border: `1px solid ${COLORS.borderSecondary}`,
                                  '& .MuiMenuItem-root': {
                                    color: COLORS.textPrimary,
                                    '&:hover': {
                                      bgcolor: COLORS.backgroundHover
                                    }
                                  }
                                }
                              }
                            }}
                          >
                            <MenuItem value="PENDING">검토대기</MenuItem>
                            <MenuItem value="UNDER_REVIEW">검토중</MenuItem>
                            <MenuItem value="INTERVIEW">면접예정</MenuItem>
                            <MenuItem value="HIRED">채용완료</MenuItem>
                            <MenuItem value="REJECTED">불합격</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="center" sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            setSelectedApplication(application);
                            setOpenApplicationDialog(true);
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteClick('application', application.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                ))}
                {filteredApplications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredApplications.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="페이지당 행 수:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 전체 ${count}`}
            sx={{
              color: COLORS.textPrimary,
              borderTop: `1px solid ${COLORS.borderPrimary}`,
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: COLORS.textSecondary
              },
              '& .MuiSelect-icon': {
                color: COLORS.textSecondary
              }
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              placeholder="이름, 이메일, 분야로 검색"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={handleSearch}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: COLORS.textPrimary,
                  '& fieldset': {
                    borderColor: COLORS.borderSecondary,
                  },
                  '&:hover fieldset': {
                    borderColor: COLORS.accentPrimary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.accentPrimary,
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: COLORS.textMuted,
                  opacity: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: COLORS.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton onClick={fetchHrData} color="primary">
              <Refresh />
            </IconButton>
          </Stack>

          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="인재풀 테이블">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>ID</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>이름</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>이메일</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>연락처</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>관심분야</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>상태</TableCell>
                  <TableCell sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>등록일</TableCell>
                  <TableCell align="center" sx={{ color: COLORS.textSecondary, fontSize: '0.875rem', fontWeight: 600, bgcolor: COLORS.backgroundSurface, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTalentPool
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((talent) => (
                    <TableRow key={talent.id} hover sx={{ '&:hover': { bgcolor: COLORS.backgroundHover } }}>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{talent.id}</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{talent.name}</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{talent.email}</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{talent.phone}</TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{talent.field}</TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={talent.status}
                            onChange={(e) => handleStatusUpdate('talent', talent.id, e.target.value)}
                            sx={{
                              color: COLORS.textPrimary,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: COLORS.borderSecondary
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: COLORS.accentPrimary
                              },
                              '& .MuiSelect-icon': {
                                color: COLORS.textSecondary
                              }
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: COLORS.backgroundSurface,
                                  border: `1px solid ${COLORS.borderSecondary}`,
                                  '& .MuiMenuItem-root': {
                                    color: COLORS.textPrimary,
                                    '&:hover': {
                                      bgcolor: COLORS.backgroundHover
                                    }
                                  }
                                }
                              }
                            }}
                          >
                            <MenuItem value="ACTIVE">활성</MenuItem>
                            <MenuItem value="CONTACTED">연락완료</MenuItem>
                            <MenuItem value="HIRED">채용완료</MenuItem>
                            <MenuItem value="ARCHIVED">보관</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>{new Date(talent.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="center" sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            setSelectedTalent(talent);
                            setOpenTalentDialog(true);
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteClick('talent', talent.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                ))}
                {filteredTalentPool.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTalentPool.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="페이지당 행 수:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 전체 ${count}`}
            sx={{
              color: COLORS.textPrimary,
              borderTop: `1px solid ${COLORS.borderPrimary}`,
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: COLORS.textSecondary
              },
              '& .MuiSelect-icon': {
                color: COLORS.textSecondary
              }
            }}
          />
        </TabPanel>
      </Paper>

      {/* 지원서 상세보기 다이얼로그 */}
      <Dialog
        open={openApplicationDialog}
        onClose={() => setOpenApplicationDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.backgroundCard,
            border: `1px solid ${COLORS.borderPrimary}`,
            color: COLORS.textPrimary
          }
        }}
      >
        {selectedApplication && (
          <>
            <DialogTitle sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.textPrimary }}>
                {selectedApplication.positionTitle} 지원서
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary }}>지원자명</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>{selectedApplication.applicantName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary }}>이메일</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>{selectedApplication.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary }}>연락처</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>{selectedApplication.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary }}>상태</Typography>
                  <Chip 
                    label={getStatusLabel(selectedApplication.status)} 
                    color={getStatusColor(selectedApplication.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary, mb: 1 }}>자기소개서</Typography>
                  <Paper sx={{ p: 2, bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderPrimary}` }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: COLORS.textPrimary }}>
                      {selectedApplication.coverLetter}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ borderTop: `1px solid ${COLORS.borderPrimary}` }}>
              <Button onClick={() => setOpenApplicationDialog(false)} sx={{ color: COLORS.textSecondary }}>닫기</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 인재풀 상세보기 다이얼로그 */}
      <Dialog
        open={openTalentDialog}
        onClose={() => setOpenTalentDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: COLORS.backgroundCard,
            border: `1px solid ${COLORS.borderPrimary}`,
            color: COLORS.textPrimary
          }
        }}
      >
        {selectedTalent && (
          <>
            <DialogTitle sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.textPrimary }}>
                {selectedTalent.name} 인재풀 정보
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary }}>이름</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>{selectedTalent.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary }}>이메일</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>{selectedTalent.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary }}>연락처</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>{selectedTalent.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary }}>관심분야</Typography>
                  <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>{selectedTalent.field}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary, mb: 1 }}>경력사항</Typography>
                  <Paper sx={{ p: 2, bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderPrimary}` }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: COLORS.textPrimary }}>
                      {selectedTalent.experience || '경력사항이 없습니다.'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: COLORS.textSecondary, mb: 1 }}>자기소개</Typography>
                  <Paper sx={{ p: 2, bgcolor: COLORS.backgroundSurface, border: `1px solid ${COLORS.borderPrimary}` }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: COLORS.textPrimary }}>
                      {selectedTalent.introduction}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ borderTop: `1px solid ${COLORS.borderPrimary}` }}>
              <Button onClick={() => setOpenTalentDialog(false)} sx={{ color: COLORS.textSecondary }}>닫기</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: COLORS.backgroundCard,
            border: `1px solid ${COLORS.borderPrimary}`,
            color: COLORS.textPrimary
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${COLORS.borderPrimary}` }}>
          <Typography sx={{ color: COLORS.textPrimary }}>
            {itemToDelete?.type === 'application' ? '지원서' : '인재풀'} 삭제
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: COLORS.textPrimary }}>
            정말로 이 {itemToDelete?.type === 'application' ? '지원서를' : '인재풀 정보를'} 삭제하시겠습니까? 
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${COLORS.borderPrimary}` }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: COLORS.textSecondary }}>취소</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" sx={{ bgcolor: COLORS.danger, '&:hover': { bgcolor: '#dc2626' } }}>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminHR;