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
    TableRow
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

const PrivacyPage = () => {
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
                            개인정보 처리방침
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
                            TravelLight의 개인정보 수집 및 이용에 관한 안내입니다.
                        </Typography>
                    </Box>

                    {/* 개인정보 처리방침 내용 */}
                    <StyledPaper sx={{ animation: `${fadeIn} 0.6s ease-out 0.2s both` }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                            시행일자: 2024년 1월 1일
                        </Typography>

                        <ContentText sx={{ fontWeight: 500, color: '#1E293B' }}>
                            TravelLight 주식회사(이하 "회사")는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고자 다음과 같은 처리방침을 두고 있습니다.
                        </ContentText>

                        <SectionTitle variant="h5">1. 개인정보의 처리목적</SectionTitle>
                        <ContentText>
                            회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>회원가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리</li>
                            <li>서비스 제공: 짐 보관 및 배송 서비스 제공, 계약서·청구서 발송, 콘텐츠 제공, 맞춤서비스 제공</li>
                            <li>고충처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보</li>
                            <li>마케팅 및 광고: 이벤트 및 광고성 정보 제공 및 참여기회 제공, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재</li>
                        </Box>

                        <SectionTitle variant="h5">2. 개인정보의 처리 및 보유기간</SectionTitle>
                        <ContentText>
                            회사는 정보주체로부터 개인정보를 수집할 때 동의받은 개인정보 보유·이용기간 또는 법령에 따른 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                        </ContentText>
                        
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', mb: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>처리목적</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>보유기간</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>회원가입 및 관리</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>회원탈퇴 시까지</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>서비스 제공</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>서비스 이용계약 종료 후 5년</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>전자상거래 관련 기록</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>5년 (전자상거래법)</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>소비자 불만 및 분쟁처리</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>3년 (소비자보호법)</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <SectionTitle variant="h5">3. 처리하는 개인정보의 항목</SectionTitle>
                        <ContentText>
                            회사는 다음의 개인정보 항목을 처리하고 있습니다:
                        </ContentText>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 1 }}>
                                필수항목
                            </Typography>
                            <ContentText>
                                이름, 휴대전화번호, 이메일주소, 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보, 결제기록
                            </ContentText>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 1 }}>
                                선택항목
                            </Typography>
                            <ContentText>
                                생년월일, 성별, 주소, 관심사항
                            </ContentText>
                        </Box>

                        <SectionTitle variant="h5">4. 개인정보의 제3자 제공</SectionTitle>
                        <ContentText>
                            회사는 정보주체의 개인정보를 개인정보 처리목적에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                        </ContentText>

                        <SectionTitle variant="h5">5. 개인정보처리의 위탁</SectionTitle>
                        <ContentText>
                            회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
                        </ContentText>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', mb: 3 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>수탁업체</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>위탁업무</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>NHN</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>결제서비스</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>Amazon Web Services</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>클라우드 서비스</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748B' }}>CJ대한통운</TableCell>
                                        <TableCell sx={{ color: '#64748B' }}>배송서비스</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <SectionTitle variant="h5">6. 정보주체의 권리·의무 및 행사방법</SectionTitle>
                        <ContentText>
                            정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>개인정보 처리현황 통지요구</li>
                            <li>개인정보 열람요구</li>
                            <li>개인정보 정정·삭제요구</li>
                            <li>개인정보 처리정지 요구</li>
                        </Box>

                        <SectionTitle variant="h5">7. 개인정보의 파기</SectionTitle>
                        <ContentText>
                            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                        </ContentText>
                        <ContentText>
                            파기절차 및 방법은 다음과 같습니다:
                        </ContentText>
                        <Box component="ul" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>파기절차: 선정된 개인정보는 개인정보 보호책임자의 승인을 받아 파기합니다.</li>
                            <li>파기방법: 전자적 파일형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 로우레벨포맷 등의 방법을 이용하여 파기하며, 종이문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</li>
                        </Box>

                        <SectionTitle variant="h5">8. 개인정보 보호책임자</SectionTitle>
                        <ContentText>
                            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:
                        </ContentText>
                        <Box sx={{ 
                            p: 3, 
                            backgroundColor: '#F8FAFC', 
                            borderRadius: '8px',
                            border: '1px solid #F1F5F9',
                            mb: 3
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 1 }}>
                                개인정보 보호책임자
                            </Typography>
                            <Typography sx={{ color: '#64748B', mb: 0.5 }}>성명: 김개인</Typography>
                            <Typography sx={{ color: '#64748B', mb: 0.5 }}>직책: 개인정보보호팀장</Typography>
                            <Typography sx={{ color: '#64748B', mb: 0.5 }}>연락처: 02-1234-5678</Typography>
                            <Typography sx={{ color: '#64748B' }}>이메일: privacy@travellight.com</Typography>
                        </Box>

                        <SectionTitle variant="h5">9. 개인정보 처리방침 변경</SectionTitle>
                        <ContentText>
                            이 개인정보 처리방침은 2024년 1월 1일부터 적용됩니다. 이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.
                        </ContentText>

                        <Divider sx={{ my: 4 }} />

                        <Box sx={{ textAlign: 'center', pt: 2 }}>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                TravelLight 주식회사<br />
                                주소: 서울특별시 강남구 테헤란로 123<br />
                                전화: 1588-0000 | 이메일: privacy@travellight.com
                            </Typography>
                        </Box>
                    </StyledPaper>
                </Container>
                <Footer />
            </Box>
        </>
    );
};

export default PrivacyPage;
