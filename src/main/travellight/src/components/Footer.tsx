import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(180deg, #04102B 0%, #071A42 100%)',
        color: 'white',
        py: { xs: 2, md: 2.5 },
        px: { xs: 'var(--safe-area-inset-left)', md: 0 },
        pb: { xs: 'calc(48px + var(--safe-area-inset-bottom))', md: 2.5 },
        mt: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'flex-end' },
          gap: { xs: 1.5, md: 2 }
        }}>
          {/* 좌측: 브랜드명 + 회사 정보 */}
          <Box sx={{ textAlign: 'left' }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                backgroundImage: 'linear-gradient(90deg, #FFFFFF 0%, #5D9FFF 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              Travelight
            </Typography>
            <Typography variant="body2" sx={{
              fontSize: { xs: '0.688rem', md: '0.75rem' },
              color: alpha('#fff', 0.6),
              lineHeight: 1.6
            }}>
              {t('footerCEO')}: 함승민<br />
              {t('footerAddress')}: 경기도 파주시 청석로 |{' '}
              <Link
                href="mailto:haveagoodtrip.travellight@gmail.com"
                underline="none"
                sx={{
                  color: alpha('#fff', 0.6),
                  transition: 'color 0.2s',
                  '&:hover': { color: theme.palette.primary.light }
                }}
              >
                {t('footerEmail')}: haveagoodtrip.travellight@gmail.com
              </Link>
            </Typography>
          </Box>

          {/* 우측: 약관 링크 + 저작권 */}
          <Box sx={{ textAlign: { xs: 'left', md: 'right' }, alignSelf: { xs: 'flex-start', md: 'flex-end' } }}>
            <Stack
              direction="row"
              spacing={1.5}
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              sx={{ mb: 0.3 }}
            >
              <Link
                href="/terms"
                underline="none"
                sx={{
                  fontSize: { xs: '0.688rem', md: '0.75rem' },
                  color: alpha('#fff', 0.6),
                  transition: 'color 0.2s',
                  '&:hover': { color: alpha('#fff', 0.9) }
                }}
              >
                {t('termsOfService')}
              </Link>
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderColor: alpha('#fff', 0.3),
                  height: '10px',
                  alignSelf: 'center'
                }}
              />
              <Link
                href="/privacy"
                underline="none"
                sx={{
                  fontSize: { xs: '0.688rem', md: '0.75rem' },
                  color: alpha('#fff', 0.6),
                  transition: 'color 0.2s',
                  '&:hover': { color: alpha('#fff', 0.9) }
                }}
              >
                {t('privacyPolicy')}
              </Link>
            </Stack>
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.625rem', md: '0.688rem' },
                color: alpha('#fff', 0.4)
              }}
            >
              © {currentYear} Travelight. {t('allRights')}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 