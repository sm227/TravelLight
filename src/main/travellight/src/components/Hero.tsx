import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    useTheme,
    useMediaQuery,
    InputBase,
    Paper,
    IconButton,
    Autocomplete,
    TextField
} from '@mui/material';
import { keyframes } from '@mui/system';
import LuggageIcon from '@mui/icons-material/Luggage';
import ExploreIcon from '@mui/icons-material/Explore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import api, { partnershipService } from '../services/api';

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

const floatAnimation = keyframes`
    0% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
    100% {
        transform: translateY(0px);
    }
`;

const Hero: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setErrorMessage(null);

        try {
            console.log('API 요청 시작: 제휴점 목록 가져오기');

            // 제휴 매장 데이터 가져오기
            const response = await partnershipService.getAllPartnerships();
            console.log('API 응답 받음:', response);

            // API 응답 구조에 맞게 데이터 추출
            const partnerships = response.data || [];
            console.log('파싱된 데이터:', partnerships);

            // 검색어로 필터링 (매장명 또는 주소) - 대소문자 구분 없이 검색
            const filteredResults = partnerships.filter((p: any) =>
                p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.address.toLowerCase().includes(searchQuery.toLowerCase())
            );

            console.log('검색 결과:', filteredResults.length);
            setSearchResults(filteredResults);

            // 검색 결과가 있으면 지도 페이지로 이동
            if (filteredResults.length > 0) {
                // 첫 번째 검색 결과의 위치 정보 추출
                const firstResult = filteredResults[0];

                navigate('/map', {
                    state: {
                        searchQuery,
                        searchResults: filteredResults,
                        // 첫 번째 매장의 위치 정보 추가
                        initialPosition: {
                            latitude: firstResult.latitude,
                            longitude: firstResult.longitude
                        },
                        // 검색 타입 정보 추가 (매장명 검색임을 표시)
                        searchType: 'partnership'
                    }
                });
            } else {
                // 매장명/주소 검색 결과가 없는 경우, 지역명으로 검색 시도
                console.log('매장명/주소 검색 결과 없음, 지역명 검색으로 전환');

                try {
                    // 네이버 지도 API를 사용할 수 없으므로 지도 페이지로 이동하여 검색 처리
                    navigate('/map', {
                        state: {
                            searchQuery,
                            searchResults: [],
                            // 지역명 검색임을 표시
                            searchType: 'location'
                        }
                    });
                } catch (locError) {
                    console.error('지역명 검색 중 오류:', locError);
                    setErrorMessage('검색 결과가 없습니다. 다른 검색어를 시도해보세요.');
                }
            }
        } catch (error) {
            console.error('검색 중 오류 발생:', error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // 서버에서 응답을 받았으나 오류 상태 코드를 반환한 경우
                    console.error('API 오류 응답:', error.response);

                    switch(error.response.status) {
                        case 403:
                            setErrorMessage('서버에 접근 권한이 없습니다. 관리자에게 문의하세요.');
                            break;
                        case 404:
                            setErrorMessage('서버에서 데이터를 찾을 수 없습니다.');
                            break;
                        default:
                            setErrorMessage(`서버 오류가 발생했습니다: ${error.response.status}`);
                    }
                } else if (error.request) {
                    // 요청은 보냈으나 응답을 받지 못한 경우
                    console.error('응답 없음:', error.request);
                    setErrorMessage('서버로부터 응답이 없습니다. 백엔드 서버가 실행 중인지 확인하세요.');
                } else {
                    // 요청 구성 중 오류가 발생한 경우
                    setErrorMessage(`요청 구성 중 오류: ${error.message}`);
                }
            } else {
                // 다른 유형의 오류
                setErrorMessage('알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    };

    return (
        <Box
            id="home"
            sx={{
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #F8FAFF 0%, #E8F0FF 100%)',
                pt: { xs: 16, md: 20 },
                pb: { xs: 12, md: 16 },
            }}
        >
            {/* 장식 요소들 */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '10%',
                    right: '15%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(93, 159, 255, 0.2) 0%, rgba(93, 159, 255, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '5%',
                    left: '10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(255, 90, 90, 0.1) 0%, rgba(255, 90, 90, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={6} alignItems="center" justifyContent="center">
                    <Grid
                        item
                        xs={12}
                        md={8}
                        sx={{
                            animation: `${fadeIn} 0.8s ease-out`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                    >

                        <Typography
                            component="h1"
                            variant={isMobile ? 'h4' : 'h3'}
                            sx={{
                                fontWeight: 800,
                                mb: 3,
                                background: 'linear-gradient(90deg, #1A2138 0%, #2E7DF1 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.5,
                            }}
                        >
                            {t('heroTitle1')}{' '}
                            <Box component="span" sx={{ color: theme.palette.primary.main }}>
                                {t('heroTitle2')}
                            </Box>
                        </Typography>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{
                                mb: 4,
                                maxWidth: '700px',
                                mx: 'auto',
                                lineHeight: 1.6,
                                fontWeight: 'normal',
                            }}
                        >
                            {t('heroDescription')}
                        </Typography>

                        {/* 검색 박스 */}
                        <Paper
                            component="form"
                            elevation={2}
                            sx={{
                                p: '2px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '600px',
                                mb: 4,
                                borderRadius: '50px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                            }}
                        >
                            <IconButton sx={{ p: '10px', color: 'primary.main' }} aria-label="search">
                                <SearchIcon />
                            </IconButton>
                            <InputBase
                                sx={{ ml: 1, flex: 1, py: 1.2 }}
                                placeholder="매장명 또는 주소 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                inputProps={{ 'aria-label': '매장명 또는 주소 검색' }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSearch}
                                disabled={isSearching}
                                sx={{
                                    borderRadius: '40px',
                                    py: 1,
                                    px: 3,
                                    mx: 1,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(90deg, #2E7DF1 0%, #5D9FFF 100%)'
                                }}
                            >
                                {isSearching ? '검색 중...' : '검색'}
                            </Button>
                        </Paper>

                        <Button
                            variant="contained"
                            size="large"
                            component={Link}
                            to="/map"
                            startIcon={<ExploreIcon />}
                            sx={{
                                py: 1.5,
                                px: 4,
                                fontSize: '1rem',
                                width: { xs: '100%', sm: 'auto' },
                                maxWidth: '600px',
                                background: 'linear-gradient(90deg, #2E7DF1 0%, #5D9FFF 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(90deg, #0051BF 0%, #2E7DF1 100%)',
                                }
                            }}
                        >
                            가까운 위치 찾기
                        </Button>

                        {/* 간단한 통계 정보 */}
                        <Box
                            sx={{
                                mt: 4,
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center'
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                                    gap: { xs: 3, md: 5 },
                                    width: '100%',
                                    maxWidth: '900px',
                                    position: 'relative',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: { xs: 'auto', sm: '100%' },
                                        left: { xs: '50%', sm: 'auto' },
                                        width: { xs: '80%', sm: '100%' },
                                        height: { xs: '1px', sm: '1px' },
                                        background: 'rgba(0,0,0,0.06)',
                                        transform: { xs: 'translateX(-50%)', sm: 'none' },
                                        display: { xs: 'none', sm: 'block' },
                                        zIndex: 0
                                    }
                                }}
                            >
                                {[
                                    { value: '1.2천+', label: t('stores'), icon: <StorefrontIcon sx={{ fontSize: 28 }} /> },
                                    { value: '4.8/5', label: t('rating'), icon: <LuggageIcon sx={{ fontSize: 28 }} /> },
                                    { value: '7천+', label: t('users'), icon: <AccessTimeIcon sx={{ fontSize: 28 }} /> },
                                ].map((stat, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 2,
                                            p: 2,
                                            position: 'relative',
                                            zIndex: 1,
                                            background: 'transparent',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-3px)',
                                            }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 50,
                                                height: 50,
                                                borderRadius: '12px',
                                                background: 'rgba(46, 125, 241, 0.08)',
                                                color: 'primary.main'
                                            }}
                                        >
                                            {stat.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" fontWeight="600" sx={{ lineHeight: 1.2 }}>
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                                                {stat.label}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Hero; 