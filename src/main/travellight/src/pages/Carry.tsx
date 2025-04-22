import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Stepper,
    Step,
    StepLabel,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Radio,
    RadioGroup,
    Button,
    Grid,
    Divider,
    IconButton,
    Card,
    CardContent,
    Alert,
    Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Add, Remove, LuggageOutlined, DirectionsBoat, LocationOn } from '@mui/icons-material';
import ko from 'date-fns/locale/ko';

const LuggageDeliveryForm = () => {
    // 현재 활성화된 단계를 관리
    const [activeStep, setActiveStep] = useState(0);

    // 가격 정보
    const PRICES = {
        small: 3000,  // 소형 가격
        medium: 5000, // 중형 가격
        large: 8000   // 대형 가격
    };

    // 메시지
    const [errorMessage, setErrorMessage] = useState('');

    // 폼 데이터를 관리
    const [formData, setFormData] = useState({
        // 기본 정보
        origin: '', // 출발지
        destination: '', // 도착지
        pickupDate: null, // 수거
        deliveryDate: null, // 배송

        // 짐 정보
        luggageItems: {
            small: 0,  // 소형 사이즈
            medium: 0, // 중형 사이즈
            large: 0   // 대형 사이즈
        },
        specialHandling: false, // 특수 취급 필요 여부

        // 고객 정보
        senderName: '', // 보내는 사람 이름
        senderPhone: '', // 보내는 사람 전화번호
        senderEmail: '', // 보내는 사람 이메일
        receiverName: '', // 받는 사람 이름
        receiverPhone: '', // 받는 사람 전화번호
        receiverEmail: '', // 받는 사람 이메일
        sameAsReceiver: false, // 보내는 사람과 받는 사람 정보 동일 여부

        // 결제 정보
        paymentMethod: 'card' // 결제 방법 (기본값: 카드)
    });

    // 예약 단계 정의
    const steps = ['기본 정보 입력', '짐 정보 입력', '고객 정보 입력', '결제 정보'];

    // 입력 필드 값 변경
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    //날짜 변경
    const handleDateChange = (name, date) => {
        setFormData({
            ...formData,
            [name]: date
        });
    };

    //짐 수량 변경
    const handleLuggageChange = (type, operation) => {
        setFormData(prev => ({
            ...prev,
            luggageItems: {
                ...prev.luggageItems,
                [type]: operation === 'add'
                    ? prev.luggageItems[type] + 1
                    : Math.max(0, prev.luggageItems[type] - 1)
            }
        }));
    };

    const handleSameAsReceiverChange = (e) => {
        const isChecked = e.target.checked;
        setFormData(prev => ({
            ...prev,
            sameAsReceiver: isChecked,
            receiverName: isChecked ? prev.senderName : prev.receiverName,
            receiverPhone: isChecked ? prev.senderPhone : prev.receiverPhone,
            receiverEmail: isChecked ? prev.senderEmail : prev.receiverEmail
        }));
    };

    const handleNext = () => {
        // 현재 단계에 따른 유효성 검사
        if (validateCurrentStep()) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setErrorMessage('');
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        setErrorMessage('');
    };

    const validateCurrentStep = () => {
        switch (activeStep) {
            case 0: // 기본 정보 단계
                if (!formData.origin || !formData.destination || !formData.pickupDate || !formData.deliveryDate) {
                    setErrorMessage('출발지, 도착지, 수거일, 배송일을 모두 입력해주세요.');
                    return false;
                }
                return true;

            case 1: // 짐 정보 단계
                const totalItems = formData.luggageItems.small + formData.luggageItems.medium + formData.luggageItems.large;
                if (totalItems === 0) {
                    setErrorMessage('최소 1개 이상의 짐을 선택해주세요.');
                    return false;
                }
                return true;

            case 2: // 고객 정보 단계
                if (!formData.senderName || !formData.senderPhone || !formData.senderEmail) {
                    setErrorMessage('보내는 분의 정보를 모두 입력해주세요.');
                    return false;
                }
                if (!formData.receiverName || !formData.receiverPhone || !formData.receiverEmail) {
                    setErrorMessage('받는 분의 정보를 모두 입력해주세요.');
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    const calculateTotalPrice = () => {
        return (
            formData.luggageItems.small * PRICES.small +
            formData.luggageItems.medium * PRICES.medium +
            formData.luggageItems.large * PRICES.large
        );
    };

    //출발지 도착지 정보
    const renderLocationForm = () => (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                출발지 및 도착지 정보
            </Typography>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* 출발지 선택 */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="origin-label">출발지 선택</InputLabel>
                        <Select
                            labelId="origin-label"
                            id="origin"
                            name="origin"
                            value={formData.origin}
                            onChange={handleChange}
                            label="출발지 선택"
                        >
                            <MenuItem value="seoul">서울</MenuItem>
                            <MenuItem value="busan">부산</MenuItem>
                            <MenuItem value="incheon">인천</MenuItem>
                            <MenuItem value="jeju">제주</MenuItem>
                            <MenuItem value="daegu">대구</MenuItem>
                            <MenuItem value="daejeon">대전</MenuItem>
                            <MenuItem value="gwangju">광주</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                {/* 도착지 선택 */}
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="destination-label">도착지 선택</InputLabel>
                        <Select
                            labelId="destination-label"
                            id="destination"
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            label="도착지 선택"
                        >
                            <MenuItem value="seoul">서울</MenuItem>
                            <MenuItem value="busan">부산</MenuItem>
                            <MenuItem value="incheon">인천</MenuItem>
                            <MenuItem value="jeju">제주</MenuItem>
                            <MenuItem value="daegu">대구</MenuItem>
                            <MenuItem value="daejeon">대전</MenuItem>
                            <MenuItem value="gwangju">광주</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                {/* 수거 희망일 선택 */}
                <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                        <DatePicker
                            label="수거 희망일"
                            value={formData.pickupDate}
                            onChange={(date) => handleDateChange('pickupDate', date)}
                            slots={{
                                textField: (params) => <TextField {...params} fullWidth margin="normal" />
                            }}
                        />
                    </LocalizationProvider>
                </Grid>
                {/* 배송 희망일 선택 */}
                <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                        <DatePicker
                            label="배송 희망일"
                            value={formData.deliveryDate}
                            onChange={(date) => handleDateChange('deliveryDate', date)}
                            slots={{
                                textField: (params) => <TextField {...params} fullWidth margin="normal" />
                            }}
                        />
                    </LocalizationProvider>
                </Grid>
            </Grid>
        </Box>
    );

    //짐 정보
    const renderLuggageForm = () => (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                보내는 짐의 크기와 갯수를 알려주세요
            </Typography>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            <Card sx={{ mb: 4, mt: 2, border: '1px solid #f0f0f0' }}>
                <CardContent>
                    <Grid container spacing={2}>
                        {/* 소형 사이즈 */}
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <Typography variant="h6">소형 가방</Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    노트북 가방, 배낭 등<br />
                                    최장변 길이 15인치 이하
                                </Typography>
                                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', my: 1 }}>
                                    3,000원 / 개
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                                    <IconButton
                                        onClick={() => handleLuggageChange('small', 'subtract')}
                                        disabled={formData.luggageItems.small === 0}
                                    >
                                        <Remove />
                                    </IconButton>
                                    <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>
                                        {formData.luggageItems.small}
                                    </Typography>
                                    <IconButton onClick={() => handleLuggageChange('small', 'add')}>
                                        <Add />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Grid>

                        {/* 중형 사이즈 */}
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <Typography variant="h6">중형 가방</Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    기내용 캐리어, 등산가방 등<br />
                                    최장변 길이 24인치 이하
                                </Typography>
                                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', my: 1 }}>
                                    5,000원 / 개
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                                    <IconButton
                                        onClick={() => handleLuggageChange('medium', 'subtract')}
                                        disabled={formData.luggageItems.medium === 0}
                                    >
                                        <Remove />
                                    </IconButton>
                                    <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>
                                        {formData.luggageItems.medium}
                                    </Typography>
                                    <IconButton onClick={() => handleLuggageChange('medium', 'add')}>
                                        <Add />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Grid>

                        {/* 대형 사이즈 */}
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                <Typography variant="h6">대형 가방</Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    대형 캐리어, 골프백, 대형배낭 등<br />
                                    최장변 길이 24인치 이상
                                </Typography>
                                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', my: 1 }}>
                                    8,000원 / 개
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                                    <IconButton
                                        onClick={() => handleLuggageChange('large', 'subtract')}
                                        disabled={formData.luggageItems.large === 0}
                                    >
                                        <Remove />
                                    </IconButton>
                                    <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>
                                        {formData.luggageItems.large}
                                    </Typography>
                                    <IconButton onClick={() => handleLuggageChange('large', 'add')}>
                                        <Add />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                        <Typography variant="body2" color="error">
                            ⚠️ 다음과 같은 물품은 제한됩니다.
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                            <Typography component="li" variant="body2">
                                유리나 박스 등 파손 및 훼손 우려가 있는 물품
                            </Typography>
                            <Typography component="li" variant="body2">
                                부패 및 액체가 심한 물품
                            </Typography>
                            <Typography component="li" variant="body2">
                                유해를 가할 수 있는 물품
                            </Typography>
                            <Typography component="li" variant="body2">
                                일반 화물수하물 취급항목 초과 물품
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* 특수 취급 필요 여부 */}
            <FormControl component="fieldset" margin="normal">
                <Typography variant="subtitle1" gutterBottom>
                    특수 취급 필요 여부
                </Typography>
                <RadioGroup
                    row
                    name="specialHandling"
                    value={formData.specialHandling}
                    onChange={(e) => setFormData({
                        ...formData,
                        specialHandling: e.target.value === 'true'
                    })}
                >
                    <FormControlLabel value={true} control={<Radio />} label="예" />
                    <FormControlLabel value={false} control={<Radio />} label="아니오" />
                </RadioGroup>
            </FormControl>
        </Box>
    );

    //고객 입력
    const renderCustomerForm = () => (
        <Box sx={{ mt: 3 }}>
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            {/* 보내는 사람 정보 섹션 */}
            <Typography variant="h6" gutterBottom>
                보내는 분 정보
            </Typography>
            <Grid container spacing={3}>
                {/* 보내는 사람 이름 */}
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        margin="normal"
                        id="senderName"
                        name="senderName"
                        label="이름"
                        value={formData.senderName}
                        onChange={handleChange}
                        required
                    />
                </Grid>
                {/* 보내는 사람 연락처 */}
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        margin="normal"
                        id="senderPhone"
                        name="senderPhone"
                        label="연락처"
                        value={formData.senderPhone}
                        onChange={handleChange}
                        required
                    />
                </Grid>
                {/* 보내는 사람 이메일 */}
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        margin="normal"
                        id="senderEmail"
                        name="senderEmail"
                        label="이메일"
                        type="email"
                        value={formData.senderEmail}
                        onChange={handleChange}
                        required
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* 받는 사람 정보 섹션 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">받는 분 정보</Typography>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.sameAsReceiver}
                            onChange={handleSameAsReceiverChange}
                            name="sameAsReceiver"
                            color="primary"
                        />
                    }
                    label="보내는 분과 동일"
                    sx={{ ml: 2 }}
                />
            </Box>
            <Grid container spacing={3}>
                {/* 받는 사람 이름 */}
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        margin="normal"
                        id="receiverName"
                        name="receiverName"
                        label="이름"
                        value={formData.receiverName}
                        onChange={handleChange}
                        required
                        disabled={formData.sameAsReceiver}
                    />
                </Grid>
                {/* 받는 사람 연락처 */}
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        margin="normal"
                        id="receiverPhone"
                        name="receiverPhone"
                        label="연락처"
                        value={formData.receiverPhone}
                        onChange={handleChange}
                        required
                        disabled={formData.sameAsReceiver}
                    />
                </Grid>
                {/* 받는 사람 이메일 */}
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        margin="normal"
                        id="receiverEmail"
                        name="receiverEmail"
                        label="이메일"
                        type="email"
                        value={formData.receiverEmail}
                        onChange={handleChange}
                        required
                        disabled={formData.sameAsReceiver}
                    />
                </Grid>
            </Grid>
        </Box>
    );

    //결제 창
    const renderPaymentForm = () => (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                결제 정보
            </Typography>
            {/* 결제 방법 선택 */}
            <FormControl component="fieldset" margin="normal">
                <Typography variant="subtitle1" gutterBottom>
                    결제 방법
                </Typography>
                <RadioGroup
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                >
                    <FormControlLabel value="card" control={<Radio />} label="신용카드" />
                    <FormControlLabel value="bank" control={<Radio />} label="계좌이체" />
                    <FormControlLabel value="phone" control={<Radio />} label="휴대폰 결제" />
                    <FormControlLabel value="virtual" control={<Radio />} label="가상계좌" />
                </RadioGroup>
            </FormControl>

            {/* 배송 요금 견적 표시 박스 */}
            <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    배송 요금 견적
                </Typography>
                <Grid container spacing={2}>
                    {/* S사이즈 요금 */}
                    <Grid item xs={8}>
                        <Typography>S사이즈 ({formData.luggageItems.small}개):</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography align="right">{(formData.luggageItems.small * PRICES.small).toLocaleString()}원</Typography>
                    </Grid>

                    {/* M사이즈 요금 */}
                    <Grid item xs={8}>
                        <Typography>M사이즈 ({formData.luggageItems.medium}개):</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography align="right">{(formData.luggageItems.medium * PRICES.medium).toLocaleString()}원</Typography>
                    </Grid>

                    {/* L사이즈 요금 */}
                    <Grid item xs={8}>
                        <Typography>L사이즈 ({formData.luggageItems.large}개):</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography align="right">{(formData.luggageItems.large * PRICES.large).toLocaleString()}원</Typography>
                    </Grid>

                    {/* 총 결제 금액 */}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                    </Grid>
                    <Grid item xs={8}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            총 결제 금액:
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="subtitle1" fontWeight="bold" align="right" color="primary.main">
                            {calculateTotalPrice().toLocaleString()}원
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );


    // 현재 폼 단계 상태 반환
    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return renderLocationForm(); // 기본 정보 단계
            case 1:
                return renderLuggageForm(); // 짐 정보 단계
            case 2:
                return renderCustomerForm(); // 고객 정보 단계
            case 3:
                return renderPaymentForm(); // 결제 정보 단계
            default:
                return "Unknown step"; // 예외 처리
        }
    };

    // 메인 렌더링 부분
    return (
        <Container maxWidth="md" sx={{ mb: 8 }}>
            {/* 메인 페이퍼 컴포넌트 (카드 형태의 UI) */}
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                {/* 헤더 타이틀 */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LuggageOutlined sx={{ fontSize: 36, mr: 1, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1" align="center" fontWeight="bold" color="primary.main">
                        TravelLight 짐 배송 예약
                    </Typography>
                </Box>

                {/* 스텝퍼 컴포넌트 (진행 단계 표시) */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* 현재 단계에 맞는 컨텐츠 렌더링 */}
                {getStepContent(activeStep)}

                {/* 네비게이션 버튼 (이전/다음) */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    {/* 이전 버튼 - 첫 단계에서는 비활성화 */}
                    <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                        sx={{ mr: 1 }}
                    >
                        이전
                    </Button>
                    <Box>
                        {/* 마지막 단계가 아닐 경우 '다음' 버튼 */}
                        {activeStep < steps.length - 1 ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                            >
                                다음
                            </Button>
                        ) : (
                            /* 마지막 단계일 경우 '예약 완료' 버튼 */
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => alert('예약이 완료되었습니다!')}
                            >
                                예약 완료
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default LuggageDeliveryForm;