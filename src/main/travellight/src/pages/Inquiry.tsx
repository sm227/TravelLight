import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Divider,
    Chip,
    FormHelperText,
    Stack,
    Snackbar,
    Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { Link as RouterLink } from 'react-router-dom';

/**
 * 1:1 문의하기 페이지 컴포넌트
 * 사용자가 고객센터에 직접 문의할 수 있는 폼을 제공합니다.
 */
const InquiryPage = () => {
    // 폼 상태 관리
    const [formData, setFormData] = useState({
        inquiryType: '',
        subject: '',
        content: '',
        email: '',
        phone: '',
        files: []
    });

    // 에러 상태 관리
    const [errors, setErrors] = useState({
        inquiryType: false,
        subject: false,
        content: false,
        email: false
    });

    // 제출 완료 상태
    const [isSubmitted, setIsSubmitted] = useState(false);

    // 알림 상태
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // 문의 유형 목록
    const inquiryTypes = [
        { id: 'reservation', name: '예약 및 결제 문의' },
        { id: 'delivery', name: '배송 서비스 문의' },
        { id: 'storage', name: '짐 보관 문의' },
        { id: 'account', name: '계정 관리 문의' },
        { id: 'refund', name: '환불 및 취소 문의' },
        { id: 'other', name: '기타 문의' }
    ];

    // 입력 필드 변경 핸들러
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // 입력 시 에러 상태 초기화
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: false
            });
        }
    };

    // 파일 첨부 핸들러
    const handleFileChange = (e) => {
        const fileList = Array.from(e.target.files);
        if (fileList.length > 0) {
            setFormData({
                ...formData,
                files: [...formData.files, ...fileList].slice(0, 3) // 최대 3개 파일로 제한
            });

            // 파일 선택 후 input 초기화
            e.target.value = '';

            // 파일 첨부 알림
            setNotification({
                open: true,
                message: '파일이 첨부되었습니다.',
                severity: 'success'
            });
        }
    };

    // 첨부 파일 제거 핸들러
    const handleRemoveFile = (index) => {
        const newFiles = [...formData.files];
        newFiles.splice(index, 1);
        setFormData({
            ...formData,
            files: newFiles
        });
    };

    // 알림 닫기 핸들러
    const handleCloseNotification = () => {
        setNotification({
            ...notification,
            open: false
        });
    };

    // 폼 유효성 검사
    const validateForm = () => {
        const newErrors = {
            inquiryType: !formData.inquiryType,
            subject: !formData.subject.trim(),
            content: formData.content.trim().length < 10,
            email: !formData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    // 문의 제출 핸들러
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            // 여기서 실제 API 호출을 수행합니다
            console.log('문의사항 제출:', formData);

            // 제출 완료 상태로 변경
            setIsSubmitted(true);

            // 성공 알림
            setNotification({
                open: true,
                message: '문의사항이 성공적으로 제출되었습니다.',
                severity: 'success'
            });
        } else {
            // 오류 알림
            setNotification({
                open: true,
                message: '필수 입력 항목을 확인해주세요.',
                severity: 'error'
            });
        }
    };

    // 새 문의 작성 핸들러
    const handleNewInquiry = () => {
        setFormData({
            inquiryType: '',
            subject: '',
            content: '',
            email: '',
            phone: '',
            files: []
        });
        setIsSubmitted(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            {/* 헤더 섹션 */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
                    1:1 문의하기
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    궁금한 점이나 도움이 필요한 사항을 자세히 알려주세요.
                </Typography>
                <Button
                    component={RouterLink}
                    to="/FAQ"
                    startIcon={<KeyboardBackspaceIcon />}
                    color="primary"
                    sx={{ mt: 2 }}
                >
                    자주 묻는 질문 보기
                </Button>
            </Box>

            {/* 제출 완료 메시지 */}
            {isSubmitted ? (
                <Paper elevation={2} sx={{ p: 4, mb: 4, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom color="primary.main">
                        문의가 접수되었습니다!
                    </Typography>
                    <Typography variant="body1" paragraph>
                        고객님의 문의사항이 성공적으로 접수되었습니다.
                        빠른 시일 내에 담당자가 검토 후 답변을 드리겠습니다.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        접수 번호: INQ-{new Date().getTime().toString().slice(-8)}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNewInquiry}
                        sx={{ mt: 2, borderRadius: '24px', px: 3 }}
                    >
                        새 문의 작성하기
                    </Button>
                </Paper>
            ) : (
                /* 문의 폼 */
                <Paper component="form" onSubmit={handleSubmit} elevation={2} sx={{ p: 4, borderRadius: 2 }}>
                    <Grid container spacing={3}>
                        {/* 문의 유형 선택 */}
                        <Grid item xs={12}>
                            <FormControl fullWidth error={errors.inquiryType}>
                                <InputLabel id="inquiry-type-label">문의 유형</InputLabel>
                                <Select
                                    labelId="inquiry-type-label"
                                    id="inquiryType"
                                    name="inquiryType"
                                    value={formData.inquiryType}
                                    onChange={handleInputChange}
                                    label="문의 유형"
                                    required
                                >
                                    {inquiryTypes.map((type) => (
                                        <MenuItem key={type.id} value={type.id}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.inquiryType && (
                                    <FormHelperText>문의 유형을 선택해주세요</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        {/* 제목 */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="제목"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                error={errors.subject}
                                helperText={errors.subject && "제목을 입력해주세요"}
                                required
                            />
                        </Grid>

                        {/* 문의 내용 */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="문의 내용"
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                multiline
                                rows={6}
                                error={errors.content}
                                helperText={errors.content && "문의 내용을 10자 이상 입력해주세요"}
                                required
                            />
                        </Grid>

                        {/* 첨부 파일 */}
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    파일 첨부 (선택)
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    최대 3개 파일, 각 파일 5MB 이하 (이미지, PDF 파일만 가능)
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<AttachFileIcon />}
                                    disabled={formData.files.length >= 3}
                                >
                                    파일 선택
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*, application/pdf"
                                        onChange={handleFileChange}
                                        multiple={formData.files.length < 3}
                                    />
                                </Button>
                            </Box>

                            {formData.files.length > 0 && (
                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                                    {formData.files.map((file, index) => (
                                        <Chip
                                            key={index}
                                            label={file.name}
                                            onDelete={() => handleRemoveFile(index)}
                                            sx={{ mb: 1 }}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                        </Grid>

                        {/* 연락처 정보 */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="이메일"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                error={errors.email}
                                helperText={errors.email && "유효한 이메일 주소를 입력해주세요"}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="연락처 (선택)"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="예: 010-1234-5678"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                                * 표시된 항목은 필수 입력 사항입니다.
                            </Typography>
                        </Grid>

                        {/* 제출 버튼 */}
                        <Grid item xs={12} sx={{ textAlign: 'center' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                endIcon={<SendIcon />}
                                sx={{ borderRadius: '24px', px: 4, py: 1.5 }}
                            >
                                문의 제출하기
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* 하단 안내 */}
            <Paper sx={{ mt: 6, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                            문의사항 처리 안내
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • 문의사항은 접수 후 24시간 이내에 답변 드립니다. (주말/공휴일 제외)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • 긴급한 문의는 고객센터(1588-0000)로 직접 연락 바랍니다.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • 이메일 주소로 답변 내용이 발송되니 정확하게 입력해 주세요.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' }}}>
                        <Box>
                            <Typography variant="body2" fontWeight="bold">
                                고객센터 운영시간
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                평일 09:00 - 18:00 (공휴일 제외)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                전화: 1588-0000
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* 알림 스낵바 */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default InquiryPage;