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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SecurityIcon from '@mui/icons-material/Security';
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

const LocationTermsPage = () => {
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
                            위치기반 서비스 이용약관
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
                            TravelLight의 위치정보 수집 및 이용에 관한 약관입니다.
                        </Typography>
                    </Box>

                    {/* 위치기반 서비스 이용약관 내용 */}
                    <StyledPaper sx={{ animation: `${fadeIn} 0.6s ease-out 0.2s both` }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                            시행일자: 2024년 1월 1일
                        </Typography>

                        <Alert 
                            severity="info" 
                            icon={<LocationOnIcon />}
                            sx={{ 
                                mb: 4,
                                borderRadius: '8px',
                                border: '1px solid #DBEAFE',
                                backgroundColor: '#EFF6FF'
                            }}
                        >
                            <AlertTitle sx={{ fontWeight: 600 }}>위치기반 서비스 안내</AlertTitle>
                            TravelLight는 더 나은 서비스 제공을 위해 위치정보를 수집하고 있습니다. 
                            위치정보는 안전하게 처리되며, 서비스 제공 목적으로만 사용됩니다.
                        </Alert>

                        <SectionTitle variant="h5">제1조 (목적)</SectionTitle>
                        <ContentText>
                            이 약관은 TravelLight 주식회사(이하 "회사")가 제공하는 위치기반서비스와 관련하여 회사와 개인위치정보주체 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                        </ContentText>

                        <SectionTitle variant="h5">제2조 (약관의 효력 및 변경)</SectionTitle>
                        <ContentText>
                            1. 본 약관은 신청 화면에서 동의하고 위치기반서비스를 신청한 이용자에 대하여 그 효력을 발생합니다.
                        </ContentText>
                        <ContentText>
                            2. 회사는 위치정보의 보호 및 이용 등에 관한 법률, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령에 위배되지 않는 범위에서 이 약관을 변경할 수 있습니다.
                        </ContentText>

                        <SectionTitle variant="h5">제3조 (서비스 내용 및 요금)</SectionTitle>
                        <ContentText>
                            회사는 위치정보사업자로부터 위치정보를 전달받아 아래와 같은 위치기반서비스를 제공합니다:
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>현재 위치 기반 가장 가까운 제휴점 검색 서비스</li>
                            <li>위치 기반 짐 보관소 추천 서비스</li>
                            <li>배송 및 픽업 경로 최적화 서비스</li>
                            <li>위치 기반 맞춤형 서비스 추천</li>
                            <li>긴급상황 시 위치 확인 서비스</li>
                        </Box>

                        <SectionTitle variant="h5">제4조 (개인위치정보주체의 권리)</SectionTitle>
                        <ContentText>
                            개인위치정보주체는 개인위치정보 수집 범위 및 이용약관의 내용 중 일부 또는 개인위치정보의 이용·제공 목적, 제3자 제공 범위 등에 대하여 동의를 유보할 수 있습니다.
                        </ContentText>
                        <ContentText>
                            개인위치정보주체는 다음 각 호의 권리를 가집니다:
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>개인위치정보 수집·이용·제공에 대한 동의 철회권</li>
                            <li>개인위치정보의 수집·이용·제공 일시정지 요구권</li>
                            <li>개인위치정보 수집·이용·제공사실 통지 요구권</li>
                        </Box>

                        <SectionTitle variant="h5">제5조 (개인위치정보의 이용 또는 제공)</SectionTitle>
                        <ContentText>
                            회사는 개인위치정보를 다음과 같이 이용합니다:
                        </ContentText>

                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', mb: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>이용목적</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>이용정보</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>보유기간</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>가까운 제휴점 검색</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>현재 위치 (GPS)</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>즉시 삭제</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>배송 서비스</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>픽업/배송 위치</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>서비스 완료 후 30일</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>서비스 품질 개선</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>이용패턴 분석</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>1년</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>마케팅 활용</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>지역별 통계</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>2년</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <SectionTitle variant="h5">제6조 (개인위치정보의 제3자 제공)</SectionTitle>
                        <ContentText>
                            회사는 개인위치정보주체의 동의 없이는 개인위치정보를 제3자에게 제공하지 않습니다. 다만, 다음 각 호의 경우에는 예외로 합니다:
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>개인위치정보주체가 미리 동의한 경우</li>
                            <li>법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                            <li>생명이나 신체에 급박한 위험이 발생하여 이를 면하기 위한 경우</li>
                        </Box>

                        <SectionTitle variant="h5">제7조 (위치정보관리책임자)</SectionTitle>
                        <ContentText>
                            회사는 위치정보의 적절한 취급 및 관리를 위하여 다음과 같이 위치정보관리책임자를 두고 있습니다:
                        </ContentText>
                        <Box sx={{ 
                            p: 3, 
                            backgroundColor: '#F8FAFC', 
                            borderRadius: '8px',
                            border: '1px solid #F1F5F9',
                            mb: 3
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 1 }}>
                                위치정보관리책임자
                            </Typography>
                            <Typography sx={{ color: '#64748B', mb: 0.5 }}>성명: 이위치</Typography>
                            <Typography sx={{ color: '#64748B', mb: 0.5 }}>직책: 기술이사</Typography>
                            <Typography sx={{ color: '#64748B', mb: 0.5 }}>연락처: 02-1234-5679</Typography>
                            <Typography sx={{ color: '#64748B' }}>이메일: location@travellight.com</Typography>
                        </Box>

                        <SectionTitle variant="h5">제8조 (위치정보의 보호조치)</SectionTitle>
                        <ContentText>
                            회사는 위치정보의 보호를 위해 다음과 같은 조치를 취하고 있습니다:
                        </ContentText>

                        <Alert 
                            severity="success" 
                            icon={<SecurityIcon />}
                            sx={{ 
                                mb: 3,
                                borderRadius: '8px',
                                border: '1px solid #D1FAE5',
                                backgroundColor: '#ECFDF5'
                            }}
                        >
                            <AlertTitle sx={{ fontWeight: 600 }}>보안 조치</AlertTitle>
                            <Box component="ul" sx={{ pl: 3, margin: 0, mt: 1 }}>
                                <li>위치정보의 암호화</li>
                                <li>접근권한 관리 및 접근통제시스템 운영</li>
                                <li>개인위치정보취급자의 지정 및 최소한으로 제한</li>
                                <li>개인위치정보취급자에 대한 교육</li>
                                <li>개인위치정보 처리시스템 접근이력 관리</li>
                            </Box>
                        </Alert>

                        <SectionTitle variant="h5">제9조 (8세 이하의 아동 등의 보호의무)</SectionTitle>
                        <ContentText>
                            회사는 8세 이하의 아동으로부터 개인위치정보를 수집·이용 또는 제공하고자 하는 경우에는 8세 이하의 아동과 그 법정대리인의 동의를 받아야 합니다.
                        </ContentText>
                        <ContentText>
                            또한 만 14세 미만의 아동의 개인위치정보를 수집·이용 또는 제공하고자 하는 경우에는 그 법정대리인의 동의를 받아야 합니다.
                        </ContentText>

                        <SectionTitle variant="h5">제10조 (손해배상)</SectionTitle>
                        <ContentText>
                            회사가 위치정보의 보호 및 이용 등에 관한 법률 제15조 내지 제26조의 규정을 위반한 행위로 개인위치정보주체에게 손해가 발생한 경우 개인위치정보주체는 회사에 대하여 손해배상을 청구할 수 있습니다. 이 경우 회사는 고의, 중대한 과실이 없음을 입증하지 아니하면 책임을 면할 수 없습니다.
                        </ContentText>

                        <SectionTitle variant="h5">제11조 (면책사항)</SectionTitle>
                        <ContentText>
                            회사는 다음 각 호에 해당하는 경우로 인해 발생한 손해에 대해서는 책임을 지지 않습니다:
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>천재지변 또는 이에 준하는 불가항력의 상태가 있었던 경우</li>
                            <li>위치정보주체 또는 제3자의 고의 또는 과실로 인한 경우</li>
                            <li>기간통신사업자가 제공하는 위치정보시스템의 오류로 인한 경우</li>
                            <li>개인위치정보주체가 개인위치정보의 보정을 요청한 경우</li>
                        </Box>

                        <SectionTitle variant="h5">제12조 (분쟁의 조정 및 기타)</SectionTitle>
                        <ContentText>
                            위치정보와 관련된 분쟁이 발생한 경우 회사와 개인위치정보주체는 분쟁의 해결을 위해 성실히 협의합니다.
                        </ContentText>
                        <ContentText>
                            협의가 이루어지지 않을 경우 개인정보보호위원회에 개인정보 분쟁조정위원회의 조정을 신청하거나, 개인정보보호법 제74조에 따라 방송통신위원회에 개인정보 침해신고센터의 신고를 할 수 있습니다.
                        </ContentText>

                        <Divider sx={{ my: 4 }} />

                        <Box sx={{ textAlign: 'center', pt: 2 }}>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                TravelLight 주식회사<br />
                                주소: 서울특별시 강남구 테헤란로 123<br />
                                전화: 1588-0000 | 이메일: location@travellight.com
                            </Typography>
                        </Box>
                    </StyledPaper>
                </Container>
                <Footer />
            </Box>
        </>
    );
};

export default LocationTermsPage;
