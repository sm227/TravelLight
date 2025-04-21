import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    InputBase,
    IconButton,
    Chip,
    Button,
    Grid,
    useTheme,
    alpha
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Link as RouterLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

/**
 * 자주 묻는 질문(FAQ) 페이지 컴포넌트
 * 사용자들이 자주 묻는 질문과 답변을 카테고리별로 보여줍니다.
 */
const FAQPage = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    // 검색어 상태 관리
    const [searchQuery, setSearchQuery] = useState('');
    // 현재 선택된 카테고리 관리
    const [selectedCategory, setSelectedCategory] = useState('all');

    // FAQ 카테고리 정의
    const categories = [
        { id: 'all', name: '전체' },
        { id: 'reservation', name: '예약 및 결제' },
        { id: 'delivery', name: '배송 서비스' },
        { id: 'storage', name: '짐 보관' },
        { id: 'account', name: '계정 관리' },
        { id: 'refund', name: '환불 및 취소' }
    ];

    // FAQ 데이터 (실제로는 API에서 가져올 수 있음)
    const faqData = [
        {
            id: 1,
            category: 'reservation',
            question: '예약은 얼마나 미리 해야 하나요?',
            answer: '저희 TravelLight는 최소 24시간 전에 예약하시는 것을 권장드립니다. 급하신 경우 고객센터(1588-0000)로 문의해 주시면 가능 여부를 확인해 드립니다.'
        },
        {
            id: 2,
            category: 'reservation',
            question: '예약 후 일정이 변경되면 어떻게 해야 하나요?',
            answer: '예약 변경은 마이페이지 > 예약 내역에서 변경하시거나, 출발 48시간 전까지 무료로 변경 가능합니다. 그 이후에는 수수료가 발생할 수 있습니다.'
        },
        {
            id: 3,
            category: 'delivery',
            question: '배송 중인 짐의 현재 위치를 확인할 수 있나요?',
            answer: '네, 마이페이지 > 배송 조회에서 실시간으로 짐의 위치를 확인하실 수 있습니다. 배송 조회 번호를 통해 더 자세한 정보를 확인하실 수 있습니다.'
        },
        {
            id: 4,
            category: 'delivery',
            question: '배송 가능 지역은 어디인가요?',
            answer: '현재 서울, 경기, 인천, 부산, 제주 지역 편의점 및 음식점등 고객님들의 접근성이 좋은 위치에서 서비스를 제공하고 있습니다. 그 외 지역은 점차 확대해 나갈 예정이니 많은 관심 부탁드립니다.'
        },
        {
            id: 5,
            category: 'storage',
            question: '보관 중인 짐을 미리 찾을 수 있나요?',
            answer: '네, 가능합니다. 마이페이지 > 보관 서비스에서 찾으실 날짜를 변경하시거나, 고객센터(1588-0000)로 문의해 주시면 가능 여부를 확인해 드립니다. 단, 최소 12시간 전에 알려주셔야 원활한 처리가 가능합니다.'
        },
        {
            id: 6,
            category: 'storage',
            question: '보관 가능한 물품과 불가능한 물품은 무엇인가요?',
            answer: '귀중품(노트북, 현금 등), 위험물질, 동식물은 보관이 불가합니다. 자세한 내용은 이용약관을 참고해 주세요.'
        },
        {
            id: 7,
            category: 'account',
            question: '계정 정보를 변경하고 싶어요.',
            answer: '마이페이지 > 설정 > 계정 정보 수정에서 개인정보 및 연락처 정보를 변경하실 수 있습니다.'
        },
        {
            id: 8,
            category: 'account',
            question: '회원 탈퇴는 어떻게 하나요?',
            answer: '마이페이지 > 설정 > 회원 탈퇴에서 진행하실 수 있습니다. 단, 현재 진행 중인 서비스나 예약이 있다면 완료 후 탈퇴가 가능합니다.'
        },
        {
            id: 9,
            category: 'refund',
            question: '환불 정책은 어떻게 되나요?',
            answer: '서비스 신청 후 3일 전: 100%, 2일 전: 70%, 하루 전: 50% 환불, 1일 이하: 환불 불가. 자세한 사항은 환불 정책을 참고해주세요.'
        },
        {
            id: 10,
            category: 'refund',
            question: '환불은 얼마나 걸리나요?',
            answer: '환불 승인 후 결제 수단에 따라 차이가 있습니다. 환불신청일 기준 7일 이내로 환불이 진행됩니다. 환불이 지연되는 경우 고객센터로 문의 바랍니다.'
        }
    ];

    // 검색어와 카테고리 필터링을 적용한 FAQ 목록
    const filteredFAQs = faqData.filter(faq => {
        // 검색어 필터링
        const matchesQuery = searchQuery === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

        // 카테고리 필터링
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;

        return matchesQuery && matchesCategory;
    });

    // 검색어 변경 핸들러
    const handleSearchChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSearchQuery(event.target.value);
    };

    // 카테고리 선택 핸들러
    const handleCategoryChange = (categoryId: React.SetStateAction<string>) => {
        setSelectedCategory(categoryId);
    };

    return (
        <>
            <Navbar />
            <Box sx={{ 
                backgroundImage: 'linear-gradient(180deg, #f5f7ff 0%, #ffffff 100%)',
                pt: { xs: 10, md: 12 },
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Container maxWidth="md" sx={{ py: 4, flexGrow: 1 }}>
                    {/* 헤더 섹션 */}
                    <Box sx={{ mb: 6, textAlign: 'center' }}>
                        <Typography 
                            variant="h3" 
                            component="h1" 
                            gutterBottom 
                            fontWeight="bold" 
                            color="primary.main"
                            sx={{
                                mb: 2,
                                background: 'linear-gradient(90deg, #1976d2 0%, #3f85ee 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0px 4px 8px rgba(24, 51, 107, 0.1)'
                            }}
                        >
                            이용방법 안내
                        </Typography>
                        <Typography 
                            variant="subtitle1" 
                            color="text.secondary" 
                            gutterBottom
                            sx={{ fontSize: '1.1rem', maxWidth: '700px', mx: 'auto' }}
                        >
                            TravelLight 서비스 이용 방법과 자주 묻는 질문들을 확인하세요.
                        </Typography>
                    </Box>

                    {/* 서비스 이용 가이드 섹션 */}
                    <Paper
                        sx={{ 
                            p: 4, 
                            mb: 5, 
                            borderRadius: '16px',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.1)
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            component="h2" 
                            sx={{ 
                                mb: 3, 
                                fontWeight: 'bold',
                                color: theme.palette.primary.main 
                            }}
                        >
                            서비스 이용 절차
                        </Typography>
                        <Grid container spacing={3}>
                            {[
                                { 
                                    step: '1', 
                                    title: '회원가입 및 로그인', 
                                    description: '홈페이지에서 간단한 정보를 입력하여 회원가입을 진행합니다.' 
                                },
                                { 
                                    step: '2', 
                                    title: '서비스 선택', 
                                    description: '짐 보관, 배송 등 원하는 서비스를 선택합니다.' 
                                },
                                { 
                                    step: '3', 
                                    title: '예약 및 결제', 
                                    description: '날짜, 위치, 짐 정보를 입력하고 결제를 진행합니다.' 
                                },
                                { 
                                    step: '4', 
                                    title: '서비스 이용', 
                                    description: '예약 확인서를 지참하여 해당 서비스를 이용합니다.' 
                                }
                            ].map((item, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            p: 2,
                                            backgroundColor: alpha(theme.palette.primary.light, 0.05),
                                            borderRadius: '12px',
                                            height: '100%'
                                        }}
                                    >
                                        <Box 
                                            sx={{ 
                                                width: 40, 
                                                height: 40, 
                                                borderRadius: '50%', 
                                                backgroundColor: theme.palette.primary.main,
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                mr: 2,
                                                flexShrink: 0
                                            }}
                                        >
                                            {item.step}
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 0.5 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                component={RouterLink}
                                to="/services"
                                sx={{ 
                                    mt: 2, 
                                    borderRadius: '24px', 
                                    px: 3,
                                    boxShadow: '0 4px 12px rgba(24, 51, 107, 0.2)',
                                    '&:hover': {
                                        boxShadow: '0 6px 16px rgba(24, 51, 107, 0.3)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                서비스 자세히 보기
                            </Button>
                        </Box>
                    </Paper>
                    
                    {/* FAQ 섹션 타이틀 */}
                    <Typography 
                        variant="h4" 
                        component="h2" 
                        sx={{ 
                            mb: 4, 
                            mt: 6,
                            fontWeight: 'bold',
                            color: theme.palette.primary.main,
                            textAlign: 'center'
                        }}
                    >
                        자주 묻는 질문 (FAQ)
                    </Typography>

                    {/* 검색 바 */}
                    <Paper
                        component="form"
                        sx={{ 
                            p: '2px 4px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 4,
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                        }}
                        elevation={0}
                    >
                        <IconButton sx={{ p: '12px' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                        <InputBase
                            sx={{ ml: 1, flex: 1, fontSize: '1rem', py: 1 }}
                            placeholder="궁금한 내용을 검색해보세요"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </Paper>

                    {/* 카테고리 선택 칩 */}
                    <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        {categories.map((category) => (
                            <Chip
                                key={category.id}
                                label={category.name}
                                onClick={() => handleCategoryChange(category.id)}
                                color={selectedCategory === category.id ? "primary" : "default"}
                                variant={selectedCategory === category.id ? "filled" : "outlined"}
                                sx={{ 
                                    mb: 1,
                                    py: 0.5,
                                    px: 0.5,
                                    borderRadius: '8px',
                                    fontWeight: selectedCategory === category.id ? 'bold' : 'normal',
                                    '&:hover': {
                                        backgroundColor: selectedCategory === category.id 
                                            ? theme.palette.primary.main 
                                            : alpha(theme.palette.primary.light, 0.1)
                                    }
                                }}
                            />
                        ))}
                    </Box>

                    {/* FAQ 아코디언 목록 */}
                    <Box>
                        {filteredFAQs.length > 0 ? (
                            filteredFAQs.map((faq) => (
                                <Accordion 
                                    key={faq.id} 
                                    sx={{ 
                                        mb: 2,
                                        borderRadius: '12px !important',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:before': {
                                            display: 'none',
                                        }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon color="primary" />}
                                        aria-controls={`panel-${faq.id}-content`}
                                        id={`panel-${faq.id}-header`}
                                        sx={{
                                            backgroundColor: alpha(theme.palette.primary.light, 0.03),
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.light, 0.07),
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <HelpOutlineIcon sx={{ mr: 2, color: 'primary.main' }} />
                                            <Typography 
                                                variant="subtitle1" 
                                                fontWeight="medium"
                                                sx={{ color: 'text.primary', letterSpacing: '0.02em' }}
                                            >
                                                {faq.question}
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 3 }}>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                pl: 5,
                                                color: 'text.secondary',
                                                lineHeight: 1.7
                                            }}
                                        >
                                            {faq.answer}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))
                        ) : (
                            // 검색 결과가 없을 때 표시
                            <Box sx={{ 
                                textAlign: 'center', 
                                py: 4,
                                backgroundColor: alpha(theme.palette.warning.light, 0.1),
                                borderRadius: '12px',
                                padding: 4
                            }}>
                                <Typography variant="body1" color="text.secondary">
                                    검색 결과가 없습니다. 다른 키워드로 검색하시거나 1:1 문의를 이용해 주세요.
                                </Typography>
                                <Button
                                    component={RouterLink}
                                    to="/Inquiry"
                                    variant="contained"
                                    color="primary"
                                    sx={{ 
                                        mt: 2,
                                        borderRadius: '24px',
                                        px: 3,
                                        boxShadow: '0 4px 12px rgba(24, 51, 107, 0.2)'
                                    }}
                                >
                                    1:1 문의하기
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* 하단 고객센터 안내 */}
                    <Paper sx={{ 
                        mt: 6, 
                        p: 4, 
                        bgcolor: alpha(theme.palette.primary.light, 0.05), 
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
                    }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={8}>
                                <Typography 
                                    variant="h6" 
                                    gutterBottom
                                    sx={{ fontWeight: 'bold', color: 'primary.main' }}
                                >
                                    더 궁금한 점이 있으신가요?
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                                    고객센터 운영시간: 평일 09:00 - 18:00 (공휴일 제외)
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                                    전화: 1588-0000 | 이메일: support@travellight.com
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' }}}>
                                <Button
                                    component={RouterLink}
                                    to="/Inquiry"
                                    variant="contained"
                                    color="primary"
                                    sx={{ 
                                        borderRadius: '24px', 
                                        px: 3,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        boxShadow: '0 6px 20px rgba(24, 51, 107, 0.2)',
                                        '&:hover': {
                                            boxShadow: '0 8px 25px rgba(24, 51, 107, 0.3)',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    1:1 문의하기
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* 약관 및 정책 */}
                    <Box sx={{ mt: 6, mb: 4 }}>
                        <Typography 
                            variant="h5" 
                            component="h2" 
                            sx={{ 
                                mb: 4, 
                                fontWeight: 'bold',
                                color: theme.palette.primary.main,
                                textAlign: 'center'
                            }}
                        >
                            약관 및 정책
                        </Typography>
                        <Grid container spacing={3}>
                            {[
                                { title: '이용약관', description: '서비스 이용에 관한 기본 약관입니다.', link: '/terms' },
                                { title: '개인정보 처리방침', description: '개인정보 수집 및 이용에 관한 안내입니다.', link: '/privacy' },
                                { title: '환불 정책', description: '서비스 취소 및 환불에 관한 정책입니다.', link: '/refund' },
                                { title: '위치기반 서비스 이용약관', description: '위치정보 수집 및 이용에 관한 약관입니다.', link: '/location-terms' }
                            ].map((item, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            height: '100%',
                                            borderRadius: '12px',
                                            border: '1px solid',
                                            borderColor: theme.palette.divider,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: theme.palette.primary.main,
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                                transform: 'translateY(-4px)'
                                            }
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {item.description}
                                        </Typography>
                                        <Button
                                            component={RouterLink}
                                            to={item.link}
                                            color="primary"
                                            endIcon={<span>→</span>}
                                            sx={{ fontWeight: 'medium' }}
                                        >
                                            자세히 보기
                                        </Button>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* 다운로드 가능한 이용 가이드 */}
                    <Box sx={{ mb: 6, mt: 5, textAlign: 'center' }}>
                        <Paper
                            sx={{
                                p: 4,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #1976d2 0%, #304FFE 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: '150px',
                                    height: '150px',
                                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                                    zIndex: 0
                                }}
                            />
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, position: 'relative', zIndex: 1 }}>
                                TravelLight 서비스 이용 가이드
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3, maxWidth: '700px', mx: 'auto', position: 'relative', zIndex: 1 }}>
                                서비스 이용에 관한 모든 정보를 담은 가이드북을 다운로드하여 확인하세요.
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: '#ffffff',
                                    color: 'primary.main',
                                    fontWeight: 'bold',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '28px',
                                    '&:hover': {
                                        bgcolor: alpha('#ffffff', 0.9),
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                                    },
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            >
                                이용 가이드 다운로드
                            </Button>
                        </Paper>
                    </Box>
                </Container>
                <Footer />
            </Box>
        </>
    );
};

export default FAQPage;