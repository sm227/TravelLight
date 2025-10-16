import React, { useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
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

const TermsPage = () => {
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
                            이용약관
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
                            TravelLight 서비스 이용에 관한 기본 약관입니다.
                        </Typography>
                    </Box>

                    {/* 약관 내용 */}
                    <StyledPaper sx={{ animation: `${fadeIn} 0.6s ease-out 0.2s both` }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                            시행일자: 2024년 1월 1일
                        </Typography>

                        <SectionTitle variant="h5">제1조 (목적)</SectionTitle>
                        <ContentText>
                            이 약관은 TravelLight 주식회사(이하 "회사")가 제공하는 여행짐 보관 및 배송 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                        </ContentText>

                        <SectionTitle variant="h5">제2조 (정의)</SectionTitle>
                        <ContentText>
                            이 약관에서 사용하는 용어의 정의는 다음과 같습니다:
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>"서비스"라 함은 회사가 제공하는 여행짐 보관, 배송, 픽업 등의 전체 서비스를 의미합니다.</li>
                            <li>"이용자"라 함은 회사의 서비스를 이용하는 개인 또는 법인을 말합니다.</li>
                            <li>"회원"이라 함은 회사에 개인정보를 제공하여 회원등록을 한 개인으로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                            <li>"파트너"라 함은 회사와 제휴 계약을 체결하여 서비스 제공에 참여하는 개인 또는 사업자를 말합니다.</li>
                        </Box>

                        <SectionTitle variant="h5">제3조 (약관의 효력 및 변경)</SectionTitle>
                        <ContentText>
                            1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.
                        </ContentText>
                        <ContentText>
                            2. 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있으며, 약관이 개정되는 경우 개정 약관의 적용일자 및 개정사유를 명시하여 현행약관과 함께 그 적용일자 7일 전부터 적용일자 전일까지 공지합니다.
                        </ContentText>

                        <SectionTitle variant="h5">제4조 (서비스의 제공)</SectionTitle>
                        <ContentText>
                            회사가 제공하는 서비스는 다음과 같습니다:
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>짐 보관 서비스 (유인 보관)</li>
                            <li>짐 배송 서비스</li>
                            <li>짐 픽업 및 드롭오프 서비스</li>
                            <li>기타 여행 관련 부가 서비스</li>
                        </Box>

                        <SectionTitle variant="h5">제5조 (서비스 이용계약의 성립)</SectionTitle>
                        <ContentText>
                            1. 서비스 이용계약은 이용자가 약관의 내용에 대하여 동의를 하고 서비스 이용 신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 성립합니다.
                        </ContentText>
                        <ContentText>
                            2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다:
                        </ContentText>
                        <Box component="ul" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                            <li>허위의 정보를 기재하거나 회사가 제시하는 내용을 기재하지 않은 경우</li>
                            <li>관련 법령에 위배되거나 사회의 안녕과 질서, 미풍양속을 저해할 목적으로 신청한 경우</li>
                        </Box>

                        <SectionTitle variant="h5">제6조 (개인정보 보호)</SectionTitle>
                        <ContentText>
                            1. 회사는 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력합니다.
                        </ContentText>
                        <ContentText>
                            2. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
                        </ContentText>

                        <SectionTitle variant="h5">제7조 (이용자의 의무)</SectionTitle>
                        <ContentText>
                            이용자는 다음 각 호의 행위를 하여서는 안 됩니다:
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>신청 또는 변경 시 허위내용의 등록</li>
                            <li>타인의 정보 도용</li>
                            <li>회사가 게시한 정보의 변경</li>
                            <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                            <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                            <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                            <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                        </Box>

                        <SectionTitle variant="h5">제8조 (서비스 이용의 제한)</SectionTitle>
                        <ContentText>
                            1. 회사는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
                        </ContentText>
                        <ContentText>
                            2. 회사는 전항에도 불구하고, 주민등록법을 위반한 명의도용 및 결제도용, 전화번호 도용, 저작권법 및 컴퓨터프로그램보호법을 위반한 불법프로그램의 제공 및 운영방해, 정보통신망법을 위반한 불법통신 및 해킹, 악성프로그램의 배포, 접속권한 초과행위 등과 같이 관련법을 위반한 경우에는 즉시 영구이용정지를 할 수 있습니다.
                        </ContentText>

                        <SectionTitle variant="h5">제9조 (손해배상)</SectionTitle>
                        <ContentText>
                            1. 회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 회사의 고의 또는 중대한 과실로 인한 손해를 제외하고 이에 대하여 책임을 부담하지 아니합니다.
                        </ContentText>
                        <ContentText>
                            2. 회사가 개별 서비스에 대해 별도의 요금을 받는 경우, 해당 서비스와 관련한 손해배상은 개별약관에서 정하는 바에 의합니다.
                        </ContentText>

                        <SectionTitle variant="h5">제10조 (면책조항)</SectionTitle>
                        <ContentText>
                            1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
                        </ContentText>
                        <ContentText>
                            2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
                        </ContentText>

                        <Divider sx={{ my: 4 }} />

                        <Box sx={{ textAlign: 'center', pt: 2 }}>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                TravelLight 주식회사<br />
                                주소: 서울특별시 강남구 테헤란로 123<br />
                                전화: 1588-0000 | 이메일: legal@travellight.com
                            </Typography>
                        </Box>
                    </StyledPaper>
                </Container>
                <Footer />
            </Box>
        </>
    );
};

export default TermsPage;
