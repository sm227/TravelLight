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
    SelectChangeEvent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import ko from "date-fns/locale/ko";

const EventStorage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
            icon: <EventIcon sx={{fontSize: 56, color: 'primary.main'}}/>,
            title: '편리한 이벤트 진행',
            description: '관객들의 짐 보관 문제를 해결하여 이벤트 경험을 향상시킵니다.',
        },
        {
            icon: <LocalShippingIcon sx={{fontSize: 56, color: 'secondary.main'}}/>,
            title: '이동식 솔루션',
            description: '원하는 장소에 맞춤형 규모의 짐 보관 서비스를 제공합니다.',
        },
        {
            icon: <LocationOnIcon sx={{fontSize: 56, color: 'info.main'}}/>,
            title: '유연한 설치',
            description: '공간 제약에 맞게 다양한 크기와 배치로 설치 가능합니다.',
        },
        {
            icon: <SupportAgentIcon sx={{fontSize: 56, color: 'success.main'}}/>,
            title: '전문 운영 인력',
            description: '전문 인력이 짐 보관부터 반환까지 모든 과정을 안전하게 관리합니다.',
        },
    ];

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                pt: {xs: 12, md: 16},
                pb: {xs: 8, md: 12},
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

            <Container maxWidth="lg" sx={{position: 'relative', zIndex: 1}}>
                <Grid container spacing={6}>
                    <Grid item xs={12}>
                        <Typography
                            component="h1"
                            variant={isMobile ? 'h3' : 'h2'}
                            color="text.primary"
                            align="center"
                            gutterBottom
                            sx={{fontWeight: 700}}
                        >
                            콘서트 및 행사 전용 이동식 짐보관 신청
                        </Typography>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            align="center"
                            paragraph
                            sx={{maxWidth: 800, mx: 'auto', mb: 6}}
                        >
                            TravelLight의 이동식 짐보관 서비스로 콘서트, 페스티벌, 기업 행사를 더욱 편리하게 진행하세요.
                            현장에 직접 설치되는 맞춤형 짐보관 솔루션으로 관객들에게 특별한 경험을 제공합니다.
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box>
                            <Typography variant="h4" component="h2" sx={{mb: 4, fontWeight: 600}}>
                                서비스 특징
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
                                            <Typography variant="h6" component="h3"
                                                        sx={{mt: 2, fontWeight: 'bold'}}>
                                                {benefit.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                                {benefit.description}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            <Box sx={{mt: 6}}>
                                <Typography variant="h5" component="h3" sx={{mb: 2, fontWeight: 600}}>
                                    이동식 짐보관 서비스 안내
                                </Typography>

                                <Paper elevation={2} sx={{p: 3}}>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">규모 및 용량</Typography>
                                            <Typography variant="body2">
                                                윙바디 트럭 1대 기준 약 300개의 짐을 보관할 수 있으며, 행사 규모에 따라 복수의 트럭을 배치할 수 있습니다.
                                            </Typography>
                                        </Box>
                                        <Divider/>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">서비스 운영 방식</Typography>
                                            <Typography variant="body2">
                                                행사 시작 2시간 전에 현장에 도착하여 설치를 완료하고, 행사 종료 후 모든 짐이 반환될 때까지 서비스를 제공합니다.
                                            </Typography>
                                        </Box>
                                        <Divider/>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">보안 및 안전</Typography>
                                            <Typography variant="body2">
                                                전문 스태프가 상시 대기하며, 디지털 태그와 QR코드 시스템을 통해 안전하게 짐을 관리합니다.
                                            </Typography>
                                        </Box>
                                        <Divider/>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">맞춤형 브랜딩</Typography>
                                            <Typography variant="body2">
                                                행사나 이벤트 로고로 짐보관소를 맞춤 브랜딩하여 특별한 경험을 제공할 수 있습니다.
                                            </Typography>
                                        </Box>
                                        <Divider/>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">이용 요금</Typography>
                                            <Typography variant="body2">
                                                행사 규모, 기간, 위치에 따라 맞춤 견적이 제공됩니다. 견적은 신청서 접수 후 개별 연락드립니다.
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper elevation={4} sx={{p: 4, borderRadius: 2}}>
                            <Typography variant="h4" component="h2" sx={{mb: 4, fontWeight: 600}}>
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
                                                borderRadius: '28px',
                                                py: 1.5,
                                                fontWeight: 'bold',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            이동식 짐보관 서비스 신청하기
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
        </Box>
    );
};

export default EventStorage;