import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  Chip,
  Divider
} from '@mui/material';
import {
  QrCodeScanner as QrScannerIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';

interface StorageInfo {
  id: number;
  storageCode: string;
  reservationNumber: string;
  customerName: string;
  customerPhone: string;
  placeName: string;
  bagPhotos: string[];
  actualSmallBags: number;
  actualMediumBags: number;
  actualLargeBags: number;
  totalBags: number;
  checkInTime: string;
  status: string;
  staffNotes?: string;
}

interface StorageCheckOutProps {
  onCheckOutComplete?: (result: any) => void;
}

const StorageCheckOut: React.FC<StorageCheckOutProps> = ({ onCheckOutComplete }) => {
  const [step, setStep] = useState<'search' | 'verify' | 'complete'>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 검색 관련
  const [searchCode, setSearchCode] = useState('');
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  // 본인 확인 및 출고 처리
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [staffNotes, setStaffNotes] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);

  // QR코드 또는 스토리지 코드로 검색
  const searchStorage = async () => {
    if (!searchCode.trim()) {
      setError('QR코드 또는 스토리지 코드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // QR코드에서 스토리지 코드 추출 (TRAVELLIGHT: 접두사 제거)
      const storageCode = searchCode.startsWith('TRAVELLIGHT:')
        ? searchCode.replace('TRAVELLIGHT:', '')
        : searchCode;

      const response = await axios.get(`/api/storage/qr/${storageCode}`);
      const storage = response.data.data;

      if (storage.status === 'RETRIEVED') {
        setError('이미 출고 처리된 짐입니다.');
        return;
      }

      if (storage.status !== 'STORED') {
        setError('출고 가능한 상태가 아닙니다. 현재 상태: ' + storage.status);
        return;
      }

      setStorageInfo(storage);
      setCustomerName(storage.customerName);
      setCustomerEmail(storage.customerPhone);
      setStep('verify');

    } catch (err: any) {
      console.error('보관 정보 조회 실패:', err);
      if (err.response?.status === 404) {
        setError('해당 코드로 보관된 짐을 찾을 수 없습니다.');
      } else {
        setError('보관 정보 조회 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 본인 확인
  const verifyCustomer = () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('고객 이름과 이메일을 모두 입력해주세요.');
      return;
    }

    if (!storageInfo) return;

    if (customerName.trim() !== storageInfo.customerName ||
        customerEmail.trim() !== storageInfo.customerPhone) {
      setError('고객 정보가 일치하지 않습니다. 다시 확인해주세요.');
      return;
    }

    setError(null);
    setConfirmDialog(true);
  };

  // 출고 처리
  const processCheckOut = async () => {
    if (!storageInfo) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/storage/check-out', {
        storageCode: storageInfo.storageCode,
        customerName: customerName.trim(),
        customerPhone: customerEmail.trim(),
        staffNotes: staffNotes
      });

      setSuccess('짐 출고가 완료되었습니다!');
      setStep('complete');
      setConfirmDialog(false);

      if (onCheckOutComplete) {
        onCheckOutComplete(response.data.data);
      }

    } catch (err: any) {
      console.error('출고 처리 실패:', err);
      setError('출고 처리 중 오류가 발생했습니다: ' + (err.response?.data?.message || err.message));
      setConfirmDialog(false);
    } finally {
      setLoading(false);
    }
  };

  // 새로운 출고 시작
  const startNewCheckOut = () => {
    setStep('search');
    setSearchCode('');
    setStorageInfo(null);
    setCustomerName('');
    setCustomerEmail('');
    setStaffNotes('');
    setError(null);
    setSuccess(null);
    setConfirmDialog(false);
  };

  // 보관 기간 계산
  const getStorageDuration = (checkInTime: string) => {
    const checkIn = new Date(checkInTime);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - checkIn.getTime()) / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours}시간`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;
      return `${diffDays}일 ${remainingHours}시간`;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          짐 출고 처리
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

        {/* 단계 1: QR코드/스토리지 코드 검색 */}
        {step === 'search' && (
          <Box>
            <TextField
              fullWidth
              label="QR코드 또는 스토리지 코드"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchStorage()}
              sx={{ mb: 2 }}
              placeholder="QR코드를 스캔하거나 스토리지 코드를 입력하세요"
            />
            <Button
              variant="contained"
              onClick={searchStorage}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <QrScannerIcon />}
              fullWidth
            >
              짐 조회
            </Button>
          </Box>
        )}

        {/* 단계 2: 보관 정보 확인 및 본인 확인 */}
        {step === 'verify' && storageInfo && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              보관된 짐 정보
            </Typography>

            {/* 짐 사진들 */}
            {storageInfo.bagPhotos && storageInfo.bagPhotos.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  보관된 짐 사진
                </Typography>
                <ImageList cols={3} rowHeight={120}>
                  {storageInfo.bagPhotos.map((photo, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={`/api/files/${photo}`}
                        alt={`짐 사진 ${index + 1}`}
                        loading="lazy"
                        style={{ objectFit: 'cover', width: '100%', height: '120px' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {/* 보관 정보 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="예약번호"
                  value={storageInfo.reservationNumber}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="매장명"
                  value={storageInfo.placeName}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  입고 시간
                </Typography>
                <Typography variant="body1">
                  {new Date(storageInfo.checkInTime).toLocaleString('ko-KR')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  보관 기간
                </Typography>
                <Typography variant="body1">
                  {getStorageDuration(storageInfo.checkInTime)}
                </Typography>
              </Grid>
            </Grid>

            {/* 가방 수량 */}
            <Typography variant="subtitle2" gutterBottom>
              보관된 가방 수량
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Chip
                label={`소형: ${storageInfo.actualSmallBags}개`}
                sx={{ mr: 1 }}
                color={storageInfo.actualSmallBags > 0 ? 'primary' : 'default'}
              />
              <Chip
                label={`중형: ${storageInfo.actualMediumBags}개`}
                sx={{ mr: 1 }}
                color={storageInfo.actualMediumBags > 0 ? 'primary' : 'default'}
              />
              <Chip
                label={`대형: ${storageInfo.actualLargeBags}개`}
                color={storageInfo.actualLargeBags > 0 ? 'primary' : 'default'}
              />
            </Box>

            {/* 입고 시 메모 */}
            {storageInfo.staffNotes && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  입고 시 메모
                </Typography>
                <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  {storageInfo.staffNotes}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* 본인 확인 */}
            <Typography variant="subtitle1" gutterBottom>
              <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              본인 확인
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="고객 이름"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="고객 이름을 입력하세요"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="고객 이메일"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              rows={2}
              label="출고 메모 (선택사항)"
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              sx={{ mb: 3 }}
              placeholder="출고 시 특이사항을 입력하세요"
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
                onClick={verifyCustomer}
                disabled={!customerName.trim() || !customerEmail.trim()}
              >
                출고 처리
              </Button>
            </Box>
          </Box>
        )}

        {/* 단계 3: 완료 */}
        {step === 'complete' && (
          <Box sx={{ textAlign: 'center' }}>
            <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              출고가 완료되었습니다!
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              고객에게 짐을 전달해주세요. 출고 처리가 완료되었습니다.
            </Typography>
            <Button
              variant="contained"
              onClick={startNewCheckOut}
            >
              새로운 출고 처리
            </Button>
          </Box>
        )}

        {/* 출고 확인 다이얼로그 */}
        <Dialog
          open={confirmDialog}
          onClose={() => setConfirmDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>출고 확인</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              다음 정보로 출고 처리하시겠습니까?
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • 고객명: {customerName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • 이메일: {customerEmail}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • 가방 수량: 총 {storageInfo?.totalBags}개
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(false)}>
              취소
            </Button>
            <Button
              onClick={processCheckOut}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              출고 확정
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StorageCheckOut;