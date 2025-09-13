import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Luggage as LuggageIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

interface StorageItemSummary {
  id: number;
  storageCode: string;
  customerName: string;
  placeName: string;
  totalBags: number;
  checkInTime: string;
  status: string;
  thumbnailPhotos: string[];
}

interface StorageStatusData {
  placeName: string;
  placeAddress: string;
  currentStoredItems: number;
  totalCapacity?: number;
  storedItems: StorageItemSummary[];
}

interface StorageDetails {
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

interface StorageStatusDashboardProps {
  storeName: string;
  storeAddress: string;
}

const StorageStatusDashboard: React.FC<StorageStatusDashboardProps> = ({
  storeName,
  storeAddress
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<StorageStatusData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<StorageDetails | null>(null);
  const [detailDialog, setDetailDialog] = useState(false);

  // 보관 현황 조회
  const fetchStorageStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/storage/store/current', {
        params: {
          placeName: storeName,
          placeAddress: storeAddress
        }
      });

      setStorageStatus(response.data.data);
    } catch (err: any) {
      console.error('보관 현황 조회 실패:', err);
      setError('보관 현황을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 상세 정보 조회
  const fetchItemDetails = async (itemId: number) => {
    try {
      const response = await axios.get(`/api/storage/${itemId}`);
      setSelectedItem(response.data.data);
      setDetailDialog(true);
    } catch (err: any) {
      console.error('상세 정보 조회 실패:', err);
      setError('상세 정보를 불러올 수 없습니다.');
    }
  };

  // 검색된 아이템들 필터링
  const filteredItems = storageStatus?.storedItems.filter(item =>
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.storageCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  // 보관 기간에 따른 색상
  const getDurationColor = (checkInTime: string) => {
    const checkIn = new Date(checkInTime);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 7) return 'error';
    if (diffDays >= 3) return 'warning';
    return 'primary';
  };

  useEffect(() => {
    if (storeName && storeAddress) {
      fetchStorageStatus();
    }
  }, [storeName, storeAddress]);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            현재 보관 현황
          </Typography>
          <Button
            variant="outlined"
            onClick={fetchStorageStatus}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          >
            새로고침
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && !storageStatus ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : storageStatus ? (
          <>
            {/* 현황 요약 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="primary">
                      {storageStatus.currentStoredItems}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      보관 중인 짐
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="secondary">
                      {storageStatus.storedItems.reduce((sum, item) => sum + item.totalBags, 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      총 가방 수
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 검색 */}
            <TextField
              fullWidth
              placeholder="고객명 또는 스토리지 코드로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />

            {/* 보관된 짐 목록 */}
            {filteredItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LuggageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="body1" color="textSecondary">
                  {searchTerm ? '검색 결과가 없습니다.' : '현재 보관 중인 짐이 없습니다.'}
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredItems.map((item, index) => (
                  <ListItem
                    key={item.id}
                    divider={index < filteredItems.length - 1}
                    sx={{ px: 0 }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <LuggageIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {item.customerName}
                          </Typography>
                          <Chip
                            label={`${item.totalBags}개`}
                            size="small"
                            color="primary"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            코드: {item.storageCode}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <TimeIcon fontSize="small" />
                            <Typography variant="caption">
                              입고: {new Date(item.checkInTime).toLocaleDateString('ko-KR')}
                            </Typography>
                            <Chip
                              label={getStorageDuration(item.checkInTime)}
                              size="small"
                              color={getDurationColor(item.checkInTime)}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => fetchItemDetails(item.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        ) : (
          <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            매장 정보를 선택해주세요.
          </Typography>
        )}

        {/* 상세 정보 다이얼로그 */}
        <Dialog
          open={detailDialog}
          onClose={() => setDetailDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedItem && (
              <Box>
                <Typography variant="h6">
                  {selectedItem.customerName}님의 보관 정보
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  스토리지 코드: {selectedItem.storageCode}
                </Typography>
              </Box>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box>
                {/* 짐 사진들 */}
                {selectedItem.bagPhotos && selectedItem.bagPhotos.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      보관된 짐 사진
                    </Typography>
                    <ImageList cols={3} rowHeight={150}>
                      {selectedItem.bagPhotos.map((photo, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={`/api/files/${photo}`}
                            alt={`짐 사진 ${index + 1}`}
                            loading="lazy"
                            style={{ objectFit: 'cover', width: '100%', height: '150px' }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}

                {/* 기본 정보 */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">예약번호</Typography>
                    <Typography variant="body1">{selectedItem.reservationNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">전화번호</Typography>
                    <Typography variant="body1">{selectedItem.customerPhone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">입고 시간</Typography>
                    <Typography variant="body1">
                      {new Date(selectedItem.checkInTime).toLocaleString('ko-KR')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">보관 기간</Typography>
                    <Typography variant="body1">
                      {getStorageDuration(selectedItem.checkInTime)}
                    </Typography>
                  </Grid>
                </Grid>

                {/* 가방 수량 */}
                <Typography variant="subtitle2" gutterBottom>
                  가방 수량
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`소형: ${selectedItem.actualSmallBags}개`}
                    sx={{ mr: 1 }}
                    color={selectedItem.actualSmallBags > 0 ? 'primary' : 'default'}
                  />
                  <Chip
                    label={`중형: ${selectedItem.actualMediumBags}개`}
                    sx={{ mr: 1 }}
                    color={selectedItem.actualMediumBags > 0 ? 'primary' : 'default'}
                  />
                  <Chip
                    label={`대형: ${selectedItem.actualLargeBags}개`}
                    color={selectedItem.actualLargeBags > 0 ? 'primary' : 'default'}
                  />
                </Box>

                {/* 메모 */}
                {selectedItem.staffNotes && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      직원 메모
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}
                    >
                      {selectedItem.staffNotes}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog(false)}>
              닫기
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StorageStatusDashboard;