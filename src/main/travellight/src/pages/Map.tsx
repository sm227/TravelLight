import { useEffect, useState, useCallback } from "react";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../MapButton.css";
import LocationOnIcon from '@mui/icons-material/LocationOn';

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
                for (let i = 0; i < data.length; i++) {
                    displayBankMarker(data[i]);
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
                    <span class="bank-icon"></span>
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
            bankOverlays.push(markerOverlay);

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
            });

            // 닫기 버튼 클릭 이벤트는 HTML에서 직접 처리됨
        }

        function clearBankMarkers() {
            // 오버레이 제거
            for (let overlay of bankOverlays) {
                overlay.setMap(null);
            }
            bankOverlays = [];

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
                    <span class="store-icon"></span>
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

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, position: "relative" }}>
                <div id="map" style={{ width: "100vw", height: "100vh" }} />
                {isMapMoved && (
                    <div className="map-button-container">
                        <button className="map-button" onClick={returnToMyLocation}>
                            <LocationOnIcon className="map-button-icon" />
                        </button>
                    </div>
                )}
            </Box>
            <Footer />
            <style>
                {`
                    .custom-marker {
                        position: relative;
                        width: 20px;
                        height: 20px;
                    }
                    .marker-circle {
                        width: 15px;
                        height: 15px;
                        background-color: rgba(255, 0, 0, 0.7);
                        border-radius: 50%;
                        position: absolute;
                        top: 0;
                        left: 0;
                        box-shadow: 0 0 10px rgba(255, 0, 0, 0.4);
                    }
                    .marker-wave {
                        position: absolute;
                        width: 25px;
                        height: 25px;
                        background: rgba(255, 0, 0, 0.3);
                        border-radius: 50%;
                        top: -5px;
                        left: -5px;
                        animation: waveEffect 1.5s infinite ease-out;
                    }
                    .bank-marker-container {
                        cursor: pointer;
                    }
                    .bank-marker {
                        width: 24px;
                        height: 24px;
                        background-color: #3B5998;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                        transition: background-color 0.2s ease; /* 부드러운 색상 전환 효과 */
                    }
                    
                    .bank-marker.selected { /*선택된 마커 색상 변경 */
                    background-color: #ff4136;
                    box-shadow: 0 2px 8px rgba(255, 65, 54, 0.5);
                    }
                    
                    .bank-icon {
                        display: block;
                        width: 14px;
                        height: 14px;
                        background-color: white;
                        clip-path: polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%);
                    }
                    
                    /* Overlay with pointer */
                    .bank-info-overlay {
                        position: relative;
                    }
                    .info-window {
                        position: absolute;
                        left: -125px;
                        bottom: 30px;
                        width: 250px;
                    }
                    .info-content {
                        padding: 15px;
                        background: white;
                        border-radius: 8px;
                        font-size: 13px;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                    }
                    .title {
                        font-weight: bold;
                        font-size: 16px;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 8px;
                        margin-bottom: 8px;
                        position: relative;
                        padding-right: 20px;
                    }
                    .bank-name {
                        display: inline-block;
                        width: 200px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .close {
                        position: absolute;
                        top: 0;
                        right: 0;
                        cursor: pointer;
                        color: #888;
                        font-size: 18px;
                    }
                    .body {
                        margin-top: 8px;
                    }
                    .desc {
                        line-height: 1.6;
                    }
                    .ellipsis {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .phone {
                        margin-top: 5px;
                        color: #0080ff;
                        font-weight: 500;
                    }
                    
                    /* 삼각형 모양의 꼬리 부분 */
                    .info-tail {
                        position: relative;
                        width: 0;
                        height: 0;
                        margin: -1px auto 0;
                        border-left: 10px solid transparent;
                        border-right: 10px solid transparent;
                        border-top: 10px solid white;
                        /* 그림자 효과는 CSS 삼각형에 직접 적용할 수 없어서 제거했습니다 */
                    }
                    
                    @keyframes waveEffect {
                        0% { transform: scale(1); opacity: 0.7; }
                        100% { transform: scale(2); opacity: 0; }
                    }

                    .store-marker-container {
                        cursor: pointer;
                    }
                    .store-marker {
                        width: 24px;
                        height: 24px;
                        background-color: #28A745;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                        transition: background-color 0.2s ease;
                    }
                    .store-marker.selected {
                        background-color: #ff4136;
                        box-shadow: 0 2px 8px rgba(255, 65, 54, 0.5);
                    }
                    .store-icon {
                        display: block;
                        width: 14px;
                        height: 14px;
                        background-color: white;
                        clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
                    }
                    .store-name {
                        display: inline-block;
                        width: 200px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    
                    /* Overlay with pointer */
                    .store-info-overlay {
                        position: relative;
                    }
                `}
            </style>
        </Box>
    );
};

export default Map;