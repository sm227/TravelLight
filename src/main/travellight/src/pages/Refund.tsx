import React, { useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    AlertTitle
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

// 애니메이션 정의
const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

// 스타일된 컴포넌트
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: '12px',
    border: '1px solid #F1F5F9',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    marginBottom: theme.spacing(3)
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    color: '#1E293B',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3)
}));

const ContentText = styled(Typography)(({ theme }) => ({
    color: '#64748B',
    lineHeight: 1.7,
    marginBottom: theme.spacing(2)
}));

const RefundPage = () => {
    const { t } = useTranslation();

    // 페이지 로드 시 스크롤을 맨 위로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Navbar />
            <Box sx={{ 
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
                pt: { xs: 10, md: 12 },
                pb: { xs: 8, md: 12 },
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* 배경 장식 */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        right: '5%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 70%)',
                        borderRadius: '50%',
                        zIndex: 0,
                    }}
                />

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    {/* 헤더 */}
                    <Box sx={{ 
                        mb: 6, 
                        textAlign: 'center',
                        animation: `${fadeIn} 0.8s ease-out`
                    }}>
                        <Typography 
                            variant="h2" 
                            component="h1"
                            sx={{
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                fontWeight: 700,
                                color: '#0F172A',
                                mb: 2,
                                letterSpacing: '-0.01em'
                            }}
                        >
                            환불 정책
                        </Typography>
                        <Typography 
                            variant="h6"
                            sx={{
                                color: '#64748B',
                                fontSize: '1.1rem',
                                fontWeight: 400,
                                lineHeight: 1.6
                            }}
                        >
                            TravelLight 서비스 취소 및 환불에 관한 정책입니다.
                        </Typography>
                    </Box>

                    {/* 환불 정책 내용 */}
                    <StyledPaper sx={{ animation: `${fadeIn} 0.6s ease-out 0.2s both` }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                            시행일자: 2024년 1월 1일
                        </Typography>

                        <Alert 
                            severity="info" 
                            icon={<InfoIcon />}
                            sx={{ 
                                mb: 4,
                                borderRadius: '8px',
                                border: '1px solid #DBEAFE',
                                backgroundColor: '#EFF6FF'
                            }}
                        >
                            <AlertTitle sx={{ fontWeight: 600 }}>환불 정책 안내</AlertTitle>
                            TravelLight는 고객 만족을 위해 공정하고 투명한 환불 정책을 운영하고 있습니다. 
                            서비스 이용 전 반드시 환불 정책을 숙지해 주시기 바랍니다.
                        </Alert>

                        <SectionTitle variant="h5">1. 환불 기준</SectionTitle>
                        <ContentText>
                            TravelLight 서비스의 환불은 서비스 이용 시점을 기준으로 다음과 같이 적용됩니다:
                        </ContentText>

                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', mb: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>취소 시점</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>환불률</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>수수료</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>서비스 이용 3일 전</TableCell>
                                        <TableCell sx={{ color: '#10B981', fontWeight: 600 }}>100%</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>없음</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>서비스 이용 2일 전</TableCell>
                                        <TableCell sx={{ color: '#F59E0B', fontWeight: 600 }}>70%</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>30%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>서비스 이용 1일 전</TableCell>
                                        <TableCell sx={{ color: '#EF4444', fontWeight: 600 }}>50%</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>50%</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>서비스 이용 당일</TableCell>
                                        <TableCell sx={{ color: '#EF4444', fontWeight: 600 }}>환불 불가</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>100%</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Alert 
                            severity="warning" 
                            icon={<WarningIcon />}
                            sx={{ 
                                mb: 3,
                                borderRadius: '8px',
                                border: '1px solid #FED7AA',
                                backgroundColor: '#FFF7ED'
                            }}
                        >
                            서비스 이용 당일(24시간 이내) 취소 시에는 환불이 불가합니다.
                        </Alert>

                        <SectionTitle variant="h5">2. 서비스별 환불 정책</SectionTitle>
                        
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 2 }}>
                                2.1 짐 보관 서비스
                            </Typography>
                            <ContentText>
                                • 예약한 보관 시작 시간 기준으로 환불 정책이 적용됩니다.<br />
                                • 보관 중인 짐이 있는 경우, 짐을 찾아가신 후 환불 처리가 가능합니다.<br />
                                • 연장 보관료는 사용한 기간에 대해서만 정산 후 환불됩니다.
                            </ContentText>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 2 }}>
                                2.2 배송 서비스
                            </Typography>
                            <ContentText>
                                • 배송 시작 전: 상기 환불 기준 적용<br />
                                • 배송 진행 중: 배송비 공제 후 나머지 금액 환불<br />
                                • 배송 완료 후: 환불 불가 (반품 정책 적용)
                            </ContentText>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 2 }}>
                                2.3 픽업 서비스
                            </Typography>
                            <ContentText>
                                • 픽업 예정 시간 기준으로 환불 정책이 적용됩니다.<br />
                                • 픽업 담당자 출발 후에는 픽업 비용 공제 후 환불됩니다.
                            </ContentText>
                        </Box>

                        <SectionTitle variant="h5">3. 환불 불가 사유</SectionTitle>
                        <ContentText>
                            다음의 경우에는 환불이 제한될 수 있습니다:
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>서비스를 이미 이용한 경우</li>
                            <li>고객의 변심으로 인한 취소 (약관에 명시된 기간 경과 시)</li>
                            <li>고객의 귀책사유로 인한 서비스 제공 불가</li>
                            <li>허위 정보 제공으로 인한 서비스 중단</li>
                            <li>약관 위반으로 인한 서비스 정지</li>
                        </Box>

                        <SectionTitle variant="h5">4. 환불 신청 방법</SectionTitle>
                        <ContentText>
                            환불을 원하시는 경우 다음 방법으로 신청하실 수 있습니다:
                        </ContentText>

                        <Box sx={{ 
                            p: 3, 
                            backgroundColor: '#F8FAFC', 
                            borderRadius: '8px',
                            border: '1px solid #F1F5F9',
                            mb: 3
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 2 }}>
                                환불 신청 채널
                            </Typography>
                            <Box component="ul" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7, margin: 0 }}>
                                <li>웹사이트: 지도 페이지 &gt; 내 예약 &gt; 취소/환불</li>
                                <li>고객센터: 1588-0000 (평일 09:00~18:00)</li>
                                <li>이메일: refund@travellight.com</li>
                                <li>1:1 문의: 웹사이트 문의하기 메뉴</li>
                            </Box>
                        </Box>

                        <SectionTitle variant="h5">5. 환불 처리 절차</SectionTitle>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>환불 신청 접수</li>
                            <li>환불 사유 및 환불 가능 여부 검토 (1~2영업일)</li>
                            <li>환불 승인 및 처리 (3~5영업일)</li>
                            <li>환불 완료 알림</li>
                        </Box>

                        <SectionTitle variant="h5">6. 환불 처리 기간</SectionTitle>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', mb: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>결제 수단</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>환불 처리 기간</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>신용카드</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>승인 후 3~5영업일</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>계좌이체</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>승인 후 1~3영업일</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>휴대폰 결제</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>승인 후 3~5영업일</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>카카오페이/네이버페이</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>승인 후 1~3영업일</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <SectionTitle variant="h5">7. 부분 환불</SectionTitle>
                        <ContentText>
                            다음의 경우 부분 환불이 적용됩니다:
                        </ContentText>
                        <Box component="ul" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>패키지 서비스 중 일부만 이용한 경우</li>
                            <li>연장 보관료 중 미사용 기간이 있는 경우</li>
                            <li>추가 서비스를 신청했으나 이용하지 않은 경우</li>
                        </Box>

                        <SectionTitle variant="h5">8. 분쟁 해결</SectionTitle>
                        <ContentText>
                            환불과 관련하여 분쟁이 발생한 경우 다음 기관에 신청할 수 있습니다:
                        </ContentText>
                        <Box component="ul" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>소비자분쟁조정위원회 (www.ccn.go.kr)</li>
                            <li>전자상거래등에서의 소비자보호에 관한 법률에 따른 소비자분쟁조정</li>
                            <li>공정거래위원회 소비자신고센터 (consumer.go.kr)</li>
                        </Box>

                        <Alert 
                            severity="info" 
                            sx={{ 
                                mt: 4,
                                borderRadius: '8px',
                                border: '1px solid #DBEAFE',
                                backgroundColor: '#EFF6FF'
                            }}
                        >
                            환불 정책은 관련 법령에 따라 변경될 수 있으며, 변경 시 사전 공지하겠습니다.
                        </Alert>

                        <Divider sx={{ my: 4 }} />

                        <Box sx={{ textAlign: 'center', pt: 2 }}>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                TravelLight 주식회사<br />
                                주소: 서울특별시 강남구 테헤란로 123<br />
                                전화: 1588-0000 | 이메일: refund@travellight.com
                            </Typography>
                        </Box>
                    </StyledPaper>
                </Container>
                <Footer />
            </Box>
        </>
    );
};

export default RefundPage;
