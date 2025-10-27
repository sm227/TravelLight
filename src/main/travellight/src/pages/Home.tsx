import React, { useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import { useTranslation } from 'react-i18next';
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Footer from "../components/Footer";
import TopRatedPlaces from "../components/reviews/TopRatedPlaces";
import CouponNotificationPopup from "../components/CouponNotificationPopup";
import { useAuth } from "../services/AuthContext";

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  
  useEffect(() => {
    // SEO 메타 태그 설정
    document.title = "Travelight - 여행짐 보관 및 배송 서비스";

    // 기존 메타 태그 제거 및 새로운 메타 태그 추가
    const updateMetaTag = (
      name: string,
      content: string,
      property?: boolean
    ) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // 기본 메타 태그들
    updateMetaTag(
      "description",
      "여행 중 무거운 짐은 TravelLight에 맡기세요. 안전한 보관소에서 짐을 보관하고 원하는 장소로 배송받을 수 있습니다."
    );
    updateMetaTag(
      "keywords",
      "여행짐보관, 짐보관서비스, 여행가방보관, 캐리어보관, 짐배송, TravelLight, Travelight, 여행편의, 트래블라이트"
    );
    updateMetaTag("author", "TravelLight");
    updateMetaTag("robots", "index, follow");
    updateMetaTag("viewport", "width=device-width, initial-scale=1.0");

    // Open Graph 메타 태그들
    updateMetaTag("og:title", "Travelight - 여행짐 보관 및 배송 서비스", true);
    updateMetaTag(
      "og:description",
      "여행 중 무거운 짐은 Travelight에 맡기세요. 안전한 보관소에서 짐을 보관하고 원하는 장소로 배송받을 수 있습니다.",
      true
    );
    updateMetaTag("og:type", "website", true);
    updateMetaTag("og:url", window.location.href, true);
    updateMetaTag("og:site_name", "TravelLight", true);
    updateMetaTag("og:locale", "ko_KR", true);

    // Twitter 카드 메타 태그들
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", "Travelight - 여행짐 보관 및 배송 서비스");
    updateMetaTag(
      "twitter:description",
      "여행 중 무거운 짐은 Travelight에 맡기세요. 안전한 보관소에서 짐을 보관하고 원하는 장소로 배송받을 수 있습니다."
    );

    // JSON-LD 구조화 데이터 추가
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Travelight",
      description: "여행짐 보관 및 배송 서비스",
      url: window.location.origin,
      telephone: "+82-1234-5678",
      address: {
        "@type": "PostalAddress",
        addressCountry: "KR",
        addressLocality: "서울",
      },
      serviceType: "Luggage Storage Service",
      areaServed: "대한민국",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "여행짐 보관 서비스",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "짐 보관 서비스",
              description: "안전한 장소에서 여행객의 짐을 보관하는 서비스",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "짐 배송 서비스",
              description: "보관된 짐을 원하는 장소로 배송하는 서비스",
            },
          },
        ],
      },
    };

    // 기존 JSON-LD 스크립트 제거
    const existingJsonLd = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    // 새로운 JSON-LD 스크립트 추가
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // Canonical URL 설정
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.origin);

    // Preconnect 링크 추가 (성능 최적화)
    const preconnectLinks = [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ];

    preconnectLinks.forEach((url) => {
      let preconnect = document.querySelector(`link[href="${url}"]`);
      if (!preconnect) {
        preconnect = document.createElement("link");
        preconnect.setAttribute("rel", "preconnect");
        preconnect.setAttribute("href", url);
        if (url.includes("gstatic")) {
          preconnect.setAttribute("crossorigin", "");
        }
        document.head.appendChild(preconnect);
      }
    });

    // 다국어 지원 hreflang (향후 다국어 지원시 사용)
    const hreflangLinks = [
      { lang: "ko", href: window.location.origin },
      { lang: "x-default", href: window.location.origin },
    ];

    hreflangLinks.forEach(({ lang, href }) => {
      let hreflang = document.querySelector(
        `link[hreflang="${lang}"]`
      ) as HTMLLinkElement;
      if (!hreflang) {
        hreflang = document.createElement("link");
        hreflang.setAttribute("rel", "alternate");
        hreflang.setAttribute("hreflang", lang);
        document.head.appendChild(hreflang);
      }
      hreflang.setAttribute("href", href);
    });

    // 클린업 함수
    return () => {
      document.title = "TravelLight";
    };
  }, []);

  // 로그인한 사용자에게 쿠폰 팝업 표시
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // "오늘 하루 보지 않기"를 체크했는지 확인
      const today = new Date().toDateString();
      const dontShowToday = localStorage.getItem('couponPopupDontShowToday');
      const dontShowDate = localStorage.getItem('couponPopupDontShowDate');

      // 오늘 "보지 않기"를 체크했으면 팝업을 표시하지 않음
      if (dontShowToday === 'true' && dontShowDate === today) {
        return;
      }

      // 그 외의 경우 매번 팝업 표시
      setShowCouponPopup(true);
    }
  }, [isAuthenticated, user]);

  const handleCloseCouponPopup = () => {
    setShowCouponPopup(false);
  };

  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >
      {/* Header with navigation */}
      <Box component="header" role="banner">
        <Navbar />
      </Box>

      {/* Main content area */}
      <Box
        component="main"
        role="main"
        sx={{ flexGrow: 1 }}
        itemScope
        itemType="https://schema.org/WebPage"
      >
        {/* Hero section - 메인 랜딩 영역 */}
        <Box
          component="section"
          aria-label="메인 서비스 소개"
          itemProp="mainContentOfPage"
        >
          <Hero />
        </Box>

        {/* Services section - 서비스 상세 설명 */}
        <Box component="section" aria-label="서비스 상세 정보" itemProp="about">
          <Services />
        </Box>

        {/* Top Rated Places section - 상위 평점 제휴점 */}
        <Box component="section" aria-label="추천 제휴점" sx={{ py: 8, bgcolor: 'grey.50' }}>
          <Container maxWidth="lg">
            <TopRatedPlaces limit={6} title={t('trustedPartners')} />
          </Container>
        </Box>
      </Box>

      {/* Footer */}
      <Box component="footer" role="contentinfo">
        <Footer />
      </Box>

      {/* 쿠폰 알림 팝업 */}
      <CouponNotificationPopup
        userId={user?.id || null}
        open={showCouponPopup}
        onClose={handleCloseCouponPopup}
      />
    </Box>
  );
};

export default Home;
