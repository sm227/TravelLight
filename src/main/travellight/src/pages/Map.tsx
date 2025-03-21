import {useEffect, useState, useCallback, useRef} from "react";
import {Box} from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../MapButton.css";
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Container,
    InputAdornment,
    IconButton,
    Checkbox,
    FormControlLabel,
    Paper,
    CircularProgress,
    Alert,
    Divider,
    Snackbar,
    Card,
    CardContent,
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
import { useAuth } from "../services/AuthContext"; // 인증 컨텍스트 추가
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

declare global {
    interface Window {
        kakao: any;
    }
}

interface KakaoLatLng {
    getLat(): number;

    getLng(): number;
}

interface KakaoMap {
    setCenter(position: KakaoLatLng): void;

    panTo(position: KakaoLatLng): void;

    getCenter(): KakaoLatLng;
}

// 서버에 보낼 예약 정보 타입 정의
interface ReservationRequest {
    userId?: number;
    placeName: string;
    placeAddress: string;
    placeId: string;
    storageDate: string;
    storageEndDate?: string;
    storageStartTime: string;
    storageEndTime: string;
    smallBags: number;
    mediumBags: number;
    largeBags: number;
    totalPrice: number;
    paymentMethod: string;
    storageType: string;
}

const Map = () => {
    const [userPosition, setUserPosition] = useState<KakaoLatLng | null>(null);
    const [isMapMoved, setIsMapMoved] = useState(false);
    const [mapInstance, setMapInstance] = useState<KakaoMap | null>(null);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [startTime, setStartTime] = useState("09:30");
    const [endTime, setEndTime] = useState("17:00");
    const [bankOverlays, setBankOverlays] = useState<any[]>([]);
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const [bagSizes, setBagSizes] = useState({
        small: 0,
        medium: 0,
        large: 0
    });
    const [totalPrice, setTotalPrice] = useState(0);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [cardInfo, setCardInfo] = useState({
        number: '',
        expiry: '',
        cvc: '',
        name: ''
    });
    const [isPaymentComplete, setIsPaymentComplete] = useState(false);
    const [storageDuration, setStorageDuration] = useState("day");
    const [storageDate, setStorageDate] = useState("");
    const [storageStartTime, setStorageStartTime] = useState("");
    const [storageEndTime, setStorageEndTime] = useState("");
    // 시간 유효성 상태 추가
    const [isTimeValid, setIsTimeValid] = useState(true);
    // 종료 날짜 상태 추가
    const [storageEndDate, setStorageEndDate] = useState("");
    const [reservationNumber, setReservationNumber] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    
    // 인증 컨텍스트 사용
    const { user, isAuthenticated } = useAuth();

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

    useEffect(() => {
        const container = document.getElementById("map") as HTMLElement;
        const options = {
            center: new window.kakao.maps.LatLng(33.450701, 126.570667),
            level: 3,
        };
        const map = new window.kakao.maps.Map(container, options);
        setMapInstance(map);
        // const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });
        let bankMarkers: any[] = [];
        let bankOverlays: any[] = [];
        let storeMarkers: any[] = [];
        let storeOverlays: any[] = [];
        let currentInfoOverlay: any = null;
        let selectedMarkerElement: HTMLElement | null = null; //마커 선택 요소 추적

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const locPosition = new window.kakao.maps.LatLng(lat, lon);
                    setUserPosition(locPosition);
                    displayUserMarker(locPosition);
                    map.setCenter(locPosition);
                    searchBanks(map);
                    searchStores(map);
                },
                () => {
                    searchBanks(map);
                    searchStores(map);
                }
            );
        } else {
            searchBanks(map);
            searchStores(map);
        }

        function displayUserMarker(locPosition: any) {
            const markerElement = document.createElement("div");
            markerElement.innerHTML = `
                <div class="custom-marker">
                    <div class="marker-circle"></div>
                    <div class="marker-wave"></div>
                </div>
            `;
            const customOverlay = new window.kakao.maps.CustomOverlay({
                position: locPosition,
                content: markerElement,
                yAnchor: 1.2,
            });
            customOverlay.setMap(map);
        }

        function searchBanks(map: any) {
            const ps = new window.kakao.maps.services.Places(map);
            ps.categorySearch("BK9", placesSearchCB, {useMapBounds: true});
        }

        function placesSearchCB(data: any, status: any) {
            if (status === window.kakao.maps.services.Status.OK) {
                clearBankMarkers();
                // ATM 필터링 (place_name에 'ATM' 또는 '에이티엠'이 포함되지 않은 것만 표시)
                const filteredData = data.filter((place: any) =>
                    !place.place_name.toUpperCase().includes('ATM') &&
                    !place.place_name.includes('에이티엠')
                );
                for (let i = 0; i < filteredData.length; i++) {
                    displayBankMarker(filteredData[i]);
                }
            }
        }

        function displayBankMarker(place: any) {
            const markerPosition = new window.kakao.maps.LatLng(place.y, place.x);

            // 기본 마커 대신 커스텀 오버레이 사용
            const markerElement = document.createElement("div");
            markerElement.className = "bank-marker-container";
            markerElement.innerHTML = `
                <div class="bank-marker">
                    <img src="/carrier.png" alt="은행" class="marker-icon" />
                </div>
            `;

            // 커스텀 오버레이 생성
            const markerOverlay = new window.kakao.maps.CustomOverlay({
                position: markerPosition,
                content: markerElement,
                yAnchor: 1,
                zIndex: 1
            });

            // 맵에 오버레이 표시
            markerOverlay.setMap(map);

            // 상태 업데이트로 오버레이 배열 관리
            setBankOverlays(prev => [...prev, markerOverlay]);

            // 은행명 처리 - 길이 제한 증가
            let bankName = place.place_name;
            if (bankName.length > 20) {
                bankName = bankName.substring(0, 19) + '...';
            }

            // 은행의 상세 정보 오버레이
            const infoContent = document.createElement("div");
            infoContent.className = "bank-info-overlay";
            infoContent.innerHTML = `
                <div class="info-window">
                    <div class="info-content">
                        <div class="title">
                            <span class="bank-name">${bankName}</span>
                            <div class="close" onclick="this.parentElement.parentElement.parentElement.parentElement.style.display='none'" title="닫기">×</div>
                        </div>
                        <div class="body">
                            <div class="desc">
                                <div class="ellipsis">${place.address_name}</div>
                                <div class="phone">${place.phone || '전화번호 정보 없음'}</div>
                                <div class="hours">${place.opening_hours || '평일 09:00 - 16:00'}</div>
                            </div>
                        </div>
                    </div>
                    <div class="info-tail"></div>
                </div>
            `;

            const infoOverlay = new window.kakao.maps.CustomOverlay({
                content: infoContent,
                position: markerPosition,
                yAnchor: 1.5,
                zIndex: 2
            });

            // 클릭 이벤트 처리
            markerElement.addEventListener('click', function () {
                // 선택된 마커가 있으면 원래 색상으로 돌리기
                if (selectedMarkerElement) {
                    const prevMarker = selectedMarkerElement.querySelector('.bank-marker');
                    if (prevMarker) {
                        prevMarker.classList.remove('selected');
                    }
                }
                // 현재 마커를 선택 상태로 변경
                const currentMarker = markerElement.querySelector('.bank-marker');
                if (currentMarker) {
                    currentMarker.classList.add('selected');
                }
                // 현재 마커를 선택된 마커로 설정
                selectedMarkerElement = markerElement;

                if (currentInfoOverlay) {
                    currentInfoOverlay.setMap(null);
                }
                infoOverlay.setMap(map);
                currentInfoOverlay = infoOverlay;

                // 사이드바에 정보 표시
                setSelectedPlace(place);
                // 사이드바가 닫혀있으면 열기
                setIsSidebarOpen(true);
            });

            // 닫기 버튼 클릭 이벤트는 HTML에서 직접 처리됨
        }

        function clearBankMarkers() {
            // 오버레이 제거
            bankOverlays.forEach(overlay => overlay.setMap(null));
            setBankOverlays([]);

            // 기존 마커도 제거 (혹시 남아있을 경우)
            for (let marker of bankMarkers) {
                marker.setMap(null);
            }
            bankMarkers = [];

            // 현재 정보 오버레이도 제거
            if (currentInfoOverlay) {
                currentInfoOverlay.setMap(null);
                currentInfoOverlay = null;
            }
            // 선택된 마커 초기화
            selectedMarkerElement = null;
        }

        function searchStores(map: any) {
            const ps = new window.kakao.maps.services.Places(map);
            ps.categorySearch("CS2", storesSearchCB, {useMapBounds: true});
        }

        function storesSearchCB(data: any, status: any) {
            if (status === window.kakao.maps.services.Status.OK) {
                clearStoreMarkers();
                for (let i = 0; i < data.length; i++) {
                    displayStoreMarker(data[i]);
                }
            }
        }

        function displayStoreMarker(place: any) {
            const markerPosition = new window.kakao.maps.LatLng(place.y, place.x);

            // 기본 마커 대신 커스텀 오버레이 사용
            const markerElement = document.createElement("div");
            markerElement.className = "store-marker-container";
            markerElement.innerHTML = `
                <div class="store-marker">
                    <img src="/carrier.png" alt="편의점" class="marker-icon" />
                </div>
            `;

            // 커스텀 오버레이 생성
            const markerOverlay = new window.kakao.maps.CustomOverlay({
                position: markerPosition,
                content: markerElement,
                yAnchor: 1,
                zIndex: 1
            });

            // 맵에 오버레이 표시
            markerOverlay.setMap(map);
            storeOverlays.push(markerOverlay);

            // 편의점명 처리 - 길이 제한
            let storeName = place.place_name;
            if (storeName.length > 20) {
                storeName = storeName.substring(0, 19) + '...';
            }

            // 편의점의 상세 정보 오버레이
            const infoContent = document.createElement("div");
            infoContent.className = "store-info-overlay";
            infoContent.innerHTML = `
                <div class="info-window">
                    <div class="info-content">
                        <div class="title">
                            <span class="store-name">${storeName}</span>
                            <div class="close" onclick="this.parentElement.parentElement.parentElement.parentElement.style.display='none'" title="닫기">×</div>
                        </div>
                        <div class="body">
                            <div class="desc">
                                <div class="ellipsis">${place.address_name}</div>
                                <div class="phone">${place.phone || '전화번호 정보 없음'}</div>
                                <div class="hours">${place.opening_hours || '24시간 영업'}</div>
                            </div>
                        </div>
                    </div>
                    <div class="info-tail"></div>
                </div>
            `;

            const infoOverlay = new window.kakao.maps.CustomOverlay({
                content: infoContent,
                position: markerPosition,
                yAnchor: 1.5,
                zIndex: 2
            });

            // 클릭 이벤트 처리
            markerElement.addEventListener('click', function () {
                // 선택된 마커가 있으면 원래 색상으로 돌리기
                if (selectedMarkerElement) {
                    const prevMarker = selectedMarkerElement.querySelector('.bank-marker, .store-marker');
                    if (prevMarker) {
                        prevMarker.classList.remove('selected');
                    }
                }
                // 현재 마커를 선택 상태로 변경
                const currentMarker = markerElement.querySelector('.store-marker');
                if (currentMarker) {
                    currentMarker.classList.add('selected');
                }
                // 현재 마커를 선택된 마커로 설정
                selectedMarkerElement = markerElement;

                if (currentInfoOverlay) {
                    currentInfoOverlay.setMap(null);
                }
                infoOverlay.setMap(map);
                currentInfoOverlay = infoOverlay;

                // 사이드바에 정보 표시
                setSelectedPlace(place);
                // 사이드바가 닫혀있으면 열기
                setIsSidebarOpen(true);
            });
        }

        function clearStoreMarkers() {
            // 오버레이 제거
            for (let overlay of storeOverlays) {
                overlay.setMap(null);
            }
            storeOverlays = [];

            // 기존 마커도 제거 (혹시 남아있을 경우)
            for (let marker of storeMarkers) {
                marker.setMap(null);
            }
            storeMarkers = [];
        }

        window.kakao.maps.event.addListener(map, "dragend", () => {
            setIsMapMoved(true);
            searchBanks(map);
            searchStores(map);
        });

        // 지도 클릭 시 열려있는 오버레이 닫기
        window.kakao.maps.event.addListener(map, "click", () => {
            if (currentInfoOverlay) {
                currentInfoOverlay.setMap(null);
                currentInfoOverlay = null;
            }
            // 선택된 마커 스타일 초기화
            if (selectedMarkerElement) {
                const marker = selectedMarkerElement.querySelector('.bank-marker, .store-marker');
                if (marker) {
                    marker.classList.remove('selected');
                }
                selectedMarkerElement = null;
            }
        });

        // Cleanup 함수 추가
        return () => {
            if (currentInfoOverlay) {
                currentInfoOverlay.setMap(null);
            }
            clearBankMarkers();
            clearStoreMarkers();
        };
    }, []);

    // 현재 위치로 돌아가는 함수를 useCallback으로 메모이제이션
    const returnToMyLocation = useCallback(() => {
        if (userPosition && mapInstance) {
            mapInstance.panTo(userPosition);
            setIsMapMoved(false);
        }
    }, [userPosition, mapInstance]);

    // 초기 시작 시간 설정 함수 수정
    const getInitialStartTime = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // 현재 시간을 30분 단위로 올림
        const roundedMinutes = Math.ceil(minutes / 30) * 30;
        const roundedHours = hours + Math.floor(roundedMinutes / 60);
        const finalMinutes = roundedMinutes % 60;

        return `${String(roundedHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
    };

    // 영업 시간 체크 함수 수정
    const isOpenDuringTime = (place: any, startTime: string, endTime: string) => {
        // 은행의 경우 (기본 영업시간 09:00-16:00)
        if (place.category_group_code === "BK9") {
            const [startHour] = startTime.split(':').map(Number);
            const [endHour] = endTime.split(':').map(Number);

            // 시작 시간이 9시 이전이거나 종료 시간이 16시 이후면 false
            return startHour >= 9 && endHour <= 16;
        }

        // 편의점의 경우
        if (place.category_group_code === "CS2") {
            // 24시간 영업 편의점
            if (place.place_name.includes("GS25") ||
                place.place_name.includes("CU") ||
                place.place_name.includes("세븐일레븐")) {
                return true;
            }
            // 기타 편의점은 09:00-22:00로 가정
            const [startHour] = startTime.split(':').map(Number);
            const [endHour] = endTime.split(':').map(Number);

            return startHour >= 9 && endHour <= 22;
        }

        return false;
    };

    // 검색 결과 필터링 함수
    const filterPlacesByTime = (places: any[], startTime: string, endTime: string) => {
        return places.filter(place => isOpenDuringTime(place, startTime, endTime));
    };

    // searchPlaces 함수 수정
    const searchPlaces = () => {
        if (!searchKeyword.trim()) return;

        const ps = new window.kakao.maps.services.Places();

        ps.keywordSearch(searchKeyword, (data: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
                const firstResult = data[0];
                const moveLatLng = new window.kakao.maps.LatLng(firstResult.y, firstResult.x);
                mapInstance?.setCenter(moveLatLng);

                const searchNearbyPlaces = () => {
                    const ps = new window.kakao.maps.services.Places();
                    let combinedResults: any[] = [];

                    ps.categorySearch(
                        "BK9",
                        (bankData: any, bankStatus: any) => {
                            if (bankStatus === window.kakao.maps.services.Status.OK) {
                                const filteredBankData = bankData.filter((place: any) =>
                                    !place.place_name.toUpperCase().includes('ATM') &&
                                    !place.place_name.includes('에이티엠')
                                );
                                // 시간에 따라 은행 필터링
                                const timeFilteredBanks = filterPlacesByTime(filteredBankData, startTime, endTime);
                                combinedResults = [...timeFilteredBanks];

                                ps.categorySearch(
                                    "CS2",
                                    (storeData: any, storeStatus: any) => {
                                        if (storeStatus === window.kakao.maps.services.Status.OK) {
                                            // 시간에 따라 편의점 필터링
                                            const timeFilteredStores = filterPlacesByTime(storeData, startTime, endTime);
                                            combinedResults = [...combinedResults, ...timeFilteredStores];
                                            setSearchResults(combinedResults);
                                            setSelectedPlace(null);
                                        }
                                    },
                                    {
                                        location: moveLatLng,
                                        radius: 1000
                                    }
                                );
                            }
                        },
                        {
                            location: moveLatLng,
                            radius: 1000
                        }
                    );
                };

                setTimeout(searchNearbyPlaces, 300);
            }
        });
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
            return "보관 날짜와 시간을 선택해주세요";
        }

        // 날짜 포맷팅
        const formatDate = (dateStr: string) => {
            if (!dateStr) return "";
            const [year, month, day] = dateStr.split('-');
            return `${month}월 ${day}일`;
        };

        // 시간 포맷팅
        const formatTime = (timeStr: string) => {
            if (!timeStr) return "";
            const [hours, minutes] = timeStr.split(':');
            return `${hours}시 ${minutes}분`;
        };

        if (storageDuration === "day") {
            return `${formatDate(storageDate)} ${formatTime(storageStartTime)}부터 ${formatTime(storageEndTime)}까지 보관`;
        } else {
            if (!storageEndDate) {
                return "보관 종료 날짜를 선택해주세요";
            }
            return `${formatDate(storageDate)} ${formatTime(storageStartTime)}부터 ${formatDate(storageEndDate)} ${formatTime(storageEndTime)}까지 보관`;
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

    // 카드 정보 유효성 검사 함수
    const isPaymentFormValid = () => {
        const {number, expiry, cvc, name} = cardInfo;

        // 카드번호는 공백 제외 16자리
        const isNumberValid = number.replace(/\s/g, '').length === 16;

        // 만료일은 MM/YY 형식 (5자리)
        const isExpiryValid = expiry.length === 5 && expiry.includes('/');

        // CVC는 3자리
        const isCvcValid = cvc.length === 3;

        // 이름은 최소 2자 이상
        const isNameValid = name.trim().length >= 2;

        return isNumberValid && isExpiryValid && isCvcValid && isNameValid;
    };

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

            if (storageDuration === 'day') {
                return `${year}년 ${month}월 ${day}일`;
            } else {
                if (!storageEndDate) return `${year}년 ${month}월 ${day}일`;

                const [endYear, endMonth, endDay] = storageEndDate.split('-');
                return `${year}년 ${month}월 ${day}일 ~ ${endYear}년 ${endMonth}월 ${endDay}일`;
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
            bagsArray.push(`소형 ${bagSizes.small}개`);
        }

        if (bagSizes.medium > 0) {
            bagsArray.push(`중형 ${bagSizes.medium}개`);
        }

        if (bagSizes.large > 0) {
            bagsArray.push(`대형 ${bagSizes.large}개`);
        }

        return bagsArray.join(', ') || '없음';
    };

    // 예약 번호 생성 함수
    const generateReservationNumber = () => {
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        const datePart = new Date().getTime().toString().slice(-6);
        return `${randomPart}-${datePart}`;
    };

    // 예약 정보를 서버에 저장하는 함수
    const saveReservation = async () => {
        try {
            if (!selectedPlace) {
                throw new Error("선택된 장소가 없습니다.");
            }

            // 날짜를 ISO 문자열로 변환
            const formatDate = (dateStr: string) => {
                if (!dateStr) return "";
                return dateStr; // 이미 'YYYY-MM-DD' 형식이므로 그대로 사용
            };

            // 시간을 HH:MM 형식으로 유지
            const formatTime = (timeStr: string) => {
                if (!timeStr) return "";
                return timeStr; // 이미 'HH:MM' 형식이므로 그대로 사용
            };

            const reservation: ReservationRequest = {
                userId: user?.id ? Number(user.id) : undefined,
                placeName: selectedPlace.place_name,
                placeAddress: selectedPlace.address_name || selectedPlace.road_address_name || "",
                placeId: selectedPlace.id || "",
                storageDate: formatDate(storageDate) || "",
                storageStartTime: formatTime(storageStartTime) || "",
                storageEndTime: formatTime(storageEndTime) || "",
                smallBags: bagSizes.small,
                mediumBags: bagSizes.medium,
                largeBags: bagSizes.large,
                totalPrice: totalPrice,
                paymentMethod: "card", // 카드 결제만 지원하는 것으로 가정
                storageType: storageDuration
            };

            // 기간 보관인 경우 종료 날짜 추가
            if (storageDuration === "period" && storageEndDate) {
                reservation.storageEndDate = formatDate(storageEndDate);
            }

            console.log("서버에 전송할 예약 정보:", JSON.stringify(reservation));

            // 서버에 예약 정보 전송
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservation),
                credentials: 'include', // 쿠키 포함 설정 추가
            });

            if (!response.ok) {
                console.error("API 응답 오류:", response.status, response.statusText);
                const errorText = await response.text();
                console.error("에러 응답 내용:", errorText);
                throw new Error(errorText || "예약 저장에 실패했습니다. 상태 코드: " + response.status);
            }

            // 응답이 JSON이 맞는지 확인 후 파싱
            const contentType = response.headers.get("content-type");
            let result;
            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } else {
                const text = await response.text();
                console.log("응답(텍스트):", text);
                result = { success: true, message: "성공", data: { reservationNumber: generateReservationNumber() } };
            }

            console.log("API 응답:", result);

            // 성공적으로 저장되면 예약 번호 설정
            if (result.data && result.data.reservationNumber) {
                setReservationNumber(result.data.reservationNumber);
            }
            setSaveError(null);
        } catch (error: any) {
            console.error("예약 저장 오류:", error);
            setSaveError(error.message || "예약 정보 저장 중 오류가 발생했습니다.");
            // 백업 예약번호 생성 (오류 시에도 사용자 경험을 위해)
            setReservationNumber(generateReservationNumber());
        }
    };

    // 로그인 정보 확인을 위한 useEffect 추가
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('로그인 정보:', {
                '사용자 이름': user.name || '이름 없음',
                '사용자 ID': user.id || '정보 없음',
                '사용자 이메일': user.email || '이메일 없음'
            });
        } else {
            console.log('로그인 상태가 아닙니다.');
        }
    }, [user, isAuthenticated]);

    return (
        <>
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
                        top: 16,
                        left: 16,
                        maxHeight: "calc(100vh - 32px)", // 최대 높이 설정
                        height: "calc(100vh - 32px)",
                        width: isSidebarOpen ? '400px' : '0px',
                        borderRadius: '24px',
                    },

                    // 모바일
                    '@media (max-width: 767px)': {
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        maxHeight: isSidebarOpen ? '60vh' : '0px', // 최대 높이를 vh로 설정
                        height: isSidebarOpen ? '60vh' : '0px',
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
                                placeholder="어디로 가시나요?"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') searchPlaces();
                                }}
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
                                        }
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={searchPlaces}
                                disableRipple
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
                                    '&.Mui-focusVisible': {
                                        outline: 'none',
                                        boxShadow: 'none',
                                    },
                                    '&:active': {
                                        boxShadow: 'none',
                                    }
                                }}
                            >
                                검색
                            </Button>
                        </Box>

                        {/* 시간 선택 영역 */}
                        <Box sx={{mt: 2, display: 'flex', gap: 2}}>
                            <FormControl sx={{flex: 1}}>
                                <InputLabel id="start-time-label">시작</InputLabel>
                                <Select
                                    labelId="start-time-label"
                                    value={startTime}
                                    label="시작"
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
                                <InputLabel id="end-time-label">종료</InputLabel>
                                <Select
                                    labelId="end-time-label"
                                    value={endTime}
                                    label="종료"
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
                        maxHeight: 'calc(100vh - 32px)', // 검색 영역 제거 시 높이 조정
                    },
                    '@media (max-width: 767px)': {
                        maxHeight: 'calc(60vh - 20px)', // 검색 영역 제거 시 높이 조정
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
                                    <Typography sx={{color: 'text.secondary', mb: 1}}>
                                        {selectedPlace.address_name}
                                    </Typography>
                                    <Typography sx={{color: 'primary.main', mb: 1}}>
                                        {selectedPlace.phone}
                                    </Typography>
                                    <Typography sx={{color: 'text.secondary', mb: 2}}>
                                        {selectedPlace.opening_hours ||
                                            (selectedPlace.category_group_code === "BK9" ?
                                                "평일 09:00 - 16:00" : "24시간 영업")}
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
                                            목록으로 돌아가기
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
                                            예약하기
                                        </Button>
                                    </Box>
                                </Box>
                            ) : isPaymentOpen ? (
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
                                            카드 결제
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
                                        결제 금액: {totalPrice.toLocaleString()}원
                                    </Typography>

                                    {/* 카드 정보 입력 폼 */}
                                    <Box component="form" sx={{mb: 3}}>
                                        <Typography sx={{fontWeight: 500, mb: 2}}>
                                            카드 정보 입력
                                        </Typography>

                                        {/* 카드 번호 */}
                                        <Box sx={{mb: 2}}>
                                            <Typography sx={{fontSize: '14px', mb: 1, color: 'text.secondary'}}>
                                                카드 번호
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="0000 0000 0000 0000"
                                                value={cardInfo.number}
                                                onChange={(e) => {
                                                    // 숫자와 공백만 허용
                                                    const value = e.target.value.replace(/[^\d\s]/g, '');
                                                    // 4자리마다 공백 추가
                                                    const formatted = value
                                                        .replace(/\s/g, '')
                                                        .replace(/(\d{4})/g, '$1 ')
                                                        .trim();
                                                    // 19자리(16자리 숫자 + 3개 공백)로 제한
                                                    if (formatted.length <= 19) {
                                                        setCardInfo({...cardInfo, number: formatted});
                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '12px',
                                                        backgroundColor: 'white',
                                                    }
                                                }}
                                                inputProps={{inputMode: 'numeric'}}
                                            />
                                        </Box>

                                        {/* 만료일과 CVC를 한 줄에 */}
                                        <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                                            <Box sx={{flex: 1}}>
                                                <Typography sx={{fontSize: '14px', mb: 1, color: 'text.secondary'}}>
                                                    만료일 (MM/YY)
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    placeholder="MM/YY"
                                                    value={cardInfo.expiry}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^\d]/g, '');
                                                        let formatted = value;

                                                        // 2자리 이상이면 MM/YY 포맷으로 변경
                                                        if (value.length >= 2) {
                                                            formatted = value.substring(0, 2) + '/' + value.substring(2, 4);
                                                        }

                                                        // 5자리(MM/YY)로 제한
                                                        if (formatted.length <= 5) {
                                                            setCardInfo({...cardInfo, expiry: formatted});
                                                        }
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '12px',
                                                            backgroundColor: 'white',
                                                        }
                                                    }}
                                                    inputProps={{inputMode: 'numeric'}}
                                                />
                                            </Box>
                                            <Box sx={{flex: 1}}>
                                                <Typography sx={{fontSize: '14px', mb: 1, color: 'text.secondary'}}>
                                                    CVC
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    placeholder="000"
                                                    value={cardInfo.cvc}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^\d]/g, '');
                                                        if (value.length <= 3) {
                                                            setCardInfo({...cardInfo, cvc: value});
                                                        }
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '12px',
                                                            backgroundColor: 'white',
                                                        }
                                                    }}
                                                    inputProps={{inputMode: 'numeric'}}
                                                />
                                            </Box>
                                        </Box>

                                        {/* 카드 소유자 이름 */}
                                        <Box sx={{mb: 3}}>
                                            <Typography sx={{fontSize: '14px', mb: 1, color: 'text.secondary'}}>
                                                카드 소유자 이름
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                placeholder="카드에 표시된 이름"
                                                value={cardInfo.name}
                                                onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '12px',
                                                        backgroundColor: 'white',
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* 약관 동의 */}
                                    <Box sx={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                        p: 2,
                                        borderRadius: '12px',
                                        mb: 3,
                                        fontSize: '13px',
                                        color: 'text.secondary'
                                    }}>
                                        결제를 진행하면 TravelLight의 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
                                    </Box>

                                    {/* 결제 완료 버튼 */}
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
                                            }
                                        }}
                                        disabled={!isPaymentFormValid()}
                                        onClick={() => {
                                            if (isPaymentFormValid()) {
                                                // 결제 완료 처리 및 예약 정보 저장
                                                setIsPaymentComplete(true);
                                                setIsPaymentOpen(false);
                                                saveReservation(); // 예약 정보 저장 함수 호출
                                            }
                                        }}
                                    >
                                        {totalPrice.toLocaleString()}원 결제하기
                                    </Button>
                                </Box>
                            ) : isPaymentComplete ? (
                                // 결제 완료 화면 수정
                                <Box sx={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '20px',
                                    p: 4,
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center'
                                }}>
                                    {saveError ? (
                                        <Alert severity="error" sx={{ mb: 3 }}>
                                            {saveError}
                                        </Alert>
                                    ) : null}

                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80 }} />
                                    </Box>

                                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        예약이 완료되었습니다!
                                    </Typography>

                                    {reservationNumber && (
                                        <Typography variant="body1" sx={{ mb: 3 }}>
                                            예약 번호: <strong>{reservationNumber}</strong>
                                        </Typography>
                                    )}

                                    {/* 기존 예약 상세 정보 표시 */}
                                    <Box sx={{ mt: 2, mb: 3, textAlign: 'left', backgroundColor: '#fff', p: 2, borderRadius: '10px' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            {selectedPlace?.place_name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                            {selectedPlace?.address_name || selectedPlace?.road_address_name}
                                        </Typography>
                                        
                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            {storageDuration === "day" ? "당일 보관" : "기간 보관"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            {storageDuration === "day" 
                                                ? `${storageDate} (${storageStartTime} - ${storageEndTime})` 
                                                : `${storageDate} - ${storageEndDate} (${storageStartTime} - ${storageEndTime})`}
                                        </Typography>
                                        
                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            {bagSizes.small > 0 && `소형 가방 ${bagSizes.small}개`}
                                            {bagSizes.medium > 0 && `${bagSizes.small > 0 ? ', ' : ''}중형 가방 ${bagSizes.medium}개`}
                                            {bagSizes.large > 0 && `${bagSizes.small > 0 || bagSizes.medium > 0 ? ', ' : ''}대형 가방 ${bagSizes.large}개`}
                                        </Typography>
                                        
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                                            총 결제금액: {totalPrice.toLocaleString()}원
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            p: 1.5,
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
                                            setIsPaymentComplete(false);
                                            setReservationNumber(null);
                                            setSaveError(null);
                                            setIsSidebarOpen(false);
                                            // 리셋 로직
                                            setBagSizes({ small: 0, medium: 0, large: 0 });
                                            setTotalPrice(0);
                                            setStorageDate("");
                                            setStorageEndDate("");
                                            setStorageStartTime("");
                                            setStorageEndTime("");
                                            setIsReservationOpen(false);
                                            setSelectedPlace(null);
                                        }}
                                    >
                                        닫기
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
                                            가방 보관 예약
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
                                        보관할 가방 선택
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
                                                소형 가방
                                            </Typography>
                                            <Typography sx={{color: 'text.secondary', fontSize: '13px'}}>
                                                15인치 노트북 가방, 배낭 등
                                            </Typography>
                                            <Typography sx={{color: 'primary.main', fontWeight: 500, mt: 0.5}}>
                                                3,000원 / 일
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
                                                    const newBagSizes = {...bagSizes, small: bagSizes.small + 1};
                                                    setBagSizes(newBagSizes);
                                                    setTotalPrice(calculateTotalPrice(newBagSizes));
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
                                                중형 가방
                                            </Typography>
                                            <Typography sx={{color: 'text.secondary', fontSize: '13px'}}>
                                                캐리어(24인치 이하), 중형 가방
                                            </Typography>
                                            <Typography sx={{color: 'primary.main', fontWeight: 500, mt: 0.5}}>
                                                5,000원 / 일
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
                                                    const newBagSizes = {...bagSizes, medium: bagSizes.medium + 1};
                                                    setBagSizes(newBagSizes);
                                                    setTotalPrice(calculateTotalPrice(newBagSizes));
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
                                                대형 가방
                                            </Typography>
                                            <Typography sx={{color: 'text.secondary', fontSize: '13px'}}>
                                                캐리어(24인치 이상), 대형 가방
                                            </Typography>
                                            <Typography sx={{color: 'primary.main', fontWeight: 500, mt: 0.5}}>
                                                8,000원 / 일
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
                                                    const newBagSizes = {...bagSizes, large: bagSizes.large + 1};
                                                    setBagSizes(newBagSizes);
                                                    setTotalPrice(calculateTotalPrice(newBagSizes));
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
                                                당일 보관
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
                                                기간 보관
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
                                                {storageDuration === "day" ? "보관 날짜" : "시작 날짜"}
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
                                                    min: new Date().toISOString().split('T')[0] // 오늘 이후 날짜만 선택 가능
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
                                                    종료 날짜
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
                                                                borderColor: '#1a73e8',
                                                                borderWidth: '1px'
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
                                                    // storageDate 이후 날짜만 선택 가능
                                                    inputProps={{
                                                        min: storageDate || new Date().toISOString().split('T')[0]
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
                                                보관 시간
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
                                                        시작 시간
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
                                                        종료 시간
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
                                                ? `* 운영 시간: ${getPlaceOperatingHours(selectedPlace).start} ~ ${getPlaceOperatingHours(selectedPlace).end}`
                                                : '* 운영 시간: 09:00 ~ 18:00'}
                                            {!isTimeValid && ' (운영 시간 내로 설정해주세요)'}
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
                                            총 금액
                                        </Typography>
                                        <Typography sx={{fontWeight: 600, color: '#1a73e8', fontSize: '18px'}}>
                                            {totalPrice.toLocaleString()}원
                                        </Typography>
                                    </Box>

                                    {/* 결제하기 버튼 */}
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            p: 1.5,
                                            backgroundColor: (totalPrice > 0 && isTimeValid && storageDate && storageStartTime && storageEndTime) ? '#1a73e8' : '#e0e0e0',
                                            color: (totalPrice > 0 && isTimeValid && storageDate && storageStartTime && storageEndTime) ? 'white' : '#9e9e9e',
                                            boxShadow: 'none',
                                            '&:hover': {
                                                backgroundColor: (totalPrice > 0 && isTimeValid && storageDate && storageStartTime && storageEndTime) ? '#1565c0' : '#e0e0e0'
                                            },
                                            '&:focus': {
                                                outline: 'none',
                                            }
                                        }}
                                        disabled={totalPrice === 0 || !isTimeValid || !storageDate || !storageStartTime || !storageEndTime || (storageDuration === "period" && !storageEndDate)}
                                        onClick={() => {
                                            if (totalPrice > 0 && isTimeValid && storageDate && storageStartTime && storageEndTime && (storageDuration !== "period" || storageEndDate)) {
                                                setIsPaymentOpen(true);
                                            }
                                        }}
                                    >
                                        {!isTimeValid
                                            ? "운영 시간 내로 설정해주세요"
                                            : !storageDate || !storageStartTime || !storageEndTime || (storageDuration === "period" && !storageEndDate)
                                                ? "날짜와 시간을 모두 선택해주세요"
                                                : totalPrice === 0
                                                    ? "가방을 선택해주세요"
                                                    : "결제하기"}
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
                                        setSelectedPlace(place);
                                        const moveLatLng = new window.kakao.maps.LatLng(place.y, place.x);
                                        mapInstance?.setCenter(moveLatLng);
                                    }}
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer' // button 대신 커서 스타일로 대체
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
                        bottom: isSidebarOpen ? '60vh' : '0px', // 사이드바 경계선에 정확히 맞춤
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
        </>
    );
};

export default Map;