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
                            {t('termsOfServiceTitle')}
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
                            {t('termsOfServiceDescription')}
                        </Typography>
                    </Box>

                    {/* 약관 내용 */}
                    <StyledPaper sx={{ animation: `${fadeIn} 0.6s ease-out 0.2s both` }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
                            {t('effectiveDate')}
                        </Typography>

                        <SectionTitle variant="h5">{t('article1Title')}</SectionTitle>
                        <ContentText>
                            {t('article1Content')}
                        </ContentText>

                        <SectionTitle variant="h5">{t('article2Title')}</SectionTitle>
                        <ContentText>
                            {t('article2Content')}
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>{t('article2Item1')}</li>
                            <li>{t('article2Item2')}</li>
                            <li>{t('article2Item3')}</li>
                            <li>{t('article2Item4')}</li>
                        </Box>

                        <SectionTitle variant="h5">{t('article3Title')}</SectionTitle>
                        <ContentText>
                            {t('article3Content1')}
                        </ContentText>
                        <ContentText>
                            {t('article3Content2')}
                        </ContentText>

                        <SectionTitle variant="h5">{t('article4Title')}</SectionTitle>
                        <ContentText>
                            {t('article4Content')}
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>{t('article4Item1')}</li>
                            <li>{t('article4Item2')}</li>
                            <li>{t('article4Item3')}</li>
                            <li>{t('article4Item4')}</li>
                        </Box>

                        <SectionTitle variant="h5">{t('article5Title')}</SectionTitle>
                        <ContentText>
                            {t('article5Content1')}
                        </ContentText>
                        <ContentText>
                            {t('article5Content2')}
                        </ContentText>
                        <Box component="ul" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>{t('article5Item1')}</li>
                            <li>{t('article5Item2')}</li>
                            <li>{t('article5Item3')}</li>
                        </Box>

                        <SectionTitle variant="h5">{t('article6Title')}</SectionTitle>
                        <ContentText>
                            {t('article6Content1')}
                        </ContentText>
                        <ContentText>
                            {t('article6Content2')}
                        </ContentText>

                        <SectionTitle variant="h5">{t('article7Title')}</SectionTitle>
                        <ContentText>
                            {t('article7Content')}
                        </ContentText>
                        <Box component="ol" sx={{ pl: 3, color: '#64748B', lineHeight: 1.7 }}>
                            <li>{t('article7Item1')}</li>
                            <li>{t('article7Item2')}</li>
                            <li>{t('article7Item3')}</li>
                            <li>{t('article7Item4')}</li>
                            <li>{t('article7Item5')}</li>
                            <li>{t('article7Item6')}</li>
                            <li>{t('article7Item7')}</li>
                        </Box>

                        <SectionTitle variant="h5">{t('article8Title')}</SectionTitle>
                        <ContentText>
                            {t('article8Content1')}
                        </ContentText>
                        <ContentText>
                            {t('article8Content2')}
                        </ContentText>

                        <SectionTitle variant="h5">{t('article9Title')}</SectionTitle>
                        <ContentText>
                            {t('article9Content1')}
                        </ContentText>
                        <ContentText>
                            {t('article9Content2')}
                        </ContentText>

                        <SectionTitle variant="h5">{t('article10Title')}</SectionTitle>
                        <ContentText>
                            {t('article10Content1')}
                        </ContentText>
                        <ContentText>
                            {t('article10Content2')}
                        </ContentText>

                        <Divider sx={{ my: 4 }} />

                        <Box sx={{ textAlign: 'center', pt: 2 }}>
                            <Typography variant="body2" sx={{ color: '#94A3B8' }} dangerouslySetInnerHTML={{ __html: t('companyInfo') }} />
                        </Box>
                    </StyledPaper>
                </Container>
                <Footer />
            </Box>
        </>
    );
};

export default TermsPage;
