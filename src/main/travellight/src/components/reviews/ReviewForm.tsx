import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  PhotoCamera,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ReviewRequest, ReviewUpdateRequest, reviewService } from '../../services/api';

interface ReviewFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (review: any) => void;
  reservationId?: number;
  editingReview?: any;
  placeName: string;
  placeAddress: string;
  userId?: number;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  open,
  onClose,
  onSubmit,
  reservationId,
  editingReview,
  placeName,
  placeAddress,
  userId
}) => {
  const [rating, setRating] = useState(editingReview?.rating || 5);
  const [title, setTitle] = useState(editingReview?.title || '');
  const [content, setContent] = useState(editingReview?.content || '');
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState(editingReview?.photos || []);
  const [keepPhotoIds, setKeepPhotoIds] = useState<number[]>(
    editingReview?.photos?.map((photo: any) => photo.id) || []
  );
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // 파일 크기 및 형식 검증
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        setError('파일 크기는 5MB 이하여야 합니다.');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return false;
      }
      return true;
    });

    // 최대 5장 제한
    const totalPhotos = photos.length + existingPhotos.length + validFiles.length;
    if (totalPhotos > 5) {
      setError('최대 5장까지 업로드 가능합니다.');
      return;
    }

    setPhotos(prev => [...prev, ...validFiles]);
    setError('');
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingPhoto = (photoId: number) => {
    setKeepPhotoIds(prev => prev.filter(id => id !== photoId));
    setExistingPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('평점을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let photoFilenames: string[] = [];

      // 새 사진이 있다면 업로드
      if (photos.length > 0) {
        setUploadProgress(30);
        const uploadResponse = await reviewService.uploadReviewPhotos(photos);
        photoFilenames = uploadResponse.data;
        setUploadProgress(60);
      }

      if (editingReview) {
        // 리뷰 수정
        const updateRequest: ReviewUpdateRequest = {
          rating,
          title: title.trim() || undefined,
          content: content.trim() || undefined,
          keepPhotoIds,
          newPhotoFilenames: photoFilenames
        };

        console.log('=== 리뷰 수정 요청 ===');
        console.log('예약 ID:', reservationId);
        console.log('사용자 ID:', userId);
        console.log('수정 데이터:', updateRequest);
        console.log('기존 리뷰 ID:', editingReview.id);

        setUploadProgress(80);
        const response = await reviewService.updateReview(reservationId!, updateRequest, userId!);
        console.log('리뷰 수정 응답:', response);
        setUploadProgress(100);
        onSubmit(response.data);
      } else if (reservationId) {
        // 새 리뷰 작성
        const reviewRequest: ReviewRequest = {
          reservationId,
          rating,
          title: title.trim() || undefined,
          content: content.trim() || undefined,
          photoFilenames: photoFilenames.length > 0 ? photoFilenames : undefined
        };


        setUploadProgress(80);
        const response = await reviewService.createReview(reviewRequest, userId!);
        setUploadProgress(100);
        onSubmit(response.data);
      }

      // 폼 초기화
      handleClose();
    } catch (error: any) {
      console.error('리뷰 제출 실패:', error);
      setError(error.response?.data?.message || '리뷰 제출 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setRating(5);
    setTitle('');
    setContent('');
    setPhotos([]);
    setExistingPhotos([]);
    setKeepPhotoIds([]);
    setError('');
    setUploadProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingReview ? '리뷰 수정' : '리뷰 작성'}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          disabled={loading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {loading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 제휴점 정보 */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {placeName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {placeAddress}
          </Typography>
        </Box>

        {/* 평점 선택 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            평점 <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue || 0)}
            size="large"
            disabled={loading}
          />
        </Box>

        {/* 제목 입력 */}
        <TextField
          fullWidth
          label="제목 (선택사항)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
          inputProps={{ maxLength: 200 }}
          helperText={`${title.length}/200`}
        />

        {/* 내용 입력 */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="리뷰 내용 (선택사항)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
          inputProps={{ maxLength: 2000 }}
          helperText={`${content.length}/2000`}
          placeholder="이용하신 서비스에 대한 솔직한 후기를 남겨주세요."
        />

        {/* 사진 업로드 */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              사진 (선택사항)
            </Typography>
            <Button
              startIcon={<PhotoCamera />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || (photos.length + existingPhotos.length) >= 5}
              sx={{ ml: 2 }}
            >
              사진 추가
            </Button>
          </Box>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            최대 5장, 각 파일 5MB 이하
          </Typography>

          {/* 기존 사진들 (수정 시) */}
          {existingPhotos.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>기존 사진:</Typography>
              <ImageList cols={3} rowHeight={120}>
                {existingPhotos.map((photo: any) => (
                  <ImageListItem key={photo.id}>
                    <img
                      src={photo.filePath}
                      alt={photo.originalFilename}
                      loading="lazy"
                      style={{ objectFit: 'cover' }}
                    />
                    <ImageListItemBar
                      actionIcon={
                        <IconButton
                          sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                          onClick={() => handleRemoveExistingPhoto(photo.id)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          {/* 새로 선택한 사진들 */}
          {photos.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>새 사진:</Typography>
              <ImageList cols={3} rowHeight={120}>
                {photos.map((file, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      loading="lazy"
                      style={{ objectFit: 'cover' }}
                    />
                    <ImageListItemBar
                      actionIcon={
                        <IconButton
                          sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                          onClick={() => handleRemovePhoto(index)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          취소
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || rating === 0}
        >
          {loading ? '제출 중...' : (editingReview ? '수정' : '리뷰 작성')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewForm;
