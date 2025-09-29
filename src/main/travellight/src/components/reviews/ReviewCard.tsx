import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
  Avatar,
  IconButton,
  Button,
  Chip,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Report,
  MoreVert,
  Edit,
  Delete,
  Close as CloseIcon
} from '@mui/icons-material';
import { ReviewResponse, ReviewReportRequest, reviewService } from '../../services/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ReviewCardProps {
  review: ReviewResponse;
  currentUserId?: number;
  onEdit?: (review: ReviewResponse) => void;
  onDelete?: (reviewId: number) => void;
  onUpdate?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onUpdate
}) => {
  const [isHelpful, setIsHelpful] = useState(review.isHelpfulByCurrentUser || false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [isReported, setIsReported] = useState(review.isReportedByCurrentUser || false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDescription, setReportDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // props 변화 감지하여 상태 업데이트
  useEffect(() => {
    setIsHelpful(review.isHelpfulByCurrentUser || false);
    setHelpfulCount(review.helpfulCount);
    setIsReported(review.isReportedByCurrentUser || false);
  }, [review.isHelpfulByCurrentUser, review.helpfulCount, review.isReportedByCurrentUser]);

  const handleHelpfulToggle = async () => {
    try {
      setLoading(true);
      const response = await reviewService.toggleHelpful(review.id);
      setIsHelpful(response.data);
      setHelpfulCount(prev => response.data ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('도움이 됨 토글 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      setError('신고 사유를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      const reportRequest: ReviewReportRequest = {
        reason: reportReason as any,
        description: reportDescription
      };
      
      await reviewService.reportReview(review.id, reportRequest);
      
      // 신고 성공 후 상태 업데이트
      setIsReported(true);
      setReportDialogOpen(false);
      setReportReason('');
      setReportDescription('');
      setError('');
      alert('신고가 접수되었습니다.');
      
      // 부모 컴포넌트에 업데이트 알림
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('신고 실패:', error);
      setError('신고 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
  };

  const renderStars = (rating: number) => {
    return <Rating value={rating} readOnly size="small" />;
  };

  const getReportReasonText = (reason: string) => {
    const reasons: { [key: string]: string } = {
      'SPAM': '스팸/광고',
      'INAPPROPRIATE_CONTENT': '부적절한 내용',
      'FAKE_REVIEW': '허위 리뷰',
      'PERSONAL_INFO': '개인정보 포함',
      'HATE_SPEECH': '혐오 발언',
      'COPYRIGHT': '저작권 침해',
      'OTHER': '기타'
    };
    return reasons[reason] || reason;
  };

  return (
    <>
      <Card sx={{ 
        mb: 1.5, 
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        },
        transition: 'box-shadow 0.2s ease'
      }}>
        <CardContent sx={{ p: 2 }}>
          {/* 리뷰 헤더 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                width: 44, 
                height: 44,
                bgcolor: 'primary.main',
                fontSize: '1.1rem',
                fontWeight: 600
              }}>
                {review.user.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#333' }}>
                  {review.user.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Rating value={review.rating} readOnly size="small" sx={{
                    '& .MuiRating-icon': {
                      fontSize: '1.1rem'
                    }
                  }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {format(new Date(review.createdAt), 'yyyy.MM.dd', { locale: ko })}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* 액션 버튼 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentUserId && review.canEdit && (
                <>
                  <IconButton size="small" onClick={() => onEdit?.(review)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete?.(review.id)}>
                    <Delete />
                  </IconButton>
                </>
              )}
              {currentUserId && !review.canEdit && !isReported && (
                <IconButton size="small" onClick={() => setReportDialogOpen(true)}>
                  <Report />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* 리뷰 제목 */}
          {review.title && (
            <Typography variant="h6" sx={{ mb: 1 }}>
              {review.title}
            </Typography>
          )}

          {/* 리뷰 내용 */}
          {review.content && (
            <Typography variant="body1" sx={{ 
              mb: 2.5, 
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              color: '#444',
              fontSize: '0.95rem'
            }}>
              {review.content}
            </Typography>
          )}

          {/* 리뷰 사진 */}
          {review.photos && review.photos.length > 0 && (
            <ImageList cols={Math.min(review.photos.length, 3)} rowHeight={100} gap={8} sx={{ mb: 2.5 }}>
              {review.photos.map((photo) => (
                <ImageListItem key={photo.id}>
                  <img
                    src={photo.filePath}
                    alt={photo.originalFilename}
                    loading="lazy"
                    style={{ 
                      objectFit: 'cover',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {/* 관리자 답변 */}
          {review.adminReply && (
            <Box sx={{ 
              mt: 2.5, 
              p: 2.5, 
              backgroundColor: '#f8f9fc', 
              borderRadius: 2,
              border: '1px solid #e3f2fd',
              position: 'relative'
            }}>
              <Box sx={{ 
                position: 'absolute',
                top: -6,
                left: 16,
                backgroundColor: '#1976d2',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                💬 관리자 답변
              </Box>
              <Typography variant="body2" sx={{ 
                mt: 1, 
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                color: '#555',
                fontSize: '0.9rem'
              }}>
                {review.adminReply}
              </Typography>
              {review.adminReplyAt && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', fontSize: '0.75rem' }}>
                  {format(new Date(review.adminReplyAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                </Typography>
              )}
            </Box>
          )}

          {/* 리뷰 액션 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mt: 2.5,
            pt: 2,
            borderTop: '1px solid #f0f0f0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {currentUserId && (
                <Button
                  size="small"
                  startIcon={isHelpful ? <ThumbUp /> : <ThumbUpOutlined />}
                  onClick={handleHelpfulToggle}
                  disabled={loading}
                  variant={isHelpful ? 'contained' : 'outlined'}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5
                  }}
                >
                  {helpfulCount}
                </Button>
              )}
              {currentUserId && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  도움이 되었어요
                </Typography>
              )}
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              예약번호: {review.reservationNumber}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 신고 다이얼로그 */}
      <Dialog 
        open={reportDialogOpen} 
        onClose={() => setReportDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1,
          }
        }}
      >
        <DialogTitle>
          리뷰 신고
          <IconButton
            aria-label="close"
            onClick={() => setReportDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: '20px 24px' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>신고 사유</InputLabel>
            <Select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              label="신고 사유"
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    '& .MuiMenuItem-root': {
                      padding: '12px 16px',
                      fontSize: '14px',
                      minHeight: '48px',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.16)',
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="SPAM">스팸/광고</MenuItem>
              <MenuItem value="INAPPROPRIATE_CONTENT">부적절한 내용</MenuItem>
              <MenuItem value="FAKE_REVIEW">허위 리뷰</MenuItem>
              <MenuItem value="PERSONAL_INFO">개인정보 포함</MenuItem>
              <MenuItem value="HATE_SPEECH">혐오 발언</MenuItem>
              <MenuItem value="COPYRIGHT">저작권 침해</MenuItem>
              <MenuItem value="OTHER">기타</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="상세 내용 (선택사항)"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="신고 사유에 대한 상세한 설명을 입력해주세요."
            sx={{ 
              '& .MuiInputBase-root': {
                padding: '14px',
              },
              '& .MuiInputBase-input': {
                fontSize: '14px',
                lineHeight: 1.5,
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px 20px 24px', gap: 1 }}>
          <Button 
            onClick={() => setReportDialogOpen(false)}
            sx={{ 
              padding: '8px 20px',
              fontSize: '14px',
              minWidth: '80px'
            }}
          >
            취소
          </Button>
          <Button 
            onClick={handleReport} 
            variant="contained" 
            color="error"
            disabled={loading || !reportReason}
            sx={{ 
              padding: '8px 20px',
              fontSize: '14px',
              minWidth: '100px'
            }}
          >
            신고하기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReviewCard;
