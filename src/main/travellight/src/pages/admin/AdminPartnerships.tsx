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
    alpha
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';

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
            toast.success(response.data.message);
            fetchPartnerships();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || '상태 업데이트에 실패했습니다.';
            toast.error(errorMessage);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: 'var(--text-primary)', fontWeight: 600 }}>
                제휴점 관리
            </Typography>
            
            <Paper 
                elevation={0} 
                sx={{ 
                    backgroundColor: 'var(--background-paper)', 
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden'
                }}
            >
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ backgroundColor: alpha('#000', 0.02) }}>
                            <TableRow>
                                <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>상호명</TableCell>
                                <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>대표자</TableCell>
                                <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>연락처</TableCell>
                                <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>주소</TableCell>
                                <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>상태</TableCell>
                                <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>신청일</TableCell>
                                <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>관리</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {partnerships.map((partnership) => (
                                <TableRow 
                                    key={partnership.id}
                                    sx={{ 
                                        '&:hover': { 
                                            backgroundColor: alpha('#fff', 0.03) 
                                        } 
                                    }}
                                >
                                    <TableCell sx={{ color: 'var(--text-primary)' }}>{partnership.businessName}</TableCell>
                                    <TableCell sx={{ color: 'var(--text-primary)' }}>{partnership.ownerName}</TableCell>
                                    <TableCell sx={{ color: 'var(--text-primary)' }}>{partnership.phone}</TableCell>
                                    <TableCell sx={{ color: 'var(--text-primary)' }}>{partnership.address}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={
                                                partnership.status === 'PENDING' ? '대기중' : 
                                                partnership.status === 'APPROVED' ? '승인' : '거절'
                                            }
                                            size="small"
                                            sx={{
                                                backgroundColor: 
                                                    partnership.status === 'PENDING' ? alpha('#FFD700', 0.15) : 
                                                    partnership.status === 'APPROVED' ? alpha('#4CAF50', 0.15) : 
                                                    alpha('#f44336', 0.15),
                                                color: 
                                                    partnership.status === 'PENDING' ? '#FFD700' : 
                                                    partnership.status === 'APPROVED' ? '#4CAF50' : 
                                                    '#f44336',
                                                fontWeight: 500
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'var(--text-primary)' }}>
                                        {new Date(partnership.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="success"
                                                startIcon={<CheckCircleIcon />}
                                                onClick={() => handleStatusChange(partnership.id, 'APPROVED')}
                                                disabled={partnership.status === 'APPROVED'}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                승인
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="error"
                                                startIcon={<CancelIcon />}
                                                onClick={() => handleStatusChange(partnership.id, 'REJECTED')}
                                                disabled={partnership.status === 'REJECTED'}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                거절
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default AdminPartnerships; 