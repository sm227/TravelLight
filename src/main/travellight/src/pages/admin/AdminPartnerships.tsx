import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    CircularProgress,
    alpha,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    Stack
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    StorefrontOutlined,
    Search as SearchIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

// AdminDashboard와 동일한 색상 테마
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

interface Partnership {
    id: number;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
    businessType: string;
    spaceSize: string;
    additionalInfo: string;
    agreeTerms: boolean;
    is24Hours: boolean;
    businessHours: Record<string, string>;
    submissionId: string;
    createdAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const AdminPartnerships: React.FC = () => {
    const [partnerships, setPartnerships] = useState<Partnership[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPartnerships();
    }, []);

    const fetchPartnerships = async () => {
        try {
            const response = await axios.get('/api/partnership');
            setPartnerships(response.data.data);
        } catch (error) {
            toast.error('제휴점 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, newStatus: 'APPROVED' | 'REJECTED') => {
        try {
            const response = await axios.put(`/api/partnership/${id}/status`, { status: newStatus });
            const successMessage = response.data.message;
            toast.success(successMessage);
            
            if (newStatus === 'APPROVED') {
                // 파트너 승인 시 추가 안내 메시지 표시
                toast.info('해당 사용자는 이제 파트너 기능을 사용할 수 있습니다.', {
                    autoClose: 5000,
                    position: 'top-center'
                });
            }
            
            fetchPartnerships();
        } catch (error: unknown) {
            const errorMessage = axios.isAxiosError(error) && error.response?.data?.message 
                ? error.response.data.message 
                : '상태 업데이트에 실패했습니다.';
            toast.error(errorMessage);
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        fetchPartnerships();
    };

    // 제휴점 행 클릭 핸들러
    const handlePartnershipClick = (partnership: Partnership) => {
        navigate(`/admin/partnerships/${partnership.id}`);
    };

    // 검색 필터링
    const filteredPartnerships = partnerships.filter(partnership => 
        partnership.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partnership.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partnership.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '80vh',
                bgcolor: COLORS.backgroundDark
            }}>
                <CircularProgress sx={{ color: COLORS.accentPrimary }} />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            bgcolor: COLORS.backgroundDark, 
            minHeight: '100vh',
            p: 2.5
        }}>
            {/* 헤더 */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                pb: 2,
                borderBottom: `1px solid ${COLORS.borderPrimary}`
            }}>
                <Box>
                    <Typography variant="h5" sx={{ 
                        color: COLORS.textPrimary, 
                        fontWeight: 600,
                        fontSize: '1.25rem',
                        mb: 0.25,
                        letterSpacing: '-0.025em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <StorefrontOutlined sx={{ fontSize: '1.5rem', color: COLORS.accentPrimary }} />
                        제휴점 관리
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: COLORS.textSecondary,
                        fontSize: '0.75rem',
                        fontWeight: 500
                    }}>
                        총 {partnerships.length}개 제휴점 신청 현황
                        {searchTerm && ` (검색결과: ${filteredPartnerships.length}개)`}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label={`검토중: ${filteredPartnerships.filter(p => p.status === 'PENDING').length}개`}
                        size="small"
                        sx={{
                            bgcolor: alpha(COLORS.warning, 0.15),
                            color: COLORS.warning,
                            fontWeight: 600,
                            borderRadius: 0,
                            border: `1px solid ${alpha(COLORS.warning, 0.3)}`
                        }}
                    />
                    <Chip
                        label={`운영중: ${filteredPartnerships.filter(p => p.status === 'APPROVED').length}개`}
                        size="small"
                        sx={{
                            bgcolor: alpha(COLORS.success, 0.15),
                            color: COLORS.success,
                            fontWeight: 600,
                            borderRadius: 0,
                            border: `1px solid ${alpha(COLORS.success, 0.3)}`
                        }}
                    />
                </Box>
            </Box>

            {/* 검색 및 필터 */}
            <Paper 
                elevation={0} 
                sx={{ 
                    bgcolor: COLORS.backgroundCard, 
                    border: `1px solid ${COLORS.borderPrimary}`,
                    borderRadius: 0,
                    p: 2,
                    mb: 2
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                        placeholder="사업체명, 대표자명, 이메일로 검색"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{
                            '& .MuiInputBase-root': {
                                bgcolor: COLORS.backgroundSurface,
                                color: COLORS.textPrimary
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: COLORS.borderSecondary
                            },
                            '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                                color: COLORS.textSecondary
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <IconButton 
                        onClick={handleRefresh} 
                        sx={{ 
                            color: COLORS.textSecondary,
                            bgcolor: COLORS.backgroundSurface,
                            border: `1px solid ${COLORS.borderSecondary}`,
                            borderRadius: 0,
                            '&:hover': { 
                                color: COLORS.accentPrimary,
                                bgcolor: COLORS.backgroundHover 
                            }
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Stack>
            </Paper>

            {/* 제휴점 테이블 */}
            <Paper 
                elevation={0} 
                sx={{ 
                    bgcolor: COLORS.backgroundCard, 
                    border: `1px solid ${COLORS.borderPrimary}`,
                    borderRadius: 0,
                    overflow: 'hidden'
                }}
            >
                <TableContainer>
                    <Table sx={{ minWidth: 1200 }}>
                        <TableHead sx={{ bgcolor: COLORS.backgroundLight }}>
                            <TableRow>
                                <TableCell sx={{ 
                                    color: COLORS.textSecondary, 
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    py: 2,
                                    px: 2,
                                    borderBottom: `2px solid ${COLORS.borderSecondary}`,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    상호명
                                </TableCell>
                                <TableCell sx={{ 
                                    color: COLORS.textSecondary, 
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    py: 2,
                                    px: 2,
                                    borderBottom: `2px solid ${COLORS.borderSecondary}`,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    대표자
                                </TableCell>
                                <TableCell sx={{ 
                                    color: COLORS.textSecondary, 
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    py: 1.5,
                                    borderBottom: `2px solid ${COLORS.borderSecondary}`,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    연락처
                                </TableCell>
                                <TableCell sx={{ 
                                    color: COLORS.textSecondary, 
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    py: 1.5,
                                    borderBottom: `2px solid ${COLORS.borderSecondary}`,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    주소
                                </TableCell>
                                <TableCell sx={{ 
                                    color: COLORS.textSecondary, 
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    py: 1.5,
                                    borderBottom: `2px solid ${COLORS.borderSecondary}`,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    업종/규모
                                </TableCell>
                                <TableCell sx={{ 
                                    color: COLORS.textSecondary, 
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    py: 1.5,
                                    borderBottom: `2px solid ${COLORS.borderSecondary}`,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    상태
                                </TableCell>
                                <TableCell sx={{ 
                                    color: COLORS.textSecondary, 
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    py: 1.5,
                                    borderBottom: `2px solid ${COLORS.borderSecondary}`,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    신청일
                                </TableCell>
                                <TableCell align="center" sx={{ 
                                    color: COLORS.textSecondary, 
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    py: 1.5,
                                    borderBottom: `2px solid ${COLORS.borderSecondary}`,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    관리
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPartnerships.map((partnership, index) => (
                                <TableRow 
                                    key={partnership.id}
                                    onClick={() => handlePartnershipClick(partnership)}
                                    sx={{ 
                                        bgcolor: index % 2 === 0 ? COLORS.backgroundCard : alpha(COLORS.backgroundLight, 0.5),
                                        '&:hover': { 
                                            bgcolor: alpha(COLORS.accentPrimary, 0.08),
                                            '& .action-buttons': {
                                                opacity: 1
                                            }
                                        },
                                        borderBottom: `1px solid ${COLORS.borderSecondary}`,
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <TableCell sx={{ 
                                        color: COLORS.textPrimary, 
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        py: 1.75,
                                        px: 2
                                    }}>
                                        {partnership.businessName}
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: COLORS.textSecondary, 
                                        fontSize: '0.8125rem',
                                        py: 1.75,
                                        px: 2
                                    }}>
                                        {partnership.ownerName}
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: COLORS.textSecondary, 
                                        fontSize: '0.8125rem',
                                        py: 1.75,
                                        px: 2
                                    }}>
                                        {partnership.phone}
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: COLORS.textSecondary, 
                                        fontSize: '0.8125rem',
                                        py: 1.75,
                                        px: 2,
                                        maxWidth: 280,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        <Tooltip title={partnership.address} arrow>
                                            <span>{partnership.address}</span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: COLORS.textSecondary, 
                                        fontSize: '0.8125rem',
                                        py: 1.75,
                                        px: 2
                                    }}>
                                        <Typography sx={{ 
                                            color: COLORS.textSecondary,
                                            fontSize: '0.8125rem',
                                            fontWeight: 500,
                                            mb: 0.25
                                        }}>
                                            {partnership.businessType}
                                        </Typography>
                                        <Typography sx={{ 
                                            color: COLORS.textMuted, 
                                            fontSize: '0.75rem'
                                        }}>
                                            {partnership.spaceSize}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.75, px: 2 }}>
                                        <Chip 
                                            label={
                                                partnership.status === 'PENDING' ? '검토중' : 
                                                partnership.status === 'APPROVED' ? '운영중' : '거절'
                                            }
                                            size="small"
                                            sx={{
                                                fontSize: '0.6875rem',
                                                height: 24,
                                                minWidth: 60,
                                                bgcolor: 
                                                    partnership.status === 'PENDING' ? alpha(COLORS.warning, 0.2) : 
                                                    partnership.status === 'APPROVED' ? alpha(COLORS.success, 0.2) : 
                                                    alpha(COLORS.danger, 0.2),
                                                color: 
                                                    partnership.status === 'PENDING' ? COLORS.warning : 
                                                    partnership.status === 'APPROVED' ? COLORS.success : 
                                                    COLORS.danger,
                                                fontWeight: 700,
                                                borderRadius: 0,
                                                border: `2px solid ${
                                                    partnership.status === 'PENDING' ? COLORS.warning : 
                                                    partnership.status === 'APPROVED' ? COLORS.success : 
                                                    COLORS.danger
                                                }`
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: COLORS.textSecondary, 
                                        fontSize: '0.8125rem',
                                        py: 1.75,
                                        px: 2
                                    }}>
                                        {new Date(partnership.createdAt).toLocaleDateString('ko-KR', {
                                            year: '2-digit',
                                            month: '2-digit',
                                            day: '2-digit'
                                        })}
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.75, px: 2 }}>
                                        <Box className="action-buttons" sx={{ 
                                            display: 'flex', 
                                            gap: 0.5, 
                                            justifyContent: 'center',
                                            opacity: 0.7,
                                            transition: 'opacity 0.15s ease'
                                        }}>
                                            <Tooltip title="승인" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(partnership.id, 'APPROVED');
                                                    }}
                                                    disabled={partnership.status === 'APPROVED'}
                                                    sx={{
                                                        color: partnership.status === 'APPROVED' ? COLORS.textMuted : COLORS.success,
                                                        bgcolor: partnership.status === 'APPROVED' ? 'transparent' : alpha(COLORS.success, 0.1),
                                                        border: `1px solid ${partnership.status === 'APPROVED' ? COLORS.borderPrimary : COLORS.success}`,
                                                        borderRadius: 0,
                                                        width: 32,
                                                        height: 32,
                                                        '&:hover': {
                                                            bgcolor: partnership.status === 'APPROVED' ? 'transparent' : alpha(COLORS.success, 0.2),
                                                        }
                                                    }}
                                                >
                                                    <CheckCircleIcon sx={{ fontSize: '1rem' }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="거절" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(partnership.id, 'REJECTED');
                                                    }}
                                                    disabled={partnership.status === 'REJECTED'}
                                                    sx={{
                                                        color: partnership.status === 'REJECTED' ? COLORS.textMuted : COLORS.danger,
                                                        bgcolor: partnership.status === 'REJECTED' ? 'transparent' : alpha(COLORS.danger, 0.1),
                                                        border: `1px solid ${partnership.status === 'REJECTED' ? COLORS.borderPrimary : COLORS.danger}`,
                                                        borderRadius: 0,
                                                        width: 32,
                                                        height: 32,
                                                        '&:hover': {
                                                            bgcolor: partnership.status === 'REJECTED' ? 'transparent' : alpha(COLORS.danger, 0.2),
                                                        }
                                                    }}
                                                >
                                                    <CancelIcon sx={{ fontSize: '1rem' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {filteredPartnerships.length === 0 && (
                <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: COLORS.textSecondary 
                }}>
                    <StorefrontOutlined sx={{ fontSize: '3rem', mb: 2, color: COLORS.textMuted }} />
                    <Typography variant="h6" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                        {searchTerm ? '검색 결과가 없습니다' : '제휴점 신청이 없습니다'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
                        {searchTerm ? '다른 검색어로 시도해보세요.' : '새로운 제휴점 신청을 기다리고 있습니다.'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default AdminPartnerships; 