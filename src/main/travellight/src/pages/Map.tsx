import React, { useEffect } from "react";
import { Box } from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

declare global {
    interface Window {
        kakao: any;
    }
}

const Map = () => {
    useEffect(() => {
        const container = document.getElementById("map") as HTMLElement;
        const options = {
            center: new window.kakao.maps.LatLng(33.450701, 126.570667),
            level: 3,
        };
        const map = new window.kakao.maps.Map(container, options);
        const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });
        let bankMarkers: any[] = [];

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const locPosition = new window.kakao.maps.LatLng(lat, lon);
                    displayUserMarker(locPosition);
                    map.setCenter(locPosition);
                    searchBanks(map);
                },
                () => {
                    searchBanks(map);
                }
            );
        } else {
            searchBanks(map);
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
            const markerElement = document.createElement("div");
            markerElement.innerHTML = `
                <div class="bank-marker"></div>
            `;
            const customOverlay = new window.kakao.maps.CustomOverlay({
                position: new window.kakao.maps.LatLng(place.y, place.x),
                content: markerElement,
                yAnchor: 1.2,
            });
            customOverlay.setMap(map);
            bankMarkers.push(customOverlay);

            window.kakao.maps.event.addListener(customOverlay, "click", function () {
                infowindow.setContent(`<div style="padding:5px;font-size:12px;">${place.place_name}</div>`);
                infowindow.open(map, customOverlay);
            });
        }

        function clearBankMarkers() {
            for (let marker of bankMarkers) {
                marker.setMap(null);
            }
            bankMarkers = [];
        }

        window.kakao.maps.event.addListener(map, "dragend", () => {
            searchBanks(map);
        });
    }, []);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <div id="map" style={{ width: "100vw", height: "100vh" }} />
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
                    .bank-marker {
                        width: 20px;
                        height: 20px;
                        background-color: blue;
                        border-radius: 50%;
                        box-shadow: 0 0 10px rgba(0, 0, 255, 0.5);
                    }
                    @keyframes waveEffect {
                        0% { transform: scale(1); opacity: 0.7; }
                        100% { transform: scale(2); opacity: 0; }
                    }
                `}
            </style>
        </Box>
    );
};

export default Map;
