import React, { useState, useEffect, useRef } from 'react';
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

// 타입 정의
interface Partnership {
    businessName: string;
    address: string;
    latitude: number;
    longitude: number;
}

interface NaverMap {
    setCenter(position: NaverLatLng): void;
    panTo(position: NaverLatLng): void;
    getCenter(): NaverLatLng;
    setZoom(level: number): void;
}

interface NaverLatLng {
    lat(): number;
    lng(): number;
}

interface NaverMaps {
    LatLng: new (lat: number, lng: number) => NaverLatLng;
    Map: new (element: HTMLElement, options: any) => NaverMap;
    Marker: new (options: any) => any;
    InfoWindow: new (options: any) => any;
    Event: {
        addListener: (target: any, type: string, listener: () => void) => void;
    };
    Point: new (x: number, y: number) => any;
}

// Window 타입 확장
declare global {
    interface Window {
        naver: {
            maps: NaverMaps;
        };
    }
}

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
    const [searchResults, setSearchResults] = useState<Partnership[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    // 지도 관련 상태
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<NaverMap | null>(null);
    const [partnerships, setPartnerships] = useState<Partnership[]>([]);
    const [currentPosition, setCurrentPosition] = useState<{lat: number, lng: number} | null>(null);

    // 현재 위치 가져오기
    const getCurrentPosition = (): Promise<{lat: number, lng: number}> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentPosition(pos);
                    resolve(pos);
                },
                (error) => {
                    console.error('위치 정보 가져오기 실패:', error);
                    // 위치 정보 가져오기 실패 시 서울 중심으로 설정
                    const defaultPos = { lat: 37.5665, lng: 126.9780 };
                    setCurrentPosition(defaultPos);
                    resolve(defaultPos);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    };

    // 매장 개수를 먼저 로드 (지도 초기화와 별개)
    useEffect(() => {
        const fetchPartnershipsCount = async () => {
            try {
                const response = await partnershipService.getAllPartnerships();
                const partnershipsData = response.data || [];
                setPartnerships(partnershipsData);
            } catch (error) {
                console.error('파트너십 데이터 로드 실패:', error);
            }
        };

        fetchPartnershipsCount();
    }, []);

    // 네이버 지도 초기화
    useEffect(() => {
        const initializeMap = async () => {
            // 현재 위치 먼저 가져오기
            const position = await getCurrentPosition();

            // 네이버 지도 API 스크립트 로드
            if (!window.naver) {
                const script = document.createElement('script');
                script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=r23gqqq271&submodules=geocoder`;
                script.async = true;
                script.onload = () => {
                    createMap(position);
                };
                document.head.appendChild(script);
            } else {
                createMap(position);
            }
        };

        const createMap = (position: {lat: number, lng: number}) => {
            if (mapRef.current && window.naver) {
                const mapOptions = {
                    center: new window.naver.maps.LatLng(position.lat, position.lng),
                    zoom: 15, // 현재 위치이므로 좀 더 확대
                    mapTypeControl: false,
                    scaleControl: false,
                    logoControl: false,
                    mapDataControl: false,
                    zoomControl: false
                };

                const naverMap = new window.naver.maps.Map(mapRef.current, mapOptions);
                setMap(naverMap);

                // 현재 위치 마커 추가
                addCurrentLocationMarker(naverMap, position);

                // 파트너십 데이터 로드 (지도 마커 표시용)
                loadPartnerships(naverMap);
            }
        };

        initializeMap();
    }, []);

    // 현재 위치 마커 추가
    const addCurrentLocationMarker = (naverMap: NaverMap, position: {lat: number, lng: number}) => {
        const currentLocationMarker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(position.lat, position.lng),
            map: naverMap,
            title: t('currentLocation'),
            icon: {
                content: `
                    <div style="
                        width: 20px;
                        height: 20px;
                        background: #EF4444;
                        border: 3px solid white;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                        position: relative;
                        animation: pulse 2s infinite;
                    ">
                        <div style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 8px;
                            height: 8px;
                            background: white;
                            border-radius: 50%;
                        "></div>
                    </div>
                    <style>
                        @keyframes pulse {
                            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                        }
                    </style>
                `,
                anchor: new window.naver.maps.Point(10, 10)
            },
            zIndex: 1000 // 다른 마커들보다 위에 표시
        });

        // 현재 위치 마커 클릭 이벤트
        window.naver.maps.Event.addListener(currentLocationMarker, 'click', () => {
            const infoWindow = new window.naver.maps.InfoWindow({
                content: `
                    <div style="padding: 12px; min-width: 150px; text-align: center;">
                        <h4 style="margin: 0 0 5px 0; color: #EF4444;">📍 ${t('currentLocation')}</h4>
                        <p style="margin: 0; color: #6B7280; font-size: 12px;">${t('currentLocationDescription')}</p>
                    </div>
                `
            });
            infoWindow.open(naverMap, currentLocationMarker);
        });
    };

    // 파트너십 데이터 로드 및 마커 표시
    const loadPartnerships = async (naverMap: NaverMap) => {
        try {
            const response = await partnershipService.getAllPartnerships();
            const partnershipsData = response.data || [];
            setPartnerships(partnershipsData);

            // 마커 생성
            partnershipsData.forEach((partnership: Partnership) => {
                if (partnership.latitude && partnership.longitude) {
                    const marker = new window.naver.maps.Marker({
                        position: new window.naver.maps.LatLng(partnership.latitude, partnership.longitude),
                        map: naverMap,
                        title: partnership.businessName,
                        icon: {
                            content: `
                                <div style="
                                    width: 24px;
                                    height: 24px;
                                    background: #3B82F6;
                                    border: 2px solid white;
                                    border-radius: 50%;
                                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 12px;
                                    color: white;
                                    font-weight: bold;
                                ">📦</div>
                            `,
                            anchor: new window.naver.maps.Point(12, 12)
                        }
                    });

                    // 현재 위치와의 거리 계산
                    let distance = '';
                    if (currentPosition) {
                        const dist = calculateDistance(
                            currentPosition.lat,
                            currentPosition.lng,
                            partnership.latitude,
                            partnership.longitude
                        );
                        distance = `<p style="margin: 5px 0 0 0; color: #10B981; font-size: 11px; font-weight: 600;">📍 ${dist.toFixed(1)}km 거리</p>`;
                    }

                    // 마커 클릭 이벤트
                    window.naver.maps.Event.addListener(marker, 'click', () => {
                        const infoWindow = new window.naver.maps.InfoWindow({
                            content: `
                                <div style="padding: 10px; min-width: 200px;">
                                    <h4 style="margin: 0 0 5px 0; color: #1F2937;">${partnership.businessName}</h4>
                                    <p style="margin: 0; color: #6B7280; font-size: 12px;">${partnership.address}</p>
                                    ${distance}
                                </div>
                            `
                        });
                        infoWindow.open(naverMap, marker);
                    });
                }
            });
        } catch (error) {
            console.error('파트너십 데이터 로드 실패:', error);
        }
    };

    // 두 지점 간의 거리 계산 (km)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // 지구의 반경 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

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
            const filteredResults = partnerships.filter((p: Partnership) =>
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
                    setErrorMessage(t('noSearchResults'));
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
                            setErrorMessage(t('serverAccessDenied'));
                            break;
                        case 404:
                            setErrorMessage(t('dataNotFound'));
                            break;
                        default:
                            setErrorMessage(t('serverError') + error.response.status);
                    }
                } else if (error.request) {
                    // 요청은 보냈으나 응답을 받지 못한 경우
                    console.error('응답 없음:', error.request);
                    setErrorMessage(t('noServerResponse'));
                } else {
                    // 요청 구성 중 오류가 발생한 경우
                    setErrorMessage(t('requestConfigError') + error.message);
                }
            } else {
                // 다른 유형의 오류
                setErrorMessage(t('unknownError'));
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
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
                pt: { xs: 12, md: 16 },
                pb: { xs: 8, md: 12 },
            }}
        >
            {/* 미니멀한 장식 요소 */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '20%',
                    right: '10%',
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
                    bottom: '10%',
                    left: '5%',
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                animation: `${fadeIn} 1s ease-out`,
                                textAlign: { xs: 'center', md: 'left' }
                            }}
                        >
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                                    fontWeight: 700,
                                    color: '#0F172A',
                                    mb: 3,
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.02em'
                                }}
                            >
                                {t('heroTitle1')}{' '}
                                <Box component="span" sx={{ color: theme.palette.primary.main }}>
                                    {t('heroTitle2')}
                                </Box>
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                                    color: '#64748B',
                                    mb: 4,
                                    fontWeight: 400,
                                    lineHeight: 1.6,
                                    maxWidth: '500px',
                                    mx: { xs: 'auto', md: 0 }
                                }}
                            >
                                {t('heroDescription')}
                            </Typography>

                            {/* 모던한 검색 바 */}
                            <Paper
                                elevation={0}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    maxWidth: '500px',
                                    mx: { xs: 'auto', md: 0 },
                                    mb: 3,
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
                                    }
                                }}
                            >
                                <InputBase
                                    placeholder={t('searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    sx={{
                                        flex: 1,
                                        px: 3,
                                        py: 2,
                                        fontSize: '1rem',
                                        color: '#1E293B',
                                        '&::placeholder': {
                                            color: '#94A3B8'
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={handleSearch}
                                    disabled={isSearching || !searchQuery.trim()}
                                    sx={{
                                        mx: 1,
                                        backgroundColor: '#3B82F6',
                                        color: 'white',
                                        borderRadius: '8px',
                                        '&:hover': {
                                            backgroundColor: '#2563EB'
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#CBD5E1',
                                            color: '#94A3B8'
                                        }
                                    }}
                                >
                                    <SearchIcon />
                                </IconButton>
                            </Paper>

                            {errorMessage && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#EF4444',
                                        backgroundColor: '#FEF2F2',
                                        border: '1px solid #FECACA',
                                        borderRadius: '8px',
                                        px: 3,
                                        py: 2,
                                        mb: 3,
                                        maxWidth: '500px',
                                        mx: { xs: 'auto', md: 0 }
                                    }}
                                >
                                    {errorMessage}
                                </Typography>
                            )}

                            <Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        justifyContent: { xs: 'center', md: 'flex-start' },
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        size="large"
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
                                        onClick={() => navigate('/map')}
                                    >
                                        {t('findNearbyLocation')}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        sx={{
                                            borderColor: '#E2E8F0',
                                            color: '#475569',
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: '10px',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: '#F8FAFC',
                                                borderColor: '#CBD5E1'
                                            }
                                        }}
                                    >
                                        {t('learnMoreButton')}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: { xs: '400px', md: '500px' },
                                animation: `${fadeIn} 1.2s ease-out`,
                                position: 'relative'
                            }}
                        >
                            {/* 실제 네이버 지도 */}
                            <Box
                                ref={mapRef}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid #E2E8F0',
                                    position: 'relative'
                                }}
                            />
                            
                            {/* 지도 오버레이 정보 */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    left: 16,
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '12px',
                                    px: 2,
                                    py: 1.5,
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}
                            >
                                <StorefrontIcon sx={{ fontSize: 20, color: '#3B82F6' }} />
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                                    {partnerships.length}{t('storeCount')}
                                </Typography>
                            </Box>

                            {/* 지도 우하단 컨트롤 */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 16,
                                    right: 16,
                                    backgroundColor: 'rgba(59, 130, 246, 0.9)',
                                    borderRadius: '10px',
                                    px: 2,
                                    py: 1,
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(59, 130, 246, 1)',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                                onClick={() => navigate('/map')}
                            >
                                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>
                                    {t('viewFullMap')}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Hero; 