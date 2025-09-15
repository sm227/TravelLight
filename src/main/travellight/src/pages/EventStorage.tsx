import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Divider,
    useTheme,
    useMediaQuery,
    Stack,
    Alert,
    SelectChangeEvent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import EventIcon from '@mui/icons-material/Event';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import ko from "date-fns/locale/ko";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

// 애니메이션 정의
const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

// 스타일된 컴포넌트
const StyledCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: '12px',
    border: '1px solid #F1F5F9',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.15)',
        borderColor: '#E2E8F0'
    },
    animation: `${fadeIn} 0.6s ease-out`
}));

const StyledFormPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: '12px',
    border: '1px solid #F1F5F9',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    animation: `${fadeIn} 0.6s ease-out 0.2s both`
}));

const StyledInfoPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.5),
    borderRadius: '12px',
    border: '1px solid #F1F5F9',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    animation: `${fadeIn} 0.6s ease-out 0.1s both`
}));

const EventStorage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { t } = useTranslation();

    // 페이지 로드 시 스크롤을 맨 위로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({
        eventName: '',
        organizerName: '',
        email: '',
        phone: '',
        eventType: '',
        expectedAttendees: '',
        estimatedStorage: '',
        eventVenue: '',
        eventAddress: '',
        eventDate: null as Date | null,
        startTime: null as Date | null,
        endTime: null as Date | null,
        setupTime: null as Date | null,
        additionalRequirements: '',
        agreeTerms: false
    });

    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [error, setError] = useState('');
    const [submissionId, setSubmissionId] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, checked} = e.target;
        setFormData({...formData, [name]: checked});
    };

    const handleDateChange = (date: Date | null, fieldName: string) => {
        setFormData({...formData, [fieldName]: date});
    };

    const handleCloseDialog = () => {
        setSuccessDialogOpen(false);
        // 폼 초기화 등 추가 작업을 여기에 구현할 수 있습니다
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 간단한 유효성 검사
        if (!formData.eventName || !formData.email || !formData.phone || !formData.eventDate || !formData.agreeTerms) {
            setError('필수 항목을 모두 입력해주세요.');
            return;
        }

        try {
            // 실제 서버로 데이터 전송 (실제 구현시에는 API 경로 변경 필요)
            const response = await fetch('/api/EventStorage', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            // 여기가 문제입니다. 403 응답은 JSON 본문이 없을 수 있습니다.
            if (!response.ok) {
                // 응답 상태에 따라 다르게 처리
                if (response.status === 403) {
                    throw new Error('접근 권한이 없습니다. 로그인이 필요할 수 있습니다.');
                } else {
                    // 응답 본문이 있는지 먼저 확인
                    const text = await response.text();
                    let errorMessage = '서버 오류가 발생했습니다';

                    if (text) {
                        try {
                            const errorData = JSON.parse(text);
                            errorMessage = errorData.message || errorMessage;
                        } catch (e) {
                            // JSON 파싱 실패 시 텍스트 그대로 사용
                            errorMessage = text || errorMessage;
                        }
                    }

                    throw new Error(errorMessage);
                }
            }

            const data = await response.json();
            setSubmissionId(data.data.submissionId); // 서버에서 반환한 ID 저장
            setSuccessDialogOpen(true);
            setError('');

            // 폼 초기화 또는 다른 후속 작업
        } catch (err) {
            console.error('제출 오류:', err);
            setError(err instanceof Error ? err.message : '제출 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const benefits = [
        {
            icon: <EventIcon sx={{ fontSize: 32, color: '#3B82F6' }}/>,
            title: '편리한 이벤트 진행',
            description: '관객들의 짐 보관 문제를 해결하여 이벤트 경험을 향상시킵니다.',
        },
        {
            icon: <LocalShippingIcon sx={{ fontSize: 32, color: '#10B981' }}/>,
            title: '이동식 솔루션',
            description: '원하는 장소에 맞춤형 규모의 짐 보관 서비스를 제공합니다.',
        },
        {
            icon: <LocationOnIcon sx={{ fontSize: 32, color: '#F59E0B' }}/>,
            title: '유연한 설치',
            description: '공간 제약에 맞게 다양한 크기와 배치로 설치 가능합니다.',
        },
        {
            icon: <SupportAgentIcon sx={{ fontSize: 32, color: '#8B5CF6' }}/>,
            title: '전문 운영 인력',
            description: '전문 인력이 짐 보관부터 반환까지 모든 과정을 안전하게 관리합니다.',
        },
    ];

    return (
        <>
            <Navbar />
            <Box sx={{ 
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
                pt: { xs: 10, md: 12 },
                pb: { xs: 8, md: 12 },
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* 배경 장식 */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        right: '5%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 70%)',
                        borderRadius: '50%',
                        zIndex: 0,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: '20%',
                        left: '5%',
                        width: '150px',
                        height: '150px',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0) 70%)',
                        borderRadius: '50%',
                        zIndex: 0,
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    {/* 헤더 */}
                    <Box sx={{ 
                        mb: 6, 
                        textAlign: 'center',
                        animation: `${fadeIn} 0.8s ease-out`
                    }}>
                        <Typography 
                            variant="h2" 
                            component="h1"
                            sx={{
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                fontWeight: 700,
                                color: '#0F172A',
                                mb: 2,
                                letterSpacing: '-0.01em'
                            }}
                        >
                            콘서트 및 행사 전용 이동식 짐보관 신청
                        </Typography>
                        <Typography 
                            variant="h6"
                            sx={{
                                color: '#64748B',
                                fontSize: '1.1rem',
                                fontWeight: 400,
                                lineHeight: 1.6,
                                maxWidth: 800,
                                mx: 'auto'
                            }}
                        >
                            TravelLight의 이동식 짐보관 서비스로 콘서트, 페스티벌, 기업 행사를 더욱 편리하게 진행하세요.
                            현장에 직접 설치되는 맞춤형 짐보관 솔루션으로 관객들에게 특별한 경험을 제공합니다.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ animation: `${fadeIn} 0.6s ease-out 0.1s both` }}>
                                <Typography 
                                    variant="h4" 
                                    component="h2" 
                                    sx={{
                                        mb: 3, 
                                        fontWeight: 600,
                                        color: '#1E293B'
                                    }}
                                >
                                    서비스 특징
                                </Typography>

                                <Grid container spacing={2}>
                                    {benefits.map((benefit, index) => (
                                        <Grid item xs={6} sm={6} key={index}>
                                            <StyledCard>
                                                {benefit.icon}
                                                <Typography 
                                                    variant="subtitle1" 
                                                    component="h3"
                                                    sx={{
                                                        mt: 1, 
                                                        mb: 0.5,
                                                        fontWeight: 600,
                                                        color: '#1E293B',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {benefit.title}
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{
                                                        color: '#64748B',
                                                        lineHeight: 1.4,
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {benefit.description}
                                                </Typography>
                                            </StyledCard>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Box sx={{ mt: 4 }}>
                                    <Typography 
                                        variant="h5" 
                                        component="h3" 
                                        sx={{
                                            mb: 2, 
                                            fontWeight: 600,
                                            color: '#1E293B'
                                        }}
                                    >
                                        이동식 짐보관 서비스 안내
                                    </Typography>

                                    <StyledInfoPaper>
                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: '#1E293B',
                                                        mb: 1
                                                    }}
                                                >
                                                    규모 및 용량
                                                </Typography>
                                                <Typography 
                                                    variant="body2"
                                                    sx={{ 
                                                        color: '#64748B',
                                                        lineHeight: 1.6
                                                    }}
                                                >
                                                    윙바디 트럭 1대 기준 약 300개의 짐을 보관할 수 있으며, 행사 규모에 따라 복수의 트럭을 배치할 수 있습니다.
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ borderColor: '#F1F5F9' }}/>
                                            <Box>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: '#1E293B',
                                                        mb: 1
                                                    }}
                                                >
                                                    서비스 운영 방식
                                                </Typography>
                                                <Typography 
                                                    variant="body2"
                                                    sx={{ 
                                                        color: '#64748B',
                                                        lineHeight: 1.6
                                                    }}
                                                >
                                                    행사 시작 2시간 전에 현장에 도착하여 설치를 완료하고, 행사 종료 후 모든 짐이 반환될 때까지 서비스를 제공합니다.
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ borderColor: '#F1F5F9' }}/>
                                            <Box>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: '#1E293B',
                                                        mb: 1
                                                    }}
                                                >
                                                    보안 및 안전
                                                </Typography>
                                                <Typography 
                                                    variant="body2"
                                                    sx={{ 
                                                        color: '#64748B',
                                                        lineHeight: 1.6
                                                    }}
                                                >
                                                    전문 스태프가 상시 대기하며, 디지털 태그와 QR코드 시스템을 통해 안전하게 짐을 관리합니다.
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ borderColor: '#F1F5F9' }}/>
                                            <Box>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: '#1E293B',
                                                        mb: 1
                                                    }}
                                                >
                                                    맞춤형 브랜딩
                                                </Typography>
                                                <Typography 
                                                    variant="body2"
                                                    sx={{ 
                                                        color: '#64748B',
                                                        lineHeight: 1.6
                                                    }}
                                                >
                                                    행사나 이벤트 로고로 짐보관소를 맞춤 브랜딩하여 특별한 경험을 제공할 수 있습니다.
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ borderColor: '#F1F5F9' }}/>
                                            <Box>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: '#1E293B',
                                                        mb: 1
                                                    }}
                                                >
                                                    이용 요금
                                                </Typography>
                                                <Typography 
                                                    variant="body2"
                                                    sx={{ 
                                                        color: '#64748B',
                                                        lineHeight: 1.6
                                                    }}
                                                >
                                                    행사 규모, 기간, 위치에 따라 맞춤 견적이 제공됩니다. 견적은 신청서 접수 후 개별 연락드립니다.
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </StyledInfoPaper>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <StyledFormPaper>
                                <Typography 
                                    variant="h4" 
                                    component="h2" 
                                    sx={{
                                        mb: 4, 
                                        fontWeight: 600,
                                        color: '#1E293B'
                                    }}
                                >
                                    이동식 짐보관 서비스 신청
                                </Typography>

                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            label="행사명"
                                            name="eventName"
                                            value={formData.eventName}
                                            onChange={handleChange}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            required
                                            fullWidth
                                            label="담당자명"
                                            name="organizerName"
                                            value={formData.organizerName}
                                            onChange={handleChange}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            required
                                            fullWidth
                                            label="연락처"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            label="이메일"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>행사 유형</InputLabel>
                                            <Select
                                                name="eventType"
                                                value={formData.eventType}
                                                label="행사 유형"
                                                onChange={handleSelectChange}
                                            >
                                                <MenuItem value="콘서트">콘서트</MenuItem>
                                                <MenuItem value="페스티벌">페스티벌</MenuItem>
                                                <MenuItem value="전시회">전시회</MenuItem>
                                                <MenuItem value="컨퍼런스">컨퍼런스</MenuItem>
                                                <MenuItem value="스포츠 이벤트">스포츠 이벤트</MenuItem>
                                                <MenuItem value="기업 행사">기업 행사</MenuItem>
                                                <MenuItem value="기타">기타</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>예상 관객수</InputLabel>
                                            <Select
                                                name="expectedAttendees"
                                                value={formData.expectedAttendees}
                                                label="예상 관객수"
                                                onChange={handleSelectChange}
                                            >
                                                <MenuItem value="300명 미만">300명 미만</MenuItem>
                                                <MenuItem value="300-500명">300-500명</MenuItem>
                                                <MenuItem value="500-1000명">500-1000명</MenuItem>
                                                <MenuItem value="1000-3000명">1000-3000명</MenuItem>
                                                <MenuItem value="3000명 이상">3000명 이상</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth required>
                                            <InputLabel>예상 보관 짐 수량</InputLabel>
                                            <Select
                                                name="estimatedStorage"
                                                value={formData.estimatedStorage}
                                                label="예상 보관 짐 수량"
                                                onChange={handleSelectChange}
                                            >
                                                <MenuItem value="300개 미만 (트럭 1대)">300개 미만 (트럭 1대)</MenuItem>
                                                <MenuItem value="300-600개 (트럭 2대)">300-600개 (트럭 2대)</MenuItem>
                                                <MenuItem value="600-900개 (트럭 3대)">600-900개 (트럭 3대)</MenuItem>
                                                <MenuItem value="900개 이상 (트럭 4대 이상)">900개 이상 (트럭 4대 이상)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            label="행사 장소명"
                                            name="eventVenue"
                                            value={formData.eventVenue}
                                            onChange={handleChange}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            label="행사 장소 주소"
                                            name="eventAddress"
                                            value={formData.eventAddress}
                                            onChange={handleChange}
                                        />
                                    </Grid>

                                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                                        <Grid item xs={12} sm={6}>
                                            <DatePicker
                                                label="행사 날짜"
                                                value={formData.eventDate}
                                                onChange={(date) => handleDateChange(date, 'eventDate')}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        required: true,
                                                    }
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TimePicker
                                                label="현장 설치 시간"
                                                value={formData.setupTime}
                                                onChange={(time) => handleDateChange(time, 'setupTime')}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                    }
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TimePicker
                                                label="행사 시작 시간"
                                                value={formData.startTime}
                                                onChange={(time) => handleDateChange(time, 'startTime')}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                    }
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TimePicker
                                                label="행사 종료 시간"
                                                value={formData.endTime}
                                                onChange={(time) => handleDateChange(time, 'endTime')}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </LocalizationProvider>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="추가 요청사항"
                                            name="additionalRequirements"
                                            multiline
                                            rows={4}
                                            placeholder="특별한 요청사항이나 추가 정보를 알려주세요."
                                            value={formData.additionalRequirements}
                                            onChange={handleChange}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="agreeTerms"
                                                        checked={formData.agreeTerms}
                                                        onChange={handleCheckboxChange}
                                                        required
                                                    />
                                                }
                                                label="개인정보 수집 및 이용에 동의합니다."
                                            />
                                        </FormGroup>
                                    </Grid>

                                    {error && (
                                        <Grid item xs={12}>
                                            <Alert severity="error">{error}</Alert>
                                        </Grid>
                                    )}

                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            sx={{
                                                borderRadius: '8px',
                                                py: 1.5,
                                                fontWeight: 600,
                                                fontSize: '1.1rem',
                                                background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 4px 12px 0 rgba(59, 130, 246, 0.4)'
                                                },
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                        >
                                            이동식 짐보관 서비스 신청하기
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                            </StyledFormPaper>
                        </Grid>
                    </Grid>
                </Container>

            {/* 신청 완료 모달 대화상자 */}
            <Dialog
                open={successDialogOpen}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                disableEnforceFocus
            >
                <DialogTitle id="alert-dialog-title">
                    {"이동식 짐보관 서비스 신청이 완료되었습니다"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        이동식 짐보관 서비스 신청이 성공적으로 접수되었습니다. 영업일 기준 2일 이내에 담당자가 연락드릴 예정입니다.
                        <br/><br/>
                        <strong>신청번호: {submissionId}</strong>
                        <br/><br/>
                        신청번호를 메모해두시면 추후 문의 시 빠른 확인이 가능합니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary" autoFocus>
                        확인
                    </Button>
                </DialogActions>
                    </Dialog>
                <Footer />
            </Box>
        </>
    );
};

export default EventStorage;