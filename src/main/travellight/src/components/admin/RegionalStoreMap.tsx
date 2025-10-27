import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  alpha,
  CircularProgress,
  Stack,
  Drawer,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  StorefrontOutlined,
  LocationOn,
  LuggageOutlined,
  Close as CloseIcon,
  Map as MapIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// AdminDashboard와 동일한 색상 테마
const COLORS = {
  backgroundDark: '#0f0f11',
  backgroundLight: '#18181b',
  backgroundCard: '#1f1f23',
  backgroundSurface: '#27272a',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  borderPrimary: '#27272a',
  borderSecondary: '#3f3f46',
  accentPrimary: '#3b82f6',
  accentSecondary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  backgroundHover: 'rgba(255, 255, 255, 0.05)',
};

// 권역별 색상 정의 (Python 코드와 동일)
const REGION_COLORS: { [key: string]: string } = {
  'Seoul': '#E31A1C',           // 서울: 빨강
  'Gyeonggi': '#33A02C',        // 경기권: 초록
  'Gangwon': '#1F78B4',         // 강원권: 파랑
  'Chungcheong': '#6A3D9A',     // 충청권: 보라
  'Jeolla': '#FF7F00',          // 전라권: 주황
  'Gyeongsang': '#A6CEE3',      // 경상권: 하늘색
  'Jeju': '#FDBF6F'             // 제주권: 살구색
};

// Python 코드와 동일한 매핑 (영문 -> 한글)
const REGION_NAME_KR: { [key: string]: string } = {
  'Seoul': '서울',
  'Gyeonggi': '경기권',
  'Gangwon': '강원권',
  'Chungcheong': '충청권',
  'Jeolla': '전라권',
  'Gyeongsang': '경상권',
  'Jeju': '제주권'
};

// Python 코드와 동일한 매핑 규칙
const PROVINCE_MAPPING: { [key: string]: string } = {
  'Seoul': 'Seoul',
  'Busan': 'Gyeongsang',
  'Daegu': 'Gyeongsang',
  'Incheon': 'Gyeonggi',
  'Gwangju': 'Jeolla',
  'Daejeon': 'Chungcheong',
  'Ulsan': 'Gyeongsang',
  'Gyeonggi-do': 'Gyeonggi',
  'Gangwon-do': 'Gangwon',
  'Chungcheongbuk-do': 'Chungcheong',
  'Chungcheongnam-do': 'Chungcheong',
  'Jeollabuk-do': 'Jeolla',
  'Jeollanam-do': 'Jeolla',
  'Gyeongsangbuk-do': 'Gyeongsang',
  'Gyeongsangnam-do': 'Gyeongsang',
  'Jeju-do': 'Jeju',
  'Sejongsi': 'Chungcheong'
};

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  smallBagsAvailable: number;
  mediumBagsAvailable: number;
  largeBagsAvailable: number;
}

interface GeoJsonFeature {
  type: string;
  properties: {
    name_eng: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any;
  };
}

interface RegionData {
  region: string;
  regionKr: string;
  paths: string[];
  center: [number, number];
}

// 주소를 기반으로 권역 매핑
const getRegionFromAddress = (address: string): string => {
  if (!address) return '기타';
  
  const addr = address.toLowerCase();
  
  if (addr.includes('서울')) return '서울';
  if (addr.includes('인천') || addr.includes('경기')) return '경기권';
  if (addr.includes('강원')) return '강원권';
  if (addr.includes('충북') || addr.includes('충남') || 
      addr.includes('대전') || addr.includes('세종')) return '충청권';
  if (addr.includes('전북') || addr.includes('전남') || 
      addr.includes('광주')) return '전라권';
  if (addr.includes('경북') || addr.includes('경남') || 
      addr.includes('부산') || addr.includes('대구') || 
      addr.includes('울산')) return '경상권';
  if (addr.includes('제주')) return '제주권';
  
  return '기타';
};

// GeoJSON 좌표를 SVG path로 변환
const coordinatesToPath = (coordinates: any, type: string): string => {
  // 한국의 경위도 범위 (제주도 포함)
  const minLng = 124.5;
  const maxLng = 131.5;
  const minLat = 33.0;  // 제주도 포함
  const maxLat = 38.8;
  
  // SVG 영역 (여백 최소화)
  const svgWidth = 500;
  const svgHeight = 700;
  const padding = 10; // 상단 여백 줄임
  const bottomPadding = 60; // 하단 여백 줄임
  const sidePadding = 15; // 좌우 여백 줄임
  const mapHeight = svgHeight - padding - bottomPadding;
  const mapWidth = svgWidth - (sidePadding * 2);
  
  const coordToSVG = (coord: [number, number]): string => {
    const lng = coord[0];
    const lat = coord[1];
    
    // 경위도를 SVG 좌표로 변환
    const x = ((lng - minLng) / (maxLng - minLng)) * mapWidth + sidePadding;
    const y = ((maxLat - lat) / (maxLat - minLat)) * mapHeight + padding;
    
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  };

  if (type === 'Polygon') {
    return coordinates.map((ring: any) => {
      const pathData = ring.map((coord: [number, number], i: number) => {
        const point = coordToSVG(coord);
        return i === 0 ? `M ${point}` : `L ${point}`;
      }).join(' ');
      return pathData + ' Z';
    }).join(' ');
  } else if (type === 'MultiPolygon') {
    return coordinates.map((polygon: any) => {
      return polygon.map((ring: any) => {
        const pathData = ring.map((coord: [number, number], i: number) => {
          const point = coordToSVG(coord);
          return i === 0 ? `M ${point}` : `L ${point}`;
        }).join(' ');
        return pathData + ' Z';
      }).join(' ');
    }).join(' ');
  }
  
  return '';
};

// Path의 중심점 계산
const calculatePathCenter = (pathData: string): [number, number] => {
  const coords = pathData.match(/[\d.]+,[\d.]+/g);
  if (!coords || coords.length === 0) return [250, 350];
  
  let sumX = 0, sumY = 0;
  coords.forEach(coord => {
    const [x, y] = coord.split(',').map(Number);
    sumX += x;
    sumY += y;
  });
  
  return [sumX / coords.length, sumY / coords.length];
};

const RegionalStoreMap: React.FC = () => {
  const navigate = useNavigate();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [mapLoading, setMapLoading] = useState(true);

  // GeoJSON 데이터 로드 및 처리 (Python 코드와 동일한 로직)
  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        const response = await fetch('/skorea_provinces_geo_simple.json');
        const geoJson = await response.json();
        
        // Python 코드의 그룹화 로직 구현
        const regionMap: { [key: string]: GeoJsonFeature[] } = {};
        
        geoJson.features.forEach((feature: GeoJsonFeature) => {
          const provinceName = feature.properties.name_eng;
          const region = PROVINCE_MAPPING[provinceName];
          
          if (region) {
            if (!regionMap[region]) {
              regionMap[region] = [];
            }
            regionMap[region].push(feature);
          }
        });
        
        // 각 권역별로 path 생성
        const processedRegions: RegionData[] = [];
        
        Object.entries(regionMap).forEach(([region, features]) => {
          const paths: string[] = [];
          
          features.forEach(feature => {
            const path = coordinatesToPath(
              feature.geometry.coordinates,
              feature.geometry.type
            );
            if (path) {
              paths.push(path);
            }
          });
          
          // 모든 path를 합쳐서 중심점 계산
          const allPaths = paths.join(' ');
          const center = calculatePathCenter(allPaths);
          
          processedRegions.push({
            region,
            regionKr: REGION_NAME_KR[region],
            paths,
            center
          });
        });
        
        setRegionData(processedRegions);
        setMapLoading(false);
      } catch (error) {
        console.error('GeoJSON 로드 실패:', error);
        setMapLoading(false);
      }
    };
    
    loadGeoJson();
  }, []);

  useEffect(() => {
    fetchPartnerships();
  }, []);

  const fetchPartnerships = async () => {
    try {
      const response = await axios.get('/api/partnership');
      if (response.data.success) {
        // 승인된 제휴점만 필터링
        const approved = response.data.data.filter((p: Partnership) => p.status === 'APPROVED');
        setPartnerships(approved);
      }
    } catch (error) {
      console.error('제휴점 정보를 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  // 권역별로 제휴점 그룹화
  const groupedByRegion = partnerships.reduce((acc, partnership) => {
    const region = getRegionFromAddress(partnership.address);
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(partnership);
    return acc;
  }, {} as { [key: string]: Partnership[] });

  // 선택된 권역의 제휴점들
  const selectedStores = selectedRegion ? groupedByRegion[selectedRegion] || [] : [];

  // 권역별 통계 (서울 우선, 나머지는 이름순)
  const regionStats = regionData.map(({ regionKr }) => {
    const stores = groupedByRegion[regionKr] || [];
    const totalCapacity = stores.reduce((sum, store) => 
      sum + (store.smallBagsAvailable || 0) + (store.mediumBagsAvailable || 0) + (store.largeBagsAvailable || 0), 0);
    
    return {
      region: regionKr,
      storeCount: stores.length,
      totalCapacity,
      stores
    };
  }).sort((a, b) => {
    // 서울을 맨 위로
    if (a.region === '서울') return -1;
    if (b.region === '서울') return 1;
    // 나머지는 이름순
    return a.region.localeCompare(b.region, 'ko');
  });

  const handleRegionClick = (region: string) => {
    setSelectedRegion(region);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedRegion(null), 300);
  };

  if (loading || mapLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        bgcolor: COLORS.backgroundDark
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: COLORS.accentPrimary, mb: 2 }} />
          <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.875rem' }}>
            {mapLoading ? '지도 데이터 로딩 중...' : '매장 정보 로딩 중...'}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: COLORS.backgroundDark, minHeight: '100vh', p: 2.5 }}>
      {/* 헤더 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: `1px solid ${COLORS.borderPrimary}`
      }}>
        <Box>
          <Typography variant="h5" sx={{ 
            color: COLORS.textPrimary, 
            fontWeight: 600,
            fontSize: '1.25rem',
            mb: 0.25,
            letterSpacing: '-0.025em',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <MapIcon sx={{ fontSize: '1.5rem', color: COLORS.accentPrimary }} />
            권역별 매장 현황 지도
          </Typography>
          <Typography variant="body2" sx={{ 
            color: COLORS.textSecondary,
            fontSize: '0.75rem',
            fontWeight: 500
          }}>
            전국 7개 권역 · 총 {partnerships.length}개 매장 운영중 · 지도에서 권역을 클릭하세요
          </Typography>
        </Box>
      </Box>

      {/* 지도 영역 */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* 한국 지도 (실제 GeoJSON 기반) */}
        <Paper 
          elevation={0} 
          sx={{ 
            flex: 1,
            bgcolor: COLORS.backgroundCard, 
            border: `1px solid ${COLORS.borderPrimary}`,
            borderRadius: 0,
            p: 2,
            minHeight: '850px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '800px', position: 'relative' }}>
            <svg 
              viewBox="0 0 500 700"
              preserveAspectRatio="xMidYMid meet"
              style={{ 
                width: '100%', 
                height: 'auto',
                maxHeight: '900px',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
              }}
            >
              {/* 배경 */}
              <rect width="500" height="700" fill={COLORS.backgroundLight} />
              
              {/* 권역들 - 실제 GeoJSON 데이터 기반 */}
              {regionData.map((data) => {
                const region = data.regionKr;
                const isHovered = hoveredRegion === region;
                const isSelected = selectedRegion === region;
                
                return (
                  <g key={data.region}>
                    {/* 권역 영역 (실제 지도 모양) */}
                    {data.paths.map((path, idx) => (
                      <path
                        key={idx}
                        d={path}
                        fill="transparent"
                        stroke={REGION_COLORS[data.region]}
                        strokeWidth={isSelected ? 1.5 : isHovered ? 1.2 : 1}
                        strokeLinejoin="round"
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={() => setHoveredRegion(region)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        onClick={() => handleRegionClick(region)}
                      />
                    ))}
                    
                    {/* 권역 이름만 깔끔하게 표시 */}
                    <g style={{ pointerEvents: 'none' }}>
                      <text
                        x={region === '경기권' ? data.center[0] - 10 : data.center[0]}
                        y={region === '경기권' ? data.center[1] - 20 : data.center[1] + 5}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={region === '서울' ? '16' : region === '경기권' ? '17' : region === '제주권' ? '16' : '19'}
                        fontWeight="bold"
                        style={{ 
                          textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                          userSelect: 'none',
                          letterSpacing: '0.03em'
                        }}
                      >
                        {region}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </Box>
        </Paper>

        {/* 통계 패널 (데스크톱 뷰) */}
        <Box sx={{ 
          width: { xs: '100%', lg: '320px' },
          display: { xs: 'none', lg: 'block' }
        }}>
          <Paper 
            elevation={0} 
            sx={{ 
              bgcolor: COLORS.backgroundCard, 
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 0,
              p: 2,
              mb: 2
            }}
          >
            <Typography variant="h6" sx={{ 
              color: COLORS.textPrimary,
              mb: 2,
              fontWeight: 600,
              fontSize: '1rem'
            }}>
              📊 권역별 통계
            </Typography>
            
            <Stack spacing={1.5}>
              {regionStats.map(({ region, storeCount, totalCapacity }) => {
                const regionEng = Object.keys(REGION_NAME_KR).find(k => REGION_NAME_KR[k] === region);
                return (
                  <Box 
                    key={region}
                    onClick={() => handleRegionClick(region)}
                    sx={{
                      p: 1.5,
                      bgcolor: 'transparent',
                      border: `2px solid #ffffff`,
                      borderRadius: 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha('#ffffff', 0.05),
                        transform: 'translateX(4px)',
                        borderColor: '#ffffff'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ 
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}>
                        {region}
                      </Typography>
                      <LocationOn sx={{ 
                        fontSize: '1rem', 
                        color: REGION_COLORS[regionEng || '']
                      }} />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ 
                        color: '#ffffff',
                        fontSize: '0.75rem'
                      }}>
                        {storeCount}개 매장 · {totalCapacity}개 용량
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Box>
      </Box>

      {/* 매장 상세 정보 Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: '500px', md: '600px' },
            bgcolor: COLORS.backgroundDark,
            borderLeft: selectedRegion ? `1px solid ${alpha(REGION_COLORS[Object.keys(REGION_NAME_KR).find(k => REGION_NAME_KR[k] === selectedRegion) || ''], 0.3)}` : 'none'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Drawer 헤더 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            pb: 2,
            borderBottom: selectedRegion ? `1px solid ${alpha(REGION_COLORS[Object.keys(REGION_NAME_KR).find(k => REGION_NAME_KR[k] === selectedRegion) || ''], 0.3)}` : `1px solid ${COLORS.borderPrimary}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ 
                color: selectedRegion ? alpha(REGION_COLORS[Object.keys(REGION_NAME_KR).find(k => REGION_NAME_KR[k] === selectedRegion) || ''], 0.6) : COLORS.accentPrimary,
                fontSize: '1.5rem'
              }} />
              <Box>
                <Typography variant="h6" sx={{ 
                  color: COLORS.textPrimary,
                  fontWeight: 700,
                  fontSize: '1.1rem'
                }}>
                  {selectedRegion} 지역 매장
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: COLORS.textSecondary,
                  fontSize: '0.75rem'
                }}>
                  총 {selectedStores.length}개 매장 운영중
                </Typography>
              </Box>
            </Box>
            
            <IconButton 
              onClick={handleCloseDrawer}
              sx={{ 
                color: COLORS.textSecondary,
                '&:hover': { 
                  bgcolor: COLORS.backgroundHover,
                  color: COLORS.textPrimary
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 매장 목록 */}
          {selectedStores.length > 0 ? (
            <Stack spacing={2}>
              {selectedStores.map((store) => {
                const totalCap = (store.smallBagsAvailable || 0) + 
                                (store.mediumBagsAvailable || 0) + 
                                (store.largeBagsAvailable || 0);
                const regionEng = Object.keys(REGION_NAME_KR).find(k => REGION_NAME_KR[k] === selectedRegion);
                
                return (
                  <Paper
                    key={store.id}
                    elevation={0}
                    onClick={() => navigate(`/admin/partnerships/${store.id}`)}
                    sx={{
                      bgcolor: COLORS.backgroundCard,
                      border: `2px solid #ffffff`,
                      borderRadius: 0,
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha('#ffffff', 0.05),
                        borderColor: '#ffffff',
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                      <StorefrontOutlined sx={{ 
                        color: '#ffffff',
                        fontSize: '1.5rem',
                        mt: 0.5
                      }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ 
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '1rem',
                          mb: 0.5
                        }}>
                          {store.businessName}
                        </Typography>
                        <Typography sx={{ 
                          color: '#ffffff',
                          fontSize: '0.8125rem',
                          mb: 0.5
                        }}>
                          {store.address}
                        </Typography>
                        <Chip
                          label={store.businessType}
                          size="small"
                          sx={{
                            bgcolor: 'transparent',
                            color: '#ffffff',
                            border: '1px solid #ffffff',
                            fontSize: '0.7rem',
                            height: 22
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2,
                      pt: 2,
                      borderTop: `1px solid #ffffff`
                    }}>
                      <Tooltip title="소형 가방">
                        <Box sx={{ 
                          flex: 1,
                          textAlign: 'center',
                          p: 1,
                          bgcolor: 'transparent',
                          border: '1px solid #ffffff',
                          borderRadius: 0
                        }}>
                          <Typography sx={{ 
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            mb: 0.5
                          }}>
                            소형
                          </Typography>
                          <Typography sx={{ 
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '1rem'
                          }}>
                            {store.smallBagsAvailable || 0}
                          </Typography>
                        </Box>
                      </Tooltip>

                      <Tooltip title="중형 가방">
                        <Box sx={{ 
                          flex: 1,
                          textAlign: 'center',
                          p: 1,
                          bgcolor: 'transparent',
                          border: '1px solid #ffffff',
                          borderRadius: 0
                        }}>
                          <Typography sx={{ 
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            mb: 0.5
                          }}>
                            중형
                          </Typography>
                          <Typography sx={{ 
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '1rem'
                          }}>
                            {store.mediumBagsAvailable || 0}
                          </Typography>
                        </Box>
                      </Tooltip>

                      <Tooltip title="대형 가방">
                        <Box sx={{ 
                          flex: 1,
                          textAlign: 'center',
                          p: 1,
                          bgcolor: 'transparent',
                          border: '1px solid #ffffff',
                          borderRadius: 0
                        }}>
                          <Typography sx={{ 
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            mb: 0.5
                          }}>
                            대형
                          </Typography>
                          <Typography sx={{ 
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '1rem'
                          }}>
                            {store.largeBagsAvailable || 0}
                          </Typography>
                        </Box>
                      </Tooltip>

                      <Tooltip title="총 용량">
                        <Box sx={{ 
                          flex: 1,
                          textAlign: 'center',
                          p: 1,
                          bgcolor: 'transparent',
                          border: '1px solid #ffffff',
                          borderRadius: 0
                        }}>
                          <Typography sx={{ 
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            mb: 0.5
                          }}>
                            총계
                          </Typography>
                          <Typography sx={{ 
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '1rem'
                          }}>
                            {totalCap}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              color: COLORS.textSecondary 
            }}>
              <StorefrontOutlined sx={{ fontSize: '3rem', mb: 2, color: COLORS.textMuted }} />
              <Typography variant="h6" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                이 지역에는 아직 매장이 없습니다
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
                제휴점 승인 후 이곳에 표시됩니다.
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* 데이터가 없을 때 */}
      {partnerships.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: COLORS.textSecondary 
        }}>
          <StorefrontOutlined sx={{ fontSize: '3rem', mb: 2, color: COLORS.textMuted }} />
          <Typography variant="h6" sx={{ color: COLORS.textSecondary, mb: 1 }}>
            운영중인 매장이 없습니다
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
            제휴점 승인 후 이곳에 표시됩니다.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RegionalStoreMap;

