import {useEffect, useState, useCallback, useRef} from "react";
import {Box} from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../MapButton.css";
import "../NaverMarker.css"; // 새로 만든 CSS 파일 추가
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    Alert,
    Stack
} from "@mui/material";
import {Typography} from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider, TimePicker} from '@mui/x-date-pickers';
import {ko} from 'date-fns/locale';
import { useAuth } from "../services/AuthContext";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import PortOne from "@portone/browser-sdk/v2";
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        naver: any;
    }
}

interface NaverLatLng {
    lat(): number;
    lng(): number;
}

interface NaverMap {
    setCenter(position: any): void;
    panTo(position: any): void;
    getCenter(): NaverLatLng;
    setZoom(level: number): void;
    getZoom(): number; // getZoom 메서드 추가
}

// 제휴점 정보 타입 정의
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
    businessHours: Record<string, BusinessHourDto>;
    status: string;
    smallBagsAvailable?: number;
    mediumBagsAvailable?: number;
    largeBagsAvailable?: number;
}

// 비즈니스 시간 타입 정의
interface BusinessHourDto {
    enabled: boolean;
    open: string;
    close: string;
}

//영문 지도 변환
const Map = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const { user, isAuthenticated } = useAuth();

    const mapRef = useRef<HTMLDivElement>(null);
    const [userPosition, setUserPosition] = useState<{lat: number, lng: number} | null>(null);
    const [isMapMoved, setIsMapMoved] = useState(false);
    const [mapInstance, setMapInstance] = useState<NaverMap | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('18:00');
    const [partnershipMarkers, setPartnershipMarkers] = useState<any[]>([]);
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const [bagSizes, setBagSizes] = useState({
        small: 0,
        medium: 0,
        large: 0
    });
    const [totalPrice, setTotalPrice] = useState(0);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isPaymentComplete, setIsPaymentComplete] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // 포트원 결제 관련 상태
    const [portonePaymentId, setPortonePaymentId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'portone'>('portone'); // 기본값을 포트원으로 설정
    const [storageDuration, setStorageDuration] = useState("day");
    const [storageDate, setStorageDate] = useState("");
    const [storageStartTime, setStorageStartTime] = useState("");
    const [storageEndTime, setStorageEndTime] = useState("");
    // 시간 유효성 상태 추가
    const [isTimeValid, setIsTimeValid] = useState(true);
    // 종료 날짜 상태 추가
    const [storageEndDate, setStorageEndDate] = useState("");

    // 예약 관련 상태
    const [reservationError, setReservationError] = useState("");
    const [reservationSuccess, setReservationSuccess] = useState(false);
    const [submittedReservation, setSubmittedReservation] = useState<{
        id?: number;
        userId?: number;
        userEmail?: string;
        userName?: string;
        placeName?: string;
        placeAddress?: string;
        reservationNumber?: string;
        storageDate?: string;
        storageEndDate?: string | null;
        storageStartTime?: string;
        storageEndTime?: string;
        smallBags?: number;
        mediumBags?: number;
        largeBags?: number;
        totalPrice?: number;
        storageType?: string;
        status?: string;
    } | null>(null);

    // 제휴점 데이터 상태 추가
    const [partnerships, setPartnerships] = useState<Partnership[]>([]);
    const [partnershipOverlays, setPartnershipOverlays] = useState<any[]>([]);
    const [realTimeCapacity, setRealTimeCapacity] = useState<{small: number, medium: number, large: number}>({small: 0, medium: 0, large: 0});

    // 공통 스크롤바 스타일 정의
    const scrollbarStyle = {
        '&::-webkit-scrollbar': {
            width: '4px', // 더 얇게 조정
            backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)', // 더 연한 색상
            borderRadius: '10px', // 더 둥글게
            transition: 'background-color 0.2s ease', // 부드러운 색상 전환
            '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)', // hover 시 약간 진하게
            }
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
            margin: '4px 0', // 상하 여백 추가
        },
        // Firefox 스크롤바 스타일
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0, 0, 0, 0.08) transparent',
        // 스크롤 동작을 부드럽게
        scrollBehavior: 'smooth',
    };

    // 시간 선택 범위 정의 (30분 간격)
    const timeOptions = [
        '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
        '04:00', '04:30', '05:00', '05:30',
        '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
        '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
        '22:30', '23:00', '23:30'
    ];

    // Hero 컴포넌트에서 전달받은 상태 확인
    const { searchQuery = '', searchResults: initialSearchResults = [], initialPosition, searchType } = (location.state as any) || {};

    // 컴포넌트 마운트 시 검색어와 검색 결과 설정
    useEffect(() => {
        if (searchQuery) {
            setSearchKeyword(searchQuery);

            // 지역명 검색인 경우 바로 검색 실행
            if (searchType === 'location') {
                console.log('지역명 검색 모드로 실행:', searchQuery);
                // 약간 지연을 주어 컴포넌트가 완전히 마운트된 후 검색 실행
                setTimeout(() => {
                    if (mapInstance) {
                        searchPlaces();
                    } else {
                        // 지도 인스턴스가 아직 초기화되지 않은 경우, 더 큰 지연 후 재시도
                        console.log('지도 인스턴스 대기 중... 1초 후 재시도');
                        setTimeout(() => searchPlaces(), 1000);
                    }
                }, 500);
            }
        }

        if (initialSearchResults && initialSearchResults.length > 0) {
            // 검색 결과를 place 형식으로 변환
            const convertedResults = initialSearchResults.map((p: any) => ({
                place_name: p.businessName,
                address_name: p.address,
                phone: p.phone,
                category_group_code: getCategoryCodeFromBusinessType(p.businessType),
                x: p.longitude.toString(),
                y: p.latitude.toString(),
                opening_hours: p.is24Hours ? "24시간 영업" : formatBusinessHours(p.businessHours)
            }));

            // 시간에 따른 필터링
            const timeFilteredPlaces = filterPlacesByTime(convertedResults, startTime, endTime);
            setSearchResults(timeFilteredPlaces);
        }
    }, [searchQuery, initialSearchResults, startTime, endTime, searchType, mapInstance]);

    // 초기 위치 설정 - Hero 컴포넌트에서 받은 위치 정보가 있으면 사용
    useEffect(() => {
        if (initialPosition && mapInstance) {
            console.log('Hero에서 전달받은 초기 위치 정보:', initialPosition);
            const { latitude, longitude } = initialPosition;

            if (!latitude || !longitude) {
                console.error('유효하지 않은 좌표 정보:', initialPosition);
                return;
            }

            try {
                const moveLatLng = new window.naver.maps.LatLng(latitude, longitude);
                console.log('이동할 좌표:', latitude, longitude);

                // 부드러운 이동 처리
                const currentZoom = mapInstance.getZoom();
                console.log('현재 줌 레벨:', currentZoom);

                // 위치 이동
                console.log('지도 중심 이동 시도');
                mapInstance.setCenter(moveLatLng);
                console.log('지도 중심 이동 완료');

                // 애니메이션 효과 (줌 아웃 후 줌 인)
                setTimeout(() => {
                    try {
                        console.log('줌 아웃 시도');
                        mapInstance.setZoom(currentZoom - 1);
                        console.log('줌 아웃 완료');

                        setTimeout(() => {
                            try {
                                console.log('줌 인 시도');
                                mapInstance.setZoom(currentZoom);
                                console.log('줌 인 완료');
                            } catch (error) {
                                console.error('줌 인 중 오류:', error);
                            }
                        }, 250);
                    } catch (error) {
                        console.error('줌 아웃 중 오류:', error);
                    }
                }, 50);
            } catch (error) {
                console.error('초기 위치 설정 중 오류:', error);
            }
        }
    }, [initialPosition, mapInstance]);

    useEffect(() => {
        const container = document.getElementById("map") as HTMLElement;

        // 마커 관련 스타일 추가
        const addMapStyles = () => {
            // 기존 스타일 요소가 있으면 제거
            const existingStyle = document.getElementById('travellight-map-styles');
            if (existingStyle) {
                existingStyle.remove();
            }

            // 새 스타일 요소 생성
            const styleElement = document.createElement('style');
            styleElement.id = 'travellight-map-styles';
            styleElement.textContent = `
                @keyframes pulse {
                    0% {
                        transform: scale(0.8);
                        opacity: 0.8;
                    }
                    70% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                
                .luggage-marker {
                    transition: transform 0.2s ease-out !important;
                }
                
                .luggage-marker:hover {
                    transform: translateY(-6px) !important;
                }
                
                .info-window {
                    background-color: white;
                    border-radius: 16px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                    overflow: hidden;
                    min-width: 220px;
                    max-width: 300px;
                    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
                }
                
                .info-window .title {
                    background-color: #2E7DF1;
                    color: white;
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                }
                
                .info-window .store-name {
                    font-weight: 600;
                    font-size: 15px;
                    letter-spacing: -0.3px;
                }
                
                .info-window .close {
                    cursor: pointer;
                    font-size: 20px;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                    line-height: 1;
                }
                
                .info-window .close:hover {
                    opacity: 1;
                }
                
                .info-window .body {
                    padding: 14px 16px;
                }
                
                .info-window .badge {
                    display: inline-block;
                    background-color: #f0f5ff;
                    color: #2E7DF1;
                    font-size: 12px;
                    font-weight: 500;
                    padding: 3px 8px;
                    border-radius: 12px;
                    margin-bottom: 8px;
                }
                
                .info-window .address {
                    font-size: 13px;
                    line-height: 1.4;
                    color: #333;
                    margin-bottom: 6px;
                    word-break: keep-all;
                }
                
                .info-window .phone, .info-window .hours {
                    font-size: 12px;
                    color: #666;
                    display: flex;
                    align-items: center;
                    margin-top: 4px;
                }
                
                .info-window .hours::before {
                    content: '';
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='%23666'%3E%3Cpath d='M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,6a1,1,0,0,0-1,1v5a1,1,0,0,0,.5.87l4,2.5a1,1,0,0,0,1.37-.37,1,1,0,0,0-.37-1.37l-3.5-2.18V7A1,1,0,0,0,12,6Z'/%3E%3C/svg%3E");
                    background-size: cover;
                    margin-right: 6px;
                }
                
                .info-window .phone::before {
                    content: '';
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' fill='%23666'%3E%3Cpath d='M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,6a1,1,0,0,0-1,1v5a1,1,0,0,0,.5.87l4,2.5a1,1,0,0,0,1.37-.37,1,1,0,0,0-.37-1.37l-3.5-2.18V7A1,1,0,0,0,12,6Z'/%3E%3C/svg%3E");
                    background-size: cover;
                    margin-right: 6px;
                }
            `;

            document.head.appendChild(styleElement);
        };

        // 네이버 지도 객체가 로드됐는지 확인
        const waitForNaverMaps = () => {
            if (window.naver && window.naver.maps) {
                initializeMap();
            } else {
                setTimeout(waitForNaverMaps, 100);
            }
        };

        // 지도 초기화 함수
        const initializeMap = () => {
            // 기존에 생성된 지도 인스턴스가 있으면 정리
            if (mapInstance) {
                console.log("기존 지도 인스턴스 제거");

                // 모든 마커 및 오버레이 제거
                partnershipOverlays.forEach(marker => {
                    marker.setMap(null);
                });

                // 필요하다면 추가적인 리소스 정리

                // 지도 요소 초기화를 위해 innerHTML 비우기
                if (document.getElementById("map")) {
                    document.getElementById("map")!.innerHTML = "";
                }
            }

            // 스타일 적용
            addMapStyles();

            const options = {
                center: new window.naver.maps.LatLng(33.450701, 126.570667),
                zoom: 15,
                zoomControl: false,
                disableKineticPan: false,
                zoomAnimation: true,
                zoomDuration: 300,
                pinchZoom: true,
                swipeToZoom: true,
                minZoom: 6,
                maxZoom: 21,
                scaleControl: false,
                logoControl: true,
                mapDataControl: false,
                mapTypeControl: false,
                mapTypeId: window.naver.maps.MapTypeId.NORMAL,
                backgroundColor: "#f8f9fa",
                baseTileOpacity: 1,
                disableDoubleClickZoom: false,
                disableDoubleTapZoom: false,
                draggable: true,
                tileTransition: true,
                stylesVisible: true,
                logoControlOptions: {
                    position: window.naver.maps.Position.BOTTOM_RIGHT
                }
            };

            const map = new window.naver.maps.Map(container, options);

            window.naver.maps.Event.once(map, 'init_stylemap', () => {
                console.log('지도 로드 완료, 추가 설정 적용');

                try {
                    map.setMapTypeId(window.naver.maps.MapTypeId.NORMAL);

                    map.setOptions({
                        scaleControl: false,
                        mapTypeControl: false,
                        logoControl: true,
                        mapDataControl: false
                    });

                    var labelLayer = new window.naver.maps.LabelLayer();
                    labelLayer.setMap(null);

                    try {
                        if (map.getPOIOptions) {
                            map.setPOIOptions({
                                density: 0.3,
                                minZoom: 12,
                                maxZoom: 21
                            });
                        }

                        if (window.naver.maps.LabelLayer) {
                            const customLabelOptions = {
                                zIndex: 2,
                                visibleLayers: [
                                    'BACKGROUND_DETAIL',
                                    'POI_KOREAN'
                                ]
                            };

                            const customLabelLayer = new window.naver.maps.LabelLayer(customLabelOptions);
                            customLabelLayer.setMap(map);
                        }
                    } catch (styleError: any) {
                        console.error('POI/라벨 레이어 설정 오류:', styleError);
                    }

                    map.setOptions({
                        mapTypeControl: false,
                        mapDataControl: false,
                        scaleControl: false,
                        logoControl: true,
                        minZoom: 6,
                        maxZoom: 21,
                        tileTransition: true,
                        logoControlOptions: {
                            position: window.naver.maps.Position.BOTTOM_RIGHT
                        }
                    });
                } catch (e) {
                    console.error('지도 스타일 설정 오류:', e);
                }
            });

            setMapInstance(map);
            let currentInfoWindow: any = null;
            let selectedMarker: any = null;

            function displayUserMarker(locPosition: any) {
                const marker = new window.naver.maps.Marker({
                    position: locPosition,
                    map: map,
                    icon: {
                        content: `
                            <div class="user-marker-container" style="position: relative; width: 28px; height: 28px;">
                                <div class="user-marker-pulse" style="
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    width: 28px;
                                    height: 28px;
                                    border-radius: 50%;
                                    background-color: rgba(255, 90, 90, 0.2);
                                    animation: pulse 1.5s infinite;
                                "></div>
                                <div class="user-marker" style="
                                    position: absolute;
                                    top: 6px;
                                    left: 6px;
                                    width: 16px;
                                    height: 16px;
                                    background-color: #FF5A5A;
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                    border: 1.5px solid white;
                                    box-sizing: border-box;
                                    z-index: 1;
                                ">
                                    <div style="
                                        width: 4px;
                                        height: 4px;
                                        background-color: white;
                                        border-radius: 50%;
                                    "></div>
                                </div>
                            </div>
                        `,
                        anchor: new window.naver.maps.Point(14, 14)
                    }
                });

                return marker;
            }

            // 제휴점 마커 제거 함수
            function clearPartnershipMarkers() {
                // 기존 마커 제거
                partnershipOverlays.forEach(marker => {
                    marker.setMap(null);
                });
                setPartnershipOverlays([]);

                // 현재 정보 창도 제거
                if (currentInfoWindow) {
                    currentInfoWindow.close();
                    currentInfoWindow = null;
                }

                // 선택된 마커 초기화
                selectedMarker = null;
            }

            // 제휴점 데이터 가져오는 함수
            const fetchPartnerships = async () => {
                try {
                    // API 호출 시 catch 블록 추가 및 오류 로깅 개선
                    const response = await axios.get('/api/partnership', { timeout: 5000 });
                    if (response.data && response.data.success) {
                        const partnershipData = response.data.data.filter((partnership: Partnership) => partnership.status === 'APPROVED');
                        //console.log('제휴점 데이터:', partnershipData);
                        setPartnerships(partnershipData);

                        // 기존 마커 제거
                        clearPartnershipMarkers();

                        // 새 제휴점 마커 생성
                        const newOverlays: any[] = [];
                        partnershipData.forEach((partnership: Partnership) => {
                            const marker = displayPartnershipMarker(partnership, map);
                            if (marker) {
                                newOverlays.push(marker);
                            }
                        });
                        setPartnershipOverlays(newOverlays);
                    } else {
                        console.error('제휴점 데이터 가져오기 실패:', response.data?.message || '응답 데이터 없음');
                    }
                } catch (error: any) {
                    console.error('제휴점 데이터 요청 중 오류:', error);
                    // API 서버가 실행 중이지 않은 경우 임시 처리
                    // 실제 환경에서는 이 부분을 제거하고 적절한 에러 UI 표시 필요
                    if (process.env.NODE_ENV === 'development') {
                        console.log('개발 환경에서 API 호출 실패, 임시 데이터 사용');
                    }
                }
            };

            // 제휴점 마커 표시 함수
            function displayPartnershipMarker(partnership: Partnership, map: any) {
                try {
                    const markerPosition = new window.naver.maps.LatLng(partnership.latitude, partnership.longitude);

                    // 통일된 메인 색상 설정 (TravelLight 브랜드 컬러)
                    const primaryColor = "#2E7DF1"; // 앱 메인 컬러
                    const secondaryColor = "#FFFFFF"; // 아이콘 내부 색상

                    // 세련된 캐리어 아이콘 HTML 생성
                    const markerContent = `
                        <div class="luggage-marker-container" style="position: relative; width: 28px; height: 28px;">
                            <div class="luggage-marker" style="
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 28px;
                                height: 28px;
                                background-color: ${primaryColor};
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                border: 1.5px solid white;
                                box-sizing: border-box;
                                transform-origin: center bottom;
                                transform: translateY(-2px);
                                transition: transform 0.2s ease-out;
                            ">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="${secondaryColor}">
                                    <path d="M17,6V5A3,3,0,0,0,14,2H10A3,3,0,0,0,7,5V6H4A2,2,0,0,0,2,8V20a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2ZM10,4h4a1,1,0,0,1,1,1V6H9V5A1,1,0,0,1,10,4ZM20,20H4V8H20Zm-2-9H6a1,1,0,0,0,0,2H18a1,1,0,0,0,0-2Z"/>
                                </svg>
                            </div>
                            <div class="luggage-marker-shadow" style="
                                position: absolute;
                                bottom: -2px;
                                left: 7px;
                                width: 14px;
                                height: 3px;
                                background-color: rgba(0,0,0,0.2);
                                border-radius: 50%;
                                filter: blur(1px);
                            "></div>
                        </div>
                    `;

                    // 마커 생성
                    const marker = new window.naver.maps.Marker({
                        position: markerPosition,
                        map: map,
                        icon: {
                            content: markerContent,
                            anchor: new window.naver.maps.Point(14, 28) // 앵커 포인트를 아이콘 하단 중앙으로 조정
                        },
                        title: partnership.businessName
                    });

                    // 마커에 hover 효과 추가
                    const markerElement = marker.getElement();
                    if (markerElement) {
                        markerElement.addEventListener('mouseover', function() {
                            const luggage = markerElement.querySelector('.luggage-marker');
                            if (luggage) {
                                luggage.style.transform = 'translateY(-6px)';
                            }
                        });

                        markerElement.addEventListener('mouseout', function() {
                            const luggage = markerElement.querySelector('.luggage-marker');
                            if (luggage) {
                                luggage.style.transform = 'translateY(-2px)';
                            }
                        });
                    }

                    // 매장명 처리 - 길이 제한
                    let placeName = partnership.businessName;
                    if (placeName.length > 20) {
                        placeName = placeName.substring(0, 19) + '...';
                    }

                    // 영업시간 정보 가져오기
                    let hours = partnership.is24Hours ?
                        "24시간 영업" :
                        partnership.businessHours ?
                            formatBusinessHours(partnership.businessHours) :
                            "영업시간 정보 없음";

                    // 실시간 보관 가능한 개수를 가져오는 함수
                    const createInfoWindowContent = async () => {
                        let availableCapacity = { smallBags: 0, mediumBags: 0, largeBags: 0 };

                        try {
                            availableCapacity = await fetchRealTimeCapacity(partnership.businessName, partnership.address);
                        } catch (error) {
                            console.error('실시간 용량 조회 실패:', error);
                            // 실패 시 최대 용량으로 대체
                            availableCapacity = {
                                smallBags: partnership.smallBagsAvailable || 0,
                                mediumBags: partnership.mediumBagsAvailable || 0,
                                largeBags: partnership.largeBagsAvailable || 0
                            };
                        }

                        return `
                            <div style="
                                background-color: white;
                                border-radius: 16px;
                                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                                overflow: hidden;
                                min-width: 220px;
                                max-width: 300px;
                                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
                            ">
                                <div style="
                                    background-color: #2E7DF1;
                                    color: white;
                                    padding: 12px 16px;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                ">
                                    <span style="
                                        font-weight: 600;
                                        font-size: 15px;
                                        letter-spacing: -0.3px;
                                    ">${partnership.businessName}</span>
                                </div>
                                <div style="padding: 14px 16px;">
                                    <div style="
                                        display: inline-block;
                                        background-color: #f0f5ff;
                                        color: #2E7DF1;
                                        font-size: 12px;
                                        font-weight: 500;
                                        padding: 3px 8px;
                                        border-radius: 12px;
                                        margin-bottom: 8px;
                                    ">${partnership.businessType}</div>
                                    <div style="
                                        font-size: 13px;
                                        line-height: 1.4;
                                        color: #333;
                                        margin-bottom: 6px;
                                        word-break: keep-all;
                                    ">${partnership.address}</div>
                                    
                                    <!-- 현재 보관 가능한 짐 개수 정보 -->
                                    <div style="
                                        background-color: #f8f9fa;
                                        border-radius: 8px;
                                        padding: 8px;
                                        margin: 8px 0;
                                        border-left: 3px solid #2E7DF1;
                                    ">
                                        <div style="
                                            font-size: 12px;
                                            font-weight: 600;
                                            color: #2E7DF1;
                                            margin-bottom: 4px;
                                        ">현재 보관 가능한 짐</div>
                                        <div style="
                                            display: flex;
                                            gap: 8px;
                                            font-size: 11px;
                                            color: #666;
                                        ">
                                            <span style="color: ${availableCapacity.smallBags > 0 ? '#28a745' : '#dc3545'};">
                                                소형: ${availableCapacity.smallBags}개
                                            </span>
                                            <span style="color: ${availableCapacity.mediumBags > 0 ? '#28a745' : '#dc3545'};">
                                                중형: ${availableCapacity.mediumBags}개
                                            </span>
                                            <span style="color: ${availableCapacity.largeBags > 0 ? '#28a745' : '#dc3545'};">
                                                대형: ${availableCapacity.largeBags}개
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style="
                                        font-size: 12px;
                                        color: #666;
                                        display: flex;
                                        align-items: center;
                                        margin-top: 6px;
                                    ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="#666" style="margin-right: 6px;">
                                            <path d="M19.44,13c-.22,0-.45-.07-.67-.12a9.44,9.44,0,0,1-1.31-.39,2,2,0,0,0-2.48,1l-.22.45a12.18,12.18,0,0,1-2.66-2,12.18,12.18,0,0,1-2-2.66L10.52,9a2,2,0,0,0,1-2.48,10.33,10.33,0,0,1-.39-1.31c-.05-.22-.09-.45-.12-.68a3,3,0,0,0-3-2.49h-3a3,3,0,0,0-3,3.41A19,19,0,0,0,18.53,21.91l.38,0a3,3,0,0,0,2-.76,3,3,0,0,0,1-2.25v-3A3,3,0,0,0,19.44,13Z"/>
                                        </svg>
                                        ${partnership.phone || "전화번호 정보 없음"}
                                    </div>
                                    <div style="
                                        font-size: 12px;
                                        color: #666;
                                        display: flex;
                                        align-items: center;
                                        margin-top: 6px;
                                    ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="#666" style="margin-right: 6px;">
                                            <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,6a1,1,0,0,0-1,1v5a1,1,0,0,0,.5.87l4,2.5a1,1,0,0,0,1.37-.37,1,1,0,0,0-.37-1.37l-3.5-2.18V7A1,1,0,0,0,12,6Z"/>
                                        </svg>
                                        ${hours}
                                    </div>
                                </div>
                            </div>
                        `;
                    };

                    // 정보 창 생성 (비동기로 내용 생성)
                    let infoWindow: any = null;

                    // 마커 클릭 이벤트
                    window.naver.maps.Event.addListener(marker, 'click', async () => {
                        // 현재 열린 정보창이 있으면 닫기
                        if (currentInfoWindow) {
                            currentInfoWindow.close();
                        }

                        // 로딩 중 표시할 임시 내용
                        const loadingContent = `
                            <div style="
                                background-color: white;
                                border-radius: 16px;
                                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                                overflow: hidden;
                                min-width: 220px;
                                max-width: 300px;
                                font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
                                padding: 20px;
                                text-align: center;
                            ">
                                <div style="color: #666; font-size: 14px;">
                                    보관 가능한 개수를 확인 중...
                                </div>
                            </div>
                        `;

                        // 임시 정보창 생성 및 표시
                        infoWindow = new window.naver.maps.InfoWindow({
                            content: loadingContent,
                            maxWidth: 300,
                            backgroundColor: "transparent",
                            borderColor: "transparent",
                            disableAnchor: true
                        });

                        infoWindow.open(map, marker);
                        currentInfoWindow = infoWindow;

                        // 선택된 마커 저장
                        selectedMarker = marker;

                        // 선택된 장소 데이터 설정
                        const placeData = {
                            place_name: partnership.businessName,
                            address_name: partnership.address,
                            phone: partnership.phone,
                            category_group_code: getCategoryCodeFromBusinessType(partnership.businessType),
                            x: partnership.longitude.toString(),
                            y: partnership.latitude.toString(),
                            opening_hours: partnership.is24Hours ? "24시간 영업" : formatBusinessHours(partnership.businessHours)
                        };

                        setSelectedPlace(placeData);
                        // 사이드바가 닫혀있으면 열기
                        setIsSidebarOpen(true);

                        // 실제 내용으로 업데이트
                        try {
                            const actualContent = await createInfoWindowContent();
                            if (currentInfoWindow === infoWindow) { // 여전히 같은 정보창이 열려있는지 확인
                                infoWindow.setContent(actualContent);
                            }
                        } catch (error) {
                            console.error('정보창 내용 생성 실패:', error);
                            if (currentInfoWindow === infoWindow) {
                                infoWindow.setContent(`
                                    <div style="
                                        background-color: white;
                                        border-radius: 16px;
                                        padding: 20px;
                                        text-align: center;
                                        color: #dc3545;
                                        font-size: 14px;
                                    ">
                                        정보를 불러올 수 없습니다.
                                    </div>
                                `);
                            }
                        }
                    });

                    // 닫기 버튼 클릭 이벤트 (정보창 내부의 X 버튼)
                    // window.naver.maps.Event.addListener(infoWindow, 'domready', () => {
                    //     setTimeout(() => {
                    //         const closeButton = document.querySelector('span[style*="cursor: pointer"][style*="font-size: 22px"]');
                    //         if (closeButton) {
                    //             closeButton.addEventListener('click', () => {
                    //                 infoWindow.close();
                    //                 currentInfoWindow = null;
                    //             });
                    //         }
                    //     }, 100); // 작은 지연 시간 추가
                    // });

                    return marker;
                } catch (error) {
                    console.error("제휴점 마커 표시 중 오류:", error);
                    return null;
                }
            }

            // 비즈니스 타입에 따른 카테고리 코드 반환
            function getCategoryCodeFromBusinessType(businessType: string): string {
                switch (businessType) {
                    case "카페": return "CE7";
                    case "편의점": return "CS2";
                    case "숙박": return "AD5";
                    case "식당": return "FD6";
                    default: return "ETC";
                }
            }

            // 영업 시간 포맷팅 함수
            function formatBusinessHours(businessHours: Record<string, BusinessHourDto>): string {
                if (!businessHours || Object.keys(businessHours).length === 0) {
                    return "영업시간 정보 없음";
                }

                // 요일별 영업 시간 중 첫번째 항목만 표시 (간단하게)
                const firstDayKey = Object.keys(businessHours)[0];
                const hourData = businessHours[firstDayKey];

                if (!hourData.enabled) {
                    return "휴무일";
                }

                return `${hourData.open} - ${hourData.close}`;
            }

            // 지도 드래그 이벤트
            window.naver.maps.Event.addListener(map, "dragend", () => {
                // 결제 완료 상태에서는 새 마커를 불러오지 않음
                if (isPaymentComplete) return;

                setIsMapMoved(true);
            });

            // 지도 클릭 이벤트
            window.naver.maps.Event.addListener(map, "click", () => {
                // 결제 완료 상태에서는 반응하지 않음
                if (isPaymentComplete) return;

                // 선택된 장소 초기화
                setSelectedPlace(null);

                // 현재 정보창 닫기
                if (currentInfoWindow) {
                    currentInfoWindow.close();
                    currentInfoWindow = null;
                }
            });

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        const locPosition = new window.naver.maps.LatLng(lat, lng);
                        setUserPosition({lat, lng});

                        // 사용자 마커 생성
                        displayUserMarker(locPosition);

                        // 위치로 부드럽게 이동
                        // 1단계: 먼저 기본 줌 레벨로 설정
                        map.setZoom(15);

                        // 약간의 딜레이 후 중앙으로 이동
                        setTimeout(() => {
                            map.setCenter(locPosition);
                            setIsMapMoved(false);
                        }, 100);

                        // 제휴점 데이터 가져오기
                        fetchPartnerships();
                    },
                    () => {
                        // 제휴점 데이터 가져오기
                        fetchPartnerships();
                    }
                );
            } else {
                // 제휴점 데이터 가져오기
                fetchPartnerships();
            }

            // 컴포넌트 언마운트 시 정리
            return () => {
                // 모든 마커와 오버레이 제거
                clearPartnershipMarkers();
            };
        };

        // 네이버 지도 API 로드 확인
        waitForNaverMaps();

        // 언어 변경 이벤트 리스너 등록
        const handleMapLanguageChange = () => {
            console.log("언어 변경 감지, 지도 다시 로드");
            // 약간의 지연을 주어 naver 객체가 완전히 교체된 후 지도를 초기화
            setTimeout(waitForNaverMaps, 500);
        };

        window.addEventListener('naverMapLanguageChanged', handleMapLanguageChange);

        // 클린업 함수
        return () => {
            window.removeEventListener('naverMapLanguageChanged', handleMapLanguageChange);
            if (mapInstance) {
                // 필요한 클린업 로직
                partnershipOverlays.forEach(marker => {
                    marker.setMap(null);
                });
            }
        };
    }, [isPaymentComplete]); // partnershipOverlays 의존성 제거

    // 현재 위치로 돌아가는 함수를 useCallback으로 메모이제이션
    const returnToMyLocation = useCallback(() => {
        if (userPosition && mapInstance) {
            const naverLatLng = new window.naver.maps.LatLng(userPosition.lat, userPosition.lng);
            // 애니메이션 효과를 위해 panTo 사용
            mapInstance.panTo(naverLatLng);
            setIsMapMoved(false);
        }
    }, [userPosition, mapInstance]);

    // 초기 시작 시간 설정 함수
    const getInitialStartTime = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // 현재 시간이 9시 이전이면 9:00 반환
        if (hours < 9) return '09:00';

        // 현재 시간이 18시 이후면 18:00 반환
        if (hours >= 18) return '18:00';

        // 현재 시간을 30분 단위로 반올림
        const roundedMinutes = Math.ceil(minutes / 30) * 30;
        const adjustedHours = roundedMinutes === 60 ? hours + 1 : hours;
        const adjustedMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;

        return `${adjustedHours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`;
    };

    // 영업 시간 체크 함수 수정
    const isOpenDuringTime = (place: any, startTime: string, endTime: string) => {
        // 제휴점의 경우 비즈니스 타입에 따라 영업시간 확인
        if (place.category_group_code === "CS2") { // 편의점
            // 24시간 영업 편의점으로 가정
            return true;
        } else if (place.category_group_code === "CE7") { // 카페
            const [startHour] = startTime.split(':').map(Number);
            const [endHour] = endTime.split(':').map(Number);
            // 카페 기본 영업시간 08:00-22:00
            return startHour >= 8 && endHour <= 22;
        } else if (place.category_group_code === "FD6") { // 식당
            const [startHour] = startTime.split(':').map(Number);
            const [endHour] = endTime.split(':').map(Number);
            // 식당 기본 영업시간 11:00-22:00
            return startHour >= 11 && endHour <= 22;
        } else if (place.category_group_code === "AD5") { // 숙박
            // 숙박 시설은 24시간 영업으로 가정
            return true;
        }

        // 기본 영업시간 09:00-18:00
        const [startHour] = startTime.split(':').map(Number);
        const [endHour] = endTime.split(':').map(Number);
        return startHour >= 9 && endHour <= 18;
    };

    // 검색 결과 필터링 함수
    const filterPlacesByTime = (places: any[], startTime: string, endTime: string) => {
        return places.filter(place => isOpenDuringTime(place, startTime, endTime));
    };

    // searchPlaces 함수 수정 - 네이버맵 API에 맞게 수정
    const searchPlaces = () => {
        if (!searchKeyword.trim()) return;

        console.log('검색 실행:', searchKeyword, '검색 타입:', searchType);

        // 지도 인스턴스가 준비되지 않았다면 잠시 대기 후 재시도
        if (!mapInstance) {
            console.log('지도 인스턴스가 아직 준비되지 않았습니다. 잠시 후 재시도합니다.');
            setTimeout(() => searchPlaces(), 500);
            return;
        }

        // 지역명 검색 모드인 경우 네이버 지도 API 사용
        if (searchType === 'location') {
            console.log('네이버 지도 API로 지역 검색 시도:', searchKeyword);

            const searchOptions = {
                query: searchKeyword
            };

            // 네이버 서치 API를 통한 검색
            window.naver.maps.Service.geocode(searchOptions, (status: any, response: any) => {
                console.log('네이버 지도 API 응답:', status);
                console.log('응답 데이터 전체:', response);

                if (status === window.naver.maps.Service.Status.OK) {
                    // 응답 구조 확인
                    if (!response || !response.v2 || !response.v2.addresses || !Array.isArray(response.v2.addresses)) {
                        console.error('예상치 못한 응답 구조:', response);
                        searchPlacesByKeyword(searchKeyword); // places API로 대체 검색
                        return;
                    }

                    const results = response.v2.addresses;
                    console.log('검색 결과 주소 목록:', results);

                    if (results.length > 0) {
                        const firstResult = results[0];
                        console.log('선택된 결과:', firstResult);

                        // 필수 좌표 정보 확인
                        if (!firstResult.y || !firstResult.x) {
                            console.error('좌표 정보 없음:', firstResult);
                            searchPlacesByKeyword(searchKeyword); // places API로 대체 검색
                            return;
                        }

                        moveToLocation(firstResult.y, firstResult.x);
                        searchNearbyPartnerships(firstResult.y, firstResult.x, firstResult.roadAddress || firstResult.jibunAddress || '');

                        // partnerships를 place 형식으로 변환하여 검색 결과에 추가
                        const filteredPartnerships = partnerships.filter(p => {
                            // 주소의 일부가 검색 결과와 일치하는지 확인
                            return p.address.includes(firstResult.roadAddress) ||
                                p.address.includes(firstResult.jibunAddress) ||
                                firstResult.roadAddress.includes(p.address) ||
                                firstResult.jibunAddress.includes(p.address) ||
                                // 추가: 검색 지역 근처 5km 이내의 매장도 포함
                                calculateDistance(
                                    parseFloat(firstResult.y),
                                    parseFloat(firstResult.x),
                                    p.latitude,
                                    p.longitude
                                ) < 5;
                        });

                        const convertedPlaces = filteredPartnerships.map(p => ({
                            place_name: p.businessName,
                            address_name: p.address,
                            phone: p.phone,
                            category_group_code: getCategoryCodeFromBusinessType(p.businessType),
                            x: p.longitude.toString(),
                            y: p.latitude.toString(),
                            opening_hours: p.is24Hours ? "24시간 영업" : formatBusinessHours(p.businessHours)
                        }));

                        // 시간에 따른 필터링
                        const timeFilteredPlaces = filterPlacesByTime(convertedPlaces, startTime, endTime);
                        setSearchResults(timeFilteredPlaces);
                        setSelectedPlace(null);

                        // 검색 결과가 없어도 지도는 이동
                        if (timeFilteredPlaces.length === 0) {
                            console.log('검색된 지역 근처에 제휴 매장이 없습니다.');
                        }
                    } else {
                        console.log('주소 검색 결과 없음, 장소 검색으로 전환');
                        searchPlacesByKeyword(searchKeyword); // places API로 대체 검색
                    }
                } else {
                    console.log('주소 검색 실패, 장소 검색으로 전환');
                    searchPlacesByKeyword(searchKeyword); // places API로 대체 검색
                }
            });
        } else {
            // 먼저 제휴 매장 검색 시도
            const filteredPartnerships = partnerships.filter(p => {
                // 검색어와 비즈니스 이름 또는 주소가 부분적으로 일치하는지 확인 (대소문자 무시)
                return p.businessName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                    p.address.toLowerCase().includes(searchKeyword.toLowerCase());
            });

            // 매장명 또는 주소로 매장을 찾은 경우
            if (filteredPartnerships.length > 0) {
                // 첫 번째 매칭된 매장으로 지도 이동
                const firstMatch = filteredPartnerships[0];
                const moveLatLng = new window.naver.maps.LatLng(firstMatch.latitude, firstMatch.longitude);

                // 부드러운 이동 처리
                if (mapInstance) {
                    // 현재 줌 레벨 저장
                    const currentZoom = mapInstance.getZoom();

                    // 1단계: 먼저 위치 이동
                    mapInstance.setCenter(moveLatLng);

                    // 2단계: 이동 후 애니메이션 효과 (줌 아웃 후 줌 인)
                    setTimeout(() => {
                        // 줌 아웃
                        mapInstance.setZoom(currentZoom - 1);

                        // 잠시 후 다시 원래 줌으로
                        setTimeout(() => {
                            mapInstance.setZoom(currentZoom);
                        }, 250);
                    }, 50);
                }

                // partnerships를 place 형식으로 변환하여 검색 결과에 추가
                const convertedPlaces = filteredPartnerships.map(p => ({
                    place_name: p.businessName,
                    address_name: p.address,
                    phone: p.phone,
                    category_group_code: getCategoryCodeFromBusinessType(p.businessType),
                    x: p.longitude.toString(),
                    y: p.latitude.toString(),
                    opening_hours: p.is24Hours ? "24시간 영업" : formatBusinessHours(p.businessHours)
                }));

                // 시간에 따른 필터링
                const timeFilteredPlaces = filterPlacesByTime(convertedPlaces, startTime, endTime);
                setSearchResults(timeFilteredPlaces);
                setSelectedPlace(null);
            } else {
                // 매장명/주소 검색 결과가 없는 경우 지역명으로 검색 시도
                console.log('매장명/주소 검색 결과 없음, 지역명 검색으로 전환');

                const searchOptions = {
                    query: searchKeyword
                };

                // 네이버 서치 API를 통한 검색
                window.naver.maps.Service.geocode(searchOptions, (status: any, response: any) => {
                    console.log('네이버 지도 API 응답:', status);
                    console.log('응답 데이터 전체:', response);

                    if (status === window.naver.maps.Service.Status.OK) {
                        // 응답 구조 확인
                        if (!response || !response.v2 || !response.v2.addresses || !Array.isArray(response.v2.addresses)) {
                            console.error('예상치 못한 응답 구조:', response);
                            alert("검색 결과를 처리할 수 없습니다. 다른 검색어를 시도해보세요.");
                            return;
                        }

                        const results = response.v2.addresses;
                        console.log('검색 결과 주소 목록:', results);

                        if (results.length > 0) {
                            const firstResult = results[0];
                            console.log('선택된 결과:', firstResult);

                            // 필수 좌표 정보 확인
                            if (!firstResult.y || !firstResult.x) {
                                console.error('좌표 정보 없음:', firstResult);
                                alert("검색 결과에 위치 정보가 없습니다. 다른 검색어를 시도해보세요.");
                                return;
                            }

                            const moveLatLng = new window.naver.maps.LatLng(firstResult.y, firstResult.x);
                            console.log('이동할 좌표:', firstResult.y, firstResult.x);

                            // 부드러운 이동 처리
                            if (mapInstance) {
                                // 현재 줌 레벨 저장
                                const currentZoom = mapInstance.getZoom();
                                console.log('현재 줌 레벨:', currentZoom);

                                try {
                                    // 1단계: 먼저 위치 이동
                                    console.log('지도 중심 이동 시도');
                                    mapInstance.setCenter(moveLatLng);
                                    console.log('지도 중심 이동 완료');

                                    // 2단계: 이동 후 애니메이션 효과 (줌 아웃 후 줌 인)
                                    setTimeout(() => {
                                        try {
                                            // 줌 아웃
                                            console.log('줌 아웃 시도');
                                            mapInstance.setZoom(currentZoom - 1);
                                            console.log('줌 아웃 완료');

                                            // 잠시 후 다시 원래 줌으로
                                            setTimeout(() => {
                                                try {
                                                    console.log('줌 인 시도');
                                                    mapInstance.setZoom(currentZoom);
                                                    console.log('줌 인 완료');
                                                } catch (error) {
                                                    console.error('줌 인 중 오류:', error);
                                                }
                                            }, 250);
                                        } catch (error) {
                                            console.error('줌 아웃 중 오류:', error);
                                        }
                                    }, 50);
                                } catch (error) {
                                    console.error('지도 이동 중 오류:', error);
                                }
                            } else {
                                console.error('지도 인스턴스가 없습니다.');
                            }

                            // 검색 결과를 partnerships에서 필터링 (주소 기반으로만)
                            const nearbyPartnerships = partnerships.filter(p => {
                                // 주소의 일부가 검색 결과와 일치하는지 확인
                                return p.address.includes(firstResult.roadAddress) ||
                                    p.address.includes(firstResult.jibunAddress) ||
                                    firstResult.roadAddress.includes(p.address) ||
                                    firstResult.jibunAddress.includes(p.address) ||
                                    // 추가: 검색 지역 근처 5km 이내의 매장도 포함
                                    calculateDistance(
                                        parseFloat(firstResult.y),
                                        parseFloat(firstResult.x),
                                        p.latitude,
                                        p.longitude
                                    ) < 5;
                            });

                            // partnerships를 place 형식으로 변환하여 검색 결과에 추가
                            const convertedPlaces = nearbyPartnerships.map(p => ({
                                place_name: p.businessName,
                                address_name: p.address,
                                phone: p.phone,
                                category_group_code: getCategoryCodeFromBusinessType(p.businessType),
                                x: p.longitude.toString(),
                                y: p.latitude.toString(),
                                opening_hours: p.is24Hours ? "24시간 영업" : formatBusinessHours(p.businessHours)
                            }));

                            // 시간에 따른 필터링
                            const timeFilteredPlaces = filterPlacesByTime(convertedPlaces, startTime, endTime);
                            setSearchResults(timeFilteredPlaces);
                            setSelectedPlace(null);

                            // 검색 결과가 없어도 지도는 이동
                            if (timeFilteredPlaces.length === 0) {
                                console.log('검색된 지역 근처에 제휴 매장이 없습니다.');
                            }
                        } else {
                            alert("검색 결과가 없습니다.");
                        }
                    } else {
                        alert("검색 결과가 없습니다. 다른 검색어를 시도해보세요.");
                    }
                });
            }
        }
    };

    // 거리 계산 함수 추가 (위도/경도 좌표 간의 거리를 km 단위로 계산)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // 지구 반경 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // 제휴점 내에서만 검색하는 함수 분리
    const searchPartnerships = () => {
        // 매장명/주소로 제휴점 검색
        const filteredPartnerships = partnerships.filter(p => {
            // 검색어와 비즈니스 이름 또는 주소가 부분적으로 일치하는지 확인 (대소문자 무시)
            return p.businessName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                p.address.toLowerCase().includes(searchKeyword.toLowerCase());
        });

        // 매장명 또는 주소로 매장을 찾은 경우
        if (filteredPartnerships.length > 0) {
            // 첫 번째 매칭된 매장으로 지도 이동
            const firstMatch = filteredPartnerships[0];
            const moveLatLng = new window.naver.maps.LatLng(firstMatch.latitude, firstMatch.longitude);

            // 부드러운 이동 처리
            if (mapInstance) {
                // 현재 줌 레벨 저장
                const currentZoom = mapInstance.getZoom();

                // 1단계: 먼저 위치 이동
                mapInstance.setCenter(moveLatLng);

                // 2단계: 이동 후 애니메이션 효과 (줌 아웃 후 줌 인)
                setTimeout(() => {
                    // 줌 아웃
                    mapInstance.setZoom(currentZoom - 1);

                    // 잠시 후 다시 원래 줌으로
                    setTimeout(() => {
                        mapInstance.setZoom(currentZoom);
                    }, 250);
                }, 50);
            }

            // partnerships를 place 형식으로 변환하여 검색 결과에 추가
            const convertedPlaces = filteredPartnerships.map(p => ({
                place_name: p.businessName,
                address_name: p.address,
                phone: p.phone,
                category_group_code: getCategoryCodeFromBusinessType(p.businessType),
                x: p.longitude.toString(),
                y: p.latitude.toString(),
                opening_hours: p.is24Hours ? "24시간 영업" : formatBusinessHours(p.businessHours)
            }));

            // 시간에 따른 필터링
            const timeFilteredPlaces = filterPlacesByTime(convertedPlaces, startTime, endTime);
            setSearchResults(timeFilteredPlaces);
            setSelectedPlace(null);
        } else {
            alert("검색 결과가 없습니다. 다른 검색어를 시도해보세요.");
        }
    };

    // 비즈니스 타입에 따른 카테고리 코드 반환 함수
    const getCategoryCodeFromBusinessType = (businessType: string): string => {
        switch (businessType) {
            case "카페": return "CE7";
            case "편의점": return "CS2";
            case "숙박": return "AD5";
            case "식당": return "FD6";
            default: return "ETC";
        }
    };

    // 영업 시간 포맷팅 함수
    const formatBusinessHours = (businessHours: Record<string, BusinessHourDto> | undefined): string => {
        if (!businessHours || Object.keys(businessHours).length === 0) {
            return "영업시간 정보 없음";
        }

        // 요일별 영업 시간 중 첫번째 항목만 표시 (간단하게)
        const firstDayKey = Object.keys(businessHours)[0];
        const hourData = businessHours[firstDayKey];

        if (!hourData.enabled) {
            return "휴무일";
        }

        return `${hourData.open} - ${hourData.close}`;
    };

    // 시간 옵션 생성 함수
    const generateTimeOptions = (start: string, end: string, interval: number = 30) => {
        const times: string[] = [];
        let current = new Date(`2024-01-01 ${start}`);
        const endTime = new Date(`2024-01-01 ${end}`);

        while (current <= endTime) {
            const timeString = current.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            times.push(timeString);
            current = new Date(current.getTime() + interval * 60000);
        }

        return times;
    };

    // 종료 시간 옵션 생성 함수
    const getEndTimeOptions = (selectedStartTime: string) => {
        const [hours, minutes] = selectedStartTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes));
        const nextTime = new Date(startDate.getTime() + 30 * 60000);
        const nextTimeString = nextTime.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        return generateTimeOptions(nextTimeString, "24:00");
    };

    // 보관 시간 텍스트 계산 함수 수정
    const calculateStorageTimeText = () => {
        if (!storageDate || !storageStartTime || !storageEndTime) {
            return t('selectDateAndTime');
        }

        // 날짜 포맷팅
        const formatDate = (date: string) => {
            if (!date) return "";
            const [year, month, day] = date.split('-');
            return `${month}${t('month')} ${day}${t('day')}`;
        };

        // 시간 포맷팅
        const formatTime = (time: string) => {
            if (!time) return "";
            const [hours, minutes] = time.split(':');
            return `${hours}:${minutes}`;
        };

        if (storageDuration === "day") {
            return `${formatDate(storageDate)} ${formatTime(storageStartTime)} ~ ${formatTime(storageEndTime)}`;
        } else {
            if (!storageEndDate) {
                return t('selectAllDateAndTime');
            }
            return `${formatDate(storageDate)} ${formatTime(storageStartTime)} ~ ${formatDate(storageEndDate)} ${formatTime(storageEndTime)}`;
        }
    };

    // 가방 가격 계산 함수 수정
    const calculateTotalPrice = (bags: { small: number; medium: number; large: number }) => {
        // 기본 하루 가격
        const basePrice = (bags.small * 3000) + (bags.medium * 5000) + (bags.large * 8000);

        // 가방을 선택하지 않은 경우
        if (basePrice === 0) {
            return 0;
        }

        // 당일 보관이면 기본 가격 그대로 반환
        if (storageDuration === "day") {
            return basePrice;
        }

        // 기간 보관일 경우 날짜 차이 계산
        if (!storageDate || !storageEndDate) {
            return basePrice; // 날짜가 선택되지 않은 경우 기본 가격
        }

        try {
            // 날짜 비교를 위해 날짜 객체 생성
            const startDate = new Date(storageDate);
            const endDate = new Date(storageEndDate);

            // 유효한 날짜인지 확인
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.log("날짜 변환 오류");
                return basePrice;
            }

            // 날짜 차이 계산 (밀리초 → 일)
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // 최소 1일 이상으로 계산
            const days = Math.max(1, diffDays);

            console.log(`보관 일수: ${days}일, 기본 가격: ${basePrice}원, 총 가격: ${basePrice * days}원`);

            return basePrice * days;
        } catch (error) {
            console.error("날짜 계산 오류:", error);
            return basePrice;
        }
    };

    // useEffect로 가격 갱신 감시
    useEffect(() => {
        if (bagSizes.small > 0 || bagSizes.medium > 0 || bagSizes.large > 0) {
            const price = calculateTotalPrice(bagSizes);
            setTotalPrice(price);
        }
    }, [bagSizes, storageDuration, storageDate, storageEndDate]);



    // 운영 시간 추출 함수
    const getPlaceOperatingHours = (place: any) => {
        if (place.category_group_code === "BK9") {
            return {
                start: "09:00",
                end: "16:00"
            };
        } else if (place.category_group_code === "CS2") {
            if (place.place_name.includes("GS25") ||
                place.place_name.includes("CU") ||
                place.place_name.includes("세븐일레븐")) {
                return {
                    start: "00:00",
                    end: "23:59"
                };
            } else {
                return {
                    start: "09:00",
                    end: "22:00"
                };
            }
        }

        // 기본값
        return {
            start: "09:00",
            end: "18:00"
        };
    };

    // 시간대 유효성 검사 함수
    const validateStorageTime = () => {
        if (!selectedPlace || !storageStartTime || !storageEndTime) {
            setIsTimeValid(false);
            return false;
        }

        const operatingHours = getPlaceOperatingHours(selectedPlace);

        // 시간 문자열을 분 단위로 변환
        const timeToMinutes = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const startInMinutes = timeToMinutes(storageStartTime);
        const endInMinutes = timeToMinutes(storageEndTime);
        const operationStartInMinutes = timeToMinutes(operatingHours.start);
        const operationEndInMinutes = timeToMinutes(operatingHours.end);

        // 시작 및 종료 시간이 운영시간 내에 있는지 검사
        const isValid = startInMinutes >= operationStartInMinutes &&
            endInMinutes <= operationEndInMinutes &&
            startInMinutes < endInMinutes;

        setIsTimeValid(isValid);
        return isValid;
    };

    // 시간 변경 시 유효성 검증
    useEffect(() => {
        if (selectedPlace && storageStartTime && storageEndTime) {
            validateStorageTime();
        }
    }, [selectedPlace, storageStartTime, storageEndTime]);

    // 날짜 포맷 함수
    const formatReservationDate = (dateStr: string) => {
        if (!dateStr) return '';

        try {
            const [year, month, day] = dateStr.split('-');

            // Modified: Display same start/end date for same-day reservation
            if (storageDuration === 'day') {
                return `${year}${t('year')} ${month}${t('month')} ${day}${t('day')}`;
            } else {
                if (!storageEndDate) return `${year}${t('year')} ${month}${t('month')} ${day}${t('day')}`;

                const [endYear, endMonth, endDay] = storageEndDate.split('-');
                return `${year}${t('year')} ${month}${t('month')} ${day}${t('day')} ~ ${endYear}${t('year')} ${endMonth}${t('month')} ${endDay}${t('day')}`;
            }
        } catch (e) {
            return dateStr;
        }
    };

    // 시간 포맷 함수
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';

        try {
            const [hours, minutes] = timeStr.split(':');
            return `${hours}:${minutes}`;
        } catch (e) {
            return timeStr;
        }
    };

    // 가방 요약 문자열 생성 함수
    const getBagSummary = () => {
        const bagsArray = [];

        if (bagSizes.small > 0) {
            bagsArray.push(`${t('smallBag')} ${bagSizes.small}${t('pieces')}`);
        }

        if (bagSizes.medium > 0) {
            bagsArray.push(`${t('mediumBag')} ${bagSizes.medium}${t('pieces')}`);
        }

        if (bagSizes.large > 0) {
            bagsArray.push(`${t('largeBag')} ${bagSizes.large}${t('pieces')}`);
        }

        return bagsArray.join(', ') || t('none');
    };

    // 예약 번호 생성 함수
    const generateReservationNumber = () => {
        const timestamp = Date.now().toString();
        return `TL${timestamp.slice(-8)}`;
    };

    // 포트원 결제 ID 생성 함수
    const generatePortonePaymentId = () => {
        return [...crypto.getRandomValues(new Uint32Array(2))]
            .map((word) => word.toString(16).padStart(8, "0"))
            .join("");
    };

    // 포트원 결제 처리 함수
    const processPortonePayment = async () => {
        if (!selectedPlace || totalPrice <= 0) {
            setReservationError('결제 정보가 올바르지 않습니다.');
            return false;
        }

        try {
            setIsProcessingPayment(true);

            const paymentId = generatePortonePaymentId();
            setPortonePaymentId(paymentId);

            // 포트원 결제 요청
            const payment = await PortOne.requestPayment({
                storeId: "store-ef16a71d-87cc-4e73-a6b8-448a8b07840d", // 환경변수 또는 기본값
                channelKey: "channel-key-7ecba580-a8c1-4834-904f-fdc9150a0ce4", // 환경변수 또는 기본값
                paymentId,
                orderName: `${selectedPlace.place_name} 짐보관 서비스`,
                totalAmount: totalPrice,
                currency: "KRW" as const,
                payMethod: "CARD",
                customer: {
                    fullName: user?.name || "고객",
                    email: user?.email || "",
                },
                customData: {
                    reservationData: {
                        userId: user?.id,
                        placeName: selectedPlace.place_name,
                        placeAddress: selectedPlace.address_name,
                        storageDate: storageDate,
                        storageEndDate: storageDuration === "period" ? storageEndDate : storageDate,
                        storageStartTime: storageStartTime,
                        storageEndTime: storageEndTime,
                        smallBags: bagSizes.small,
                        mediumBags: bagSizes.medium,
                        largeBags: bagSizes.large,
                        totalPrice: totalPrice,
                        storageType: storageDuration
                    }
                },
            });

            if (payment.code !== undefined) {
                // 결제 실패
                setReservationError(`결제 실패: ${payment.message}`);
                setIsProcessingPayment(false);
                return false;
            }

            // 결제 성공 시 백엔드에 결제 완료 요청
            const completeResponse = await fetch('/api/payment/portone/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentId: payment.paymentId,
                }),
            });

            if (completeResponse.ok) {
                const paymentComplete = await completeResponse.json();
                if (paymentComplete.status === 'PAID') {
                    // 예약 정보 저장
                    const reservationResult = await submitReservation();
                    if (reservationResult) {
                        setIsPaymentComplete(true);
                        setIsPaymentOpen(false);
                        return true;
                    }
                } else {
                    setReservationError('결제 검증에 실패했습니다.');
                    return false;
                }
            } else {
                const errorText = await completeResponse.text();
                setReservationError(`결제 완료 처리 실패: ${errorText}`);
                return false;
            }

        } catch (error) {
            console.error('포트원 결제 처리 중 오류:', error);
            setReservationError('결제 처리 중 오류가 발생했습니다.');
            return false;
        } finally {
            setIsProcessingPayment(false);
        }

        return false;
    };

    // 예약 정보를 서버로 전송하는 함수
    const submitReservation = async () => {
        if (!isAuthenticated || !user) {
            console.error(t('loginRequired'));
            setReservationError(t('loginRequiredMessage'));
            return false;
        }


        // 보관 가능한 개수 검증 (실시간 용량 기반)
        if (bagSizes.small > realTimeCapacity.small ||
            bagSizes.medium > realTimeCapacity.medium ||
            bagSizes.large > realTimeCapacity.large) {
            setReservationError('선택한 짐의 개수가 매장의 보관 가능한 개수를 초과했습니다.');
            return false;
        }

        try {
            const reservationNumber = generateReservationNumber();

            // 사용자 정보 확인
            console.log("현재 로그인된 사용자 정보:", user);

            // 날짜 형식 변환 (yyyy-MM-dd)
            const formatDateForServer = (dateString: string) => {
                const date = new Date(dateString);
                return date.toISOString().split('T')[0]; // yyyy-MM-dd 형식으로 변환
            };

            // 시간 형식 변환 (HH:mm:ss)
            const formatTimeForServer = (timeString: string) => {
                // 이미 HH:mm 형식이면 :00 초를 추가
                return timeString + ":00";
            };

            // 예약 데이터 구성
            const reservationData = {
                userId: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
                userEmail: user.email,
                userName: user.name,
                placeName: selectedPlace.place_name,
                placeAddress: selectedPlace.address_name,
                reservationNumber: reservationNumber,
                storageDate: formatDateForServer(storageDate),
                storageEndDate: storageDuration === "period" ? formatDateForServer(storageEndDate) : formatDateForServer(storageDate),
                storageStartTime: formatTimeForServer(storageStartTime),
                storageEndTime: formatTimeForServer(storageEndTime),
                smallBags: bagSizes.small,
                mediumBags: bagSizes.medium,
                largeBags: bagSizes.large,
                totalPrice: totalPrice,
                storageType: storageDuration,
                status: "RESERVED"
            };

            console.log("예약 데이터 전송:", reservationData);

            // 백엔드 서버 주소로 직접 호출
            const response = await axios.post('http://localhost:8080/api/reservations', reservationData);

            console.log("예약 저장 성공:", response.data);
            setSubmittedReservation(response.data);
            setReservationSuccess(true);
            return true;

        } catch (error) {
            console.error("Error while saving reservation:", error);

            if (axios.isAxiosError(error) && error.response) {
                console.error("Server response error:", error.response.data);
                setReservationError(t('reservationSaveError') + ': ' + JSON.stringify(error.response.data));
            } else {
                setReservationError(t('reservationSaveErrorRetry'));
            }
            
            return false;
        }
    };

    // Modified: Submit reservation data to server when payment is completed

    // 포트원 결제 완료 처리 함수
    // 포트원 결제 처리 함수
    const completePayment = async () => {
        if (isPaymentFormValid()) {
            try {
                // 결제 진행 상태 활성화
                setIsProcessingPayment(true);

                // 약간의 지연 시간을 두어 UX 향상
                const result = await submitReservation();

                if (result) {
                    // Payment and reservation success
                    setIsPaymentComplete(true);
                    setIsPaymentOpen(false);

                    // 여기서 예약 완료 후 다른 장소를 선택하지 못하도록 설정
                    // 결제 완료 시 검색 결과 및 지도 상태를 초기화하지만, selectedPlace는 유지
                    setSearchResults([]);
        if (!selectedPlace || totalPrice <= 0) {
            setReservationError('결제 정보가 올바르지 않습니다.');
            return;
        }

        try {
            setIsProcessingPayment(true);

            const paymentId = generatePortonePaymentId();

            // 포트원 결제 요청
            const payment = await PortOne.requestPayment({
                storeId: "store-ef16a71d-87cc-4e73-a6b8-448a8b07840d", // 환경변수 또는 기본값
                channelKey: "channel-key-7ecba580-a8c1-4834-904f-fdc9150a0ce4",
                paymentId,
                orderName: `${selectedPlace.place_name} 짐보관 서비스`,
                totalAmount: totalPrice,
                currency: "KRW" as any, // 타입 오류 임시 해결
                payMethod: "CARD",
                customer: {
                    fullName: user?.name || "고객",
                    email: user?.email || "",
                },
                customData: JSON.stringify({
                    reservationData: {
                        userId: user?.id,
                        placeName: selectedPlace.place_name,
                        placeAddress: selectedPlace.address_name,
                        storageDate: storageDate,
                        storageEndDate: storageDuration === "period" ? storageEndDate : storageDate,
                        storageStartTime: storageStartTime,
                        storageEndTime: storageEndTime,
                        smallBags: bagSizes.small,
                        mediumBags: bagSizes.medium,
                        largeBags: bagSizes.large,
                        totalPrice: totalPrice,
                        storageType: storageDuration
                    }
                }),
            });

            if (payment.code !== undefined) {
                // 결제 실패
                setReservationError(`결제 실패: ${payment.message}`);
                setIsProcessingPayment(false);
                return;
            }

            // 결제 성공 시 백엔드에 결제 완료 요청
            const completeResponse = await fetch('/api/payment/portone/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentId: payment.paymentId,
                }),
            });

            if (completeResponse.ok) {
                const paymentComplete = await completeResponse.json();
                if (paymentComplete.status === 'PAID') {
                    // 예약 정보 저장
                    const reservationResult = await submitReservation();
                    if (reservationResult) {
                        setIsPaymentComplete(true);
                        setIsPaymentOpen(false);

                        // 예약 완료 후 제휴점 데이터 새로고침하여 보관 용량 업데이트
                        try {
                            const response = await axios.get('/api/partnership', { timeout: 5000 });
                            if (response.data && response.data.success) {
                                const partnershipData = response.data.data.filter((partnership: Partnership) => partnership.status === 'APPROVED');
                                setPartnerships(partnershipData);

                                // 현재 선택된 장소의 업데이트된 정보로 교체
                                if (selectedPlace) {
                                    const updatedPartnership = partnershipData.find((p: Partnership) =>
                                        p.businessName === selectedPlace.place_name &&
                                        p.address === selectedPlace.address_name
                                    );
                                    if (updatedPartnership) {
                                        const updatedPlace = {
                                            ...selectedPlace,
                                            smallBagsAvailable: updatedPartnership.smallBagsAvailable,
                                            mediumBagsAvailable: updatedPartnership.mediumBagsAvailable,
                                            largeBagsAvailable: updatedPartnership.largeBagsAvailable
                                        };
                                        setSelectedPlace(updatedPlace);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('제휴점 데이터 새로고침 중 오류:', error);
                        }

                        setSearchResults([]);
                    }
                } else {
                    setReservationError('결제 검증에 실패했습니다.');
                }
            } else {
                const errorText = await completeResponse.text();
                setReservationError(`결제 완료 처리 실패: ${errorText}`);
            }

        } catch (error) {
            console.error('포트원 결제 처리 중 오류:', error);
            setReservationError('결제 처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // 선택된 매장의 보관 가능한 개수 정보를 가져오는 함수
    const getSelectedStoreCapacity = () => {
        if (!selectedPlace || !partnerships.length) {
            return { small: 0, medium: 0, large: 0 };
        }

        // 선택된 장소가 제휴점인지 확인
        const partnership = partnerships.find(p =>
            p.businessName === selectedPlace.place_name &&
            p.address === selectedPlace.address_name
        );

        if (partnership) {
            return {
                small: partnership.smallBagsAvailable || 0,
                medium: partnership.mediumBagsAvailable || 0,
                large: partnership.largeBagsAvailable || 0
            };
        }

        return { small: 0, medium: 0, large: 0 };
    };

    // 실시간 보관 가능한 용량 조회 함수
    const fetchRealTimeCapacity = async (businessName: string, address: string) => {
        try {
            const response = await axios.get('/api/partnership/available-capacity', {
                params: {
                    businessName: businessName,
                    address: address
                }
            });

            if (response.data && response.data.success) {
                return response.data.data.availableCapacity;
            }
        } catch (error) {
            console.error('실시간 용량 조회 중 오류:', error);
        }

        return { smallBags: 0, mediumBags: 0, largeBags: 0 };
    };

    // 실시간 용량을 기반으로 보관 가능한 개수 정보를 가져오는 함수
    const getRealTimeStoreCapacity = async () => {
        if (!selectedPlace) {
            return { small: 0, medium: 0, large: 0 };
        }

        const capacity = await fetchRealTimeCapacity(selectedPlace.place_name, selectedPlace.address_name);
        return {
            small: capacity.smallBags || 0,
            medium: capacity.mediumBags || 0,
            large: capacity.largeBags || 0
        };
    };

    // 보관 가능한 개수를 초과했는지 확인하는 함수 (실시간 용량 기반)
    const isCapacityExceeded = async (bagType: 'small' | 'medium' | 'large', increment: number = 0) => {
        const capacity = await getRealTimeStoreCapacity();
        const currentCount = bagSizes[bagType] + increment;
        return currentCount > capacity[bagType];
    };

    // 보관 가능한 개수 정보를 표시하는 함수 (실시간 용량 기반)
    const getCapacityText = async (bagType: 'small' | 'medium' | 'large') => {
        const capacity = await getRealTimeStoreCapacity();
        const available = capacity[bagType] - bagSizes[bagType];
        return available > 0 ? `(${available}개 보관 가능)` : '(보관 불가)';
    };

    // 선택된 매장이 변경될 때 실시간 용량 업데이트
    useEffect(() => {
        const updateRealTimeCapacity = async () => {
            if (selectedPlace) {
                const capacity = await fetchRealTimeCapacity(selectedPlace.place_name, selectedPlace.address_name);
                setRealTimeCapacity({
                    small: capacity.smallBags || 0,
                    medium: capacity.mediumBags || 0,
                    large: capacity.largeBags || 0
                });
            } else {
                setRealTimeCapacity({small: 0, medium: 0, large: 0});
            }
        };

        updateRealTimeCapacity();
    }, [selectedPlace]);

    // 보관 가능한 개수를 초과했는지 확인하는 함수 (동기적)
    const isCapacityExceededSync = (bagType: 'small' | 'medium' | 'large', increment: number = 0) => {
        const currentCount = bagSizes[bagType] + increment;
        return currentCount > realTimeCapacity[bagType];
    };

    // 보관 가능한 개수 정보를 표시하는 함수 (동기적)
    const getCapacityTextSync = (bagType: 'small' | 'medium' | 'large') => {
        const available = realTimeCapacity[bagType] - bagSizes[bagType];
        return available > 0 ? `(${available}개 보관 가능)` : '(보관 불가)';
    };

    // 장소 검색 함수 추가 (랜드마크, 지하철역 등을 검색하기 위함)
    const searchPlacesByKeyword = (keyword: string) => {
        console.log('장소 검색 시도:', keyword);

        if (!window.naver || !window.naver.maps || !window.naver.maps.Service) {
            console.error('네이버 지도 서비스가 초기화되지 않았습니다.');
            alert('지도 서비스가 준비되지 않았습니다. 페이지를 새로고침해주세요.');
            return;
        }

        const placesSearchOptions = {
            query: keyword,
            displayCount: 1 // 첫 번째 결과만 필요
        };

        // 네이버 지도 장소 검색 API 사용
        try {
            // Places는 생성자가 아니라 네임스페이스이므로 직접 search 메서드 호출
            window.naver.maps.Service.Places.search(placesSearchOptions, (status: any, response: any) => {
                console.log('장소 검색 API 응답:', status);
                console.log('장소 검색 응답 데이터:', response);

                if (status === window.naver.maps.Service.Status.OK) {
                    if (response && response.v1 && response.v1.items && response.v1.items.length > 0) {
                        const firstPlace = response.v1.items[0];
                        console.log('검색된 장소:', firstPlace);

                        if (firstPlace.mapx && firstPlace.mapy) {
                            // 네이버 지도 API의 좌표체계 변환 필요
                            // UTM-K 좌표를 WGS84 좌표로 변환
                            const utmk = new window.naver.maps.Point(firstPlace.mapx, firstPlace.mapy);
                            const latLng = window.naver.maps.TransCoord.utmkToLatLng(utmk);

                            console.log('변환된 좌표:', latLng.lat(), latLng.lng());
                            moveToLocation(latLng.lat(), latLng.lng());
                            searchNearbyPartnerships(latLng.lat(), latLng.lng(), firstPlace.address || '');
                        } else {
                            console.error('장소 좌표 정보 없음:', firstPlace);
                            alert('검색 결과에 위치 정보가 없습니다. 다른 검색어를 시도해보세요.');
                        }
                    } else {
                        console.error('장소 검색 결과 없음');
                        alert('검색 결과가 없습니다. 다른 검색어를 시도해보세요.');
                    }
                } else {
                    console.error('장소 검색 실패:', status);
                    alert('검색 결과가 없습니다. 다른 검색어를 시도해보세요.');
                }
            });
        } catch (error) {
            console.error('장소 검색 중 오류 발생:', error);
            alert('검색 중 오류가 발생했습니다. 다른 검색어를 시도해보세요.');
        }
    };

    // 지도 이동 함수 분리
    const moveToLocation = (lat: number, lng: number) => {
        if (!mapInstance) {
            console.error('지도 인스턴스가 없습니다.');
            return;
        }

        try {
            const moveLatLng = new window.naver.maps.LatLng(lat, lng);
            console.log('이동할 좌표:', lat, lng);

            // 부드러운 이동 처리
            const currentZoom = mapInstance.getZoom();
            console.log('현재 줌 레벨:', currentZoom);

            // 1단계: 먼저 위치 이동
            console.log('지도 중심 이동 시도');
            mapInstance.setCenter(moveLatLng);
            console.log('지도 중심 이동 완료');

            // 2단계: 이동 후 애니메이션 효과 (줌 아웃 후 줌 인)
            setTimeout(() => {
                try {
                    // 줌 아웃
                    console.log('줌 아웃 시도');
                    mapInstance.setZoom(currentZoom - 1);
                    console.log('줌 아웃 완료');

                    // 잠시 후 다시 원래 줌으로
                    setTimeout(() => {
                        try {
                            console.log('줌 인 시도');
                            mapInstance.setZoom(currentZoom);
                            console.log('줌 인 완료');
                        } catch (error) {
                            console.error('줌 인 중 오류:', error);
                        }
                    }, 250);
                } catch (error) {
                    console.error('줌 아웃 중 오류:', error);
                }
            }, 50);
        } catch (error) {
            console.error('지도 이동 중 오류:', error);
        }
    };

    // 근처 제휴점 검색 함수 분리
    const searchNearbyPartnerships = (lat: number, lng: number, address: string) => {
        // 검색 결과를 partnerships에서 필터링 (주소 기반으로만)
        const nearbyPartnerships = partnerships.filter(p => {
            // 주소의 일부가 검색 결과와 일치하는지 확인
            const addressMatch = address ?
                p.address.includes(address) || address.includes(p.address) : false;

            // 검색 지역 근처 5km 이내의 매장 포함
            const distanceMatch = calculateDistance(lat, lng, p.latitude, p.longitude) < 5;

            return addressMatch || distanceMatch;
        });

        console.log('근처 제휴점 검색 결과:', nearbyPartnerships.length);

        // partnerships를 place 형식으로 변환하여 검색 결과에 추가
        const convertedPlaces = nearbyPartnerships.map(p => ({
            place_name: p.businessName,
            address_name: p.address,
            phone: p.phone,
            category_group_code: getCategoryCodeFromBusinessType(p.businessType),
            x: p.longitude.toString(),
            y: p.latitude.toString(),
            opening_hours: p.is24Hours ? "24시간 영업" : formatBusinessHours(p.businessHours)
        }));

        // 시간에 따른 필터링
        const timeFilteredPlaces = filterPlacesByTime(convertedPlaces, startTime, endTime);
        setSearchResults(timeFilteredPlaces);
        setSelectedPlace(null);

        // 검색 결과가 없어도 지도는 이동
        if (timeFilteredPlaces.length === 0) {
            console.log('검색된 지역 근처에 제휴 매장이 없습니다.');
        }
    };

    return (
        <>
            <Navbar />
            {/* 지도 전체 영역 - Box 헤더와 함께 제거 */}
            <div id="map" style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0
            }}/>

            {/* 내 위치로 돌아가기 버튼 */}
            {isMapMoved && (
                <div className="map-button-container" style={{
                    position: "fixed",
                    zIndex: 10
                }}>
                    <button className="map-button" onClick={returnToMyLocation}>
                        <LocationOnIcon className="map-button-icon"/>
                    </button>
                </div>
            )}

            {/* 사이드바 - 완전히 분리된 구조로 변경 */}
            <Box
                sx={{
                    position: "fixed",
                    backgroundColor: 'white',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',

                    // 데스크톱
                    '@media (min-width: 768px)': {
                        top: '90px', // 110px에서 90px로 변경하여 더 위쪽으로 배치
                        left: '16px',
                        maxHeight: "calc(90vh - 60px)", // 높이 증가 (85vh → 90vh)
                        height: "calc(90vh - 60px)",    // 높이 증가 (85vh → 90vh)
                        width: isSidebarOpen ? '400px' : '0px',
                        borderRadius: '24px',
                    },

                    // 모바일
                    '@media (max-width: 767px)': {
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        maxHeight: isSidebarOpen ? '75vh' : '0px', // 최대 높이를 vh로 설정 (60vh → 75vh)
                        height: isSidebarOpen ? '75vh' : '0px',    // 높이 설정 (60vh → 75vh)
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px',
                    }
                }}
            >
                {/* 검색 영역 - 예약/결제 창이 열려있을 때는 표시하지 않음 */}
                {!isReservationOpen && !isPaymentOpen && !isPaymentComplete && (
                    <Box sx={{
                        p: 3,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                        backgroundColor: 'rgba(255, 255, 255, 0.98)'
                    }}>
                        <Box sx={{display: 'flex', gap: 1}}>
                            <TextField
                                fullWidth
                                placeholder={t('whereToGo')}
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !isPaymentComplete) searchPlaces();
                                }}
                                disabled={isPaymentComplete}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '16px',
                                        backgroundColor: '#f8f9fa',
                                        '& fieldset': {
                                            border: 'none',
                                        },
                                        '&:hover': {
                                            backgroundColor: '#f0f2f5',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: '#f0f2f5',
                                            '& fieldset': {
                                                border: 'none',
                                            }
                                        },
                                        '&.Mui-disabled': {
                                            opacity: 0.5,
                                            backgroundColor: '#f0f0f0'
                                        }
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={searchPlaces}
                                disableRipple
                                disabled={isPaymentComplete}
                                sx={{
                                    minWidth: '80px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    boxShadow: 'none',
                                    padding: '0 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    '&:hover': {
                                        boxShadow: 'none',
                                        backgroundColor: (theme) => theme.palette.primary.dark,
                                    },
                                    '&:focus': {
                                        outline: 'none',
                                    },
                                    '&.Mui-disabled': {
                                        opacity: 0.5,
                                        backgroundColor: '#e0e0e0',
                                        color: '#9e9e9e'
                                    }
                                }}
                            >
                                {t('search')}
                            </Button>
                        </Box>

                        {/* 시간 선택 영역 */}
                        <Box sx={{mt: 2, display: 'flex', gap: 2}}>
                            <FormControl sx={{flex: 1}}>
                                <InputLabel id="start-time-label">{t('start')}</InputLabel>
                                <Select
                                    labelId="start-time-label"
                                    value={startTime}
                                    label={t('start')}
                                    onChange={(e) => {
                                        const newStartTime = e.target.value;
                                        setStartTime(newStartTime);
                                        const endOptions = getEndTimeOptions(newStartTime);
                                        setEndTime(endOptions[0]);
                                        if (searchResults.length > 0) {
                                            searchPlaces();
                                        }
                                    }}
                                    sx={{
                                        borderRadius: '16px',
                                        backgroundColor: '#f8f9fa',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '&:hover': {
                                            backgroundColor: '#f0f2f5',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: '#f0f2f5',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            }
                                        },
                                        '& .MuiSelect-select': {
                                            paddingRight: '32px !important',
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300,
                                                mt: 1,
                                                borderRadius: '16px',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                                ...scrollbarStyle,
                                                '& .MuiMenuItem-root': {
                                                    minHeight: '40px',
                                                    '&:hover': {
                                                        backgroundColor: '#f8f9fa',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: '#f0f2f5',
                                                        '&:hover': {
                                                            backgroundColor: '#e9ecef',
                                                        }
                                                    }
                                                },
                                                '& .MuiList-root': {
                                                    padding: '8px',
                                                    '& .MuiMenuItem-root': {
                                                        borderRadius: '8px',
                                                        margin: '2px 0',
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                >
                                    {generateTimeOptions("00:00", "23:30").map((time) => (
                                        <MenuItem key={time} value={time}>
                                            {time}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{flex: 1}}>
                                <InputLabel id="end-time-label">{t('end')}</InputLabel>
                                <Select
                                    labelId="end-time-label"
                                    value={endTime}
                                    label={t('end')}
                                    onChange={(e) => {
                                        setEndTime(e.target.value);
                                        if (searchResults.length > 0) {
                                            searchPlaces();
                                        }
                                    }}
                                    sx={{
                                        borderRadius: '16px',
                                        backgroundColor: '#f8f9fa',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '&:hover': {
                                            backgroundColor: '#f0f2f5',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: '#f0f2f5',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            }
                                        },
                                        '& .MuiSelect-select': {
                                            paddingRight: '32px !important',
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300,
                                                mt: 1,
                                                borderRadius: '16px',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                                ...scrollbarStyle,
                                                '& .MuiMenuItem-root': {
                                                    minHeight: '40px',
                                                    '&:hover': {
                                                        backgroundColor: '#f8f9fa',
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: '#f0f2f5',
                                                        '&:hover': {
                                                            backgroundColor: '#e9ecef',
                                                        }
                                                    }
                                                },
                                                '& .MuiList-root': {
                                                    padding: '8px',
                                                    '& .MuiMenuItem-root': {
                                                        borderRadius: '8px',
                                                        margin: '2px 0',
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                >
                                    {getEndTimeOptions(startTime).map((time) => (
                                        <MenuItem key={time} value={time}>
                                            {time}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                )}

                {/* 결과 영역 - 명시적으로 높이와 스크롤 설정 */}
                <Box sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: isReservationOpen || isPaymentOpen || isPaymentComplete ? 0 : 3, // 예약/결제 화면에서는 패딩 없음
                    ...scrollbarStyle,
                    // 스크롤바가 컨텐츠를 밀지 않도록 설정
                    marginRight: '-4px',
                    paddingRight: isReservationOpen || isPaymentOpen || isPaymentComplete ? 0 : '7px', // 기존 패딩 + 스크롤바 너비
                    // 명시적인 최대 높이 설정
                    '@media (min-width: 768px)': {
                        maxHeight: 'calc(90vh - 60px)', // 검색 영역 제거 시 높이 조정 (85vh → 90vh)
                    },
                    '@media (max-width: 767px)': {
                        maxHeight: 'calc(75vh - 20px)', // 검색 영역 제거 시 높이 조정 (60vh → 75vh)
                    }
                }}>
                    {selectedPlace ? (
                        // 선택된 장소 상세 정보
                        <>
                            {!isReservationOpen ? (
                                <Box sx={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '20px',
                                    p: 3,
                                    transition: 'all 0.2s ease'
                                }}>
                                    <Typography variant="h6" sx={{mb: 2, fontWeight: 600}}>
                                        {selectedPlace.place_name}
                                    </Typography>
                                    {selectedPlace.business_type && (
                                        <Box sx={{
                                            display: 'inline-block',
                                            mb: 2,
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: 500
                                        }}
                                             className={`business-type-${selectedPlace.business_type}`}
                                        >
                                            {selectedPlace.business_type}
                                        </Box>
                                    )}
                                    <Typography sx={{color: 'text.secondary', mb: 1}}>
                                        {selectedPlace.address_name}
                                    </Typography>
                                    <Typography sx={{color: 'primary.main', mb: 1}}>
                                        {selectedPlace.phone}
                                    </Typography>
                                    <Typography sx={{color: 'text.secondary', mb: 2}}>
                                        {selectedPlace.opening_hours ||
                                            (selectedPlace.category_group_code === "BK9" ?
                                                t('bankHours') : t('storeHours'))}
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 2,
                                        justifyContent: 'space-between'
                                    }}>
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                flex: 1,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                },
                                                '&:focus': {
                                                    outline: 'none',
                                                },
                                                '&.Mui-focusVisible': {
                                                    outline: 'none',
                                                }
                                            }}
                                            onClick={() => setSelectedPlace(null)}
                                        >
                                            {t('backToList')}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                flex: 1,
                                                backgroundColor: '#1a73e8',
                                                '&:hover': {
                                                    backgroundColor: '#1565c0'
                                                },
                                                '&:focus': {
                                                    outline: 'none',
                                                },
                                                '&.Mui-focusVisible': {
                                                    outline: 'none',
                                                }
                                            }}
                                            onClick={() => {
                                                setIsReservationOpen(true);
                                                // 초기화
                                                setBagSizes({
                                                    small: 0,
                                                    medium: 0,
                                                    large: 0
                                                });
                                                setTotalPrice(0);
                                            }}
                                        >
                                            {t('makeReservation')}
                                        </Button>
                                    </Box>
                                </Box>
                            ) : isPaymentOpen ? (
                                <Box sx={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '20px',
                                    p: 3,
                                    transition: 'all 0.2s ease',
                                    position: 'relative' // position relative 추가
                                }}>
                                    {/* 결제 중 오버레이 추가 */}
                                    {isProcessingPayment && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 10,
                                                borderRadius: '20px'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 2
                                                }}
                                            >
                                                {/* 모던한 로딩 스피너 */}
                                                <Box
                                                    sx={{
                                                        width: '56px',
                                                        height: '56px',
                                                        position: 'relative',
                                                        mb: 1
                                                    }}
                                                >
                                                    {/* 첫 번째 원 */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            width: '100%',
                                                            height: '100%',
                                                            border: '3px solid transparent',
                                                            borderTopColor: '#1a73e8',
                                                            borderRadius: '50%',
                                                            animation: 'spinClockwise 1.2s linear infinite'
                                                        }}
                                                    />

                                                    {/* 두 번째 원 */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '8px',
                                                            left: '8px',
                                                            right: '8px',
                                                            bottom: '8px',
                                                            border: '3px solid transparent',
                                                            borderTopColor: '#4285f4',
                                                            borderRadius: '50%',
                                                            animation: 'spinCounterClockwise 1.8s linear infinite'
                                                        }}
                                                    />

                                                    {/* 세 번째 원 */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '16px',
                                                            left: '16px',
                                                            right: '16px',
                                                            bottom: '16px',
                                                            border: '3px solid transparent',
                                                            borderTopColor: '#1a73e8',
                                                            borderRadius: '50%',
                                                            animation: 'spinClockwise 1.5s linear infinite'
                                                        }}
                                                    />

                                                    {/* 애니메이션 키프레임 스타일 */}
                                                    <Box
                                                        sx={{
                                                            '@keyframes spinClockwise': {
                                                                '0%': { transform: 'rotate(0deg)' },
                                                                '100%': { transform: 'rotate(360deg)' }
                                                            },
                                                            '@keyframes spinCounterClockwise': {
                                                                '0%': { transform: 'rotate(0deg)' },
                                                                '100%': { transform: 'rotate(-360deg)' }
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                {/* 텍스트 메시지 */}
                                                <Typography
                                                    sx={{
                                                        fontWeight: 500,
                                                        color: '#1a73e8',
                                                        fontSize: '15px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    {t('processingPayment')}
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            display: 'inline-flex',
                                                            ml: 0.5,
                                                            '& > span': {
                                                                width: '4px',
                                                                height: '4px',
                                                                margin: '0 1px',
                                                                backgroundColor: '#1a73e8',
                                                                borderRadius: '50%',
                                                                display: 'inline-block'
                                                            }
                                                        }}
                                                    >
                                                        <Box component="span" sx={{ animation: 'dotPulse 1.5s infinite ease-in-out', animationDelay: '0s' }} />
                                                        <Box component="span" sx={{ animation: 'dotPulse 1.5s infinite ease-in-out', animationDelay: '0.2s' }} />
                                                        <Box component="span" sx={{ animation: 'dotPulse 1.5s infinite ease-in-out', animationDelay: '0.4s' }} />
                                                        <Box
                                                            sx={{
                                                                '@keyframes dotPulse': {
                                                                    '0%, 100%': { transform: 'scale(0.5)', opacity: 0.5 },
                                                                    '50%': { transform: 'scale(1)', opacity: 1 }
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                    
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 3
                                    }}>
                                        <Typography variant="h6" sx={{fontWeight: 600}}>
                                            {t('cardPayment')}
                                        </Typography>
                                        <Button
                                            sx={{
                                                minWidth: 'auto',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                p: 0,
                                                '&:focus': {
                                                    outline: 'none',
                                                },
                                                '&.Mui-focusVisible': {
                                                    outline: 'none',
                                                }
                                            }}
                                            onClick={() => setIsPaymentOpen(false)}
                                        >
                                            ×
                                        </Button>
                                    </Box>

                                    <Typography sx={{fontWeight: 500, mb: 1}}>
                                        {selectedPlace.place_name}
                                    </Typography>
                                    <Typography sx={{color: 'text.secondary', mb: 3, fontSize: '14px'}}>
                                        {t('paymentAmount')}{totalPrice.toLocaleString()}{t('won')}
                                    </Typography>

                                    {/* 포트원 결제 안내 */}
                                    <Box sx={{
                                        backgroundColor: '#f0f5ff',
                                        p: 3,
                                        borderRadius: '16px',
                                        mb: 3,
                                        textAlign: 'center'
                                    }}>
                                        <Box sx={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            backgroundColor: '#1a73e8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 16px auto'
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                                            </svg>
                                        </Box>
                                        <Typography sx={{
                                            fontWeight: 600,
                                            color: '#1a73e8',
                                            mb: 1,
                                            fontSize: '16px'
                                        }}>
                                            안전한 포트원 결제
                                        </Typography>
                                        <Typography sx={{
                                            color: '#666',
                                            fontSize: '14px',
                                            lineHeight: 1.5
                                        }}>
                                            카드, 계좌이체, 간편결제 등<br/>
                                            다양한 결제 수단을 지원합니다
                                        </Typography>
                                    </Box>

                                    {/* 결제 정보 요약 */}
                                    <Box sx={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                        p: 2.5,
                                        borderRadius: '12px',
                                        mb: 3
                                    }}>
                                        <Typography sx={{
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            mb: 2,
                                            color: '#333'
                                        }}>
                                            결제 정보
                                        </Typography>

                                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                            <Typography sx={{fontSize: '13px', color: 'text.secondary'}}>
                                                보관 장소
                                            </Typography>
                                            <Typography sx={{fontSize: '13px', fontWeight: 500}}>
                                                {selectedPlace.place_name}
                                            </Typography>
                                        </Box>

                                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                            <Typography sx={{fontSize: '13px', color: 'text.secondary'}}>
                                                보관 기간
                                            </Typography>
                                            <Typography sx={{fontSize: '13px', fontWeight: 500}}>
                                                {calculateStorageTimeText()}
                                            </Typography>
                                        </Box>

                                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                            <Typography sx={{fontSize: '13px', color: 'text.secondary'}}>
                                                보관 짐
                                            </Typography>
                                            <Typography sx={{fontSize: '13px', fontWeight: 500}}>
                                                {getBagSummary()}
                                            </Typography>
                                        </Box>

                                        <Box sx={{
                                            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                                            pt: 1.5,
                                            mt: 1.5,
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Typography sx={{fontSize: '14px', fontWeight: 600}}>
                                                총 결제금액
                                            </Typography>
                                            <Typography sx={{fontSize: '16px', fontWeight: 600, color: '#1a73e8'}}>
                                                {totalPrice.toLocaleString()}원
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* 포트원 결제 버튼 */}
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            p: 1.5,
                                            backgroundColor: '#1a73e8',
                                            boxShadow: 'none',
                                            '&:hover': {
                                                backgroundColor: '#1565c0'
                                            },
                                            '&:focus': {
                                                outline: 'none',
                                            },
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                        }}
                                        disabled={isProcessingPayment || totalPrice <= 0}
                                        onClick={completePayment}
                                    >
                                        {isProcessingPayment ? (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1.5,
                                                position: 'relative'
                                            }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 0.5
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: '8px',
                                                            height: '8px',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                            borderRadius: '50%',
                                                            animation: 'pulse 1.5s infinite ease-in-out',
                                                            animationDelay: '0s',
                                                            '@keyframes pulse': {
                                                                '0%, 100%': {
                                                                    transform: 'scale(0.5)',
                                                                    opacity: 0.5
                                                                },
                                                                '50%': {
                                                                    transform: 'scale(1)',
                                                                    opacity: 1
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            width: '8px',
                                                            height: '8px',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                            borderRadius: '50%',
                                                            animation: 'pulse 1.5s infinite ease-in-out',
                                                            animationDelay: '0.3s'
                                                        }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            width: '8px',
                                                            height: '8px',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                            borderRadius: '50%',
                                                            animation: 'pulse 1.5s infinite ease-in-out',
                                                            animationDelay: '0.6s'
                                                        }}
                                                    />
                                                </Box>
                                                <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                                                    결제 진행 중...
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                                                </svg>
                                                <Typography sx={{ fontWeight: 500, fontSize: '16px' }}>
                                                    {totalPrice.toLocaleString()}원 결제하기
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* 물결 효과 */}
                                        {isProcessingPayment && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
                                                    animation: 'wave 1.5s infinite linear',
                                                    '@keyframes wave': {
                                                        '0%': {
                                                            transform: 'translateX(-100%)'
                                                        },
                                                        '100%': {
                                                            transform: 'translateX(100%)'
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </Button>
                                </Box>
                            ) : isPaymentComplete ? (
                                // 결제 완료 화면
                                <Box sx={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '20px',
                                    p: 4,
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center'
                                }}>
                                    <Box sx={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        backgroundColor: '#e6f4ea',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px auto'
                                    }}>
                                        {/* 체크 아이콘 */}
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                                                  fill="#34A853"/>
                                        </svg>
                                    </Box>

                                    <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>
                                        {t('paymentComplete')}
                                    </Typography>

                                    <Typography sx={{color: 'text.secondary', mb: 3, fontSize: '15px'}}>
                                        {selectedPlace.place_name}{t('hasBeenCompleted')}{t('reservationSuccess')}
                                    </Typography>

                                    <Box sx={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                        p: 2,
                                        borderRadius: '12px',
                                        mb: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1
                                    }}>
                                        {/* 예약 날짜 추가 */}
                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Typography sx={{fontSize: '14px', color: 'text.secondary'}}>
                                                {t('reservationDate')}
                                            </Typography>
                                            <Typography sx={{fontSize: '14px', fontWeight: 500}}>
                                                {formatReservationDate(storageDate)}
                                            </Typography>
                                        </Box>

                                        {/* 예약 시간 추가 */}
                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Typography sx={{fontSize: '14px', color: 'text.secondary'}}>
                                                {t('reservationTime')}
                                            </Typography>
                                            <Typography sx={{fontSize: '14px', fontWeight: 500}}>
                                                {formatTime(storageStartTime)} ~ {formatTime(storageEndTime)}
                                            </Typography>
                                        </Box>

                                        {/* 가방 크기 및 개수 정보 추가 */}
                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Typography sx={{fontSize: '14px', color: 'text.secondary'}}>
                                                {t('storedItems')}
                                            </Typography>
                                            <Typography sx={{fontSize: '14px', fontWeight: 500, textAlign: 'right'}}>
                                                {getBagSummary()}
                                            </Typography>
                                        </Box>

                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Typography sx={{fontSize: '14px', color: 'text.secondary'}}>
                                                {t('paymentAmount')}
                                            </Typography>
                                            <Typography sx={{fontSize: '14px', fontWeight: 500}}>
                                                {totalPrice.toLocaleString()}{t('won')}
                                            </Typography>
                                        </Box>

                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Typography sx={{fontSize: '14px', color: 'text.secondary'}}>
                                                {t('storageLocation')}
                                            </Typography>
                                            <Typography sx={{fontSize: '14px', fontWeight: 500}}>
                                                {selectedPlace.place_name}
                                            </Typography>
                                        </Box>

                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                            <Typography sx={{fontSize: '14px', color: 'text.secondary'}}>
                                                {t('address')}
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                maxWidth: '60%',
                                                textAlign: 'right'
                                            }}>
                                                {selectedPlace.address_name}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* 예약 번호 추가 */}
                                    <Box sx={{
                                        backgroundColor: '#f5f8ff',
                                        p: 2.5,
                                        borderRadius: '12px',
                                        mb: 3,
                                        textAlign: 'center'
                                    }}>
                                        <Typography sx={{fontSize: '13px', color: '#1a73e8', mb: 1}}>
                                            {t('reservationNumber')}
                                        </Typography>
                                        <Typography sx={{fontSize: '20px', fontWeight: 600, letterSpacing: '1px'}}>
                                            {submittedReservation ? submittedReservation.reservationNumber : generateReservationNumber()}
                                        </Typography>
                                    </Box>

                                    <Box sx={{mt: 2, mb: 1}}>
                                        <Typography sx={{fontSize: '14px', color: '#1a73e8', fontWeight: 500}}>
                                            {t('reservationEmailSent')}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            p: 1.5,
                                            mt: 3,
                                            backgroundColor: '#1a73e8',
                                            boxShadow: 'none',
                                            '&:hover': {
                                                backgroundColor: '#1565c0'
                                            },
                                            '&:focus': {
                                                outline: 'none',
                                            }
                                        }}
                                        onClick={() => {
                                            // 모든 상태 초기화하고 메인 화면으로
                                            setIsPaymentComplete(false);
                                            setIsReservationOpen(false);
                                            setSelectedPlace(null);
                                            setBagSizes({
                                                small: 0,
                                                medium: 0,
                                                large: 0
                                            });
                                            setTotalPrice(0);
                                            // 검색 결과도 초기화
                                            setSearchResults([]);
                                            setSearchKeyword("");
                                        }}
                                    >
                                        {t('confirm')}
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '20px',
                                    p: 3,
                                    transition: 'all 0.2s ease'
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 3
                                    }}>
                                        <Typography variant="h6" sx={{fontWeight: 600}}>
                                            {t('luggageStorageReservation')}
                                        </Typography>
                                        <Button
                                            sx={{
                                                minWidth: 'auto',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                p: 0,
                                                '&:focus': {
                                                    outline: 'none',
                                                },
                                                '&.Mui-focusVisible': {
                                                    outline: 'none',
                                                }
                                            }}
                                            onClick={() => setIsReservationOpen(false)}
                                        >
                                            ×
                                        </Button>
                                    </Box>

                                    <Typography sx={{fontWeight: 500, mb: 1}}>
                                        {selectedPlace.place_name}
                                    </Typography>
                                    <Typography sx={{color: 'text.secondary', mb: 3, fontSize: '14px'}}>
                                        {selectedPlace.address_name}
                                    </Typography>

                                    <Typography sx={{fontWeight: 500, mb: 2}}>
                                        {t('selectLuggage')}
                                    </Typography>

                                    {/* 소형 가방 */}
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2,
                                        pb: 2,
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                                    }}>
                                        <Box>
                                            <Typography sx={{fontWeight: 500}}>
                                                {t('smallBag')}
                                            </Typography>
                                            <Typography sx={{color: 'text.secondary', fontSize: '13px'}}>
                                                {t('smallBagDesc')}
                                            </Typography>
                                            <Typography sx={{color: 'primary.main', fontWeight: 500, mt: 0.5}}>
                                                3,000{t('dayPerPrice')}
                                            </Typography>
                                            <Typography sx={{color: 'text.secondary', fontSize: '12px', mt: 0.5}}>
                                                {getCapacityTextSync('small')}
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <Button
                                                sx={{
                                                    minWidth: 'auto',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#f0f2f5',
                                                    color: 'text.primary',
                                                    '&:hover': {
                                                        backgroundColor: '#e4e6e9'
                                                    },
                                                    '&:focus': {
                                                        outline: 'none'
                                                    }
                                                }}
                                                onClick={() => {
                                                    if (bagSizes.small > 0) {
                                                        const newBagSizes = {...bagSizes, small: bagSizes.small - 1};
                                                        setBagSizes(newBagSizes);
                                                        setTotalPrice(calculateTotalPrice(newBagSizes));
                                                    }
                                                }}
                                            >
                                                -
                                            </Button>
                                            <Typography sx={{mx: 2, minWidth: '20px', textAlign: 'center'}}>
                                                {bagSizes.small}
                                            </Typography>
                                            <Button
                                                disabled={isCapacityExceededSync('small', 1)}
                                                sx={{
                                                    minWidth: 'auto',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: isCapacityExceededSync('small', 1) ? '#e0e0e0' : '#f0f2f5',
                                                    color: isCapacityExceededSync('small', 1) ? '#999' : 'text.primary',
                                                    '&:hover': {
                                                        backgroundColor: isCapacityExceededSync('small', 1) ? '#e0e0e0' : '#e4e6e9'
                                                    },
                                                    '&:focus': {
                                                        outline: 'none'
                                                    },
                                                    '&.Mui-disabled': {
                                                        backgroundColor: '#e0e0e0',
                                                        color: '#999'
                                                    }
                                                }}
                                                onClick={() => {
                                                    if (!isCapacityExceededSync('small', 1)) {
                                                        const newBagSizes = {...bagSizes, small: bagSizes.small + 1};
                                                        setBagSizes(newBagSizes);
                                                        setTotalPrice(calculateTotalPrice(newBagSizes));
                                                    }
                                                }}
                                            >
                                                +
                                            </Button>
                                        </Box>
                                    </Box>

                                    {/* 중형 가방 */}
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2,
                                        pb: 2,
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                                    }}>
                                        <Box>
                                            <Typography sx={{fontWeight: 500}}>
                                                {t('mediumBag')}
                                            </Typography>
                                            <Typography sx={{color: 'text.secondary', fontSize: '13px'}}>
                                                {t('mediumBagDesc')}
                                            </Typography>
                                            <Typography sx={{color: 'primary.main', fontWeight: 500, mt: 0.5}}>
                                                5,000{t('dayPerPrice')}
                                            </Typography>
                                            <Typography sx={{color: 'text.secondary', fontSize: '12px', mt: 0.5}}>
                                                {getCapacityTextSync('medium')}
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <Button
                                                sx={{
                                                    minWidth: 'auto',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#f0f2f5',
                                                    color: 'text.primary',
                                                    '&:hover': {
                                                        backgroundColor: '#e4e6e9'
                                                    },
                                                    '&:focus': {
                                                        outline: 'none'
                                                    }
                                                }}
                                                onClick={() => {
                                                    if (bagSizes.medium > 0) {
                                                        const newBagSizes = {...bagSizes, medium: bagSizes.medium - 1};
                                                        setBagSizes(newBagSizes);
                                                        setTotalPrice(calculateTotalPrice(newBagSizes));
                                                    }
                                                }}
                                            >
                                                -
                                            </Button>
                                            <Typography sx={{mx: 2, minWidth: '20px', textAlign: 'center'}}>
                                                {bagSizes.medium}
                                            </Typography>
                                            <Button
                                                disabled={isCapacityExceededSync('medium', 1)}
                                                sx={{
                                                    minWidth: 'auto',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: isCapacityExceededSync('medium', 1) ? '#e0e0e0' : '#f0f2f5',
                                                    color: isCapacityExceededSync('medium', 1) ? '#999' : 'text.primary',
                                                    '&:hover': {
                                                        backgroundColor: isCapacityExceededSync('medium', 1) ? '#e0e0e0' : '#e4e6e9'
                                                    },
                                                    '&:focus': {
                                                        outline: 'none'
                                                    },
                                                    '&.Mui-disabled': {
                                                        backgroundColor: '#e0e0e0',
                                                        color: '#999'
                                                    }
                                                }}
                                                onClick={() => {
                                                    if (!isCapacityExceededSync('medium', 1)) {
                                                        const newBagSizes = {...bagSizes, medium: bagSizes.medium + 1};
                                                        setBagSizes(newBagSizes);
                                                        setTotalPrice(calculateTotalPrice(newBagSizes));
                                                    }
                                                }}
                                            >
                                                +
                                            </Button>
                                        </Box>
                                    </Box>

                                    {/* 대형 가방 */}
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 3,
                                        pb: 2,
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                                    }}>
                                        <Box>
                                            <Typography sx={{fontWeight: 500}}>
                                                {t('largeBag')}
                                            </Typography>
                                            <Typography sx={{color: 'text.secondary', fontSize: '13px'}}>
                                                {t('largeBagDesc')}
                                            </Typography>
                                            <Typography sx={{color: 'primary.main', fontWeight: 500, mt: 0.5}}>
                                                8,000{t('dayPerPrice')}
                                            </Typography>
                                            <Typography sx={{color: 'text.secondary', fontSize: '12px', mt: 0.5}}>
                                                {getCapacityTextSync('large')}
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <Button
                                                sx={{
                                                    minWidth: 'auto',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#f0f2f5',
                                                    color: 'text.primary',
                                                    '&:hover': {
                                                        backgroundColor: '#e4e6e9'
                                                    },
                                                    '&:focus': {
                                                        outline: 'none'
                                                    }
                                                }}
                                                onClick={() => {
                                                    if (bagSizes.large > 0) {
                                                        const newBagSizes = {...bagSizes, large: bagSizes.large - 1};
                                                        setBagSizes(newBagSizes);
                                                        setTotalPrice(calculateTotalPrice(newBagSizes));
                                                    }
                                                }}
                                            >
                                                -
                                            </Button>
                                            <Typography sx={{mx: 2, minWidth: '20px', textAlign: 'center'}}>
                                                {bagSizes.large}
                                            </Typography>
                                            <Button
                                                disabled={isCapacityExceededSync('large', 1)}
                                                sx={{
                                                    minWidth: 'auto',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: isCapacityExceededSync('large', 1) ? '#e0e0e0' : '#f0f2f5',
                                                    color: isCapacityExceededSync('large', 1) ? '#999' : 'text.primary',
                                                    '&:hover': {
                                                        backgroundColor: isCapacityExceededSync('large', 1) ? '#e0e0e0' : '#e4e6e9'
                                                    },
                                                    '&:focus': {
                                                        outline: 'none'
                                                    },
                                                    '&.Mui-disabled': {
                                                        backgroundColor: '#e0e0e0',
                                                        color: '#999'
                                                    }
                                                }}
                                                onClick={() => {
                                                    if (!isCapacityExceededSync('large', 1)) {
                                                        const newBagSizes = {...bagSizes, large: bagSizes.large + 1};
                                                        setBagSizes(newBagSizes);
                                                        setTotalPrice(calculateTotalPrice(newBagSizes));
                                                    }
                                                }}
                                            >
                                                +
                                            </Button>
                                        </Box>
                                    </Box>

                                    {/* 보관 기간 설정 섹션 추가 */}
                                    <Box sx={{mb: 3}}>
                                        <Box sx={{
                                            display: 'flex',
                                            mb: 3,
                                            backgroundColor: '#f5f8ff',
                                            borderRadius: '16px',
                                            p: 0.5
                                        }}>
                                            <Button
                                                variant={storageDuration === "day" ? "contained" : "text"}
                                                sx={{
                                                    flex: 1,
                                                    py: 1.2,
                                                    borderRadius: '12px',
                                                    backgroundColor: storageDuration === "day" ? '#1a73e8' : 'transparent',
                                                    color: storageDuration === "day" ? 'white' : '#666',
                                                    boxShadow: 'none',
                                                    '&:hover': {
                                                        backgroundColor: storageDuration === "day" ? '#1565c0' : 'rgba(0, 0, 0, 0.04)',
                                                        boxShadow: 'none'
                                                    },
                                                    '&:focus': {outline: 'none'},
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => setStorageDuration("day")}
                                            >
                                                {t('daySameDay')}
                                            </Button>
                                            <Button
                                                variant={storageDuration === "period" ? "contained" : "text"}
                                                sx={{
                                                    flex: 1,
                                                    py: 1.2,
                                                    borderRadius: '12px',
                                                    backgroundColor: storageDuration === "period" ? '#1a73e8' : 'transparent',
                                                    color: storageDuration === "period" ? 'white' : '#666',
                                                    boxShadow: 'none',
                                                    '&:hover': {
                                                        backgroundColor: storageDuration === "period" ? '#1565c0' : 'rgba(0, 0, 0, 0.04)',
                                                        boxShadow: 'none'
                                                    },
                                                    '&:focus': {outline: 'none'},
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => setStorageDuration("period")}
                                            >
                                                {t('periodStorage')}
                                            </Button>
                                        </Box>

                                        {/* 날짜 선택 */}
                                        <Box sx={{mb: 3}}>
                                            <Typography sx={{
                                                fontSize: '14px',
                                                mb: 1.5,
                                                color: 'text.secondary',
                                                fontWeight: 500
                                            }}>
                                                {storageDuration === "day" ? t('storageDate') : t('storageStartDate')}
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                type="date"
                                                value={storageDate}
                                                onChange={(e) => setStorageDate(e.target.value)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '12px',
                                                        backgroundColor: 'white',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'transparent'
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#1a73e8',
                                                            borderWidth: '1px'
                                                        }
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '14px 16px',
                                                        color: '#333',
                                                        '&::-webkit-calendar-picker-indicator': {
                                                            filter: 'invert(0.5)',
                                                            cursor: 'pointer'
                                                        }
                                                    }
                                                }}
                                                inputProps={{
                                                    min: new Date().toISOString().split('T')[0] // Only allow dates after today
                                                }}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </Box>

                                        {/* 기간 보관일 경우 종료 날짜도 표시 */}
                                        {storageDuration === "period" && (
                                            <Box sx={{mb: 3}}>
                                                <Typography sx={{
                                                    fontSize: '14px',
                                                    mb: 1.5,
                                                    color: 'text.secondary',
                                                    fontWeight: 500
                                                }}>
                                                    {t('storageEndDate')}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    type="date"
                                                    value={storageEndDate}
                                                    onChange={(e) => setStorageEndDate(e.target.value)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '12px',
                                                            backgroundColor: 'white',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                                                            },
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: 'transparent'
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#1a73e8',
                                                                borderWidth: '1px'
                                                            }
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            padding: '14px 16px',
                                                            color: '#333',
                                                            '&::-webkit-calendar-picker-indicator': {
                                                                filter: 'invert(0.5)',
                                                                cursor: 'pointer'
                                                            }
                                                        }
                                                    }}
                                                    inputProps={{
                                                        min: new Date().toISOString().split('T')[0] // Only allow dates after today
                                                    }}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                            </Box>
                                        )}

                                        {/* 시간 선택 - 버튼 기반 UI로 변경 */}
                                        <Box sx={{mb: 3}}>
                                            <Typography sx={{
                                                fontSize: '14px',
                                                mb: 1.5,
                                                color: 'text.secondary',
                                                fontWeight: 500
                                            }}>
                                                {t('storageTime')}
                                            </Typography>

                                            <Box sx={{display: 'flex', gap: 2}}>
                                                {/* 시작 시간 선택 */}
                                                <Box sx={{flex: 1}}>
                                                    <Typography sx={{
                                                        fontSize: '13px',
                                                        mb: 1,
                                                        color: '#1a73e8',
                                                        fontWeight: 500
                                                    }}>
                                                        {t('startTime')}
                                                    </Typography>

                                                    <Box sx={{
                                                        maxHeight: '180px',
                                                        overflowY: 'auto',
                                                        pr: 1,
                                                        '&::-webkit-scrollbar': {
                                                            width: '4px',
                                                        },
                                                        '&::-webkit-scrollbar-thumb': {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                                            borderRadius: '4px',
                                                        },
                                                    }}>
                                                        {timeOptions.map((time) => (
                                                            <Button
                                                                key={`start-${time}`}
                                                                variant={storageStartTime === time ? "contained" : "text"}
                                                                fullWidth
                                                                sx={{
                                                                    justifyContent: 'flex-start',
                                                                    py: 1,
                                                                    mb: 0.5,
                                                                    borderRadius: '8px',
                                                                    backgroundColor: storageStartTime === time ? '#1a73e8' : 'transparent',
                                                                    color: storageStartTime === time ? 'white' : 'text.secondary',
                                                                    '&:hover': {
                                                                        backgroundColor: storageStartTime === time ? '#1565c0' : 'rgba(0, 0, 0, 0.04)'
                                                                    },
                                                                    textTransform: 'none',
                                                                    fontWeight: storageStartTime === time ? 500 : 400,
                                                                    fontSize: '14px',
                                                                    '&:focus': {
                                                                        outline: 'none',
                                                                    },
                                                                    '&.Mui-focusVisible': {
                                                                        outline: 'none',
                                                                    }
                                                                }}
                                                                onClick={() => {
                                                                    setStorageStartTime(time);
                                                                    // 시작 시간 이후의 옵션만 종료 시간으로 선택 가능하도록
                                                                    if (storageEndTime && time >= storageEndTime) {
                                                                        // 시작 시간보다 최소 30분 후를 종료 시간으로 설정
                                                                        const timeIndex = timeOptions.indexOf(time);
                                                                        if (timeIndex < timeOptions.length - 1) {
                                                                            setStorageEndTime(timeOptions[timeIndex + 1]);
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                {time}
                                                            </Button>
                                                        ))}
                                                    </Box>
                                                </Box>

                                                {/* 종료 시간 선택 */}
                                                <Box sx={{flex: 1}}>
                                                    <Typography sx={{
                                                        fontSize: '13px',
                                                        mb: 1,
                                                        color: '#1a73e8',
                                                        fontWeight: 500
                                                    }}>
                                                        {t('endTime')}
                                                    </Typography>

                                                    <Box sx={{
                                                        maxHeight: '180px',
                                                        overflowY: 'auto',
                                                        pr: 1,
                                                        '&::-webkit-scrollbar': {
                                                            width: '4px',
                                                        },
                                                        '&::-webkit-scrollbar-thumb': {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                                            borderRadius: '4px',
                                                        },
                                                    }}>
                                                        {timeOptions
                                                            .filter(time => !storageStartTime || time > storageStartTime) // 시작 시간 이후 시간만 표시
                                                            .map((time) => (
                                                                <Button
                                                                    key={`end-${time}`}
                                                                    variant={storageEndTime === time ? "contained" : "text"}
                                                                    fullWidth
                                                                    sx={{
                                                                        justifyContent: 'flex-start',
                                                                        py: 1,
                                                                        mb: 0.5,
                                                                        borderRadius: '8px',
                                                                        backgroundColor: storageEndTime === time ? '#1a73e8' : 'transparent',
                                                                        color: storageEndTime === time ? 'white' : 'text.secondary',
                                                                        '&:hover': {
                                                                            backgroundColor: storageEndTime === time ? '#1565c0' : 'rgba(0, 0, 0, 0.04)'
                                                                        },
                                                                        textTransform: 'none',
                                                                        fontWeight: storageEndTime === time ? 500 : 400,
                                                                        fontSize: '14px',
                                                                        '&:focus': {
                                                                            outline: 'none',
                                                                        },
                                                                        '&.Mui-focusVisible': {
                                                                            outline: 'none',
                                                                        }
                                                                    }}
                                                                    onClick={() => setStorageEndTime(time)}
                                                                >
                                                                    {time}
                                                                </Button>
                                                            ))
                                                        }
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* 시간 선택 가이드 - 선택된 장소의 운영 시간 표시 */}
                                        <Typography sx={{
                                            fontSize: '12px',
                                            color: isTimeValid ? 'text.secondary' : '#e53935',
                                            mb: 2,
                                            pl: 1,
                                            fontWeight: isTimeValid ? 'normal' : 500
                                        }}>
                                            {selectedPlace
                                                ? t('operatingHoursFormat', {
                                                    0: getPlaceOperatingHours(selectedPlace).start,
                                                    1: getPlaceOperatingHours(selectedPlace).end
                                                }).replace('%s', getPlaceOperatingHours(selectedPlace).start)
                                                    .replace('%s', getPlaceOperatingHours(selectedPlace).end)
                                                : t('operatingHoursDefault')}
                                            {!isTimeValid && t('operatingHoursWarning')}
                                        </Typography>
                                    </Box>

                                    {/* 총 보관 시간 표시 */}
                                    <Box sx={{
                                        mt: 2,
                                        p: 2.5,
                                        borderRadius: '16px',
                                        backgroundColor: 'rgba(26, 115, 232, 0.05)',
                                        border: '1px solid rgba(26, 115, 232, 0.1)',
                                        mb: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5
                                    }}>
                                        <Box sx={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(26, 115, 232, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                                                    fill="#1a73e8"/>
                                                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#1a73e8"/>
                                            </svg>
                                        </Box>
                                        <Box>
                                            <Typography sx={{
                                                fontSize: '14px',
                                                color: '#1a73e8',
                                                fontWeight: 500,
                                                lineHeight: 1.5
                                            }}>
                                                {calculateStorageTimeText()}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* 총 금액 */}
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 3,
                                        backgroundColor: 'rgba(26, 115, 232, 0.08)',
                                        p: 2,
                                        borderRadius: '12px'
                                    }}>
                                        <Typography sx={{fontWeight: 500}}>
                                            {t('totalAmount')}
                                        </Typography>
                                        <Typography sx={{fontWeight: 600, color: '#1a73e8', fontSize: '18px'}}>
                                            {totalPrice.toLocaleString()}{t('won')}
                                        </Typography>
                                    </Box>

                                    {/* 결제하기 버튼 */}
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        disabled={
                                            (bagSizes.small === 0 && bagSizes.medium === 0 && bagSizes.large === 0) ||
                                            !storageDate ||
                                            !storageStartTime ||
                                            !storageEndTime ||
                                            (storageDuration === "period" && !storageEndDate) ||
                                            !selectedPlace ||
                                            !isTimeValid
                                        }
                                        sx={{
                                            backgroundColor: '#1a73e8',
                                            color: 'white',
                                            borderRadius: '12px',
                                            p: 1.5,
                                            mt: 2,
                                            boxShadow: 'none',
                                            '&:hover': {backgroundColor: '#1565c0'},
                                            '&:disabled': {backgroundColor: 'rgba(0, 0, 0, 0.12)', color: 'rgba(0, 0, 0, 0.26)'},
                                            '&:focus': {outline: 'none', backgroundColor: '#0d47a1'},
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        onClick={() => {
                                            if (totalPrice > 0 && isTimeValid && storageDate && storageStartTime && storageEndTime && (storageDuration !== "period" || storageEndDate)) {
                                                if (!isAuthenticated) {
                                                    setReservationError(t('loginRequiredMessage'));
                                                } else {
                                                    setIsPaymentOpen(true);
                                                }
                                            }
                                        }}
                                    >
                                        {!isAuthenticated
                                            ? t('loginRequired')
                                            : !isTimeValid
                                                ? t('setWithinOperatingHours')
                                                : (!storageDate || !storageStartTime || !storageEndTime || (storageDuration === "period" && !storageEndDate))
                                                    ? t('selectAllDateAndTime')
                                                    : t('pay')}
                                    </Button>
                                </Box>
                            )}
                        </>
                    ) : (
                        // 검색 결과 목록
                        <List sx={{
                            '& .MuiListItem-root': {
                                borderRadius: '16px',
                                mb: 1.5,
                                backgroundColor: '#f8f9fa',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#f0f2f5',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                }
                            },
                            // 마지막 아이템 아래 여백 추가
                            '& .MuiListItem-root:last-child': {
                                mb: 3
                            }
                        }}>
                            {searchResults.map((place, index) => (
                                <ListItem
                                    key={index}
                                    onClick={() => {
                                        // 이미 결제가 완료된 상태라면 다른 장소를 선택하지 못하도록 함
                                        if (isPaymentComplete) {
                                            return;
                                        }

                                        setSelectedPlace(place);
                                        const moveLatLng = new window.naver.maps.LatLng(place.y, place.x);
                                        mapInstance?.setCenter(moveLatLng);
                                    }}
                                    sx={{
                                        p: 2,
                                        cursor: isPaymentComplete ? 'default' : 'pointer',
                                        opacity: isPaymentComplete ? 0.5 : 1
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography sx={{fontWeight: 500, mb: 0.5}}>
                                                {place.place_name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{color: 'text.secondary'}}>
                                                <Typography
                                                    variant="body2"
                                                    component="span"
                                                    sx={{
                                                        color: place.category_group_code === "BK9" ? 'primary.main' : 'success.main',
                                                        fontWeight: 500,
                                                        mr: 1
                                                    }}
                                                >
                                                    {place.category_group_code === "BK9" ? "[은행]" : "[편의점]"}
                                                </Typography>
                                                {place.address_name}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>

            {/* 사이드바 접기/펴기 버튼 */}
            <Button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                disableRipple
                sx={{
                    position: "fixed",
                    backgroundColor: 'white',
                    zIndex: 101,
                    minWidth: 'auto',
                    padding: 0,
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

                    // 데스크톱: 사이드바 오른쪽에 위치
                    '@media (min-width: 768px)': {
                        left: isSidebarOpen ? '416px' : '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '24px',
                        height: '48px',
                        borderRadius: '0 12px 12px 0',
                    },

                    // 모바일: 하단 중앙에 위치 수정
                    '@media (max-width: 767px)': {
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bottom: isSidebarOpen ? '75vh' : '0px', // 사이드바 경계선에 정확히 맞춤 (60vh → 75vh)
                        width: '48px',
                        height: '24px',
                        borderRadius: '12px 12px 0 0',
                    },

                    // 테두리 제거
                    '&:focus': {
                        outline: 'none',
                    },
                    '&.Mui-focusVisible': {
                        outline: 'none',
                    }
                }}
            >
                {window.innerWidth >= 768 ? (
                    isSidebarOpen ? <ChevronLeftIcon/> : <ChevronRightIcon/>
                ) : (
                    isSidebarOpen ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/>
                )}
            </Button>

            {/* 에러 메시지 스낵바 */}
            <Snackbar
                open={!!reservationError}
                autoHideDuration={6000}
                onClose={() => setReservationError("")}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setReservationError("")}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {reservationError}
                </Alert>
            </Snackbar>

            {!selectedPlace && !isReservationOpen && !isPaymentOpen && !isPaymentComplete && searchResults.length > 0 && (
                <Box>
                    <Typography variant="h6" sx={{mb: 2, fontWeight: 600}}>
                        {t('searchResultTitle', {count: searchResults.length})}
                    </Typography>
                    <Stack spacing={2}>
                        {searchResults.map((place, index) => (
                            <Box
                                key={index}
                                onClick={() => setSelectedPlace(place)}
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: 'white',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                                        transform: 'translateY(-2px)',
                                    },
                                    p: 2,
                                }}
                            >
                                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                    {place.place_name}
                                </Typography>
                                {place.business_type && (
                                    <Typography
                                        sx={{
                                            borderRadius: '10px',
                                            padding: '2px 6px',
                                            display: 'inline-block',
                                            fontSize: '12px',
                                            mb: 1,
                                            mt: 0.5
                                        }}
                                        className={`business-type-${place.business_type}`}
                                    >
                                        {place.business_type}
                                    </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                    {place.address_name}
                                </Typography>
                                <Typography variant="body2" sx={{color: 'primary.main', mt: 1}}>
                                    {place.phone || t('noPhoneNumber')}
                                </Typography>
                                <Typography variant="body2" sx={{color: place.opening_hours?.includes('24시간') ? 'success.main' : 'text.secondary', mt: 0.5}}>
                                    {place.opening_hours ||
                                        (place.category_group_code === "BK9" ?
                                                t('bankHours') :
                                                place.category_group_code === "CS2" ?
                                                    t('storeHours') :
                                                    t('noOpeningHours')
                                        )
                                    }
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}
        </>
    );
};

export default Map;