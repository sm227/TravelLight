import React, { useState } from 'react';
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
    Switch,
    SelectChangeEvent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const StoragePartnership: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        businessType: '',
        spaceSize: '',
        additionalInfo: '',
        agreeTerms: false,
        is24Hours: false,
        businessHours: {
            mon: { enabled: true, open: '09:00', close: '18:00' },
            tue: { enabled: true, open: '09:00', close: '18:00' },
            wed: { enabled: true, open: '09:00', close: '18:00' },
            thu: { enabled: true, open: '09:00', close: '18:00' },
            fri: { enabled: true, open: '09:00', close: '18:00' },
            sat: { enabled: true, open: '09:00', close: '18:00' },
            sun: { enabled: true, open: '09:00', close: '18:00' }
        }
    });

    const [businessHoursExpanded, setBusinessHoursExpanded] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [error, setError] = useState('');
    const [submissionId, setSubmissionId] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData({ ...formData, [name]: checked });
    };

    const handle24HoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setFormData({ ...formData, is24Hours: checked });
    };

    const handleDayToggle = (day: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setFormData({
            ...formData,
            businessHours: {
                ...formData.businessHours,
                [day]: {
                    ...formData.businessHours[day as keyof typeof formData.businessHours],
                    enabled: checked
                }
            }
        });
    };

    const handleTimeChange = (day: string, type: 'open' | 'close') => (e: SelectChangeEvent) => {
        const value = e.target.value;
        setFormData({
            ...formData,
            businessHours: {
                ...formData.businessHours,
                [day]: {
                    ...formData.businessHours[day as keyof typeof formData.businessHours],
                    [type]: value
                }
            }
        });
    };

    const toggleBusinessHoursExpanded = () => {
        setBusinessHoursExpanded(!businessHoursExpanded);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 간단한 유효성 검사
        if (!formData.businessName || !formData.email || !formData.phone || !formData.agreeTerms) {
            setError('필수 항목을 모두 입력해주세요.');
            return;
        }

        try {
            // 실제 서버로 데이터 전송
            const response = await fetch('/api/partnership', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '서버 오류가 발생했습니다');
            }

            const data = await response.json();
            setSubmissionId(data.data.submissionId); // 서버에서 반환한 ID 저장
            setSuccessDialogOpen(true);
            setError('');

            // 폼 초기화 또는 다른 후속 작업
        } catch (err) {
            console.error('제출 오류:', err);
            setError('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleCloseDialog = () => {
        setSuccessDialogOpen(false);
        // 폼 초기화 등 추가 작업을 여기에 구현할 수 있습니다
    };

    const dayLabels: Record<string, string> = {
        mon: '월',
        tue: '화',
        wed: '수',
        thu: '목',
        fri: '금',
        sat: '토',
        sun: '일'
    };

    const benefits = [
        {
            icon: <MonetizationOnIcon sx={{ fontSize: 56, color: 'primary.main' }} />,
            title: '추가 수익 창출',
            description: '사용하지 않는 공간을 활용하여 새로운 수익원을 창출하세요. 고객이 많을수록 수익도 증가합니다.',
        },
        {
            icon: <StorefrontIcon sx={{ fontSize: 56, color: 'secondary.main' }} />,
            title: '고객 유입 증가',
            description: '짐보관 서비스를 찾는 여행객들이 귀하의 매장을 방문하게 되어 추가 판매 기회가 생깁니다.',
        },
        {
            icon: <HandshakeIcon sx={{ fontSize: 56, color: 'info.main' }} />,
            title: '간편한 운영',
            description: '저희의 플랫폼과 시스템을 활용하여 복잡한 절차 없이 쉽게 서비스를 제공할 수 있습니다.',
        },
        {
            icon: <SupportAgentIcon sx={{ fontSize: 56, color: 'success.main' }} />,
            title: '전문적인 지원',
            description: '고객 서비스부터 기술 지원까지, TravelLight가 모든 과정을 도와드립니다.',
        },
    ];

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                pt: { xs: 12, md: 16 },
                pb: { xs: 8, md: 12 },
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* 배경 장식 */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    backgroundColor: 'primary.light',
                    opacity: 0.1,
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -150,
                    left: -150,
                    width: 500,
                    height: 500,
                    borderRadius: '50%',
                    backgroundColor: 'secondary.light',
                    opacity: 0.1,
                    zIndex: 0,
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={6}>
                    <Grid item xs={12}>
                        <Typography
                            component="h1"
                            variant={isMobile ? 'h3' : 'h2'}
                            color="text.primary"
                            align="center"
                            gutterBottom
                            sx={{ fontWeight: 700 }}
                        >
                            짐보관 서비스 제휴 신청
                        </Typography>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            align="center"
                            paragraph
                            sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}
                        >
                            TravelLight와 함께 여분의 공간을 활용하여 추가 수익을 창출하세요.
                            간단한 시스템으로 손쉽게 짐보관 서비스를 제공하고 새로운 고객층을 확보할 수 있습니다.
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box>
                            <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
                                제휴 혜택
                            </Typography>

                            <Grid container spacing={3}>
                                {benefits.map((benefit, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Paper
                                            elevation={3}
                                            sx={{
                                                p: 3,
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                transition: 'transform 0.3s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    boxShadow: 6,
                                                },
                                            }}
                                        >
                                            {benefit.icon}
                                            <Typography variant="h6" component="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                                                {benefit.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {benefit.description}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            <Box sx={{ mt: 6 }}>
                                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                                    제휴 진행 과정
                                </Typography>

                                <Paper elevation={2} sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">1. 제휴 신청</Typography>
                                            <Typography variant="body2">우측의 양식을 작성하여 제휴 신청을 완료합니다.</Typography>
                                        </Box>
                                        <Divider />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">2. 심사 및 연락</Typography>
                                            <Typography variant="body2">TravelLight 팀이 신청 내용을 검토 후 영업일 기준 3일 이내에 연락드립니다.</Typography>
                                        </Box>
                                        <Divider />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">3. 현장 방문 및 계약</Typography>
                                            <Typography variant="body2">담당 매니저가 방문하여 공간을 확인하고 세부 계약을 진행합니다.</Typography>
                                        </Box>
                                        <Divider />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">4. 서비스 교육</Typography>
                                            <Typography variant="body2">TravelLight 사용법 교육을 제공합니다.</Typography>
                                        </Box>
                                        <Divider />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">5. 서비스 오픈</Typography>
                                            <Typography variant="body2">TravelLight 플랫폼에 등록되어 고객들에게 노출됩니다.</Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper elevation={4} sx={{ p: 4, borderRadius: 2 }}>
                            <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
                                제휴 신청하기
                            </Typography>

                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            label="상호명"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            required
                                            fullWidth
                                            label="대표자명"
                                            name="ownerName"
                                            value={formData.ownerName}
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

                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            label="주소"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>업종</InputLabel>
                                            <Select
                                                name="businessType"
                                                value={formData.businessType}
                                                label="업종"
                                                onChange={handleSelectChange}
                                            >
                                                <MenuItem value="카페">카페</MenuItem>
                                                <MenuItem value="숙박">숙박업소</MenuItem>
                                                <MenuItem value="편의점">편의점</MenuItem>
                                                <MenuItem value="식당">식당</MenuItem>
                                                <MenuItem value="소매점">소매점</MenuItem>
                                                <MenuItem value="기타">기타</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>보관 가능 공간 크기</InputLabel>
                                            <Select
                                                name="spaceSize"
                                                value={formData.spaceSize}
                                                label="보관 가능 공간 크기"
                                                onChange={handleSelectChange}
                                            >
                                                <MenuItem value="small">소형 (5평 미만)</MenuItem>
                                                <MenuItem value="medium">중형 (5-10평)</MenuItem>
                                                <MenuItem value="large">대형 (10평 이상)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* 영업시간 섹션 */}
                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6">영업시간 추가</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2" sx={{ mr: 1 }}>24시간 영업</Typography>
                                                    <Switch
                                                        checked={formData.is24Hours}
                                                        onChange={handle24HoursChange}
                                                    />
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                Bounce 서비스에 대한 고객들의 이용 가능 시간을 알려주세요.
                                            </Typography>

                                            {/* 요일 선택 및 시간 입력 */}
                                            <Box sx={{ mb: 1 }}>
                                                <Button
                                                    variant="text"
                                                    onClick={toggleBusinessHoursExpanded}
                                                    endIcon={<KeyboardArrowDownIcon sx={{
                                                        transform: businessHoursExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.3s'
                                                    }} />}
                                                    sx={{ mb: 1 }}
                                                >
                                                    {businessHoursExpanded ? '접기' : '펼치기'}
                                                </Button>

                                                {/* 첫 번째 줄 (월요일) - 항상 표시 */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <Checkbox
                                                        checked={formData.businessHours.mon.enabled}
                                                        onChange={handleDayToggle('mon')}
                                                        disabled={formData.is24Hours}
                                                    />
                                                    <Typography sx={{ width: 40 }}>{dayLabels.mon}</Typography>
                                                    {formData.is24Hours ? (
                                                        <Typography variant="body2" sx={{ ml: 2 }}>
                                                            24시간 영업
                                                        </Typography>
                                                    ) : (
                                                        <>
                                                            <FormControl sx={{ mx: 1, minWidth: 120 }} size="small">
                                                                <Select
                                                                    value={formData.businessHours.mon.open}
                                                                    onChange={handleTimeChange('mon', 'open')}
                                                                    disabled={!formData.businessHours.mon.enabled || formData.is24Hours}
                                                                >
                                                                    {Array.from({ length: 24 }, (_, i) => (
                                                                        <MenuItem key={`open-${i}`} value={`${i.toString().padStart(2, '0')}:00`}>
                                                                            {`${i.toString().padStart(2, '0')}:00`}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                            <Typography variant="body2" sx={{ mx: 1 }}>-</Typography>
                                                            <FormControl sx={{ minWidth: 120 }} size="small">
                                                                <Select
                                                                    value={formData.businessHours.mon.close}
                                                                    onChange={handleTimeChange('mon', 'close')}
                                                                    disabled={!formData.businessHours.mon.enabled || formData.is24Hours}
                                                                >
                                                                    {Array.from({ length: 24 }, (_, i) => (
                                                                        <MenuItem key={`close-${i}`} value={`${i.toString().padStart(2, '0')}:00`}>
                                                                            {`${i.toString().padStart(2, '0')}:00`}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </>
                                                    )}
                                                </Box>

                                                {/* 다른 요일들 - 펼치기를 누르면 표시 */}
                                                {businessHoursExpanded && Object.entries(formData.businessHours)
                                                    .filter(([day]) => day !== 'mon')
                                                    .map(([day, hours]) => (
                                                        <Box key={day} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <Checkbox
                                                                checked={hours.enabled}
                                                                onChange={handleDayToggle(day)}
                                                                disabled={formData.is24Hours}
                                                            />
                                                            <Typography sx={{ width: 40 }}>{dayLabels[day]}</Typography>
                                                            {formData.is24Hours ? (
                                                                <Typography variant="body2" sx={{ ml: 2 }}>
                                                                    24시간 영업
                                                                </Typography>
                                                            ) : (
                                                                <>
                                                                    <FormControl sx={{ mx: 1, minWidth: 120 }} size="small">
                                                                        <Select
                                                                            value={hours.open}
                                                                            onChange={handleTimeChange(day, 'open')}
                                                                            disabled={!hours.enabled || formData.is24Hours}
                                                                        >
                                                                            {Array.from({ length: 24 }, (_, i) => (
                                                                                <MenuItem key={`${day}-open-${i}`} value={`${i.toString().padStart(2, '0')}:00`}>
                                                                                    {`${i.toString().padStart(2, '0')}:00`}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </Select>
                                                                    </FormControl>
                                                                    <Typography variant="body2" sx={{ mx: 1 }}>-</Typography>
                                                                    <FormControl sx={{ minWidth: 120 }} size="small">
                                                                        <Select
                                                                            value={hours.close}
                                                                            onChange={handleTimeChange(day, 'close')}
                                                                            disabled={!hours.enabled || formData.is24Hours}
                                                                        >
                                                                            {Array.from({ length: 24 }, (_, i) => (
                                                                                <MenuItem key={`${day}-close-${i}`} value={`${i.toString().padStart(2, '0')}:00`}>
                                                                                    {`${i.toString().padStart(2, '0')}:00`}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </Select>
                                                                    </FormControl>
                                                                </>
                                                            )}
                                                        </Box>
                                                    ))}
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="추가 정보"
                                            name="additionalInfo"
                                            multiline
                                            rows={4}
                                            placeholder="궁금한 점이나 추가 정보를 알려주세요."
                                            value={formData.additionalInfo}
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
                                                borderRadius: '28px',
                                                py: 1.5,
                                                fontWeight: 'bold',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            제휴 신청하기
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
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
                    {"제휴 신청이 완료되었습니다"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        제휴 신청이 성공적으로 접수되었습니다. 영업일 기준 3일 이내에 담당자가 연락드릴 예정입니다.
                        <br /><br />
                        <strong>신청번호: {submissionId}</strong>
                        <br /><br />
                        신청번호를 메모해두시면 추후 문의 시 빠른 확인이 가능합니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary" autoFocus>
                        확인
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StoragePartnership;