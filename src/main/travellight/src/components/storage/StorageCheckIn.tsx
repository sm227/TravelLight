import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  ImageList,
  ImageListItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  PhotoCamera,
  Delete as DeleteIcon,
  Search as SearchIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import axios from 'axios';

interface CheckInData {
  reservationNumber: string;
  customerName: string;
  customerPhone: string;
  placeName: string;
  actualSmallBags: number;
  actualMediumBags: number;
  actualLargeBags: number;
  photos: File[];
  staffNotes: string;
}

interface StorageCheckInProps {
  onCheckInComplete?: (result: any) => void;
}

const StorageCheckIn: React.FC<StorageCheckInProps> = ({ onCheckInComplete }) => {
  const [step, setStep] = useState<'search' | 'verify' | 'photo' | 'complete'>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 검색 관련
  const [searchNumber, setSearchNumber] = useState('');
  const [reservationData, setReservationData] = useState<any>(null);

  // 입고 데이터
  const [checkInData, setCheckInData] = useState<CheckInData>({
    reservationNumber: '',
    customerName: '',
    customerPhone: '',
    placeName: '',
    actualSmallBags: 0,
    actualMediumBags: 0,
    actualLargeBags: 0,
    photos: [],
    staffNotes: ''
  });

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 예약 조회
  const searchReservation = async () => {
    if (!searchNumber.trim()) {
      setError('예약번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/reservations/number/${searchNumber}`);
      const reservation = response.data;

      if (reservation.status === 'STORED') {
        setError('이미 입고 처리된 예약입니다.');
        return;
      }

      if (reservation.status !== 'RESERVED') {
        setError('입고 가능한 상태가 아닙니다. 현재 상태: ' + reservation.status);
        return;
      }

      setReservationData(reservation);
      setCheckInData(prev => ({
        ...prev,
        reservationNumber: reservation.reservationNumber,
        customerName: reservation.user?.name || '',
        customerPhone: reservation.user?.email || '',
        placeName: reservation.placeName,
        actualSmallBags: reservation.smallBags || 0,
        actualMediumBags: reservation.mediumBags || 0,
        actualLargeBags: reservation.largeBags || 0
      }));
      setStep('verify');

    } catch (err: any) {
      console.error('예약 조회 실패:', err);
      setError('예약을 찾을 수 없습니다. 예약번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 사진 선택
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPhotoUrls(prev => [...prev, url]);
        setCheckInData(prev => ({
          ...prev,
          photos: [...prev.photos, file]
        }));
      }
    });
  };

  // 사진 삭제
  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoUrls[index]);
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
    setCheckInData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // 입고 처리
  const processCheckIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('reservationNumber', checkInData.reservationNumber);
      formData.append('actualSmallBags', checkInData.actualSmallBags.toString());
      formData.append('actualMediumBags', checkInData.actualMediumBags.toString());
      formData.append('actualLargeBags', checkInData.actualLargeBags.toString());
      formData.append('staffNotes', checkInData.staffNotes);

      // 사진 첨부
      checkInData.photos.forEach((photo, index) => {
        formData.append('photos', photo);
      });

      const response = await axios.post('/api/storage/check-in', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('짐 입고가 완료되었습니다!');
      setStep('complete');

      if (onCheckInComplete) {
        onCheckInComplete(response.data.data);
      }

    } catch (err: any) {
      console.error('입고 처리 실패:', err);
      setError('입고 처리 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 새로운 입고 시작
  const startNewCheckIn = () => {
    setStep('search');
    setSearchNumber('');
    setReservationData(null);
    setCheckInData({
      reservationNumber: '',
      customerName: '',
      customerPhone: '',
      placeName: '',
      actualSmallBags: 0,
      actualMediumBags: 0,
      actualLargeBags: 0,
      photos: [],
      staffNotes: ''
    });
    setPhotoUrls([]);
    setError(null);
    setSuccess(null);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          짐 입고 처리
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* 단계 1: 예약 검색 */}
        {step === 'search' && (
          <Box>
            <TextField
              fullWidth
              label="예약번호"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchReservation()}
              sx={{ mb: 2 }}
              placeholder="예약번호를 입력하세요"
            />
            <Button
              variant="contained"
              onClick={searchReservation}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              fullWidth
            >
              예약 조회
            </Button>
          </Box>
        )}

        {/* 단계 2: 예약 정보 확인 및 실제 가방 수량 입력 */}
        {step === 'verify' && reservationData && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              예약 정보 확인
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="고객명"
                  value={checkInData.customerName}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="이메일"
                  value={checkInData.customerPhone}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="매장명"
                  value={checkInData.placeName}
                  disabled
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" gutterBottom>
              예약한 가방 수량
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip label={`소형: ${reservationData.smallBags || 0}개`} sx={{ mr: 1 }} />
              <Chip label={`중형: ${reservationData.mediumBags || 0}개`} sx={{ mr: 1 }} />
              <Chip label={`대형: ${reservationData.largeBags || 0}개`} />
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              실제 맡긴 가방 수량
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="소형"
                  value={checkInData.actualSmallBags}
                  onChange={(e) => setCheckInData(prev => ({
                    ...prev,
                    actualSmallBags: Math.max(0, parseInt(e.target.value) || 0)
                  }))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="중형"
                  value={checkInData.actualMediumBags}
                  onChange={(e) => setCheckInData(prev => ({
                    ...prev,
                    actualMediumBags: Math.max(0, parseInt(e.target.value) || 0)
                  }))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="대형"
                  value={checkInData.actualLargeBags}
                  onChange={(e) => setCheckInData(prev => ({
                    ...prev,
                    actualLargeBags: Math.max(0, parseInt(e.target.value) || 0)
                  }))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="직원 메모 (선택사항)"
              value={checkInData.staffNotes}
              onChange={(e) => setCheckInData(prev => ({
                ...prev,
                staffNotes: e.target.value
              }))}
              sx={{ mb: 3 }}
              placeholder="특이사항이나 주의사항을 입력하세요"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setStep('search')}
              >
                이전
              </Button>
              <Button
                variant="contained"
                onClick={() => setStep('photo')}
                disabled={
                  checkInData.actualSmallBags + checkInData.actualMediumBags + checkInData.actualLargeBags === 0
                }
              >
                다음 (사진 촬영)
              </Button>
            </Box>
          </Box>
        )}

        {/* 단계 3: 사진 촬영 */}
        {step === 'photo' && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              짐 사진 촬영
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              고객의 짐을 여러 각도에서 촬영해주세요. 나중에 찾기 쉽도록 도움이 됩니다.
            </Typography>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              multiple
              capture="environment"
              style={{ display: 'none' }}
            />

            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<PhotoCamera />}
              sx={{ mb: 2 }}
              fullWidth
            >
              사진 촬영
            </Button>

            {photoUrls.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  촬영된 사진 ({photoUrls.length}개)
                </Typography>
                <ImageList cols={3} rowHeight={120}>
                  {photoUrls.map((url, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={url}
                        alt={`짐 사진 ${index + 1}`}
                        loading="lazy"
                        style={{ objectFit: 'cover', width: '100%', height: '120px' }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                        }}
                        size="small"
                        onClick={() => removePhoto(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setStep('verify')}
              >
                이전
              </Button>
              <Button
                variant="contained"
                onClick={processCheckIn}
                disabled={loading || photoUrls.length === 0}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                입고 완료
              </Button>
            </Box>
          </Box>
        )}

        {/* 단계 4: 완료 */}
        {step === 'complete' && (
          <Box sx={{ textAlign: 'center' }}>
            <QrCodeIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              입고가 완료되었습니다!
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              고객이 출고할 때 QR코드를 스캔하거나 예약번호로 확인할 수 있습니다.
            </Typography>
            <Button
              variant="contained"
              onClick={startNewCheckIn}
            >
              새로운 입고 처리
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageCheckIn;