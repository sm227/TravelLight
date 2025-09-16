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
import { useTranslation } from 'react-i18next';
import { PlaceReviewSummary, reviewService, partnershipService } from '../../services/api';

interface TopRatedPlacesProps {
  limit?: number;
  title?: string;
}

const TopRatedPlaces: React.FC<TopRatedPlacesProps> = ({ 
  limit = 6, 
  title 
}) => {
  const { t } = useTranslation();
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
      setError(t('loadingPartnersFailed'));
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
          {t('noRecommendedPartners')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Star color="primary" />
        {title || t('recommendedPartners')}
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
                        {t('reviewText')} {place.reviewCount}{t('reviewCount')}
                      </Typography>
                      <Chip 
                        label={`${t('recommendationScore')} ${place.recommendationScore.toFixed(1)}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    {/* 평점 범위별 라벨 */}
                    <Box sx={{ mt: 1 }}>
                      {place.averageRating >= 4.5 && (
                        <Chip label={t('ratingExcellent')} color="success" size="small" />
                      )}
                      {place.averageRating >= 4.0 && place.averageRating < 4.5 && (
                        <Chip label={t('ratingGood')} color="primary" size="small" />
                      )}
                      {place.averageRating >= 3.5 && place.averageRating < 4.0 && (
                        <Chip label={t('ratingFair')} color="default" size="small" />
                      )}
                      
                      {place.reviewCount >= 20 && (
                        <Chip label={t('verified')} color="info" size="small" sx={{ ml: 0.5 }} />
                      )}
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={0} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {t('noReviewsYet')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Chip 
                        label={t('newPartner')}
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
          {t('rankingDescription')}
        </Typography>
      </Box>
    </Box>
  );
};

export default TopRatedPlaces;
