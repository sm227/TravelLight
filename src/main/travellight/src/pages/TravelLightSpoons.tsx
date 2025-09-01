import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
} from "@mui/material";
import {
  LocationOn,
  Schedule,
  People,
  AccessTime,
  Close,
  Map,
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// 깔끔한 스타일드 컴포넌트
const Section = styled(Box)({
  backgroundColor: "#ffffff",
  padding: "60px 0",
});

const RestaurantCard = styled(Box)({
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  overflow: "hidden",
  cursor: "pointer",
  transition: "box-shadow 0.2s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  }
});

const SpoonRating = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px 8px",
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  backgroundColor: "#f9fafb",
});

const InfoItem = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 0",
  borderBottom: "1px solid #f3f4f6",
  "&:last-child": {
    borderBottom: "none",
  }
});

// 타입 정의
interface Restaurant {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  rating: number;
  reviewCount: number;
  crowdLevel: "low" | "medium" | "high";
  avgWaitTime: number;
  location: {
    address: string;
    addressEn: string;
    lat: number;
    lng: number;
    district: string;
  };
  openingHours: string;
  priceRange: string;
  spoonRating: 1 | 2 | 3;
  certificationYear: number;
  specialDish: string;
  tips: string[];
  walkingDistance: number;
}

const TravelLightSpoons: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t, i18n } = useTranslation();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isEnglish = i18n.language === "en";

  useEffect(() => {
    document.title = isEnglish 
      ? "TravelLight Spoons - Certified Restaurants"
      : "트래블라이트 티스푼 - 인증 맛집";
  }, [isEnglish]);

  const certifiedRestaurants: Restaurant[] = [
    {
      id: "1",
      name: "애성회관",
      nameEn: "Aesung Hoegwan",
      description: "70년 전통 한우곰탕 전문점",
      descriptionEn: "70-year traditional Korean beef soup restaurant",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&h=400&fit=crop",
      rating: 4.8,
      reviewCount: 4520,
      crowdLevel: "high",
      avgWaitTime: 25,
      location: {
        address: "서울 중구 남대문로5길 23 세창빌딩 1층",
        addressEn: "1F, Sechang Building, 23 Namdaemun-ro 5-gil, Jung-gu, Seoul",
        lat: 37.5587,
        lng: 126.9772,
        district: "중구"
      },
      openingHours: "06:00 - 22:00",
      priceRange: "₩12,000 - ₩18,000",
      spoonRating: 3,
      certificationYear: 2024,
      specialDish: "한우곰탕",
      tips: [
        "새벽 6시부터 영업하는 진짜 맛집",
        "국물이 진하고 고기가 부드러워요",
        "김치와 깍두기 리필 무제한"
      ],
      walkingDistance: 2
    }
  ];

  const renderSpoonRating = (rating: number) => {
    const spoons = [];
    for (let i = 0; i < 3; i++) {
      spoons.push(
        <span
          key={i}
          style={{
            fontSize: "16px",
            opacity: i < rating ? 1 : 0.3,
          }}
        >
          🥄
        </span>
      );
    }
    return spoons;
  };

  const getCrowdText = (level: string) => {
    switch (level) {
      case "low": return isEnglish ? "Not crowded" : "한산함";
      case "medium": return isEnglish ? "Moderate" : "보통";
      case "high": return isEnglish ? "Crowded" : "혼잡";
      default: return "";
    }
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedRestaurant(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      <Navbar />
      
      <Section>
        <Container maxWidth="md">
          {/* 히어로 섹션 */}
          <Box sx={{ 
            position: "relative",
            minHeight: "400px",
            mb: 8,
            borderRadius: "12px",
            overflow: "hidden"
          }}>
            {/* 배경 이미지 */}
            <Box sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.4)"
              }
            }} />

            {/* 히어로 컨텐츠 */}
            <Box sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
              px: 4,
              py: 6,
              textAlign: "center",
              color: "white"
            }}>
              <Typography variant="h2" sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: { xs: "2rem", md: "3rem" },
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                {isEnglish ? "TravelLight Spoons" : "트래블라이트 티스푼"}
              </Typography>
              
              <Typography variant="h5" sx={{ 
                fontWeight: 400,
                mb: 4,
                maxWidth: "600px",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                fontSize: { xs: "1.1rem", md: "1.25rem" }
              }}>
                {isEnglish 
                  ? "Curated restaurants near luggage storage locations, certified by TravelLight"
                  : "짐보관소 근처 트래블라이트가 엄선한 맛집"
                }
              </Typography>

              <Box sx={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                px: 4,
                py: 2,
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}>
                <Typography variant="body1" sx={{ 
                  fontWeight: 500,
                  fontSize: "1rem"
                }}>
                  {isEnglish ? "TravelLight Certified • 1-3 Spoon Rating" : "트래블라이트 인증 • 1-3 티스푼 평가"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 티스푼 등급제 설명 섹션 */}
          <Box sx={{ 
            py: 6,
            mb: 8,
            borderTop: "1px solid #e5e7eb",
            borderBottom: "1px solid #e5e7eb"
          }}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: "#111827",
                mb: 3
              }}>
                {isEnglish ? "How We Rate" : "티스푼 등급제"}
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: "#4b5563", 
                maxWidth: "700px",
                mx: "auto",
                lineHeight: 1.7,
                fontSize: "1.1rem"
              }}>
                {isEnglish 
                  ? "TravelLight carefully selects and certifies restaurants near luggage storage locations. Each restaurant is evaluated by our team for quality, service, and convenience for travelers exploring hands-free."
                  : "트래블라이트가 짐보관소 근처 맛집을 직접 선별하고 인증합니다. 짐 없이 자유롭게 탐험하는 여행객들을 위해 품질, 서비스, 편의성을 종합적으로 평가합니다."
                }
              </Typography>
            </Box>

            {/* 등급 가이드 */}
            <Box sx={{ 
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 4,
              maxWidth: "600px",
              mx: "auto"
            }}>
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ mb: 2, fontSize: "2rem" }}>{renderSpoonRating(1)}</Box>
                <Typography variant="h6" sx={{ color: "#111827", fontWeight: 600, mb: 1 }}>
                  {isEnglish ? "Worth a Visit" : "가볼 만한 곳"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  {isEnglish ? "Good quality restaurant" : "좋은 품질의 식당"}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ mb: 2, fontSize: "2rem" }}>{renderSpoonRating(2)}</Box>
                <Typography variant="h6" sx={{ color: "#111827", fontWeight: 600, mb: 1 }}>
                  {isEnglish ? "Highly Recommended" : "적극 추천"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  {isEnglish ? "Excellent cuisine" : "훌륭한 음식"}
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ mb: 2, fontSize: "2rem" }}>{renderSpoonRating(3)}</Box>
                <Typography variant="h6" sx={{ color: "#111827", fontWeight: 600, mb: 1 }}>
                  {isEnglish ? "Must-Visit" : "꼭 가봐야 할 곳"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  {isEnglish ? "Exceptional dining" : "특별한 식사 경험"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 인증 맛집 목록 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: "#111827",
              mb: 4,
              fontSize: { xs: "1.5rem", md: "2rem" }
            }}>
              {isEnglish ? "Certified Restaurants" : "인증 맛집"}
            </Typography>

            <Box sx={{ 
              display: "grid",
              gap: 4,
              mb: 4
            }}>
              {certifiedRestaurants.map((restaurant) => (
                <Box
                  key={restaurant.id}
                  sx={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #f1f5f9",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative",
                    "&:hover": {
                      borderColor: "#e2e8f0"
                    }
                  }}
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  <Box sx={{ p: 0 }}>
                    {/* 상단: 이미지와 기본 정보 */}
                    <Box sx={{ display: "flex", gap: 0 }}>
                      {/* 왼쪽: 이미지 */}
                      <Box 
                        sx={{ 
                          width: "200px",
                          height: "140px",
                          flexShrink: 0,
                          position: "relative"
                        }}
                      >
                        <img 
                          src={restaurant.image}
                          alt={isEnglish ? restaurant.nameEn : restaurant.name}
                          style={{ 
                            width: "100%", 
                            height: "100%", 
                            objectFit: "cover"
                          }}
                        />
                        {/* 티스푼 배지 */}
                        <Box sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "12px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}>
                          {renderSpoonRating(restaurant.spoonRating)}
                        </Box>
                      </Box>

                      {/* 오른쪽: 정보 */}
                      <Box sx={{ p: 3, flex: 1, minHeight: "140px", display: "flex", flexDirection: "column" }}>
                        {/* 제목과 인증년도 */}
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: "#111827",
                            mb: 0.5,
                            fontSize: "1.125rem"
                          }}>
                            {isEnglish ? restaurant.nameEn : restaurant.name}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: "#6b7280",
                            fontSize: "0.8rem"
                          }}>
                            {restaurant.certificationYear}년 트래블라이트 인증 • {restaurant.specialDish}
                          </Typography>
                        </Box>

                        {/* 설명 */}
                        <Typography variant="body2" sx={{ 
                          color: "#374151", 
                          mb: 2,
                          lineHeight: 1.5,
                          flex: 1
                        }}>
                          {isEnglish ? restaurant.descriptionEn : restaurant.description}
                        </Typography>

                        {/* 하단 정보 */}
                        <Box sx={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          pt: 1,
                          borderTop: "1px solid #f3f4f6"
                        }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: "#111827"
                            }}>
                              {restaurant.priceRange}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#6b7280" }}>
                              도보 {restaurant.walkingDistance}분
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" sx={{ 
                              color: "#f59e0b", 
                              fontWeight: 600
                            }}>
                              ★ {restaurant.rating}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#6b7280" }}>
                              ({restaurant.reviewCount.toLocaleString()})
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* 팁 섹션 (접힌 상태) */}
                    <Box sx={{ 
                      px: 3, 
                      py: 2, 
                      backgroundColor: "#f8fafc",
                      borderTop: "1px solid #f1f5f9"
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: "#6b7280",
                        fontWeight: 500,
                        mb: 1,
                        display: "block"
                      }}>
                        여행객 꿀팁
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: "#374151",
                        fontSize: "0.875rem"
                      }}>
                        {restaurant.tips[0]}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Section>

      {/* 상세 정보 드로어 */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: "400px" },
            maxWidth: "100vw",
          }
        }}
      >
        {selectedRestaurant && (
          <Box sx={{ height: "100%" }}>
            {/* 헤더 */}
            <Box sx={{ 
              position: "sticky", 
              top: 0, 
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e5e7eb",
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
                {isEnglish ? selectedRestaurant.nameEn : selectedRestaurant.name}
              </Typography>
              <IconButton onClick={handleCloseDrawer}>
                <Close />
              </IconButton>
            </Box>

            <Box sx={{ p: 3 }}>
              {/* 이미지 */}
              <Box sx={{ mb: 3 }}>
                <img 
                  src={selectedRestaurant.image}
                  alt={isEnglish ? selectedRestaurant.nameEn : selectedRestaurant.name}
                  style={{ 
                    width: "100%", 
                    height: "200px", 
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />
              </Box>

              {/* 등급 및 평점 */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <SpoonRating>
                  {renderSpoonRating(selectedRestaurant.spoonRating)}
                  <Typography variant="body2" sx={{ color: "#374151", fontWeight: 500, ml: 1 }}>
                    {selectedRestaurant.spoonRating} {isEnglish ? "Spoons" : "티스푼"}
                  </Typography>
                </SpoonRating>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  ★ {selectedRestaurant.rating} ({selectedRestaurant.reviewCount.toLocaleString()})
                </Typography>
              </Box>

              {/* 설명 */}
              <Typography variant="body2" sx={{ color: "#6b7280", mb: 4, lineHeight: 1.6 }}>
                {isEnglish ? selectedRestaurant.descriptionEn : selectedRestaurant.description}
              </Typography>

              {/* 정보 */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
                  {isEnglish ? "Information" : "정보"}
                </Typography>
                
                <InfoItem>
                  <LocationOn sx={{ fontSize: 20, color: "#9ca3af" }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      {isEnglish ? "Location" : "위치"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      {isEnglish ? selectedRestaurant.location.addressEn : selectedRestaurant.location.address}
                    </Typography>
                  </Box>
                </InfoItem>

                <InfoItem>
                  <Schedule sx={{ fontSize: 20, color: "#9ca3af" }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      {isEnglish ? "Hours" : "운영시간"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      {selectedRestaurant.openingHours}
                    </Typography>
                  </Box>
                </InfoItem>

                <InfoItem>
                  <People sx={{ fontSize: 20, color: "#9ca3af" }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      {isEnglish ? "Crowd level" : "혼잡도"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      {getCrowdText(selectedRestaurant.crowdLevel)}
                      {selectedRestaurant.avgWaitTime > 0 && (
                        <span> • {selectedRestaurant.avgWaitTime}분 대기</span>
                      )}
                    </Typography>
                  </Box>
                </InfoItem>

                <InfoItem>
                  <span style={{ fontSize: "20px", marginRight: "4px" }}>💰</span>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      {isEnglish ? "Price range" : "가격대"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      {selectedRestaurant.priceRange}
                    </Typography>
                  </Box>
                </InfoItem>
              </Box>

              {/* 팁 */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "#111827" }}>
                  {isEnglish ? "Tips" : "팁"}
                </Typography>
                {selectedRestaurant.tips.map((tip, index) => (
                  <Box key={index} sx={{ mb: 1, display: "flex", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "#374151" }}>
                      • {tip}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* 지도 버튼 */}
              <Button
                variant="contained"
                fullWidth
                startIcon={<Map />}
                onClick={() => window.open(`https://maps.google.com/?q=${selectedRestaurant.location.lat},${selectedRestaurant.location.lng}`, '_blank')}
                sx={{
                  backgroundColor: "#2563eb",
                  "&:hover": {
                    backgroundColor: "#1d4ed8",
                  },
                  textTransform: "none",
                  borderRadius: "8px",
                  py: 1.5
                }}
              >
                {isEnglish ? "Open in Maps" : "지도에서 보기"}
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      <Footer />
    </Box>
  );
};

export default TravelLightSpoons;