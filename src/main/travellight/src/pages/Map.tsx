import { useEffect, useState, useCallback } from "react";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../MapButton.css";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { TextField, Button, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Typography } from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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
            ps.categorySearch("BK9", placesSearchCB, { useMapBounds: true });
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
            markerElement.addEventListener('click', function() {
                // 선택된 마커가 있으면 원래 색상으로 돌리기
                if(selectedMarkerElement){
                    const prevMarker = selectedMarkerElement.querySelector('.bank-marker');
                    if(prevMarker){
                        prevMarker.classList.remove('selected');
                    }
                }
                // 현재 마커를 선택 상태로 변경
                const currentMarker = markerElement.querySelector('.bank-marker');
                if(currentMarker){
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
            ps.categorySearch("CS2", storesSearchCB, { useMapBounds: true });
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
            markerElement.addEventListener('click', function() {
                // 선택된 마커가 있으면 원래 색상으로 돌리기
                if(selectedMarkerElement){
                    const prevMarker = selectedMarkerElement.querySelector('.bank-marker, .store-marker');
                    if(prevMarker){
                        prevMarker.classList.remove('selected');
                    }
                }
                // 현재 마커를 선택 상태로 변경
                const currentMarker = markerElement.querySelector('.store-marker');
                if(currentMarker){
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
                if(marker){
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
            }} />
            
            {/* 내 위치로 돌아가기 버튼 */}
            {isMapMoved && (
                <div className="map-button-container" style={{
                    position: "fixed",
                    zIndex: 10
                }}>
                    <button className="map-button" onClick={returnToMyLocation}>
                        <LocationOnIcon className="map-button-icon" />
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
                {/* 검색 영역 */}
                <Box sx={{ 
                    p: 3, 
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)'
                }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                            disableRipple // 물결 효과 제거
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
                                // focus 시 테두리 제거
                                '&:focus': {
                                    outline: 'none',
                                },
                                // focus-visible 시 테두리 제거
                                '&.Mui-focusVisible': {
                                    outline: 'none',
                                    boxShadow: 'none',
                                },
                                // active 상태 스타일
                                '&:active': {
                                    boxShadow: 'none',
                                }
                            }}
                        >
                            검색
                        </Button>
                    </Box>
                    
                    {/* 시간 선택 영역 */}
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <FormControl sx={{ flex: 1 }}>
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
                                    // Select 메뉴 스타일링
                                    '& .MuiSelect-select': {
                                        paddingRight: '32px !important', // 화살표 아이콘 공간 확보
                                    },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 300,
                                            mt: 1,
                                            borderRadius: '16px',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                            ...scrollbarStyle, // 스크롤바 스타일 적용
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
                                            // 리스트 아이템 패딩 조정
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
                        <FormControl sx={{ flex: 1 }}>
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
                                            ...scrollbarStyle, // 스크롤바 스타일 적용
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

                {/* 결과 영역 - 명시적으로 높이와 스크롤 설정 */}
                <Box sx={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    p: 3,
                    ...scrollbarStyle,
                    // 스크롤바가 컨텐츠를 밀지 않도록 설정
                    marginRight: '-4px',
                    paddingRight: '7px', // 기존 패딩 + 스크롤바 너비
                    // 명시적인 최대 높이 설정
                    '@media (min-width: 768px)': {
                        maxHeight: 'calc(100vh - 200px)', // 검색 영역 및 여백 고려해 조정
                    },
                    '@media (max-width: 767px)': {
                        maxHeight: 'calc(60vh - 150px)', // 모바일에서 검색 영역 고려
                    }
                }}>
                    {selectedPlace ? (
                        // 선택된 장소 상세 정보
                        <Box sx={{ 
                            backgroundColor: '#f8f9fa',
                            borderRadius: '20px',
                            p: 3,
                            transition: 'all 0.2s ease'
                        }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                {selectedPlace.place_name}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', mb: 1 }}>
                                {selectedPlace.address_name}
                            </Typography>
                            <Typography sx={{ color: 'primary.main', mb: 1 }}>
                                {selectedPlace.phone}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                                {selectedPlace.opening_hours || 
                                 (selectedPlace.category_group_code === "BK9" ? 
                                  "평일 09:00 - 16:00" : "24시간 영업")}
                            </Typography>
                            <Button 
                                variant="outlined" 
                                sx={{ 
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    },
                                    // 테두리 제거
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
                        </Box>
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
                                            <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                                                {place.place_name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{ color: 'text.secondary' }}>
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
                    
                    // 모바일: 하단 중앙에 위치
                    '@media (max-width: 767px)': {
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bottom: isSidebarOpen ? '60vh' : '0px',
                        marginBottom: isSidebarOpen ? '-12px' : '0px',
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
                    isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />
                ) : (
                    isSidebarOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />
                )}
            </Button>
        </>
    );
};

export default Map;