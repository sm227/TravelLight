import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  Chip,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { Star } from '@mui/icons-material';
import { PlaceReviewSummary, reviewService, partnershipService } from '../../services/api';

interface TopRatedPlacesProps {
  limit?: number;
  title?: string;
}

const TopRatedPlaces: React.FC<TopRatedPlacesProps> = ({ 
  limit = 6, 
  title = "추천 제휴점" 
}) => {
  const [places, setPlaces] = useState<PlaceReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopRatedPlaces();
  }, [limit]);

  const fetchTopRatedPlaces = async () => {
    try {
      setLoading(true);
      
      // 먼저 리뷰가 있는 상위 평점 제휴점을 시도
      try {
        const response = await reviewService.getTopRatedPlaces(limit);
        if (response.data && response.data.length > 0) {
          setPlaces(response.data);
          return;
        }
      } catch (reviewError) {
        console.log('리뷰 기반 제휴점 조회 실패, 전체 제휴점으로 대체');
      }
      
      // 리뷰가 없으면 전체 제휴점 목록에서 표시
      const partnershipsResponse = await partnershipService.getAllPartnerships();
      const partnerships = partnershipsResponse.data || [];
      
      // 제휴점을 PlaceReviewSummary 형태로 변환
      const fallbackPlaces: PlaceReviewSummary[] = partnerships
        .filter(p => p.status === 'APPROVED')
        .slice(0, limit)
        .map(p => ({
          placeName: p.businessName,
          placeAddress: p.address,
          averageRating: 0,
          reviewCount: 0,
          recommendationScore: 0
        }));
      
      setPlaces(fallbackPlaces);
    } catch (error) {
      console.error('제휴점 조회 실패:', error);
      setError('추천 제휴점을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (places.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          추천할 제휴점이 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Star color="primary" />
        {title}
      </Typography>

      <Grid container spacing={2}>
        {places.map((place, index) => (
          <Grid item xs={12} sm={6} md={4} key={`${place.placeName}-${place.placeAddress}`}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {/* 순위 표시 */}
              {index < 3 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : '#CD7F32',
                    color: 'white',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    zIndex: 1
                  }}
                >
                  {index + 1}
                </Box>
              )}

              <CardContent>
                <Typography variant="h6" sx={{ mb: 1, pr: index < 3 ? 4 : 0 }}>
                  {place.placeName}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {place.placeAddress}
                </Typography>

                {place.reviewCount > 0 ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={place.averageRating} readOnly precision={0.1} size="small" />
                      <Typography variant="body1" fontWeight="bold" sx={{ ml: 1 }}>
                        {place.averageRating.toFixed(1)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        리뷰 {place.reviewCount}개
                      </Typography>
                      <Chip 
                        label={`추천도 ${place.recommendationScore.toFixed(1)}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    {/* 평점 범위별 라벨 */}
                    <Box sx={{ mt: 1 }}>
                      {place.averageRating >= 4.5 && (
                        <Chip label="최고" color="success" size="small" />
                      )}
                      {place.averageRating >= 4.0 && place.averageRating < 4.5 && (
                        <Chip label="우수" color="primary" size="small" />
                      )}
                      {place.averageRating >= 3.5 && place.averageRating < 4.0 && (
                        <Chip label="양호" color="default" size="small" />
                      )}
                      
                      {place.reviewCount >= 20 && (
                        <Chip label="검증된" color="info" size="small" sx={{ ml: 0.5 }} />
                      )}
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={0} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        아직 리뷰 없음
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Chip 
                        label="신규 제휴점"
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 더보기 안내 */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          평점과 리뷰 수를 종합하여 산출된 추천 순위입니다
        </Typography>
      </Box>
    </Box>
  );
};

export default TopRatedPlaces;
