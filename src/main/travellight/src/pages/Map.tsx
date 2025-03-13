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
    // 지도 생성
    const container = document.getElementById("map") as HTMLElement;
    const options = {
      center: new window.kakao.maps.LatLng(33.450701, 126.570667),
      level: 3,
    };
    const map = new window.kakao.maps.Map(container, options);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const locPosition = new window.kakao.maps.LatLng(lat, lon);
            const message = '<div style="padding:5px;">현위치</div>';

            displayMarker(locPosition, message);
            map.setCenter(locPosition);
          },
          (error) => {
            console.error("위치 정보를 가져올 수 없습니다:", error);

            const locPosition = new window.kakao.maps.LatLng(33.450701, 126.570667);
            const message = "geolocation을 사용할 수 없어요..";

            // 위치정보 x = 기본좌표로
            displayMarker(locPosition, message);
            map.setCenter(locPosition);
          }
      );
    } else {
      // Geolocation을 지원하지 않는 경우
      const locPosition = new window.kakao.maps.LatLng(33.450701, 126.570667);
      const message = "geolocation을 사용할 수 없어요..";
      displayMarker(locPosition, message);
      map.setCenter(locPosition);
    }

    // 마커
    function displayMarker(locPosition: any, message: string) {
      const marker = new window.kakao.maps.Marker({
        map: map,
        position: locPosition,
      });

      const infowindow = new window.kakao.maps.InfoWindow({
        content: message,
        removable: true,
      });

      infowindow.open(map, marker);
    }
  }, []);

  return (
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <div id="map" style={{ width: "100vw", height: "100vh" }} /> {/* 지도 렌더링 */}
        </Box>
        <Footer />
      </Box>
  );
};

export default Map;
