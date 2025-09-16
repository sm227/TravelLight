import React from 'react';
import {
  Box,
  Typography,
  Rating,
  LinearProgress,
  Chip,
  Grid
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ReviewSummary as ReviewSummaryType } from '../../services/api';

interface ReviewSummaryProps {
  summary: ReviewSummaryType;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ summary }) => {
  const { t } = useTranslation();
  const { averageRating, totalReviews, ratingDistribution } = summary;

  const getRatingPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  const ratingData = [
    { rating: 5, count: ratingDistribution.rating5Count },
    { rating: 4, count: ratingDistribution.rating4Count },
    { rating: 3, count: ratingDistribution.rating3Count },
    { rating: 2, count: ratingDistribution.rating2Count },
    { rating: 1, count: ratingDistribution.rating1Count },
  ];

  return (
    <Box sx={{ 
      p: 2, 
      backgroundColor: '#ffffff', 
      borderRadius: 2, 
      mb: 2,
      border: '1px solid #e0e0e0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    }}>
      <Grid container spacing={2} alignItems="center">
        {/* 전체 평점 */}
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="primary" fontWeight="bold" sx={{ lineHeight: 1, mb: 0.5 }}>
              {averageRating.toFixed(1)}
            </Typography>
            <Rating value={averageRating} readOnly precision={0.1} size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.9rem' }}>
              {t('reviewsCountSimple', { count: totalReviews })}
            </Typography>
          </Box>
        </Grid>

        {/* 평점별 분포 - 간소화 */}
        <Grid item xs={12} sm={8}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: 0.8,
            textAlign: 'center'
          }}>
            {ratingData.map(({ rating, count }) => (
              <Box key={rating} sx={{ 
                py: 0.8,
                px: 0.5,
                backgroundColor: count > 0 ? '#f8f9fa' : '#fafafa',
                borderRadius: 1.5,
                border: count > 0 ? '1px solid #dee2e6' : '1px solid #f1f3f4',
                minHeight: '52px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                '&:hover': count > 0 ? {
                  backgroundColor: '#e9ecef',
                  transform: 'translateY(-1px)'
                } : {}
              }}>
                <Typography variant="caption" sx={{ 
                  fontWeight: 600, 
                  color: count > 0 ? '#495057' : '#adb5bd',
                  fontSize: '0.7rem',
                  lineHeight: 1,
                  mb: 0.3
                }}>
                  {rating}★
                </Typography>
                <Typography sx={{ 
                  fontWeight: 'bold', 
                  color: count > 0 ? '#212529' : '#ced4da',
                  fontSize: '1.1rem',
                  lineHeight: 1
                }}>
                  {count}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* 평점 요약 태그 - 항상 표시 */}
      <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        {totalReviews === 0 ? (
          <Chip label={t('waitingFirstReview')} color="default" size="small" variant="outlined" />
        ) : (
          <>
            {averageRating >= 4.5 && (
              <Chip label={t('verySatisfied')} color="success" size="small" />
            )}
            {averageRating >= 4.0 && averageRating < 4.5 && (
              <Chip label={t('satisfied')} color="primary" size="small" />
            )}
            {averageRating >= 3.0 && averageRating < 4.0 && (
              <Chip label={t('average')} color="default" size="small" />
            )}
            {averageRating < 3.0 && (
              <Chip label={t('needsImprovement')} color="warning" size="small" />
            )}
            
            {totalReviews >= 10 && (
              <Chip label={t('reviewsCount', { count: totalReviews })} color="info" size="small" variant="outlined" />
            )}
            {totalReviews < 10 && totalReviews > 0 && (
              <Chip label={t('reviewsCountDefault', { count: totalReviews })} color="default" size="small" variant="outlined" />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ReviewSummary;
