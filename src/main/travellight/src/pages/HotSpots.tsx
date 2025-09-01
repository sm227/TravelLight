import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  Tab,
  Tabs,
  Rating,
  Avatar,
  AvatarGroup,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  LocationOn,
  Schedule,
  People,
  Restaurant,
  Camera,
  Map,
  Favorite,
  Share,
  DirectionsWalk,
  Language,
  Star,
  AccessTime,
  LocalFireDepartment,
  Visibility,
  Close,
  BookmarkAdd,
  RestaurantMenu,
  EmojiEvents,
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// 스타일드 컴포넌트
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: 16,
  overflow: "hidden",
  transition: "all 0.3s ease",
  position: "relative",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
  },
}));

const HotBadge = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: 12,
  left: 12,
  backgroundColor: "#FF4444",
  color: "white",
  fontWeight: "bold",
  zIndex: 2,
  "& .MuiChip-icon": {
    color: "white",
  },
}));

const CrowdMeter = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
}));

const FloatingButton = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
}));

const TravelLightBadge = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: 12,
  right: 12,
  background: "linear-gradient(45deg, #FFD700, #FFA500)",
  color: "#8B4513",
  fontWeight: "bold",
  fontSize: "0.75rem",
  zIndex: 2,
  border: "2px solid #FFD700",
  boxShadow: "0 2px 8px rgba(255, 215, 0, 0.3)",
  "& .MuiChip-icon": {
    color: "#8B4513",
    fontSize: "16px",
  },
}));

const SpoonRating = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  backgroundColor: "#FFF8DC",
  borderRadius: theme.spacing(1),
  border: "1px solid #FFD700",
}));

// 타입 정의
interface HotSpot {
  id: string;
  name: string;
  nameEn: string;
  category: "tourist" | "restaurant" | "shopping" | "culture";
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
  reservationCount: number;
  trendingScore: number;
  openingHours: string;
  priceRange: string;
  tags: string[];
  tips: string[];
  nearbyLuggage: boolean;
  walkingDistance: number;
  lastUpdated: string;
  travelLightCertified?: boolean;
  spoonRating?: 1 | 2 | 3;
  certificationYear?: number;
  specialDish?: string;
}

interface ReservationStats {
  totalReservations: number;
  hotSpots: HotSpot[];
  trendingAreas: string[];
}

const HotSpots: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t, i18n } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState<HotSpot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reservationStats, setReservationStats] = useState<ReservationStats | null>(null);
  const [favoriteSpots, setFavoriteSpots] = useState<string[]>([]);

  const isEnglish = i18n.language === "en";

  // SEO 및 페이지 설정
  useEffect(() => {
    document.title = isEnglish 
      ? "Hot Spots in Seoul - TravelLight"
      : "서울 핫플레이스 - TravelLight";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        isEnglish
          ? "Discover trending places in Seoul based on real reservation data. Find popular tourist attractions, restaurants, and local hotspots where you can store your luggage nearby."
          : "실제 예약 데이터 기반 서울 트렌딩 핫플레이스를 발견하세요. 짐 보관 서비스와 함께 인기 관광지, 맛집, 쇼핑 명소를 편리하게 즐기세요."
      );
    }
  }, [isEnglish]);

  // 샘플 데이터 - 실제로는 백엔드 API에서 가져올 데이터
  useEffect(() => {
    const mockStats: ReservationStats = {
      totalReservations: 15420,
      trendingAreas: ["홍대", "강남", "명동", "이태원", "성수"],
      hotSpots: [
        {
          id: "1",
          name: "경복궁",
          nameEn: "Gyeongbokgung Palace",
          category: "tourist",
          description: "조선시대 궁궐의 아름다움을 간직한 대표 관광지",
          descriptionEn: "The main royal palace of the Joseon dynasty, showcasing traditional Korean architecture",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
          rating: 4.6,
          reviewCount: 3240,
          crowdLevel: "high",
          avgWaitTime: 25,
          location: {
            address: "서울특별시 종로구 사직로 161",
            addressEn: "161 Sajik-ro, Jongno-gu, Seoul",
            lat: 37.5796,
            lng: 126.9770,
            district: "종로구"
          },
          reservationCount: 1850,
          trendingScore: 98,
          openingHours: "09:00 - 18:00",
          priceRange: "₩3,000 - ₩5,000",
          tags: ["전통문화", "사진명소", "역사", "궁궐"],
          tips: ["오전 일찍 방문하면 사람이 적어요", "한복 대여점이 근처에 많습니다"],
          nearbyLuggage: true,
          walkingDistance: 3,
          lastUpdated: "2분 전"
        },
        {
          id: "2", 
          name: "명동",
          nameEn: "Myeongdong",
          category: "shopping",
          description: "외국인 관광객이 가장 많이 찾는 쇼핑 천국",
          descriptionEn: "Shopping paradise most visited by international tourists",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
          rating: 4.3,
          reviewCount: 5680,
          crowdLevel: "high",
          avgWaitTime: 0,
          location: {
            address: "서울특별시 중구 명동",
            addressEn: "Myeongdong, Jung-gu, Seoul",
            lat: 37.5636,
            lng: 126.9828,
            district: "중구"
          },
          reservationCount: 2340,
          trendingScore: 95,
          openingHours: "10:00 - 22:00",
          priceRange: "₩10,000 - ₩100,000+",
          tags: ["쇼핑", "화장품", "길거리음식", "면세점"],
          tips: ["저녁 시간이 가장 활기차요", "여러 언어로 소통 가능한 매장이 많아요"],
          nearbyLuggage: true,
          walkingDistance: 1,
          lastUpdated: "5분 전"
        },
        {
          id: "3",
          name: "애성회관",
          nameEn: "Aesung Hoegwan",
          category: "restaurant",
          description: "트래블라이트 선정 🥄🥄🥄 3티스푼 인증 한우곰탕 전문점",
          descriptionEn: "TravelLight certified 🥄🥄🥄 3-Spoon Korean beef soup specialist",
          image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
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
          reservationCount: 2180,
          trendingScore: 96,
          openingHours: "06:00 - 22:00",
          priceRange: "₩12,000 - ₩18,000",
          tags: ["한우곰탕", "전통한식", "트래블라이트인증", "3티스푼"],
          tips: ["오전 일찍 가면 국물이 진해요", "김치와 깍두기 무제한", "현금 할인 가능"],
          nearbyLuggage: true,
          walkingDistance: 2,
          lastUpdated: "5분 전",
          travelLightCertified: true,
          spoonRating: 3,
          certificationYear: 2024,
          specialDish: "한우곰탕"
        },
        {
          id: "4",
          name: "홍대 클럽거리",
          nameEn: "Hongdae Club Street",
          category: "culture",
          description: "젊음과 열정이 넘치는 서울의 밤문화 중심지",
          descriptionEn: "The center of Seoul's nightlife full of youth and energy",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
          rating: 4.4,
          reviewCount: 4120,
          crowdLevel: "high",
          avgWaitTime: 30,
          location: {
            address: "서울특별시 마포구 홍익로",
            addressEn: "Hongik-ro, Mapo-gu, Seoul",
            lat: 37.5563,
            lng: 126.9208,
            district: "마포구"
          },
          reservationCount: 1920,
          trendingScore: 94,
          openingHours: "18:00 - 04:00",
          priceRange: "₩20,000 - ₩50,000",
          tags: ["클럽", "펍", "라이브음악", "청춘"],
          tips: ["밤 10시 이후가 진짜 시작이에요", "주말엔 더욱 붐벼요"],
          nearbyLuggage: true,
          walkingDistance: 2,
          lastUpdated: "1분 전"
        },
        {
          id: "5",
          name: "N서울타워",
          nameEn: "N Seoul Tower",
          category: "tourist",
          description: "서울의 상징적 랜드마크, 야경 명소",
          descriptionEn: "Seoul's iconic landmark with spectacular night views",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
          rating: 4.2,
          reviewCount: 6750,
          crowdLevel: "medium",
          avgWaitTime: 20,
          location: {
            address: "서울특별시 용산구 남산공원길 105",
            addressEn: "105 Namsan park-gil, Yongsan-gu, Seoul",
            lat: 37.5512,
            lng: 126.9882,
            district: "용산구"
          },
          reservationCount: 1580,
          trendingScore: 89,
          openingHours: "10:00 - 23:00",
          priceRange: "₩15,000 - ₩25,000",
          tags: ["전망", "야경", "사랑의자물쇠", "케이블카"],
          tips: ["해질무렵 방문이 최고예요", "미리 온라인 예약하세요"],
          nearbyLuggage: true,
          walkingDistance: 8,
          lastUpdated: "3분 전"
        },
        {
          id: "6",
          name: "강남 가로수길",
          nameEn: "Garosu-gil, Gangnam",
          category: "shopping",
          description: "트렌디한 카페와 부티크가 즐비한 패셔니스타들의 거리",
          descriptionEn: "Trendy street lined with cafes and boutiques for fashionistas",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
          rating: 4.3,
          reviewCount: 3450,
          crowdLevel: "medium",
          avgWaitTime: 10,
          location: {
            address: "서울특별시 강남구 신사동 가로수길",
            addressEn: "Garosu-gil, Sinsa-dong, Gangnam-gu, Seoul",
            lat: 37.5205,
            lng: 127.0235,
            district: "강남구"
          },
          reservationCount: 1370,
          trendingScore: 87,
          openingHours: "10:00 - 22:00",
          priceRange: "₩15,000 - ₩80,000",
          tags: ["카페", "패션", "브런치", "셀럽"],
          tips: ["주말 오후가 가장 활기차요", "인스타 사진 명소가 많아요"],
          nearbyLuggage: true,
          walkingDistance: 4,
          lastUpdated: "7분 전"
        }
      ]
    };
    
    setReservationStats(mockStats);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSpotClick = (spot: HotSpot) => {
    setSelectedSpot(spot);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSpot(null);
  };

  const toggleFavorite = (spotId: string) => {
    setFavoriteSpots(prev => 
      prev.includes(spotId) 
        ? prev.filter(id => id !== spotId)
        : [...prev, spotId]
    );
  };

  const getCrowdColor = (level: string) => {
    switch (level) {
      case "low": return "#4CAF50";
      case "medium": return "#FF9800";
      case "high": return "#F44336";
      default: return "#9E9E9E";
    }
  };

  const getCrowdText = (level: string) => {
    switch (level) {
      case "low": return isEnglish ? "Not Crowded" : "한산함";
      case "medium": return isEnglish ? "Moderate" : "보통";
      case "high": return isEnglish ? "Very Crowded" : "매우 혼잡";
      default: return isEnglish ? "Unknown" : "정보 없음";
    }
  };

  const renderSpoonRating = (rating: number) => {
    const spoons = [];
    for (let i = 0; i < 3; i++) {
      spoons.push(
        <Typography
          key={i}
          sx={{
            fontSize: "16px",
            color: i < rating ? "#FFD700" : "#E0E0E0",
          }}
        >
          🥄
        </Typography>
      );
    }
    return spoons;
  };

  const getFilteredSpots = () => {
    if (!reservationStats) return [];
    
    switch (tabValue) {
      case 0: return reservationStats.hotSpots; // 전체
      case 1: return reservationStats.hotSpots.filter(spot => spot.category === "tourist");
      case 2: return reservationStats.hotSpots.filter(spot => spot.category === "restaurant");
      case 3: return reservationStats.hotSpots.filter(spot => spot.category === "shopping");
      case 4: return reservationStats.hotSpots.filter(spot => spot.category === "culture");
      case 5: return reservationStats.hotSpots.filter(spot => spot.travelLightCertified); // TL 인증
      default: return reservationStats.hotSpots;
    }
  };

  if (!reservationStats) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4, flex: 1, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {isEnglish ? "Loading hot spots..." : "핫플레이스 정보를 불러오는 중..."}
          </Typography>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {/* 헤더 */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
            <LocalFireDepartment sx={{ color: "#FF4444", mr: 1, fontSize: 32 }} />
            <Typography
              variant={isMobile ? "h4" : "h3"}
              sx={{ fontWeight: 700, background: "linear-gradient(45deg, #FF4444, #FF8800)", 
                   backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}
            >
              {isEnglish ? "Seoul Hot Spots" : "서울 실시간 핫플레이스"}
            </Typography>
          </Box>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {isEnglish 
              ? "Trending places based on real reservation data from TravelLight users" 
              : "TravelLight 사용자들의 실제 예약 데이터 기반 트렌딩 장소"}
          </Typography>
          
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Chip 
              icon={<TrendingUp />} 
              label={`${reservationStats.totalReservations.toLocaleString()} ${isEnglish ? 'reservations this month' : '이달의 예약'}`}
              color="primary" 
              variant="outlined"
            />
            <Chip 
              icon={<EmojiEvents />} 
              label={`${reservationStats.hotSpots.filter(spot => spot.travelLightCertified).length} ${isEnglish ? 'TL Certified' : 'TL 인증 맛집'}`}
              sx={{ 
                bgcolor: "#FFF8DC", 
                color: "#8B4513", 
                border: "1px solid #FFD700",
                fontWeight: 600 
              }}
            />
            <Chip 
              icon={<Visibility />} 
              label={`${isEnglish ? 'Updated' : '업데이트'} ${isEnglish ? '1 min ago' : '1분 전'}`}
              color="success" 
              variant="outlined"
            />
          </Box>
        </Box>

        {/* 트렌딩 지역 */}
        <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center" }}>
            <LocalFireDepartment sx={{ mr: 1, color: "#FF4444" }} />
            {isEnglish ? "Trending Areas" : "인기 급상승 지역"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {reservationStats.trendingAreas.map((area, index) => (
              <Chip
                key={area}
                label={`${index + 1}. ${area}`}
                color={index < 3 ? "error" : "default"}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>
        </Box>

        {/* 카테고리 탭 */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontSize: isMobile ? "0.875rem" : "1rem",
                fontWeight: 600,
              },
            }}
          >
            <Tab label={isEnglish ? "All" : "전체"} />
            <Tab label={isEnglish ? "Tourist Spots" : "관광지"} />
            <Tab label={isEnglish ? "Restaurants" : "맛집"} />
            <Tab label={isEnglish ? "Shopping" : "쇼핑"} />
            <Tab label={isEnglish ? "Culture" : "문화"} />
            <Tab 
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <EmojiEvents sx={{ fontSize: 16, color: "#FFD700" }} />
                  <Typography variant="inherit">
                    {isEnglish ? "TL Certified" : "TL 인증"}
                  </Typography>
                </Box>
              } 
            />
          </Tabs>
        </Box>

        {/* 핫스팟 목록 */}
        <Grid container spacing={3}>
          {getFilteredSpots().map((spot, index) => (
            <Grid item xs={12} sm={6} lg={4} key={spot.id}>
              <StyledCard onClick={() => handleSpotClick(spot)} sx={{ cursor: "pointer" }}>
                {spot.trendingScore > 90 && !spot.travelLightCertified && (
                  <HotBadge
                    icon={<LocalFireDepartment />}
                    label={isEnglish ? "HOT" : "핫"}
                    size="small"
                  />
                )}
                
                {spot.travelLightCertified && (
                  <TravelLightBadge
                    icon={<EmojiEvents />}
                    label={isEnglish ? "TL CERTIFIED" : "TL 인증"}
                    size="small"
                  />
                )}
                
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={spot.image}
                    alt={isEnglish ? spot.nameEn : spot.name}
                    sx={{ filter: "brightness(0.9)" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(spot.id);
                      }}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.9)",
                        "&:hover": { bgcolor: "rgba(255,255,255,1)" }
                      }}
                    >
                      <Favorite 
                        sx={{ 
                          color: favoriteSpots.includes(spot.id) ? "#FF4444" : "grey.400",
                          fontSize: 20
                        }} 
                      />
                    </IconButton>
                  </Box>
                  
                  {spot.nearbyLuggage && (
                    <Chip
                      label={isEnglish ? `Luggage storage ${spot.walkingDistance}min walk` : `짐보관 도보${spot.walkingDistance}분`}
                      size="small"
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        bgcolor: "primary.main",
                        color: "white",
                        fontSize: "0.75rem"
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      {isEnglish ? spot.nameEn : spot.name}
                    </Typography>
                    <Chip 
                      label={`#${index + 1}`}
                      size="small"
                      color="primary"
                      sx={{ minWidth: 40 }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, height: 40, overflow: "hidden", display: "-webkit-box", 
                         WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                  >
                    {isEnglish ? spot.descriptionEn : spot.description}
                  </Typography>

                  {/* 평점 및 리뷰 */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                    <Rating value={spot.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" color="text.secondary">
                      {spot.rating} ({spot.reviewCount.toLocaleString()})
                    </Typography>
                    
                    {spot.spoonRating && (
                      <SpoonRating>
                        {renderSpoonRating(spot.spoonRating)}
                        <Typography variant="caption" sx={{ color: "#8B4513", fontWeight: 600, ml: 0.5 }}>
                          {spot.spoonRating}{isEnglish ? " Spoon" : "티스푼"}
                        </Typography>
                      </SpoonRating>
                    )}
                  </Box>

                  {/* 혼잡도 */}
                  <CrowdMeter>
                    <People sx={{ fontSize: 16, color: getCrowdColor(spot.crowdLevel) }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {getCrowdText(spot.crowdLevel)}
                    </Typography>
                    {spot.avgWaitTime > 0 && (
                      <>
                        <AccessTime sx={{ fontSize: 14, ml: 1 }} />
                        <Typography variant="caption">
                          {spot.avgWaitTime}{isEnglish ? "min wait" : "분 대기"}
                        </Typography>
                      </>
                    )}
                  </CrowdMeter>

                  {/* 태그 */}
                  <Box sx={{ display: "flex", gap: 0.5, mt: 2, flexWrap: "wrap" }}>
                    {spot.tags.slice(0, 3).map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>

                  {/* 예약 수 */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {spot.reservationCount.toLocaleString()}{isEnglish ? " reservations" : "건 예약"}
                    </Typography>
                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                      {isEnglish ? "Updated" : "업데이트"} {spot.lastUpdated}
                    </Typography>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 상세 정보 다이얼로그 */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        {selectedSpot && (
          <>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {isEnglish ? selectedSpot.nameEn : selectedSpot.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1, flexWrap: "wrap", gap: 1 }}>
                  <Rating value={selectedSpot.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary">
                    {selectedSpot.rating} ({selectedSpot.reviewCount.toLocaleString()} {isEnglish ? "reviews" : "리뷰"})
                  </Typography>
                  
                  {selectedSpot.spoonRating && (
                    <SpoonRating>
                      {renderSpoonRating(selectedSpot.spoonRating)}
                      <Typography variant="caption" sx={{ color: "#8B4513", fontWeight: 600, ml: 0.5 }}>
                        {selectedSpot.spoonRating}{isEnglish ? " Spoon" : "티스푼"}
                      </Typography>
                    </SpoonRating>
                  )}
                </Box>
                
                {selectedSpot.travelLightCertified && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: "linear-gradient(45deg, #FFF8DC, #F0F8FF)", 
                    borderRadius: 2,
                    border: "2px solid #FFD700",
                    background: "linear-gradient(135deg, #FFF8DC 0%, #F0F8FF 100%)"
                  }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <EmojiEvents sx={{ color: "#FFD700", mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#8B4513" }}>
                        {isEnglish ? "TravelLight Certified Restaurant" : "트래블라이트 선정 맛집"}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "#8B4513", mb: 1 }}>
                      {isEnglish 
                        ? `${selectedSpot.spoonRating}-Spoon Rating • Certified ${selectedSpot.certificationYear}`
                        : `${selectedSpot.spoonRating}티스푼 등급 • ${selectedSpot.certificationYear}년 선정`
                      }
                    </Typography>
                    {selectedSpot.specialDish && (
                      <Typography variant="body2" sx={{ color: "#8B4513", fontWeight: 600 }}>
                        {isEnglish ? "Signature Dish: " : "대표 메뉴: "}{selectedSpot.specialDish}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
              <IconButton onClick={handleCloseDialog}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <img 
                  src={selectedSpot.image} 
                  alt={isEnglish ? selectedSpot.nameEn : selectedSpot.name}
                  style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "8px" }}
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 3 }}>
                {isEnglish ? selectedSpot.descriptionEn : selectedSpot.description}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                      {isEnglish ? "Location" : "위치"}
                    </Typography>
                    <Typography variant="body2">
                      {isEnglish ? selectedSpot.location.addressEn : selectedSpot.location.address}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                      {isEnglish ? "Hours" : "운영시간"}
                    </Typography>
                    <Typography variant="body2">
                      {selectedSpot.openingHours}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      <People sx={{ fontSize: 16, mr: 0.5 }} />
                      {isEnglish ? "Crowd Level" : "혼잡도"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: getCrowdColor(selectedSpot.crowdLevel),
                          mr: 1
                        }}
                      />
                      <Typography variant="body2">
                        {getCrowdText(selectedSpot.crowdLevel)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      💰 {isEnglish ? "Price Range" : "가격대"}
                    </Typography>
                    <Typography variant="body2">
                      {selectedSpot.priceRange}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* 팁 */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  💡 {isEnglish ? "Local Tips" : "현지 팁"}
                </Typography>
                {selectedSpot.tips.map((tip, index) => (
                  <Box key={index} sx={{ display: "flex", mb: 1 }}>
                    <Typography variant="body2" color="primary.main" sx={{ mr: 1 }}>•</Typography>
                    <Typography variant="body2">{tip}</Typography>
                  </Box>
                ))}
              </Box>

              {/* 태그 */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  🏷️ {isEnglish ? "Tags" : "태그"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedSpot.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
              <Button
                variant="contained"
                startIcon={<Map />}
                onClick={() => window.open(`https://maps.google.com/?q=${selectedSpot.location.lat},${selectedSpot.location.lng}`, '_blank')}
                sx={{ mr: 1 }}
              >
                {isEnglish ? "View on Map" : "지도에서 보기"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<BookmarkAdd />}
                onClick={() => toggleFavorite(selectedSpot.id)}
                color={favoriteSpots.includes(selectedSpot.id) ? "error" : "primary"}
              >
                {favoriteSpots.includes(selectedSpot.id) 
                  ? (isEnglish ? "Saved" : "저장됨")
                  : (isEnglish ? "Save" : "저장")
                }
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 플로팅 버튼 */}
      <Tooltip title={isEnglish ? "View on Map" : "지도에서 보기"}>
        <FloatingButton color="primary" onClick={() => window.open('/map', '_blank')}>
          <Map />
        </FloatingButton>
      </Tooltip>

      <Footer />
    </Box>
  );
};

export default HotSpots;