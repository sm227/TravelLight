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
    alpha,
    Card,
    CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { Link as RouterLink } from 'react-router-dom';
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

// 스타일된 컴포넌트들
const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    borderRadius: '12px',
    border: '1px solid #F1F5F9',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
        borderColor: '#E2E8F0'
    }
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
    border: '1px solid #F1F5F9',
    borderRadius: '12px !important',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    marginBottom: '12px',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#E2E8F0',
        boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1)'
    },
    '&:before': {
        display: 'none',
    },
    '&.Mui-expanded': {
        margin: '0 0 12px 0',
        borderColor: '#3B82F6',
        boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.15)'
    }
}));

const CategoryChip = styled(Chip)<{ selected?: boolean }>(({ theme, selected }) => ({
    borderRadius: '8px',
    fontWeight: selected ? 600 : 500,
    border: '1px solid #E2E8F0',
    backgroundColor: selected ? '#3B82F6' : '#FFFFFF',
    color: selected ? '#FFFFFF' : '#475569',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: selected ? '#2563EB' : '#F8FAFC',
        borderColor: selected ? '#2563EB' : '#CBD5E1',
        transform: 'translateY(-1px)'
    }
}));

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
            answer: '예약 변경은 지도 페이지 &gt; 내 예약에서 변경하시거나, 출발 48시간 전까지 무료로 변경 가능합니다. 그 이후에는 수수료가 발생할 수 있습니다.'
        },
        {
            id: 3,
            category: 'delivery',
            question: '배송 중인 짐의 현재 위치를 확인할 수 있나요?',
            answer: '네, 지도 페이지 &gt; 내 예약에서 실시간으로 짐의 위치를 확인하실 수 있습니다. 배송 조회 번호를 통해 더 자세한 정보를 확인하실 수 있습니다.'
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
            answer: '네, 가능합니다. 지도 페이지 &gt; 내 예약에서 찾으실 날짜를 변경하시거나, 고객센터(1588-0000)로 문의해 주시면 가능 여부를 확인해 드립니다. 단, 최소 12시간 전에 알려주셔야 원활한 처리가 가능합니다.'
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
            answer: '내 프로필 페이지에서 개인정보 및 비밀번호를 변경하실 수 있습니다.'
        },
        {
            id: 8,
            category: 'account',
            question: '회원 탈퇴는 어떻게 하나요?',
            answer: '고객센터로 문의하시면 회원 탈퇴를 도와드립니다. 단, 현재 진행 중인 서비스나 예약이 있다면 완료 후 탈퇴가 가능합니다.'
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
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
                pt: { xs: 10, md: 12 },
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* 미니멀한 배경 장식 */}
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

                <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1, position: 'relative', zIndex: 1 }}>
                    {/* 헤더 섹션 */}
                    <Box sx={{ 
                        mb: 8, 
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
                            고객 지원 센터
                        </Typography>
                        <Typography 
                            variant="h6"
                            sx={{
                                color: '#64748B',
                                maxWidth: '600px',
                                mx: 'auto',
                                fontSize: '1.1rem',
                                fontWeight: 400,
                                lineHeight: 1.6
                            }}
                        >
                            TravelLight 서비스 이용 방법과 자주 묻는 질문들을 확인하세요.
                        </Typography>
                    </Box>

                    {/* 서비스 이용 가이드 섹션 */}
                    <StyledCard sx={{ 
                        p: 4, 
                        mb: 6,
                        animation: `${fadeIn} 0.6s ease-out 0.2s both`
                    }}>
                        <Typography 
                            variant="h4" 
                            component="h2" 
                            sx={{ 
                                mb: 4, 
                                fontWeight: 600,
                                color: '#1E293B',
                                fontSize: { xs: '1.5rem', md: '1.75rem' }
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
                                            p: 3,
                                            backgroundColor: '#F8FAFC',
                                            border: '1px solid #F1F5F9',
                                            borderRadius: '12px',
                                            height: '100%',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: '#F1F5F9',
                                                borderColor: '#E2E8F0',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Box 
                                            sx={{ 
                                                width: 40, 
                                                height: 40, 
                                                borderRadius: '8px', 
                                                backgroundColor: '#3B82F6',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 600,
                                                mr: 3,
                                                flexShrink: 0,
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {item.step}
                                        </Box>
                                        <Box>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    fontSize: '1.1rem', 
                                                    fontWeight: 600, 
                                                    mb: 1,
                                                    color: '#1E293B'
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: '#64748B',
                                                    lineHeight: 1.5,
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {item.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                component={RouterLink}
                                to="/#services"
                                sx={{ 
                                    backgroundColor: '#3B82F6',
                                    color: 'white',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: '#2563EB',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                서비스 자세히 보기
                            </Button>
                        </Box>
                    </StyledCard>
                    
                    {/* FAQ 섹션 타이틀 */}
                    <Box sx={{ 
                        mb: 6, 
                        textAlign: 'center',
                        animation: `${fadeIn} 0.6s ease-out 0.4s both`
                    }}>
                        <Typography 
                            variant="h3" 
                            component="h2" 
                            sx={{ 
                                mb: 2,
                                fontWeight: 700,
                                color: '#0F172A',
                                fontSize: { xs: '1.75rem', md: '2.25rem' },
                                letterSpacing: '-0.01em'
                            }}
                        >
                            자주 묻는 질문
                        </Typography>
                        <Typography 
                            variant="body1"
                            sx={{
                                color: '#64748B',
                                fontSize: '1rem',
                                maxWidth: '500px',
                                mx: 'auto'
                            }}
                        >
                            궁금한 내용을 빠르게 찾아보세요
                        </Typography>
                    </Box>

                    {/* 검색 바 */}
                    <Paper
                        elevation={0}
                        sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            maxWidth: '600px',
                            mx: 'auto',
                            mb: 4,
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: '#3B82F6',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                            },
                            '&:focus-within': {
                                borderColor: '#3B82F6',
                                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                            },
                            animation: `${fadeIn} 0.6s ease-out 0.6s both`
                        }}
                    >
                        <IconButton sx={{ p: 2, color: '#64748B' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                        <InputBase
                            sx={{ 
                                flex: 1, 
                                px: 1,
                                py: 2,
                                fontSize: '1rem',
                                color: '#1E293B',
                                '&::placeholder': {
                                    color: '#94A3B8'
                                }
                            }}
                            placeholder="궁금한 내용을 검색해보세요"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </Paper>

                    {/* 카테고리 선택 칩 */}
                    <Box sx={{ 
                        mb: 6, 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1.5, 
                        justifyContent: 'center',
                        animation: `${fadeIn} 0.6s ease-out 0.8s both`
                    }}>
                        {categories.map((category) => (
                            <CategoryChip
                                key={category.id}
                                label={category.name}
                                onClick={() => handleCategoryChange(category.id)}
                                selected={selectedCategory === category.id}
                                sx={{ mb: 1 }}
                            />
                        ))}
                    </Box>

                    {/* FAQ 아코디언 목록 */}
                    <Box sx={{ 
                        maxWidth: '800px', 
                        mx: 'auto',
                        animation: `${fadeIn} 0.6s ease-out 1s both`
                    }}>
                        {filteredFAQs.length > 0 ? (
                            filteredFAQs.map((faq, index) => (
                                <StyledAccordion 
                                    key={faq.id}
                                    sx={{
                                        animation: `${fadeIn} 0.4s ease-out ${1.2 + index * 0.1}s both`
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: '#64748B' }} />}
                                        aria-controls={`panel-${faq.id}-content`}
                                        id={`panel-${faq.id}-header`}
                                        sx={{
                                            py: 2,
                                            px: 3,
                                            backgroundColor: '#FAFBFC',
                                            transition: 'background-color 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: '#F1F5F9',
                                            },
                                            '&.Mui-expanded': {
                                                backgroundColor: '#F8FAFC',
                                                borderBottom: '1px solid #E2E8F0'
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <QuestionAnswerIcon sx={{ 
                                                mr: 2, 
                                                color: '#3B82F6',
                                                fontSize: 20
                                            }} />
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    fontWeight: 600,
                                                    color: '#1E293B',
                                                    fontSize: '1rem',
                                                    flex: 1
                                                }}
                                            >
                                                {faq.question}
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 3, py: 3 }}>
                                        <Box sx={{ pl: 4 }}>
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    color: '#64748B',
                                                    lineHeight: 1.7,
                                                    fontSize: '0.95rem'
                                                }}
                                            >
                                                {faq.answer}
                                            </Typography>
                                        </Box>
                                    </AccordionDetails>
                                </StyledAccordion>
                            ))
                        ) : (
                            // 검색 결과가 없을 때 표시
                            <StyledCard sx={{ 
                                textAlign: 'center', 
                                py: 6,
                                px: 4,
                                backgroundColor: '#F8FAFC'
                            }}>
                                <QuestionAnswerIcon sx={{ 
                                    fontSize: 48, 
                                    color: '#94A3B8',
                                    mb: 2
                                }} />
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 1,
                                        fontWeight: 600,
                                        color: '#475569'
                                    }}
                                >
                                    검색 결과가 없습니다
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: '#64748B',
                                        mb: 3,
                                        lineHeight: 1.6
                                    }}
                                >
                                    다른 키워드로 검색하시거나 1:1 문의를 이용해 주세요.
                                </Typography>
                                <Button
                                    component={RouterLink}
                                    to="/Inquiry"
                                    variant="contained"
                                    sx={{ 
                                        backgroundColor: '#3B82F6',
                                        color: 'white',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '10px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#2563EB'
                                        }
                                    }}
                                >
                                    1:1 문의하기
                                </Button>
                            </StyledCard>
                        )}
                    </Box>

                    {/* 하단 고객센터 안내 */}
                    <Grid container spacing={3} sx={{ mt: 8 }}>
                        <Grid item xs={12} md={6}>
                            <StyledCard sx={{ 
                                p: 4,
                                textAlign: 'center',
                                backgroundColor: '#F8FAFC',
                                animation: `${fadeIn} 0.6s ease-out 1.4s both`
                            }}>
                                <SupportAgentIcon sx={{ 
                                    fontSize: 48, 
                                    color: '#3B82F6',
                                    mb: 2
                                }} />
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 2,
                                        fontWeight: 600,
                                        color: '#1E293B'
                                    }}
                                >
                                    고객센터 문의
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: '#64748B',
                                        mb: 2,
                                        lineHeight: 1.6
                                    }}
                                >
                                    평일 09:00 - 18:00 (공휴일 제외)
                                </Typography>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    mb: 2,
                                    gap: 1
                                }}>
                                    <PhoneIcon sx={{ fontSize: 18, color: '#3B82F6' }} />
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600,
                                            color: '#1E293B'
                                        }}
                                    >
                                        1588-0000
                                    </Typography>
                                </Box>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    gap: 1
                                }}>
                                    <EmailIcon sx={{ fontSize: 16, color: '#64748B' }} />
                                    <Typography 
                                        variant="body2" 
                                        sx={{ color: '#64748B' }}
                                    >
                                        support@travellight.com
                                    </Typography>
                                </Box>
                            </StyledCard>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <StyledCard sx={{ 
                                p: 4,
                                textAlign: 'center',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                animation: `${fadeIn} 0.6s ease-out 1.6s both`
                            }}>
                                <QuestionAnswerIcon sx={{ 
                                    fontSize: 48, 
                                    color: 'white',
                                    mb: 2
                                }} />
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 2,
                                        fontWeight: 600
                                    }}
                                >
                                    1:1 문의하기
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        mb: 3,
                                        opacity: 0.9,
                                        lineHeight: 1.6
                                    }}
                                >
                                    더 자세한 문의사항이 있으시면 1:1 문의를 통해 빠른 답변을 받아보세요.
                                </Typography>
                                <Button
                                    component={RouterLink}
                                    to="/Inquiry"
                                    variant="contained"
                                    sx={{ 
                                        backgroundColor: 'white',
                                        color: '#3B82F6',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '10px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#F8FAFC',
                                            transform: 'translateY(-1px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    문의하기
                                </Button>
                            </StyledCard>
                        </Grid>
                    </Grid>

                    {/* 약관 및 정책 */}
                    <Box sx={{ mt: 10, mb: 6 }}>
                        <Typography 
                            variant="h4" 
                            component="h2" 
                            sx={{ 
                                mb: 6, 
                                fontWeight: 600,
                                color: '#1E293B',
                                textAlign: 'center',
                                fontSize: { xs: '1.5rem', md: '1.75rem' },
                                animation: `${fadeIn} 0.6s ease-out 1.8s both`
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
                                    <StyledCard
                                        sx={{
                                            p: 3,
                                            height: '100%',
                                            animation: `${fadeIn} 0.4s ease-out ${2 + index * 0.1}s both`
                                        }}
                                    >
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                mb: 1, 
                                                fontWeight: 600,
                                                color: '#1E293B',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: '#64748B',
                                                mb: 3,
                                                lineHeight: 1.5,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {item.description}
                                        </Typography>
                                        <Button
                                            component={RouterLink}
                                            to={item.link}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                borderColor: '#E2E8F0',
                                                color: '#475569',
                                                fontWeight: 500,
                                                textTransform: 'none',
                                                fontSize: '0.9rem',
                                                '&:hover': {
                                                    backgroundColor: '#F8FAFC',
                                                    borderColor: '#CBD5E1'
                                                }
                                            }}
                                        >
                                            자세히 보기 →
                                        </Button>
                                    </StyledCard>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* 이용 가이드 다운로드 */}
                    <StyledCard sx={{ 
                        mb: 6, 
                        mt: 8, 
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: `${fadeIn} 0.6s ease-out 2.4s both`
                    }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '10%',
                                right: '-5%',
                                width: '120px',
                                height: '120px',
                                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                                borderRadius: '50%',
                                zIndex: 0
                            }}
                        />
                        <Box sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontWeight: 600, 
                                    mb: 2,
                                    fontSize: { xs: '1.25rem', md: '1.5rem' }
                                }}
                            >
                                TravelLight 서비스 이용 가이드
                            </Typography>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    mb: 4, 
                                    maxWidth: '600px', 
                                    mx: 'auto',
                                    opacity: 0.95,
                                    lineHeight: 1.6
                                }}
                            >
                                서비스 이용에 관한 모든 정보를 담은 가이드북을 다운로드하여 확인하세요.
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: 'white',
                                    color: '#3B82F6',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: '#F8FAFC',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                이용 가이드 다운로드
                            </Button>
                        </Box>
                    </StyledCard>
                </Container>
                <Footer />
            </Box>
        </>
    );
};

export default FAQPage;