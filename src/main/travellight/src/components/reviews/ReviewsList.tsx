import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import ReviewSummary from './ReviewSummary';
import { 
  ReviewResponse, 
  ReviewSummary as ReviewSummaryType,
  reviewService 
} from '../../services/api';

interface ReviewsListProps {
  placeName: string;
  placeAddress: string;
  currentUserId?: number;
  canWriteReview?: boolean;
  reservationId?: number;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  placeName,
  placeAddress,
  currentUserId,
  canWriteReview = false,
  reservationId
}) => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [summary, setSummary] = useState<ReviewSummaryType | null>(null);
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  const pageSize = 10;

  useEffect(() => {
    fetchReviews();
    fetchSummary();
  }, [placeName, placeAddress, sortBy, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getPlaceReviews(
        placeName,
        placeAddress,
        sortBy,
        currentPage - 1,
        pageSize
      );
      
      setReviews(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('리뷰 목록 조회 실패:', error);
      setError('리뷰를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await reviewService.getPlaceReviewSummary(placeName, placeAddress);
      setSummary(response.data);
    } catch (error) {
      console.error('리뷰 요약 조회 실패:', error);
    }
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleReviewSubmit = (review: ReviewResponse) => {
    // 새 리뷰 작성 또는 수정 후 목록 새로고침
    fetchReviews();
    fetchSummary();
    setReviewFormOpen(false);
    setEditingReview(null);
  };

  const handleEditReview = (review: ReviewResponse) => {
    setEditingReview(review);
    setReviewFormOpen(true);
  };

  const handleDeleteReview = (reviewId: number) => {
    setDeletingReviewId(reviewId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteReview = async () => {
    if (!deletingReviewId) return;

    try {
      await reviewService.deleteReview(deletingReviewId);
      fetchReviews();
      fetchSummary();
      setDeleteDialogOpen(false);
      setDeletingReviewId(null);
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      alert('리뷰 삭제에 실패했습니다.');
    }
  };

  const handleWriteReview = () => {
    setEditingReview(null);
    setReviewFormOpen(true);
  };

  if (loading && reviews.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 리뷰 요약 */}
      {summary && <ReviewSummary summary={summary} />}

      {/* 액션 버튼 및 정렬 - 간소화 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 1.5,
        p: 1.5,
        backgroundColor: '#fafafa',
        borderRadius: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
            리뷰 ({summary?.totalReviews || 0})
          </Typography>
          
          {canWriteReview && currentUserId && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleWriteReview}
              size="small"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              리뷰 작성
            </Button>
          )}
        </Box>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>정렬</InputLabel>
          <Select 
            value={sortBy} 
            onChange={handleSortChange} 
            label="정렬"
            sx={{
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0'
              }
            }}
          >
            <MenuItem value="latest">최신순</MenuItem>
            <MenuItem value="rating">평점순</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 리뷰 목록 */}
      {reviews.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          border: '1px dashed #d0d7de'
        }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            📝 아직 리뷰가 없습니다
          </Typography>
          {canWriteReview && currentUserId && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleWriteReview}
              size="small"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              첫 리뷰 작성
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ 
          '& > *': { 
            mb: 2,
            '&:last-child': {
              mb: 0
            }
          }
        }}>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onUpdate={fetchReviews}
            />
          ))}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}

      {/* 리뷰 작성/수정 폼 */}
      <ReviewForm
        open={reviewFormOpen}
        onClose={() => {
          setReviewFormOpen(false);
          setEditingReview(null);
        }}
        onSubmit={handleReviewSubmit}
        reservationId={reservationId}
        editingReview={editingReview}
        placeName={placeName}
        placeAddress={placeAddress}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>리뷰 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 이 리뷰를 삭제하시겠습니까? 삭제된 리뷰는 복구할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={confirmDeleteReview} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewsList;
